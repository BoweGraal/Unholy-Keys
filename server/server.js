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
  ".wav": "audio/wav", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg" };
function health() {
  var viewers = 0; Object.keys(rooms).forEach(function(k) { viewers += rooms[k].viewers.size; });
  return { ok: true, service: "unholy-keys-relay", rooms: Object.keys(rooms).length, viewers: viewers,
    uptimeSeconds: Math.round((Date.now() - STARTED) / 1000), node: process.version,
    streamMBSentSinceStart: Math.round(STREAM_BYTES / 1e5) / 10 };
}
var server = http.createServer(function(req, res) {
  var url = (req.url || "/").split("?")[0];
  if (url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" });
    return res.end(JSON.stringify(health()));
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
var PERFORMER_TYPES = { note: 1, inst: 1, state: 1, info: 1, video: 1, stream: 1 };

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

function genCode() {
  var code;
  do { code = Math.random().toString(36).substring(2, 8).toUpperCase(); } while (code.length < 6 || rooms[code]);
  return code;
}
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

function viewerList(room) {
  var r = rooms[room]; if (!r) return [];
  var out = [];
  r.viewers.forEach(function(v, id) { out.push({ id: id, name: v.name, x: v.x, y: v.y, color: v.color }); });
  return out;
}

/* Allow a short burst, then at most `perSec` messages a second. */
function allow(ws, key, burst, perSec) {
  var now = Date.now(), b = ws._rate || (ws._rate = {}), s = b[key] || (b[key] = { n: burst, t: now });
  s.n = Math.min(burst, s.n + (now - s.t) / 1000 * perSec); s.t = now;
  if (s.n < 1) return false;
  s.n -= 1; return true;
}

wss.on("connection", function(ws) {
  ws.isAlive = true;
  ws.on("pong", function() { ws.isAlive = true; });
  ws.on("error", function() {});

  ws.on("message", function(raw, isBinary) {
    if (isBinary) { relayStream(ws, raw); return; }
    if (raw.length > 16 * 1024) return;
    var msg;
    try { msg = JSON.parse(raw); } catch(e) { return; }
    if (!msg || typeof msg !== "object" || typeof msg.type !== "string") return;

    /* ── Performer creates room ── */
    if (msg.type === "create-room") {
      if (ws.role) return;                       // one role per connection
      var code = genCode();                      // never a client-chosen code: that let anyone take over a live room
      rooms[code] = { performer: ws, viewers: new Map(), state: {}, video: null };
      ws.room = code;
      ws.role = "performer";
      send(ws, { type: "room-created", room: code });
      console.log("Room created:", code);
      return;
    }

    /* ── Audience joins room ── */
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
      var startX = +(0.25 + Math.random() * 0.5).toFixed(3);   // 0.25–0.75 normalized
      var startY = +(0.35 + Math.random() * 0.30).toFixed(3); // 0.35–0.65 normalized
      r.viewers.set(id, { ws: ws, name: ws.viewerName, x: startX, y: startY, color: ws.viewerColor });

      // Send room state to new viewer
      send(ws, {
        type: "room-state",
        yourId: id,
        viewers: viewerList(roomCode),
        performerState: r.state,
        video: liveVideo(r),
        stream: r.stream || null
      });

      // Notify everyone else
      broadcast(roomCode, { type: "viewer-join", id: id, name: ws.viewerName, x: startX, y: startY, color: ws.viewerColor }, ws);

      // Tell performer viewer count
      if (r.performer) send(r.performer, { type: "viewer-count", count: r.viewers.size });
      console.log(ws.viewerName, "joined room", roomCode, "(" + r.viewers.size + " viewers)");
      return;
    }

    /* ── Performer broadcasts ── */
    if (ws.role === "performer" && ws.room && rooms[ws.room]) {
      if (!PERFORMER_TYPES[msg.type]) return;
      if (msg.type === "state") rooms[ws.room].state = msg;
      if (msg.type === "video") { rooms[ws.room].video = msg; rooms[ws.room].videoAt = Date.now(); }
      if (msg.type === "stream") rooms[ws.room].stream = msg.active ? msg : null;
      broadcast(ws.room, msg, ws);
      return;
    }

    /* ── Viewer broadcasts: chat and position only ── */
    if (ws.role === "viewer" && ws.room && rooms[ws.room]) {
      if (msg.type === "chat") {
        var text = str(msg.text, 300);
        if (!text || !allow(ws, "chat", 5, 1)) return;
        broadcast(ws.room, { type: "chat", id: ws.viewerId, viewerId: ws.viewerId, name: ws.viewerName, color: ws.viewerColor, text: text }, ws);
        return;
      }
      if (msg.type === "pos") {
        var x = unit(msg.x), y = unit(msg.y);
        if (x === null || y === null || !allow(ws, "pos", 20, 15)) return;
        var v = rooms[ws.room].viewers.get(ws.viewerId);
        if (v) { v.x = x; v.y = y; }
        broadcast(ws.room, { type: "pos", id: ws.viewerId, name: ws.viewerName, x: x, y: y }, ws);
        return;
      }
      return; // anything else from a viewer is dropped (it used to be relayed to the whole room as-is)
    }
  });

  ws.on("close", function() {
    if (!ws.room) return;
    if (ws.role === "performer" && rooms[ws.room] && rooms[ws.room].performer === ws) {
      broadcast(ws.room, { type: "performer-left" });
      console.log("Performer left, closing room", ws.room);
      delete rooms[ws.room];
    }
    if (ws.role === "viewer" && rooms[ws.room]) {
      rooms[ws.room].viewers.delete(ws.viewerId);
      broadcast(ws.room, { type: "viewer-leave", id: ws.viewerId });
      var r = rooms[ws.room];
      if (r && r.performer) send(r.performer, { type: "viewer-count", count: r.viewers.size });
    }
  });
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
