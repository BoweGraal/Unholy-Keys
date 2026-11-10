/*  Unholy Keys: host check.

    Tests a relay server end to end the way a real show uses it: opens a room
    as a performer, joins it as an audience member, plays a note, sends a chat,
    and times each step. Then checks that the instrument sample hosts answer.

    Usage (from the server folder):
      npm run check                                  your local server
      npm run check -- wss://your-server.up.railway.app

    Paste the whole output to Claude when something is wrong. */

var WebSocket = require("ws");

var URL = process.argv[2] || "ws://localhost:8080";
var results = [];
var t0 = Date.now();

function log(ok, name, detail) {
  results.push(ok);
  console.log((ok ? "PASS " : "FAIL ") + name + (detail ? "  (" + detail + ")" : ""));
}
function open(url) {
  return new Promise(function(resolve, reject) {
    var ws = new WebSocket(url, { handshakeTimeout: 8000 });
    var t = Date.now();
    ws.once("open", function() { resolve({ ws: ws, ms: Date.now() - t }); });
    ws.once("error", reject);
  });
}
function next(ws, type, ms) {
  return new Promise(function(resolve, reject) {
    var timer = setTimeout(function() { ws.off("message", on); reject(new Error("no '" + type + "' within " + ms + "ms")); }, ms);
    function on(raw) {
      var m; try { m = JSON.parse(raw); } catch (e) { return; }
      if (m.type === type || m.type === "error") { clearTimeout(timer); ws.off("message", on); m.type === "error" ? reject(new Error(m.msg)) : resolve(m); }
    }
    ws.on("message", on);
  });
}
function httpBase(url) { return url.replace(/^ws/, "http").replace(/\/+$/, ""); }

