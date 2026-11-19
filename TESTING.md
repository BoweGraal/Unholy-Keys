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

**Free dance spotlight.** In a Free dance round everyone dances and walks around at first. About a third of the way into the song, everyone who has danced is locked in and shuffled. Later, each of them takes the centre of the stage under a spotlight, twice round, with their moves showing live. The performer steps aside while they're up.
- **Timing:** turns start on a bar and last 1 to 4 bars, sized so both rounds finish before the last two bars. With a big crowd it goes round once.
- **Your turn:** the banner says YOUR TURN and your game panel lights up gold.
- **Then:** voting at the end, as before.
- **Your Music tab** shows who has the spotlight.
- **"Start a round now"** (no song length): 8-second turns, starting 15 seconds after the lock.

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

**Free dance on the floor.** Free dance no longer opens a game window. Your character stays on the dance floor (a bit bigger on phones and tablets), where you can see the stage, with a handle on each hand and foot.
- Drag a handle to move that limb. Two fingers move two limbs at once. On a computer, D, K, F and J still raise them.
- Tap or click anywhere else on the floor to walk there. The arrows still walk too.
- On your spotlight turn, the handles move with you to the centre of the stage.

**Swoops in Target dance.** Some targets come with a path. Tap the start as its ring closes, then keep your finger (or the mouse button) on the ball as it slides along the path to the end. The ring around the ball turns red when you're off it. Finishing scores a bonus. Letting go early, or staying off the ball for a quarter of a second, drops it and breaks your combo. Nothing else comes up while you're following a swoop. In a round, swoops come from the same long notes that are holds in Step dance.

**Steps stay put when the sound hiccups.** In a show, the steps follow the live sound. If the sound stalls or catches up on a weak connection, the arrows now slow down or speed up a little until they're back in time, instead of jumping or vanishing. Only a jump of more than 1.5 seconds that lasts re-lays the steps, once. If the beat drops out in free play (talking, a break), arrows still on their way fade out and don't count as misses.

**Note highway.** A fourth dance game, based on the pixel-art mockup. Notes fall down seven coloured lanes onto a little keyboard. Play each one as it lands on its box: A S D F G H J on a computer, or tap its key or lane on a phone or tablet. Long bars are holds: keep the key down to the end.
- Across the top: SCORE, a song progress line (in rounds), and a HYPE meter that fills as you hit notes and drops when you miss. The big combo number and PERFECT / GREAT / GOOD / MISS show in the middle.
- Same timing, scoring, streak auras, fire-border bonus and holds as Step dance.
- Where to find it: the Dance menu (or Space then 4), the Note highway button in dance practice, and "Note highway round" in the performer's round menu.
- In a round, everyone gets the same notes. They're worked out from the song's step chart, so runs in the song become runs along the keys, and two arrows at once become a chord.
- While it's on, the letter keys play notes rather than walking you; the arrow keys still walk.

**Shell art (placeholder graphics).** Everything is pixel art drawn in code, in `art.js` (shared by both pages), until the real art arrives.
- **Your character (audience):** the join screen has a character maker with a live preview: skin, hair style and colour, top and colour, bottoms and colour, and an extra (shades, headphones, cap, bandana). Tap the preview to see a dance move. "Surprise me" picks at random. It's remembered on that device.
- **Your character (performer):** the small character next to your stage name, or the "Your character" button under it, opens the same maker. Changes reach the audience straight away during a show.
- **Stage:** brick back wall with an UNHOLY KEYS sign, a lighting truss with swinging beams, speaker stacks and amps that pulse on the beat, and the performer standing at a keyboard whose keys light up with the notes.
- **Dance floor:** dark tiles that light up in waves on the beat, behind a crowd barrier at the front of the stage.
- **For the art team:** each look is 8 characters (one per option). The options and colours are listed at the top of `art.js` (`OPTS`). Body layout and limb angles are described above `drawChar`; the dance games depend on the shoulder and hip positions in `joints`.

