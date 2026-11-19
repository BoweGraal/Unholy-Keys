/* ============================================================
   YOUTUBE SONG CHARTS
   Dance practice can add a YouTube song: the browser plays it once in the normal YouTube player, listens
   while it plays, and sends here the analysis the dance charts are built from (beat times, loudness, the
   rhythm envelope). The sound itself is never kept or sent anywhere: the song is always played through
   YouTube's own player.

   Where they're kept: on a branch of the game's GitHub repo ("yt-charts" by default), so they survive this
   server restarting or redeploying, and every player's page can read them straight from GitHub:
     index.json        [{vid, title, dur, bpm, at}]
     <videoId>.json    the analysis
   Writing needs a GitHub token (GITHUB_TOKEN, allowed to write this repo's contents). Without one this server
   keeps them in memory until it restarts, and says so.

   Endpoints (CORS open, since the pages are served from GitHub Pages):
     GET  /yt/list          the index
     GET  /yt/<id>.json     one song's analysis
     POST /yt/add           {vid, title, f}   (f = the analysis)
   ============================================================ */
var https = require("https");

var REPO = process.env.GITHUB_REPO || "BoweGraal/Unholy-Keys";
var BRANCH = process.env.YT_BRANCH || "yt-charts";
var TOKEN = process.env.GITHUB_TOKEN || "";
var MAX_SONGS = 500, MAX_BODY = 1024 * 1024;

var index = [], charts = {}, loaded = false, loading = null, queue = Promise.resolve();
var adds = {};   /* ip -> [times], to keep one person from flooding the list */

