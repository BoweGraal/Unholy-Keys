/*  Unholy Keys — Live Relay Server
    Handles rooms, note events, video sync, chat, avatar positions.
    Deploy to Railway/Render free tier.

    Everything a client sends is untrusted. The performer may relay performance
    events; audience members may only chat and move. Nothing a viewer sends is
    forwarded unless it is one of those two message types, rebuilt field by field. */

var WebSocket = require("ws");
var http = require("http");
var fs = require("fs");
var path = require("path");
var YT = require("./ytcharts.js");
var PORT = process.env.PORT || 8080;
var rooms = {};
var STARTED = Date.now();
var STREAM_BYTES = 0;   /* stream data sent to viewers since the server started (counts toward the host's bandwidth allowance) */

/* ── HTTP side ──────────────────────────────────────────────────────────────
   /health  JSON status, so you can check a deployed server from any browser.
   Anything else serves the app's own pages from the folder above this one when
   they are there (they are when you run it locally; on Railway/Render only this
   folder is deployed, so those requests simply 404). Serving the pages over
   http:// instead of opening the files directly also keeps the Bit Crush effect
   working, which browsers block on file:// pages. */
var WEB_ROOT = path.resolve(__dirname, "..");
var TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".wav": "audio/wav", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".flac": "audio/flac", ".aac": "audio/aac", ".opus": "audio/ogg", ".md": "text/plain; charset=utf-8" };
/* the practice songs in /songs, for dance practice's song list (GitHub Pages can't list a folder, so the
   page asks GitHub's API there; when the pages come from this server it asks here) */
var SONG_EXT = /\.(mp3|ogg|m4a|wav|flac|aac|opus)$/i;
function songList() {
  try { return fs.readdirSync(path.join(WEB_ROOT, "songs")).filter(function(f) { return SONG_EXT.test(f) && f.charAt(0) !== "."; }).sort(); }
  catch (e) { return []; }
}
function health() {
  var viewers = 0; Object.keys(rooms).forEach(function(k) { viewers += rooms[k].viewers.size; });
  /* version and host: which server this is (the pages show "Render" or "self-hosted" from it) */
  return { ok: true, service: "unholy-keys-relay", version: VERSION, host: HOSTED, name: HOST_NAME, rooms: Object.keys(rooms).length, viewers: viewers,
    uptimeSeconds: Math.round((Date.now() - STARTED) / 1000), node: process.version,
    streamMBSentSinceStart: Math.round(STREAM_BYTES / 1e5) / 10 };
}
var server = http.createServer(function(req, res) {
  var url = (req.url || "/").split("?")[0];
  if (url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" });
    return res.end(JSON.stringify(health()));
  }
  if (YT.handle(req, res, url)) return;   /* YouTube song charts for dance practice (see ytcharts.js) */
  if (url === "/songs/list.json") {
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-cache" });
    return res.end(JSON.stringify(songList()));
  }
  var rel;
  try { rel = decodeURIComponent(url); } catch (e) { res.writeHead(400); return res.end("Bad request"); }
  if (rel === "/") rel = "/index.html";
  var file = path.resolve(WEB_ROOT, "." + rel);
  var ext = path.extname(file).toLowerCase();
  var inside = file.indexOf(WEB_ROOT + path.sep) === 0;
  var hidden = /[\\/](\.|node_modules[\\/]|server[\\/])/.test(file.slice(WEB_ROOT.length));
  if (req.method !== "GET" || !inside || hidden || !TYPES[ext]) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("Not found"); }
  fs.readFile(file, function(err, data) {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[ext], "Cache-Control": "no-cache" });
    res.end(data);
  });
});
/* Text messages stay capped at 16 KB (checked per message below); binary stream packets can be larger (video keyframes). */
var wss = new WebSocket.Server({ server: server, maxPayload: 256 * 1024 });

var MAX_VIEWERS = 200;
/* The stored video message is from when the performer last sent it. A viewer joining now
   should start where the video is now, so move the time on by however long it has been playing. */
function liveVideo(r) {
  if (!r.video) return null;
  var v = Object.assign({}, r.video);
  if (v.action === "play" && typeof v.time === "number" && r.videoAt)
    v.time = v.time + ((Date.now() - r.videoAt) / 1000) * (typeof v.rate === "number" && v.rate > 0 ? v.rate : 1);
  return v;
}
var PERFORMER_TYPES = { note: 1, inst: 1, state: 1, info: 1, video: 1, stream: 1, "perf-name": 1, "show-fx": 1, "perf-pos": 1, "perf-chat": 1, "song-part": 1 };

/* ── Live sound/visual stream ──
   The performer sends binary packets: byte 0 is the kind (1 = audio, 2 = visuals), the rest is
   opaque to the server. They go to every viewer as-is. A viewer whose connection is backing up
   skips visual packets first, then audio, so one slow phone never slows the show for anyone else. */
var MAX_BUFFER_VISUAL = 512 * 1024, MAX_BUFFER_AUDIO = 2 * 1024 * 1024;
function relayStream(ws, data) {
  if (ws.role !== "performer" || !ws.room || !rooms[ws.room] || rooms[ws.room].performer !== ws) return;
  if (!data || data.length < 2 || !allow(ws, "stream", 300, 150)) return;
  var kind = data[0], r = rooms[ws.room];
  if (kind !== 1 && kind !== 2) return;
  var limit = kind === 1 ? MAX_BUFFER_AUDIO : MAX_BUFFER_VISUAL;
  r.viewers.forEach(function(v) {
    if (v.ws.readyState !== 1 || v.ws.bufferedAmount > limit) return;
    try { v.ws.send(data, { binary: true }); r.bytesOut = (r.bytesOut || 0) + data.length; STREAM_BYTES += data.length; } catch (e) {}
  });
}

/* a room code: four letters, leaving out ones easy to mix up (I, L, O); about 280,000 codes */
var CODE_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ";
function genCode() {
  var code;
  do { code = ""; for (var i = 0; i < 4; i++) code += CODE_LETTERS[Math.floor(Math.random() * CODE_LETTERS.length)]; } while (rooms[code]);
  return code;
}
var PERFORMER_GRACE = 60000;   /* how long a room waits for its performer to reconnect */
function genId() { return Math.random().toString(36).substring(2, 10); }

