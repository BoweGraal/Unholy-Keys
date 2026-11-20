/* ============================================================================
   MARS RALLY: the kart mini game (top-down, SNES Mario Kart meets Biker Mice from Mars).
   The performer sits in the top-left corner; everyone else rides bikes round a Martian track.
   Two halves:
     KART.geo   pure maths (tracks, projection, grid), no screen needed. The server's practice bots use it too.
     KART       the game itself (physics, drawing, HUD), which the venue page plugs into with KART.bind({...}).
   World is always 1000 x 620 units. Positions travel as 0..1 of that world, so every screen agrees.
   ========================================================================== */
(function (root) {
  "use strict";
  var WW = 1000, WH = 620;

  /* ---- numbers you can tweak in the Tuning lab (the lab's group "kt"); these are the fallbacks ---- */
  var DEF = { maxSpeed: 135, accel: 120, brake: 240, drag: 0.6, offSpeed: 0.45, turn: 2.4, grip: 0.002, driftGrip: 0.3, driftTurn: 1.25,
    miniT: 0.9, turboT: 1.7, boost1: 0.7, boost2: 1.2, boostMul: 1.4, padTime: 1.1, autoGas: 1, distPts: 40, lapPts: 400, rankPts: 6, passPts: 30, driftPts: 50, hw: 48 };
  var env = null;
  function T(k) { var v = env && env.tune ? env.tune("kt." + k) : undefined; return typeof v === "number" && isFinite(v) ? v : DEF[k]; }

  /* ================= geometry ================= */
  /* the control points go round clockwise; the top-left corner (where the performer sits) is always left clear */
  var DEFS = [
    { name: "Olympus Loop", pads: [0.17, 0.5, 0.83],
      pts: [[520, 90], [760, 100], [900, 200], [880, 340], [780, 420], [820, 520], [640, 560], [430, 520], [330, 430], [210, 470], [110, 400], [130, 290], [270, 240], [350, 160], [430, 95]] },
    { name: "Valles Marineris", pads: [0.12, 0.4, 0.66, 0.9],
      pts: [[500, 80], [700, 80], [880, 130], [920, 260], [800, 300], [680, 260], [600, 330], [700, 420], [880, 450], [900, 540], [700, 570], [500, 520], [400, 430], [300, 520], [150, 540], [90, 430], [160, 350], [280, 300], [340, 210], [420, 120]] },
    { name: "Dust Devil", pads: [0.1, 0.45, 0.75],
      pts: [[560, 100], [800, 90], [920, 190], [860, 300], [700, 320], [560, 260], [450, 335], [560, 445], [760, 455], [880, 515], [760, 570], [520, 560], [330, 540], [150, 520], [80, 400], [180, 320], [290, 390], [340, 270], [290, 200], [400, 110]] }
  ];
  function build(def) {
    var pts = def.pts, n = pts.length, raw = [], i, k;
    for (i = 0; i < n; i++) {
      var p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (k = 0; k < 20; k++) {
        var t = k / 20, t2 = t * t, t3 = t2 * t;
        raw.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                  0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
      }
    }
    var R = raw.length, cum = [0], L = 0;
    for (i = 0; i < R; i++) { var a = raw[i], b = raw[(i + 1) % R]; L += Math.hypot(b[0] - a[0], b[1] - a[1]); cum.push(L); }
    var M = Math.round(L / 6), P = [], j = 0;
    for (i = 0; i < M; i++) {
      var d = i * L / M; while (j < R - 1 && cum[j + 1] < d) j++;
      var s0 = raw[j], s1 = raw[(j + 1) % R], fr = (d - cum[j]) / ((cum[j + 1] - cum[j]) || 1);
      P.push({ x: s0[0] + (s1[0] - s0[0]) * fr, y: s0[1] + (s1[1] - s0[1]) * fr, d: d, a: 0 });
    }
    for (i = 0; i < M; i++) { var q0 = P[(i + M - 1) % M], q1 = P[(i + 1) % M]; P[i].a = Math.atan2(q1.y - q0.y, q1.x - q0.x); }
    return { name: def.name, P: P, L: L, M: M, hw: 48, pads: def.pads.map(function (f) { return f * L; }), padW: 38, padL: 30 };
  }
  var TR = DEFS.map(build);
  function trackFor(n) { return TR[((n | 0) % TR.length + TR.length) % TR.length]; }
  /* where a point d along the track (and lat to the side) is */
  function pointAt(tr, d, lat) {
    var M = tr.M, f = ((d % tr.L) + tr.L) % tr.L / tr.L * M, i = Math.floor(f) % M, fr = f - Math.floor(f), A = tr.P[i], B = tr.P[(i + 1) % M];
    var x = A.x + (B.x - A.x) * fr, y = A.y + (B.y - A.y) * fr, a = Math.atan2(B.y - A.y, B.x - A.x);
    return { x: x - Math.sin(a) * (lat || 0), y: y + Math.cos(a) * (lat || 0), a: a };
  }
  /* nearest bit of road: i = sample, d = distance along, lat = sideways (+ is to the right of travel, y down), dist = how far */
  function project(tr, x, y, hint) {
    var P = tr.P, M = P.length, best = 1e18, bi = 0, i, dx, dy, e;
    if (hint === undefined || hint === null) { for (i = 0; i < M; i++) { dx = x - P[i].x; dy = y - P[i].y; e = dx * dx + dy * dy; if (e < best) { best = e; bi = i; } } }
    else { for (var o = -14; o <= 14; o++) { i = (hint + o + M) % M; dx = x - P[i].x; dy = y - P[i].y; e = dx * dx + dy * dy; if (e < best) { best = e; bi = i; } } }
    var p = P[bi]; dx = x - p.x; dy = y - p.y;
    var along = dx * Math.cos(p.a) + dy * Math.sin(p.a), lat = -dx * Math.sin(p.a) + dy * Math.cos(p.a);
    return { i: bi, d: ((p.d + along) % tr.L + tr.L) % tr.L, lat: lat, dist: Math.sqrt(best), a: p.a };
  }
  /* counts how far round the track a kart has really gone (backwards takes it off, so you can't farm laps) */
  function Prog(tr) { this.tr = tr; this.i = null; this.acc = 0; this.last = 0; this.best = -1e9; }
  Prog.prototype.reset = function (x, y) { var r = project(this.tr, x, y); this.i = r.i; this.last = r.d; this.acc = r.d > this.tr.L / 2 ? r.d - this.tr.L : r.d; this.best = this.acc; return r; };
  Prog.prototype.update = function (x, y) {
    var L = this.tr.L, r = project(this.tr, x, y, this.i === null ? undefined : this.i); this.i = r.i;
    var dd = r.d - this.last; if (dd > L / 2) dd -= L; else if (dd < -L / 2) dd += L;
    this.acc += dd; this.last = r.d; return r;
  };
  /* the starting grid: three across, rows going back from the line */
  function gridSlot(tr, k) { var row = Math.min(7, Math.floor(k / 3)) + (k >= 24 ? (k - 24) * 0.05 : 0), col = k % 3 - 1; return { d: tr.L - 26 - row * 34, lat: col * tr.hw * 0.55 }; }

  var GEO = { W: WW, H: WH, tracks: TR, trackFor: trackFor, pointAt: pointAt, project: project, Prog: Prog, gridSlot: gridSlot, DEF: DEF };
  if (typeof module !== "undefined" && module.exports) module.exports = { geo: GEO };

  /* ================= everything below needs a browser ================= */
  var hasDom = typeof window !== "undefined" && typeof document !== "undefined" && typeof document.getElementById === "function";
  var K = { geo: GEO };
  root.KART = K;
  if (!hasDom) return;

  var on = false, rnd = null, tr = TR[0], trIdx = 0, me = null, mk = null, myP = null, remotes = {}, bots = {}, fx = [], pops = [];
  var lockT = 0, lastT = 0, score = 0, lap = 0, rank = 1, nKarts = 1, rankAcc = 0, lastRankChg = 0, wrong = 0, startAt = 0, driftHold = false, gasBtn = false, brakeBtn = false;
  var distAcc = 0, view = null, bgCv = null, bgKey = "", driftPtsAcc = 0, lastGo = false;
  function $(id) { return document.getElementById(id); }

  /* ---- the screen: fit the world to the window, turned on its side for a phone held upright ---- */
  function layout(W, H) {
    var port = H > W * 1.05, top = port ? 150 : 44, bot = port ? 200 : 0;
    var aw = W, ah = H - top - bot, ww = port ? WH : WW, wh = port ? WW : WH, s = Math.min(aw / ww, ah / wh);
    return { W: W, H: H, port: port, s: s, ox: (aw - ww * s) / 2, oy: top + (ah - wh * s) / 2, k: 0 };
  }
  function toScreen(x, y) { return view.port ? [view.ox + y * view.s, view.oy + x * view.s] : [view.ox + x * view.s, view.oy + y * view.s]; }
  function screenAng(a) { return view.port ? Math.PI / 2 - a : a; }
  function mat() { return view.port ? [0, view.s, view.s, 0, view.ox, view.oy] : [view.s, 0, 0, view.s, view.ox, view.oy]; }

  /* ---- the Mars backdrop, painted once (chunky, half resolution) and reused every frame ---- */
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function bake(W, H) {
    var q = 0.5, c = document.createElement("canvas"); c.width = Math.max(2, Math.round(W * q)); c.height = Math.max(2, Math.round(H * q));
    var g = c.getContext("2d"), m = mat(), R = rng(7 + trIdx * 101), i;
    g.fillStyle = "#b4552b"; g.fillRect(0, 0, c.width, c.height);
    g.setTransform(m[0] * q, m[1] * q, m[2] * q, m[3] * q, m[4] * q, m[5] * q);
    var near = function (x, y, pad) { return project(tr, x, y).dist < tr.hw + pad || (x < 215 && y < 185); };
    /* dune bands, dust speckle, craters, rocks */
    for (i = 0; i < 26; i++) { var x = R() * WW, y = R() * WH; g.fillStyle = R() < 0.5 ? "rgba(214,120,66,.35)" : "rgba(130,52,28,.28)"; g.beginPath(); g.ellipse(x, y, 60 + R() * 120, 14 + R() * 30, R() * 3, 0, 6.3); g.fill(); }
    for (i = 0; i < 900; i++) { g.fillStyle = R() < 0.5 ? "rgba(235,160,100,.35)" : "rgba(90,35,20,.35)"; g.fillRect(R() * WW, R() * WH, 2 + R() * 3, 2 + R() * 2); }
    for (i = 0; i < 18; i++) { var cx = R() * WW, cy = R() * WH, cr = 10 + R() * 22; if (near(cx, cy, cr + 14)) continue;
      g.fillStyle = "#7a3018"; g.beginPath(); g.ellipse(cx, cy, cr, cr * 0.7, 0, 0, 6.3); g.fill();
      g.strokeStyle = "#d98a57"; g.lineWidth = 3; g.beginPath(); g.ellipse(cx - 1, cy - 1, cr, cr * 0.7, 0, 3.4, 5.9); g.stroke(); }
    for (i = 0; i < 40; i++) { var rx = R() * WW, ry = R() * WH; if (near(rx, ry, 22)) continue; g.fillStyle = "#5c2a1c"; g.beginPath(); g.ellipse(rx, ry, 5 + R() * 6, 4 + R() * 4, R() * 3, 0, 6.3); g.fill(); g.fillStyle = "#8e4a31"; g.fillRect(rx - 2, ry - 3, 4, 2); }
    /* the road: dusty shoulder, red and white kerb, tarmac, dashed middle */
    g.lineJoin = "round"; g.lineCap = "butt";
    var path = function () { g.beginPath(); for (var j = 0; j < tr.M; j++) { var p = tr.P[j]; if (j) g.lineTo(p.x, p.y); else g.moveTo(p.x, p.y); } g.closePath(); };
    path(); g.strokeStyle = "rgba(110,45,24,.55)"; g.lineWidth = tr.hw * 2 + 26; g.stroke();
    path(); g.strokeStyle = "#f2efe8"; g.lineWidth = tr.hw * 2 + 10; g.setLineDash([]); g.stroke();
    path(); g.strokeStyle = "#d8322b"; g.lineWidth = tr.hw * 2 + 10; g.setLineDash([16, 16]); g.stroke(); g.setLineDash([]);
    path(); g.strokeStyle = "#3a3344"; g.lineWidth = tr.hw * 2; g.stroke();
    path(); g.strokeStyle = "rgba(255,230,160,.55)"; g.lineWidth = 3; g.setLineDash([14, 18]); g.stroke(); g.setLineDash([]);
    /* start / finish: a chequered line across the road */
    var s0 = tr.P[0], cs = 8, nx = -Math.sin(s0.a), ny = Math.cos(s0.a), tx = Math.cos(s0.a), ty = Math.sin(s0.a);
    for (var rr = 0; rr < 2; rr++) for (var cc = -6; cc < 6; cc++) { g.fillStyle = (rr + cc) & 1 ? "#fff" : "#16121c"; var px = s0.x + nx * (cc + 0.5) * cs + tx * (rr - 1) * cs, py = s0.y + ny * (cc + 0.5) * cs + ty * (rr - 1) * cs;
      g.save(); g.translate(px, py); g.rotate(s0.a); g.fillRect(-cs / 2, -cs / 2, cs, cs); g.restore(); }
    return c;
  }
  function bg(ctx, W, H) {
    if (!on) return;
    view = layout(W, H); var key = trIdx + ":" + W + "x" + H;
    if (key !== bgKey) { bgCv = bake(W, H); bgKey = key; }
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bgCv, 0, 0, W, H);
    ctx.restore();
  }

  /* ---- physics ---- */
  function newKart(d, lat) { var p = pointAt(tr, d, lat); return { x: p.x, y: p.y, a: p.a, vx: 0, vy: 0, drift: 0, charge: 0, boost: 0, ev: "", st: 0 }; }
  function step(k, inp, dt, proj) {
    var vm = T("maxSpeed"), fx0 = Math.cos(k.a), fy0 = Math.sin(k.a);
    var vf = k.vx * fx0 + k.vy * fy0, off = Math.abs(proj.lat) > tr.hw + 2;
    var cap = vm * (off ? T("offSpeed") : 1) * (k.boost > 0 ? T("boostMul") : 1);
    var turn = T("turn") * Math.min(1, 0.25 + Math.abs(vf) / vm * 1.3) * (vf < -2 ? -1 : 1), steer = inp.steer;
    k.ev = "";
    if (inp.drift && !k.drift && Math.abs(steer) > 0.35 && vf > vm * 0.45) { k.drift = steer > 0 ? 1 : -1; k.charge = 0; }
    if (k.drift) {
      if (!inp.drift || vf < vm * 0.3) {
        if (k.charge >= T("turboT")) { k.boost = T("boost2"); k.ev = "turbo"; } else if (k.charge >= T("miniT")) { k.boost = T("boost1"); k.ev = "mini"; }
        k.drift = 0; k.charge = 0; k.a += steer * turn * dt;
      } else {
        var s2 = Math.max(-1.4, Math.min(1.4, k.drift * 0.75 + steer * 0.7));
        k.a += s2 * turn * T("driftTurn") * dt; k.charge += dt * (0.6 + 0.4 * Math.abs(steer));
      }
    } else k.a += steer * turn * dt;
    if (k.boost > 0) k.boost -= dt;
    var fx = Math.cos(k.a), fy = Math.sin(k.a), rx = -fy, ry = fx;
    vf = k.vx * fx + k.vy * fy; var vl = k.vx * rx + k.vy * ry;
    if (inp.gas) { if (vf < cap) vf = Math.min(cap, vf + T("accel") * (k.boost > 0 ? 2.2 : 1) * dt); } else vf *= Math.pow(T("drag"), dt);
    if (inp.brake) { vf -= (vf > 0 ? T("brake") : T("accel") * 0.5) * dt; if (vf < -vm * 0.3) vf = -vm * 0.3; }
    if (off) vf *= Math.pow(0.45, dt);
    if (vf > cap) vf = cap + (vf - cap) * Math.pow(0.15, dt);
    vl *= Math.pow(k.drift ? T("driftGrip") : T("grip"), dt);
    k.vx = fx * vf + rx * vl; k.vy = fy * vf + ry * vl;
    k.x += k.vx * dt; k.y += k.vy * dt;
    if (k.x < 12) { k.x = 12; k.vx = Math.abs(k.vx) * 0.3; } if (k.x > WW - 12) { k.x = WW - 12; k.vx = -Math.abs(k.vx) * 0.3; }
    if (k.y < 12) { k.y = 12; k.vy = Math.abs(k.vy) * 0.3; } if (k.y > WH - 12) { k.y = WH - 12; k.vy = -Math.abs(k.vy) * 0.3; }
    k.off = off; k.spd = Math.hypot(k.vx, k.vy);
  }
  function onPad(x, y) {
    for (var i = 0; i < tr.pads.length; i++) { var p = pointAt(tr, tr.pads[i], 0), dx = x - p.x, dy = y - p.y, al = dx * Math.cos(p.a) + dy * Math.sin(p.a), la = -dx * Math.sin(p.a) + dy * Math.cos(p.a); if (Math.abs(al) < tr.padL / 2 + 6 && Math.abs(la) < tr.padW) return true; }
    return false;
  }

  /* ---- input: the stick steers (or A/D, arrows), a button or key for drift, brake, and gas if auto-gas is off ---- */
  function input() {
    var s = env.stick(), x = s.x, ax = Math.abs(x);
    var steer = ax < 0.12 ? 0 : Math.sign(x) * Math.min(1, (ax - 0.12) / 0.78);
    if (view && view.port) steer = -steer;      /* the upright view is the track mirrored, so flip it back: right is right on screen */
    var up = s.up, down = s.down;
    return { steer: steer, gas: T("autoGas") >= 0.5 ? !down || gasBtn : (up || gasBtn), brake: down || brakeBtn, drift: driftHold };
  }

  /* ---- starting and stopping ---- */
  function slotOf(id) { var ids = Object.keys(env.viewers()).sort(); var k = ids.indexOf(id); return k < 0 ? ids.length : k; }
  function start(round) {
    on = true; rnd = round || null; score = 0; lap = 0; rank = 1; nKarts = 1; rankAcc = 0; fx = []; pops = []; remotes = {}; bots = {}; wrong = 0; lastGo = false; driftPtsAcc = 0;
    var forced = typeof root.__kartTrack === "number" ? root.__kartTrack : null;
    trIdx = forced !== null ? forced : ((rnd && rnd.n !== undefined ? rnd.n : Math.floor(Math.random() * 3)) % TR.length + TR.length) % TR.length; tr = TR[trIdx]; bgKey = "";
    me = env.me(); lockT = 3.2; lastT = 0; startAt = performance.now();
    var gs = gridSlot(tr, slotOf(env.myId())); mk = newKart(gs.d, gs.lat); myP = new Prog(tr); var p0 = pointAt(tr, gs.d, gs.lat); myP.reset(p0.x, p0.y);
    if (me) { me.tx = me.x = mk.x / WW; me.ty = me.y = mk.y / WH; env.sendPos(me.tx, me.ty); }
    ui(true); banner(tr.name.toUpperCase()); hud();
  }
  function stop() { on = false; ui(false); }

  /* ---- each frame ---- */
  function tick() {
    if (!on) return;
    var now = performance.now(), dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
    me = env.me(); if (!me) return;
    var inp = input(); if (lockT > 0) { lockT -= dt; inp = { steer: 0, gas: false, brake: false, drift: false }; lights(); if (lockT <= 0) goGo(); }
    var pr = project(tr, mk.x, mk.y, myP.i === null ? undefined : myP.i);
    step(mk, inp, dt, pr);
    if (onPad(mk.x, mk.y)) { if (mk.boost < T("padTime") * 0.6) { mk.boost = T("padTime"); fxBurst(mk.x, mk.y, "#F5F23D", 8); } }
    /* bump into the others */
    var vs = env.viewers();
    Object.keys(remotes).forEach(function (id) { var r = remotes[id], dx = mk.x - r.x, dy = mk.y - r.y, d = Math.hypot(dx, dy); if (d > 0 && d < 17) { var o = (17 - d) / 2; mk.x += dx / d * o; mk.y += dy / d * o; mk.vx *= 0.985; mk.vy *= 0.985; } });
    var r2 = myP.update(mk.x, mk.y);
    if (mk.ev) { var bonus = mk.ev === "turbo" ? T("driftPts") * 2 : T("driftPts"); add(bonus, mk.x, mk.y, mk.ev === "turbo" ? "TURBO!" : "MINI-TURBO", mk.ev === "turbo" ? "#FF8A2B" : "#3DF2FF"); fxBurst(mk.x, mk.y, mk.ev === "turbo" ? "#FF8A2B" : "#3DF2FF", 14); }
    /* points for new ground covered, and for each lap */
    if (myP.acc > myP.best) { var dd = myP.acc - myP.best; if (dd < 60) { var before = Math.floor(myP.best / tr.L), after = Math.floor(myP.acc / tr.L); distAcc += dd / 100 * T("distPts"); if (distAcc >= 1) { var dp = Math.floor(distAcc); distAcc -= dp; add(dp); } if (after > before && after > 0) { lap = after; add(T("lapPts"), mk.x, mk.y, "LAP " + after, "#F5F23D"); banner("LAP " + (after + 1)); } } myP.best = myP.acc; }
    wrong = Math.max(0, Math.min(1, wrong + ((pr.lat !== undefined && Math.cos(mk.a - r2.a) < -0.3 && mk.spd > 25) ? dt : -dt * 2)));
    me.tx = me.x = Math.max(0.005, Math.min(0.995, mk.x / WW)); me.ty = me.y = Math.max(0.005, Math.min(0.995, mk.y / WH));
    env.sendPos(me.tx, me.ty);
    env.pose([2.1 + inp.steer * 0.35, -2.1 + inp.steer * 0.35, 0.25, -0.25]);
    /* where everyone is, and so what place you're in */
    var list = [{ id: "me", t: myP.acc }];
    Object.keys(vs).forEach(function (id) { if (id === env.myId()) return; var v = vs[id]; if (id.indexOf("bot") === 0 && env.practice()) botMove(id, v, dt, now); if (v.dance !== 4) { delete remotes[id]; return; } var r = remoteStep(id, v, dt); list.push({ id: id, t: r.P.acc }); });
    Object.keys(remotes).forEach(function (id) { if (!vs[id]) delete remotes[id]; });
    list.sort(function (a, b) { return b.t - a.t; }); nKarts = list.length; var nr = 1 + list.findIndex(function (e) { return e.id === "me"; });
    if (nr < rank && lockT <= 0 && now - lastRankChg > 1200) { lastRankChg = now; add(T("passPts"), mk.x, mk.y, "PASS!", "#FF3DA8"); }
    rank = nr;
    if (nKarts > 1 && lockT <= 0) { rankAcc += dt * T("rankPts") * (nKarts - rank) / (nKarts - 1); if (rankAcc >= 1) { var rp = Math.floor(rankAcc); rankAcc -= rp; add(rp); } }
    /* drift sparks and dust */
    if (mk.drift) { if (Math.random() < 0.7) fx.push({ x: mk.x - Math.cos(mk.a) * 8, y: mk.y - Math.sin(mk.a) * 8, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, t: now, life: 350, c: mk.charge >= T("turboT") ? "#FF8A2B" : mk.charge >= T("miniT") ? "#3DF2FF" : "#fff" }); }
    if (mk.off && mk.spd > 30 && Math.random() < 0.6) fx.push({ x: mk.x, y: mk.y, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, t: now, life: 500, c: "rgba(255,190,140,.7)", big: 1 });
    hudLive(inp);
  }
  function add(n, x, y, txt, col) { if (n) { score += n; env.pts(n); } if (txt) pops.push({ x: x, y: y, t: performance.now(), txt: txt + (n ? " +" + n : ""), col: col || "#F5F23D" }); hud(); }
  function fxBurst(x, y, c, n) { var now = performance.now(); for (var i = 0; i < n; i++) { var a = Math.random() * 6.3, s = 30 + Math.random() * 70; fx.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: now, life: 450, c: c }); } }

  /* ---- other karts: smoothed from the positions that arrive about ten times a second ---- */
  function remoteStep(id, v, dt) {
    var r = remotes[id];
    if (!r) { r = remotes[id] = { x: v.tx * WW, y: v.ty * WH, a: 0, spd: 0, P: new Prog(tr), lean: 0, v: v }; r.P.reset(r.x, r.y); }
    r.v = v; var tx = v.tx * WW, ty = v.ty * WH, dx = tx - r.x, dy = ty - r.y;
    if (Math.hypot(dx, dy) > 220) { r.x = tx; r.y = ty; r.P.reset(tx, ty); }
    var f = 1 - Math.exp(-dt * 10), nx = r.x + dx * f, ny = r.y + dy * f, mv = Math.hypot(nx - r.x, ny - r.y);
    if (mv > 0.04 && dt > 0) { var na = Math.atan2(ny - r.y, nx - r.x), da = Math.atan2(Math.sin(na - r.a), Math.cos(na - r.a)); r.lean += (da / Math.max(dt, 0.001) * 0.1 - r.lean) * 0.2; r.a += da * 0.25; r.spd += (mv / Math.max(dt, 0.001) - r.spd) * 0.15; }
    else r.spd *= 0.9;
    r.x = nx; r.y = ny; r.P.update(r.x, r.y); return r;
  }
  /* practice bots: drive the line with a little weave, each at its own pace */
  function botMove(id, v, dt, now) {
    var b = bots[id];
    if (!b) { var k = Object.keys(env.viewers()).sort().indexOf(id), gs = gridSlot(tr, k < 0 ? 5 : k); b = bots[id] = { d: (gs.d + tr.L) % tr.L, lat: gs.lat, sp: 0.62 + Math.random() * 0.3, ph: Math.random() * 6, go: 0 }; }
    if (lockT > 0) { var p0 = pointAt(tr, b.d, b.lat); v.tx = p0.x / WW; v.ty = p0.y / WH; v.dance = 4; v.sk = { h: 0, f: 0, t: 0 }; return; }
    var curve = Math.abs(pointAt(tr, b.d + 40, 0).a - pointAt(tr, b.d, 0).a); curve = Math.min(1, Math.abs(Math.atan2(Math.sin(curve), Math.cos(curve))) * 3);
    var spd = T("maxSpeed") * b.sp * (1 - curve * 0.25) * (1 + (b.boostT > now ? 0.3 : 0)); b.d += spd * dt;
    b.lat += (Math.sin(now / 900 + b.ph) * tr.hw * 0.5 - b.lat) * Math.min(1, dt * 2);
    var p = pointAt(tr, b.d, b.lat); v.tx = p.x / WW; v.ty = p.y / WH; v.dance = 4; v.sk = { h: Math.round(Math.min(1, spd / (T("maxSpeed") * 1.45)) * 60), f: 0, t: curve > 0.5 ? 1 : 0 };
  }

  /* ---- drawing the karts: a little bike seen from above, the rider standing up on it ---- */
  function bike(ctx, x, y, ang, col, u, spd, drifting, boosting, name, v, isMe, lean) {
    var sc = toScreen(x, y), a = screenAng(ang), L = 17 * u;
    ctx.save(); ctx.translate(sc[0], sc[1]);
    ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.ellipse(0, 3 * u, L * 1.1, L * 0.55, a, 0, 6.3); ctx.fill();
    ctx.rotate(a);
    if (boosting) { ctx.fillStyle = "#FF8A2B"; ctx.beginPath(); ctx.moveTo(-L, -3 * u); ctx.lineTo(-L - (14 + Math.random() * 8) * u, 0); ctx.lineTo(-L, 3 * u); ctx.fill(); ctx.fillStyle = "#FFF3A0"; ctx.beginPath(); ctx.moveTo(-L, -1.4 * u); ctx.lineTo(-L - (7 + Math.random() * 4) * u, 0); ctx.lineTo(-L, 1.4 * u); ctx.fill(); }
    ctx.fillStyle = "#15111a"; rr(ctx, -L - 1 * u, -3.5 * u, 11 * u, 7 * u, 3 * u); rr(ctx, L - 10 * u, -3.5 * u, 11 * u, 7 * u, 3 * u);   /* wheels */
    ctx.fillStyle = col; rr(ctx, -L * 0.7, -3 * u, L * 1.5, 6 * u, 3 * u);                                                                        /* frame */
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(-L * 0.4, -2 * u, L * 0.9, 1.4 * u);
    ctx.fillStyle = "#cfd3da"; ctx.fillRect(L * 0.5, -8 * u, 2.6 * u, 16 * u);                                                                    /* handlebars */
    ctx.fillStyle = "#fff6b0"; ctx.beginPath(); ctx.arc(L + 3 * u, 0, 2.2 * u, 0, 6.3); ctx.fill();                                                /* headlight */
    ctx.restore();
    env.avatar(sc[0], sc[1] - 13 * u, v, isMe, Math.max(0.75, Math.min(2.1, 1.1 * u)), [2.1 + (lean || 0) * 0.3, -2.1 + (lean || 0) * 0.3, 0.25, -0.25]);
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill(); }
  function draw(ctx) {
    if (!on || !view || !mk) return;
    var now = performance.now(), u = view.s / 0.56; u = Math.max(0.7, Math.min(2.2, u));
    /* boost pads */
    var m = mat(); ctx.save(); ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    tr.pads.forEach(function (d) { var p = pointAt(tr, d, 0); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = "rgba(20,10,40,.8)"; ctx.fillRect(-tr.padL / 2, -tr.padW, tr.padL, tr.padW * 2);
      for (var c = 0; c < 3; c++) { var ph = ((now / 260 + c) % 3) / 3; ctx.globalAlpha = Math.sin(ph * Math.PI); ctx.fillStyle = c % 2 ? "#3DF2FF" : "#F5F23D"; ctx.beginPath(); var xx = -tr.padL / 2 + ph * tr.padL; ctx.moveTo(xx - 6, -22); ctx.lineTo(xx + 5, 0); ctx.lineTo(xx - 6, 22); ctx.lineTo(xx - 1, 0); ctx.closePath(); ctx.fill(); }
      ctx.restore(); });
    ctx.restore();
    /* dust and sparks, then karts back to front (by their screen height) */
    fx = fx.filter(function (f) { var a = (now - f.t) / f.life; if (a >= 1) return false; var s = toScreen(f.x + f.vx * a * 0.45, f.y + f.vy * a * 0.45); ctx.globalAlpha = 1 - a; ctx.fillStyle = f.c; var z = f.big ? 5 : 3; ctx.fillRect(s[0] - z / 2, s[1] - z / 2, z, z); return true; }); ctx.globalAlpha = 1;
    var all = [], vs = env.viewers(), myId = env.myId();
    Object.keys(remotes).forEach(function (id) { var r = remotes[id], v = vs[id]; if (v) all.push({ x: r.x, y: r.y, a: r.a, v: v, me: false, drift: v.sk && v.sk.t === 1, boost: v.sk && v.sk.t === 2, spd: r.spd, lean: r.lean }); });
    var mv = vs[myId]; if (mv) all.push({ x: mk.x, y: mk.y, a: mk.a, v: mv, me: true, drift: !!mk.drift, boost: mk.boost > 0, spd: mk.spd, lean: mk.drift ? mk.drift * 1.2 : 0 });
    all.sort(function (p, q) { return toScreen(p.x, p.y)[1] - toScreen(q.x, q.y)[1]; });
    all.forEach(function (k) { bike(ctx, k.x, k.y, k.a, k.v.color || "#e33", u, k.spd, k.drift, k.boost, k.v.name, k.v, k.me, k.lean); });
    /* points popping up */
    pops = pops.filter(function (p) { var a = (now - p.t) / 900; if (a > 1) return false; var s = toScreen(p.x, p.y); ctx.globalAlpha = 1 - a; ctx.font = "900 16px system-ui"; ctx.textAlign = "center"; ctx.lineWidth = 3; ctx.strokeStyle = "rgba(0,0,0,.75)"; ctx.strokeText(p.txt, s[0], s[1] - 40 - a * 30); ctx.fillStyle = p.col; ctx.fillText(p.txt, s[0], s[1] - 40 - a * 30); return true; });
    ctx.globalAlpha = 1;
  }
  /* where the performer stands: the top-left corner of the screen, above the track */
  function perf() { if (!view) return null; return view.port ? [78, 104] : [Math.max(46, view.ox + 56), Math.max(view.oy + 78, 120)]; }

  /* ---- the on-screen bits: banner, place, lap, speed, drift charge, start lights, buttons ---- */
  var CSS = "#ktUI{display:none;position:fixed;inset:0;z-index:21;pointer-events:none;font-family:system-ui,sans-serif}#ktUI.on{display:block}" +
    "#ktBanner{position:absolute;left:50%;top:20%;transform:translateX(-50%);font:900 clamp(26px,6vw,54px)/1 system-ui;color:#fff;text-shadow:0 0 16px #FF7A2B,0 0 30px #FF3DA8,0 3px 0 #000;white-space:nowrap;opacity:0;letter-spacing:2px}#ktBanner.pop{animation:moshPop 2.2s ease-out forwards}" +
    "#ktRank{position:absolute;right:14px;top:84px;text-align:right;font:900 30px/1 system-ui;color:#F5F23D;text-shadow:0 0 10px #FF7A2B,0 2px 0 #000}#ktRank small{display:block;font:800 13px system-ui;color:#fff;margin-top:3px;letter-spacing:1px}" +
    "#ktScore{position:absolute;right:14px;top:138px;font:900 18px system-ui;color:#3DF2FF;text-shadow:0 2px 0 #000}#ktScore::before{content:'🏍 ';font-size:15px}" +
    "#ktBars{position:absolute;right:14px;top:166px;width:150px}#ktBars div{height:8px;border-radius:4px;background:rgba(0,0,0,.55);border:1px solid rgba(255,122,43,.6);overflow:hidden;margin-bottom:5px}#ktBars i{display:block;height:100%;width:0}" +
    "#ktSp i{background:linear-gradient(90deg,#3DF2FF,#F5F23D,#FF7A2B)}#ktDr i{background:#fff}" +
    "#ktLights{position:absolute;left:50%;top:34%;transform:translateX(-50%);display:none;gap:14px}#ktLights b{width:34px;height:34px;border-radius:50%;background:#2a1a1a;border:3px solid #000}#ktLights b.r{background:#ff2b2b;box-shadow:0 0 18px #ff2b2b}#ktLights b.g{background:#2bff6a;box-shadow:0 0 22px #2bff6a}" +
    "#ktWrong{position:absolute;left:50%;top:44%;transform:translateX(-50%);font:900 22px system-ui;color:#ff4d4d;text-shadow:0 2px 0 #000;display:none}" +
    "#ktHint{position:absolute;left:50%;transform:translateX(-50%);bottom:270px;font:600 12px system-ui;color:rgba(255,255,255,.85);text-shadow:0 1px 3px #000;white-space:nowrap}" +
    ".ktB{position:absolute;border-radius:50%;pointer-events:auto;touch-action:none;color:#fff;font:900 16px system-ui;letter-spacing:1px;display:flex;flex-direction:column;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none;border:3px solid #FF7A2B;background:radial-gradient(circle,rgba(255,122,43,.5),rgba(20,8,30,.85))}" +
    ".ktB small{font:600 10px system-ui;opacity:.75;margin-top:2px}.ktB.dn{transform:scale(.93);background:radial-gradient(circle,rgba(61,242,255,.55),rgba(20,8,40,.85))}" +
    "#ktDrift{right:18px;bottom:150px;width:100px;height:100px}#ktBrake{right:130px;bottom:136px;width:64px;height:64px;font-size:13px;border-color:#FF3DA8}#ktGas{right:130px;bottom:208px;width:64px;height:64px;font-size:13px;border-color:#2bff6a;display:none}" +
    "body.practice #ktDrift{bottom:60px}body.practice #ktBrake{bottom:46px}body.practice #ktGas{bottom:118px}" +
    "@media (pointer:fine){#ktDrift{width:80px;height:80px;font-size:14px;bottom:120px}#ktBrake{bottom:110px}}" +
    "body.gaming-kart #reactBar{display:none}";
  function ui(show) {
    var el = $("ktUI");
    if (!el) {
      var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
      el = document.createElement("div"); el.id = "ktUI";
      el.innerHTML = '<div id="ktBanner"></div><div id="ktRank">1st<small>LAP 1</small></div><div id="ktScore">0</div><div id="ktBars"><div id="ktSp"><i></i></div><div id="ktDr"><i></i></div></div><div id="ktLights"><b></b><b></b><b></b></div><div id="ktWrong">WRONG WAY!</div><div id="ktHint"></div>' +
        '<button class="ktB" id="ktDrift" aria-label="Drift">DRIFT<small>hold + steer</small></button><button class="ktB" id="ktBrake" aria-label="Brake">BRAKE</button><button class="ktB" id="ktGas" aria-label="Gas">GAS</button>';
      document.body.appendChild(el);
      var hold = function (id, set) { var b = $(id), pid = null; b.addEventListener("pointerdown", function (e) { e.preventDefault(); e.stopPropagation(); pid = e.pointerId; try { b.setPointerCapture(pid); } catch (x) {} b.classList.add("dn"); set(true); });
        var up = function (e) { if (e.pointerId !== pid) return; pid = null; b.classList.remove("dn"); set(false); }; b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up); b.addEventListener("lostpointercapture", up); };
      hold("ktDrift", function (v) { driftHold = v; }); hold("ktBrake", function (v) { brakeBtn = v; }); hold("ktGas", function (v) { gasBtn = v; });
    }
    el.classList.toggle("on", !!show); document.body.classList.toggle("gaming-kart", !!show);
    if (show) { $("ktGas").style.display = T("autoGas") >= 0.5 ? "none" : "flex"; driftHold = gasBtn = brakeBtn = false; }
  }
  function banner(t) { var b = $("ktBanner"); if (!b) return; b.textContent = t; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  function hud() { var s = $("ktScore"); if (s) s.textContent = score.toLocaleString(); }
  function lights() {
    var el = $("ktLights"); if (!el) return; el.style.display = "flex"; var n = lockT > 2.2 ? 3 : lockT > 1.2 ? 2 : lockT > 0.2 ? 1 : 0, bs = el.children;
    for (var q = 0; q < 3; q++) bs[q].className = (3 - q) > n ? "r" : "";
  }
  function goGo() { var el = $("ktLights"); if (el) { Array.prototype.forEach.call(el.children, function (b) { b.className = "g"; }); setTimeout(function () { el.style.display = "none"; }, 700); } banner("GO!"); }
  function ordinal(n) { return n + (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"); }
  function hudLive(inp) {
    var r = $("ktRank"); if (r) r.innerHTML = ordinal(rank) + (nKarts > 1 ? " <span style='font-size:15px;color:#fff'>/ " + nKarts + "</span>" : "") + "<small>LAP " + (Math.max(0, Math.floor(myP.acc / tr.L)) + 1) + "</small>";
    var sp = $("ktSp"), dr = $("ktDr"); if (sp && sp.firstChild) sp.firstChild.style.width = Math.round(Math.min(1, mk.spd / (T("maxSpeed") * 1.3)) * 100) + "%";
    if (dr && dr.firstChild) { dr.firstChild.style.width = Math.round(Math.min(1, mk.charge / T("turboT")) * 100) + "%"; dr.firstChild.style.background = mk.charge >= T("turboT") ? "#FF8A2B" : mk.charge >= T("miniT") ? "#3DF2FF" : "#fff"; }
    var w = $("ktWrong"); if (w) w.style.display = wrong > 0.6 ? "block" : "none";
    var h = $("ktHint"); if (h) h.textContent = mk.off ? "Off the road! Back onto the tarmac" : mk.drift ? "Hold the drift… release for a boost" : mk.spd < 30 && lockT <= 0 ? "Steer with the stick · hold DRIFT in a corner for a boost" : "Yellow pads give a boost";
  }

  K.bind = function (e) { env = e; };
  K.start = start; K.stop = stop; K.tick = tick; K.bg = bg; K.draw = draw; K.perf = perf;
  K.wire = function () { return mk ? { h: Math.round(Math.min(1, mk.spd / (T("maxSpeed") * 1.45)) * 60), f: 0, t: mk.boost > 0 ? 2 : mk.drift ? 1 : 0 } : { h: 0, f: 0, t: 0 }; };
  K.drift = function (v) { driftHold = !!v; };
  K.gas = function (v) { gasBtn = !!v; };
  K.brake = function (v) { brakeBtn = !!v; };
  Object.defineProperty(K, "on", { get: function () { return on; } });
  root.ukKart = function () { return { on: on, track: tr.name, trackIdx: trIdx, score: score, rank: rank, n: nKarts, lap: myP ? Math.floor(myP.acc / tr.L) : 0, prog: myP ? Math.round(myP.acc) : 0, L: Math.round(tr.L), x: mk ? Math.round(mk.x) : 0, lat: mk && myP ? Math.round(project(tr, mk.x, mk.y, myP.i === null ? undefined : myP.i).lat) : 0, herr: mk && myP ? +(Math.atan2(Math.sin(mk.a - project(tr, mk.x, mk.y, myP.i === null ? undefined : myP.i).a), Math.cos(mk.a - project(tr, mk.x, mk.y, myP.i === null ? undefined : myP.i).a))).toFixed(2) : 0, port: view ? view.port : false, y: mk ? Math.round(mk.y) : 0, spd: mk ? Math.round(mk.spd) : 0, drift: mk ? mk.drift : 0, boost: mk ? mk.boost > 0 : false, off: mk ? !!mk.off : false, lock: lockT > 0 }; };
})(typeof window !== "undefined" ? window : this);
