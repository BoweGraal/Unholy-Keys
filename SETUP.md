# Unholy Keys — Live Venue Setup Guide

Everything you need to get the live concert venue running. Takes about 10 minutes.

---

## What You Have

| File | What it does |
|------|-------------|
| `index.html` | Your instrument — play keys, go live, broadcast |
| `venue.html` | Audience page — join room, see stage, hear you play |
| `server/server.js` | WebSocket relay — connects performer to audience |
| `server/package.json` | Node dependencies for the relay server |

---

## Step 1: Deploy the Relay Server (free)

The server is a tiny Node.js app that relays messages between you and your audience. You need it running 24/7 on a free cloud host.

### Option A: Railway (recommended, easiest)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** > **"Deploy from GitHub Repo"**
3. Select your `unholy-keys` repository
4. Railway will auto-detect — click **Settings** on the deployed service:
   - Set **Root Directory** to `server`
   - Set **Start Command** to `node server.js`
5. Railway auto-assigns a domain. Click **Settings** > **Networking** > **Generate Domain**
6. Copy the URL — it looks like: `unholy-keys-production-xxxx.up.railway.app`
7. Your WebSocket URL is: `wss://unholy-keys-production-xxxx.up.railway.app`

### Option B: Render (also free)

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New"** > **"Web Service"**
3. Connect your `unholy-keys` repo
4. Settings:
   - **Name**: `unholy-keys-server`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free
5. Click **Create Web Service**
6. Copy the URL from the dashboard — looks like: `unholy-keys-server.onrender.com`
7. Your WebSocket URL is: `wss://unholy-keys-server.onrender.com`

> **Note:** Render free tier spins down after 15 min of inactivity. First connection takes ~30 seconds to wake up. Railway stays warm.

---

## Step 2: Update the WebSocket URL

You need to change `WS_URL` in **two files** to point to your deployed server.

### In `index.html`

Find this line (near the bottom, around line 805):
```javascript
var WS_URL="ws://localhost:8080";
```

Change it to your server URL (use `wss://` not `ws://`):
```javascript
var WS_URL="wss://unholy-keys-production-xxxx.up.railway.app";
```

### In `venue.html`

Find this line (near the top, around line 124):
```javascript
var WS_URL = "ws://localhost:8080";
```

Change it to the same URL:
```javascript
var WS_URL = "wss://unholy-keys-production-xxxx.up.railway.app";
```

---

## Step 3: Push to GitHub

Commit and push both updated files. GitHub Pages will serve them automatically.

If using the GitHub web UI:
1. Go to your repo on github.com
2. Navigate to `index.html` > click the pencil icon > paste the updated content > commit
3. Do the same for `venue.html`

---

## Step 4: Test It

### As Performer (you)
1. Open your GitHub Pages URL: `https://[username].github.io/unholy-keys/`
2. Pick an instrument, play some notes to make sure audio works
3. Click the **"Go Live"** button (bottom of the page)
4. A panel appears with a **Room Code** (like `A3K9XF`)
5. You're now broadcasting!

### As Audience (test with another tab/phone)
1. Open `https://[username].github.io/unholy-keys/venue.html`
2. Enter a display name
3. Enter the room code from step 4
4. Pick an avatar color and click **Enter Venue**
5. You should see:
   - The stage with your performer avatar
   - A canvas floor area you can click to walk around
   - Notes playing in sync when you play on the performer page
   - Chat at the bottom

### Share with friends
Just send them the venue URL + room code. That's it.

---

## How It Works

```
You (index.html)                    Audience (venue.html)
     |                                    |
     |-- "Go Live" creates room --------->|
     |                                    |
     |-- Play a note -------> Server ---> Audience hears it
     |-- Change instrument --> Server ---> Audience loads it
     |-- Play YouTube -------> Server ---> Big Screen shows it
     |                                    |
     |                          Audience clicks to walk around
     |                          Audience types in chat
     |<--- Chat messages <---- Server <-- |
```

- Notes are synthesized **locally** on each audience member's device
- This means perfect audio quality — no streaming lag/compression
- Network latency only shifts timing by ~50-100ms (imperceptible for live music)
- YouTube videos embed via the "big screen" above the stage

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Room not found" | Make sure you clicked "Go Live" first on index.html |
| No sound in venue | Click anywhere on the venue page first (browsers require interaction for audio) |
| Server not connecting | Check the WS_URL — must start with `wss://` (not `ws://`) for HTTPS pages |
| Render server slow to start | Free tier sleeps after 15 min — first connection wakes it (~30s) |
| Audience can't hear instrument | The performer must have the instrument loaded; audience auto-loads when they receive the instrument change event |

---

## Local Testing (optional)

If you want to test everything on your own machine before deploying:

1. Install Node.js (18+): [nodejs.org](https://nodejs.org)
2. Open a terminal in the `server` folder
3. Run: `npm install && node server.js`
4. Open `index.html` directly in your browser (or use `npx serve ..` from the server folder)
5. The `WS_URL` is already set to `ws://localhost:8080` — works out of the box
6. Open `venue.html` in another tab to test the audience view

---

## Future Enhancements

- **Custom tile maps**: Use [Tiled Map Editor](https://www.mapeditor.org/) to create venue layouts, export as JSON, load in venue.html
- **Sprite sheets**: Grab free character sprites from [OpenGameArt.org](https://opengameart.org/) for fancier avatars
- **Multiple rooms**: Server already supports it — each "Go Live" creates a unique room
- **Emoji reactions**: Audience could send floating emoji above their avatar
- **Stage effects**: Strobe lights, fog, laser beams synced to BPM
