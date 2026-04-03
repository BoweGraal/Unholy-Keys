/*  Unholy Keys — Live Relay Server
    Handles rooms, note events, video sync, chat, avatar positions.
    Deploy to Railway/Render free tier. */

var WebSocket = require("ws");
var PORT = process.env.PORT || 8080;
var wss = new WebSocket.Server({ port: PORT });
var rooms = {};

function genCode() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }
function genId() { return Math.random().toString(36).substring(2, 10); }

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

wss.on("connection", function(ws) {
  ws.isAlive = true;
  ws.on("pong", function() { ws.isAlive = true; });

  ws.on("message", function(raw) {
    var msg;
    try { msg = JSON.parse(raw); } catch(e) { return; }

    /* ── Performer creates room ── */
    if (msg.type === "create-room") {
      var code = msg.room || genCode();
      rooms[code] = { performer: ws, viewers: new Map(), state: {}, video: null };
      ws.room = code;
      ws.role = "performer";
      ws.send(JSON.stringify({ type: "room-created", room: code }));
      console.log("Room created:", code);
      return;
    }

    /* ── Audience joins room ── */
    if (msg.type === "join-room") {
      var r = rooms[msg.room];
      if (!r) { ws.send(JSON.stringify({ type: "error", msg: "Room not found" })); return; }
      var id = genId();
      ws.room = msg.room;
      ws.role = "viewer";
      ws.viewerId = id;
      ws.viewerName = msg.name || "Anonymous";
      ws.viewerColor = msg.color || "#D354A0";
      var startX = +(0.25 + Math.random() * 0.5).toFixed(3);   // 0.25–0.75 normalized
      var startY = +(0.35 + Math.random() * 0.30).toFixed(3); // 0.35–0.65 normalized
      r.viewers.set(id, { ws: ws, name: ws.viewerName, x: startX, y: startY, color: ws.viewerColor });

      // Send room state to new viewer
      ws.send(JSON.stringify({
        type: "room-state",
        yourId: id,
        viewers: viewerList(msg.room),
        performerState: r.state,
        video: r.video
      }));

      // Notify everyone else
      broadcast(msg.room, { type: "viewer-join", id: id, name: ws.viewerName, x: startX, y: startY, color: ws.viewerColor }, ws);

      // Tell performer viewer count
      if (r.performer) try { r.performer.send(JSON.stringify({ type: "viewer-count", count: r.viewers.size })); } catch(e) {}
      console.log(ws.viewerName, "joined room", msg.room, "(" + r.viewers.size + " viewers)");
      return;
    }

    /* ── Performer broadcasts ── */
    if (ws.role === "performer" && ws.room && rooms[ws.room]) {
      if (msg.type === "state") rooms[ws.room].state = msg;
      if (msg.type === "video") rooms[ws.room].video = msg;
      broadcast(ws.room, msg, ws);
      return;
    }

    /* ── Viewer broadcasts ── */
    if (ws.role === "viewer" && ws.room && rooms[ws.room]) {
      msg.id = ws.viewerId;
      msg.name = ws.viewerName;
      if (msg.type === "chat") { msg.color = ws.viewerColor; msg.viewerId = ws.viewerId; }
      if (msg.type === "pos") {
        var rv = rooms[ws.room];
        var v = rv ? rv.viewers.get(ws.viewerId) : null;
        if (v) { v.x = msg.x; v.y = msg.y; }
      }
      broadcast(ws.room, msg, ws);
      return;
    }
  });

  ws.on("close", function() {
    if (!ws.room) return;
    if (ws.role === "performer" && rooms[ws.room]) {
      broadcast(ws.room, { type: "performer-left" });
      console.log("Performer left, closing room", ws.room);
      delete rooms[ws.room];
    }
    if (ws.role === "viewer" && rooms[ws.room]) {
      rooms[ws.room].viewers.delete(ws.viewerId);
      broadcast(ws.room, { type: "viewer-leave", id: ws.viewerId });
      var r = rooms[ws.room];
      if (r && r.performer) try { r.performer.send(JSON.stringify({ type: "viewer-count", count: r.viewers.size })); } catch(e) {}
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

console.log("Unholy Keys relay server running on port " + PORT);