function str(v, max) { return (typeof v === "string" ? v : "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max); }
function color(v) { return (typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v)) ? v : "#D354A0"; }
function unit(v) { v = +v; return isFinite(v) ? Math.max(0, Math.min(1, +v.toFixed(3))) : null; }

function send(ws, msg) { try { ws.send(JSON.stringify(msg)); } catch (e) {} }

function broadcast(room, msg, exclude) {
  var r = rooms[room]; if (!r) return;
  var data = JSON.stringify(msg);
  if (r.performer && r.performer !== exclude) try { r.performer.send(data); } catch(e) {}
  r.viewers.forEach(function(v) {
    if (v.ws !== exclude) try { v.ws.send(data); } catch(e) {}
  });
}

/* ── Dance rounds ──
   The performer starts a round for a song. Everyone gets the same step chart, then a countdown, then
   the song. Step and target rounds: each dancer's page reports its score and the highest wins.
   Free dance rounds: when the song ends everyone votes for a dancer (the performer's vote counts
   double). Placings earn show points (10, 7, 5, 3, then 1 for taking part) that add up all show. */
var VOTE_MS = +process.env.VOTE_MS || 20000;
function intIn(v, lo, hi, def) { v = Math.floor(+v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : def; }
var SECTION_NAMES = ["intro", "verse", "chorus", "solo", "bridge", "breakdown", "finale", "outro"];
function cleanChart(c) {
  if (!c || !Array.isArray(c.steps) || !Array.isArray(c.beats) || c.steps.length > 8000 || c.beats.length > 6000) return null;
  var steps = [], beats = [], arrows = 0, i;
  for (i = 0; i < c.steps.length; i++) {
    var st = c.steps[i]; if (!Array.isArray(st)) return null;
    var ms = intIn(st[0], 0, 3600000, -1), mask = intIn(st[1], 1, 15, 0);
    if (ms < 0 || !mask) return null;
    var hold = st.length > 2 ? intIn(st[2], 0, 10000, 0) : 0;   // a hold arrow: held for this many ms
    steps.push(hold ? [ms, mask, hold] : [ms, mask]); arrows += (mask & 1) + (mask >> 1 & 1) + (mask >> 2 & 1) + (mask >> 3 & 1);
  }
  for (i = 0; i < c.beats.length; i++) { var b = intIn(c.beats[i], 0, 3600000, -1); if (b < 0) return null; beats.push(b); }
  var bpm = +c.bpm; if (!isFinite(bpm) || bpm < 30 || bpm > 300) return null;
  var peaks = [];
  if (Array.isArray(c.peaks)) for (i = 0; i < c.peaks.length && peaks.length < 100; i++) {
    var pk = c.peaks[i]; if (!Array.isArray(pk)) continue;
    var p0 = intIn(pk[0], 0, 3600000, -1), p1 = intIn(pk[1], 0, 3600000, -1);
    if (p0 >= 0 && p1 > p0) peaks.push([p0, p1]);
  }
  /* the song's map: key changes [ms, root 0-11, minor 0/1] and parts [ms, name] */
  var keys = [], sections = [];
  if (Array.isArray(c.keys)) for (i = 0; i < c.keys.length && keys.length < 60; i++) {
    var ky = c.keys[i]; if (!Array.isArray(ky)) continue;
    var kt = intIn(ky[0], 0, 3600000, -1), kr = intIn(ky[1], 0, 11, -1); if (kt >= 0 && kr >= 0) keys.push([kt, kr, ky[2] ? 1 : 0]);
  }
  if (Array.isArray(c.sections)) for (i = 0; i < c.sections.length && sections.length < 120; i++) {
    var sc = c.sections[i]; if (!Array.isArray(sc)) continue;
    var stt = intIn(sc[0], 0, 3600000, -1); if (stt >= 0 && SECTION_NAMES.indexOf(sc[1]) >= 0) sections.push([stt, sc[1]]);
  }
  return { bpm: bpm, dur: intIn(c.dur, 0, 3600000, 0), gameMs: intIn(c.gameMs, 0, 3600000, 0), beats: beats, steps: steps, arrows: arrows, peaks: peaks, drop: intIn(c.drop, 0, 3600000, 0), keys: keys, sections: sections, hand: c.hand ? 1 : 0 };   /* hand: the steps were written in the note editor */
}
/* Spotlight plan for free dance rounds: everyone dances in a ring; one at a time the dancer due north walks down to the
   middle for a 15 s turn, walks back, and the ring dances round (left) until the next dancer is due north.
   dancers: [{id,name,color}] in ring order; chart: {dur} or null; lockPos: song position now (ms).
   Each turn is TURN_MS in the middle, then TRANS_MS of walking back + ring turning + the next one walking in
   (1.5 s back, 1.5 s turn, 1.5 s in). The first dancer has FIRST_NOTICE ms to plan. If the song can't fit everyone,
   only as many as fit get a turn. Returns [{id,name,color,a,b}] (a..b = the 15 s in the middle). */
var TURN_MS = 15000, TRANS_MS = 4500, FIRST_NOTICE = 15000;
function spotPlan(dancers, chart, lockPos) {
  if (!dancers || !dancers.length) return [];
  var N = dancers.length, firstA = lockPos + FIRST_NOTICE, end = chart && chart.dur > 0 ? chart.dur - 5000 : Infinity;
  var fit = end === Infinity ? N * 2 : Math.floor((end - firstA + TRANS_MS) / (TURN_MS + TRANS_MS)), n = Math.min(N * 2, fit), out = [];   /* everyone dances twice if the song is long enough */
  for (var i = 0; i < n; i++) { var a = firstA + i * (TURN_MS + TRANS_MS); out.push({ id: dancers[i % N].id, name: dancers[i % N].name, color: dancers[i % N].color, pass: Math.floor(i / N), a: Math.round(a), b: Math.round(a + TURN_MS) }); }
  return out;
}
/* ---------- battle rounds: a knockout of quick 1 v 1s during the song (see battle.js) ----------
   Everyone free dances; a little way into the song, whoever is dancing is entered and seeded at random.
   One match at a time: the two take centre stage and play the round's game (free dance: the room votes
   during the match, the performer's vote counts double); everyone else keeps dancing and watches. */
var BATTLE = require("./battle.js");
/* a Ski designer course: same checks as ART.SKI.clean on the pages */
var SKI_KINDS = { gate: 1, tree: 1, rock: 1, ramp: 1, mogul: 1 };
function cleanSki(c) {
  if (!c || typeof c !== "object" || !Array.isArray(c.objs)) return null;
  var len = Math.max(1000, Math.min(20000, Math.round(+c.len || 3000))), out = [];
  for (var i = 0; i < c.objs.length && out.length < 800; i++) {
    var o = c.objs[i]; if (!Array.isArray(o) || !SKI_KINDS[o[0]]) continue; var x = +o[1], y = +o[2], sz = +o[3] || 1; if (!isFinite(x) || !isFinite(y)) continue;
    out.push([o[0], Math.round(Math.max(-700, Math.min(700, x))), Math.round(Math.max(60, Math.min(len - 1, y))), Math.round(Math.max(0.7, Math.min(1.5, sz)) * 100) / 100]);
  }
  out.sort(function(p, q) { return p[2] - q[2]; });
  return { name: str(c.name, 40) || "My mountain", len: len, objs: out };
}
/* the Mars Rally track maths (shared with the pages): checks a track the performer built before passing it on */
var KARTGEO = { clean: function() { return null; } }; try { KARTGEO = require("../kart.js").geo; } catch (e) {}
/* capture the flag: the rules live in art.js (shared with every screen); the server is the referee */
var CTF = null;
try {
  var vmx = require("vm"), actx = { window: {}, document: { createElement: function() { return { getContext: function() { return null; } }; } }, localStorage: { getItem: function() { return null; }, setItem: function() {} }, Math: Math, Date: Date, Int32Array: Int32Array };
  vmx.createContext(actx); vmx.runInContext(fs.readFileSync(path.join(__dirname, "..", "art.js"), "utf8"), actx);
  CTF = (actx.window.ART || actx.ART).CTF;
} catch (e) { console.log("capture the flag rules not loaded:", e.message); }
function ctfPublic(c) { if (!c) return null; var nw = Date.now(), st = c.st, o = { map: c.map, teams: st.teams, flags: st.flags, caps: st.caps, rf: c.I.refills.map(function(q, i) { return CTF.refillLeft(st, i, nw); }) };
  if (st.kart) {   /* Kart Flag: ms left on timers (clocks differ), oil spots, who holds what */
    var left = function(m) { var r = {}; for (var k in m) { var l = (m[k] || 0) - nw; if (l > 0) r[k] = l; } return r; }, cd = {}; for (var id in st.cd) { var l2 = CTF.cdLeft(st, id, nw); if (l2 > 0) cd[id] = l2; }
    o.kart = 1; o.box = c.I.boxes.map(function(q, i) { return CTF.boxLeft(st, i, nw); }); o.oil = st.oil.map(function(q) { return [+q.x.toFixed(2), +q.y.toFixed(2), q.team]; }); o.held = st.held; o.sh = left(st.shield); o.spin = left(st.spin); o.mega = st.mega; o.cd = cd; }
  return o; }   /* rf: ms until each sprint refill is back (clocks differ, so not the time it was taken) */
function battlePublic(rd) {
  var b = rd.battle; if (!b) return null;
  return { entrants: b.entrants, slots: b.slots.map(function(s) { return { r: s.r, label: s.label, a: s.a, b: s.b, w: s.w, start: s.start, end: s.end, sa: s.sa || 0, sb: s.sb || 0 }; }) };
}
function battleLock(code) {
  var r = rooms[code], rd = r && r.round; if (!rd || rd.phase !== "play" || rd.battle) return;
  var list = [];
  r.viewers.forEach(function(v, id) { if (v.danced || v.dance >= 4) list.push({ id: id, name: v.name, color: v.color }); });
  for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = list[i]; list[i] = list[j]; list[j] = t; }
  var plan = BATTLE.plan(list, rd.chart, Date.now() - rd.playAt);
  if (!plan) { broadcast(code, { type: "battle", n: rd.n, none: true, dancers: list.length }); return; }
  plan.slots.forEach(function(s) { s.sa = 0; s.sb = 0; s.votes = new Map(); });
  rd.battle = plan; rd.battleTimers = [];
  broadcast(code, { type: "battle", n: rd.n, b: battlePublic(rd) });
  if (r.performer) send(r.performer, { type: "battle", n: rd.n, b: battlePublic(rd) });
  /* decide each match a moment after it ends (late scores still arriving) */
  plan.slots.forEach(function(s, k) {
    rd.battleTimers.push(setTimeout(function() { battleDecide(code, k); }, Math.max(0, s.end + 1200 - (Date.now() - rd.playAt))));
  });
}
function battleDecide(code, k) {
  var r = rooms[code], rd = r && r.round, b = rd && rd.battle; if (!b) return;
  var s = b.slots[k]; if (!s || s.w >= 0) return;
  BATTLE.advance(b);
  if (s.a < 0 && s.b < 0) return;
  /* someone left: the other goes through */
  var gone = function(e) { return e < 0 || !r.viewers.has(b.entrants[e].id); };
  if (gone(s.a) || gone(s.b)) s.w = gone(s.a) ? 1 : 0;
  else if (rd.mode === "free") {
    var va = 0, vb = 0; s.votes.forEach(function(v) { if (v.side === 0) va += v.w; else vb += v.w; });
    s.sa = va; s.sb = vb; s.w = vb > va ? 1 : 0;              /* a tie goes to the higher seed */
  } else s.w = s.sb > s.sa ? 1 : 0;
  BATTLE.advance(b);
  var msg = { type: "battle", n: rd.n, b: battlePublic(rd), done: k };
  broadcast(code, msg); if (r.performer) send(r.performer, msg);
  if (k === b.slots.length - 1 && rd.phase === "play") setTimeout(function() { var rr = rooms[code]; if (rr && rr.round === rd && rd.phase === "play") { rd.phase = "tally"; broadcast(code, { type: "round", phase: "tally", n: rd.n }); rd.timer = setTimeout(function() { roundFinish(code); }, 1500); } }, 2500);
}
/* which match is on now (server time), for scores and votes; a little grace at the end */
function battleNow(rd) { var b = rd.battle; if (!b) return -1; var p = Date.now() - rd.playAt; for (var i = 0; i < b.slots.length; i++) if (p >= b.slots[i].start - 2000 && p < b.slots[i].end + 1200) return i; return -1; }

function roundPublic(r) {
  var rd = r.round; if (!rd || rd.phase === "result" || rd.phase === "off") return null;
  var o = { type: "round", phase: rd.phase, n: rd.n, mode: rd.mode, title: rd.title, chart: rd.chart, battle: !!rd.isBattle }; if (rd.ice) o.ice = 1; if (rd.track) o.track = rd.track; if (rd.ski) o.ski = rd.ski; if (rd.ctf) { o.ctf = ctfPublic(rd.ctf); if (rd.ctf.kart) o.kflag = 1; }
  if (rd.phase === "countdown") o.ms = Math.max(0, rd.startAt - Date.now());
  if (rd.phase === "play") { o.ts0 = rd.ts0; o.pos = rd.paused ? rd.pausePos : Date.now() - rd.playAt; if (rd.paused) o.paused = 1; if (rd.spot) { o.spot = rd.spot; o.ring = rd.ring; } if (rd.mode === "mosh") o.tug = rd.tug.s; if (rd.battle) o.b = battlePublic(rd); }
  if (rd.phase === "vote") { o.ms = Math.max(0, rd.voteEnd - Date.now()); o.dancers = rd.dancers; }
  return o;
}
function totalsList(r) {
  var out = []; for (var k in r.totals) out.push(r.totals[k]);
  out.sort(function(a, b) { return b.pts - a.pts || b.wins - a.wins; });
  return out.slice(0, 10);
}
function roundStop(r) { var rd = r.round; if (!rd) return; clearInterval(rd.tick); clearTimeout(rd.timer); clearTimeout(rd.spotTimer); clearTimeout(rd.tugTimer); clearTimeout(rd.tugSend); rd.tick = rd.timer = rd.spotTimer = null; (rd.battleTimers || []).forEach(clearTimeout); rd.battleTimers = []; if (r.ctfBot) BOTS.ctfEnd(r.ctfBot.room); }   /* the bot that evened up a CTF game leaves with it */
/* free dance: partway through the song, take who's dancing, shuffle them, and plan their spotlight turns */
function spotLock(code) {
  var r = rooms[code], rd = r && r.round; if (!rd || rd.phase !== "play" || rd.spot) return;
  var list = [];
  r.viewers.forEach(function(v, id) { if (v.danced || v.dance === 4) list.push({ id: id, name: v.name, color: v.color }); });
  for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = list[i]; list[i] = list[j]; list[j] = t; }
  var turns = spotPlan(list, rd.chart, Date.now() - rd.playAt);
  if (!turns.length) return;
  rd.spot = turns; rd.ring = list.map(function(d) { return d.id; });
  broadcast(code, { type: "spotlight", n: rd.n, turns: turns, ring: rd.ring });
}
function roundStandings(code) {
  var r = rooms[code]; if (!r || !r.round) return;
  var list = [];
  r.viewers.forEach(function(v, id) { if (v.roundScore > 0) list.push({ id: id, name: v.name, color: v.color, score: v.roundScore }); });
  list.sort(function(a, b) { return b.score - a.score; });
  broadcast(code, { type: "round-scores", n: r.round.n, top: list.slice(0, 5), players: list.length, all: list.slice(0, 60).map(function(x) { return [x.id, x.score]; }) });   /* all: everyone's place, for the little board in each game */
  /* the performer sees everyone's points over their heads */
  if (r.performer) send(r.performer, { type: "round-all", n: r.round.n, s: list.slice(0, 60).map(function(x) { return [x.id, x.score]; }) });
}
/* every round hands out exactly 1000 show points:
   - 40% is shared equally by everyone who took part, so nobody is ever left with nothing and a slow start isn't the end of you;
   - 60% goes by score, but softened (square root), so a big win is worth only a bit more than a solid second and steady
     rounds add up faster than the odd blowout. Largest remainders get the leftover points so it adds up to exactly 1000. */