**Difficulty ramps up through the show.** Rounds 1 and 2 are Easy, 3 and 4 Normal, and 5 onwards Hard. The round banner and your status line on the performer page show the level. Everyone in a round gets the same notes.
- Easy: about one note a beat at most, no doubles or chords. On the highway, only the middle five keys (S to H).
- Normal: no notes closer than half a beat, except in the big moments; doubles and chords only in the big moments.
- Hard: the song's steps as analysed.
- Big moments still burn and score double, but add less difficulty than before. The highway scrolls slower and is a little more forgiving on timing than Step dance.
- Free play (not a round) starts gentle and adds notes as your combo grows.

**Battle rounds (1 v 1 knockout, any game).** Tick "⚔ Battle (1 v 1s)" next to the round type on the performer page (or pick "Battle" in dance practice), then play a song.
- Everyone free dances at first. About 12% of the way into the song (at least 12 s), everyone who's dancing is drawn into a bracket at random. If the numbers don't make a full bracket, some get a bye through the first round.
- One match at a time. The two step up to centre stage under their own lights, with VS between them, and play the round's game: Step, Target or Note highway, with the same notes for both. Their scores show under their names, with a small live copy of each one's game screen beside them. Everyone else keeps free dancing and watches. Your own match switches your screen to the game, then back to free dance afterwards.
- Free dance battles: the two free dance on the stage, and everyone else votes with the two buttons on their banner (change your mind any time). Your vote on the performer page counts double.
- The final is a showdown during the song's finale (the last 15 to 30 s). Earlier matches are 9 to 25 s each. If the song is too short for everyone, the bracket gets smaller (the extra dancers just watch).
- Results go by how far each dancer got: winner first, then the finalist, then semifinal losers, and so on. The score shown is matches won, and show points work as usual.
- "Start a round now" (no song length): 18 s matches and a 25 s final, starting soon after the draw.
- `npm run crowd` bots play their matches and vote in free dance battles.

**Show effects (performer).** The new **Show** tab in the sidebar controls the venue's effects live, with a preview of what the audience sees.
- Lights: Auto (follows the music), Party, Strobe, Spotlight (on you), Warm, Cool or Off.
- Weather: Clear, Rain, Storm (rain, darkness and lightning) or Snow.
- Fog and Darkness sliders. Darkness leaves pools of light around you and on the stage.
- Extras: Lasers, Sunset (an open-air sky with a skyline at sunset), a Burning building behind the stage, and Fireworks (automatic volleys). **Launch fireworks** fires a volley now. **Reset all** clears everything.
- Changes reach the audience straight away while you're live, and anyone who arrives later sees the same show. Your settings are remembered on this browser and sent again when you go live.

