/*  Unholy Keys: fake audience for testing.

    Connects a crowd of fake audience members to your live room. They wander
    around the venue, dance, chat now and then, and report what they hear from the
    performer, so you can test a show without other people or other computers.

    Usage (from the server folder):
      npm run crowd -- ROOMCODE                  10 fake viewers on your local server
      npm run crowd -- ROOMCODE 40               40 fake viewers
      npm run crowd -- ROOMCODE 10 wss://your-server.up.railway.app
                                                 against your deployed server

    Stop with Ctrl+C. Every 5 seconds it prints what the crowd received. */

var WebSocket = require("ws");

var args = process.argv.slice(2);
var ROOM = (args[0] || "").toUpperCase();
var COUNT = Math.max(1, Math.min(150, parseInt(args[1], 10) || 10));
var URL = args[2] || "ws://localhost:8080";

if (!ROOM || !/^[A-Z0-9]{4,12}$/.test(ROOM)) {
  console.log("Usage: npm run crowd -- ROOMCODE [count] [server-url]");
  console.log("Get the room code by clicking LIVE on the performer page.");
  process.exit(1);
}

var NAMES = ["Rook", "Moth", "Vex", "Juno", "Kestrel", "Nyx", "Pike", "Sable", "Wren", "Ash", "Cinder", "Hollow", "Lark", "Onyx", "Quill", "Rune", "Thorn", "Vale", "Zephyr", "Ember"];
var CHAT = ["this slaps", "LETS GO", "encore!", "what instrument is that?", "turn it up", "🔥🔥🔥", "play the bassoon one", "vibes", "hi from the back", "unholy indeed", "do a key change", "👏👏", "how long is the set?", "that solo though"];
var COLORS = ["#D354A0", "#1D9E75", "#E0A030", "#5F9EA0", "#8A6BD1", "#E05050", "#3CB371", "#DB7093"];

var stats = { connected: 0, joined: 0, failed: 0, notes: 0, inst: null, key: null, video: null, chatsIn: 0, chatsOut: 0, lastError: null, };
var dancing = 0;
var bots = [];
var stopping = false;

var NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function keyName(r) { r = +r; return isFinite(r) ? NOTE_NAMES[((r % 12) + 12) % 12] : String(r); }
function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
function rnd(a, b) { return Math.round(a + Math.random() * (b - a)); }
function clamp(v) { return Math.max(0.05, Math.min(0.95, v)); }
function clampY(v) { return Math.max(0.34, Math.min(0.74, v)); } // stay on the venue floor, off the stage