var SHARE_FLOOR = 0.4, FIRST_BONUS = 50;   /* first place gets 50 more on top of the round's 1000 */
function share1000(list) {
  var n = list.length; if (!n) return;
  var w = list.map(function(x) { return Math.sqrt(Math.max(0, +x.score || 0)); }), tw = 0; w.forEach(function(v) { tw += v; });
  var raw = list.map(function(x, i) { return 1000 * (tw > 0 ? SHARE_FLOOR / n + (1 - SHARE_FLOOR) * w[i] / tw : 1 / n); });
  var given = 0; list.forEach(function(x, i) { x.pts = Math.floor(raw[i]); given += x.pts; });
  list.map(function(x, i) { return i; }).sort(function(a, b) { return (raw[b] - Math.floor(raw[b])) - (raw[a] - Math.floor(raw[a])); })
    .slice(0, 1000 - given).forEach(function(i) { list[i].pts++; });
}
function roundFinish(code) {
  var r = rooms[code]; if (!r || !r.round) return;
  var rd = r.round; roundStop(r);
  if (rd.phase === "result" || rd.phase === "off") return;
  var list = [];
  if (rd.isBattle) {
    /* battle: placed by how far each got in the bracket; the score shown is matches won */
    if (rd.battle) BATTLE.ranks(rd.battle).forEach(function(x) { var e = rd.battle.entrants[x.e]; list.push({ id: e.id, name: e.name, color: e.color, score: x.wins, bplace: x.place }); });
    share1000(list);
    list.forEach(function(x) { x.place = x.bplace; if (x.place === 0) x.pts += FIRST_BONUS; var key = x.name.toLowerCase(), t = r.totals[key] || (r.totals[key] = { name: x.name, color: x.color, pts: 0, wins: 0 }); t.pts += x.pts; t.color = x.color; if (x.place === 0) t.wins++; });
    rd.phase = "result";
    broadcast(code, { type: "round", phase: "result", n: rd.n, mode: rd.mode, battle: true, title: rd.title, players: list.length,
      ranking: list.slice(0, 10).map(function(x) { return { id: x.id, name: x.name, color: x.color, score: x.score, pts: x.pts, place: x.place + 1 }; }),
      totals: totalsList(r) });
    return;
  }
  if (rd.mode === "free") {
    var tally = {};
    rd.votes.forEach(function(v) { tally[v.id] = (tally[v.id] || 0) + v.w; });
    rd.dancers.forEach(function(d) { list.push({ id: d.id, name: d.name, color: d.color, score: tally[d.id] || 0 }); });
  } else {
    r.viewers.forEach(function(v, id) { if (v.roundScore > 0) list.push({ id: id, name: v.name, color: v.color, score: v.roundScore }); });
  }
  list.sort(function(a, b) { return b.score - a.score; });
  share1000(list);
  /* equal scores share a placing */
  for (var i = 0; i < list.length; i++) {
    var place = (i > 0 && list[i].score === list[i - 1].score) ? list[i - 1].place : i;
    list[i].place = place;
    if (place === 0 && list[i].score > 0) list[i].pts += FIRST_BONUS;   /* first place: +50 on top of the 1000 */
    var key = list[i].name.toLowerCase(), t = r.totals[key] || (r.totals[key] = { name: list[i].name, color: list[i].color, pts: 0, wins: 0 });
    t.pts += list[i].pts; t.color = list[i].color;
    if (place === 0 && list[i].score > 0) t.wins++;
  }
  rd.phase = "result";
  broadcast(code, { type: "round", phase: "result", n: rd.n, mode: rd.mode, title: rd.title, players: list.length,
    ranking: list.slice(0, 10).map(function(x) { return { id: x.id, name: x.name, color: x.color, score: x.score, pts: x.pts, place: x.place + 1 }; }),
    totals: totalsList(r) });
}
function roundMessage(ws, msg) {
  var code = ws.room, r = rooms[code], rd = r.round;
  if (msg.type === "round-start") {
    var mode = msg.mode === "aim" || msg.mode === "free" || msg.mode === "keys" || msg.mode === "keys4" || msg.mode === "mosh" || msg.mode === "skate" || msg.mode === "keepy" || msg.mode === "kart" || msg.mode === "walk" || msg.mode === "pipe" || msg.mode === "ski" || (msg.mode === "ctf" && CTF) ? msg.mode : "step";
    roundStop(r);
    r.roundN = (r.roundN || 0) + 1;
    var ms = intIn(msg.countdown, 3000, 60000, 10000);
    rd = r.round = { track: mode === "kart" ? KARTGEO.clean(msg.track) : null, ski: mode === "ski" ? cleanSki(msg.ski) : null, n: r.roundN, mode: mode, ice: mode === "skate" && !!msg.ice, isBattle: !!msg.battle && mode !== "mosh" && mode !== "skate" && mode !== "keepy" && mode !== "kart" && mode !== "walk" && mode !== "pipe" && mode !== "ski", tug: { s: [0, 0], done: false }, title: str(msg.title, 80) || "Round " + r.roundN, phase: "countdown", chart: cleanChart(msg.chart),
      startAt: Date.now() + ms, ts0: null, playAt: 0, votes: new Map(), dancers: [], tick: null, timer: null };
    r.viewers.forEach(function(v) { v.roundScore = 0; v.danced = false; });
    if (mode === "ctf") { BOTS.ctfEven(code); var kf = !!msg.kflag, cm = CTF.clean(msg.ctf) || (kf ? CTF.kartDefault() : CTF.defaultMap()); if (kf) cm = CTF.kartMap(cm); var ci = CTF.info(cm); rd.ctf = { map: cm, I: ci, kart: kf, st: CTF.newState(ci, Array.from(r.viewers.keys()), kf) }; rd.isBattle = false; }
    broadcast(code, roundPublic(r));
    return;
  }
  if (!rd) return;
  if (msg.type === "round-play") {
    if (rd.phase !== "countdown" && rd.phase !== "play") return;
    var ts0 = +msg.ts0; rd.ts0 = isFinite(ts0) && msg.ts0 !== null ? ts0 : null;
    rd.playAt = Date.now() - intIn(msg.pos, 0, 3600000, 0);
    /* paused: everyone's game holds at this point in the song until the next round-play */
    rd.paused = !!msg.paused; rd.pausePos = rd.paused ? intIn(msg.pos, 0, 3600000, 0) : 0;
    var first = rd.phase !== "play"; rd.phase = "play";
    broadcast(code, roundPublic(r));
    if (first && rd.isBattle) {
      /* enter whoever is dancing 12% of the way in (at least 12 s), then run the bracket */
      var bdur = rd.chart && rd.chart.dur > 0 ? rd.chart.dur : 0, block = bdur ? Math.max(12000, bdur * 0.12) : 15000;
      rd.spotTimer = setTimeout(function() { battleLock(code); }, Math.max(0, block - (Date.now() - rd.playAt)));
      return;
    }
    if (first && rd.mode !== "free") rd.tick = setInterval(function() { roundStandings(code); }, 3000);
    if (first && rd.mode === "mosh" && rd.chart && rd.chart.drop) {
      /* the wall of death's tug of war: when it's over, everyone gets the final count */
      rd.tugTimer = setTimeout(function() { var rr = rooms[code]; if (!rr || rr.round !== rd) return; rd.tug.done = true; var m = { type: "tug", n: rd.n, s: rd.tug.s, done: true }; broadcast(code, m); },
        Math.max(0, rd.chart.drop + TUG_AT + TUG_MS + 400 - (Date.now() - rd.playAt)));
    }
    if (first && rd.mode === "free") {
      /* lock in the ring a few seconds into the round, so everyone's turn fits */
      var dur = rd.chart && rd.chart.dur > 0 ? rd.chart.dur : 0, lockAt = 22000;   /* about 30 s of free dance before the circle forms: the ring is locked at 22 s, the first dancer is told then and the first turn is 15 s later (the circle forms 7 s before it) */
      rd.spotTimer = setTimeout(function() { spotLock(code); }, Math.max(0, lockAt - (Date.now() - rd.playAt)));
    }
    return;
  }
  if (msg.type === "round-end") {
    if (rd.phase === "result" || rd.phase === "off" || rd.phase === "vote" || rd.phase === "tally") return;
    roundStop(r);
    if (msg.cancel || rd.phase === "countdown") { rd.phase = "off"; broadcast(code, { type: "round", phase: "off", n: rd.n }); return; }
    if (rd.isBattle) {
      /* the song ended: decide the match that was on, then the results */
      var bk = battleNow(rd); if (bk >= 0) battleDecide(code, bk);
      rd.phase = "tally"; broadcast(code, { type: "round", phase: "tally", n: rd.n });
      rd.timer = setTimeout(function() { roundFinish(code); }, 1500);
      return;
    }
    if (rd.mode === "free") {
      rd.dancers = [];
      r.viewers.forEach(function(v, id) { if (v.danced) rd.dancers.push({ id: id, name: v.name, color: v.color }); });
      if (rd.dancers.length < 2) { roundFinish(code); return; }          /* nobody to choose between */
      rd.phase = "vote"; rd.voteEnd = Date.now() + VOTE_MS;
      broadcast(code, roundPublic(r));
      rd.timer = setTimeout(function() { roundFinish(code); }, VOTE_MS);
    } else {
      rd.phase = "tally";                                                 /* a moment for final scores to arrive */
      broadcast(code, { type: "round", phase: "tally", n: rd.n });
      rd.timer = setTimeout(function() { roundFinish(code); }, 1500);
    }
    return;
  }
  if (msg.type === "round-vote") castVote(ws, "performer", msg.id, 2);
  if (msg.type === "round-bvote") battleVote(ws, "performer", msg.side, 2);
}
/* ── The crowd picks the next game ──
   The performer opens a vote between a few games (gvote-open); everyone taps one (gvote-pick); when time is up the
   game with the most votes wins (ties drawn at random, nobody voting = a random pick). Bots vote too. */