**Free dance styles.** In free dance, dance buttons run down both edges of the screen: Freestyle (drag your own hands and feet, as before), Two-step, Hands on knees, Shake it, Running man, Skank, Robot, The worm and Silly.
- Pick a dance and two dots appear in the middle at the bottom. Drag them with your thumbs (or the mouse) to steer the dance: in Running man the left dot moves you up and down and slides you about; in The worm you slide your thumbs up and down to lift the chest and the hips; in Robot each dot points an arm. Each dance shows a one-line tip. Let go and the dots drift back to the middle while the dance carries on with the beat.
- Under the dots are moves for that dance, such as Running man's Classic, Fast, Moonwalk and Arms pump, or Silly's Chicken, Sprinkler, YMCA, Floss and Macarena. On a computer, keys Z X C V B pick the moves.
- Everyone sees your dance (venue and the performer's audience panel), drawn from the dance, the move and the two dots, so it looks the same everywhere.

**Jumbotron, things that lower in, and crowd surprises (Show tab).**
- **Jumbotron**: Auto, Down or Up. On Auto it lowers on its cables whenever a video plays (or your visuals are on) and goes back up when it stops; Down and Up hold it there. While it's down, the round box slims to a line at the top and you step forward so you're not hidden.
- **Jam view** (also the **Stage** button at the top of jam mode): Classic is the jam screen as before. Stage puts jam on the venue stage, with your video (or visuals) on the Jumbotron and the crowd in front. Remembered on this browser.
- **Lower in**: a Disco ball that drops over the front of the dance floor, and a Banner with your own text (up to 20 letters, numbers and ! ? ' . # * -). The banner moves aside when the Jumbotron is down.
- **Moments**: Balloons and Confetti drop once each time you press them.
- **Crowd**: Sparkle, Fire, Lasers (everyone shoots lasers from their hands at the stage) or Float. It hits everyone at once, you included, and lasts about 7 seconds.
- **Follow my playing**: the lights follow your notes. The wash climbs the back wall and the lit row on the floor moves back with higher notes and drops with lower ones, and the colour follows the note. It works out your range as you play, so it uses the full height whatever octave you're in. It still works if someone in the audience has their sound off. Your preview shows it too (a made-up melody when you're not playing).
- To check: go live, open the venue in another window, then try each one. Late arrivals should see the Jumbotron, disco ball, banner and follow lights as they are, but not balloons, confetti or crowd surprises that already finished.

**Reactions (audience).** A row of buttons above the chat (a column on the right on phones): Jump, Hearts, Big heart, Applause and Whistle. Keys: Q E R Y U.
- Everyone sees them on your character, and so does the performer in the audience panel and in jam's stage view. The panel's header counts the last 15 seconds of reactions.
- Applause and whistles make a soft sound in the venue (quieter for other people's). Hearts and the big heart make a little chime. Nothing plays on the performer's page, so none of it goes out in the live sound.
- Big heart: once every 4 seconds. Tapping fast is capped at a few a second.
- The buttons and the joystick fade when you stand behind them.

**Joystick.** The arrow pad is now a round joystick: press anywhere in the ring and drag. The further you pull, the faster you walk; let go and you stop. Arrow keys and WASD still work, and the knob shows the way you're going. In the step game, a firm push in a direction counts as a step.

**Scenes (Show tab).** "Floating in space": the back wall opens onto stars, nebulae and planets, the floor turns see-through, and everyone floats and slowly turns. "Fill with water": water pours in from both corners and rises over the floor and up the stage in about 9 seconds. Anyone underwater swims, with bubbles and fish. Switch it off to drain it. People who arrive later see either scene as it is.

**The performer's instrument.** Whatever instrument you pick is what your character holds and plays, in the venue, the audience panel, jam's stage view and the Show tab preview. There are 44 kinds of art covering all 376 instruments: grand, upright, electric piano, harpsichord, organ, pipe organ, synth, keytar, handheld chip console, accordion, acoustic, electric, metal and jazz guitar, bass, banjo, sitar, violin, cello, double bass, harp, trumpet, trombone, French horn, tuba, sax, flute, clarinet, bassoon, panpipes, ocarina, harmonica, bagpipes, mallets, glockenspiel, steel drum, kalimba, music box, drum, timpani, zither, voice (a mic), tubular bells and wine glasses.
- The hands follow what you play. Guitars, basses and bowed strings: the fret hand goes to the right string and fret, the strum alternates down and up, and the bow turns round on each new note. Keyboards, mallets and harp: the key, bar or string for the note lights up. Trumpet: real valve fingering. Trombone: the slide moves. Woodwinds: more holes covered for lower notes. Singing: the free arm rises with the pitch.
- A held note keeps moving (the bow, the accordion's bellows, vibrato on the fret hand); letting go relaxes the hands.
- To check: go live, open the venue, then change instruments and play, low notes and high notes.

**Which version am I running?** The performer page shows it at the bottom of the sidebar ("Unholy Keys v1.30.8"), and the venue in the bottom-right corner, on the join screen too. Once you're live (or have joined), the server's version appears next to it.
- Everything matching means you have the new build.
- A red "Out of date: art.js …" line means your browser kept an old copy of a script. Hard refresh with Ctrl+Shift+R (Cmd+Shift+R on a Mac).
- A red "Server is on v…" line means the server hasn't been redeployed yet (on Render: Manual Deploy, then Deploy latest commit).
- The number is set in five places, which should always match: `PAGE_VERSION` in index.html and venue.html, `VERSION` in art.js and instruments.js, and `VERSION` in server/server.js.

The "Click to capture keys" box is gone. Keys play whenever the page has focus (click anywhere on it first).

**Phone play screen (performer, Mobile button).** On the right, a circle in four quadrants (up, right, down, left): tap one to play it straight away, and slide round to switch note once you're past the line. On the left, five zones: hold one for a higher group of notes (zones 2 to 6, the same groups as Space, D, Space+D, Space+E and Space+3), and with no finger on a zone you get the root group. You can slide your thumb between zones while a note holds. Along the top: Oct − / Oct +, the instrument button (your 9 hotkey favourites, tap one to switch) and fullscreen. Tap the mode under the note to change how notes play.

**Fullscreen.** There's a Fullscreen button at the top right of the main page, in jam mode's toolbar and in the phone screen. iPhones can't make a web page fullscreen, so on an iPhone the button explains how: Share, then Add to Home Screen, then open it from the home screen.

**Home Screen app (iPhone).** If the venue gets squeezed into the top of the screen with empty space below (usually after the keyboard closes), it now fixes itself within half a second.

**Charts.** Rap verses, where the vocals sit over a quiet beat, now get steps; songs no longer go empty partway through. On touch screens: never more than two presses at once (while an arrow is held, only single arrows), nothing faster than half beats or 280 ms, and steps sit on the beat.

**Mosh pit round.** Pick "Mosh pit round" under Dance rounds on the performer page, or "Mosh pit" in dance practice. Three parts, timed to the song:
- **Mosh pit** (most of the song): walk with the joystick or arrows and run into people. Bumping someone scores and shoves them. Drag round in circles on the floor to windmill your arms: each turn scores, more on the beat (two scoring turns a second at most). Everyone sees your arms.
- **Wall of death** at the song's biggest drop (the chart now finds it): "WALL OF DEATH", and everyone goes to the side they're on, with a line down the middle and the count for each side. Then 3-2-1 on the beats, everyone charges the middle on the drop, and the two sides slam together in a 10-second **push war**: tap the big PUSH pad as fast as you can (or click, or any key). Each side packs in behind the front line with arms out shoving. The faster side drives the front line back into the other, with dust flying where they meet. The bar at the top shows both sides' pushes live (the server adds them up). When time's up the winners shove through and get 800 points each, and the losers get knocked back.
- **Circle pit** during the song's other big moments: everyone runs round the ring by themselves. Push the joystick forward to sprint, back to slow down, in or out to change lanes. Laps and shoves score.
- A song needs a clear drop with about 15 seconds after it for a wall of death. Without one you get the pit and circle pits. A round started without a song has a circle pit every 70 seconds or so.
- Practice dancers mosh too: they wander the pit, take sides, push in the push war and run the circle. Someone who moshes the whole song should beat them.

**Note highway · 4 keys.** Looks like piano tiles: white tiles in four columns with rows that scroll on the beat, and each note a big tile (blue for the left hand, green for the right). Hit a tile on D F J K (or the arrows), or tap its column, as its bottom edge reaches the red bar. Holds are tall tiles that shrink while you hold, and missed tiles turn red. The notes follow the beat rather than the tune: beats 1 and 3 on the left hand and 2 and 4 on the right, like a kick and snare, switching between the inner and outer key each bar, with half beats on the other hand. Both outer keys together only on bar starts in the big moments, never more than two. It's in the dance menu (key 5), dance practice, and as a round type ("Note highway round (4 keys, on the beat)"), and it works in battles.

**Free dance: jumping.** Space jumps (Esc or the Stop button stops dancing). On phones, and whenever a dance is picked, there's a small Jump button between the two dots. Everyone sees the jump.

**Free dance on a computer.** Once you've picked a dance (not Freestyle), WASD moves the left dot and the arrow keys the right one. Hold two keys for a diagonal, and let go to spring back. The mouse can still drag either dot. In Freestyle the keys work as before (arrows walk; D F J K raise a limb).

**Shamisen.** Its own art now: a square drum with a cream skin, a thin fretless neck, a peg box with three pegs, and the fan-shaped bachi in the strumming hand striking the skin. The other hand slides along the neck with the pitch.

**Room codes** are 4 letters now (no I, L or O, so they're easy to read out). The venue's code box takes 4 and capitalises as you type.

**Leaving dance practice.** A "✕ Leave practice" button sits in the top-left corner the whole time you're practicing. It takes you back to the join screen, which matters in the Home Screen app where there's no address bar.

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

## Venue join screen: fullscreen + practice (v1.30.8)
- On a phone, open venue.html. Near the top, under "Live Venue", a big **🕺 Dance practice** button opens practice without a show.
- The join screen scrolls, so Enter Venue is always reachable, even with the keyboard up.
- A ⛶ button sits top-left on every venue screen: join, show and practice. On PC/Android it toggles fullscreen. On iPhone Safari it explains Share → Add to Home Screen. It's hidden when you're already running from the Home Screen.
- In practice, the fullscreen and Leave practice buttons sit side by side.

## Jumbotron note display (v1.30.8)
- Jam → Stage view, no video. Play a note: the Jumbotron shows the note name big (e.g. D3) in its own colour, with a two-octave keyboard along the bottom lighting the key. It pops on each new note and fades about 1.5 s after you let go.
- The Jumbotron is bigger in stage view and still sits below the jam toolbar, so the toolbar buttons stay clickable.
- Audience: when your visuals stream to the venue, the same note readout is in the stream. The venue Jumbotron is bigger too.
- Venue: the "Room:" label no longer sits under the ⛶ button.

## Key panel on the wall (v1.30.9)
- Jam → Stage view: a small panel hangs on the back wall, top left inside the truss pillar. It has SPACE D E 3 along the top and the arrow cross below, lit live as you press (the arrow takes the colour of the note row it plays).
- Audience: the venue shows the same panel in the same spot. It lights the keys that played each note and goes dark when the note ends. On phones it sits in the corner under the Room label, clear of the Jumbotron.
- It doesn't show in dance practice (there's no performer).

## Whistle (v1.30.10)
- Pick MK Whistle (or any instrument with "whistle" in its name). The performer doesn't hold a flute any more. They stand with hands at their hips and pucker their lips, and music notes drift off from their mouth. Higher notes fly higher and lift the head slightly. Flute and piccolo still get the flute.

## Instrument fixes and sections (v1.31.0)
- **Bassoon** (and contrabassoon): held diagonally across the body, boot at the hip and bell up past the shoulder, with a silver bocal curving to the lips. One hand is low on the boot and one high on the wing.
- **Contrabass**: the fretting hand stays between shoulder and body instead of reaching up by the head, and the bow crosses the body.
- **Tuba**: held beside the performer with the bell up past the shoulder and the lead pipe to the lips. The character stays in view.
- **Blown Bottle**: now a green bottle held under the lips (it was a pan flute).
- **Bagpipe**: the bag breathes slightly instead of ballooning.
- **Sections**: choir sounds (Choir Aahs, Voice Oohs, Synth Choir, Pad: Choir…), string sections (String Ensemble, Synth Strings, Tremolo Strings, Violins…), brass sections (Brass Section, Synth Brass…), Strings + Brass and Orchestra Hit bring 4 players on stage around the performer, who stays in the middle and keeps playing. Choir members sing without mics, hands together. Orchestral Harp stays solo. Same on the performer's stage view and for the audience.

## Jumbotron note lines (v1.31.1)
- The big note name and keyboard on the Jumbotron are gone. The Jumbotron now shows big note lines instead: each note is a thick bar sliding left, higher notes higher up, coloured by key row (same colours as the arrow pad). A held note keeps stretching and pulses at the "now" line on the right. The pitch range follows what you play.
- Same in the Show preview and in the visuals stream the audience sees.

## Walking (v1.32.0)
- Walk around the venue. Steps now follow how far you actually move: push the joystick a little and the steps slow down, all the way and they speed up. One foot stays planted while the other lifts and swings through. The body rises slightly as the legs pass and settles on each footfall. A soft shadow under the feet stays on the floor.
- Walking toward or away from the stage, the feet lift instead of scissoring sideways. Walking left or right, the legs swing.
- When you stop, the step finishes and both feet come down. No sliding to a stop.
- Other people move at a steady walking pace toward where they are instead of gliding and slowing down. Your own character goes exactly where you steer, with no lag.
- Same on the performer's stage view of the crowd.

## Performer in front of the Jumbotron (v1.32.1)
- Jam → Stage view with a video playing (YouTube, a local video or a backing video): the performer, and any section players, stand in front of the video instead of behind it.
- Venue with the Jumbotron down: the performer is drawn in front of the screen.

## Site songs in practice (v1.33.0)
- Put an MP3 in the repo's `songs` folder (see songs/README.md) and commit it. Open venue.html?practice: the song drop-down has an **Unholy Keys songs** group with it, titled from the file name (underscores become spaces).
- Pick it: "Loading…" shows, then the title, and Start lights up.
- Opened from the performer page, your Backing Tracks are listed under **Your Backing Tracks** below the site songs, and the first Backing Track is still picked automatically. Site songs only download when you pick one.
- Running locally with `node server/server.js`, the folder is read straight from disk.

## YouTube songs in practice (v1.34.0)
- Needs desktop Chrome or Edge. Open venue.html?practice → **Add YouTube songs** → paste one or more links → **Add to queue**.
- The browser's share box opens. Pick **this tab** and turn on **Share tab audio**.
- The panel moves to the bottom and shows "listening N%". The song plays in full on the Jumbotron. Leave the tab open and don't pause it (a pause just waits; if too much is missed it says so). **Stop adding** cancels.
- When it finishes: "working out the steps…", then "added for everyone ✓" (with GITHUB_TOKEN on Render, see SETUP.md) or "added on this computer ✓". It then appears in the drop-down under **YouTube songs**.
- Pick it and start a round: the video plays on the Jumbotron from the top. The steps follow the video, and the round ends when the video ends.
- On a phone: YouTube songs in the list play fine (tap ▶ on the video if asked). Adding new ones explains that it needs a computer.
- If you hear silence or "Heard only silence": the tab audio wasn't shared. Try again and tick the box.

## Performer hangs out between songs (v1.35.0)
- Go live, open Jam and click **🚶 Hang out** (under Stage). The view switches to Stage and you step off the stage onto the floor (★ before your name).
- Arrows or WASD walk; click a spot on the floor to walk there. No notes play while you're hanging out.
- Press Enter (or type in the bar at the bottom) and press Enter again: the text shows over your head, over your head in the venue, and in everyone's chat as your name.
- In the venue: the performer is in the crowd instead of on the stage, walking where you walk.
- Esc or **🎤 Back on stage**: you're back at your instrument for everyone, and notes play again. Leaving jam also puts you back.
- The audience can already talk (Enter or Talk) and free dance between songs (Dance → Free dance).

## Just-listen songs and room-filling bots (v1.36.0)
- Music tab → Dance rounds → "When I play a backing track": **no game: everyone just listens & hangs out** (the default). The song plays, with no countdown and no game. The audience walks, talks, reacts, and can Dance → Free dance whenever they like.
- **🤖 Fill the room with bots: up to N people** (2–8, remembered). Go live: bots join until the room has N people. Each real person who joins takes a bot's place, and when someone leaves a bot fills in. Set it to off and they all leave.
- Bots have 🤖 in their names. They walk around, chat now and then (no two say the same line within 2 minutes), react while music plays, and sometimes free dance between songs. In rounds they dance, post decent (rarely winning) scores, vote in free-dance rounds and battles, and push in the mosh pit's wall of death.

## Live song menu (v1.37.0)
- In Jam, click **🎵 Start song** (top, next to Hang out).
  1. **Pick the song**:
     - **Music**: your Backing Tracks, the site's songs folder, **+ Song file**, **📁 Folder**.
     - **Video**: video files. The sound goes to everyone like any track; the picture shows behind the visuals and on the Jumbotron for you.
     - **YouTube**: search or paste a link. Songs added in dance practice show "✓ steps ready".
  2. **Pick the game**: No game (just listen & hang out), Step, Target, Note highway, 4 keys, Free dance or Mosh pit, plus countdown, steps level and Battle.
  3. **Start**.
- **With a game, while live**: the song is checked, the audience gets the countdown, and the song starts at zero. A YouTube song uses its practice steps if it has them, otherwise steps made live from the beat.
- **With no game**: an optional countdown just for you, then the song plays.
- **The bar** at the bottom left shows the song, the game, its time and progress.
  - **❚❚ / ▶** (or P) pauses and resumes. During a round everyone's game holds still and the venue shows "⏸ Paused".
  - **■ End** ends the round (scores counted) and stops the song.
- **When the song ends on its own**: same as End. The Jumbotron goes back up, in the venue and in Stage view (this used to stay down after a YouTube song finished).
