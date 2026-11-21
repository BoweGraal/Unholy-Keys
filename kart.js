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
  var KP = 3;   /* the pixel size for round things on the track, in track units */
  var WW = 1000, WH = 620;

  /* ---- numbers you can tweak in the Tuning lab (the lab's group "kt"); these are the fallbacks ---- */
  var DEF = { maxSpeed: 260, accel: 130, brake: 260, coast: 70, wall: 0.35, turn: 3.4, grip: 0.002, revSpeed: 0.45,
    hop: 0.3, hopTurn: 7, driftK: 2.2, driftTrim: 0.15, trimRate: 1.5, miniT: 0.8, turboT: 1.6, ultraT: 2.6, boost1: 0.7, boost2: 1.1, boost3: 1.6, boostMul: 1.4, padTime: 1.1, startBoost: 1.4, intro: 1,
    distPts: 40, lapPts: 400, rankPts: 6, passPts: 30, driftPts: 50, hw: 48 };
  var env = null;
  function T(k) { if (k === "intro" && typeof root.__kartIntro === "number") return root.__kartIntro; var v = env && env.tune ? env.tune("kt." + k) : undefined; return typeof v === "number" && isFinite(v) ? v : DEF[k]; }

  /* ================= geometry ================= */
  /* the template track (the Track builder starts from this): a snake down the floor and back up the left side.
     Control points go round in driving order; the first point is the start line, in the middle of the dance floor. */
  var TEMPLATE = { name: "Dance Floor Snake", hw: 52,   /* Brian's design from the Track builder (v2: the long loop out east) */
    pads: [0.09, 0.33, 0.9, [0.3075, 29], [0.3061, -35], [0.3837, 21], 0.5751, 0.7873, 0.6018, 0.6297, 0.6358, [0.6676, 18], [0.7291, -38], [0.7438, -35], [0.6949, -38], [0.7112, -38], 0.8395, 0.964, 0.188, 0.2351, [0.4028, -38], 0.4671, [0.4899, 38], [0.5079, 22]],
    pts: [[200, 90], [445, 29], [576, -15], [782, 3], [1025, -148], [1238, -183], [1291, -34], [1184, 94], [985, 121], [801, 203], [608, 196], [428, 211], [295, 256], [214, 336], [298, 432], [534, 393], [696, 405], [850, 386], [1045, 302], [1257, 272], [1597, 115], [1517, -513], [1743, -641], [1930, -470], [1802, -194], [1789, 22], [1922, 283], [2207, 560], [2033, 847], [1214, 694], [881, 694], [495, 579], [300, 560], [140, 550], [90, 460], [90, 300], [100, 150], [140, 95]] };
  /* a track from the builder or the network: numbers checked and clamped, or null */
  var LIM0 = -4000, LIM1 = 5000, ENC0 = -4200, ENCS = 9400;
  function clean(d) {
    if (!d || typeof d !== "object" || !Array.isArray(d.pts)) return null;
    var pts = d.pts.filter(function (p) { return Array.isArray(p) && isFinite(+p[0]) && isFinite(+p[1]); }).slice(0, 200).map(function (p) { return [Math.round(Math.max(LIM0, Math.min(LIM1, +p[0]))), Math.round(Math.max(LIM0, Math.min(LIM1, +p[1])))]; });
    if (pts.length < 4) return null;
    /* a boost pad is a fraction of the way round (in the middle of the road), or [fraction, sideways offset] for one off to the side */
    var hw0 = Math.round(Math.max(30, Math.min(80, +d.hw || 52)));
    var pads = Array.isArray(d.pads) ? d.pads.map(function (f) { var fr = Array.isArray(f) ? +f[0] : +f, la = Array.isArray(f) ? +f[1] : 0; if (!isFinite(fr)) return null; fr = Math.round(Math.max(0, Math.min(0.9999, fr)) * 10000) / 10000; la = isFinite(la) ? Math.round(Math.max(-(hw0 - 14), Math.min(hw0 - 14, la))) : 0; return la ? [fr, la] : fr; }).filter(function (f) { return f !== null; }).slice(0, 24) : [];
    return { name: String(d.name || "Custom track").slice(0, 40), hw: hw0, pads: pads, pts: pts };
  }
  function build(def) {
    def = clean(def) || clean(TEMPLATE);
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
    var M = Math.max(40, Math.round(L / 6)), P = [], j = 0;
    for (i = 0; i < M; i++) {
      var d = i * L / M; while (j < R - 1 && cum[j + 1] < d) j++;
      var s0 = raw[j], s1 = raw[(j + 1) % R], fr = (d - cum[j]) / ((cum[j + 1] - cum[j]) || 1);
      P.push({ x: s0[0] + (s1[0] - s0[0]) * fr, y: s0[1] + (s1[1] - s0[1]) * fr, d: d, a: 0 });
    }
    for (i = 0; i < M; i++) { var q0 = P[(i + M - 1) % M], q1 = P[(i + 1) % M]; P[i].a = Math.atan2(q1.y - q0.y, q1.x - q0.x); }
    var tr = { name: def.name, def: def, P: P, L: L, M: M, hw: def.hw, pads: def.pads.map(function (f) { var la = Array.isArray(f) ? f[1] : 0; return { d: (Array.isArray(f) ? f[0] : f) * L, lat: la, w: la ? 16 : Math.min(38, def.hw - 10) }; }), padW: Math.min(38, def.hw - 10), padL: 30 };
    /* the dance floor: a wide plaza the start line runs through, turned to face the way the track starts */
    var s = P[0]; tr.plaza = { cx: s.x, cy: s.y, a: s.a, hx: 150, hy: Math.max(95, def.hw + 40) };
    var bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; P.forEach(function (q) { bx0 = Math.min(bx0, q.x); bx1 = Math.max(bx1, q.x); by0 = Math.min(by0, q.y); by1 = Math.max(by1, q.y); });
    tr.box = { x0: bx0 - 60, y0: by0 - 60, x1: bx1 + 60, y1: by1 + 60 };
    return tr;
  }
  /* the narrowest gap between two bits of road that aren't next to each other (under 2 x width + a bit = they overlap) */
  function minGap(tr) {
    var P = tr.P, best = 1e9, at = null, st = Math.max(1, Math.round(tr.M / 300));
    for (var i = 0; i < P.length; i += st) for (var j = i + st; j < P.length; j += st) {
      var dd = Math.abs(P[i].d - P[j].d); dd = Math.min(dd, tr.L - dd); if (dd < tr.hw * 4 + 60) continue;
      var e = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y); if (e < best) { best = e; at = [(P[i].x + P[j].x) / 2, (P[i].y + P[j].y) / 2]; }
    }
    return { gap: best, at: at, ok: best >= tr.hw * 2 + 8 };
  }
  var TR = [build(TEMPLATE)];
  function trackFor(n, def) { return def ? build(def) : TR[0]; }
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
  function gridSlot(tr, k) { var row = Math.min(7, Math.floor(k / 3)) + (k >= 24 ? (k - 24) * 0.05 : 0), col = k % 3 - 1; return { d: tr.L - 28 - row * 40, lat: col * tr.hw * 0.68 }; }

  /* positions travel as 0..1 of the world plus a margin, so karts can drive a little past the edge of the 1000 x 620 map */
  /* tracks can be drawn anywhere from -4000 to 5000 (the builder is an endless canvas); positions travel as 0..1 of that, about 1 unit precise */
  function enc(x, y) { return [(x - ENC0) / ENCS, (y - ENC0) / ENCS]; }
  function dec(nx, ny) { return [nx * ENCS + ENC0, ny * ENCS + ENC0]; }
  /* the dance floor: a wide pulsing plaza the start line runs through (every track starts heading east) */
  var GEO = { W: WW, H: WH, tracks: TR, trackFor: trackFor, pointAt: pointAt, project: project, Prog: Prog, gridSlot: gridSlot, DEF: DEF, enc: enc, dec: dec, build: build, clean: clean, minGap: minGap, TEMPLATE: TEMPLATE };
  if (typeof module !== "undefined" && module.exports) module.exports = { geo: GEO };

  /* ================= everything below needs a browser ================= */
  var hasDom = typeof window !== "undefined" && typeof document !== "undefined" && typeof document.getElementById === "function";
  var K = { geo: GEO };
  root.KART = K;
  if (!hasDom) return;

  var on = false, rnd = null, tr = TR[0], trIdx = 0, MASK = null, ROADP = null, PZ = TR[0].plaza, me = null, mk = null, myP = null, remotes = {}, bots = {}, fx = [], pops = [], introPos = {};
  var startAt = 0, lastT = 0, score = 0, rank = 1, nKarts = 1, rankAcc = 0, lastRankChg = 0, wrong = 0, distAcc = 0, stall = 0, lastBan = false;
  var driftHold = false, gasPress = null, wasGas = false, camB = null, poppedAt = -1, sentGo = false;
  var cam = { x: 500, y: 310, z: 1 }, bgCv = null, bgKey = "";
  var TAU = Math.PI * 2, STEP16 = TAU / 16;
  function $(id) { return document.getElementById(id); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function wrapA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
  function ease(u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); }
  function idx16(a) { return ((Math.round(a / STEP16) % 16) + 16) % 16; }

  /* ================= the kart sprite sheet: 16 angles, built from little 3D boxes and pixelated ================= */
  var FW = 48, FH = 48, OX = 24, OY = 28, CY = 0.8, SZ = 0.6, SEAT = [-3, 0, 4];
  /* [x0,x1, y0,y1, z0,z1, colour]  (facing +x, y to the right, z up; units are sprite pixels) */
  var BOXES = [
    [-12, 11, -6, 6, 1, 4, "dk"],                                       /* floor pan */
    [1, 12, -4, 4, 3, 7, "b"],                                          /* nose */
    [11, 15, -7, 7, 1, 3, "bump"],                                      /* front bumper */
    [-9, 5, -8, -5, 2, 6, "b"], [-9, 5, 5, 8, 2, 6, "b"],               /* side pods */
    [-9, -4, -4, 4, 4, 11, "seat"],                                     /* seat back */
    [-14, -11, -8, 8, 9, 11, "lt"], [-13, -12, -2, -1, 4, 9, "metal"], [-13, -12, 1, 2, 4, 9, "metal"],   /* spoiler + posts */
    [-15, -11, -3, -1, 4, 6, "metal"], [-15, -11, 1, 3, 4, 6, "metal"], /* exhausts */
    [12, 13, -3, -1, 4, 6, "lamp"], [12, 13, 1, 3, 4, 6, "lamp"],       /* headlights */
    [6, 11, -10, -7, 0, 5, "tire"], [6, 11, 7, 10, 0, 5, "tire"],       /* front wheels */
    [-12, -5, -11, -7, 0, 6, "tire"], [-12, -5, 7, 11, 0, 6, "tire"]    /* rear wheels (bigger) */
  ];
  var LIGHT = (function () { var l = [-0.45, -0.55, 0.7], m = Math.hypot(l[0], l[1], l[2]); return [l[0] / m, l[1] / m, l[2] / m]; })();
  function hexRgb(h) { h = String(h || "#e33").replace("#", ""); if (h.length === 3) h = h.replace(/(.)/g, "$1$1"); var n = parseInt(h, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mul(c, k) { return "rgb(" + Math.round(clamp(c[0] * k, 0, 255)) + "," + Math.round(clamp(c[1] * k, 0, 255)) + "," + Math.round(clamp(c[2] * k, 0, 255)) + ")"; }
  var SHEETS = {};
  function sheet(col) {
    if (SHEETS[col]) return SHEETS[col];
    var b = hexRgb(col), P = { b: b, dk: b.map(function (v) { return v * 0.5; }), lt: b.map(function (v) { return Math.min(255, v * 1.25 + 30); }), tire: [28, 24, 34], seat: [42, 34, 56], metal: [184, 188, 203], lamp: [255, 242, 160], bump: [70, 64, 92] };
    var frames = [];
    for (var i = 0; i < 16; i++) frames.push(frame(i * STEP16, P));
    return (SHEETS[col] = frames);
  }
  function rot(p, c, s) { return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; }
  function proj(p) { return [OX + p[0], OY + p[1] * CY - p[2] * SZ]; }
  function frame(th, P) {
    var c = Math.cos(th), s = Math.sin(th), faces = [];
    var seat = rot(SEAT, c, s), seatDepth = seat[1] * SZ + seat[2] * CY;
    BOXES.forEach(function (bx) {
      var x0 = bx[0], x1 = bx[1], y0 = bx[2], y1 = bx[3], z0 = bx[4], z1 = bx[5], col = P[bx[6]];
      var F = [[[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [1, 0, 0]], [[x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [-1, 0, 0]],
               [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 1, 0]], [[x1, y0, z0], [x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [0, -1, 0]],
               [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]]];
      F.forEach(function (f) {
        var n = rot(f[4], c, s); if (n[1] * SZ + n[2] * CY <= 0.001) return;
        var pts = f.slice(0, 4).map(function (p) { return rot(p, c, s); }), cx = 0, cy = 0, cz = 0;
        pts.forEach(function (p) { cx += p[0] / 4; cy += p[1] / 4; cz += p[2] / 4; });
        var lit = 0.62 + 0.5 * Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
        faces.push({ pts: pts.map(proj), depth: cy * SZ + cz * CY + (f[4][2] ? 0.01 : 0), ry: cy, fill: mul(col, lit) });
      });
    });
    faces.sort(function (a, b2) { return a.depth - b2.depth; });
    function layer(test) {
      var cv = document.createElement("canvas"); cv.width = FW; cv.height = FH; var g = cv.getContext("2d");
      faces.forEach(function (f) { if (!test(f)) return; g.fillStyle = f.fill; g.beginPath(); f.pts.forEach(function (p, j) { if (j) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); g.fill(); });
      /* make it proper pixel art: hard edges and a dark outline */
      var im = g.getImageData(0, 0, FW, FH), d = im.data, o = new Uint8ClampedArray(d), x, y, k;
      for (k = 3; k < d.length; k += 4) d[k] = d[k] >= 110 ? 255 : 0;
      o.set(d);
      for (y = 0; y < FH; y++) for (x = 0; x < FW; x++) { k = (y * FW + x) * 4; if (d[k + 3]) continue;
        var nb = (x > 0 && d[k - 1]) || (x < FW - 1 && d[k + 7]) || (y > 0 && d[k - FW * 4 + 3]) || (y < FH - 1 && d[k + FW * 4 + 3]);
        if (nb) { o[k] = 18; o[k + 1] = 12; o[k + 2] = 26; o[k + 3] = 255; } }
      im.data.set(o); g.putImageData(im, 0, 0); return cv;
    }
    var sp = proj(seat), rw = [rot([-9, -9, 1], c, s), rot([-9, 9, 1], c, s)].map(proj), ex = [rot([-15, -2, 5], c, s), rot([-15, 2, 5], c, s)].map(proj);
    /* only the low parts well in front of the cockpit (nose, bumper, front wheels) are drawn over the driver; everything else goes under them */
    var front = function (f) { return f.ry > seat[1] + 5; };
    return { under: layer(function (f) { return !front(f); }), over: layer(front), seat: [sp[0] - OX, sp[1] - OY], rw: rw.map(function (p) { return [p[0] - OX, p[1] - OY]; }), ex: ex.map(function (p) { return [p[0] - OX, p[1] - OY]; }) };
  }

  /* ---- the timeline: UFO, fade to space, zoom out (about twice as far as the floor), pop into karts, lights ---- */
  function times() {
    var S = clamp(T("intro"), 0.05, 3), t = {}; t.S = S;
    t.fade = 2.6 * S; t.out = t.fade + 0.5 * S; t.pop = t.out + 1.2 * S; t.zend = t.out + 2.2 * S; t.hold = t.pop; t.lights = t.zend + 0.2 * S; t.go = t.lights + 3;
    return t;
  }
  function elapsed() { return (performance.now() - startAt) / 1000; }

  /* ---- the camera ---- */
  var VW = 0, VH = 0;
  function raceZoom() { return 1.68; }        /* your character at about 1/1.4 of their size on the dance floor */
  function toScreen(x, y) { return [(x - cam.x) * cam.z + VW / 2, (y - cam.y) * cam.z + VH / 2]; }
  function fromScreen(sx, sy, c) { c = c || cam; return [c.x + (sx - VW / 2) / c.z, c.y + (sy - VH / 2) / c.z]; }
  function camUpdate(t, T_, dt) {
    var zr = raceZoom(), z0 = zr * 1.4, mx = mk ? mk.x : PZ.cx, my = mk ? mk.y : PZ.cy;
    if (t < T_.out) { cam.z = z0; cam.x = PZ.cx; cam.y = PZ.cy; if (!camB) camB = { x: cam.x, y: cam.y, z: cam.z }; }
    else if (t < T_.zend) { var u = ease((t - T_.out) / (T_.zend - T_.out)); cam.z = Math.exp(Math.log(z0) + (Math.log(zr) - Math.log(z0)) * u); cam.x = PZ.cx + (mx - PZ.cx) * u; cam.y = PZ.cy + (my - PZ.cy) * u; }
    else { cam.z = zr; var k = 1 - Math.exp(-dt * 7); cam.x += (mx + (mk ? mk.vx : 0) * 0.25 - cam.x) * k; cam.y += (my + (mk ? mk.vy : 0) * 0.25 - cam.y) * k; }
  }

  /* ---- the space backdrop with the track floating in it, painted once (chunky) ---- */
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var BX0 = -100, BY0 = -100, BWW = 1200, BHH = 820, Q = 1.6;
  function bake(m) {
    /* the painted area: the track plus a wide border of space; coarser pixels for very big tracks so phones can hold it */
    m = m || 360;
    BX0 = Math.floor((tr.box.x0 - m) / 13) * 13; BY0 = Math.floor((tr.box.y0 - m) / 13) * 13;   /* lined up with the 13-unit floor tiles */ BWW = Math.ceil(tr.box.x1 - tr.box.x0 + 2 * m); BHH = Math.ceil(tr.box.y1 - tr.box.y0 + 2 * m);
    Q = Math.min(4 / 13, Math.sqrt(12e6 / (BWW * BHH)));   /* pixel art: every floor tile is exactly 4 x 4 big pixels, scaled up blocky */
    var AREA = Math.min(6, BWW * BHH / (1200 * 820));
    var c = document.createElement("canvas"); c.width = Math.round(BWW * Q); c.height = Math.round(BHH * Q);
    var g = c.getContext("2d"), R = rng(11 + trIdx * 131), i;
    g.fillStyle = "#07041a"; g.fillRect(0, 0, c.width, c.height);
    g.setTransform(Q, 0, 0, Q, -BX0 * Q, -BY0 * Q);
    var far = function (x, y, pad) { return project(tr, x, y).dist > tr.hw + pad; };
    for (i = 0; i < Math.round(9 * AREA); i++) { var nx = BX0 + R() * BWW, ny = BY0 + R() * BHH, nr = 120 + R() * 200, gr = ART.PX.rg(g,nx, ny, 0, nx, ny, nr); var cc = [[120, 40, 170], [30, 120, 170], [190, 50, 120]][i % 3]; gr.addColorStop(0, "rgba(" + cc + ",.28)"); gr.addColorStop(1, "rgba(" + cc + ",0)"); g.fillStyle = gr; g.fillRect(nx - nr, ny - nr, nr * 2, nr * 2); }
    for (i = 0; i < Math.round(1500 * AREA); i++) { var sx = BX0 + R() * BWW, sy = BY0 + R() * BHH, b = R(); g.fillStyle = b > 0.93 ? "#ffd9a0" : b > 0.8 ? "#a9d4ff" : "rgba(255,255,255," + (0.35 + R() * 0.5) + ")"; var sz = b > 0.97 ? 2.6 : 1 + R() * 1.2; g.fillRect(sx, sy, sz, sz); }
    var mxp = tr.box.x1 + 150, myp = tr.box.y1 + 140, mr = 190, mg = ART.PX.rg(g,mxp - 50, myp - 60, 10, mxp, myp, mr); mg.addColorStop(0, "#e07a45"); mg.addColorStop(0.7, "#a8421f"); mg.addColorStop(1, "#4a1a10");
    g.fillStyle = mg; ART.PX.disc(g,mxp, myp, mr,KP);
    g.fillStyle = "rgba(90,30,16,.45)"; for (i = 0; i < 9; i++) { ART.PX.oval(g,mxp - 160 + R() * 150, myp - 150 + R() * 130, 8 + R() * 22, 5 + R() * 10, R() * 3,KP); }
    var mnx = tr.box.x0 - 90, mny = tr.box.y0 + 120; g.fillStyle = "#cfd3e6"; ART.PX.disc(g,mnx, mny, 34,KP); g.fillStyle = "rgba(60,60,90,.4)"; ART.PX.disc(g,mnx + 10, mny - 8, 12,KP);
    for (i = 0; i < Math.round(26 * AREA); i++) { var rx = BX0 + R() * BWW, ry = BY0 + R() * BHH; if (!far(rx, ry, 40) || Math.hypot(rx - mxp, ry - myp) < mr + 20 || Math.hypot(rx - mnx, ry - mny) < 50) continue; g.fillStyle = "#4a3a58"; ART.PX.oval(g,rx, ry, 4 + R() * 9, 3 + R() * 6, R() * 3,KP); g.fillStyle = "#7a6890"; g.fillRect(rx - 2, ry - 2, 3, 2); }
    /* the road and the plaza are the dance floor itself: dark checker tiles with a lighter top edge, like the venue floor */
    ROADP = roadPath(); var TS = 13;
    /* the edges first (twice as wide), so the tiles cover their inner half and only the outside border shows */
    g.lineJoin = "round"; g.strokeStyle = "rgba(155,127,224,.18)"; g.lineWidth = 24; g.stroke(ROADP);
    g.strokeStyle = "#9B7FE0"; g.lineWidth = 9; g.stroke(ROADP); g.strokeStyle = "#3a3058"; g.lineWidth = 5; g.stroke(ROADP);
    g.save(); g.clip(ROADP, "nonzero");
    g.fillStyle = "#120e1e"; g.fillRect(BX0, BY0, BWW, BHH);
    for (var ty = Math.floor(BY0 / TS) * TS; ty < BY0 + BHH; ty += TS) for (var tx = Math.floor(BX0 / TS) * TS; tx < BX0 + BWW; tx += TS) {
      g.fillStyle = ((tx / TS + ty / TS) & 1) ? "#1a1430" : "#161128"; g.fillRect(tx, ty, TS - 1, TS - 1); g.fillStyle = "#211a3a"; g.fillRect(tx, ty, TS - 1, 1.2);
    }
    g.restore();
    /* the edges: the floor's front edge and the stage-edge glow line */
    /* which tiles are floor (for the glow that pulses with the beat) */
    MASK = { TS: TS, x0: Math.floor(BX0 / TS) * TS, y0: Math.floor(BY0 / TS) * TS, cols: Math.ceil(BWW / TS) + 1, rows: Math.ceil(BHH / TS) + 1, on: null };
    MASK.on = new Uint8Array(MASK.cols * MASK.rows);
    for (var r2 = 0; r2 < MASK.rows; r2++) for (var c2 = 0; c2 < MASK.cols; c2++) { var cx2 = MASK.x0 + c2 * TS + TS / 2, cy2 = MASK.y0 + r2 * TS + TS / 2; if (inPlaza(cx2, cy2, 0) || project(tr, cx2, cy2).dist < tr.hw) MASK.on[r2 * MASK.cols + c2] = 1; }
    return c;
  }
  /* the outline of the road (left edge out, right edge back) plus the plaza, as one shape */
  function roadPath() {
    var P = new Path2D(), j, p;
    for (j = 0; j <= tr.M; j++) { p = tr.P[j % tr.M]; var x = p.x + Math.sin(p.a) * tr.hw, y = p.y - Math.cos(p.a) * tr.hw; if (j) P.lineTo(x, y); else P.moveTo(x, y); }
    for (j = tr.M; j >= 0; j--) { p = tr.P[j % tr.M]; P.lineTo(p.x - Math.sin(p.a) * tr.hw, p.y + Math.cos(p.a) * tr.hw); }
    P.closePath();
    var c0 = fromPZ(-PZ.hx, -PZ.hy), c1 = fromPZ(PZ.hx, -PZ.hy), c2 = fromPZ(PZ.hx, PZ.hy), c3 = fromPZ(-PZ.hx, PZ.hy);
    P.moveTo(c0[0], c0[1]); P.lineTo(c1[0], c1[1]); P.lineTo(c2[0], c2[1]); P.lineTo(c3[0], c3[1]); P.closePath();
    return P;
  }
  function bg(ctx, W, H) {
    if (!on) return;
    VW = W; VH = H; var tt = elapsed(), T_ = times();
    var key = trIdx + ":" + tr.name + ":" + Math.round(tr.L); if (key !== bgKey) { bgCv = bake(); bgKey = key; }
    var a = ease((tt - T_.fade) / (0.5 * T_.S));
    if (a > 0) {
      ctx.save(); ctx.globalAlpha = a; ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#07041a"; ctx.fillRect(0, 0, W, H);
      ctx.translate(VW / 2 - cam.x * cam.z, VH / 2 - cam.y * cam.z); ctx.scale(cam.z, cam.z);
      ctx.drawImage(bgCv, BX0, BY0, BWW, BHH);
      floorGlow(ctx); startLine(ctx); ctx.restore();
    }
    ufo(ctx, tt, T_);
  }
  /* the tiles light up in waves on the beat, the same way the venue floor does */
  var TILECOL = ["#E8505B", "#F0A040", "#F5D03C", "#4CC38A", "#4A9BE8", "#9B7FE0", "#D354A0"];
  function floorGlow(ctx) {
    if (!MASK || !ROADP) return;
    var ph = env.beat ? env.beat() : 0.5, beat = Math.pow(1 - clamp(ph, 0, 1), 2), t = performance.now() / 1000, TS = MASK.TS;
    var x0 = cam.x - VW / 2 / cam.z, x1 = cam.x + VW / 2 / cam.z, y0 = cam.y - VH / 2 / cam.z, y1 = cam.y + VH / 2 / cam.z;
    var c0 = Math.max(0, Math.floor((x0 - MASK.x0) / TS)), c1 = Math.min(MASK.cols - 1, Math.ceil((x1 - MASK.x0) / TS)), r0 = Math.max(0, Math.floor((y0 - MASK.y0) / TS)), r1 = Math.min(MASK.rows - 1, Math.ceil((y1 - MASK.y0) / TS));
    ctx.save(); ctx.clip(ROADP, "nonzero");
    for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) {
      if (!MASK.on[r * MASK.cols + c]) continue;
      var gx = c, gy = r, wave = Math.sin(gx * 0.9 + gy * 0.6 - t * 2.2) * 0.5 + 0.5, n = ((gx * 7 + gy * 13) % 11) / 11;
      var a = (0.03 + 0.13 * beat * (n > 0.6 ? 1 : 0.25)) * (0.4 + 0.6 * wave) * 0.96; if (a < 0.035) continue;
      ctx.globalAlpha = Math.min(0.2, a); ctx.fillStyle = TILECOL[(gx + gy + Math.floor(t * 0.5)) % 7]; ctx.fillRect(MASK.x0 + c * TS, MASK.y0 + r * TS + 1, TS - 1, TS - 2);
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function startLine(ctx) {
    var s0 = tr.P[0]; ctx.save(); ctx.translate(s0.x, s0.y); ctx.rotate(s0.a);
    var n = Math.ceil(tr.hw / 6.5);
    for (var rr = 0; rr < 2; rr++) for (var cc = -n; cc < n; cc++) { ctx.fillStyle = (rr + cc) & 1 ? "#e8e4f4" : "#16121c"; ctx.fillRect(rr * 6.5 - 6.5, cc * 6.5, 6.5, 6.5); }
    ctx.restore();
  }
  function perfCorner() { return [Math.max(105, VW * 0.14), Math.max(112, VH * 0.17)]; }
  function perf(sx, sy) {
    if (!on) { var k = outroK(); if (k >= 1) return null; var c0 = perfCorner(), u0 = ease(Math.min(1, k / 0.72));   /* flying home */
      return [c0[0] + (sx - c0[0]) * u0, c0[1] + (sy - c0[1]) * u0 - Math.sin(u0 * Math.PI) * 40]; }
    var tt = elapsed(), T_ = times(), c = perfCorner();
    var u = ease((tt - 1.0 * T_.S) / (1.6 * T_.S)); return [sx + (c[0] - sx) * u, sy + (c[1] - sy) * u + Math.sin(performance.now() / 420) * 3];
  }
  function ufo(ctx, tt, T_) {
    var sp = env.perfStage ? env.perfStage() : null; if (!sp) return; var p = perf(sp[0], sp[1]), drop = ease(tt / (1.0 * T_.S)); var y = p[1] + 62 - (1 - drop) * 340, x = p[0], now = performance.now();
    ufoAt(ctx, x, y, now, 1);
  }
  function ufoAt(ctx, x, y, now, sz) {
    ctx.save(); ctx.translate(x, y); ctx.scale(sz, sz);
    var gl = ART.PX.rg(ctx,0, 18, 4, 0, 18, 110); gl.addColorStop(0, "rgba(61,242,255,.45)"); gl.addColorStop(1, "rgba(61,242,255,0)"); ctx.fillStyle = gl; ctx.fillRect(-110, -60, 220, 200);
    ctx.fillStyle = "#3a3f58"; ART.PX.oval(ctx,0, 0, 98, 22, 0,KP);
    ctx.fillStyle = "#6b7396"; ctx.beginPath(); ctx.ellipse(0, -4, 98, 18, 0, 3.14, 6.3); ctx.fill();
    ctx.fillStyle = "#1c1f33"; ctx.beginPath(); ctx.ellipse(0, 8, 70, 11, 0, 0, 3.14); ctx.fill();
    for (var i = -3; i <= 3; i++) { ctx.fillStyle = (Math.floor(now / 180) + i) % 2 ? "#ff3dd8" : "#3df2ff"; ART.PX.disc(ctx,i * 26, 4 + Math.abs(i) * 0.4, 3.4,KP); }
    ctx.restore();
  }

  /* ================= physics: the stick is speed and direction; DRIFT hops ================= */
  function newKart(x, y, a) { return { x: x, y: y, a: a, vx: 0, vy: 0, air: 0, drift: 0, slip: 0, omega: 0, charge: 0, boost: 0, rev: false, ev: "", pi: undefined, spd: 0, hopT: 0 }; }
  function toPZ(x, y) { var dx = x - PZ.cx, dy = y - PZ.cy, c = Math.cos(PZ.a), s = Math.sin(PZ.a); return [dx * c + dy * s, -dx * s + dy * c]; }
  function fromPZ(u, v) { var c = Math.cos(PZ.a), s = Math.sin(PZ.a); return [PZ.cx + u * c - v * s, PZ.cy + u * s + v * c]; }
  function inPlaza(x, y, m) { var l = toPZ(x, y); return Math.abs(l[0]) < PZ.hx + m && Math.abs(l[1]) < PZ.hy + m; }
  function level(ch) { return ch >= T("ultraT") ? 3 : ch >= T("turboT") ? 2 : ch >= T("miniT") ? 1 : 0; }
  function hop(k) { if (k.air > 0 || k.drift || performance.now() - k.hopT < 150) return; k.air = T("hop"); k.airMax = k.air; k.hopT = performance.now(); }
  function land(k, inp) {
    var vm = T("maxSpeed"), sp = Math.hypot(k.vx, k.vy), vdir = Math.atan2(k.vy, k.vx), slip = wrapA(k.a - vdir);
    puff(k.x, k.y, 6);
    if (inp.drift && sp > vm * 0.3 && Math.abs(slip) > 0.2 && Math.abs(slip) < 1.7) {
      k.drift = slip > 0 ? 1 : -1; k.trim = 0; k.slip = clamp(slip, -1.05, 1.05); k.omega = k.drift * clamp(Math.abs(k.slip) * T("driftK"), 0.5, 2.8); k.charge = 0; k.a = vdir + k.slip;
    }
  }
  function endDrift(k) {
    var L = level(k.charge);
    if (L) { k.boost = L === 3 ? T("boost3") : L === 2 ? T("boost2") : T("boost1"); k.ev = L === 3 ? "ultra" : L === 2 ? "turbo" : "mini"; }
    k.drift = 0; k.charge = 0;
  }
  function step(k, inp, dt) {
    var vm = T("maxSpeed"); k.ev = "";
    if (inp.drift && !k.wasDrift) hop(k); k.wasDrift = inp.drift;
    if (k.boost > 0) k.boost -= dt;
    var cap = vm * (k.boost > 0 ? T("boostMul") : 1);
    if (k.air > 0) {
      /* in the air: swing the kart round with the stick; you keep sliding the way you were going */
      if (inp.m > 0) { var da0 = wrapA(inp.ta - k.a); k.a += clamp(da0, -T("hopTurn") * dt, T("hopTurn") * dt); }
      k.air -= dt; if (k.air <= 0) { k.air = 0; land(k, inp); }
    } else if (k.drift) {
      /* drifting: the turn is locked by the angle you landed at; the stick trims it a little */
      var sp = Math.hypot(k.vx, k.vy), vdir = Math.atan2(k.vy, k.vx), adj = 0;
      if (inp.m > 0) adj = clamp(Math.sin(wrapA(inp.ta - k.a)) * k.drift * 1.6, -1, 1);
      /* the trim only nudges the turn, and builds up slowly: land a bad angle and you can't steer your way out of it */
      var tr0 = k.trim || 0, rr = T("trimRate") * dt; k.trim = tr0 + clamp(adj - tr0, -rr, rr);
      vdir += k.omega * (1 + T("driftTrim") * k.trim) * dt; k.a = vdir + k.slip;
      var tgt = vm * Math.max(0.6, inp.m) * (k.boost > 0 ? T("boostMul") : 1);
      sp += clamp(tgt - sp, -T("coast") * dt, T("accel") * dt);
      k.vx = Math.cos(vdir) * sp; k.vy = Math.sin(vdir) * sp;
      k.charge += dt * (1 + 0.4 * Math.max(0, adj));
      if (!inp.drift || sp < vm * 0.25) endDrift(k);
    } else {
      /* no reverse: point the stick (or mouse) anywhere, even behind you, and the kart swings round that way and keeps going */
      var fx = Math.cos(k.a), fy = Math.sin(k.a), vf = k.vx * fx + k.vy * fy, target = 0;
      if (inp.m > 0) {
        var da = wrapA(inp.ta - k.a);
        target = inp.m * vm * (1 - 0.3 * Math.min(1, Math.abs(da) / 1.6));
        var rate = T("turn") * (0.6 + 0.4 * Math.min(1, Math.abs(vf) / (vm * 0.5)));
        k.a += clamp(da, -rate * dt, rate * dt);
      }
      if (k.boost > 0) target = Math.max(target, cap);
      fx = Math.cos(k.a); fy = Math.sin(k.a); var rx = -fy, ry = fx; vf = k.vx * fx + k.vy * fy; var vl = k.vx * rx + k.vy * ry;
      if (target > vf) vf = Math.min(target, vf + T("accel") * (k.boost > 0 ? 2.2 : 1) * dt);
      else if (target < vf) vf = Math.max(target, vf - (vf < 0 ? T("brake") : T("coast")) * dt);
      if (vf > cap) vf = cap + (vf - cap) * Math.pow(0.15, dt);
      vl *= Math.pow(T("grip"), dt);
      k.vx = fx * vf + rx * vl; k.vy = fy * vf + ry * vl;
    }
    k.x += k.vx * dt; k.y += k.vy * dt; walls(k); k.spd = Math.hypot(k.vx, k.vy);
    var dA = wrapA(k.a - (k.lastA === undefined ? k.a : k.lastA)) / Math.max(dt, 0.001); k.lastA = k.a; k.turn = (k.turn || 0) + (clamp(dA / 2.5, -1, 1) - (k.turn || 0)) * Math.min(1, dt * 8);
  }
  function walls(k) {
    var pr = project(tr, k.x, k.y, k.pi); k.pi = pr.i; k.lat = pr.lat; k.pa = pr.a;
    var lim = tr.hw - 4; if (inPlaza(k.x, k.y, -6) || Math.abs(pr.lat) <= lim) return;
    var lp = toPZ(k.x, k.y), cp = fromPZ(clamp(lp[0], -PZ.hx + 6, PZ.hx - 6), clamp(lp[1], -PZ.hy + 6, PZ.hy - 6)), c1x = cp[0], c1y = cp[1], d1 = Math.hypot(k.x - c1x, k.y - c1y);
    var lat = clamp(pr.lat, -lim, lim), nx = -Math.sin(pr.a), ny = Math.cos(pr.a), d2 = Math.abs(pr.lat - lat), c2x = k.x - nx * (pr.lat - lat), c2y = k.y - ny * (pr.lat - lat);
    var cx = d1 < d2 ? c1x : c2x, cy = d1 < d2 ? c1y : c2y, d = Math.max(0.001, Math.min(d1, d2)), qx = (cx - k.x) / d, qy = (cy - k.y) / d, vn = k.vx * qx + k.vy * qy;
    if (vn < 0) { k.vx -= (1 + T("wall")) * vn * qx; k.vy -= (1 + T("wall")) * vn * qy; k.vx *= 0.97; k.vy *= 0.97; k.hit = performance.now(); }
    k.x = cx; k.y = cy;
  }
  function onPad(x, y) {
    for (var i = 0; i < tr.pads.length; i++) { var pd = tr.pads[i], p = pointAt(tr, pd.d, pd.lat), dx = x - p.x, dy = y - p.y, al = dx * Math.cos(p.a) + dy * Math.sin(p.a), la = -dx * Math.sin(p.a) + dy * Math.cos(p.a); if (Math.abs(al) < tr.padL / 2 + 6 && Math.abs(la) < pd.w) return true; }
    return false;
  }
  /* on a computer the mouse steers: your kart is the middle of the stick, the further away the pointer, the faster */
  var MOUSE = { on: false, x: 0, y: 0, down: false };
  function mouseStick() {
    if (!MOUSE.on || !mk || !VW) return null; var sc = toScreen(mk.x, mk.y), dx = MOUSE.x - sc[0], dy = MOUSE.y - sc[1], d = Math.hypot(dx, dy);
    if (d < 18) return { x: 0, y: 0 }; var m = Math.min(1, (d - 18) / 150); return { x: dx / d * m, y: dy / d * m };
  }
  function input() {
    var s = root.__kartStick || env.stick();
    if (!root.__kartStick && !s.x && !s.y) { var ms = mouseStick(); if (ms) s = ms; }
    var x = s.x, y = s.y, m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; m = 1; }
    return { m: m > 0.2 ? (m - 0.2) / 0.8 : 0, ta: Math.atan2(y, x), drift: driftHold || MOUSE.down };
  }

  /* ---- starting and stopping ---- */
  function slotOf(id) { var ids = Object.keys(env.viewers()).sort(); var k = ids.indexOf(id); return k < 0 ? ids.length : k; }
  function slotPos(id) { var gs = gridSlot(tr, slotOf(id)); return pointAt(tr, gs.d, gs.lat); }
  function start(round) {
    on = true; rnd = round || null; score = 0; rank = 1; nKarts = 1; rankAcc = 0; fx = []; pops = []; remotes = {}; bots = {}; introPos = {}; wrong = 0; distAcc = 0; stall = 0;
    gasPress = null; wasGas = false; camB = null; poppedAt = -1; sentGo = false; lastBan = false; driftHold = false;
    /* the track: the performer's (sent with the round), else this device's own from the Track builder, else the template */
    var def = rnd && rnd.track ? clean(rnd.track) : null; if (!def) def = savedTrack();
    tr = def ? build(def) : TR[0]; trIdx = def ? 1 : 0; PZ = tr.plaza; bgKey = "";
    me = env.me(); startAt = performance.now(); lastT = 0;
    var sp = slotPos(env.myId()); mk = newKart(sp.x, sp.y, sp.a); myP = new Prog(tr); myP.reset(sp.x, sp.y);
    cam.x = PZ.cx; cam.y = PZ.cy; cam.z = 2;
    ui(true); hud();
  }
  /* when the race ends the UFO flies the performer back to the stage, sets them down and drops away; the song carries on */
  var OUT_MS = 2400, outAt = 0;
  function stop() { if (on && elapsed() >= times().fade) outAt = performance.now(); on = false; ui(false); }
  function outroK() { return outAt ? (performance.now() - outAt) / OUT_MS : 1; }
  K.outro = function () { var k = outroK(); if (k >= 1) outAt = 0; return k < 1; };
  K.ufoOut = function (ctx, sx, sy) {     /* draws the UFO under the performer on the way home; sx, sy = their stage spot */
    var k = outroK(); if (k >= 1) return; var p = perf(sx, sy); if (!p) return;
    var drop = clamp((k - 0.72) / 0.28, 0, 1), now = performance.now();
    ctx.save(); ctx.globalAlpha = 1 - drop; ufoAt(ctx, p[0], p[1] + 62 + drop * 70, now, 1 - drop * 0.3); ctx.restore();
  };
  function savedTrack() { try { return clean(JSON.parse(localStorage.getItem("uk_track") || "null")); } catch (e) { return null; } }
  function tick() {
    if (!on) return;
    var now = performance.now(), dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
    me = env.me(); if (!me) return;
    var tt = elapsed(), T_ = times(), myId = env.myId(), vs = env.viewers(), lt = tt - T_.lights;
    if (VW) camUpdate(tt, T_, dt);
    if (tt >= T_.fade && camB) Object.keys(vs).forEach(function (id) { if (!introPos[id]) { var v = vs[id], w = fromScreen(v.x * VW, v.y * VH, camB); introPos[id] = { x: w[0], y: w[1] }; } });
    var pre = tt < T_.pop;
    if (pre) { var ip = introPos[myId]; if (ip) { mk.x = ip.x; mk.y = ip.y; } }
    else {
      if (poppedAt < 0) { poppedAt = tt; var ip2 = introPos[myId]; mk.px = ip2 ? ip2.x : mk.x; mk.py = ip2 ? ip2.y : mk.y; var sp = slotPos(myId); mk.sx = sp.x; mk.sy = sp.y; mk.a = sp.a; mk.pi = undefined; var el = $("ktUI"); if (el) el.classList.add("ready"); document.body.classList.add("kt-ready"); banner(tr.name.toUpperCase()); }
      if (tt < T_.pop + 0.8 * T_.S) { var u = ease((tt - poppedAt) / (0.8 * T_.S)); mk.x = mk.px + (mk.sx - mk.px) * u; mk.y = mk.py + (mk.sy - mk.py) * u; }
    }
    var inp = input(), racing = tt >= T_.go, gas = inp.m > 0.5;
    if (!pre && !racing) {
      if (lt >= 0) lights(lt);
      if (gas && !wasGas) gasPress = lt; else if (!gas) gasPress = null; wasGas = gas;
      inp = { m: 0, ta: 0, drift: false };
    } else if (racing && !sentGo) {
      sentGo = true; goGo();
      if (wasGas) { if (gasPress !== null && gasPress >= 1.0) { mk.boost = T("startBoost"); add(60, mk.x, mk.y, "ROCKET START!", "#FF8A2B"); burst(mk.x, mk.y, "#FF8A2B", 18); } else { stall = 0.9; add(0, mk.x, mk.y, "TOO EARLY!", "#ff4d4d"); } }
    } else if (pre) inp = { m: 0, ta: 0, drift: false };
    if (stall > 0) { stall -= dt; inp.m = 0; }
    if (racing) {
      step(mk, inp, dt);
      if (onPad(mk.x, mk.y) && mk.boost < T("padTime") * 0.6) { mk.boost = T("padTime"); burst(mk.x, mk.y, "#F5F23D", 8); }
      Object.keys(remotes).forEach(function (id) { var r = remotes[id]; if (!r.race) return; var dx = mk.x - r.x, dy = mk.y - r.y, d = Math.hypot(dx, dy); if (d > 0 && d < 18) { var o = (18 - d) / 2; mk.x += dx / d * o; mk.y += dy / d * o; mk.vx *= 0.985; mk.vy *= 0.985; } });
      var r2 = myP.update(mk.x, mk.y);
      if (mk.ev) { var lv = mk.ev === "ultra" ? 3 : mk.ev === "turbo" ? 2 : 1, colE = ["", "#3DF2FF", "#FF8A2B", "#D04DFF"][lv]; add(T("driftPts") * lv, mk.x, mk.y, ["", "MINI-TURBO", "SUPER TURBO", "ULTRA TURBO"][lv], colE); burst(mk.x, mk.y, colE, 10 + lv * 5); }
      if (myP.acc > myP.best) { var dd = myP.acc - myP.best; if (dd < 60) { var before = Math.floor(myP.best / tr.L), after = Math.floor(myP.acc / tr.L); distAcc += dd / 100 * T("distPts"); if (distAcc >= 1) { var dp = Math.floor(distAcc); distAcc -= dp; add(dp); } if (after > before && after > 0) { add(T("lapPts"), mk.x, mk.y, "LAP " + after, "#F5F23D"); banner("LAP " + (after + 1)); } } myP.best = myP.acc; }
      wrong = clamp(wrong + ((Math.cos(Math.atan2(mk.vy, mk.vx) - r2.a) < -0.3 && mk.spd > 25) ? dt : -dt * 2), 0, 1);
    }
    if (!pre) { var e = enc(mk.x, mk.y); me.tx = me.x = clamp(e[0], 0.002, 0.998); me.ty = me.y = clamp(e[1], 0.002, 0.998); env.sendPos(me.tx, me.ty); }
    env.pose([1.9, -1.9, 0.6, -0.6]);
    var list = [{ id: "me", t: myP.acc }];
    Object.keys(vs).forEach(function (id) {
      if (id === myId) return; var v = vs[id];
      if (id.indexOf("bot") === 0 && env.practice()) botMove(id, v, dt, now, tt, T_);
      if (v.dance !== 4) { delete remotes[id]; return; }
      var r = remoteStep(id, v, dt); if (r.race) list.push({ id: id, t: r.P.acc });
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
  function burst(x, y, c, n) { var now = performance.now(); for (var i = 0; i < n; i++) { var a = Math.random() * 6.3, s = 30 + Math.random() * 70; fx.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: now, life: 450, c: c, sz: 3 }); } }
  function puff(x, y, n) { var now = performance.now(); for (var i = 0; i < n; i++) { var a = Math.random() * 6.3, s = 10 + Math.random() * 25; fx.push({ x: x, y: y + 4, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, t: now, life: 380, c: "rgba(200,190,230,.7)", sz: 4 }); } }

  /* ---- other karts: smoothed positions; heading, hop and sparks come with their pose ---- */
  function remoteStep(id, v, dt) {
    var r = remotes[id], race = !!(v.sk && v.sk.f === 1), world;
    if (race) { var d0 = dec(v.tx, v.ty); world = { x: d0[0], y: d0[1] }; } else world = introPos[id] || { x: PZ.cx, y: PZ.cy };
    if (!r) { r = remotes[id] = { x: world.x, y: world.y, a: 0, P: new Prog(tr), v: v, race: false }; r.P.reset(r.x, r.y); }
    r.v = v; var dx = world.x - r.x, dy = world.y - r.y;
    if (race !== r.race || Math.hypot(dx, dy) > 220) { if (race && !r.race) r.a = pointAt(tr, 0, 0).a; r.x = world.x; r.y = world.y; r.P.reset(r.x, r.y); dx = dy = 0; r.race = race; }
    var f = 1 - Math.exp(-dt * 10); r.x += dx * f; r.y += dy * f;
    if (race && v.sk) { var h = v.sk.h | 0, ta = (h % 16) * STEP16, da = wrapA(ta - r.a); r.turn = (r.turn || 0) + (clamp(da * 2, -1, 1) - (r.turn || 0)) * Math.min(1, dt * 6); r.a += da * Math.min(1, dt * 14); r.air = (h & 16) ? 1 : 0; r.lvl = v.sk.t; }
    if (race) r.P.update(r.x, r.y); return r;
  }
  function botMove(id, v, dt, now, tt, T_) {
    var b = bots[id];
    if (!b) { var k = Object.keys(env.viewers()).sort().indexOf(id), gs = gridSlot(tr, k < 0 ? 5 : k); b = bots[id] = { d: (gs.d + tr.L) % tr.L, lat: gs.lat, sp: 0.62 + Math.random() * 0.3, ph: Math.random() * 6 }; }
    v.dance = 4; if (tt < T_.pop) { v.sk = { h: 0, f: 0, t: 0 }; return; }
    var p0 = pointAt(tr, b.d, b.lat);
    if (tt < T_.go) { var ip = introPos[id] || { x: p0.x, y: p0.y }, u = ease((tt - T_.pop) / (0.8 * T_.S)), e0 = enc(ip.x + (p0.x - ip.x) * u, ip.y + (p0.y - ip.y) * u); v.tx = e0[0]; v.ty = e0[1]; v.sk = { h: idx16(p0.a), f: 1, t: 0 }; return; }
    var curve = Math.min(1, Math.abs(wrapA(pointAt(tr, b.d + 40, 0).a - p0.a)) * 3), spd = T("maxSpeed") * b.sp * (1 - curve * 0.25); b.d += spd * dt;
    b.lat += (Math.sin(now / 900 + b.ph) * tr.hw * 0.5 - b.lat) * Math.min(1, dt * 2);
    var p = pointAt(tr, b.d, b.lat), e = enc(p.x, p.y); v.tx = e[0]; v.ty = e[1]; v.sk = { h: idx16(p.a), f: 1, t: curve > 0.6 ? 1 : 0 };
  }

  /* ================= drawing ================= */
  var SPARK_COL = ["#fff6d0", "#3DF2FF", "#FF8A2B", "#D04DFF"];
  function flame(ctx, x, y, a, s, now, big) {
    var f = Math.floor(now / 45) % 4, L = ([7, 10, 8, 11][f] + (big ? 4 : 0)) * s, w = 2.6 * s;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#ff4a2b"; ctx.fillRect(0, -w, L, w * 2); ctx.fillStyle = "#ffb04a"; ctx.fillRect(0, -w * 0.6, L * 0.72, w * 1.2); ctx.fillStyle = "#fff3a0"; ctx.fillRect(0, -w * 0.3, L * 0.4, w * 0.6);
    ctx.fillStyle = "rgba(255,176,74,.7)"; ctx.fillRect(L + (f % 2) * s * 2, -s, 2 * s, 2 * s);
    ctx.restore();
  }
  function spark(ctx, x, y, s, lvl, now, seed) {
    var f = (Math.floor(now / 60) + seed) % 3, c = SPARK_COL[lvl], u = Math.max(1, Math.round(s));
    ctx.fillStyle = c;
    if (f === 0) { ctx.fillRect(x - u, y - 3 * u, 2 * u, 6 * u); ctx.fillRect(x - 3 * u, y - u, 6 * u, 2 * u); }
    else if (f === 1) { ctx.fillRect(x - 2 * u, y - 2 * u, 2 * u, 2 * u); ctx.fillRect(x, y, 2 * u, 2 * u); ctx.fillRect(x - 2 * u, y, 2 * u, 2 * u); ctx.fillRect(x, y - 2 * u, 2 * u, 2 * u); }
    else { ctx.fillRect(x - u, y - 5 * u, 2 * u, 10 * u); ctx.fillRect(x - 5 * u, y - u, 10 * u, 2 * u); ctx.fillStyle = "#fff"; ctx.fillRect(x - u, y - u, 2 * u, 2 * u); }
  }
  /* one kart: shadow, flames, the back half, the driver in the seat, the front half, sparks, name */
  function kart(ctx, k, now) {
    var sc = toScreen(k.x, k.y), s = k.sc || cam.z * (k.pop === undefined ? 1 : 0.3 + 0.7 * k.pop), fr = sheet(k.v.color || "#e33")[idx16(k.a)], lift = (k.air ? 6 : 0) * s, ks = s * 1.2;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "rgba(0,0,0,.35)"; ART.PX.oval(ctx,sc[0], sc[1] + 2 * ks, 15 * ks, 9 * ks, 0,KP);
    var bx = sc[0] - OX * ks, by = sc[1] - OY * ks - lift;
    var back = Math.sin(k.a) < 0;                          /* facing up the screen: the exhausts are in front of the kart */
    if (k.boost && !back) fr.ex.forEach(function (p) { flame(ctx, sc[0] + p[0] * ks, sc[1] + p[1] * ks - lift, k.a, ks, now, k.boost > 1); });
    ctx.drawImage(fr.under, bx, by, FW * ks, FH * ks);
    /* the driver faces the way the kart points, in all 8 directions (real turned views of their character, diagonals included) */
    var dir = ART.face8(Math.cos(k.a), Math.sin(k.a), k._dir), side = dir !== 0 && dir !== 2, tn = clamp(k.turn || 0, -1, 1); k._dir = dir;
    var seatX = sc[0] + fr.seat[0] * ks, seatY = sc[1] + fr.seat[1] * ks - lift, as = s * 0.78, cy = seatY + 2 * as, neck = cy - 9 * as;
    var pose = side ? [-1.15 + tn * 0.2, -1.0 + tn * 0.2, 0.2, -0.2] : [0.55 - tn * 0.25, -0.55 - tn * 0.25, 0.2, -0.2];
    /* sunk down into the seat: only the head, chest and arms show above the cockpit */
    ctx.save(); ctx.beginPath(); ctx.rect(seatX - 40 * s, seatY - 60 * s, 80 * s, 60 * s - 0.5 * as); ctx.clip();
    env.avatar(seatX, cy, k.v, k.me, as, pose, true, dir); ctx.restore();
    ctx.drawImage(fr.over, bx, by, FW * ks, FH * ks);
    if (k.boost && back) fr.ex.forEach(function (p) { flame(ctx, sc[0] + p[0] * ks, sc[1] + p[1] * ks - lift, k.a, ks, now, k.boost > 1); });
    if (k.lvl !== undefined && k.lvl >= 0 && k.drifting && !k.air) fr.rw.forEach(function (p, i) { spark(ctx, sc[0] + p[0] * ks, sc[1] + p[1] * ks, ks, k.lvl, now, i); });
    if (k.v.name) { ctx.font = "800 " + Math.round(clamp(10 * s, 10, 15)) + "px system-ui"; ctx.textAlign = "center"; ctx.lineWidth = 3; ctx.strokeStyle = "rgba(0,0,0,.75)"; var ny = sc[1] + 16 * ks; ctx.strokeText(k.v.name, sc[0], ny); ctx.fillStyle = k.me ? "#F5C518" : "#fff"; ctx.fillText(k.v.name, sc[0], ny); }
    ctx.restore();
  }
  function dancer(ctx, v, isMe, w, tt) {
    var sc = toScreen(w.x, w.y), base = camB ? Math.max(0.6, 2 * cam.z / camB.z) : 2, s = Math.sin(tt * 6 + (v.seed || 0));
    env.avatar(sc[0], sc[1], v, isMe, base, [1.3 + s * 0.9, -1.3 - s * 0.9, s * 0.3, -s * 0.3]);
  }
  function draw(ctx) {
    if (!on) return;
    var tt = elapsed(), T_ = times(), now = performance.now(), vs = env.viewers(), myId = env.myId();
    if (tt < T_.fade) return;
    ctx.save(); ctx.translate(VW / 2 - cam.x * cam.z, VH / 2 - cam.y * cam.z); ctx.scale(cam.z, cam.z);
    pads(ctx, now);
    ctx.restore();
    effects(ctx, tt, T_, now, vs, myId);
  }
  function pads(ctx, now) {
    /* boost pads, in pixel art: every pixel is on the same grid as the track (4 per floor tile), and the chevrons
       sweep across them cell by cell instead of as smooth shapes */
    var PC = 13 / 4;
    function padMix(c, a) { var r = parseInt(c.substr(1, 2), 16), g2 = parseInt(c.substr(3, 2), 16), b = parseInt(c.substr(5, 2), 16);
      return "rgb(" + Math.round(20 + (r - 20) * a) + "," + Math.round(10 + (g2 - 10) * a) + "," + Math.round(40 + (b - 40) * a) + ")"; }
    tr.pads.forEach(function (pd) {
      var p = pointAt(tr, pd.d, pd.lat), hwp = pd.w, sq = Math.min(1, hwp / 22), ca = Math.cos(p.a), sa = Math.sin(p.a), hl = tr.padL / 2;
      var ex = Math.abs(ca) * hl + Math.abs(sa) * hwp, ey = Math.abs(sa) * hl + Math.abs(ca) * hwp, ph = [];
      for (var c = 0; c < 3; c++) { var f = ((now / 260 + c) % 3) / 3; ph.push({ xx: -hl + f * tr.padL, a: Math.sin(f * Math.PI), col: c % 2 ? "#3DF2FF" : "#F5F23D" }); }
      /* every cell is an opaque colour (chevron mixed into the pad by its brightness), drawn as runs a hair wider so no seams show */
      for (var gy = Math.floor((p.y - ey) / PC); gy <= Math.floor((p.y + ey) / PC); gy++) {
        var run = null, rx0 = 0;
        for (var gx = Math.floor((p.x - ex) / PC); gx <= Math.floor((p.x + ex) / PC) + 1; gx++) {
          var dx = (gx + 0.5) * PC - p.x, dy = (gy + 0.5) * PC - p.y, lx = dx * ca + dy * sa, ly = -dx * sa + dy * ca, col = null;
          if (Math.abs(lx) <= hl && Math.abs(ly) <= hwp) {
            col = "#140a28"; var al = Math.abs(ly) / sq;
            for (var q = 0; q < 3; q++) { var h = ph[q]; if (al > 22) continue; var xl = h.xx - 1 - 5 * al / 22, xr = h.xx + 5 - 11 * al / 22;
              if (lx >= xl - PC / 2 && lx <= xr + PC / 2) col = padMix(h.col, Math.round(h.a * 4) / 4); }
          }
          if (col !== run) { if (run) { ctx.fillStyle = run; ctx.fillRect(rx0 * PC, gy * PC, (gx - rx0) * PC + 0.4, PC + 0.4); } run = col; rx0 = gx; }
        }
      }
      ctx.globalAlpha = 1;
    });
  }
  function effects(ctx, tt, T_, now, vs, myId) {
    /* drift sparks flying off, boost embers, landing dust */
    if (mk && mk.drift && !mk.air && Math.random() < 0.8) { var L = level(mk.charge); [-9, 9].forEach(function (o) { var wx = mk.x + Math.cos(mk.a) * -9 - Math.sin(mk.a) * o, wy = mk.y + Math.sin(mk.a) * -9 + Math.cos(mk.a) * o; fx.push({ x: wx, y: wy, vx: -mk.vx * 0.15 + (Math.random() - 0.5) * 60, vy: -mk.vy * 0.15 + (Math.random() - 0.5) * 60, t: now, life: 260, c: SPARK_COL[L], sz: 2 }); }); }
    if (mk && mk.boost > 0 && Math.random() < 0.7) fx.push({ x: mk.x - Math.cos(mk.a) * 14, y: mk.y - Math.sin(mk.a) * 14, vx: -mk.vx * 0.3 + (Math.random() - 0.5) * 20, vy: -mk.vy * 0.3 + (Math.random() - 0.5) * 20, t: now, life: 300, c: Math.random() < 0.5 ? "#FFB04A" : "#ff4a2b", sz: 3 });
    fx = fx.filter(function (f) { var a = (now - f.t) / f.life; if (a >= 1) return false; var s = toScreen(f.x + f.vx * a * 0.45, f.y + f.vy * a * 0.45); ctx.globalAlpha = 1 - a; ctx.fillStyle = f.c; var z = Math.max(2, (f.sz || 3) * cam.z); ctx.fillRect(Math.round(s[0] - z / 2), Math.round(s[1] - z / 2), z, z); return true; }); ctx.globalAlpha = 1;
    var all = [], popK = clamp((tt - T_.pop) / (0.8 * T_.S), 0, 1);
    Object.keys(vs).forEach(function (id) {
      var v = vs[id], isMe = id === myId; if (!isMe && v.dance !== 4) return;
      if (isMe) { if (tt < T_.pop) all.push({ dance: true, v: v, me: true, w: introPos[id] || { x: PZ.cx, y: PZ.cy } }); else all.push({ x: mk.x, y: mk.y, a: mk.a, turn: mk.turn, v: v, me: true, boost: mk.boost > 0 ? (mk.boost > 1 ? 2 : 1) : 0, air: mk.air > 0, drifting: !!mk.drift, lvl: level(mk.charge), lean: mk.drift ? mk.drift : 0, pop: popK }); return; }
      var r = remotes[id]; if (!r) return;
      if (!r.race) all.push({ dance: true, v: v, me: false, w: introPos[id] || { x: r.x, y: r.y } });
      else { var t = v.sk ? v.sk.t : 0; all.push({ x: r.x, y: r.y, a: r.a, turn: r.turn, v: v, me: false, boost: t === 2 ? 1 : 0, air: !!r.air, drifting: t === 1 || t === 3 || t === 4, lvl: t === 3 ? 1 : t === 4 ? 2 : 0, pop: popK }); }
    });
    all.sort(function (p, q) { return (p.dance ? p.w.y : p.y) - (q.dance ? q.w.y : q.y); });
    all.forEach(function (k) { if (k.dance) dancer(ctx, k.v, k.me, k.w, tt); else { if (k.pop < 1) { var s = toScreen(k.x, k.y); ctx.strokeStyle = "rgba(61,242,255," + (1 - k.pop) + ")"; ctx.lineWidth = 3; ART.PX.ring(ctx,s[0], s[1], (0.4 + k.pop) * 34 * cam.z,undefined,KP); } kart(ctx, k, now); } });
    pops = pops.filter(function (p) { var a = (now - p.t) / 900; if (a > 1) return false; var s = toScreen(p.x, p.y); ctx.globalAlpha = 1 - a; ctx.font = "900 16px system-ui"; ctx.textAlign = "center"; ctx.lineWidth = 3; ctx.strokeStyle = "rgba(0,0,0,.75)"; ctx.strokeText(p.txt, s[0], s[1] - 40 - a * 30); ctx.fillStyle = p.col; ctx.fillText(p.txt, s[0], s[1] - 40 - a * 30); return true; });
    ctx.globalAlpha = 1;
  }
  function hide() { return on && elapsed() >= times().fade; }

  /* ---- the on-screen bits ---- */
  var CSS = "#ktUI{display:none;position:fixed;inset:0;z-index:21;pointer-events:none;font-family:system-ui,sans-serif}#ktUI.on{display:block}" +
    "#ktBanner{position:absolute;left:50%;top:22%;transform:translateX(-50%);font:900 clamp(26px,6vw,54px)/1 system-ui;color:#fff;text-shadow:0 0 16px #3df2ff,0 0 30px #ff3dd8,0 3px 0 #000;white-space:nowrap;opacity:0;letter-spacing:2px}#ktBanner.pop{animation:moshPop 2.2s ease-out forwards}" +
    "#ktRank{position:absolute;right:14px;top:126px;text-align:right;font:900 30px/1 system-ui;color:#F5F23D;text-shadow:0 0 10px #ff3dd8,0 2px 0 #000;opacity:0;transition:opacity .4s}#ktRank small{display:block;font:800 13px system-ui;color:#fff;margin-top:3px;letter-spacing:1px}" +
    "#ktScore{position:absolute;right:14px;top:180px;font:900 18px system-ui;color:#3DF2FF;text-shadow:0 2px 0 #000;opacity:0;transition:opacity .4s}#ktScore::before{content:'🏎 ';font-size:15px}" +
    "#ktBars{position:absolute;right:14px;top:208px;width:150px;opacity:0;transition:opacity .4s}#ktBars div{height:8px;border-radius:4px;background:rgba(0,0,0,.55);border:1px solid rgba(61,242,255,.6);overflow:hidden;margin-bottom:5px}#ktBars i{display:block;height:100%;width:0}" +
    "#ktUI.ready #ktRank,#ktUI.ready #ktScore,#ktUI.ready #ktBars{opacity:1}" +
    "#ktSp i{background:linear-gradient(90deg,#3DF2FF,#F5F23D,#ff3dd8)}#ktDr i{background:#fff}" +
    "#ktLights{position:absolute;left:50%;top:30%;transform:translateX(-50%);display:none;gap:14px;flex-direction:column;align-items:center}#ktLights .row{display:flex;gap:14px}#ktLights b{width:34px;height:34px;border-radius:50%;background:#2a1a1a;border:3px solid #000}#ktLights b.r{background:#ff2b2b;box-shadow:0 0 18px #ff2b2b}#ktLights b.g{background:#2bff6a;box-shadow:0 0 22px #2bff6a}" +
    "#ktNum{font:900 72px/1 system-ui;color:#fff;text-shadow:0 0 18px #3df2ff,0 4px 0 #000}#ktGasCue{font:900 18px system-ui;color:#2bff6a;text-shadow:0 2px 0 #000;display:none;animation:ktBlink .5s infinite alternate;white-space:nowrap}@keyframes ktBlink{from{opacity:.4}to{opacity:1}}" +
    "#ktWrong{position:absolute;left:50%;top:44%;transform:translateX(-50%);font:900 22px system-ui;color:#ff4d4d;text-shadow:0 2px 0 #000;display:none}" +
    "#ktHint{position:absolute;left:50%;transform:translateX(-50%);bottom:250px;font:600 12px system-ui;color:rgba(255,255,255,.85);text-shadow:0 1px 3px #000;white-space:nowrap;opacity:0;transition:opacity .4s}#ktUI.ready #ktHint{opacity:1}" +
    ".ktB{position:absolute;border-radius:50%;pointer-events:auto;touch-action:none;color:#fff;font:900 18px system-ui;letter-spacing:1px;display:flex;flex-direction:column;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none;border:3px solid #ff3dd8;background:radial-gradient(circle,rgba(255,61,216,.45),rgba(20,8,30,.88));transform:translateY(110vh);transition:transform .6s cubic-bezier(.2,1.2,.4,1)}" +
    "#ktUI.ready .ktB{transform:none}.ktB small{font:600 10px system-ui;opacity:.75;margin-top:2px}.ktB.dn{background:radial-gradient(circle,rgba(61,242,255,.6),rgba(20,8,40,.9))}#ktUI.ready .ktB.dn{transform:scale(.93)}" +
    "#ktSpeed{position:absolute;right:14px;top:236px;display:none;align-items:center;gap:6px;pointer-events:auto;background:rgba(18,14,34,.85);border:1px solid rgba(155,127,224,.5);border-radius:10px;padding:4px 8px;font:700 12px system-ui;color:#c9c0ee}#ktSpeed button{width:30px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.2);background:#2a2440;color:#fff;font:800 16px system-ui;padding:0}#ktSpeed b{min-width:30px;text-align:center;color:#3DF2FF;font-size:15px}" +
    "#ktDrift{right:18px;bottom:140px;width:112px;height:112px}body.practice #ktDrift{bottom:60px}@media (pointer:fine){#ktDrift{width:88px;height:88px;font-size:15px;bottom:120px}}" +
    "body.gaming-kart #reactBar{display:none}body.gaming-kart #moveHint{display:none}body.gaming-kart #moveCtl{transition:transform .6s cubic-bezier(.2,1.2,.4,1)}body.gaming-kart:not(.kt-ready) #moveCtl{transform:translateY(110vh)}";
  function ui(show) {
    var el = $("ktUI");
    if (!el) {
      var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
      el = document.createElement("div"); el.id = "ktUI";
      el.innerHTML = '<div id="ktBanner"></div><div id="ktRank">1st<small>LAP 1</small></div><div id="ktScore">0</div><div id="ktBars"><div id="ktSp"><i></i></div><div id="ktDr"><i></i></div></div>' +
        '<div id="ktLights"><div class="row"><b></b><b></b><b></b></div><div id="ktNum"></div><div id="ktGasCue">PUSH THE STICK!</div></div><div id="ktWrong">WRONG WAY!</div><div id="ktHint"></div>' +
        '<button class="ktB" id="ktDrift" aria-label="Drift">DRIFT<small>hop + hold</small></button>';
      document.body.appendChild(el);
      /* the mouse: move to steer, hold the left button to drift (only over the game itself, not the buttons) */
      if (window.matchMedia && matchMedia("(pointer:fine)").matches) {
        window.addEventListener("mousemove", function (e) { if (!on) return; MOUSE.on = true; MOUSE.x = e.clientX; MOUSE.y = e.clientY; });
        window.addEventListener("mousedown", function (e) { if (on && e.button === 0 && e.target && e.target.tagName === "CANVAS") { MOUSE.down = true; MOUSE.on = true; MOUSE.x = e.clientX; MOUSE.y = e.clientY; } });
        window.addEventListener("mouseup", function (e) { if (e.button === 0) MOUSE.down = false; });
        window.addEventListener("blur", function () { MOUSE.down = false; });
      }
      /* practice: lock in a top speed (saved, and it's the same setting as the Tuning lab's Top speed) */
      var sp = document.createElement("div"); sp.id = "ktSpeed"; sp.innerHTML = '<span>Speed</span><button data-s="-10">−</button><b id="ktSpV"></b><button data-s="10">+</button>'; el.appendChild(sp);
      Array.prototype.forEach.call(sp.querySelectorAll("button"), function (bt) { bt.addEventListener("click", function (e) { e.stopPropagation(); var v = clamp(Math.round(T("maxSpeed") + (+bt.dataset.s)), 70, 400); if (env.tuneSet) env.tuneSet("kt.maxSpeed", v); speedUI(); }); });
      var b = $("ktDrift"), pid = null;
      b.addEventListener("pointerdown", function (e) { e.preventDefault(); e.stopPropagation(); pid = e.pointerId; try { b.setPointerCapture(pid); } catch (x) {} b.classList.add("dn"); driftHold = true; });
      var up = function (e) { if (e.pointerId !== pid) return; pid = null; b.classList.remove("dn"); driftHold = false; }; b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up); b.addEventListener("lostpointercapture", up);
    }
    el.classList.toggle("on", !!show); el.classList.remove("ready"); document.body.classList.toggle("gaming-kart", !!show); document.body.classList.remove("kt-ready");
    if (show) { driftHold = false; MOUSE.down = false; MOUSE.on = false; var lg = $("ktLights"); if (lg) lg.style.display = "none"; speedUI(); }
  }
  function speedUI() { var w = $("ktSpeed"); if (!w) return; w.style.display = "none";   /* (set it in the Tuning lab) */ var v = $("ktSpV"); if (v) v.textContent = Math.round(T("maxSpeed")); }
  function banner(t) { var b = $("ktBanner"); if (!b) return; b.textContent = t; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  function hud() { var s = $("ktScore"); if (s) s.textContent = score.toLocaleString(); }
  function lights(lt) {
    var el = $("ktLights"); if (!el) return; el.style.display = "flex"; var n = lt < 1 ? 3 : lt < 2 ? 2 : 1, bs = el.querySelectorAll(".row b");
    for (var q = 0; q < 3; q++) bs[q].className = (3 - q) <= n ? "r" : ""; $("ktNum").textContent = String(n); $("ktGasCue").style.display = lt >= 1 ? "block" : "none";
  }
  function goGo() { var el = $("ktLights"); if (el) { Array.prototype.forEach.call(el.querySelectorAll(".row b"), function (b) { b.className = "g"; }); $("ktNum").textContent = "GO!"; $("ktGasCue").style.display = "none"; setTimeout(function () { el.style.display = "none"; }, 800); } }
  function ordinal(n) { return n + (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"); }
  function hudLive(tt, T_) {
    var r = $("ktRank"); if (r) r.innerHTML = ordinal(rank) + (nKarts > 1 ? " <span style='font-size:15px;color:#fff'>/ " + nKarts + "</span>" : "") + "<small>LAP " + (Math.max(0, Math.floor(myP.acc / tr.L)) + 1) + "</small>";
    var sp = $("ktSp"), dr = $("ktDr"); if (sp && sp.firstChild) sp.firstChild.style.width = Math.round(Math.min(1, mk.spd / (T("maxSpeed") * 1.3)) * 100) + "%";
    if (dr && dr.firstChild) { dr.firstChild.style.width = Math.round(Math.min(1, mk.charge / T("ultraT")) * 100) + "%"; dr.firstChild.style.background = SPARK_COL[level(mk.charge)]; }
    var w = $("ktWrong"); if (w) w.style.display = wrong > 0.6 ? "block" : "none";
    var h = $("ktHint"); if (h) h.style.visibility = (tt > T_.go + 10 && !mk.air && !mk.drift) ? "hidden" : "visible"; if (h) h.textContent = mk.air ? "Swing the kart into the turn…" : mk.drift ? "Trim left / right · let go of DRIFT for the boost" : tt < T_.go ? "Push the stick when the 2 shows for a rocket start" : mk.spd < 30 ? (MOUSE.on ? "Point the mouse where you want to go · further = faster" : "Push the stick the way you want to go · further = faster") : (MOUSE.on ? "Hold the left mouse button to hop and drift, swing into the turn" : "Tap DRIFT to hop, swing into the turn, hold it through");
  }

  /* draw one kart + driver at a screen spot, for checking every angle */
  K.preview = function (ctx, x, y, a, v, z, turn) { var c0 = { x: cam.x, y: cam.y, z: cam.z }, w0 = VW, h0 = VH; VW = 0; VH = 0; cam.z = z || 2; cam.x = -x / cam.z; cam.y = -y / cam.z;
    try { kart(ctx, { x: 0, y: 0, a: a, v: v, me: false, turn: turn || 0, boost: 0, air: false, drifting: false }, performance.now()); } finally { cam.x = c0.x; cam.y = c0.y; cam.z = c0.z; VW = w0; VH = h0; } };
  /* ================= the performer's view: the whole track from above, everyone on it, the top three picked out =================
     o: { track (a builder track or null), round (changes = new race), racers: [{ id, name, color, look, x, y (world), h, t }],
          avatar(x, y, v, isMe, scale, pose, noName, dir), perf(ctx, x, y, scale), beat() }
     Returns the standings, leader first: [{ id, name, lap, place }]. */
  var OV = null, MEDAL = ["#F5C518", "#C9D3E6", "#D9894A"];
  K.overview = function (ctx, W, H, o) {
    var key = JSON.stringify(o.track || null), now = performance.now();
    if (!OV || OV.key !== key) OV = { key: key, tr: build(o.track), prog: {}, disp: {}, cv: null, round: null, last: now };
    if (OV.round !== o.round) { OV.round = o.round; OV.prog = {}; OV.disp = {}; }
    var dt = Math.min(0.1, (now - OV.last) / 1000); OV.last = now;
    var S = [tr, PZ, BX0, BY0, BWW, BHH, Q, ROADP, MASK, cam, VW, VH, env];
    tr = OV.tr; PZ = tr.plaza; VW = W; VH = H; env = { avatar: o.avatar, beat: o.beat };
    var out = [];
    try {
      if (!OV.cv) { OV.cv = bake(Math.max(360, (tr.box.x1 - tr.box.x0) * 0.6, (tr.box.y1 - tr.box.y0) * 1.1)); OV.geo = [BX0, BY0, BWW, BHH, Q, ROADP, MASK]; }
      BX0 = OV.geo[0]; BY0 = OV.geo[1]; BWW = OV.geo[2]; BHH = OV.geo[3]; Q = OV.geo[4]; ROADP = OV.geo[5]; MASK = OV.geo[6];
      /* fit the whole track between the UFO on the left, the toolbar on top and the standings on the right */
      var pl = Math.min(260, W * 0.17), pt = 100, pr = Math.min(230, W * 0.18), pb = 30, bw = tr.box.x1 - tr.box.x0, bh = tr.box.y1 - tr.box.y0;
      var z = Math.min((W - pl - pr) / bw, (H - pt - pb) / bh);
      cam = { z: z, x: (tr.box.x0 + tr.box.x1) / 2 - ((pl - pr) / 2) / z, y: (tr.box.y0 + tr.box.y1) / 2 - ((pt - pb) / 2) / z };
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = "#07041a"; ctx.fillRect(0, 0, W, H);
      ctx.translate(VW / 2 - cam.x * cam.z, VH / 2 - cam.y * cam.z); ctx.scale(cam.z, cam.z);
      ctx.drawImage(OV.cv, BX0, BY0, BWW, BHH); floorGlow(ctx); startLine(ctx); pads(ctx, now);
      ctx.restore();
      /* where everyone is, smoothed between updates, and how far round they've got */
      var seen = {}, ks = [];
      (o.racers || []).forEach(function (r) {
        seen[r.id] = 1; var a = ((r.h || 0) % 16) * STEP16;
        var p = OV.prog[r.id], pr;
        /* a big jump (their first racing position, or a respawn): find them again from scratch, keeping the laps they'd done */
        if (!p || Math.hypot(r.x - p.lx, r.y - p.ly) > 200) { var laps = p ? Math.floor(p.acc / tr.L + 0.5) * tr.L : 0; p = OV.prog[r.id] = new Prog(tr); pr = p.reset(r.x, r.y); if (laps > 0) p.acc += laps; if (OV.disp[r.id]) delete OV.disp[r.id]; }
        else pr = p.update(r.x, r.y);
        p.lx = r.x; p.ly = r.y;
        /* smoothed ALONG the road (distance round + sideways), with the speed carried between updates,
           so karts follow the bends instead of cutting straight across them */
        var d = OV.disp[r.id], lat = clamp(pr.lat, -PZ.hy, PZ.hy);
        if (!d) d = OV.disp[r.id] = { acc: p.acc, lat: lat, tAcc: p.acc, at: now, v: 0 };
        if (p.acc !== d.tAcc) { var gap = (now - d.at) / 1000; if (gap > 0.02) d.v = clamp((p.acc - d.tAcc) / gap, -50, 600); d.tAcc = p.acc; d.at = now; }
        var want = d.tAcc + d.v * Math.min(0.3, (now - d.at) / 1000);
        if (Math.abs(want - d.acc) > 300) d.acc = want; else d.acc += (want - d.acc) * (1 - Math.exp(-dt * 14));
        d.lat += (lat - d.lat) * (1 - Math.exp(-dt * 8));
        var wp = Math.abs(lat) > tr.hw + 10 ? { x: r.x, y: r.y } : pointAt(tr, d.acc, d.lat);   /* out on the dance floor's wide bits: just where they are */
        d.x = wp.x; d.y = wp.y;
        var t = r.t || 0;
        ks.push({ id: r.id, x: d.x, y: d.y, a: a, v: { name: r.name, color: r.color, look: r.look }, me: false, turn: 0, air: ((r.h || 0) % 32) >= 16, boost: t === 2 ? 1 : 0, drifting: t === 1 || t === 3 || t === 4, lvl: t === 3 ? 1 : t === 4 ? 2 : 0, acc: p.acc });
      });
      Object.keys(OV.disp).forEach(function (id) { if (!seen[id]) delete OV.disp[id]; });
      ks.sort(function (p, q) { return q.acc - p.acc; });
      ks.forEach(function (k, i) { k.place = i + 1; out.push({ id: k.id, name: k.v.name, place: i + 1, lap: Math.max(1, Math.floor(k.acc / tr.L) + 1) }); });
      var ksz = clamp(cam.z * 1.15, 0.7, 1.4);
      ks.slice().sort(function (p, q) { return p.y - q.y; }).forEach(function (k) {
        var sc = toScreen(k.x, k.y), m = k.place <= 3 ? MEDAL[k.place - 1] : null;
        if (m) { ctx.save(); ctx.globalAlpha = 0.35 + 0.25 * Math.sin(now / 180 + k.place); ctx.fillStyle = m; ART.PX.oval(ctx,sc[0], sc[1] + 2, 30 * ksz, 18 * ksz, 0,KP); ctx.globalAlpha = 1; ctx.strokeStyle = m; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); }
        k.sc = ksz; kart(ctx, k, now);
        if (m) { var by = sc[1] - 46 * ksz; ctx.save(); ctx.fillStyle = m; ctx.strokeStyle = "rgba(0,0,0,.8)"; ctx.lineWidth = 3; ART.PX.disc(ctx,sc[0], by, 11,KP);ART.PX.ring(ctx,sc[0], by, 11,undefined,KP);
          ctx.fillStyle = "#1a1200"; ctx.font = "900 13px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(k.place), sc[0], by + 1); ctx.restore(); }
      });
      /* you, playing on your UFO in the corner, with the song's video on a little Jumbotron behind you when there is one */
      var ux = Math.max(120, Math.min(pl * 0.62, W * 0.12)), uy0 = Math.max(190, H * 0.3), uy = uy0 + Math.sin(now / 420) * 4, us = Math.max(0.8, Math.min(1.3, H / 700));
      if (o.jumbo) {
        var jw = Math.round(Math.min(300, Math.max(200, pl * 1.15))), jh = Math.round(jw * 9 / 16), jx = Math.round(Math.max(12, ux - jw / 2)), jy = Math.round(uy0 - 30 * us - jh);
        if (jy < 62) jy = 62;
        OV.jt = { x: jx, y: jy, w: jw, h: jh };
        ctx.save(); ctx.fillStyle = "#3a3f58"; ctx.fillRect(jx - 6, jy - 6, jw + 12, jh + 12); ctx.fillStyle = "#000"; ctx.fillRect(jx, jy, jw, jh);
        ctx.fillStyle = "#6b7396"; ctx.fillRect(ux - 3, jy + jh + 6, 6, uy0 - jy - jh + 30 * us);              /* the mast down to the UFO */
        for (var li = 0; li < 8; li++) { ctx.fillStyle = (Math.floor(now / 200) + li) % 2 ? "#ff3dd8" : "#3df2ff"; ctx.fillRect(jx - 4 + li * (jw + 4) / 7, jy - 5, 4, 3); }
        ctx.restore();
      } else OV.jt = null;
      var fc = o.front || ctx;
      ufoAt(fc, ux, uy + 52 * us, now, us);
      if (o.perf) o.perf(fc, ux, uy, 2.6 * us);
      /* the standings */
      var px = W - pr + 14, py = pt + 6, rw = pr - 28;
      ctx.save(); ctx.fillStyle = "rgba(8,6,20,.82)"; ctx.strokeStyle = "rgba(61,242,255,.45)"; ctx.lineWidth = 1.5;
      var n = Math.min(out.length, 10), ph = 40 + Math.max(1, n) * 26; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(px, py, rw, ph, 10); else ctx.rect(px, py, rw, ph); ctx.fill(); ctx.stroke();
      ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.font = "900 12px system-ui"; ctx.fillStyle = "#3DF2FF"; ctx.fillText("🏁 MARS RALLY" + (out.length ? "  ·  LAP " + out[0].lap : ""), px + 12, py + 20);
      if (!out.length) { ctx.font = "700 12px system-ui"; ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.fillText("Racers getting into their karts…", px + 12, py + 46); }
      for (var i = 0; i < n; i++) { var r = out[i], yy = py + 46 + i * 26, m2 = i < 3 ? MEDAL[i] : null;
        if (m2) { ctx.fillStyle = m2; ART.PX.disc(ctx,px + 22, yy, 10,KP); ctx.fillStyle = "#1a1200"; } else ctx.fillStyle = "rgba(255,255,255,.55)";
        ctx.font = "900 12px system-ui"; ctx.textAlign = "center"; ctx.fillText(String(i + 1), px + 22, yy + 1);
        ctx.textAlign = "left"; ctx.font = (i < 3 ? "800 14px" : "600 13px") + " system-ui"; ctx.fillStyle = m2 || "#ddd"; var nm = String(r.name || "?"); while (nm.length > 3 && ctx.measureText(nm).width > rw - 50) nm = nm.slice(0, -1); ctx.fillText(nm, px + 40, yy); }
      ctx.restore();
    } finally { tr = S[0]; PZ = S[1]; BX0 = S[2]; BY0 = S[3]; BWW = S[4]; BHH = S[5]; Q = S[6]; ROADP = S[7]; MASK = S[8]; cam = S[9]; VW = S[10]; VH = S[11]; env = S[12]; }
    out.jt = OV.jt;
    return out;
  };
  K.bind = function (e) { env = e; };
  K.start = start; K.stop = stop; K.tick = tick; K.bg = bg; K.draw = draw; K.perf = perf; K.hide = hide; K.sheet = sheet;
  K.wire = function () {
    if (!mk) return { h: 0, f: 0, t: 0 }; var T_ = times(), L = level(mk.charge);
    return { h: idx16(mk.a) + (mk.air > 0 ? 16 : 0) + (mk.rev ? 32 : 0), f: elapsed() >= T_.pop ? 1 : 0, t: mk.drift ? (L >= 2 ? 4 : L === 1 ? 3 : 1) : mk.boost > 0 ? 2 : 0 };
  };
  K.drift = function (v) { driftHold = !!v; };
  K.gas = function () {}; K.brake = function () {};
  Object.defineProperty(K, "on", { get: function () { return on; } });
  root.ukKart = function () { var tt = on ? elapsed() : 0, T_ = times(); return { on: on, track: tr.name, trackIdx: trIdx, t: +tt.toFixed(1), phase: tt < T_.fade ? "ufo" : tt < T_.pop ? "zoomout" : tt < T_.lights ? "grid" : tt < T_.go ? "lights" : "race", go: +T_.go.toFixed(1), score: score, rank: rank, n: nKarts, lap: myP ? Math.floor(myP.acc / tr.L) : 0, prog: myP ? Math.round(myP.acc) : 0, L: Math.round(tr.L), x: mk ? Math.round(mk.x) : 0, y: mk ? Math.round(mk.y) : 0, spd: mk ? Math.round(mk.spd) : 0, a: mk ? +mk.a.toFixed(2) : 0, tang: mk && mk.pa !== undefined ? +mk.pa.toFixed(2) : 0, lat: mk && mk.lat !== undefined ? Math.round(mk.lat) : 0, air: mk ? mk.air > 0 : false, drift: mk ? mk.drift : 0, charge: mk ? +mk.charge.toFixed(2) : 0, rev: mk ? mk.rev : false, boost: mk ? mk.boost > 0 : false, zoom: +cam.z.toFixed(2) }; };
})(typeof window !== "undefined" ? window : this);