var GV_MODES = ["step", "aim", "keys", "keys4", "mosh", "skate", "ice", "keepy", "kart", "walk", "pipe", "ski", "ctf", "kflag"];
function gvotePublic(g) {
  var c = g.opts.map(function() { return 0; });
  g.picks.forEach(function(m) { var i = g.opts.indexOf(m); if (i >= 0) c[i]++; });
  return { type: "gvote", id: g.id, opts: g.opts, counts: c, left: Math.max(0, g.end - Date.now()), done: g.done, win: g.win };
}
function gvoteTell(code, g) { var r = rooms[code]; if (!r) return; var p = gvotePublic(g); broadcast(code, p); if (r.performer) send(r.performer, p); }
function gvoteStop(r) { if (r.gvote) { clearTimeout(r.gvote.timer); r.gvote = null; } }
function gvoteOpen(code, msg) {
  var r = rooms[code]; if (!r) return;
  gvoteStop(r);
  var opts = (Array.isArray(msg.opts) ? msg.opts : []).filter(function(m, i, a) { return GV_MODES.indexOf(m) >= 0 && a.indexOf(m) === i; }).slice(0, 4);
  if (opts.length < 2) return;
  var ms = intIn(msg.ms, 5000, 60000, 15000);
  var g = r.gvote = { id: (r.gvoteN = (r.gvoteN || 0) + 1), opts: opts, picks: new Map(), end: Date.now() + ms, done: false, win: null };
  g.timer = setTimeout(function() { gvoteClose(code, g); }, ms);
  r.viewers.forEach(function(v, id) {
    if (v.ws && v.ws.bot) setTimeout(function() { if (r.gvote === g && !g.done) gvotePick(code, id, opts[Math.floor(Math.random() * opts.length)]); }, 1500 + Math.random() * Math.max(500, ms - 3500));
  });
  gvoteTell(code, g);
}
function gvotePick(code, id, m) {
  var r = rooms[code], g = r && r.gvote; if (!g || g.done || g.opts.indexOf(m) < 0) return;
  g.picks.set(id, m); gvoteTell(code, g);
}
function gvoteClose(code, g) {
  var r = rooms[code]; if (!r || r.gvote !== g || g.done) return;
  clearTimeout(g.timer); g.done = true;
  var c = gvotePublic(g).counts, best = -1, top = [];
  c.forEach(function(n, i) { if (n > best) { best = n; top = [i]; } else if (n === best) top.push(i); });
  g.win = g.opts[top[Math.floor(Math.random() * top.length)]];
  gvoteTell(code, g);
  setTimeout(function() { if (r.gvote === g) r.gvote = null; }, 8000);
}
/* ── The crowd picks the next song ──
   Like the game vote, but between up to 4 songs from the performer's own library (titles only; the files stay on the
   performer's computer). The winner is picked for the performer, who presses Start. */
