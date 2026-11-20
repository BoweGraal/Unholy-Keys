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
  var DEF = { maxSpeed: 135, accel: 120, brake: 240, drag: 0.6, wall: 0.35, turn: 3.2, grip: 0.002, driftGrip: 0.3, driftTurn: 1.3,
    miniT: 0.9, turboT: 1.7, boost1: 0.7, boost2: 1.2, boostMul: 1.4, padTime: 1.1, autoGas: 0, startBoost: 1.4, intro: 1, distPts: 40, lapPts: 400, rankPts: 6, passPts: 30, driftPts: 50, hw: 48 };
  var env = null;
  function T(k) { if (k === "intro" && typeof root.__kartIntro === "number") return root.__kartIntro; var v = env && env.tune ? env.tune("kt." + k) : undefined; return typeof v === "number" && isFinite(v) ? v : DEF[k]; }

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

  /* positions travel as 0..1 of the world plus a margin, so karts can drive a little past the edge of the 1000 x 620 map */
  function enc(x, y) { return [(x + 100) / 1200, (y + 100) / 820]; }
  function dec(nx, ny) { return [nx * 1200 - 100, ny * 820 - 100]; }
  /* the dance floor: a wide pulsing plaza the start line runs through (every track starts heading east) */
  TR.forEach(function (t) { var p = t.P[0]; t.plaza = { x0: p.x - 150, x1: p.x + 150, y0: p.y - 95, y1: p.y + 95, cx: p.x, cy: p.y }; var bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; t.P.forEach(function (q) { bx0 = Math.min(bx0, q.x); bx1 = Math.max(bx1, q.x); by0 = Math.min(by0, q.y); by1 = Math.max(by1, q.y); }); t.box = { x0: bx0 - 60, y0: by0 - 60, x1: bx1 + 60, y1: by1 + 60 }; });
  var GEO = { W: WW, H: WH, tracks: TR, trackFor: trackFor, pointAt: pointAt, project: project, Prog: Prog, gridSlot: gridSlot, DEF: DEF, enc: enc, dec: dec };
  if (typeof module !== "undefined" && module.exports) module.exports = { geo: GEO };

  /* ================= everything below needs a browser ================= */
  var hasDom = typeof window !== "undefined" && typeof document !== "undefined" && typeof document.getElementById === "function";
  var K = { geo: GEO };
  root.KART = K;
  if (!hasDom) return;

  var on = false, rnd = null, tr = TR[0], trIdx = 0, PZ = TR[0].plaza, me = null, mk = null, myP = null, remotes = {}, bots = {}, fx = [], pops = [], introPos = {};
  var lastBanInit = 0, startAt = 0, lastT = 0, score = 0, rank = 1, nKarts = 1, rankAcc = 0, lastRankChg = 0, wrong = 0, distAcc = 0, stall = 0;
  var driftHold = false, gasBtn = false, brakeBtn = false, gasPress = null, wasGas = false, rocketDone = false, lightsOn = false, ready = false;
  var cam = { x: 500, y: 310, z: 1 }, camB = null, bgCv = null, bgKey = "", poppedAt = -1, sentGo = false;
  function $(id) { return document.getElementById(id); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function wrapA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
  function ease(u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); }

  /* ---- the timeline: UFO, fade to space, zoom out to show the track, zoom in on the grid, lights ---- */
  function times() {
    var S = clamp(T("intro"), 0.05, 3), t = {}; t.S = S;
    t.fade = 2.6 * S; t.out = t.fade + 0.5 * S; t.hold = t.out + 2.2 * S; t.pop = t.hold + 0.3 * S; t.zin = t.hold + 1.0 * S; t.zend = t.zin + 1.3 * S; t.lights = t.hold + 1.4 * S; t.go = t.lights + 3;
    return t;
  }
  function elapsed() { return (performance.now() - startAt) / 1000; }

  /* ---- the camera: world units to screen pixels, following you ---- */
  var VW = 0, VH = 0;
  function raceZoom() { return clamp(Math.min(VW, VH) / 380, 0.85, 2.2); }
  function fitZoom() { var b = tr.box; return Math.min(VW / (b.x1 - b.x0), VH / (b.y1 - b.y0)) * 0.95; }
  function toScreen(x, y) { return [(x - cam.x) * cam.z + VW / 2, (y - cam.y) * cam.z + VH / 2]; }
  function fromScreen(sx, sy, c) { c = c || cam; return [c.x + (sx - VW / 2) / c.z, c.y + (sy - VH / 2) / c.z]; }
  function camUpdate(t, T_, dt) {
    var zr = raceZoom(), zf = fitZoom(), z0 = Math.max(VW / (PZ.x1 - PZ.x0), zr * 2.2), pc = [PZ.cx, PZ.cy], tc = [(tr.box.x0 + tr.box.x1) / 2, (tr.box.y0 + tr.box.y1) / 2];
    var mx = mk ? mk.x : PZ.cx, my = mk ? mk.y : PZ.cy;
    if (t < T_.out) { cam.z = z0; cam.x = pc[0]; cam.y = pc[1]; if (!camB) camB = { x: cam.x, y: cam.y, z: cam.z }; }
    else if (t < T_.hold) { var u = ease((t - T_.out) / (T_.hold - T_.out)); cam.z = Math.exp(Math.log(z0) + (Math.log(zf) - Math.log(z0)) * u); cam.x = pc[0] + (tc[0] - pc[0]) * u; cam.y = pc[1] + (tc[1] - pc[1]) * u; }
    else if (t < T_.zin) { cam.z = zf; cam.x = tc[0]; cam.y = tc[1]; }
    else if (t < T_.zend) { var u2 = ease((t - T_.zin) / (T_.zend - T_.zin)); cam.z = Math.exp(Math.log(zf) + (Math.log(zr) - Math.log(zf)) * u2); cam.x = tc[0] + (mx - tc[0]) * u2; cam.y = tc[1] + (my - tc[1]) * u2; }
    else { cam.z = zr; var la = mk ? 0.22 : 0, k = 1 - Math.exp(-dt * 7); cam.x += (mx + (mk ? mk.vx : 0) * la - cam.x) * k; cam.y += (my + (mk ? mk.vy : 0) * la - cam.y) * k; }
  }

  /* ---- the space backdrop with the track floating in it, painted once (chunky) ---- */
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var BX0 = -100, BY0 = -100, BWW = 1200, BHH = 820, Q = 1.6;
  function bake() {
    var c = document.createElement("canvas"); c.width = Math.round(BWW * Q); c.height = Math.round(BHH * Q);
    var g = c.getContext("2d"), R = rng(11 + trIdx * 131), i;
    g.fillStyle = "#07041a"; g.fillRect(0, 0, c.width, c.height);
    g.setTransform(Q, 0, 0, Q, -BX0 * Q, -BY0 * Q);
    var far = function (x, y, pad) { return project(tr, x, y).dist > tr.hw + pad; };
    for (i = 0; i < 9; i++) { var nx = BX0 + R() * BWW, ny = BY0 + R() * BHH, nr = 120 + R() * 200, gr = g.createRadialGradient(nx, ny, 0, nx, ny, nr); var cc = [[120, 40, 170], [30, 120, 170], [190, 50, 120]][i % 3]; gr.addColorStop(0, "rgba(" + cc + ",.28)"); gr.addColorStop(1, "rgba(" + cc + ",0)"); g.fillStyle = gr; g.fillRect(nx - nr, ny - nr, nr * 2, nr * 2); }
    for (i = 0; i < 1500; i++) { var sx = BX0 + R() * BWW, sy = BY0 + R() * BHH, b = R(); g.fillStyle = b > 0.93 ? "#ffd9a0" : b > 0.8 ? "#a9d4ff" : "rgba(255,255,255," + (0.35 + R() * 0.5) + ")"; var sz = b > 0.97 ? 2.6 : 1 + R() * 1.2; g.fillRect(sx, sy, sz, sz); }
    /* a big Mars in the corner, and a few drifting rocks */
    var mxp = 1090, myp = 700, mr = 190, mg = g.createRadialGradient(mxp - 50, myp - 60, 10, mxp, myp, mr); mg.addColorStop(0, "#e07a45"); mg.addColorStop(0.7, "#a8421f"); mg.addColorStop(1, "#4a1a10");
    g.fillStyle = mg; g.beginPath(); g.arc(mxp, myp, mr, 0, 6.3); g.fill();
    g.fillStyle = "rgba(90,30,16,.45)"; for (i = 0; i < 9; i++) { g.beginPath(); g.ellipse(mxp - 160 + R() * 150, myp - 150 + R() * 130, 8 + R() * 22, 5 + R() * 10, R() * 3, 0, 6.3); g.fill(); }
    g.fillStyle = "#cfd3e6"; g.beginPath(); g.arc(-60, 60, 34, 0, 6.3); g.fill(); g.fillStyle = "rgba(60,60,90,.4)"; g.beginPath(); g.arc(-50, 52, 12, 0, 6.3); g.fill();
    for (i = 0; i < 26; i++) { var rx = BX0 + R() * BWW, ry = BY0 + R() * BHH; if (!far(rx, ry, 40) || (rx > 880 && ry > 520) || (rx < 0 && ry < 120)) continue; g.fillStyle = "#4a3a58"; g.beginPath(); g.ellipse(rx, ry, 4 + R() * 9, 3 + R() * 6, R() * 3, 0, 6.3); g.fill(); g.fillStyle = "#7a6890"; g.fillRect(rx - 2, ry - 2, 3, 2); }
    /* the road: glow, tarmac, neon rails, dashed middle */
    g.lineJoin = "round";
    var path = function (lat) { g.beginPath(); for (var j = 0; j <= tr.M; j++) { var p = tr.P[j % tr.M], x = p.x - Math.sin(p.a) * lat, y = p.y + Math.cos(p.a) * lat; if (j) g.lineTo(x, y); else g.moveTo(x, y); } };
    path(0); g.strokeStyle = "rgba(255,61,216,.14)"; g.lineWidth = tr.hw * 2 + 40; g.stroke();
    path(0); g.strokeStyle = "rgba(61,242,255,.18)"; g.lineWidth = tr.hw * 2 + 20; g.stroke();
    path(0); g.strokeStyle = "#2a2340"; g.lineWidth = tr.hw * 2; g.stroke();
    path(0); g.strokeStyle = "rgba(255,255,255,.22)"; g.lineWidth = 2.2; g.setLineDash([12, 16]); g.stroke(); g.setLineDash([]);
    path(-tr.hw + 2); g.strokeStyle = "#ff3dd8"; g.lineWidth = 3.2; g.stroke();
    path(tr.hw - 2); g.strokeStyle = "#3df2ff"; g.lineWidth = 3.2; g.stroke();
    path(-tr.hw + 2); g.strokeStyle = "rgba(255,61,216,.3)"; g.lineWidth = 8; g.stroke();
    path(tr.hw - 2); g.strokeStyle = "rgba(61,242,255,.3)"; g.lineWidth = 8; g.stroke();
    return c;
  }
  var UFO_A = [0, 0];
  /* the backdrop and the UFO; called by the page just before it draws the performer */
  function bg(ctx, W, H) {
    if (!on) return;
    VW = W; VH = H; var tt = elapsed(), T_ = times();
    var key = trIdx + ":" + tr.name; if (key !== bgKey) { bgCv = bake(); bgKey = key; }
    var a = ease((tt - T_.fade) / (0.5 * T_.S));
    if (a > 0) {
      ctx.save(); ctx.globalAlpha = a; ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#07041a"; ctx.fillRect(0, 0, W, H);
      ctx.translate(VW / 2 - cam.x * cam.z, VH / 2 - cam.y * cam.z); ctx.scale(cam.z, cam.z);
      ctx.drawImage(bgCv, BX0, BY0, BWW, BHH);
      plaza(ctx, tt); ctx.restore();
    }
    ufo(ctx, tt, T_);
  }
  /* the dance floor: pulses to the beat all race long */
  function plaza(ctx, now) {
    var ph = env.beat ? env.beat() : 0, pulse = Math.pow(1 - clamp(ph, 0, 1), 2.2), cell = 20, tm = performance.now();
    ctx.fillStyle = "#14081f"; ctx.fillRect(PZ.x0, PZ.y0, PZ.x1 - PZ.x0, PZ.y1 - PZ.y0);
    var cols = Math.round((PZ.x1 - PZ.x0) / cell), rows = Math.round((PZ.y1 - PZ.y0) / cell), pal = ["#ff2fa0", "#2fe3ff", "#8a3dff", "#ffd23d"], step = Math.floor(tm / 480);
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      ctx.globalAlpha = clamp(0.34 + 0.5 * pulse * ((c + r) % 2 ? 1 : 0.55) + 0.14 * Math.sin(tm / 260 + c * 0.7 + r * 0.55), 0.15, 1);
      ctx.fillStyle = pal[(c + r + step) % 4]; ctx.fillRect(PZ.x0 + c * cell + 1, PZ.y0 + r * cell + 1, cell - 2, cell - 2);
    }
    ctx.globalAlpha = 1; ctx.shadowColor = "#3df2ff"; ctx.shadowBlur = 10 + 14 * pulse; ctx.strokeStyle = "#3df2ff"; ctx.lineWidth = 3; ctx.strokeRect(PZ.x0, PZ.y0, PZ.x1 - PZ.x0, PZ.y1 - PZ.y0); ctx.shadowBlur = 0;
    /* the chequered start line */
    var s0 = tr.P[0]; ctx.save(); ctx.translate(s0.x, s0.y); ctx.rotate(s0.a);
    for (var rr = 0; rr < 2; rr++) for (var cc = -6; cc < 6; cc++) { ctx.fillStyle = (rr + cc) & 1 ? "#fff" : "#16121c"; ctx.fillRect(rr * 8 - 8, cc * 8, 8, 8); }
    ctx.restore();
  }
  /* the performer's UFO: drops in under them, then they fly off to the top-left corner and play from there */
  function perfCorner() { return [Math.max(105, VW * 0.14), Math.max(112, VH * 0.17)]; }
  function perf(sx, sy) {
    if (!on) return null; var tt = elapsed(), T_ = times(), c = perfCorner();
    var u = ease((tt - 1.0 * T_.S) / (1.6 * T_.S)); return [sx + (c[0] - sx) * u, sy + (c[1] - sy) * u + Math.sin(performance.now() / 420) * 3];
  }
  function ufo(ctx, tt, T_) {
    var sp = env.perfStage ? env.perfStage() : null; if (!sp) return; var p = perf(sp[0], sp[1]), drop = ease(tt / (1.0 * T_.S)); var y = p[1] + 62 - (1 - drop) * 340, x = p[0], now = performance.now();
    ctx.save(); ctx.translate(x, y);
    var gl = ctx.createRadialGradient(0, 18, 4, 0, 18, 110); gl.addColorStop(0, "rgba(61,242,255,.45)"); gl.addColorStop(1, "rgba(61,242,255,0)"); ctx.fillStyle = gl; ctx.fillRect(-110, -60, 220, 200);
    ctx.fillStyle = "#3a3f58"; ctx.beginPath(); ctx.ellipse(0, 0, 98, 22, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = "#6b7396"; ctx.beginPath(); ctx.ellipse(0, -4, 98, 18, 0, 3.14, 6.3); ctx.fill();
    ctx.fillStyle = "#1c1f33"; ctx.beginPath(); ctx.ellipse(0, 8, 70, 11, 0, 0, 3.14); ctx.fill();
    for (var i = -3; i <= 3; i++) { ctx.fillStyle = (Math.floor(now / 180) + i) % 2 ? "#ff3dd8" : "#3df2ff"; ctx.beginPath(); ctx.arc(i * 26, 4 + Math.abs(i) * 0.4, 3.4, 0, 6.3); ctx.fill(); }
    ctx.restore();
  }

  /* ---- physics: you drive the way the stick points ---- */
  function newKart(x, y, a) { return { x: x, y: y, a: a, vx: 0, vy: 0, drift: 0, charge: 0, boost: 0, ev: "", pi: undefined, spd: 0 }; }
  function inPlaza(x, y, m) { return x > PZ.x0 - m && x < PZ.x1 + m && y > PZ.y0 - m && y < PZ.y1 + m; }
  function step(k, inp, dt) {
    var vm = T("maxSpeed"), fx0 = Math.cos(k.a), fy0 = Math.sin(k.a), vf = k.vx * fx0 + k.vy * fy0;
    k.ev = "";
    if (inp.m > 0) {
      var da = wrapA(inp.ta - k.a), rate = T("turn") * (0.55 + 0.45 * Math.min(1, Math.abs(vf) / vm));
      if (inp.drift && !k.drift && vf > vm * 0.4 && Math.abs(da) > 0.3) { k.drift = da > 0 ? 1 : -1; k.charge = 0; }
      if (k.drift) rate *= T("driftTurn");
      var mx = rate * dt; k.a += clamp(da, -mx, mx);
    }
    if (k.drift) {
      if (!inp.drift || vf < vm * 0.3) { if (k.charge >= T("turboT")) { k.boost = T("boost2"); k.ev = "turbo"; } else if (k.charge >= T("miniT")) { k.boost = T("boost1"); k.ev = "mini"; } k.drift = 0; k.charge = 0; }
      else if (inp.m > 0) k.charge += dt * (0.6 + 0.4 * inp.m);
    }
    if (k.boost > 0) k.boost -= dt;
    var cap = vm * (k.boost > 0 ? T("boostMul") : 1), fx = Math.cos(k.a), fy = Math.sin(k.a), rx = -fy, ry = fx;
    vf = k.vx * fx + k.vy * fy; var vl = k.vx * rx + k.vy * ry;
    if (inp.gas) { if (vf < cap) vf = Math.min(cap, vf + T("accel") * (k.boost > 0 ? 2.2 : 1) * dt); } else vf *= Math.pow(T("drag"), dt);
    if (inp.brake) { vf -= (vf > 0 ? T("brake") : T("accel") * 0.5) * dt; if (vf < -vm * 0.3) vf = -vm * 0.3; }
    if (vf > cap) vf = cap + (vf - cap) * Math.pow(0.15, dt);
    vl *= Math.pow(k.drift ? T("driftGrip") : T("grip"), dt);
    k.vx = fx * vf + rx * vl; k.vy = fy * vf + ry * vl;
    k.x += k.vx * dt; k.y += k.vy * dt; walls(k); k.spd = Math.hypot(k.vx, k.vy);
  }
  /* rails along the road and round the dance floor: you slide along them */
  function walls(k) {
    var pr = project(tr, k.x, k.y, k.pi); k.pi = pr.i; k.lat = pr.lat; k.pa = pr.a;
    var lim = tr.hw - 4; if (inPlaza(k.x, k.y, -6) || Math.abs(pr.lat) <= lim) return;
    var c1x = clamp(k.x, PZ.x0 + 6, PZ.x1 - 6), c1y = clamp(k.y, PZ.y0 + 6, PZ.y1 - 6), d1 = Math.hypot(k.x - c1x, k.y - c1y);
    var lat = clamp(pr.lat, -lim, lim), nx = -Math.sin(pr.a), ny = Math.cos(pr.a), d2 = Math.abs(pr.lat - lat), c2x = k.x - nx * (pr.lat - lat), c2y = k.y - ny * (pr.lat - lat);
    var cx = d1 < d2 ? c1x : c2x, cy = d1 < d2 ? c1y : c2y, d = Math.max(0.001, Math.min(d1, d2)), qx = (cx - k.x) / d, qy = (cy - k.y) / d, vn = k.vx * qx + k.vy * qy;
    if (vn < 0) { k.vx -= (1 + T("wall")) * vn * qx; k.vy -= (1 + T("wall")) * vn * qy; k.vx *= 0.97; k.vy *= 0.97; k.hit = performance.now(); }
    k.x = cx; k.y = cy;
  }
  function onPad(x, y) {
    for (var i = 0; i < tr.pads.length; i++) { var p = pointAt(tr, tr.pads[i], 0), dx = x - p.x, dy = y - p.y, al = dx * Math.cos(p.a) + dy * Math.sin(p.a), la = -dx * Math.sin(p.a) + dy * Math.cos(p.a); if (Math.abs(al) < tr.padL / 2 + 6 && Math.abs(la) < tr.padW) return true; }
    return false;
  }
  function input() {
    var s = root.__kartStick || env.stick(), x = s.x, y = s.y, m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; m = 1; }
    return { m: m > 0.22 ? m : 0, ta: Math.atan2(y, x), gas: T("autoGas") >= 0.5 || gasBtn, brake: brakeBtn, drift: driftHold };
  }

  /* ---- starting and stopping ---- */
  function slotOf(id) { var ids = Object.keys(env.viewers()).sort(); var k = ids.indexOf(id); return k < 0 ? ids.length : k; }
  function slotPos(id) { var gs = gridSlot(tr, slotOf(id)), p = pointAt(tr, gs.d, gs.lat); return p; }
  function start(round) {
    on = true; rnd = round || null; score = 0; rank = 1; nKarts = 1; rankAcc = 0; fx = []; pops = []; remotes = {}; bots = {}; introPos = {}; wrong = 0; distAcc = 0; stall = 0;
    gasPress = null; wasGas = false; rocketDone = false; lightsOn = false; ready = false; camB = null; poppedAt = -1; sentGo = false; lastBan = false;
    var forced = typeof root.__kartTrack === "number" ? root.__kartTrack : null;
    trIdx = forced !== null ? forced : ((rnd && rnd.n !== undefined ? rnd.n : Math.floor(Math.random() * 3)) % TR.length + TR.length) % TR.length; tr = TR[trIdx]; PZ = tr.plaza; bgKey = "";
    me = env.me(); startAt = performance.now(); lastT = 0;
    var sp = slotPos(env.myId()); mk = newKart(sp.x, sp.y, sp.a); myP = new Prog(tr); myP.reset(sp.x, sp.y);
    cam.x = PZ.cx; cam.y = PZ.cy; cam.z = 2;
    ui(true); hud();
  }
  function stop() { on = false; ui(false); }

  /* ---- each frame ---- */
  function tick() {
    if (!on) return;
    var now = performance.now(), dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
    me = env.me(); if (!me) return;
    var tt = elapsed(), T_ = times(), myId = env.myId(), vs = env.viewers(), lt = tt - T_.lights;
    if (VW) camUpdate(tt, T_, dt);
    /* from the fade on, everyone's frozen where they stood on the dance floor, as a point in the world */
    if (tt >= T_.fade && camB) Object.keys(vs).forEach(function (id) { if (!introPos[id]) { var v = vs[id], w = fromScreen(v.x * VW, v.y * VH, camB); introPos[id] = { x: w[0], y: w[1] }; } });
    var pre = tt < T_.pop;
    if (pre) { var ip = introPos[myId]; if (ip) { mk.x = ip.x; mk.y = ip.y; } }
    else {
      if (poppedAt < 0) { poppedAt = tt; var ip2 = introPos[myId]; mk.px = ip2 ? ip2.x : mk.x; mk.py = ip2 ? ip2.y : mk.y; var sp = slotPos(myId); mk.sx = sp.x; mk.sy = sp.y; mk.a = sp.a; ready = true; var el = $("ktUI"); if (el) el.classList.add("ready"); document.body.classList.add("kt-ready"); }
      if (tt < T_.pop + 0.8 * T_.S) { var u = ease((tt - poppedAt) / (0.8 * T_.S)); mk.x = mk.px + (mk.sx - mk.px) * u; mk.y = mk.py + (mk.sy - mk.py) * u; }
    }
    /* the lights, and the rocket start: hold gas from the "2" and keep holding at GO */
    var inp = input(), racing = tt >= T_.go;
    if (!pre && !racing) {
      if (lt >= 0) { lightsOn = true; lights(lt); }
      if (inp.gas && !wasGas) gasPress = lt; else if (!inp.gas) gasPress = null; wasGas = inp.gas;
      inp = { m: 0, ta: 0, gas: false, brake: false, drift: false };
    } else if (racing && !sentGo) {
      sentGo = true; goGo();
      if (T("autoGas") < 0.5 && wasGas) { if (gasPress !== null && gasPress >= 1.0) { mk.boost = T("startBoost"); add(60, mk.x, mk.y, "ROCKET START!", "#FF8A2B"); fxBurst(mk.x, mk.y, "#FF8A2B", 18); } else { stall = 0.9; add(0, mk.x, mk.y, "TOO EARLY!", "#ff4d4d"); } }
    } else if (pre) inp = { m: 0, ta: 0, gas: false, brake: false, drift: false };
    if (stall > 0) { stall -= dt; inp.gas = false; }
    if (racing) {
      step(mk, inp, dt);
      if (onPad(mk.x, mk.y) && mk.boost < T("padTime") * 0.6) { mk.boost = T("padTime"); fxBurst(mk.x, mk.y, "#F5F23D", 8); }
      Object.keys(remotes).forEach(function (id) { var r = remotes[id]; if (!r.race) return; var dx = mk.x - r.x, dy = mk.y - r.y, d = Math.hypot(dx, dy); if (d > 0 && d < 17) { var o = (17 - d) / 2; mk.x += dx / d * o; mk.y += dy / d * o; mk.vx *= 0.985; mk.vy *= 0.985; } });
      var r2 = myP.update(mk.x, mk.y);
      if (mk.ev) { var bonus = mk.ev === "turbo" ? T("driftPts") * 2 : T("driftPts"); add(bonus, mk.x, mk.y, mk.ev === "turbo" ? "TURBO!" : "MINI-TURBO", mk.ev === "turbo" ? "#FF8A2B" : "#3DF2FF"); fxBurst(mk.x, mk.y, mk.ev === "turbo" ? "#FF8A2B" : "#3DF2FF", 14); }
      if (myP.acc > myP.best) { var dd = myP.acc - myP.best; if (dd < 60) { var before = Math.floor(myP.best / tr.L), after = Math.floor(myP.acc / tr.L); distAcc += dd / 100 * T("distPts"); if (distAcc >= 1) { var dp = Math.floor(distAcc); distAcc -= dp; add(dp); } if (after > before && after > 0) { add(T("lapPts"), mk.x, mk.y, "LAP " + after, "#F5F23D"); banner("LAP " + (after + 1)); } } myP.best = myP.acc; }
      wrong = clamp(wrong + ((Math.cos(mk.a - r2.a) < -0.3 && mk.spd > 25) ? dt : -dt * 2), 0, 1);
      if (mk.drift && Math.random() < 0.7) fx.push({ x: mk.x - Math.cos(mk.a) * 8, y: mk.y - Math.sin(mk.a) * 8, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, t: now, life: 350, c: mk.charge >= T("turboT") ? "#FF8A2B" : mk.charge >= T("miniT") ? "#3DF2FF" : "#fff" });
      if (mk.boost > 0 && Math.random() < 0.6) fx.push({ x: mk.x - Math.cos(mk.a) * 12, y: mk.y - Math.sin(mk.a) * 12, vx: -mk.vx * 0.2 + (Math.random() - 0.5) * 20, vy: -mk.vy * 0.2 + (Math.random() - 0.5) * 20, t: now, life: 300, c: "#FFB04A" });
    }
    /* tell everyone where you are, once you're in your kart */
    if (!pre) { var e = enc(mk.x, mk.y); me.tx = me.x = clamp(e[0], 0.002, 0.998); me.ty = me.y = clamp(e[1], 0.002, 0.998); env.sendPos(me.tx, me.ty); }
    env.pose([2.1 + (inp.m ? Math.sin(wrapA(inp.ta - mk.a)) * 0.3 : 0), -2.1 + (inp.m ? Math.sin(wrapA(inp.ta - mk.a)) * 0.3 : 0), 0.25, -0.25]);
    /* the others, and so what place you're in */
    var list = [{ id: "me", t: myP.acc }];
    Object.keys(vs).forEach(function (id) {
      if (id === myId) return; var v = vs[id];
      if (id.indexOf("bot") === 0 && env.practice()) botMove(id, v, dt, now, tt, T_);
      if (v.dance !== 4) { delete remotes[id]; return; }
      var r = remoteStep(id, v, dt, tt, T_); if (r.race) list.push({ id: id, t: r.P.acc });
    });
    Object.keys(remotes).forEach(function (id) { if (!vs[id]) delete remotes[id]; });
    list.sort(function (a, b) { return b.t - a.t; }); nKarts = list.length; var nr = 1 + list.findIndex(function (e2) { return e2.id === "me"; });
    if (racing) {
      if (nr < rank && now - lastRankChg > 1200) { lastRankChg = now; add(T("passPts"), mk.x, mk.y, "PASS!", "#FF3DA8"); }
      if (nKarts > 1) { rankAcc += dt * T("rankPts") * (nKarts - nr) / (nKarts - 1); if (rankAcc >= 1) { var rp = Math.floor(rankAcc); rankAcc -= rp; add(rp); } }
    }
    rank = nr; hudLive(tt, T_);
  }
  function add(n, x, y, txt, col) { if (n) { score += n; env.pts(n); } if (txt) pops.push({ x: x, y: y, t: performance.now(), txt: txt + (n ? " +" + n : ""), col: col || "#F5F23D" }); hud(); }
  function fxBurst(x, y, c, n) { var now = performance.now(); for (var i = 0; i < n; i++) { var a = Math.random() * 6.3, s = 30 + Math.random() * 70; fx.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: now, life: 450, c: c }); } }

  /* ---- other karts: smoothed from the positions that arrive about ten times a second ---- */
  function remoteStep(id, v, dt, tt, T_) {
    var r = remotes[id], race = !!(v.sk && v.sk.f === 1), world;
    if (race) { var d0 = dec(v.tx, v.ty); world = { x: d0[0], y: d0[1] }; } else world = introPos[id] || { x: PZ.cx, y: PZ.cy };
    if (!r) { r = remotes[id] = { x: world.x, y: world.y, a: 0, spd: 0, P: new Prog(tr), lean: 0, v: v, race: false }; r.P.reset(r.x, r.y); }
    r.v = v; var dx = world.x - r.x, dy = world.y - r.y;
    if (race !== r.race || Math.hypot(dx, dy) > 220) { if (race && !r.race) r.a = pointAt(tr, 0, 0).a; r.x = world.x; r.y = world.y; r.P.reset(r.x, r.y); dx = dy = 0; r.race = race; }
    var f = 1 - Math.exp(-dt * 10), nx = r.x + dx * f, ny = r.y + dy * f, mv = Math.hypot(nx - r.x, ny - r.y);
    if (race && mv > 0.04 && dt > 0) { var na = Math.atan2(ny - r.y, nx - r.x), da = wrapA(na - r.a); r.lean += (da / Math.max(dt, 0.001) * 0.1 - r.lean) * 0.2; r.a += da * 0.25; r.spd += (mv / Math.max(dt, 0.001) - r.spd) * 0.15; } else r.spd *= 0.9;
    r.x = nx; r.y = ny; if (race) r.P.update(r.x, r.y); return r;
  }
  /* practice bots: wait on the floor for the pop, then drive the line with a little weave at their own pace */
  function botMove(id, v, dt, now, tt, T_) {
    var b = bots[id];
    if (!b) { var k = Object.keys(env.viewers()).sort().indexOf(id), gs = gridSlot(tr, k < 0 ? 5 : k); b = bots[id] = { d: (gs.d + tr.L) % tr.L, lat: gs.lat, sp: 0.62 + Math.random() * 0.3, ph: Math.random() * 6, from: null }; }
    v.dance = 4; if (tt < T_.pop) { v.sk = { h: 0, f: 0, t: 0 }; return; }
    if (tt < T_.go) { var p0 = pointAt(tr, b.d, b.lat), ip = introPos[id] || { x: p0.x, y: p0.y }, u = ease((tt - T_.pop) / (0.8 * T_.S)), e0 = enc(ip.x + (p0.x - ip.x) * u, ip.y + (p0.y - ip.y) * u); v.tx = e0[0]; v.ty = e0[1]; v.sk = { h: 0, f: 1, t: 0 }; return; }
    var curve = Math.abs(wrapA(pointAt(tr, b.d + 40, 0).a - pointAt(tr, b.d, 0).a)); curve = Math.min(1, curve * 3);
    var spd = T("maxSpeed") * b.sp * (1 - curve * 0.25); b.d += spd * dt;
    b.lat += (Math.sin(now / 900 + b.ph) * tr.hw * 0.5 - b.lat) * Math.min(1, dt * 2);
    var p = pointAt(tr, b.d, b.lat), e = enc(p.x, p.y); v.tx = e[0]; v.ty = e[1]; v.sk = { h: Math.round(Math.min(1, spd / (T("maxSpeed") * 1.45)) * 60), f: 1, t: curve > 0.5 ? 1 : 0 };
  }

  /* ---- drawing: a little bike seen from above with the rider standing on it ---- */
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill(); }
  function bike(ctx, k, scaleIn) {
    var sc = toScreen(k.x, k.y), u = cam.z * (scaleIn === undefined ? 1 : scaleIn), L = 17 * u, v = k.v, col = v.color || "#e33";
    ctx.save(); ctx.translate(sc[0], sc[1]);
    ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(0, 3 * u, L * 1.1, L * 0.55, k.a, 0, 6.3); ctx.fill();
    ctx.rotate(k.a);
    if (k.boost) { ctx.fillStyle = "#FF8A2B"; ctx.beginPath(); ctx.moveTo(-L, -3 * u); ctx.lineTo(-L - (14 + Math.random() * 8) * u, 0); ctx.lineTo(-L, 3 * u); ctx.fill(); ctx.fillStyle = "#FFF3A0"; ctx.beginPath(); ctx.moveTo(-L, -1.4 * u); ctx.lineTo(-L - (7 + Math.random() * 4) * u, 0); ctx.lineTo(-L, 1.4 * u); ctx.fill(); }
    ctx.fillStyle = "#15111a"; rr(ctx, -L - 1 * u, -3.5 * u, 11 * u, 7 * u, 3 * u); rr(ctx, L - 10 * u, -3.5 * u, 11 * u, 7 * u, 3 * u);
    ctx.fillStyle = col; rr(ctx, -L * 0.7, -3 * u, L * 1.5, 6 * u, 3 * u);
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(-L * 0.4, -2 * u, L * 0.9, 1.4 * u);
    ctx.fillStyle = "#cfd3da"; ctx.fillRect(L * 0.5, -8 * u, 2.6 * u, 16 * u);
    ctx.fillStyle = "#fff6b0"; ctx.beginPath(); ctx.arc(L + 3 * u, 0, 2.2 * u, 0, 6.3); ctx.fill();
    ctx.restore();
    env.avatar(sc[0], sc[1] - 13 * u, v, k.me, clamp(1.0 * u, 0.7, 2.6), [2.1 + (k.lean || 0) * 0.3, -2.1 + (k.lean || 0) * 0.3, 0.25, -0.25]);
  }
  function dancer(ctx, id, v, isMe, w, tt) {
    var sc = toScreen(w.x, w.y), base = camB ? Math.max(0.6, 2 * cam.z / camB.z) : 2, ph = tt * 6 + (v.seed || 0), s = Math.sin(ph);
    env.avatar(sc[0], sc[1], v, isMe, base, [1.3 + s * 0.9, -1.3 - s * 0.9, s * 0.3, -s * 0.3]);
  }
  function draw(ctx) {
    if (!on) return;
    var tt = elapsed(), T_ = times(), now = performance.now(), vs = env.viewers(), myId = env.myId();
    if (tt < T_.fade) return;                                   /* the venue floor is still showing: nothing of ours yet */
    /* the boost pads */
    ctx.save(); ctx.translate(VW / 2 - cam.x * cam.z, VH / 2 - cam.y * cam.z); ctx.scale(cam.z, cam.z);
    tr.pads.forEach(function (d) { var p = pointAt(tr, d, 0); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = "rgba(20,10,40,.85)"; ctx.fillRect(-tr.padL / 2, -tr.padW, tr.padL, tr.padW * 2);
      for (var c = 0; c < 3; c++) { var ph = ((now / 260 + c) % 3) / 3; ctx.globalAlpha = Math.sin(ph * Math.PI); ctx.fillStyle = c % 2 ? "#3DF2FF" : "#F5F23D"; ctx.beginPath(); var xx = -tr.padL / 2 + ph * tr.padL; ctx.moveTo(xx - 6, -22); ctx.lineTo(xx + 5, 0); ctx.lineTo(xx - 6, 22); ctx.lineTo(xx - 1, 0); ctx.closePath(); ctx.fill(); }
      ctx.restore(); });
    ctx.restore();
    fx = fx.filter(function (f) { var a = (now - f.t) / f.life; if (a >= 1) return false; var s = toScreen(f.x + f.vx * a * 0.45, f.y + f.vy * a * 0.45); ctx.globalAlpha = 1 - a; ctx.fillStyle = f.c; var z = Math.max(2, 3 * cam.z); ctx.fillRect(s[0] - z / 2, s[1] - z / 2, z, z); return true; }); ctx.globalAlpha = 1;
    var all = [], popK = clamp((tt - T_.pop) / (0.8 * T_.S), 0, 1);
    Object.keys(vs).forEach(function (id) {
      var v = vs[id], isMe = id === myId; if (!isMe && v.dance !== 4) return;
      if (isMe) { if (tt < T_.pop) all.push({ dance: true, id: id, v: v, me: true, w: introPos[id] || { x: PZ.cx, y: PZ.cy } }); else all.push({ x: mk.x, y: mk.y, a: mk.a, v: v, me: true, boost: mk.boost > 0, lean: mk.drift ? mk.drift * 1.2 : 0, pop: popK }); return; }
      var r = remotes[id]; if (!r) return;
      if (!r.race) all.push({ dance: true, id: id, v: v, me: false, w: introPos[id] || { x: r.x, y: r.y } });
      else all.push({ x: r.x, y: r.y, a: r.a, v: v, me: false, boost: v.sk && v.sk.t === 2, lean: r.lean, pop: popK });
    });
    all.sort(function (p, q) { var py = p.dance ? p.w.y : p.y, qy = q.dance ? q.w.y : q.y; return py - qy; });
    all.forEach(function (k) { if (k.dance) dancer(ctx, k.id, k.v, k.me, k.w, tt); else { if (k.pop < 1) { var s = toScreen(k.x, k.y); ctx.globalAlpha = 1; ctx.strokeStyle = "rgba(61,242,255," + (1 - k.pop) + ")"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(s[0], s[1], (0.4 + k.pop) * 34 * cam.z, 0, 6.3); ctx.stroke(); } bike(ctx, k, 0.3 + 0.7 * k.pop); } });
    pops = pops.filter(function (p) { var a = (now - p.t) / 900; if (a > 1) return false; var s = toScreen(p.x, p.y); ctx.globalAlpha = 1 - a; ctx.font = "900 16px system-ui"; ctx.textAlign = "center"; ctx.lineWidth = 3; ctx.strokeStyle = "rgba(0,0,0,.75)"; ctx.strokeText(p.txt, s[0], s[1] - 40 - a * 30); ctx.fillStyle = p.col; ctx.fillText(p.txt, s[0], s[1] - 40 - a * 30); return true; });
    ctx.globalAlpha = 1;
  }
  function hide() { return on && elapsed() >= times().fade; }

  /* ---- the on-screen bits ---- */
  var CSS = "#ktUI{display:none;position:fixed;inset:0;z-index:21;pointer-events:none;font-family:system-ui,sans-serif}#ktUI.on{display:block}" +
    "#ktBanner{position:absolute;left:50%;top:22%;transform:translateX(-50%);font:900 clamp(26px,6vw,54px)/1 system-ui;color:#fff;text-shadow:0 0 16px #3df2ff,0 0 30px #ff3dd8,0 3px 0 #000;white-space:nowrap;opacity:0;letter-spacing:2px}#ktBanner.pop{animation:moshPop 2.2s ease-out forwards}" +
    "#ktRank{position:absolute;right:14px;top:84px;text-align:right;font:900 30px/1 system-ui;color:#F5F23D;text-shadow:0 0 10px #ff3dd8,0 2px 0 #000;opacity:0;transition:opacity .4s}#ktRank small{display:block;font:800 13px system-ui;color:#fff;margin-top:3px;letter-spacing:1px}" +
    "#ktScore{position:absolute;right:14px;top:138px;font:900 18px system-ui;color:#3DF2FF;text-shadow:0 2px 0 #000;opacity:0;transition:opacity .4s}#ktScore::before{content:'🏍 ';font-size:15px}" +
    "#ktBars{position:absolute;right:14px;top:166px;width:150px;opacity:0;transition:opacity .4s}#ktBars div{height:8px;border-radius:4px;background:rgba(0,0,0,.55);border:1px solid rgba(61,242,255,.6);overflow:hidden;margin-bottom:5px}#ktBars i{display:block;height:100%;width:0}" +
    "#ktUI.ready #ktRank,#ktUI.ready #ktScore,#ktUI.ready #ktBars{opacity:1}" +
    "#ktSp i{background:linear-gradient(90deg,#3DF2FF,#F5F23D,#ff3dd8)}#ktDr i{background:#fff}" +
    "#ktLights{position:absolute;left:50%;top:30%;transform:translateX(-50%);display:none;gap:14px;flex-direction:column;align-items:center}#ktLights .row{display:flex;gap:14px}#ktLights b{width:34px;height:34px;border-radius:50%;background:#2a1a1a;border:3px solid #000}#ktLights b.r{background:#ff2b2b;box-shadow:0 0 18px #ff2b2b}#ktLights b.g{background:#2bff6a;box-shadow:0 0 22px #2bff6a}" +
    "#ktNum{font:900 72px/1 system-ui;color:#fff;text-shadow:0 0 18px #3df2ff,0 4px 0 #000}#ktGasCue{font:900 20px system-ui;color:#2bff6a;text-shadow:0 2px 0 #000;display:none;animation:ktBlink .5s infinite alternate}@keyframes ktBlink{from{opacity:.4}to{opacity:1}}" +
    "#ktWrong{position:absolute;left:50%;top:44%;transform:translateX(-50%);font:900 22px system-ui;color:#ff4d4d;text-shadow:0 2px 0 #000;display:none}" +
    "#ktHint{position:absolute;left:50%;transform:translateX(-50%);bottom:300px;font:600 12px system-ui;color:rgba(255,255,255,.85);text-shadow:0 1px 3px #000;white-space:nowrap;opacity:0;transition:opacity .4s}#ktUI.ready #ktHint{opacity:1}" +
    ".ktB{position:absolute;border-radius:50%;pointer-events:auto;touch-action:none;color:#fff;font:900 16px system-ui;letter-spacing:1px;display:flex;flex-direction:column;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none;border:3px solid #3df2ff;background:radial-gradient(circle,rgba(61,242,255,.4),rgba(20,8,30,.88));transform:translateY(110vh);transition:transform .6s cubic-bezier(.2,1.2,.4,1)}" +
    "#ktUI.ready .ktB{transform:none}.ktB small{font:600 10px system-ui;opacity:.75;margin-top:2px}.ktB.dn{background:radial-gradient(circle,rgba(255,61,216,.6),rgba(20,8,40,.9))}#ktUI.ready .ktB.dn{transform:scale(.93)}" +
    "#ktGas{right:16px;bottom:140px;width:104px;height:104px;border-color:#2bff6a;font-size:20px}#ktDrift{right:126px;bottom:150px;width:74px;height:74px;font-size:13px;border-color:#ff3dd8}#ktBrake{right:34px;bottom:256px;width:58px;height:58px;font-size:12px;border-color:#ff8a2b}" +
    "body.practice #ktGas{bottom:60px}body.practice #ktDrift{bottom:70px}body.practice #ktBrake{bottom:176px}" +
    "@media (pointer:fine){#ktGas{width:84px;height:84px;font-size:16px;bottom:120px}#ktDrift{bottom:124px}#ktBrake{bottom:218px}}" +
    "body.gaming-kart #reactBar{display:none}body.gaming-kart #moveCtl{transition:transform .6s cubic-bezier(.2,1.2,.4,1)}body.gaming-kart:not(.kt-ready) #moveCtl{transform:translateY(110vh)}body.gaming-kart #moveHint{display:none}";
  function ui(show) {
    var el = $("ktUI");
    if (!el) {
      var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
      el = document.createElement("div"); el.id = "ktUI";
      el.innerHTML = '<div id="ktBanner"></div><div id="ktRank">1st<small>LAP 1</small></div><div id="ktScore">0</div><div id="ktBars"><div id="ktSp"><i></i></div><div id="ktDr"><i></i></div></div>' +
        '<div id="ktLights"><div class="row"><b></b><b></b><b></b></div><div id="ktNum"></div><div id="ktGasCue">HOLD GAS!</div></div><div id="ktWrong">WRONG WAY!</div><div id="ktHint"></div>' +
        '<button class="ktB" id="ktGas" aria-label="Gas">GAS<small>hold</small></button><button class="ktB" id="ktDrift" aria-label="Drift">DRIFT</button><button class="ktB" id="ktBrake" aria-label="Brake">BRAKE</button>';
      document.body.appendChild(el);
      var hold = function (id, set) { var b = $(id), pid = null; b.addEventListener("pointerdown", function (e) { e.preventDefault(); e.stopPropagation(); pid = e.pointerId; try { b.setPointerCapture(pid); } catch (x) {} b.classList.add("dn"); set(true); });
        var up = function (e) { if (e.pointerId !== pid) return; pid = null; b.classList.remove("dn"); set(false); }; b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up); b.addEventListener("lostpointercapture", up); };
      hold("ktGas", function (v) { gasBtn = v; }); hold("ktDrift", function (v) { driftHold = v; }); hold("ktBrake", function (v) { brakeBtn = v; });
    }
    el.classList.toggle("on", !!show); el.classList.remove("ready"); document.body.classList.toggle("gaming-kart", !!show); document.body.classList.remove("kt-ready");
    if (show) { driftHold = gasBtn = brakeBtn = false; var lg = $("ktLights"); if (lg) lg.style.display = "none"; }
  }
  function banner(t) { var b = $("ktBanner"); if (!b) return; b.textContent = t; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  function hud() { var s = $("ktScore"); if (s) s.textContent = score.toLocaleString(); }
  var lastBan = false;
  function lights(lt) {
    var el = $("ktLights"); if (!el) return; el.style.display = "flex"; var n = lt < 1 ? 3 : lt < 2 ? 2 : 1, bs = el.querySelectorAll(".row b");
    for (var q = 0; q < 3; q++) bs[q].className = (3 - q) <= n ? "r" : ""; $("ktNum").textContent = String(n); $("ktGasCue").style.display = lt >= 1 ? "block" : "none";
  }
  function goGo() { var el = $("ktLights"); if (el) { Array.prototype.forEach.call(el.querySelectorAll(".row b"), function (b) { b.className = "g"; }); $("ktNum").textContent = "GO!"; $("ktGasCue").style.display = "none"; setTimeout(function () { el.style.display = "none"; }, 800); } }
  function ordinal(n) { return n + (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"); }
  function hudLive(tt, T_) {
    if (!lastBan && tt >= T_.hold) { lastBan = true; banner(tr.name.toUpperCase()); } if (tt < T_.hold) lastBan = false;
    var r = $("ktRank"); if (r) r.innerHTML = ordinal(rank) + (nKarts > 1 ? " <span style='font-size:15px;color:#fff'>/ " + nKarts + "</span>" : "") + "<small>LAP " + (Math.max(0, Math.floor(myP.acc / tr.L)) + 1) + "</small>";
    var sp = $("ktSp"), dr = $("ktDr"); if (sp && sp.firstChild) sp.firstChild.style.width = Math.round(Math.min(1, mk.spd / (T("maxSpeed") * 1.3)) * 100) + "%";
    if (dr && dr.firstChild) { dr.firstChild.style.width = Math.round(Math.min(1, mk.charge / T("turboT")) * 100) + "%"; dr.firstChild.style.background = mk.charge >= T("turboT") ? "#FF8A2B" : mk.charge >= T("miniT") ? "#3DF2FF" : "#fff"; }
    var w = $("ktWrong"); if (w) w.style.display = wrong > 0.6 ? "block" : "none";
    var h = $("ktHint"); if (h) h.textContent = mk.drift ? "Hold the drift… let go for a boost" : tt < T_.go ? "Hold GAS when the 2 shows for a rocket start" : mk.spd < 30 ? "Hold GAS and push the stick where you want to go" : "Hold DRIFT while turning, let go for a boost · yellow pads boost";
  }

  K.bind = function (e) { env = e; };
  K.start = start; K.stop = stop; K.tick = tick; K.bg = bg; K.draw = draw; K.perf = perf; K.hide = hide;
  K.wire = function () { var T_ = times(); return mk ? { h: Math.round(Math.min(1, mk.spd / (T("maxSpeed") * 1.45)) * 60), f: elapsed() >= T_.pop ? 1 : 0, t: mk.boost > 0 ? 2 : mk.drift ? 1 : 0 } : { h: 0, f: 0, t: 0 }; };
  K.drift = function (v) { driftHold = !!v; };
  K.gas = function (v) { gasBtn = !!v; };
  K.brake = function (v) { brakeBtn = !!v; };
  Object.defineProperty(K, "on", { get: function () { return on; } });
  root.ukKart = function () { var tt = on ? elapsed() : 0, T_ = times(); return { on: on, track: tr.name, trackIdx: trIdx, t: +tt.toFixed(1), phase: tt < T_.fade ? "ufo" : tt < T_.hold ? "zoomout" : tt < T_.lights ? "grid" : tt < T_.go ? "lights" : "race", go: +T_.go.toFixed(1), score: score, rank: rank, n: nKarts, lap: myP ? Math.floor(myP.acc / tr.L) : 0, prog: myP ? Math.round(myP.acc) : 0, L: Math.round(tr.L), x: mk ? Math.round(mk.x) : 0, y: mk ? Math.round(mk.y) : 0, spd: mk ? Math.round(mk.spd) : 0, a: mk ? +mk.a.toFixed(2) : 0, tang: mk && mk.pa !== undefined ? +mk.pa.toFixed(2) : 0, lat: mk && mk.lat !== undefined ? Math.round(mk.lat) : 0, drift: mk ? mk.drift : 0, boost: mk ? mk.boost > 0 : false, zoom: +cam.z.toFixed(2) }; };
})(typeof window !== "undefined" ? window : this);
