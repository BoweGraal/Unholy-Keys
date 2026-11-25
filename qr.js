/* qr.js: a small QR code maker for the TV join card (scan to join). Byte mode, versions 1-6, error correction M (L if it
   needs the room). UKQR(text) -> {size, at(x,y)} or null if the text is too long. Follows the QR spec (ISO 18004). */
var UKQR = (function(){
  var ECC = { M: { cw: [0, 10, 16, 26, 18, 24, 16], bl: [0, 1, 1, 1, 2, 2, 4], fmt: 0 },
              L: { cw: [0, 7, 10, 15, 20, 26, 18], bl: [0, 1, 1, 1, 1, 1, 2], fmt: 1 } };
  function rawModules(v) { var r = (16 * v + 128) * v + 64; if (v >= 2) { var na = Math.floor(v / 7) + 2; r -= (25 * na - 10) * na - 55; if (v >= 7) r -= 36; } return r; }
  function dataCw(v, e) { return Math.floor(rawModules(v) / 8) - ECC[e].cw[v] * ECC[e].bl[v]; }
  function mul(x, y) { var z = 0; for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z & 255; }
  function rsDiv(d) { var r = []; for (var i = 0; i < d - 1; i++) r.push(0); r.push(1); var root = 1;
    for (i = 0; i < d; i++) { for (var j = 0; j < r.length; j++) { r[j] = mul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; } root = mul(root, 2); } return r; }
  function rsRem(data, dv) { var r = dv.map(function() { return 0; });
    data.forEach(function(b) { var f = b ^ r.shift(); r.push(0); dv.forEach(function(c, i) { r[i] ^= mul(c, f); }); }); return r; }
  function make(text) {
    var bytes = unescape(encodeURIComponent(text)).split("").map(function(c) { return c.charCodeAt(0); });
    var v = 0, e = "M";
    for (var tryE of ["M", "L"]) { for (var vv = 1; vv <= 6; vv++) if (4 + 8 + bytes.length * 8 <= dataCw(vv, tryE) * 8) { v = vv; e = tryE; break; } if (v) break; }
    if (!v) return null;
    var cap = dataCw(v, e), bits = [];
    function put(val, n) { for (var i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4); put(bytes.length, 8); bytes.forEach(function(b) { put(b, 8); });
    put(0, Math.min(4, cap * 8 - bits.length)); while (bits.length % 8) bits.push(0);
    var data = []; for (var i = 0; i < bits.length; i += 8) { var b = 0; for (var k = 0; k < 8; k++) b = (b << 1) | bits[i + k]; data.push(b); }
    for (var pad = 0xEC; data.length < cap; pad ^= 0xEC ^ 0x11) data.push(pad);
    /* error correction, split into blocks and interleaved */
    var nb = ECC[e].bl[v], el = ECC[e].cw[v], raw = Math.floor(rawModules(v) / 8), nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), dv = rsDiv(el), blocks = [], kk = 0;
    for (i = 0; i < nb; i++) { var len = shortLen - el + (i < nShort ? 0 : 1), dat = data.slice(kk, kk + len); kk += len; var ec = rsRem(dat, dv); if (i < nShort) dat.push(0); blocks.push(dat.concat(ec)); }
    var all = []; for (i = 0; i < blocks[0].length; i++) for (var j = 0; j < nb; j++) if (i !== shortLen - el || j >= nShort) all.push(blocks[j][i]);
    /* the grid */
    var N = v * 4 + 17, M = [], F = [];
    for (i = 0; i < N; i++) { M.push(new Array(N).fill(false)); F.push(new Array(N).fill(false)); }
    function fn(x, y, d) { M[y][x] = d; F[y][x] = true; }
    for (i = 0; i < N; i++) { fn(6, i, i % 2 === 0); fn(i, 6, i % 2 === 0); }
    [[3, 3], [N - 4, 3], [3, N - 4]].forEach(function(c) { for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) { var x = c[0] + dx, y = c[1] + dy, d = Math.max(Math.abs(dx), Math.abs(dy)); if (x >= 0 && x < N && y >= 0 && y < N) fn(x, y, d !== 2 && d !== 4); } });
    if (v >= 2) { var na = Math.floor(v / 7) + 2, step = Math.ceil((v * 4 + 4) / (na * 2 - 2)) * 2, ps = [6]; for (var p = N - 7; ps.length < na; p -= step) ps.splice(1, 0, p);
      ps.forEach(function(ax, ai) { ps.forEach(function(ay, aj) { if ((ai === 0 && aj === 0) || (ai === 0 && aj === na - 1) || (ai === na - 1 && aj === 0)) return;
        for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) fn(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }); }); }
    function fmt(mask) { var d = (ECC[e].fmt << 3) | mask, r = d; for (var i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); var b = ((d << 10) | r) ^ 0x5412, g = function(i) { return ((b >>> i) & 1) === 1; };
      for (i = 0; i <= 5; i++) fn(8, i, g(i)); fn(8, 7, g(6)); fn(8, 8, g(7)); fn(7, 8, g(8)); for (i = 9; i < 15; i++) fn(14 - i, 8, g(i));
      for (i = 0; i < 8; i++) fn(N - 1 - i, 8, g(i)); for (i = 8; i < 15; i++) fn(8, N - 15 + i, g(i)); fn(8, N - 8, true); }
    fmt(0);
    var bi = 0;
    for (var right = N - 1; right >= 1; right -= 2) { if (right === 6) right = 5;
      for (var vert = 0; vert < N; vert++) for (j = 0; j < 2; j++) { var x = right - j, up = ((right + 1) & 2) === 0, y = up ? N - 1 - vert : vert;
        if (!F[y][x] && bi < all.length * 8) { M[y][x] = ((all[bi >>> 3] >>> (7 - (bi & 7))) & 1) === 1; bi++; } } }
    function cond(m, x, y) { switch (m) { case 0: return (x + y) % 2 === 0; case 1: return y % 2 === 0; case 2: return x % 3 === 0; case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; case 5: return x * y % 2 + x * y % 3 === 0; case 6: return (x * y % 2 + x * y % 3) % 2 === 0; default: return ((x + y) % 2 + x * y % 3) % 2 === 0; } }
    function flip(m) { for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) if (!F[y][x] && cond(m, x, y)) M[y][x] = !M[y][x]; }
    function score() { var s = 0, x, y, run, dark = 0;   /* runs of 5+ and 2x2 blocks, and how far from half dark */
      for (y = 0; y < N; y++) { run = 1; for (x = 1; x < N; x++) { if (M[y][x] === M[y][x - 1]) { run++; if (run === 5) s += 3; else if (run > 5) s++; } else run = 1; } }
      for (x = 0; x < N; x++) { run = 1; for (y = 1; y < N; y++) { if (M[y][x] === M[y - 1][x]) { run++; if (run === 5) s += 3; else if (run > 5) s++; } else run = 1; } }
      for (y = 0; y < N - 1; y++) for (x = 0; x < N - 1; x++) { var c = M[y][x]; if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) s += 3; }
      for (y = 0; y < N; y++) for (x = 0; x < N; x++) if (M[y][x]) dark++;
      return s + Math.floor(Math.abs(dark * 20 - N * N * 10) / (N * N)) * 10; }
    var best = 0, bestS = Infinity;
    for (var m = 0; m < 8; m++) { flip(m); fmt(m); var sc = score(); if (sc < bestS) { bestS = sc; best = m; } flip(m); }
    flip(best); fmt(best);
    return { size: N, version: v, ecc: e, at: function(x, y) { return x >= 0 && y >= 0 && x < N && y < N && M[y][x]; } };
  }
  /* draws it on a canvas: dark squares on white, with the 4-module quiet zone */
  function draw(cv, text, px) { var q = make(text); if (!q) return null; var s = q.size + 8, p = px || Math.max(2, Math.floor(cv.width / s)); cv.width = cv.height = s * p;
    var g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = "#000";
    for (var y = 0; y < q.size; y++) for (var x = 0; x < q.size; x++) if (q.at(x, y)) g.fillRect((x + 4) * p, (y + 4) * p, p, p); return q; }
  return { make: make, draw: draw };
})();
if (typeof module !== "undefined") module.exports = UKQR;
