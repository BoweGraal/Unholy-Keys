/* BATTLE: plan a knockout tournament of quick 1 v 1 matches inside one song.
   The same code is copied into venue.html (practice mode runs the tournament itself); keep the two the same.

   battlePlan(entrants, chart, lockPos)
     entrants: [{id,name,color}], best seeds first. chart: {dur, beats} or null. lockPos: song position now (ms).
     One match at a time, back to back, with a short gap; the final takes the song's finale (the last 15-30 s).
     Earlier matches share the time between now and the final, 9 to 25 s each. If that's too tight, the lowest
     seeds are left out until it fits. Not a power of two: the top seeds get a bye through the first round.
     Without a song length: 18 s matches and a 25 s final, starting 5 s from now.
     Returns {entrants, slots} or null. Each slot (a match):
       {r: round from the end (0 = final, 1 = semifinal...), label, src: [a, b], a, b, w, start, end}
       src entries are {e: entrant index} or {s: slot index} (the winner of that match);
       a, b: entrant indices once known (-1 until then); w: 0 if a won, 1 if b won, -1 not played yet.
   battleAdvance(plan): fills in a and b for matches whose earlier matches are decided.
   battleLive(plan, pos, lead): the index of the match on at song position pos (lead ms early), or -1.
   battleRanks(plan): [{e, place, wins}] best first: champion, finalist, then by the round they went out in. */
var BATTLE = (function() {
  var GAP = 2000, MIN = 9000, MAX = 25000;
  function seeds(P) { var a = [1, 2]; while (a.length < P) { var n = a.length * 2 + 1, b = []; for (var i = 0; i < a.length; i++) b.push(a[i], n - a[i]); a = b; } return a; }
  function label(r, R) { return r === 0 ? "Final" : r === 1 ? "Semifinal" : r === 2 ? "Quarterfinal" : "Round " + (R - r); }
  function snap(t, beats) {
    if (!beats || beats.length < 8) return Math.round(t);
    var lo = 0, hi = beats.length - 1;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (beats[m] < t) lo = m; else hi = m; }
    return Math.round(Math.abs(beats[lo] - t) < Math.abs(beats[hi] - t) ? beats[lo] : beats[hi]);
  }
  function build(ents, chart, lockPos) {
    var N = ents.length, P = 1, R = 0, i;
    while (P < N) { P *= 2; R++; }
    var order = seeds(P), slots = [], cur = [];
    for (i = 0; i < P; i += 2) {
      var x = order[i] - 1, y = order[i + 1] - 1, sx = x < N ? { e: x } : null, sy = y < N ? { e: y } : null;
      if (sx && sy) { slots.push({ r: R - 1, src: [sx, sy] }); cur.push({ s: slots.length - 1 }); }
      else cur.push(sx || sy);
    }
    for (var r = R - 2; r >= 0; r--) {
      var next = [];
      for (i = 0; i < cur.length; i += 2) { slots.push({ r: r, src: [cur[i], cur[i + 1]] }); next.push({ s: slots.length - 1 }); }
      cur = next;
    }
    var M = slots.length, dur = chart && chart.dur > 0 ? chart.dur : 0, beats = chart && chart.beats, t0 = lockPos + 5000;
    if (dur) {
      var end = dur - 1000, F = Math.max(15000, Math.min(30000, dur * 0.22));
      if (M === 1) {
        var s1 = Math.max(t0, end - F);
        if (end - s1 < 10000) return null;
        slots[0].start = snap(s1, beats); slots[0].end = Math.round(end);
      } else {
        var tF = end - F, L = ((tF - GAP) - t0 - (M - 2) * GAP) / (M - 1);
        if (L < MIN) return null;
        if (L > MAX) { L = MAX; t0 = tF - GAP - (M - 1) * L - (M - 2) * GAP; }
        for (i = 0; i < M - 1; i++) { slots[i].start = snap(t0 + i * (L + GAP), beats); slots[i].end = snap(t0 + i * (L + GAP) + L, beats); }
        slots[M - 1].start = snap(tF, beats); slots[M - 1].end = Math.round(end);
      }
    } else {
      for (i = 0; i < M; i++) { var len = i === M - 1 ? 25000 : 18000; slots[i].start = Math.round(t0); slots[i].end = Math.round(t0 + len); t0 += len + GAP; }
    }
    for (i = 0; i < M; i++) { var s = slots[i]; s.label = label(s.r, R); s.a = -1; s.b = -1; s.w = -1; }
    var plan = { entrants: ents, slots: slots };
    advance(plan);
    return plan;
  }
  function plan(entrants, chart, lockPos) {
    if (!entrants || entrants.length < 2) return null;
    for (var N = Math.min(entrants.length, 32); N >= 2; N--) { var p = build(entrants.slice(0, N), chart, lockPos); if (p) return p; }
    return null;
  }
  function who(plan, src) { if (!src) return -1; if (src.e !== undefined) return src.e; var s = plan.slots[src.s]; return s && s.w >= 0 ? (s.w === 0 ? s.a : s.b) : -1; }
  function advance(plan) { plan.slots.forEach(function(s) { if (s.a < 0) s.a = who(plan, s.src[0]); if (s.b < 0) s.b = who(plan, s.src[1]); }); }
  function live(plan, pos, lead) {
    if (!plan) return -1; lead = lead || 0;
    for (var i = 0; i < plan.slots.length; i++) { var s = plan.slots[i]; if (pos >= s.start - lead && pos < s.end) return i; }
    return -1;
  }
  function ranks(plan) {
    var out = [], seen = {}, n = plan.entrants.length, wins = [], i, best = [];
    for (i = 0; i < n; i++) { wins[i] = 0; best[i] = 99; }
    plan.slots.forEach(function(s) {
      if (s.w < 0) return;
      var win = s.w === 0 ? s.a : s.b, lose = s.w === 0 ? s.b : s.a;
      if (win >= 0) wins[win]++;
      if (lose >= 0) best[lose] = Math.min(best[lose], s.r + 1);   /* went out in round r: placed behind everyone who went further */
    });
    var fin = plan.slots[plan.slots.length - 1];
    if (fin && fin.w >= 0) best[fin.w === 0 ? fin.a : fin.b] = 0;
    for (i = 0; i < n; i++) { if (best[i] === 99) best[i] = -1; out.push({ e: i, depth: best[i], wins: wins[i] }); }
    /* still in it (not knocked out; the song ended early): ahead of those who went out, by wins */
    out.sort(function(a, b) {
      var da = a.depth < 0 ? -0.5 : a.depth, db = b.depth < 0 ? -0.5 : b.depth;
      return da - db || b.wins - a.wins;
    });
    for (i = 0; i < out.length; i++) out[i].place = (i > 0 && (out[i].depth === out[i - 1].depth) && out[i].wins === out[i - 1].wins) ? out[i - 1].place : i;
    return out;
  }
  return { plan: plan, advance: advance, live: live, ranks: ranks };
})();
if (typeof module !== "undefined") module.exports = BATTLE;
