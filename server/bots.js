/* ============================================================
   ROOM-FILLING BOTS
   The performer can keep the room lively when only a few people are in: "fill to N" keeps the room at N
   people (up to 8) by adding bots, and as real people join, bots leave to make room for them.

   A bot is an ordinary audience member as far as everyone else can tell (it joins, walks, talks, reacts,
   dances, plays rounds and votes), except its name carries a 🤖 so nobody mistakes it for a person. Each
   one has a pretend connection in this process: what the server would send it goes to its little brain,
   and what it does goes through the same message handling as a real person's, with the same limits.
   ============================================================ */
var fs = require("fs"), path = require("path"), vm = require("vm");

var NAMES = ["Rook", "Moth", "Vex", "Juno", "Kestrel", "Nyx", "Pike", "Sable", "Wren", "Ash", "Ember", "Quill", "Onyx", "Lark", "Fable", "Rune"];
var COLORS = ["#1D9E75", "#E0A030", "#8A6BD1", "#E05050", "#5F9EA0", "#3CB371", "#DB7093", "#5FB4F0"];
var MAX_FILL = 8;
var CHAT = {
  hang: ["yo!", "this place is sick", "who's up next?", "love this room", "hi everyone 👋", "anyone else here for the vibes", "the lights tho", "can we get a mosh pit later", "brb grabbing a drink", "this is my favourite spot"],
  song: ["this slaps", "🔥🔥🔥", "turn it up!", "ok this one's a banger", "encore!!", "vibing", "the drop is coming i can feel it", "LETS GOOO", "so good", "🎶"],
  round: ["let's dance", "ok i'm ready", "go go go", "i got this", "my feet hurt lol", "gg"],
  vote: ["tough choice", "everyone killed it", "voted!", "gg all"]
};
var REACTS = ["jump", "hearts", "clap", "whistle", "hearts", "clap"];

