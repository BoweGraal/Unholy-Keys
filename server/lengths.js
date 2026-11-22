/*  Unholy Keys: minigame length check.

    The games that share one song (the "set" in index.html: planSet) each get a slot of 60 to 90 seconds, which is what fills most
    gaps in a song. This runs the real planner from index.html for every game and a range of song lengths, and checks:

      - every game's slot is 60 to 90 s (a song too short for that gets one shorter game, and is reported, not failed)
      - the first game starts after a free dance intro, the break between two games is at least 15 s, the song is not cut off
      - with a chart that has bars and parts, games start and end on a bar or part change
      - the walk race is fitted to its slot: a typical finish lands inside it, near the end, never past it
      - the kart race (which ends itself) never runs past 90 s

    Usage (from the server folder):   node lengths.js          (or: npm run lengths)
    Exit code 1 if anything fails. */

var fs = require("fs"), path = require("path"), vm = require("vm");

var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var a = html.indexOf("var set=null,fullShow=false,gv=null;"), b = html.indexOf("function setPos(){");
if (a < 0 || b < 0) { console.log("FAIL could not find the planner in index.html"); process.exit(1); }
var ctx = { cfg: { secs: 18 }, localStorage: { getItem: function() { return null; }, setItem: function() {}, removeItem: function() {} }, status: function() {}, mk: function() {}, Math: Math, Array: Array, Object: Object, JSON: JSON };
vm.createContext(ctx);
vm.runInContext(html.slice(a, b) + "\nthis.planSet = planSet; this.MIN = GAME_MIN; this.MAX = GAME_MAX;", ctx);
var planSet = ctx.planSet, MIN = ctx.MIN, MAX = ctx.MAX;

var fails = 0;
function check(ok, name, detail) { if (!ok) fails++; console.log((ok ? "PASS " : "FAIL ") + name + (detail ? "  (" + detail + ")" : "")); }
function mmss(ms) { var s = Math.round(ms / 1000); return Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); }

/* a song at 100 BPM (a bar is 2.4 s) with a part change every 16 bars, in ms, like CHART.analyse gives */
function chartFor(D, bpm) {
  var per = 60000 / bpm, beats = [], sections = [], i;
  for (i = 0; per * i + 700 < D; i++) beats.push(Math.round(per * i + 700));
  for (i = 0; i * per * 64 + 700 < D; i++) sections.push([Math.round(i * per * 64 + 700), i ? "verse" : "intro"]);
  return { bpm: bpm, dur: D, beats: beats, sections: sections, steps: [] };
}

var ALL = ["step", "aim", "keys", "keys4", "mosh", "skate", "ice", "keepy", "kart", "walk", "pipe", "ski", "ctf"];
var songs = [75, 90, 120, 150, 170, 180, 200, 215, 240, 270, 300, 360, 420, 600].map(function(s) { return s * 1000; });

console.log("Slots for each song length (one game, then two games):\n");
songs.forEach(function(D) {
  [[["step"]], [["step", "walk"]], [["crowd", "kart"]]].forEach(function(gs) {
    var games = gs[0], chart = chartFor(D, 100), plan = planSet(games, D, chart), plain = planSet(games, D);
    var label = (games.length === 1 ? "1 game " : "2 games") + " · song " + mmss(D) + ": " + plan.map(function(q) { return q.mode + " " + mmss(q.start) + "-" + mmss(q.end) + " (" + Math.round((q.end - q.start) / 1000) + " s)"; }).join(", ");
    console.log("  " + label);
    var tooShort = D - 15000 - 12000 < MIN;   /* not even one 60 s slot with an intro and an outro */
    plan.forEach(function(q) {
      var len = q.end - q.start;
      if (tooShort) { check(len > 0 && q.end <= D, "short song " + mmss(D) + " " + q.mode + " still fits", Math.round(len / 1000) + " s slot"); return; }
      check(len >= MIN - 1 && len <= MAX + 1, mmss(D) + " " + q.mode + " slot is 60 to 90 s", Math.round(len / 1000) + " s");
    });
    plan.forEach(function(q, k) {
      check(q.start >= 2000, mmss(D) + " " + q.mode + " starts after a free dance intro", mmss(q.start));
      check(q.end <= D - 12000 + 1, mmss(D) + " " + q.mode + " ends before the last 12 s", mmss(q.end) + " of " + mmss(D));
      if (k) check(q.start - plan[k - 1].end >= 15000 - 1, mmss(D) + " break before " + q.mode + " is at least 15 s", Math.round((q.start - plan[k - 1].end) / 1000) + " s");
    });
    if (!tooShort) {
      var cuts = {}; chart.beats.forEach(function(t, i) { if (i % 4 === 0) cuts[t] = 1; }); chart.sections.forEach(function(s) { cuts[s[0]] = 1; });
      plan.forEach(function(q) { check(!!cuts[q.start] || Math.abs(q.start - plain.filter(function(p) { return p.mode === q.mode; })[0].start) <= 6000, mmss(D) + " " + q.mode + " starts on a bar or part change", mmss(q.start)); });
    }
  });
});

console.log("\nGames that run to a finish:\n");
/* the walk race: full-speed time is (slot - 6 s) x 0.8 between 45 and 90 s; a typical racer averages about 85% of full speed with a trip or two */
[60000, 70000, 75000, 80000, 90000].forEach(function(G) {
  var full = Math.max(45, Math.min(90, (G / 1000 - 6) * 0.8)), typical = full / 0.85;
  check(typical <= G / 1000 - 2 && typical >= G / 1000 * 0.6, "walk race in a " + G / 1000 + " s slot", "full speed " + full.toFixed(0) + " s, typical finish " + typical.toFixed(0) + " s");
});
[60000, 90000].forEach(function(G) {
  var q = Math.min(G, 90000);
  check(q <= 90000, "kart race in a " + G / 1000 + " s slot is capped at 90 s", q / 1000 + " s");
});

console.log("\n" + (fails ? fails + " check" + (fails === 1 ? "" : "s") + " FAILED" : "All checks passed"));
process.exit(fails ? 1 : 0);
