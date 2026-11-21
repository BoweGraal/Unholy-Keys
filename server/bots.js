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
var LOOK_COUNTS = [6, 8, 10, 5, 12, 3, 12, 5], ARTX = null;
try {
  var ctx = { window: {}, document: { createElement: function() { return { getContext: function() { return null; } }; } }, Math: Math, Date: Date };
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "art.js"), "utf8"), ctx);
  var A = ctx.window.ART || ctx.ART; ARTX = A; if (A && A.looks) LOOK_COUNTS = A.looks.KEYS.map(function(k) { return A.looks.count(k); });
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
    var free = !rd || (playing && (rd.mode === "free" || rd.mode === "keepy"));
    if (playing && rd.mode === "skate") { skate(b, now); }
    if (playing && rd.mode === "kart") { kart(b, now, rd); }
    if (playing && rd.mode === "walk") { walk(b, now, rd); }
    if (playing && rd.mode === "pipe") { pipe(b, now, rd); }
    if (playing && rd.mode === "ski") { ski(b, now, rd); }
    if (playing && rd.mode === "mosh") { mosh(b, now, rd); }
    if (playing && rd.mode === "ctf") { ctf(b, now, rd); }
    if (playing && rd.mode === "keepy") { if (!b.hopAt && Math.random() < 0.05) b.hopAt = now; var hu = b.hopAt ? (now - b.hopAt) / 900 : 0; if (hu >= 1) { b.hopAt = 0; hu = 0; } b.skH = b.hopAt ? Math.round(24 * 4 * hu * (1 - hu)) : 0; }

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
    var style = rd.mode === "free" || rd.mode === "mosh" || rd.mode === "skate" || rd.mode === "keepy" || rd.mode === "kart" || rd.mode === "walk" || rd.mode === "pipe" || rd.mode === "ski" || rd.mode === "ctf" || rd.battle ? 4 : 5;
    if (!b.dancing || b.style !== style) { b.dancing = true; b.style = style; b.act({ type: "dance", style: style }); }
    pose(b, now, bpm);
    var slot = -1, bs = rd.b && rd.b.slots, be = rd.b && rd.b.entrants;
    if (bs && be) for (var k = 0; k < bs.length; k++) {
      var s = bs[k]; if (s.w >= 0 || pos < s.start || pos > s.end) continue;
      if ((s.a >= 0 && be[s.a] && be[s.a].id === b.viewerId) || (s.b >= 0 && be[s.b] && be[s.b].id === b.viewerId)) slot = k;
      else if (rd.mode === "free" && !b.bvoted[k] && pos > s.start + rnd(3000, (s.end - s.start) * 0.8)) { b.bvoted[k] = 1; b.act({ type: "bvote", side: Math.random() < 0.5 ? 0 : 1 }); }
    }
    if (rd.mode !== "free" && rd.mode !== "walk" && rd.mode !== "ski" && rd.mode !== "pipe" && rd.mode !== "mosh" && rd.mode !== "ctf" && now > b.scoreAt) {
      /* a score that grows through the song at this bot's skill */
      if (b.rs0n !== rd.n) { b.rs0n = rd.n; b.rs0 = pos; b.score = 0; }   /* a game can start part way into the song (two games per song) */
      var arrows = ch && ch.arrows || 200, dur = ch && ch.dur || 180000, frac = Math.max(0, Math.min(1, (pos - b.rs0) / Math.max(60000, Math.min(150000, dur - b.rs0))));
      var full = rd.mode === "mosh" || rd.mode === "skate" || rd.mode === "kart" || rd.mode === "pipe" ? 60000 : rd.mode === "keepy" ? 8000 : arrows * 100 * (1 + arrows / 100) * 0.55;
      b.score = Math.max(b.score || 0, Math.round(full * frac * b.skill * rnd(0.9, 1.1)));
      var sm = { type: "score", s: b.score }; if (slot >= 0) sm.m = slot;
      b.act(sm); b.scoreAt = now + 2000;
    }
    /* the wall of death: push for your side */
    if (rd.mode === "mosh" && ch && ch.drop && pos > ch.drop + 900 && pos < ch.drop + 10600 && now > b.tugAt) {
      var tk = Math.ceil(rnd(1, 4) * b.skill * 2); b.act({ type: "tug", side: b.x < 0.5 ? 0 : 1, k: tk }); b.tugAt = now + rnd(250, 600); if (b.ms) b.ms.taps += tk;
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
  /* Mars Rally: wait on the dance floor through the intro, then ride the same track the players see, at this bot's own pace */
  var KG = null; try { KG = require("../kart.js").geo; } catch (e) {}
  function kart(b, now, rd) {
    if (!KG) return; if (!b.ktr || b.ktr.n !== rd.n) b.ktr = { n: rd.n, tr: KG.trackFor(rd.n, rd.track) }; var tr = b.ktr.tr;
    if (!b.kt || b.kt.n !== rd.n) { var g = KG.gridSlot(tr, Math.floor(Math.random() * 15)); b.kt = { n: rd.n, d: g.d, lat: g.lat, sp: 0.62 + Math.random() * 0.3, ph: Math.random() * 6, t: now, posAt: 0, pop: now + 5800, go: now + 9900 }; }
    var k = b.kt, dt = Math.min(0.5, (now - k.t) / 1000); k.t = now;
    if (now < k.pop) { b.kf = 0; b.kh = 0; return; }
    b.kf = 1; var racing = now >= k.go; if (!racing) dt = 0;
    var spd = racing ? KG.DEF.maxSpeed * k.sp : 0; k.d += spd * dt; k.lat += (Math.sin(now / 900 + k.ph) * tr.hw * 0.5 - k.lat) * Math.min(1, dt * 2);
    var pa = KG.pointAt(tr, k.d, 0).a; b.kh = ((Math.round(pa / (Math.PI / 8)) % 16) + 16) % 16;
    if (now - k.posAt > 120) { k.posAt = now; var p = KG.pointAt(tr, k.d, k.lat), e = KG.enc(p.x, p.y); b.x = +e[0].toFixed(4); b.y = +e[1].toFixed(4); b.act({ type: "pos", x: b.x, y: b.y }); }
  }
  /* the dance walk race: line up in the same lane the players' screens use, wait for GO (beat 8), then dance-walk
     to the finish at this bot's pace, losing the circle now and then (slower) and tripping once in a while.
     The style order and lanes match venue.html's WALK exactly. */
  var WK = { X0: 0.06, X1: 0.68, Y0: 0.35, Y1: 0.73, GO: 8, SEG: 8, D: [1, 11, 9, 3, 4, 6] };
  function wkOrder(n) { var o = [0, 1, 2, 3, 4, 5], s = (n * 9301 + 49297) % 233280; for (var i = o.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; var j = Math.floor(s / 233280 * (i + 1)), t = o[i]; o[i] = o[j]; o[j] = t; } return o; }
  function wkBeat(rd, pos) {
    var c = rd.chart, bs = c && c.beats, per = c && c.bpm ? 60000 / c.bpm : 500;
    if (!bs || bs.length < 2) return pos / per;
    if (pos <= bs[0]) return (pos - bs[0]) / per;
    var n = bs.length; if (pos >= bs[n - 1]) return n - 1 + (pos - bs[n - 1]) / per;
    var lo = 0, hi = n - 1; while (hi - lo > 1) { var m = (lo + hi) >> 1; if (bs[m] <= pos) lo = m; else hi = m; }
    return lo + (pos - bs[lo]) / Math.max(1, bs[hi] - bs[lo]);
  }
  function walk(b, now, rd) {
    var r = rooms[b.room]; if (!r) return;
    if (!b.wk || b.wk.n !== rd.n) {
      var ids = Array.from(r.viewers.keys()).sort(), i = Math.max(0, ids.indexOf(b.viewerId)), nl = Math.max(4, Math.min(8, ids.length));
      b.wk = { n: rd.n, x: WK.X0, y: WK.Y0 + ((i % nl) + 0.5) / nl * (WK.Y1 - WK.Y0), sp: 0.6 + 0.35 * b.skill, ph: Math.random() * 6, t: now, trip: 0, fin: false, posAt: 0, scoreAt: 0, order: wkOrder(rd.n), si: 0 };
    }
    var w = b.wk, dt = Math.min(0.5, (now - w.t) / 1000); w.t = now;
    var beat = wkBeat(rd, now - rd.playAt), going = beat >= WK.GO;
    w.si = w.order[Math.max(0, Math.floor((beat - WK.GO) / WK.SEG)) % 6];
    if (going && !w.fin) {
      var f = Math.max(0.3, Math.min(1, w.sp + 0.25 * Math.sin(now / 1100 + w.ph)));
      if (!w.trip && Math.random() < dt * 0.05 * (1.2 - w.sp)) w.trip = now + 1300;
      if (w.trip && now > w.trip) w.trip = 0;
      if (!w.trip) w.x += (WK.X1 - WK.X0) / 40 * f * dt;
      if (w.x >= WK.X1) { w.x = WK.X1; w.fin = true; b.act({ type: "score", s: 4000, fin: 1 }); }
      else if (now > w.scoreAt) { w.scoreAt = now + 2000; b.act({ type: "score", s: Math.round(1000 * (w.x - WK.X0) / (WK.X1 - WK.X0)) }); }
    }
    if (now - w.posAt > 150) { w.posAt = now; b.x = +w.x.toFixed(4); b.y = +w.y.toFixed(4); b.act({ type: "pos", x: b.x, y: b.y }); }
  }
  /* the half pipe: roll at its own pace, build momentum on the beat, pop at the lip with a dance trick and a spin, mostly land it.
     Sends where it is (x), how high (z) and how far it's spun (r) with each position, like the players do. */
  var PPD = [0, 11, 10, 6, 9];
  function pipe(b, now, rd) {
    var PPA = ARTX && ARTX.PIPE, r0 = rooms[b.room];
    if (!b.pp || b.pp.n !== rd.n) b.pp = { n: rd.n, phi: Math.random() * 6, A: 0.3, air: null, r: 0, bail: 0, lb: -1, score: 0, posAt: 0, scoreAt: 0, t: now, pu: 0,
      lane: PPA && r0 ? PPA.group(Array.from(r0.viewers.keys()), b.viewerId).y : 0.6 };
    var p = b.pp, dt = Math.min(0.5, (now - p.t) / 1000); p.t = now;
    var bf = wkBeat(rd, now - rd.playAt);
    /* speed rolls up to cruising by itself; the lit boost pad (they take turns on the beat) adds more */
    if (!p.air && now > p.bail) { if (p.A < 1) p.A = Math.min(1, p.A + 0.14 * dt); else p.A = Math.max(1, p.A - 0.06 * dt); }
    if (PPA && !p.air && now > p.bail) {
      var uc = Math.min(0.995, p.A) * Math.sin(p.phi), live = PPA.livePad(bf + (Math.abs(uc) > 0.3 ? 0.5 : 0)), ty = Math.random() < b.skill + 0.2 ? PPA.padY(live) : p.lane;
      p.lane += Math.max(-0.42 * dt, Math.min(0.42 * dt, ty - p.lane));
      if (p.pu * uc < 0) { var lv = PPA.livePad(bf); if (Math.abs(p.lane - PPA.padY(lv)) < PPA.PAD_H / 2 * (PPA.Y1 - PPA.Y0) + 0.02) p.A = Math.min(1.8, p.A + 0.3); }
      p.pu = uc;
    }
    if (p.air) {
      p.r += p.air.spin * dt;
      if ((now - p.air.t0) / 1000 >= p.air.dur) {
        if (Math.random() < 0.5 + 0.45 * b.skill) { p.combo = (p.combo || 0) + 1; p.score += Math.round(([0, 250, 200, 200, 150][p.air.k] + 120 * Math.floor(Math.random() * 2) + 100 * Math.round(Math.abs(p.air.spin * p.air.dur) / 180)) * (1 + 0.6 * p.air.h) * (1 + 0.25 * Math.min(8, p.combo))); } else { p.bail = now + 1200; p.A *= 0.5; p.combo = 0; }
        p.phi = Math.PI - p.air.phi0; p.air = null; p.r = 0;
      }
    } else if (now > p.bail) {
      p.phi += Math.PI / 2.2 * dt; var u = Math.min(0.995, p.A) * Math.sin(p.phi);
      if (p.A >= 0.95 && Math.abs(u) > 0.9 && Math.cos(p.phi) * Math.sign(Math.sin(p.phi)) > 0 && Math.random() < 0.5) {
        var h = (p.A - 0.6) * (0.7 + Math.random() * 0.6), dur = Math.min(2.2, 0.6 + 0.9 * h);
        p.air = { t0: now, dur: dur, h: Math.min(1.4, h), side: Math.sign(Math.sin(p.phi)), k: 1 + Math.floor(Math.random() * 4), phi0: p.phi, spin: [0, 180, 360][Math.floor(Math.random() * 3)] / dur * (Math.random() < 0.5 ? -1 : 1) };
      }
    }
    if (now - p.posAt > 150) {
      p.posAt = now; var uu = p.air ? p.air.side : Math.min(0.995, p.A) * Math.sin(p.phi), z = p.air ? Math.sin(Math.PI * Math.min(1, (now - p.air.t0) / 1000 / p.air.dur)) * p.air.h / 1.4 : 0;
      b.x = +(0.5 + uu * 0.46).toFixed(4); b.y = +p.lane.toFixed(4); b.act({ type: "pos", x: b.x, y: b.y, z: +z.toFixed(3), r: Math.round(p.r) });
    }
    if (now > p.scoreAt) { p.scoreAt = now + 2000; b.act({ type: "score", s: p.score }); }
  }
  /* ski: start in a lane at the top, then (from beat 8) follow the slalom line down at this bot's pace, sometimes crashing.
     The course's line, lanes and position encoding match venue.html's SKI exactly. */
  function skiHalfW(y) { return 110 + Math.min(1, Math.max(0, y) / 650) * 560; }
  function skiLine(y, sd) { return Math.sin(y / 620 + sd) * skiHalfW(y) * 0.42 + Math.sin(y / 233 + sd * 2) * 40 * Math.min(1, y / 650); }
  /* with a designer course: the line through its gates (matches ART.SKI.lineAt) */
  function skiLineAt(course, y, sd) {
    if (!course) return skiLine(y, sd); var gs = course.objs.filter(function(q) { return q[0] === "gate"; }); if (!gs.length) return 0;
    var L = course.len, m = ((y % L) + L) % L, prev = gs[gs.length - 1], pY = prev[2] - L, next = gs[0], nY = next[2];
    for (var i = 0; i < gs.length; i++) { if (gs[i][2] > m) { next = gs[i]; nY = gs[i][2]; prev = i ? gs[i - 1] : gs[gs.length - 1]; pY = i ? gs[i - 1][2] : gs[gs.length - 1][2] - L; break; } if (i === gs.length - 1) { prev = gs[i]; pY = gs[i][2]; next = gs[0]; nY = gs[0][2] + L; } }
    var t = (m - pY) / Math.max(1, nY - pY); t = t * t * (3 - 2 * t); return prev[1] + (next[1] - prev[1]) * t;
  }
  function ski(b, now, rd) {
    var r = rooms[b.room]; if (!r) return;
    if (!b.sk2 || b.sk2.n !== rd.n) {
      var ids = Array.from(r.viewers.keys()).sort(), i = Math.max(0, ids.indexOf(b.viewerId)), nl = Math.max(2, Math.min(8, ids.length));
      b.sk2 = { n: rd.n, seed: 1 + (rd.n * 37) % 997, x: -85 + 170 * ((i % nl) + 0.5) / nl, y: -24, sp: 140 + 90 * b.skill, off: (Math.random() * 2 - 1) * 30, t: now, crash: 0, gates: 0, lastGate: 0, posAt: 0, scoreAt: 0, a: 0 };
    }
    var k = b.sk2, dt = Math.min(0.5, (now - k.t) / 1000); k.t = now;
    var going = wkBeat(rd, now - rd.playAt) >= 8;
    if (going && now > k.crash) {
      var ny = k.y + k.sp * dt, nx = skiLineAt(rd.ski, ny, k.seed) + k.off * Math.sin(now / 1500 + k.sp);
      k.a = Math.atan2(nx - k.x, ny - k.y); k.x += (nx - k.x) * Math.min(1, dt * 2.5); k.y = ny;
      if (Math.random() < dt * 0.04 * (1.3 - b.skill)) k.crash = now + 1400;
      var gi = Math.floor(k.y / 170); if (gi > k.lastGate && k.y >= 200) { k.lastGate = gi; if (Math.random() < 0.55 + 0.4 * b.skill) k.gates++; }
    }
    if (now - k.posAt > 150) { k.posAt = now; b.x = +((k.x + 800) / 1600).toFixed(4); b.y = +((((k.y % 1000) + 1000) % 1000) / 1000).toFixed(4); b.act({ type: "pos", x: b.x, y: b.y }); }
    if (going && now > k.scoreAt) { k.scoreAt = now + 2000; b.act({ type: "score", s: k.gates * 100 + Math.floor(Math.max(0, k.y) / 40) }); }
  }
  /* the mosh pit: the same plan as everyone's screen (art.js). Pit: thrash about in the middle, bumping people. Circle pit: run
     round it (laps score). Wall of death: off to your side, charge at the drop, pack in for the push war; the winning side scores big.
     Scores add up the way a player's do, so the leaderboard means something. */
  function mosh(b, now, rd) {
    var M = ARTX && ARTX.MOSH; if (!M) return;
    if (!b.ms || b.ms.n !== rd.n) b.ms = { n: rd.n, P: M.plan(rd.chart), score: 0, t: now, phi: Math.random() * 6.28, r: 0.13 + Math.random() * 0.15, acc: 0, team: -1, goal: null, posAt: 0, scoreAt: 0, bumpAt: now + rnd(2000, 5000), taps: 0, tapsPaid: 0, won: false, k: Math.max(0, Array.from((rooms[b.room] || { viewers: new Map() }).viewers.keys()).sort().indexOf(b.viewerId)) };
    var m = b.ms, dt = Math.min(0.5, (now - m.t) / 1000); m.t = now;
    var pos = now - rd.playAt, ph = M.phaseAt(m.P, pos), c = M.circle(M.TOP, M.BOT), x = b.x, y = b.y, sp = 0;
    if ((ph === "split" || ph === "count") && m.team < 0) m.team = m.k % 2;   /* bots spread over both sides */
    if (ph === "pit") m.team = -1;
    if (ph === "circle") {
      var om = 0.95 * (0.22 / m.r) * (0.8 + b.skill * 0.6); m.phi += om * dt; m.acc += om * dt;
      if (m.acc >= Math.PI * 2) { m.acc -= Math.PI * 2; m.score += 150; }
      x = c.x + Math.cos(m.phi) * m.r; y = c.y + Math.sin(m.phi) * m.r * (c.ry / 0.3);
      if (now > m.bumpAt) { m.bumpAt = now + rnd(2500, 6000) / (0.5 + b.skill); m.score += Math.random() < 0.5 ? 90 : 50; }
    } else if (ph === "split" || ph === "count") { x = (m.team ? 0.84 : 0.16) + ((m.k * 0.037) % 0.1 - 0.05); y = M.TOP + 0.04 + (m.k % 7) / 7 * (M.BOT - M.TOP - 0.08); }
    else if (ph === "charge") { x = m.team ? 0.545 + (m.k % 3) * 0.02 : 0.455 - (m.k % 3) * 0.02; }
    else if (ph === "tug") { var s = rd.tug ? rd.tug.s : [0, 0], fr = 0.5 + (s[0] + s[1] > 0 ? (s[0] - s[1]) / (s[0] + s[1]) : 0) * 0.2; x = fr + (m.team ? 1 : -1) * (0.028 + Math.floor((m.k + 1) / 3) * 0.04); y = (M.TOP + M.BOT) / 2 + (((m.k + 1) % 3) - 1) * 0.035;
      if (m.taps - m.tapsPaid >= 5) { m.score += 10 * Math.floor((m.taps - m.tapsPaid) / 5); m.tapsPaid += 5 * Math.floor((m.taps - m.tapsPaid) / 5); } }
    else if (ph === "result") { if (!m.won && rd.tug && rd.tug.done && m.team >= 0) { var s2 = rd.tug.s; m.won = true; if ((s2[1] > s2[0] ? 1 : 0) === m.team && s2[0] !== s2[1]) m.score += 800; } }
    else {
      /* the pit: short dashes about the middle of the floor, bumping and swinging */
      if (!m.goal || Math.random() < dt * 1.2) m.goal = [0.28 + Math.random() * 0.44, M.TOP + 0.03 + Math.random() * (M.BOT - M.TOP - 0.06)];
      x = b.x + (m.goal[0] - b.x) * Math.min(1, dt * 2.2); y = b.y + (m.goal[1] - b.y) * Math.min(1, dt * 2.2);
      if (now > m.bumpAt) { m.bumpAt = now + rnd(1800, 4500) / (0.5 + b.skill); m.score += Math.random() < 0.4 ? 60 : Math.random() < 0.5 ? 40 : 30; }
    }
    if (ph !== "circle" && ph !== "pit") { x = b.x + (x - b.x) * Math.min(1, dt * (ph === "charge" ? 4 : 1.6)); y = b.y + (y - b.y) * Math.min(1, dt * 1.6); }
    b.x = Math.max(0.03, Math.min(0.97, x)); b.y = Math.max(M.TOP, Math.min(M.BOT, y));
    if (now - m.posAt > 150) { m.posAt = now; b.act({ type: "pos", x: +b.x.toFixed(4), y: +b.y.toFixed(4) }); }
    if (now > m.scoreAt) { m.scoreAt = now + 2000; b.score = m.score; b.act({ type: "score", s: m.score }); }
    b.moshPh = ph;
  }
  /* capture the flag: the server's own game (rooms[...].round.ctf) tells the bot everything. Some go for the flag, some
     stay back to defend; carriers run home; anyone sees a thief on their side and chases. Boost pads shove them like players. */
  function ctf(b, now, rd) {
    var r = rooms[b.room], srd = r && r.round, C = ARTX && ARTX.CTF; if (!srd || !srd.ctf || !C) return;
    var c = srd.ctf, I = c.I, st = c.st, id = b.viewerId, t = C.teamOf(st, id);
    if (!b.cf || b.cf.n !== rd.n) { var sp = C.spawnOf(I, st, id), mates = Object.keys(st.teams).filter(function(k) { return st.teams[k] === t; }).sort();
      b.cf = { n: rd.n, x: sp[0], y: sp[1], t: now, wp: null, wpAt: 0, posAt: 0, tagSeen: 0, push: [0, 0], role: mates.indexOf(id) % 3 === 2 ? "d" : "a", jit: Math.random() * 6 }; }
    var k = b.cf, dt = Math.min(0.25, (now - k.t) / 1000); k.t = now;
    if (st.tagged[id] && st.tagged[id] !== k.tagSeen) { k.tagSeen = st.tagged[id]; var s2 = C.spawnOf(I, st, id); k.x = s2[0]; k.y = s2[1]; k.wp = null; k.push = [0, 0]; k.hold = now + 1500; }
    var going = wkBeat(rd, now - rd.playAt) >= 8 && !(k.hold && now < k.hold);
    if (going) {
      var goal = C.botGoal(st, I, id, k.x, k.y, k.role);
      if (!k.wp || now > k.wpAt) { k.wp = C.path(I, k.x, k.y, goal[0], goal[1]); k.wpAt = now + 250; }
      var av = C.botAvoid(st, I, id, k.x, k.y);
      var dx = k.wp[0] - k.x + av[0] * 1.6, dy = k.wp[1] - k.y + av[1] * 1.6, d = Math.hypot(dx, dy) || 1, sp2 = C.SPEED * (0.7 + 0.3 * b.skill) * (C.carrying(st, id) >= 0 ? C.CARRY : 1);
      var pd = I.pad(k.x, k.y); if (pd) { k.push = [pd[0] * C.SPEED * C.PAD, pd[1] * C.SPEED * C.PAD]; }
      C.move(I, k, (dx / d * sp2 + k.push[0]) * dt + Math.sin(now / 700 + k.jit) * 0.01, (dy / d * sp2 + k.push[1]) * dt);
      var dm = Math.pow(0.08, dt); k.push = [k.push[0] * dm, k.push[1] * dm];
    }
    if (now - k.posAt > 110) { k.posAt = now; b.x = +(k.x / I.w).toFixed(4); b.y = +(k.y / I.h).toFixed(4); b.act({ type: "pos", x: b.x, y: b.y }); }
  }
  /* a groove: arms and legs swinging on the beat, in this bot's own style (sent about five times a second) */
  function pose(b, now, bpm) {
    if (now - (b.poseAt || 0) < 190) return; b.poseAt = now;
    var beat = now / (60000 / (bpm || 120)) * b.groove, s = Math.sin(beat * Math.PI), c = Math.cos(beat * Math.PI * 0.5);
    var a = [Math.round((70 + 90 * b.arms * Math.abs(s)) * (c > 0 ? 1 : 1.6)), Math.round(-(70 + 90 * b.arms * Math.abs(Math.sin(beat * Math.PI + 1))) * (c > 0 ? 1.6 : 1)), Math.round(18 * s), Math.round(-18 * s)];
    var pm = { type: "pose", a: a, c: b.rd && b.rd.phase === "play" ? Math.floor((b.score || 0) / 900) % 60 : 0 };
    /* free dance: each bot has a favourite style (the shuffle's popular) and switches move now and then */
    if (b.rd && b.rd.mode === "free") { if (!b.fds || Math.random() < 0.01) { b.fds = Math.random() < 0.35 ? 9 : 1 + Math.floor(Math.random() * 15); b.fdm = Math.floor(Math.random() * 4); } pm.fd = { s: b.fds, m: b.fdm, c: [0, 0, 0, 0] }; }
    if (b.rd && b.rd.mode === "kart") { pm.sk = { h: b.kh || 0, f: b.kf ? 1 : 0, t: 0 }; pm.a = [210, -210, 25, -25]; }
    else if (b.rd && b.rd.mode === "ski" && b.sk2) { var cr = now < b.sk2.crash; pm.sk = { h: Math.max(0, Math.min(60, Math.floor(Math.max(0, b.sk2.y) / 1000))), f: cr ? 1 : 0, t: cr ? 9 : Math.max(0, Math.min(6, Math.round(b.sk2.a / (Math.PI / 6)) + 3)) }; pm.a = cr ? [260, -260, 120, -120] : [90, -90, 15, -15]; }
    else if (b.rd && b.rd.mode === "pipe" && b.pp) { var pa = b.pp.air; pm.sk = { h: 0, f: now < b.pp.bail ? 1 : 0, t: pa ? pa.k : 0 }; if (pa) pm.fd = { s: PPD[pa.k], m: 0, c: [0, 0, 0, 0] }; pm.a = now < b.pp.bail ? [260, -260, 120, -120] : pa ? [230, -230, 50, -50] : [120, -120, 35, -35]; }
    else if (b.rd && b.rd.mode === "walk" && b.wk) { pm.sk = { h: b.wk.fin ? 1 : 0, f: b.wk.trip ? 1 : 0, t: b.wk.si }; pm.fd = { s: b.wk.fin ? 14 : WK.D[b.wk.si], m: 0, c: [0, 0, 0, 0] }; }
    else if (b.rd && b.rd.mode === "mosh" && b.ms) { var mp = b.moshPh, sw = now / 180 + (b.ms.k || 0), sh = Math.sin(now / 55) * 7;
      pm.a = mp === "tug" ? (b.ms.team ? [89 + sh, 80 + sh, 9, -23] : [-80 - sh, -89 - sh, 23, -9]) : mp === "circle" ? [63 + Math.round(Math.sin(now / 110) * 29), -63 + Math.round(Math.sin(now / 110) * 29), Math.round(Math.sin(now / 90) * 34), -Math.round(Math.sin(now / 90) * 34)] : [Math.round((sw * 57.3) % 360), Math.round((sw * 57.3) % 360) - 180, 11, -11]; }
    else if (b.rd && (b.rd.mode === "skate" || b.rd.mode === "keepy")) { pm.sk = { h: b.skH || 0, f: 0, t: b.skT || 0 }; if (b.skH) pm.a = [240, -240, 100, -100]; }
    b.act(pm);
  }

  return { setFill: setFill, rebalance: rebalance, stopRoom: stopRoom, isBot: function(ws) { return !!(ws && ws.bot); } };
};