function gh(method, p, body) {
  return new Promise(function(resolve, reject) {
    var data = body ? JSON.stringify(body) : null;
    var req = https.request({ hostname: "api.github.com", path: "/repos/" + REPO + p, method: method,
      headers: Object.assign({ "User-Agent": "unholy-keys-relay", "Accept": "application/vnd.github+json" },
        TOKEN ? { "Authorization": "Bearer " + TOKEN } : {},
        data ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } : {}) }, function(res) {
      var chunks = [];
      res.on("data", function(c) { chunks.push(c); });
      res.on("end", function() {
        var txt = Buffer.concat(chunks).toString("utf8"), js = null;
        try { js = txt ? JSON.parse(txt) : null; } catch (e) {}
        resolve({ status: res.statusCode, body: js });
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, function() { req.destroy(new Error("timeout")); });
    if (data) req.write(data);
    req.end();
  });
}
function getFile(name) {
  return gh("GET", "/contents/" + encodeURIComponent(name) + "?ref=" + BRANCH).then(function(r) {
    if (r.status !== 200 || !r.body || !r.body.content) return null;
    return { sha: r.body.sha, json: JSON.parse(Buffer.from(r.body.content, "base64").toString("utf8")) };
  });
}
function putFile(name, json, msg) {
  return gh("GET", "/contents/" + encodeURIComponent(name) + "?ref=" + BRANCH).then(function(r) {
    var body = { message: msg, branch: BRANCH, content: Buffer.from(JSON.stringify(json)).toString("base64") };
    if (r.status === 200 && r.body && r.body.sha) body.sha = r.body.sha;
    return gh("PUT", "/contents/" + encodeURIComponent(name), body);
  }).then(function(r) { if (r.status !== 200 && r.status !== 201) throw new Error("GitHub said " + r.status); });
}
/* the data branch, made from the default branch the first time */
function ensureBranch() {
  return gh("GET", "/git/ref/heads/" + BRANCH).then(function(r) {
    if (r.status === 200) return;
    return gh("GET", "").then(function(repo) {
      var def = repo.body && repo.body.default_branch || "main";
      return gh("GET", "/git/ref/heads/" + def);
    }).then(function(ref) {
      if (!ref.body || !ref.body.object) throw new Error("can't find the default branch");
      return gh("POST", "/git/refs", { ref: "refs/heads/" + BRANCH, sha: ref.body.object.sha });
    });
  });
}
function load() {
  if (loaded) return Promise.resolve();
  if (loading) return loading;
  loading = getFile("index.json").then(function(f) {
    if (f && Array.isArray(f.json)) index = f.json.filter(validEntry).slice(0, MAX_SONGS);
    loaded = true;
  }).catch(function() { loaded = true; }).then(function() { loading = null; });
  return loading;
}

function validEntry(e) { return e && /^[A-Za-z0-9_-]{11}$/.test(e.vid); }
function cleanTitle(t) { return String(t || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 100); }
/* an analysis has the right shape and reasonable sizes (a song up to about 15 minutes) */
function validF(f) {
  if (!f || f.v !== 1 || !(f.bpm > 40 && f.bpm < 260) || !(f.dur > 5000 && f.dur < 15 * 60 * 1000)) return false;
  if (!Array.isArray(f.bt) || f.bt.length < 4 || f.bt.length > 5000 || !f.bt.every(function(x) { return typeof x === "number" && isFinite(x); })) return false;
  if (!f.e || typeof f.e.d !== "string" || f.e.d.length > 400000 || !/^[A-Za-z0-9+/=]*$/.test(f.e.d) || !(f.e.s >= 0)) return false;
  var ii = f.ii;
  if (!ii || !Array.isArray(ii.E) || !Array.isArray(ii.loud) || !Array.isArray(ii.ch) || !Array.isArray(ii.peaks)) return false;
  if (ii.E.length !== f.bt.length || ii.loud.length !== f.bt.length || ii.ch.length !== f.bt.length) return false;
  if (!ii.ch.every(function(a) { return Array.isArray(a) && a.length === 12; })) return false;
  if (ii.peaks.length > 200 || !ii.peaks.every(function(p) { return Array.isArray(p) && p.length === 2; })) return false;
  return true;
}

function send(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-cache" });
  res.end(JSON.stringify(obj));
}

/* returns true if it handled the request */
function handle(req, res, url) {
  if (url.indexOf("/yt/") !== 0) return false;
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" });
    res.end(); return true;
  }
  if (req.method === "GET" && url === "/yt/list") {
    load().then(function() { send(res, 200, { saved: !!TOKEN, songs: index }); });
    return true;
  }
  var m = url.match(/^\/yt\/([A-Za-z0-9_-]{11})\.json$/);
  if (req.method === "GET" && m) {
    if (charts[m[1]]) { send(res, 200, charts[m[1]]); return true; }
    getFile(m[1] + ".json").then(function(f) {
      if (!f) return send(res, 404, { error: "not found" });
      charts[m[1]] = f.json; send(res, 200, f.json);
    }).catch(function() { send(res, 502, { error: "couldn't reach GitHub" }); });
    return true;
  }
  if (req.method === "POST" && url === "/yt/add") {
    var ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim(), now = Date.now();
    adds[ip] = (adds[ip] || []).filter(function(t) { return now - t < 3600000; });
    if (adds[ip].length >= 20) { send(res, 429, { error: "That's a lot of songs for one hour. Try again later." }); req.resume(); return true; }
    var size = 0, chunks = [], over = false;
    req.on("data", function(c) { size += c.length; if (size > MAX_BODY) { over = true; req.destroy(); } else chunks.push(c); });
    req.on("end", function() {
      if (over) return;
      var b; try { b = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch (e) { return send(res, 400, { error: "bad data" }); }
      var vid = String(b && b.vid || ""), title = cleanTitle(b && b.title) || vid;
      if (!/^[A-Za-z0-9_-]{11}$/.test(vid) || !validF(b.f)) return send(res, 400, { error: "That analysis doesn't look right." });
      adds[ip].push(now);
      var f = b.f, entry = { vid: vid, title: title, dur: Math.round(f.dur), bpm: Math.round(f.bpm * 10) / 10, at: now };
      load().then(function() {
        charts[vid] = f;
        index = index.filter(function(e) { return e.vid !== vid; });
        index.push(entry);
        index.sort(function(a, c) { return a.title.localeCompare(c.title); });
        if (index.length > MAX_SONGS) index = index.slice(index.length - MAX_SONGS);
        if (!TOKEN) return send(res, 200, { ok: true, saved: false, entry: entry });
        /* one write at a time, so two songs added together don't trip over the index */
        queue = queue.then(function() {
          return ensureBranch()
            .then(function() { return putFile(vid + ".json", f, "Add YouTube chart: " + title); })
            .then(function() { return putFile("index.json", index, "Update YouTube song list"); });
        }).then(function() { send(res, 200, { ok: true, saved: true, entry: entry }); },
          function(e) { console.log("[yt] save failed:", e.message); send(res, 200, { ok: true, saved: false, entry: entry, error: "Saved for now, but GitHub didn't take it: " + e.message }); });
      });
    });
    return true;
  }
  send(res, 404, { error: "not found" });
  return true;
}

module.exports = { handle: handle, _validF: validF };