function svotePublic(g) {
  var c = g.opts.map(function() { return 0; });
  g.picks.forEach(function(k) { if (c[k] !== undefined) c[k]++; });
  return { type: "svote", id: g.id, opts: g.opts, counts: c, left: Math.max(0, g.end - Date.now()), done: g.done, win: g.win };
}
function svoteTell(code, g) { var r = rooms[code]; if (!r) return; var p = svotePublic(g); broadcast(code, p); if (r.performer) send(r.performer, p); }
function svoteStop(r) { if (r.svote) { clearTimeout(r.svote.timer); r.svote = null; } }
function svoteOpen(code, msg) {
  var r = rooms[code]; if (!r) return;
  svoteStop(r);
  var opts = (Array.isArray(msg.opts) ? msg.opts : []).map(function(t) { return String(t || "").replace(/[\u0000-\u001f]/g, "").slice(0, 80).trim(); }).filter(function(t, i, a) { return t && a.indexOf(t) === i; }).slice(0, 4);
  if (opts.length < 2) return;
  var ms = intIn(msg.ms, 5000, 60000, 20000);
  var g = r.svote = { id: (r.svoteN = (r.svoteN || 0) + 1), opts: opts, picks: new Map(), end: Date.now() + ms, done: false, win: -1 };
  g.timer = setTimeout(function() { svoteClose(code, g); }, ms);
  r.viewers.forEach(function(v, id) {
    if (v.ws && v.ws.bot) setTimeout(function() { if (r.svote === g && !g.done) svotePick(code, id, Math.floor(Math.random() * opts.length)); }, 1500 + Math.random() * Math.max(500, ms - 3500));
  });
  svoteTell(code, g);
}
function svotePick(code, id, k) {
  var r = rooms[code], g = r && r.svote; k = +k; if (!g || g.done || !(k >= 0 && k < g.opts.length)) return;
  g.picks.set(id, k | 0); svoteTell(code, g);
}
function svoteClose(code, g) {
  var r = rooms[code]; if (!r || r.svote !== g || g.done) return;
  clearTimeout(g.timer); g.done = true;
  var c = svotePublic(g).counts, best = -1, top = [];
  c.forEach(function(n, i) { if (n > best) { best = n; top = [i]; } else if (n === best) top.push(i); });
  g.win = top[Math.floor(Math.random() * top.length)];
  svoteTell(code, g);
  setTimeout(function() { if (r.svote === g) r.svote = null; }, 8000);
}
/* free dance battles: a vote for one side of the match that's on (not by the two dancing) */
function battleVote(ws, voter, side, weight) {
  var r = rooms[ws.room], rd = r && r.round; if (!rd || !rd.battle || rd.mode !== "free" || rd.phase !== "play") return;
  var k = battleNow(rd); if (k < 0 || (side !== 0 && side !== 1)) return;
  var s = rd.battle.slots[k], e = rd.battle.entrants;
  if ((s.a >= 0 && e[s.a].id === voter) || (s.b >= 0 && e[s.b].id === voter)) return;
  s.votes.set(voter, { side: side, w: weight });
  var va = 0, vb = 0; s.votes.forEach(function(v) { if (v.side === 0) va += v.w; else vb += v.w; });
  s.sa = va; s.sb = vb;
  var m = { type: "bscore", n: rd.n, m: k, sa: va, sb: vb }; broadcast(ws.room, m); if (r.performer) send(r.performer, m);
}
function castVote(ws, voter, target, weight) {
  var r = rooms[ws.room], rd = r && r.round;
  if (!rd || rd.phase !== "vote" || typeof target !== "string" || target === voter) return;
  if (!rd.dancers.some(function(d) { return d.id === target; })) return;
  rd.votes.set(voter, { id: target, w: weight });
  if (r.performer) send(r.performer, { type: "round-votes", n: rd.n, cast: rd.votes.size, of: r.viewers.size + 1 });
  if (rd.votes.size >= r.viewers.size + 1) roundFinish(ws.room);        /* everyone has voted: no need to wait */
}