function makeBot(i) {
  var bot = { name: rand(NAMES) + " " + (i + 1), x: 0.12 + Math.random() * 0.76, y: 0.36 + Math.random() * 0.36, ws: null, timers: [], first: i === 0 };
  var ws = new WebSocket(URL);
  bot.ws = ws;
  ws.on("open", function() {
    stats.connected++;
    ws.send(JSON.stringify({ type: "join-room", room: ROOM, name: bot.name, color: rand(COLORS) }));
  });
  ws.on("message", function(raw) {
    var m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (m.type === "error") { stats.failed++; stats.lastError = m.msg; ws.close(); return; }
    if (m.type === "round") { botRound(bot, m); if (bot.first) stats.round = m.phase === "result" ? "round " + m.n + " won by " + (m.ranking && m.ranking[0] ? m.ranking[0].name : "nobody") : m.phase === "off" ? null : "round " + m.n + " " + m.phase; return; }
    if (m.type === "room-state") {
      stats.joined++;
      bot.id = m.yourId; bot.skill = 0.35 + Math.random() * 0.6;
      if (m.round) botRound(bot, m.round);
      if (m.performerState && m.performerState.eng) stats.inst = m.performerState.eng;
      if (m.performerState && m.performerState.scale) stats.key = keyName(m.performerState.root) + " " + m.performerState.scale;
      if (m.video && m.video.title) stats.video = m.video.title;
      // wander: a small step every 0.4-1s (the server allows 15 moves a second)
      bot.timers.push(setInterval(function() {
        bot.x = clamp(bot.x + (Math.random() - 0.5) * 0.06);
        bot.y = clampY(bot.y + (Math.random() - 0.5) * 0.06);
        send(bot, { type: "pos", x: bot.x, y: bot.y });
      }, 400 + Math.random() * 600));
      // start or stop dancing now and then
      bot.dance = 0;
      bot.timers.push(setInterval(function() {
        if (bot.inRound) return;
        if (Math.random() < 0.4) {
          var next = bot.dance ? 0 : 1 + Math.floor(Math.random() * 5);   // 4 = free dance, 5 = step game
          dancing += (next ? 1 : 0) - (bot.dance ? 1 : 0);
          bot.dance = next;
          send(bot, { type: "dance", style: next });
          bot.combo = 0;
        }
      }, 7000 + Math.random() * 8000));
      // bots in a dance game strike a new pose twice a second, like someone hitting steps at 120 BPM
      bot.timers.push(setInterval(function() {
        if (bot.dance < 4) return;
        var poses = [[210, 35, 85, 0], [-35, -210, 0, -85], [255, -255, 10, -10], [120, -120, 75, -75]];
        var a = bot.dance === 5 ? rand(poses) : [rnd(-60, 300), rnd(-300, 60), rnd(-90, 90), rnd(-90, 90)];
        bot.combo = bot.dance === 5 ? (Math.random() < 0.08 ? 0 : (bot.combo || 0) + 1) : 0;
        send(bot, { type: "pose", a: a, c: bot.combo });
      }, 500));
      // chat now and then
      bot.timers.push(setInterval(function() {
        if (Math.random() < 0.35) { send(bot, { type: "chat", text: rand(CHAT) }); stats.chatsOut++; }
      }, 6000 + Math.random() * 9000));
      return;
    }
    if (m.type === "performer-left") {
      if (!stopping) { console.log("\nThe performer ended the show. Sending the crowd home."); stop(); }
      return;
    }
    if (!bot.first) return; // count performer events once, not once per bot
    if (m.type === "note" && m.on) stats.notes++;
    else if (m.type === "inst") stats.inst = m.id;
    else if (m.type === "state") { if (m.eng) stats.inst = m.eng; stats.key = keyName(m.root) + " " + m.scale; }
    else if (m.type === "video") stats.video = m.title || m.vid;
    else if (m.type === "chat") stats.chatsIn++;
  });
  ws.on("error", function(e) { stats.lastError = e.message; });
  ws.on("close", function() {
    bot.timers.forEach(clearInterval); clearInterval(bot.scoreTimer);
    if (!stopping && bot.first && stats.joined) { console.log("\nLost the connection to the server. Stopping."); stop(); }
  });
  return bot;
}
/* Dance rounds: bots join in, score according to a random skill, and vote in free-dance rounds. */
function botRound(bot, m) {
  if (m.phase === "play" && !bot.inRound) {
    bot.inRound = true; bot.roundScore = 0; bot.combo = 0;
    var arrows = m.chart && m.chart.steps ? m.chart.steps.length : 0, dur = m.chart && m.chart.dur ? m.chart.dur : 180000;
    bot.rate = arrows ? arrows * 80 * bot.skill / (dur / 2000) : 160 * bot.skill;   // points per 2 seconds
    dancing += bot.dance ? 0 : 1; bot.dance = m.mode === "free" ? 4 : 5;
    send(bot, { type: "dance", style: bot.dance });
    clearInterval(bot.scoreTimer);
    if (m.mode !== "free") bot.scoreTimer = setInterval(function() { bot.roundScore += Math.round(bot.rate * (0.6 + Math.random() * 0.8)); send(bot, { type: "score", s: bot.roundScore }); }, 2000);
  } else if (m.phase === "vote" && Array.isArray(m.dancers)) {
    var others = m.dancers.filter(function(d) { return d.id !== bot.id; });
    if (others.length) setTimeout(function() { send(bot, { type: "vote", id: rand(others).id }); }, 800 + Math.random() * 5000);
  }
  if (m.phase !== "play" && m.phase !== "countdown" && bot.inRound) {
    bot.inRound = false; clearInterval(bot.scoreTimer);
    if (bot.dance) { dancing--; bot.dance = 0; send(bot, { type: "dance", style: 0 }); }
  }
}
function send(bot, msg) { if (bot.ws.readyState === 1) bot.ws.send(JSON.stringify(msg)); }

function report() {
  var line = "[crowd] " + stats.joined + "/" + COUNT + " in the room";
  if (stats.failed) line += ", " + stats.failed + " refused";
  line += " | notes heard: " + stats.notes + " | instrument: " + (stats.inst || "-") + " | key: " + (stats.key || "-");
  if (stats.video) line += " | video: " + stats.video;
  if (stats.round) line += " | " + stats.round;
  line += " | dancing: " + dancing + " | chat sent: " + stats.chatsOut;
  console.log(line);
  if (stats.lastError && !stats.joined) {
    console.log("        last error: " + stats.lastError);
    if (/not found/i.test(stats.lastError)) console.log("        Check the room code, and that you clicked LIVE on the same server (" + URL + ").");
    if (/ECONNREFUSED|ENOTFOUND|getaddrinfo|Unexpected server response/i.test(stats.lastError)) console.log("        Nothing answered at " + URL + ". Is the server running? Run: npm run check -- " + URL);
  }
}

function stop() {
  if (stopping) return; stopping = true;
  bots.forEach(function(b) { try { b.ws.close(); } catch (e) {} });
  setTimeout(function() { process.exit(0); }, 300);
}
process.on("SIGINT", function() { console.log("\nSending the crowd home."); stop(); });

console.log("Sending " + COUNT + " fake viewers to room " + ROOM + " on " + URL + " (Ctrl+C to stop)");
for (var i = 0; i < COUNT; i++) (function(i) { setTimeout(function() { bots.push(makeBot(i)); }, i * 120); })(i);
setTimeout(report, 2000);
setInterval(report, 5000);