/* how many options each part of a character's look has (from art.js), so bots get proper random looks */
var LOOK_COUNTS = [6, 8, 10, 5, 12, 3, 12, 5];
try {
  var ctx = { window: {}, document: { createElement: function() { return { getContext: function() { return null; } }; } }, Math: Math, Date: Date };
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "art.js"), "utf8"), ctx);
  var A = ctx.window.ART || ctx.ART; if (A && A.looks) LOOK_COUNTS = A.looks.KEYS.map(function(k) { return A.looks.count(k); });
} catch (e) {}
function randomLook() { var B = "0123456789abcdefghijklmnopqrstuvwxyz"; return LOOK_COUNTS.map(function(n) { return B.charAt(Math.floor(Math.random() * n)); }).join(""); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function rnd(a, b) { return a + Math.random() * (b - a); }
/* BOTS_FAST=10 makes bots act ten times as often (for testing) */
var FAST = Math.max(1, +process.env.BOTS_FAST || 1);
function wait(a, b) { return rnd(a, b) / FAST; }

module.exports = function(api) {
  /* api: rooms, onMessage(ws, raw, isBinary), onClose(ws), send(ws, msg) */
  var rooms = api.rooms;

  function realCount(r) { var n = 0; r.viewers.forEach(function(v) { if (!(v.ws && v.ws.bot)) n++; }); return n; }
  function botsIn(r) { var out = []; r.viewers.forEach(function(v) { if (v.ws && v.ws.bot) out.push(v.ws); }); return out; }

  function makeBot(code, r) {
    var used = {}; r.viewers.forEach(function(v) { used[v.name] = 1; });
    var base = NAMES.filter(function(n) { return !used["🤖 " + n]; }), name = "🤖 " + (base.length ? pick(base) : pick(NAMES));
    var b = { bot: true, readyState: 1, isAlive: true, skill: rnd(0.25, 0.62), chat: rnd(0.5, 1.4), groove: rnd(0.7, 1.3), arms: rnd(0.6, 1.4),
      x: 0.5, y: 0.55, rd: null, lastNote: 0, nextMove: 0, nextChat: 0, nextReact: 0, nextDance: 0, dancing: false, danceUntil: 0, voted: -1, bvoted: {}, scoreAt: 0, tugAt: 0 };
    b.terminate = b.ping = function() {};
    b.send = function(data) { try { hear(b, JSON.parse(data)); } catch (e) {} };
    b.act = function(msg) { if (b.room && rooms[b.room]) api.onMessage(b, Buffer.from(JSON.stringify(msg)), false); };
    var now = Date.now();
    b.nextMove = now + wait(1000, 5000); b.nextChat = now + wait(15000, 45000) / b.chat; b.nextReact = now + wait(5000, 15000); b.nextDance = now + wait(8000, 30000);
    api.onMessage(b, Buffer.from(JSON.stringify({ type: "join-room", room: code, name: name, color: pick(COLORS), look: randomLook() })), false);
    if (!b.viewerId) return null;
    var me = r.viewers.get(b.viewerId); if (me) { b.x = me.x; b.y = me.y; }
    b.timer = setInterval(function() { think(b); }, 200);
    return b;
  }
  function removeBot(b) { clearInterval(b.timer); b.dead = true; api.onClose(b); }

  /* keep the room at `fill` people: add bots while there's room, remove them as real people arrive */
  function rebalance(code) {
    var r = rooms[code]; if (!r) return;
    var fill = r.botFill || 0, real = realCount(r), bots = botsIn(r), want = Math.max(0, Math.min(MAX_FILL, fill - real));
    if (!fill) want = 0;
    while (bots.length > want) removeBot(bots.pop());
    var tries = 0;
    while (bots.length < want && tries++ < MAX_FILL) { var nb = makeBot(code, r); if (!nb) break; bots.push(nb); }
    if (r.performer) api.send(r.performer, { type: "bots-info", fill: fill, bots: bots.length, real: real });
  }
  function setFill(code, n) {
    var r = rooms[code]; if (!r) return;
    n = Math.floor(+n); r.botFill = isFinite(n) ? Math.max(0, Math.min(MAX_FILL, n)) : 0;
    rebalance(code);
  }
  function stopRoom(code) { var r = rooms[code]; if (!r) return; botsIn(r).forEach(function(b) { clearInterval(b.timer); b.dead = true; }); }

  /* ---- what a bot hears ---- */
  function hear(b, m) {
    if (!m || b.dead) return;
    if (m.type === "room-state" && m.round) hear(b, m.round);
    if (m.type === "note") b.lastNote = Date.now();
    if (m.type === "round") {
      if (m.phase === "countdown" || m.phase === "play" || m.phase === "vote" || m.phase === "tally") {
        var fresh = !b.rd || b.rd.n !== m.n;
        if (fresh) { b.rd = { n: m.n }; b.voted = -1; b.bvoted = {}; b.score = 0; }
        var rd = b.rd; rd.phase = m.phase; rd.mode = m.mode || rd.mode; rd.battle = !!m.battle; if (m.chart) rd.chart = m.chart;
        if (m.phase === "play") { rd.playAt = Date.now() - (+m.pos || 0); if (m.b) rd.b = m.b; }
        if (m.phase === "vote") { rd.dancers = m.dancers || []; rd.voteAt = Date.now() + rnd(2000, 9000); }
        if (fresh && Math.random() < 0.35) setTimeout(function() { say(b, pick(CHAT.round)); }, rnd(800, 5000));
      } else { endRound(b); }
    }
    if (m.type === "battle" && b.rd && m.b) b.rd.b = m.b;
  }
  function endRound(b) {
    if (b.rd && b.dancing) { b.act({ type: "dance", style: 0 }); b.dancing = false; }
    b.rd = null;
  }
  /* say something, unless another bot here said the same thing in the last couple of minutes */
  function say(b, t) {
    var r = rooms[b.room]; if (b.dead || !r) return;
    var now = Date.now(), said = r.botSaid || (r.botSaid = []);
    while (said.length && now - said[0].t > 120000) said.shift();
    if (said.some(function(x) { return x.text === t; })) return;
    said.push({ text: t, t: now }); b.act({ type: "chat", text: t });
  }

  /* ---- what a bot does, five times a second ---- */
  function think(b) {
    if (b.dead || !b.room || !rooms[b.room]) { clearInterval(b.timer); return; }
    var now = Date.now(), rd = b.rd, playing = rd && rd.phase === "play", songOn = playing || now - b.lastNote < 4000;
    var free = !rd || (playing && (rd.mode === "free" || rd.mode === "mosh"));
    if (playing && rd.mode === "skate") { skate(b, now); }

    /* wander about (not while playing a step, target or highway round: they're busy with the game) */
    if (free && now > b.nextMove && !(b.dancing && Math.random() < 0.7)) {
      b.x = Math.max(0.06, Math.min(0.94, b.x + rnd(-0.25, 0.25))); b.y = Math.max(0.38, Math.min(0.66, b.y + rnd(-0.12, 0.12)));
      b.act({ type: "pos", x: +b.x.toFixed(3), y: +b.y.toFixed(3) });
      b.nextMove = now + wait(3000, 10000);
    }
    /* talk now and then (less during a round) */
    if (now > b.nextChat) {
      var lines = rd && rd.phase === "vote" ? CHAT.vote : songOn ? CHAT.song : CHAT.hang;
      if (!playing || Math.random() < 0.3) say(b, pick(lines));
      b.nextChat = now + wait(50000, 150000) / b.chat;
    }
    /* react while music is on */
    if (songOn && now > b.nextReact) { b.act({ type: "react", k: pick(REACTS) }); b.nextReact = now + wait(7000, 22000); }

    if (playing) round(b, now);
    else if (!rd) {
      /* between songs: sometimes free dance for a while */
      if (!b.dancing && now > b.nextDance && Math.random() < (songOn ? 0.5 : 0.25)) { b.dancing = true; b.danceUntil = now + wait(12000, 35000); b.act({ type: "dance", style: 4 }); }
      if (b.dancing && now > b.danceUntil) { b.dancing = false; b.act({ type: "dance", style: 0 }); b.nextDance = now + wait(15000, 50000); }
      if (b.dancing) pose(b, now, 120);
    }
    if (rd && rd.phase === "vote" && b.voted !== rd.n && now > rd.voteAt) {
      var others = (rd.dancers || []).filter(function(d) { return d.id !== b.viewerId; });
      if (others.length) b.act({ type: "vote", id: pick(others).id });
      b.voted = rd.n;
    }
  }
  /* in a round: dance along, report a score (bots are decent, rarely great), vote in battles, push in the mosh */
  function round(b, now) {
    var rd = b.rd, pos = now - rd.playAt, ch = rd.chart, bpm = ch && ch.bpm || 120;
    var style = rd.mode === "free" || rd.mode === "mosh" || rd.mode === "skate" || rd.battle ? 4 : 5;
    if (!b.dancing || b.style !== style) { b.dancing = true; b.style = style; b.act({ type: "dance", style: style }); }
    pose(b, now, bpm);
    var slot = -1, bs = rd.b && rd.b.slots, be = rd.b && rd.b.entrants;
    if (bs && be) for (var k = 0; k < bs.length; k++) {
      var s = bs[k]; if (s.w >= 0 || pos < s.start || pos > s.end) continue;
      if ((s.a >= 0 && be[s.a] && be[s.a].id === b.viewerId) || (s.b >= 0 && be[s.b] && be[s.b].id === b.viewerId)) slot = k;
      else if (rd.mode === "free" && !b.bvoted[k] && pos > s.start + rnd(3000, (s.end - s.start) * 0.8)) { b.bvoted[k] = 1; b.act({ type: "bvote", side: Math.random() < 0.5 ? 0 : 1 }); }
    }
    if (rd.mode !== "free" && now > b.scoreAt) {
      /* a score that grows through the song at this bot's skill */
      var arrows = ch && ch.arrows || 200, dur = ch && ch.dur || 180000, frac = Math.max(0, Math.min(1, pos / dur));
      var full = rd.mode === "mosh" || rd.mode === "skate" ? 60000 : arrows * 100 * (1 + arrows / 100) * 0.55;
      b.score = Math.max(b.score || 0, Math.round(full * frac * b.skill * rnd(0.9, 1.1)));
      var sm = { type: "score", s: b.score }; if (slot >= 0) sm.m = slot;
      b.act(sm); b.scoreAt = now + 2000;
    }
    /* the wall of death: push for your side */
    if (rd.mode === "mosh" && ch && ch.drop && pos > ch.drop + 900 && pos < ch.drop + 10600 && now > b.tugAt) {
      b.act({ type: "tug", side: b.x < 0.5 ? 0 : 1, k: Math.ceil(rnd(1, 4) * b.skill * 2) }); b.tugAt = now + rnd(250, 600);
    }
  }
  /* the roller rink: laps round the island, a jump with a trick now and then */
  function skate(b, now) {
    if (!b.sk) b.sk = { a: Math.random() * 6.283, r: rnd(0.35, 0.85), dir: Math.random() < 0.5 ? 1 : -1, air: 0, posAt: 0 };
    var s = b.sk, dt = 0.2;
    s.a += s.dir * dt * 0.55 * (0.6 + b.skill);
    if (now - s.posAt > 180) { s.posAt = now; var cy = 0.56, rx = 0.13 + 0.32 * s.r, ry = 0.06 + 0.14 * s.r;
      b.x = +(0.5 + Math.cos(s.a) * rx).toFixed(3); b.y = +(cy + Math.sin(s.a) * ry).toFixed(3); b.act({ type: "pos", x: b.x, y: b.y }); }
    if (!s.air && Math.random() < 0.02) s.air = now;
    var u = s.air ? (now - s.air) / 1300 : 0; if (u >= 1) { s.air = 0; u = 0; }
    b.skH = s.air ? Math.round(26 * 4 * u * (1 - u)) : 0; b.skT = s.air ? 1 + (Math.floor(s.a * 3) % 4 + 4) % 4 : 0;
  }
  /* a groove: arms and legs swinging on the beat, in this bot's own style (sent about five times a second) */
  function pose(b, now, bpm) {
    if (now - (b.poseAt || 0) < 190) return; b.poseAt = now;
    var beat = now / (60000 / (bpm || 120)) * b.groove, s = Math.sin(beat * Math.PI), c = Math.cos(beat * Math.PI * 0.5);
    var a = [Math.round((70 + 90 * b.arms * Math.abs(s)) * (c > 0 ? 1 : 1.6)), Math.round(-(70 + 90 * b.arms * Math.abs(Math.sin(beat * Math.PI + 1))) * (c > 0 ? 1.6 : 1)), Math.round(18 * s), Math.round(-18 * s)];
    var pm = { type: "pose", a: a, c: Math.floor((b.score || 0) / 900) % 60 };
    if (b.rd && b.rd.mode === "skate") { pm.sk = { h: b.skH || 0, f: 0, t: b.skT || 0 }; if (b.skH) pm.a = [240, -240, 100, -100]; }
    b.act(pm);
  }

  return { setFill: setFill, rebalance: rebalance, stopRoom: stopRoom, isBot: function(ws) { return !!(ws && ws.bot); } };
};