/* the show's effects, checked: anything unknown is dropped */
var FX_LIGHTS = ["auto", "party", "edm", "strobe", "spot", "warm", "cool", "off"], FX_WEATHER = ["none", "rain", "storm", "snow"];
var FX_CROWD = ["sparkle", "fire", "lasers", "float"];
var REACTS = ["jump", "hearts", "bigheart", "clap", "whistle", "spin", "twirl", "turn180", "turn90", "spinmove"];
/* the mosh pit's tug of war starts this long after the drop and lasts this long (the same in venue.html) */
var TUG_AT = 0, TUG_MS = 10000;
/* voice between songs: how many people can talk at once in a room (everyone connects to everyone, so keep it small) */
var VOICE_MAX = +process.env.VOICE_MAX || 8;   /* talkers (mic on) at once; anyone can listen */   /* the walls meet right on the drop (the charge starts 0.8 s before it) */
/* the build, shown at the bottom of both pages so you can tell which version is running (bump it with each release) */
var VERSION = "1.81.78";
/* where this server runs: Render sets RENDER=true; anything else is self-hosted (UK_HOST can name it) */
var HOSTED = process.env.RENDER ? "render" : "self";
var HOST_NAME = String(process.env.UK_HOST || "").slice(0, 40);
function showFx(f) {
  if (!f || typeof f !== "object") return null;
  function lvl(v) { v = +v; return isFinite(v) ? Math.max(0, Math.min(1, Math.round(v * 100) / 100)) : 0; }
  return { lights: FX_LIGHTS.indexOf(f.lights) >= 0 ? f.lights : "auto", fog: lvl(f.fog), lasers: f.lasers ? 1 : 0, dark: lvl(f.dark),
    weather: FX_WEATHER.indexOf(f.weather) >= 0 ? f.weather : "none", wx: f.wx === undefined ? 0.6 : lvl(f.wx), sunset: f.sunset ? 1 : 0, fire: f.fire ? 1 : 0, neon: f.neon ? 1 : 0, fireworks: f.fireworks ? 1 : 0,
    burst: Math.max(0, Math.floor(+f.burst || 0)) % 1e13,
    /* lights following the performer's playing; the Jumbotron (auto: down while a video plays); things that lower in */
    follow: f.follow ? 1 : 0, jumbo: f.jumbo === "down" || f.jumbo === "up" ? f.jumbo : "auto", disco: f.disco ? 1 : 0, banner: f.banner ? 1 : 0,
    bannerText: String(f.bannerText || "UNHOLY KEYS").toUpperCase().replace(/[^A-Z0-9 !?'.#*-]/g, "").slice(0, 20) || "UNHOLY KEYS",
    /* one-shot moments: the time each was last set off (a balloon drop, a confetti blast, a crowd surprise) */
    balloonT: Math.max(0, Math.floor(+f.balloonT || 0)) % 1e13, confettiT: Math.max(0, Math.floor(+f.confettiT || 0)) % 1e13,
    crowd: FX_CROWD.indexOf(f.crowd) >= 0 ? f.crowd : "", crowdT: Math.max(0, Math.floor(+f.crowdT || 0)) % 1e13,
    /* scenes: the venue floating in space (everyone drifts), the stage filling with water (everyone swims) */
    space: f.space ? 1 : 0, water: f.water ? 1 : 0 };
}
/* a character's look: 8 letters/digits (see art.js), or nothing */
function look(s) { return typeof s === "string" && /^[0-9a-z]{8,12}(~([shtb][0-9a-f]{6}){1,4})?$/.test(s) ? s : ""; }

function viewerList(room) {
  var r = rooms[room]; if (!r) return [];
  var out = [];
  r.viewers.forEach(function(v, id) { var o = { id: id, name: v.name, x: v.x, y: v.y, color: v.color, look: v.look || "", dance: v.dance || 0 };
    if (v.pose && v.dance >= 4) { o.pose = v.pose; o.combo = v.combo || 0; if (v.fd) o.fd = v.fd; }
    out.push(o); });
  return out;
}

/* Allow a short burst, then at most `perSec` messages a second. */
function allow(ws, key, burst, perSec) {
  var now = Date.now(), b = ws._rate || (ws._rate = {}), s = b[key] || (b[key] = { n: burst, t: now });
  s.n = Math.min(burst, s.n + (now - s.t) / 1000 * perSec); s.t = now;
  if (s.n < 1) return false;
  s.n -= 1; return true;
}

/* one message from a connection (also used by the room-filling bots, whose "connections" live in this process) */
function onMessage(ws, raw, isBinary) {
  /* the performer's stream packets are big; so is the performer's round start (a long song's step chart, a custom kart track),
     so the performer may send text up to 240 KB. Everyone else is capped at 16 KB, and anything larger drops the sender. */
  if (isBinary && ws.role === "performer") { relayStream(ws, raw); return; }
  if (raw.length > (ws.role === "performer" ? 240 * 1024 : 16 * 1024)) { console.log("Dropped an oversized message (" + raw.length + " bytes) from a " + (ws.role || "new connection")); try { ws.terminate(); } catch (e) {} return; }
  if (isBinary) return;
  var msg;
  try { msg = JSON.parse(raw); } catch(e) { return; }
  if (!msg || typeof msg !== "object" || typeof msg.type !== "string") return;

  /* ── Performer creates room ── */
  if (msg.type === "create-room") {
    if (ws.role) return;                       // one role per connection
    var code = genCode();                      // never a client-chosen code: that let anyone take over a live room
    rooms[code] = { key: genId() + genId(), performer: ws, viewers: new Map(), state: {}, video: null, round: null, roundN: 0, totals: {}, performerName: str(msg.name, 24) || "Performer", performerLook: look(msg.look) };
    ws.room = code;
    ws.role = "performer";
    send(ws, { type: "room-created", room: code, key: rooms[code].key, version: VERSION, host: HOSTED, hostName: HOST_NAME });
    console.log("Room created:", code);
    return;
  }

  /* ── Audience joins room ── */
  /* ── Performer coming back after a dropped connection: same room, same audience, if they have the room's key ── */
  if (msg.type === "end-room") { if (ws.role === "performer") ws.ending = true; return; }
  if (msg.type === "resume-room") {
    if (ws.role) return;
    var rc = str(msg.room, 12).toUpperCase(), rr = rooms[rc];
    if (!rr || !rr.key || str(msg.key, 40) !== rr.key) { send(ws, { type: "resume-failed" }); return; }
    if (rr.performer && rr.performer !== ws) { var old = rr.performer; old.role = null; old.room = null; try { old.terminate(); } catch (e) {} }   /* a stale socket that hadn't noticed it was dead */
    if (rr.goneT) { clearTimeout(rr.goneT); rr.goneT = null; }
    rr.performer = ws; ws.room = rc; ws.role = "performer";
    send(ws, { type: "room-resumed", room: rc, key: rr.key, version: VERSION, host: HOSTED, hostName: HOST_NAME });
    rr.viewers.forEach(function(v, vid) { send(ws, { type: "viewer-join", id: vid, name: v.name, x: v.x, y: v.y, color: v.color, look: v.look }); });
    send(ws, { type: "viewer-count", count: rr.viewers.size });
    broadcast(rc, { type: "performer-back" });
    console.log("Performer back in room", rc);
    return;
  }

  if (msg.type === "join-room") {
    if (ws.role) return;
    var roomCode = str(msg.room, 12).toUpperCase();
    var r = rooms[roomCode];
    if (!r) { send(ws, { type: "error", msg: "Room not found" }); return; }
    if (r.viewers.size >= MAX_VIEWERS) { send(ws, { type: "error", msg: "Room is full" }); return; }
    var id = genId();
    ws.room = roomCode;
    ws.role = "viewer";
    ws.viewerId = id;
    ws.viewerName = str(msg.name, 24) || "Anonymous";
    ws.viewerColor = color(msg.color);
    ws.viewerLook = look(msg.look);
    var startX = +(0.25 + Math.random() * 0.5).toFixed(3);   // 0.25–0.75 normalized
    var startY = +(0.35 + Math.random() * 0.30).toFixed(3); // 0.35–0.65 normalized
    r.viewers.set(id, { ws: ws, name: ws.viewerName, x: startX, y: startY, color: ws.viewerColor, look: ws.viewerLook });

    // Send room state to new viewer
    send(ws, {
      type: "room-state", version: VERSION, host: HOSTED, hostName: HOST_NAME,
      yourId: id,
      viewers: viewerList(roomCode),
      performerState: r.state,
      video: liveVideo(r),
      stream: r.stream || null,
      performer: { name: r.performerName || "Performer", look: r.performerLook || "" },
      round: roundPublic(r),
      gvote: r.gvote && !r.gvote.done ? gvotePublic(r.gvote) : null,
      svote: r.svote && !r.svote.done ? svotePublic(r.svote) : null,
      voiceOpen: r.voice && Object.keys(r.voice).some(function(k) { return r.voice[k].mic; }) ? 1 : 0,   /* someone's talking: join in, listening */
      totals: totalsList(r),
      fx: r.fx || null,
      perfPos: r.perfPos || null
    });

    // Notify everyone else
    broadcast(roomCode, { type: "viewer-join", id: id, name: ws.viewerName, x: startX, y: startY, color: ws.viewerColor, look: ws.viewerLook }, ws);

    // Tell performer viewer count
    if (r.performer) send(r.performer, { type: "viewer-count", count: r.viewers.size });
    if (!ws.bot) console.log(ws.viewerName, "joined room", roomCode, "(" + r.viewers.size + " viewers)");
    if (r.botFill && !ws.bot) setImmediate(function() { BOTS.rebalance(roomCode); });   /* a real person: a bot makes room */
    return;
  }

  /* ── Performer broadcasts ── */
  /* ── Voice between songs (performer and audience): the server only introduces people and passes their WebRTC
     setup messages along; the audio itself goes straight between players. At most VOICE_MAX talkers per room. ── */
  if (ws.room && rooms[ws.room] && typeof msg.type === "string" && msg.type.indexOf("voice-") === 0) {
    var vr = rooms[ws.room], vid = ws.role === "performer" ? "performer" : ws.viewerId;
    if (!vid) return;
    vr.voice = vr.voice || {};   /* id -> { mic: 0/1 }: everyone in voice; only those with the mic on count towards VOICE_MAX */
    var vSend = function(id, o) { var t = id === "performer" ? vr.performer : (vr.viewers.get(id) || {}).ws; if (t) try { t.send(JSON.stringify(o)); } catch(e) {} };
    var vPeers = function() { return Object.keys(vr.voice).filter(function(k) { return k !== vid; }).map(function(k) { return { id: k, mic: vr.voice[k].mic ? 1 : 0 }; }); };
    var vTalkers = function() { return Object.keys(vr.voice).filter(function(k) { return vr.voice[k].mic; }); };
    if (msg.type === "voice-join") {   /* in, listening */
      if (!allow(ws, "vjoin", 6, 0.3)) return;
      if (!vr.voice[vid]) vr.voice[vid] = { mic: 0 };
      vSend(vid, { type: "voice-peers", peers: vPeers() });
      broadcast(ws.room, { type: "voice-on", id: vid, mic: vr.voice[vid].mic }, ws);
      return;
    }
    if (msg.type === "voice-leave") { if (vr.voice[vid]) { delete vr.voice[vid]; broadcast(ws.room, { type: "voice-off", id: vid }, ws); } return; }
    if (!vr.voice[vid]) return;
    if (msg.type === "voice-mic") {   /* mic on (a talker slot, if one is free) or off */
      if (!allow(ws, "vmic", 8, 1)) return;
      if (msg.on) {
        var tk = vTalkers().filter(function(k) { return k !== vid; });
        if (tk.length >= VOICE_MAX) { vSend(vid, { type: "voice-full", max: VOICE_MAX }); return; }
        var first = !tk.length && !vr.voice[vid].mic;
        vr.voice[vid].mic = 1;
        vSend(vid, { type: "voice-peers", peers: vPeers() });   /* so the new talker can call everyone it isn't connected to */
        broadcast(ws.room, { type: "voice-mic", id: vid, on: 1 }, ws);
        if (first) broadcast(ws.room, { type: "voice-open" });   /* the first talker: everyone in the room joins in, listening */
      } else if (vr.voice[vid].mic) { vr.voice[vid].mic = 0; broadcast(ws.room, { type: "voice-mic", id: vid, on: 0 }, ws); }
      return;
    }
    if (msg.type === "voice-talk") { if (!vr.voice[vid].mic || !allow(ws, "vtalk", 12, 4)) return; broadcast(ws.room, { type: "voice-talk", id: vid, on: msg.on ? 1 : 0 }, ws); return; }
    if (msg.type === "voice-sig") {
      var to = String(msg.to || ""); if (!vr.voice[to] || !allow(ws, "vsig", 80, 30)) return;
      vSend(to, { type: "voice-sig", from: vid, d: msg.d });
      return;
    }
    return;
  }
  if (ws.role === "performer" && ws.room && rooms[ws.room]) {
    if (msg.type === "round-start" || msg.type === "round-play" || msg.type === "round-end" || msg.type === "round-vote" || msg.type === "round-bvote") { roundMessage(ws, msg); return; }
    /* fill the room with bots up to this many people (0 = no bots) */
    if (msg.type === "bots") { BOTS.setFill(ws.room, msg.fill); return; }
    if (msg.type === "gvote-open") { gvoteOpen(ws.room, msg); return; }
    if (msg.type === "svote-open") { svoteOpen(ws.room, msg); return; }
    if (msg.type === "svote-close") { var sr = rooms[ws.room]; if (sr.svote) svoteClose(ws.room, sr.svote); return; }
    if (msg.type === "svote-cancel") { var sr2 = rooms[ws.room]; if (sr2.svote && !sr2.svote.done) { svoteStop(sr2); broadcast(ws.room, { type: "svote", cancel: 1 }); } return; }
    if (msg.type === "gvote-close") { var gr = rooms[ws.room]; if (gr.gvote) gvoteClose(ws.room, gr.gvote); return; }
    if (msg.type === "gvote-cancel") { var gr2 = rooms[ws.room]; if (gr2.gvote && !gr2.gvote.done) { gvoteStop(gr2); broadcast(ws.room, { type: "gvote", cancel: 1 }); } return; }
    if (!PERFORMER_TYPES[msg.type]) return;
    if (msg.type === "state") rooms[ws.room].state = msg;
    if (msg.type === "video") { if (msg.action === "stop") rooms[ws.room].video = null; else { rooms[ws.room].video = msg; rooms[ws.room].videoAt = Date.now(); } }
    if (msg.type === "stream") rooms[ws.room].stream = msg.active ? msg : null;
    if (msg.type === "show-fx") {
      // the show's effects (lights, fog, lasers, darkness, weather, sunset, fire, fireworks): kept for latecomers
      var fx = showFx(msg.fx); if (!fx) return;
      rooms[ws.room].fx = fx;
      broadcast(ws.room, { type: "show-fx", fx: fx }, ws);
      return;
    }
    /* hanging out between songs: the performer walks the floor (on = off the stage, x/y where on the floor) */
    if (msg.type === "perf-pos") {
      var hx = unit(msg.x), hy = unit(msg.y);
      if (hx === null || hy === null || !allow(ws, "ppos", 20, 15)) return;
      rooms[ws.room].perfPos = { on: msg.on ? 1 : 0, x: hx, y: hy };
      broadcast(ws.room, { type: "perf-pos", on: msg.on ? 1 : 0, x: hx, y: hy }, ws);
      return;
    }
    /* the performer talking: everyone sees it in the chat and over the performer's head */
    if (msg.type === "song-part") {
      /* which part of the song is playing (verse, chorus, solo, finale...), or "" when it ends: for the audience's banner */
      var part = msg.k === "" ? "" : SECTION_NAMES.indexOf(msg.k) >= 0 ? msg.k : null;
      if (part === null || !allow(ws, "part", 4, 1)) return;
      rooms[ws.room].part = part;
      broadcast(ws.room, { type: "song-part", k: part }, ws);
      return;
    }
    if (msg.type === "perf-chat") {
      var ptext = str(msg.text, 300);
      if (!ptext || !allow(ws, "chat", 12, 3)) return;
      broadcast(ws.room, { type: "chat", id: "performer", viewerId: "performer", perf: 1, name: rooms[ws.room].performerName || "Performer", color: "#F5C518", text: ptext }, ws);
      return;
    }
    if (msg.type === "perf-name") {
      rooms[ws.room].performerName = str(msg.name, 24) || "Performer";
      if (look(msg.look)) rooms[ws.room].performerLook = look(msg.look);
      broadcast(ws.room, { type: "perf-name", name: rooms[ws.room].performerName, look: rooms[ws.room].performerLook || "" }, ws);
      return;
    }
    broadcast(ws.room, msg, ws);
    return;
  }

  /* ── Viewer messages: chat, position, dancing, dance poses, round scores and votes only ── */
  if (ws.role === "viewer" && ws.room && rooms[ws.room]) {
    if (msg.type === "chat") {
      var text = str(msg.text, 300);
      if (!text || !allow(ws, "chat", 12, 3)) return;
      broadcast(ws.room, { type: "chat", id: ws.viewerId, viewerId: ws.viewerId, name: ws.viewerName, color: ws.viewerColor, text: text }, ws);
      return;
    }
    if (msg.type === "react") {
      /* a quick reaction everyone sees on this dancer: jump, hearts, a big heart, applause, a whistle */
      if (REACTS.indexOf(msg.k) < 0) return;
      if (!allow(ws, "react", 8, 3) || (msg.k === "bigheart" && !allow(ws, "bigheart", 1, 0.25))) return;
      broadcast(ws.room, { type: "react", id: ws.viewerId, k: msg.k }, ws);
      return;
    }
    if (msg.type === "kick") {
      /* keepy uppy: someone hit the balloon, ball or feather; pass its new flight on to everyone (numbers clamped) */
      var krd = rooms[ws.room].round;
      if (!krd || krd.mode !== "keepy" || krd.phase !== "play" || !allow(ws, "kick", 6, 4)) return;
      var ko = intIn(msg.o, 0, 3, -1), kt = intIn(msg.t, 0, 3600000, -1), kx = unit(msg.x), ky = unit(msg.y);
      var kn = function(v, lo, hi) { v = +v; return isFinite(v) ? Math.max(lo, Math.min(hi, +v.toFixed(4))) : null; };
      var kz = kn(msg.z, 0, 200), kvx = kn(msg.vx, -2, 2), kvy = kn(msg.vy, -2, 2), kvz = kn(msg.vz, 0, 200);
      if (ko < 0 || kt < 0 || kx === null || ky === null || kz === null || kvx === null || kvy === null || kvz === null) return;
      broadcast(ws.room, { type: "kick", id: ws.viewerId, o: ko, t: kt, x: kx, y: ky, z: kz, vx: kvx, vy: kvy, vz: kvz }, ws);
      return;
    }
    if (msg.type === "pos") {
      var x = unit(msg.x), y = unit(msg.y);
      if (x === null || y === null || !allow(ws, "pos", 20, 15)) return;
      var v = rooms[ws.room].viewers.get(ws.viewerId);
      if (v) { v.x = x; v.y = y; }
      var pm2 = { type: "pos", id: ws.viewerId, name: ws.viewerName, x: x, y: y };
      if (msg.z !== undefined) pm2.z = unit(msg.z) || 0;                       /* half pipe: how high in the air (0..1) */
      if (msg.r !== undefined) pm2.r = intIn(msg.r, -1440, 1440, 0);           /* and how far they've spun (degrees) */
      broadcast(ws.room, pm2, ws);
      /* capture the flag: the referee checks pick-ups, captures and tags from where everyone is */
      var crd = rooms[ws.room].round;
      if (crd && crd.ctf && crd.phase === "play") {
        var cc = crd.ctf, ev = CTF.step(cc.st, cc.I, ws.viewerId, x * cc.I.w, y * cc.I.h, Date.now());
        for (var sid in cc.st.score) { var sv2 = rooms[ws.room].viewers.get(sid); if (sv2) { sv2.roundScore = cc.st.score[sid]; sv2.danced = true; } }
        if (ev.length || cc.kart || cc.st.flags.some(function(f) { return f.at; })) {
          var now2 = Date.now();
          if (ev.length || now2 - (cc.sentAt || 0) > 200) { cc.sentAt = now2; var cm2 = ctfPublic(cc); delete cm2.map; cm2.type = "ctf"; cm2.ev = ev; broadcast(ws.room, cm2); }
        }
      }
      return;
    }
    if (msg.type === "dance") {
      // 0 = stopped, 1-3 = canned dances, 4 = free dance, 5 = step game
      var style = Math.max(0, Math.min(5, Math.floor(+msg.style || 0)));
      if (!allow(ws, "dance", 6, 2)) return;
      var dv = rooms[ws.room].viewers.get(ws.viewerId);
      if (dv) { dv.dance = style; if (style < 4) dv.pose = null; }
      broadcast(ws.room, { type: "dance", id: ws.viewerId, style: style }, ws);
      return;
    }
    if (msg.type === "pose") {
      // limb angles for the dance games: [left arm, right arm, left leg, right leg] in hundredths of a radian,
      // plus the step-game combo. Everything is clamped; nothing else in the message is passed on.
      if (!Array.isArray(msg.a) || msg.a.length !== 4 || !allow(ws, "pose", 14, 12)) return;
      var a = [];
      for (var pi = 0; pi < 4; pi++) {
        var n = Math.round(+msg.a[pi]);
        if (!isFinite(n)) return;
        a.push(Math.max(-320, Math.min(320, n)));
      }
      var combo = Math.max(0, Math.min(9999, Math.floor(+msg.c || 0)));
      // free dance: which dance (0-8), which of its moves (0-7), and the two control dots (4 numbers, -100..100)
      var fd = null;
      if (msg.fd && typeof msg.fd === "object") {
        var fs = Math.floor(+msg.fd.s), fm = Math.floor(+msg.fd.m), fc = [];
        if (fs >= 0 && fs <= 16 && fm >= 0 && fm <= 7 && Array.isArray(msg.fd.c) && msg.fd.c.length === 4) {
          for (var fi = 0; fi < 4; fi++) { var fv = Math.round(+msg.fd.c[fi]); if (!isFinite(fv)) { fc = null; break; } fc.push(Math.max(-100, Math.min(100, fv))); }
          if (fc) {
            fd = { s: fs, m: fm, c: fc };
            var fb = Math.floor(+msg.fd.b); if (fb >= 1 && fb <= 3) fd.b = fb;   // facing: 1 = turned round, 2 = a quarter turn right, 3 = a quarter turn left
            if (Array.isArray(msg.fd.h) && msg.fd.h.length === 2) {
              var hh = msg.fd.h.map(function (v) { return v === null || v === undefined || !isFinite(+v) ? null : Math.max(-400, Math.min(400, Math.round(+v))); });
              if (hh[0] !== null || hh[1] !== null) fd.h = hh;
            }
          }
        }
      }
      var pv = rooms[ws.room].viewers.get(ws.viewerId);
      if (pv) { pv.pose = a; pv.combo = combo; pv.fd = fd; var prd = rooms[ws.room].round; if (prd && prd.phase === "play") pv.danced = true; }
      var pm = { type: "pose", id: ws.viewerId, a: a, c: combo }; if (fd) pm.fd = fd;
      /* on the roller rink: height in the air (0-60), a wipe-out, the trick (0-4) */
      if (msg.sk && typeof msg.sk === "object") pm.sk = { h: intIn(msg.sk.h, 0, 60, 0), f: msg.sk.f ? 1 : 0, t: intIn(msg.sk.t, 0, 9, 0) };
      broadcast(ws.room, pm, ws);
      return;
    }
    if (msg.type === "score") {
      // a dancer's own running score for the current step or target round
      var srd = rooms[ws.room].round, sv = rooms[ws.room].viewers.get(ws.viewerId);
      if (!srd || !sv || srd.mode === "free" || srd.mode === "ctf" || (srd.phase !== "play" && srd.phase !== "tally") || (!msg.fin && !allow(ws, "score", 6, 2))) return;
      var arrows = srd.chart ? srd.chart.arrows : 20000;
      sv.roundScore = intIn(msg.s, 0, srd.mode === "mosh" || srd.mode === "skate" || srd.mode === "keepy" || srd.mode === "kart" || srd.mode === "pipe" || srd.mode === "ski" ? 400000 : Math.round(arrows * 100 * (1 + arrows / 100)), 0);   // no higher than a perfect run
      /* dance walk race: the server keeps the finish order so every screen agrees on the places;
         over the line = 1000 + 3000 / place, still racing = distance (up to 1000). When everyone's in, the round ends. */
      if (srd.mode === "walk") {
        if (msg.fin && !sv.walkFin) { sv.walkFin = true; (srd.wfin || (srd.wfin = [])).push(ws.viewerId || ""); sv.roundScore = 1000 + Math.round(3000 / srd.wfin.length); }
        else if (sv.walkFin) sv.roundScore = Math.max(sv.roundScore, 1000);
        else sv.roundScore = Math.min(1000, sv.roundScore);
        var racers = 0, done = 0, wcode = ws.room; rooms[wcode].viewers.forEach(function(v) { if (v.dance === 4) { racers++; if (v.walkFin) done++; } });
        if (racers && done >= racers && !srd.walkEnd) srd.walkEnd = setTimeout(function() { if (rooms[wcode] && rooms[wcode].round === srd) roundFinish(wcode); }, 3500);
      }
      if (srd.battle && msg.m !== undefined) {
        /* a battle match score: only from the two in the match that's on */
        var bk = battleNow(srd), bs = srd.battle.slots[msg.m | 0], be = srd.battle.entrants;
        if (bk === (msg.m | 0) && bs && bs.w < 0) {
          if (bs.a >= 0 && be[bs.a].id === ws.viewerId) bs.sa = sv.roundScore;
          else if (bs.b >= 0 && be[bs.b].id === ws.viewerId) bs.sb = sv.roundScore;
          else return;
          var bm = { type: "bscore", n: srd.n, m: bk, sa: bs.sa, sb: bs.sb }; broadcast(ws.room, bm); if (rooms[ws.room].performer) send(rooms[ws.room].performer, bm);
        }
      }
      return;
    }
    if (msg.type === "tug") {
      /* the mosh pit's wall of death: taps for one side of the tug of war, counted only while it's on */
      var trd = rooms[ws.room].round; if (!trd || trd.mode !== "mosh" || trd.phase !== "play" || !trd.chart || !trd.chart.drop || trd.tug.done) return;
      var tp = Date.now() - trd.playAt, t0 = trd.chart.drop + TUG_AT;
      if (tp < t0 - 400 || tp > t0 + TUG_MS + 400 || !allow(ws, "tug", 12, 7)) return;
      var side = msg.side === 1 ? 1 : 0, tn = intIn(msg.k, 0, 6, 0); if (!tn) return;
      trd.tug.s[side] += tn;
      if (!trd.tugSend) trd.tugSend = setTimeout(function() { trd.tugSend = null; var m = { type: "tug", n: trd.n, s: trd.tug.s }; broadcast(ws.room, m); }, 200);
      return;
    }
    if (msg.type === "vote") { castVote(ws, ws.viewerId, msg.id, 1); return; }
    if (msg.type === "gvote-pick") { if (allow(ws, "gv", 10, 2)) gvotePick(ws.room, ws.viewerId, msg.m); return; }
    if (msg.type === "svote-pick") { if (allow(ws, "sv", 10, 2)) svotePick(ws.room, ws.viewerId, msg.k); return; }
    if (msg.type === "ctf-act") {   /* Kart Flag: the pulse, or using your item */
      var ard = rooms[ws.room] && rooms[ws.room].round, ac = ard && ard.ctf;
      if (!ac || !ac.kart || ard.phase !== "play" || !allow(ws, "ctfact", 4, 2)) return;
      var aev = msg.a === "pulse" ? CTF.pulse(ac.st, ac.I, ws.viewerId, Date.now()) : msg.a === "use" ? CTF.use(ac.st, ac.I, ws.viewerId, Date.now()) : [];
      if (aev.length) { for (var asid in ac.st.score) { var asv = rooms[ws.room].viewers.get(asid); if (asv) { asv.roundScore = ac.st.score[asid]; asv.danced = true; } } var am = ctfPublic(ac); delete am.map; am.type = "ctf"; am.ev = aev; broadcast(ws.room, am); }
      return;
    }
    if (msg.type === "bvote") { if (allow(ws, "bvote", 6, 2)) battleVote(ws, ws.viewerId, msg.side, 1); return; }
    return; // anything else from a viewer is dropped (it used to be relayed to the whole room as-is)
  }
}
function onClose(ws) {
  if (!ws.room) return;
  /* leaving drops you out of voice */
  var vr0 = rooms[ws.room], vid0 = ws.role === "performer" ? "performer" : ws.viewerId;
  if (vr0 && vr0.voice && vid0 && vr0.voice[vid0]) { delete vr0.voice[vid0]; broadcast(ws.room, { type: "voice-off", id: vid0 }, ws); }
  if (ws.role === "performer" && rooms[ws.room] && rooms[ws.room].performer === ws) {
    /* a blip: keep the room (audience, round, scores) for a minute so the performer's page can reconnect */
    var code = ws.room, r0 = rooms[code];
    r0.performer = null;
    if (ws.ending) { r0.goneT && clearTimeout(r0.goneT); broadcast(code, { type: "performer-left" }); roundStop(r0); BOTS.stopRoom(code); delete rooms[code]; return; }   /* they pressed Stop */
    broadcast(code, { type: "performer-away" });
    console.log("Performer dropped, holding room", code, "for", PERFORMER_GRACE / 1000, "s");
    if (r0.goneT) clearTimeout(r0.goneT);
    r0.goneT = setTimeout(function() {
      var r1 = rooms[code]; if (!r1 || r1.performer) return;
      broadcast(code, { type: "performer-left" });
      console.log("Performer did not come back, closing room", code);
      roundStop(r1);
      BOTS.stopRoom(code);
      delete rooms[code];
    }, PERFORMER_GRACE);
  }
  if (ws.role === "viewer" && rooms[ws.room]) {
    rooms[ws.room].viewers.delete(ws.viewerId);
    broadcast(ws.room, { type: "viewer-leave", id: ws.viewerId });
    var r = rooms[ws.room];
    if (r && r.performer) send(r.performer, { type: "viewer-count", count: r.viewers.size });
    if (r && r.botFill && !ws.bot) { var lc = ws.room; setImmediate(function() { BOTS.rebalance(lc); }); }   /* someone left: a bot can take their place */
  }
}

/* bots that keep the room at the size the performer chose (see bots.js) */
var BOTS = require("./bots.js")({ rooms: rooms, onMessage: onMessage, onClose: onClose, send: send });

wss.on("connection", function(ws) {
  ws.isAlive = true;
  ws.on("pong", function() { ws.isAlive = true; });
  ws.on("error", function() {});

  ws.on("message", function(raw, isBinary) { onMessage(ws, raw, isBinary); });

  ws.on("close", function() { onClose(ws); });
});

// Heartbeat — drop dead connections
var hb = setInterval(function() {
  wss.clients.forEach(function(ws) {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", function() { clearInterval(hb); });

server.listen(PORT, function() {
  console.log("Unholy Keys relay server running on port " + PORT);
  if (fs.existsSync(path.join(WEB_ROOT, "index.html"))) {
    console.log("  Performer page:  http://localhost:" + PORT + "/");
    console.log("  Audience page:   http://localhost:" + PORT + "/venue.html");
  }
  console.log("  Health check:    http://localhost:" + PORT + "/health");
});

/* Tell each performer how much stream data their show has sent, so they can watch their bandwidth. */
setInterval(function() {
  Object.keys(rooms).forEach(function(k) {
    var r = rooms[k];
    if (r.performer && r.bytesOut !== r._lastReported) { r._lastReported = r.bytesOut; send(r.performer, { type: "stream-stats", bytesOut: r.bytesOut || 0, viewers: r.viewers.size }); }
  });
}, 5000);
