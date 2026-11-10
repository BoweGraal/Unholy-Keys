# Testing Unholy Keys

Everything you need to test a live show on one computer, check that a deployed server works, and collect what Claude needs when something goes wrong.

The kit has three parts, all in the `server` folder:

| Command | What it does |
|---|---|
| `npm start` | Runs the relay server, and serves the performer and audience pages at `http://localhost:8080` |
| `npm run check` | Tests a server the way a show uses it: opens a room, joins it, sends notes and chat, times each step, and checks the instrument sample hosts |
| `npm run crowd -- CODE 20` | Sends 20 fake audience members into your room. They walk around, chat, and report what they hear |

---

## One-time setup (Windows)

1. **Install Node.js.** Download the LTS version from [nodejs.org](https://nodejs.org) and run the installer with the default options.
2. **Get the code.** On the repo page on GitHub, click **Code → Download ZIP**, then unzip it somewhere easy, such as `Documents\Unholy-Keys`. (If you use GitHub Desktop, clone it instead, so you can pull updates.)
3. **Open a terminal in the server folder.** In File Explorer, open the `server` folder inside the repo, click the address bar, type `cmd`, and press Enter.
4. **Install the server's one dependency:**
   ```
   npm install
   ```
   You only need to do this once (and again if `package.json` changes).

To check Node is installed, `node -v` should print `v18` or higher.

---

## Part 1: Test a show on your own computer

1. **Start the server** in the terminal from step 3:
   ```
   npm start
   ```
   You should see:
   ```
   Unholy Keys relay server running on port 8080
     Performer page:  http://localhost:8080/
     Audience page:   http://localhost:8080/venue.html
     Health check:    http://localhost:8080/health
   ```
   Leave this window open. Closing it stops the server.

2. **Open the performer page** at `http://localhost:8080/` and click **LIVE**. The button turns red and a 6-letter room code appears. Write it down.

   Use this address, not a double-click on `index.html`. Pages opened as files can't load the Bit Crush effect.

3. **Be your own audience.** Open `http://localhost:8080/venue.html` in a second window. A private/incognito window works best, since it behaves like a separate person. Enter a name and the room code.

4. **Add a fake crowd.** Open a second terminal in the `server` folder (same as setup step 3) and run:
   ```
   npm run crowd -- ABC123 20
   ```
   Replace `ABC123` with your room code. Every 5 seconds it prints a status line:
   ```
   [crowd] 20/20 in the room | notes heard: 37 | instrument: tron flute | key: G Blues | chat sent: 4
   ```

5. **Play, and confirm each of these:**

   | Check | Where to look |
   |---|---|
   | Viewer count goes up as the crowd joins | Next to the LIVE button on the performer page |
   | Fake viewers walk around and chat | Your audience window |
   | Notes you play sound in the audience window | Your audience window (click it once first so the browser allows sound) |
   | `notes heard` goes up as you play | Crowd terminal |
   | Switching instrument or key shows up | Crowd terminal and the audience page's corner display |
   | Picking a video shows it on the big screen | Your audience window |
   | Clicking LIVE again ends the show | The crowd terminal prints "The performer ended the show" and exits |

6. **Stop** with `Ctrl+C` in each terminal.

---

## Part 2: Check a deployed server

Deploy the `server` folder to Railway or Render first ([SETUP.md](SETUP.md)). Your host gives you an address like `https://unholy-keys-production.up.railway.app`.

1. **Open the health page** in any browser: your server address followed by `/health`. You should see something like:
   ```
   {"ok":true,"service":"unholy-keys-relay","rooms":0,"viewers":0,"uptimeSeconds":512,"node":"v20.11.0"}
   ```
   Free tiers go to sleep when unused. If the page takes 30+ seconds the first time, that's the server waking up; reload it.

2. **Run the full check** from the `server` folder on your computer, with your address starting `wss://` instead of `https://`:
   ```
   npm run check -- wss://unholy-keys-production.up.railway.app
   ```
   A healthy server looks like this:
   ```
   PASS health page answers  (0 rooms, 0 viewers, up 512s, node v20.11.0)
   PASS performer connects  (180ms)
   PASS room created  (K3X9QZ, 45ms)
   PASS audience joins the room  (40ms)
   PASS performer sees the viewer count  (count 1)
   PASS notes reach the audience  (median 42ms, worst 61ms)
   PASS audience chat reaches the performer
   PASS audience cannot send performer events
   ...
   All checks passed.
   ```
   Note delay under about 100 ms is fine for a show. Over 150 ms the audience will hear notes noticeably late.

3. **Try a show against it without editing any code.** Add `?ws=` and your server address to the end of the page address. With GitHub Pages turned on for the repo, that looks like:
   ```
   https://bowegraal.github.io/Unholy-Keys/?ws=wss://unholy-keys-production.up.railway.app
   https://bowegraal.github.io/Unholy-Keys/venue.html?ws=wss://unholy-keys-production.up.railway.app
   ```
   The browser remembers it, so after the first visit the plain address works too. `?ws=reset` forgets it. Then run the crowd against it:
   ```
   npm run crowd -- ABC123 20 wss://unholy-keys-production.up.railway.app
   ```

4. **The default server** is `wss://unholy-keys.onrender.com`, set as `WS_URL` in both `index.html` and `venue.html`. If you move hosts, change it in both files.

How the pages pick a server, first match wins:
1. A `?ws=` address (or one remembered from an earlier `?ws=`)
2. The server the page was loaded from, when that's the relay server itself (`http://localhost:8080`, or your Railway/Render address)
3. `WS_URL` in the page

---

## Troubleshooting

| What you see | Likely cause | What to do |
|---|---|---|
| LIVE button says **No server** | Nothing at the address the page is using | Hover the button to see the address. Locally: is `npm start` running? Deployed: run `npm run check` against it |
| `ECONNREFUSED` | Nothing is listening at that address | Start the server, or check the port |
| `ENOTFOUND` | The address doesn't exist | Check the spelling of the server address |
| `Unexpected server response` | Something answered, but it isn't the relay server | Check the address, and that the host's root directory is set to `server` |
| Check times out, or the first attempt is slow | Free tier was asleep | Open `/health`, wait for it to load, run the check again |
| Works locally, fails from GitHub Pages | GitHub Pages is `https`, which can only reach `wss://` addresses | Use `wss://`, never `ws://`, for a deployed server |
| **Room not found** | Wrong code, or the performer page is on a different server than the audience | Both pages must use the same server. Check the LIVE button's tooltip on both |
| Crowd joins but `notes heard` stays at 0 | Notes aren't reaching the server | Click the "Click then play!" box on the performer page, then play |
| Audience page is silent but notes arrive | The browser blocks sound until you interact | Click anywhere on the audience page once |
| `audience cannot send performer events` fails | The deployed server is running old code | Redeploy the latest `server.js` |
| A sample host check fails | That sample site is down or blocked on your network | Instruments from that collection won't load. Try another network to tell which |

---

## Getting help from Claude

When something doesn't work, send Claude these three things:

1. **The full output of the check:**
   ```
   npm run check -- <your server address>
   ```
2. **The browser console.** On the page that misbehaves, press `F12`, open the **Console** tab, reproduce the problem, then right-click in the console and choose **Save as…** (or screenshot it). Lines starting `[Unholy Keys]` name the server address the page tried.
3. **The exact page address** you opened, and what you expected versus what happened.

If the server itself crashed, also copy the last 20 lines of the `npm start` window (locally) or your host's **Logs** tab (deployed).
