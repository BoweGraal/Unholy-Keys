/*  Unholy Keys: host a show from your own computer.

    Starts the relay server here, opens a secure tunnel to it with Cloudflare's free "quick tunnel"
    (so viewers never see your home address and nothing needs changing on your router), then prints
    the two links for the show and opens yours in the browser.

    Needs cloudflared installed once (Windows: winget install --id Cloudflare.cloudflared).

    Usage (from the server folder):  npm run home       or double-click "Home Show.bat"
    Stop with Ctrl+C. The links only work while this is running, and they change every time. */

var spawn = require("child_process").spawn;
var https = require("https");
var PORT = +process.env.PORT || 8080;
var PAGES = process.env.UK_PAGES || "https://bowegraal.github.io/Unholy-Keys/";
var children = [], stopping = false;

function line(s) { console.log(s || ""); }
function stop(code) {
  if (stopping) return; stopping = true;
  children.forEach(function(c) { try { c.kill(); } catch (e) {} });
  setTimeout(function() { process.exit(code || 0); }, 300);
}
process.on("SIGINT", function() { line("\nEnding the home show."); stop(0); });

/* 1. the relay server */
var srv = spawn(process.execPath, [__dirname + "/server.js"], { env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: ["ignore", "pipe", "pipe"] });
children.push(srv);
srv.stdout.on("data", function(d) { if (process.env.UK_VERBOSE) process.stdout.write("[server] " + d); });
srv.stderr.on("data", function(d) { process.stderr.write("[server] " + d); });
srv.on("exit", function(code) { if (!stopping) { line("The relay server stopped (code " + code + "). Is something else using port " + PORT + "? Close other npm start windows and try again."); stop(1); } });

/* 2. the tunnel */
var bin = process.env.CLOUDFLARED || "cloudflared", found = false;
var tun = spawn(bin, ["tunnel", "--no-autoupdate", "--url", "http://localhost:" + PORT], { stdio: ["ignore", "pipe", "pipe"] });
children.push(tun);
tun.on("error", function(e) {
  if (e.code === "ENOENT") {
    line("");
    line("cloudflared isn't installed yet. Install it once, then run this again:");
    line("  Windows:  winget install --id Cloudflare.cloudflared");
    line("            (then close this window and open a new one, so it can find it)");
    line("  Mac:      brew install cloudflared");
    line("");
  } else line("Couldn't start cloudflared: " + e.message);
  stop(1);
});
function scan(d) {
  var m = String(d).match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
  if (process.env.UK_VERBOSE) process.stdout.write("[tunnel] " + d);
  if (m && !found) { found = true; ready(m[0]); }
}
tun.stdout.on("data", scan); tun.stderr.on("data", scan);
tun.on("exit", function(code) { if (!stopping) { line("The tunnel closed (code " + code + "). Check your internet connection and run this again."); stop(1); } });
setTimeout(function() { if (!found && !stopping) line("Still waiting for Cloudflare to hand out an address... (check your internet connection)"); }, 20000);

/* 3. wait until the address answers, then hand out the links */
function ready(url) {
  var host = url.replace(/^https:\/\//, ""), tries = 0;
  line("Got an address. Waiting for it to come online...");
  (function poll() {
    tries++;
    https.get("https://" + host + "/health", { timeout: 5000 }, function(r) {
      var body = ""; r.on("data", function(c) { body += c; });
      r.on("end", function() { if (r.statusCode === 200 && /unholy-keys/.test(body)) announce(host); else retry(); });
    }).on("error", retry).on("timeout", function() { this.destroy(); });
    function retry() { if (stopping) return; if (tries > 40) { line("The address never came online. Run this again."); stop(1); return; } setTimeout(poll, 1500); }
  })();
}
function announce(host) {
  var ws = encodeURIComponent("wss://" + host);
  var perf = PAGES + "?ws=" + ws, aud = PAGES + "venue.html?ws=" + ws;
  line("");
  line("==========================================================================");
  line("  Your home show is ready. Keep this window open for the whole show.");
  line("");
  line("  YOU (performer):");
  line("    " + perf);
  line("");
  line("  YOUR AUDIENCE (send them this link; it's on your clipboard):");
  line("    " + aud);
  line("");
  line("  Click LIVE as usual and give them the room code.");
  line("  The links stop working when you close this window, and change next time.");
  line("==========================================================================");
  line("");
  copy(aud);
  open(perf);
  setInterval(function() {}, 1 << 30);   // keep running until Ctrl+C
}
function copy(text) {
  var cmd = process.platform === "win32" ? ["clip", []] : process.platform === "darwin" ? ["pbcopy", []] : ["xclip", ["-selection", "clipboard"]];
  try { var c = spawn(cmd[0], cmd[1], { stdio: ["pipe", "ignore", "ignore"] }); c.on("error", function() {}); c.stdin.end(text); } catch (e) {}
}
function open(url) {
  if (process.env.UK_NO_BROWSER) return;
  try {
    if (process.platform === "win32") spawn("cmd", ["/c", "start", "", url.replace(/&/g, "^&")], { stdio: "ignore", detached: true }).on("error", function() {});
    else spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { stdio: "ignore", detached: true }).on("error", function() {});
  } catch (e) {}
}