async function relay() {
  console.log("Relay server: " + URL);
  if (/^ws:\/\//.test(URL) && !/localhost|127\.0\.0\.1/.test(URL))
    console.log("NOTE  A ws:// address only works from pages opened over http. The GitHub Pages copy is https and needs wss://.");

  // 1. health page over plain HTTP(S)
  try {
    var r = await fetch(httpBase(URL) + "/health", { signal: AbortSignal.timeout(8000) });
    var h = await r.json();
    log(r.ok && h.ok, "health page answers", h.rooms + " rooms, " + h.viewers + " viewers, up " + h.uptimeSeconds + "s, node " + h.node);
  } catch (e) {
    log(false, "health page answers", httpBase(URL) + "/health: " + (e.cause && e.cause.code || e.message) + ". Older server versions have no health page; carry on below.");
  }

  // 2. performer connects and opens a room
  var perf, aud, code;
  try {
    perf = await open(URL);
    log(true, "performer connects", perf.ms + "ms");
  } catch (e) {
    log(false, "performer connects", (e.code || e.message) + hint(e));
    return;
  }
  try {
    var t = Date.now();
    perf.ws.send(JSON.stringify({ type: "create-room" }));
    code = (await next(perf.ws, "room-created", 5000)).room;
    log(/^[A-Z0-9]{6}$/.test(code), "room created", code + ", " + (Date.now() - t) + "ms");
  } catch (e) { log(false, "room created", e.message); return; }

  // 3. audience joins
  try {
    aud = await open(URL);
    var t2 = Date.now();
    var countP = next(perf.ws, "viewer-count", 5000);
    aud.ws.send(JSON.stringify({ type: "join-room", room: code.toLowerCase(), name: "Check Bot" }));
    await next(aud.ws, "room-state", 5000);
    log(true, "audience joins the room", (Date.now() - t2) + "ms");
    var c = await countP;
    log(c.count === 1, "performer sees the viewer count", "count " + c.count);
  } catch (e) { log(false, "audience joins the room", e.message); return; }

  // 4. note from performer reaches audience; measure round trip a few times
  try {
    var times = [];
    for (var i = 0; i < 5; i++) {
      var t3 = Date.now();
      var p = next(aud.ws, "note", 5000);
      perf.ws.send(JSON.stringify({ type: "note", midi: 60 + i, on: true, inst: "piano", mode: "sustain" }));
      var n = await p;
      if (n.midi !== 60 + i) throw new Error("wrong note arrived");
      times.push(Date.now() - t3);
    }
    times.sort(function(a, b) { return a - b; });
    var med = times[2];
    log(true, "notes reach the audience", "median " + med + "ms, worst " + times[4] + "ms" + (med > 150 ? " (slow: expect audible lag)" : ""));
  } catch (e) { log(false, "notes reach the audience", e.message); }

  // 5. chat from audience reaches performer
  try {
    var p2 = next(perf.ws, "chat", 5000);
    aud.ws.send(JSON.stringify({ type: "chat", text: "check" }));
    var ch = await p2;
    log(ch.text === "check", "audience chat reaches the performer");
  } catch (e) { log(false, "audience chat reaches the performer", e.message); }

  // 6. audience cannot play notes (security fix from the bug sweep)
  try {
    var p3 = next(perf.ws, "note", 1200).then(function() { return true; }, function() { return false; });
    aud.ws.send(JSON.stringify({ type: "note", midi: 99, on: true }));
    var leaked = await p3;
    log(!leaked, "audience cannot send performer events", leaked ? "this server is running old code: redeploy server.js" : "");
  } catch (e) { log(false, "audience cannot send performer events", e.message); }

  try { aud.ws.close(); perf.ws.close(); } catch (e) {}
}

async function samples() {
  console.log("\nInstrument sample hosts:");
  var urls = [
    ["Core samples (nbrosowsky)", "https://nbrosowsky.github.io/tonejs-instruments/samples/piano/A4.mp3"],
    ["General MIDI (FluidR3)", "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3/A4.mp3"],
    ["MusyngKite", "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/violin-mp3/A4.mp3"],
    ["Mellotron", "https://smpldsnds.github.io/archiveorg-mellotron/TRON%20FLUTE/C%233%20TRON%20FLU.m4a"],
    ["Electric pianos", "https://smpldsnds.github.io/sfzinstruments-greg-sullivan-e-pianos/wurlitzer-ep200/samples/a1ff.m4a"],
    ["Versilian", "https://smpldsnds.github.io/sgossner-vcsl/Idiophones/Plucked%20Idiophones/Kalimba%2C%20Kenya/Mbira6_Normal_MainSpirit_B2_k8_vl3_rr2.m4a"]
  ];
  for (var i = 0; i < urls.length; i++) {
    var name = urls[i][0], u = urls[i][1];
    try {
      var t = Date.now();
      var r = await fetch(u, { method: "GET", signal: AbortSignal.timeout(10000) });
      var ok = r.ok;
      log(ok, name, r.status + ", " + (Date.now() - t) + "ms");
    } catch (e) { log(false, name, e.cause && e.cause.code || e.message); }
  }
}

function hint(e) {
  var c = e.code || e.message || "";
  if (/ECONNREFUSED/.test(c)) return ". Nothing is listening there. Is the server running (npm start)?";
  if (/ENOTFOUND|EAI_AGAIN/.test(c)) return ". That address does not exist. Check the spelling of the server URL.";
  if (/401|403|404|Unexpected server response/.test(c)) return ". Something answered, but not a WebSocket server. Check the URL and that the deploy root is the server folder.";
  if (/ETIMEDOUT|timed out|handshake/i.test(c)) return ". No answer in time. The server may be asleep (free tiers sleep after inactivity): open the /health page, wait, then retry.";
  if (/CERT|SSL|TLS/i.test(c)) return ". Certificate problem: use the https/wss address your host gives you.";
  return "";
}

(async function() {
  await relay();
  await samples();
  var failed = results.filter(function(r) { return !r; }).length;
  console.log("\n" + (failed ? failed + " check(s) failed." : "All checks passed.") + " Took " + ((Date.now() - t0) / 1000).toFixed(1) + "s.");
  process.exit(failed ? 1 : 0);
})();
