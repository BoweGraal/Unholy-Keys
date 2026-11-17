# Testing Unholy Keys

Everything you need to test a live show on one computer, check that a deployed server works, and collect what Claude needs when something goes wrong.

The kit has three parts, all in the `server` folder:

| Command | What it does |
|---|---|
| `npm start` | Runs the relay server, and serves the performer and audience pages at `http://localhost:8080` |
| `npm run check` | Tests a server the way a show uses it: opens a room, joins it, sends notes and chat, times each step, and checks the instrument sample hosts |
| `npm run home` | Hosts a show from your own computer through a free secure tunnel, and prints the links (or double-click **Home Show.bat**) |
| `npm run crowd -- CODE 20` | Sends 20 fake audience members into your room. They walk around, dance, chat, take part in dance rounds, and report what they hear |

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
   [crowd] 20/20 in the room | notes heard: 37 | instrument: tron flute | key: G Blues | dancing: 6 | chat sent: 4
   ```

5. **Play, and confirm each of these:**

   | Check | Where to look |
   |---|---|
   | Viewer count goes up as the crowd joins | Next to the LIVE button on the performer page |
   | Fake viewers walk around, dance and chat | Your audience window, and the audience panel in jam mode |
   | You can walk with the arrows (bottom left, or arrow keys / WASD), talk (Enter) and dance (Space) | Your audience window |
   | Dance offers Free dance, Step dance and Target dance; the game shows the tempo it found | Your audience window, with music playing |
   | Fake viewers in a game strike poses and show a combo over their heads | Your audience window, and the audience panel in jam mode |
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

## Part 3: Host a show from your own computer (free)

Your computer runs the server for the show, and Cloudflare's free tunnel gives it a secure address, so viewers never see your home address and nothing changes on your router. Your settings, presets and setlists stay where they are, because you keep using the normal site.

**How many viewers:** each viewer takes about 0.27 Mbps of your **upload** with sound and jam visuals. Keep about a third of your upload spare. At 40 Mbps upload that's roughly 100 viewers.

**One-time setup** (after the Windows setup at the top of this page):
1. Open a terminal and run:
   ```
   winget install --id Cloudflare.cloudflared
   ```
   Close the terminal when it finishes.
2. Get the latest code (GitHub Desktop: **Fetch origin**, then **Pull**; or download the ZIP again).

**Every show:**
1. In the `server` folder, double-click **Home Show.bat** (or run `npm run home`). The first time, it installs the server.
2. Wait for the box that says **Your home show is ready**, usually 5–15 seconds. Your performer page opens by itself, and the audience link is already copied: paste it wherever you invite people.
3. Click **LIVE** as usual and give out the room code.
4. **Keep that window open** for the whole show. Closing it ends the show for everyone.

**Good to know:**
- The links change every time you start it, so send the new audience link each show.
- The home address is used for that visit only. Next time you open the site normally, it goes back to the Render server by itself, so nothing to undo.
- Avoid big uploads in the house during a show (cloud backups, someone else streaming).
- If it says cloudflared isn't installed, close the window, open a new one and try again. Windows only finds newly installed programs in new windows.
- Cloudflare's quick tunnels are free and need no account, but they're meant for this kind of temporary use and come with no guarantees. For a fixed address that never changes, you'd need a free Cloudflare account and your own domain. Ask Claude if you want that.

---

## Live sound (what the audience hears)

When you click **LIVE**, Chrome asks to share a tab. Pick **this tab** and keep **"Also share tab audio"** switched on. From then on the audience hears exactly what you hear: your instruments, effects, and whatever backing track or video is playing. In jam mode they also see the visualizer on the venue's big screen (not the music video itself).

- The live panel shows **"Sharing your sound with the audience"**, a **Visuals** on/off switch, and how much server data the show has used.
- If you cancel the share prompt, the audience still hears your notes (played on their own device) but not your backing music. Click **Share sound** to try again.
- Needs Chrome or Edge on a computer. The audience needs a recent browser: iPhone with iOS 26 or later, or current Chrome on Android or a computer. Older phones fall back to notes only, and the venue says "Sound: simplified".
- The audience hears you about half a second to a second behind. Music and notes stay together because they travel as one stream.
- Play backing tracks from your local library rather than YouTube: the audience hears whatever you hear, ads included.

**Data use.** Render's free plan includes about 5 GB of outbound data a month. Sound alone is roughly 45 MB per viewer per hour; with visuals, roughly 110 MB. That's about 20 viewers for 6 hours of sound only, or 2 hours with visuals. The live panel shows the running total for the current show.

**Dance rounds.** In the **Music** tab, under **Dance rounds**, choose what happens when you play a backing track: a Step, Target or Free dance round. Then, while live, play a song from Backing Tracks:

1. The song is checked for its tempo, beats and loud and quiet parts (a few seconds), and one set of steps is written for everyone.
2. The audience gets a countdown (5 to 30 seconds, your choice). The song starts at zero.
3. Step and Target rounds: the highest score when the song ends wins. Free dance rounds: everyone votes for 20 seconds, and your vote counts double.
4. Placings earn show points: 10, 7, 5, 3, then 1 for taking part. The Music tab shows the standings.

**Start a round now** runs a round on whatever is already sounding (YouTube, or you playing). There is no file to check, so each dancer's steps come from the live tempo detector and are not identical. Press **End round** when the song finishes.

**Practice without going live.** The **Dance** button under Mobile / Jam / Live opens dance practice over the app. Pick a mini game, pick a song from your Backing Tracks (or any file on your computer), choose a countdown, difficulty and how many practice dancers, then **Start round**. It's the same round the audience gets: the song is analysed, counted in, played, scored, and the standings add up across practice rounds. Practice dancers score at random skill levels and vote in free dance rounds. Nothing is sent to the server. Esc steps back one level at a time (out of the game, then out of the round, then closes practice). The audience page has the same thing: the link under the join box, or `venue.html?practice`.

To try a round with a fake crowd: go live, run `npm run crowd -- CODE 12`, pick a round type and play a song. The fake viewers join the round, score, and vote. In the console on the audience page, `ukRound()` shows the round, the song position and how much the timing was trimmed.

Steps are kept in time by the live sound itself, so rounds need **Share sound** on. Points are kept by name for the length of the show; two people with the same name share a total, and ending the show clears it.

**Dance games on phones, tablets and computers.** The game always sits in the middle of the screen, with a big version of your character dancing on top of it, and it's sized to the screen.
- **Phones and tablets:** you play by tapping the game itself (the lanes, the targets, or dragging the puppet), so the walking pad and the chat step aside until you stop. Speech bubbles still show over heads.
- **Computers:** the arrow keys and the pad still work, and the chat stays.
- **Phone held sideways:** the leader banner hides while you play, to make room.
- **During a show:** while you play, the performer steps to one side of the stage so the two of you don't overlap.

In the console on the audience page, `ukDevice()` shows what it decided the device is.

**Mobile player.** The Mobile button turns the page into a one-hand player for phones: slide up and down the bar on the right to play, and tap the mode box to switch Impact, Sustain and so on. The page tells iPhones it plays music, so it isn't muted by the silent switch. While an instrument is still downloading, notes play a soft stand-in sound, and the bottom of the screen says it's loading.

**Music videos (karaoke).** Backing Tracks takes music videos as well as songs: MP4, WebM, MOV, M4V and MKV, from a folder, from **Add files**, or dragged onto the panel (files or whole folders). A video's sound plays like any backing track, so the audience hears it, the volume slider works and dance rounds can use it. The picture is only for you: it shows in the Music tab and behind the visuals in jam mode. The audience sees the jam visuals, never the video. MKV files only work if Chrome can play them; MP4 is the safe choice.

**Hold arrows (Step dance).** Some arrows have a tail: hit the arrow and keep it held (key, pad button or finger on the lane) until the tail ends. Let go early and it counts as a miss and ends your combo; hold to the end for an **OK!** and bonus points.
- **Where they go:** on notes the music holds, like a long chord or sustained note.
- **Calm parts:** just the hold.
- **Busier parts and big moments:** other arrows keep coming while you hold, but never on the held arrow.
- **Free play:** the occasional two-beat hold once you have a combo going.
- **Easy:** no holds in rounds.

**Steps follow the song's intensity.** Rounds and practice map how intense every part of the song is: loudness, brightness, how busy the hits are, and whether that part comes back like a chorus. Calm parts get sparse, easy steps; energetic parts add off-beats and doubles; the song's big moments get runs and doubles at every bar start, and while one is on, the game's border is on fire and every hit scores double (🔥 ×2 next to the score). Talking or beatless intros get no steps.

**Streak power-ups.** In the Step and Target games a long combo charges the dancer up, and everyone sees it, including you on the audience panel:
- **10:** white-blue charging aura
- **25:** gold
- **50:** fire
- **100:** purple with lightning

At 10, 25, 50, 75, 100, 150, 200 and every 100 after, a STREAK number pops over the dancer's head.

**Hotkey pop-ups.** Every hotkey shows what it did in big letters, in jam mode and the normal view. Swapping key shows the new key and whether it's the main or alt key. Tab does nothing now; Sustain is **X**.

**Dance games and tempo.** The audience page listens to the music it is playing and works out the tempo, which sets the pace of the Step and Target games. It needs a few seconds of music with a clear beat. With no beat it uses 120 BPM, and the game says so. In the console on the audience page, `ukBeat()` shows the tempo it found and how sure it is, and `ukDance()` shows the current game, score and upcoming steps.

**Diagnostics.** On either page, open the console (F12) and type `ukStreamStats()`. On the performer page it shows frames captured, dropped and sent. On the venue it shows packets received and decoded, how often the sound buffer ran dry (`rebuffers`), and the last error.

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
| Audience hears notes but no backing music | Sound sharing is off, or tab audio wasn't ticked | Click **Share sound** in the live panel and keep "Also share tab audio" on |
| Venue says "Sound: simplified" | That phone or browser is too old for the live sound | Update the browser (iPhone: iOS 26 or later) |
| Live sound is choppy | Slow connection on either end | Turn **Visuals** off; check `ukStreamStats()` on the venue for `rebuffers` |
| A sample host check fails | That sample site is down or blocked on your network | Instruments from that collection won't load. Try another network to tell which |
| Step or Target game says "listening… 120 BPM" | No clear beat found yet | Wait a few seconds after the music starts. Music with no drums or steady pulse may never lock on |
| Arrows feel early or late against the music | Bluetooth speakers or headphones add delay the page can't measure | Use wired or built-in sound for the games |

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
