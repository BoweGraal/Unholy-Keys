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

## Roller rink, Tab to talk, and fixes (v1.38.0)
- **Roller rink round** (Start song → 🛼 Roller rink, the Music tab round list, or practice):
  - The floor turns into an 80s rink: a maple oval, neon pink and cyan rails, mirror-ball spots, a carpeted island in the middle. The performer plays on the island, both in the venue and in Stage view.
  - Everyone wears quad skates (white boots, neon wheels). Arrows, WASD or the stick push you along and you keep your momentum, bouncing off the rails. The meter top right shows speed.
  - JUMP (Space or the big button) once you're fast enough. Faster means higher and longer.
  - In the air, hold a direction for a trick: ↑ Superman, ↓ Tuck, ← Kick, → Split. Switch between them to chain (each one in a row is worth more). Let go before you land: if you're still holding one you BAIL and lose the points. Laps score too.
  - Everyone sees each other's jumps, tricks and wipe-outs. Bots skate laps and jump.
- **Tab** always opens the chat box: in the venue (Tab again closes it), and for the performer in jam (on stage, hanging out, or mid-song). The performer's message shows over their head on stage.
- **Stage view with a video**: the note lines now show over the video (like classic jam), not hidden under it.
- **Cello**: leans back past the player's shoulder, so you can see them behind it.
- **Show tab → Weather → Intensity** slider: light drizzle to a downpour (rain and storm), a few flakes to a blizzard (snow).

## Render vs self-hosted badge (v1.38.1)
- Performer page: a badge under Jam/Live: **☁️ Render server** or **🏠 Self-hosted · this computer / local network / home tunnel**. It also shows in the live panel next to the room code, in jam's audience panel header and in the version line.
- Venue: the same badge on the join screen, and in the version line.
- Render asleep: "waking up…" until it answers. Wrong address: "not reachable".
- Self-hosting with `UK_HOST="Bowe's PC"` adds the name.

## Keepy uppy (v1.39.0)
- Live song menu or "When I play a backing track": pick **🎈 Keepy uppy**. Venue practice has it too.
- A balloon, a ball, a feather and a second balloon drop onto the floor. Balloon drifts down, the ball drops fast and bounces a few times, the feather floats for ages.
- Move with arrows / WASD / stick. Space (or JUMP) jumps; Space again in the air double jumps for more height.
- Get under something and jump into it: it flies back up and away. Points pop over your head. Feather is worth the most, double-jump hits score double, hits in a row before it lands score more.
- Two phones: one heads the balloon, the other sees it fly up the same way. The stage view shows the same things flying.
- Something that lands sits on the floor for a moment, then drops in again from the top.

## Rink upgrades, ice rink, hold timing (v1.40.0)
- Roller rink: the disco ball drops in lit up (glowing, spots round the room) for the whole round, even if the show's disco is off.
- New **⛸ Ice rink** round (live menu, "When I play a backing track", venue practice): same game on ice, snowbanks, figure skates, and it snows.
- Phone/touch: press **JUMP** and a trick wheel opens round your thumb (SUPERMAN up, TUCK down, KICK left, SPLIT right). Slide to a trick and hold, slide to another to chain. Slide back to the middle (or let go) before you land or you bail.
- Note highway holds: let go as the top of the bar reaches the line. On time = PERFECT/GREAT/GOOD like a tap. Letting go too early is LET GO; holding way past still counts as OK.
- Note highway: no horizontal beat lines; notes fall faster.

## Shuffle dance (v1.41.0)
- Free dance: a new **👟 Shuffle** style (key 0 on a computer), worked out from a Melbourne shuffle clip.
- Moves (Z/X/C/V): **Running man** (knee up on the "and", stomp and slide back on the beat), **T-step** (heel-toe swivel gliding sideways), **Spin**, **Mix it up** (running man → T-step right → T-step left → running man into a spin, every 4 bars).
- Left dot: how far you travel and how low. Right dot: knee lift and arm swing.
- Bots in free-dance rounds now do styles too, often the shuffle.
- Also worked out from clips: **Running man → Classic** (knee right up, hands together at the chest pumping), **Running man → Moonwalk** (smooth glide back 4 beats, then 4 the other way; heel up and knee bent, swapping each beat), **Skank → Classic** (knees up crossing in front, elbows pumping) and a new **Skank → Kicks** (kick out to the side on the off-beat).
- New **🧟 Thriller** style (the "-" key): **Zombie arms** (low lunge, both arms flung out to one side then the other), **Claw walk** (side steps, knees up, claw hands), **Shoulder pop**, **Mix it up**.
- **The worm** reworked from a clip: hands planted, legs kick up behind, then the chest pushes up as the legs drop, once a beat, inching along. New **Dive in** move (replaces Hold): jump up arms out, dive onto the floor, worm, repeat.
- New **💥 Street jam** style (the "=" key), from a clip of a guy dancing through town: **High knees** (prancing, fists pumping), **Strike a pose** (low squat, arm cocked up, leg kick on the 4), **Hop step** (hopping side to side, knee tucked), **Floor spin** (crouched, legs sweeping round), **Mix it up**.
- New **🤖 Cyber goth** style (the "]" key), from an industrial dance clip: heavy wide stomps under every move, plus **Stomp & punch**, **Arm sweep**, **Hands up**, **Windmill**, **Mix it up**. Right dot pushed up doubles the arm speed.
- Cyber goth from a second clip: **Arm roll** (forearms rolling at the chest) and **Chop** (lunging arm chops); Mix it up now runs all six. Moves 6 and 7 are on N and M.
- Phone dance picker: styles split evenly down both sides as compact rows; the move buttons are one row along the bottom that scrolls sideways.
- New **🤘 Headbang** style (the "[" key), from a metal band clip: **Headbang** (top half whips down on the beat, hair falls over the face, flies on the way back up), **Hair windmill**, **Air guitar**, **Rock on** (one arm straight up throwing horns while banging), **Mix it up**. Right dot right doubles the speed.
- Characters can now bow their head (hair hangs over the face) and fling it back (hair flies up).
- New **🔥 Lighters up** style (the "\" key), for the slow one: arm up holding a lit lighter with a flickering flame and warm glow, the crowd swaying every two beats. **Lighter sway**, **Phone light** (white torch glow), **Wave it**, **Both hands**.
- **DJ booth:** pick any EDM synth (Supersaw, Acid 303, Daft Punk, Deadmau5, Trance, Strobe, Sub Bass, Warm Pad) and you stand behind a DJ booth: two decks, a mixer, an LED strip along the front flipping cyan/magenta on the beat. Playing: one hand scratching a deck, the other on the faders. Stop for a couple of seconds: both hands up to the crowd. (FM Bell stays on mallets.)
- **Lights → EDM** (new show button): the room goes dark and washes cyan or magenta, flipping on the beat, with beams sweeping out over the crowd from behind the stage.
- **Extras → 🌃 Neon night** (new show toggle): the room goes black, the stage is traced in glowing tube lights (truss, stage lip, a floor grid), everyone becomes a glowing outline in their shirt colour, and the crowd waves glow sticks. Works with any lights mode (try it with EDM).
- **Lighters up → Glow sticks**: both arms waving glow sticks fast.
- New **🥾 Techno march** style (the "'" key), from a street-parade clip: a heavy stomping march under everything, plus **March**, **Point** (arm thrust out at the crowd on the beat), **Arm swing** (big arcs across the chest), **Flex**, **Mix it up**. Made for the DJ booth and EDM lights.

## Song map, recorded shows, sustain lock (v1.42.0)
- **Start song** menu has new options: **🤖 Bots** (same as the room fill), **🎼 Auto key** (on by default), **🌟 Auto stage**.
- Pick a game while you're not live: the note says Start goes live first. Press Start: it goes live (screen share prompt), the bots come in, and the round begins. No more being blocked.
- **Auto key:** the song is analysed (with a game, as part of the round; with No game, in the background). Your key and scale are set to the song's key, and follow key changes partway through (a "🎼 Key: D major" pop-up). The now-playing bar shows the part and key, e.g. "🔥 Chorus · D major".
- **Parts:** intro, verse, chorus, solo, bridge, breakdown, finale, outro. The audience gets a big banner as each part starts. In the dance games, the finale counts as a big moment the whole way (burning border, double points).
- **Auto stage:** each part gets its own look: intro cool and foggy, verse plain, chorus party lights + lasers, solo spotlight, bridge warm, breakdown strobe in the dark, finale party + lasers + fireworks + confetti, outro cool. (Chorus uses EDM lights if you're on EDM.)
- **⏺ Record show** (on the now-playing bar): press it while a song plays, then make stage changes as you like. End the song (or press it again) to save. Next time that song plays, your show plays back by itself at the same moments ("▶ Show ✕" on the bar; click it to delete the saved show). A saved show takes over from Auto stage.
- **Sustain:** every session starts in Sustain, and Z / X / Ctrl / V no longer change the articulation. Change it in Setup → Play.
- Jumbotron note lines: medium size (between the old small and big ones).
- Bassoon redrawn: black body with silver keys and rings, a white cap on the bell, slimmer.

## Testing without the server (v1.42.1)
- Opening the performer page, jam mode and the Start song menu no longer contacts the server. The badge shows which server it would use; click it to check (that wakes Render).
- The server is only contacted when you go live, open the YouTube tab in the song menu, or click the badge.
- Venue practice reads the processed YouTube songs from the repo's data branch first, so practice never wakes the server.

## More hairstyles (v1.43.0)
- Character creator → Hair now has 23 styles (was 8). New: **Bob, Bangs, Bun, Pigtails, Braid** (over the shoulder), **Curly** (big cloud), **Side swoop** (over one eye), **Long waves, Pixie, Buzz, Bowl cut, Quiff, Messy, Shoulder length, High ponytail**.
- Old saved characters keep their hair. Bots and random looks use the new styles too. Headbanging throws the new styles over the face (not the buzz cut).

## Way more clothes (v1.44.0)
- Character creator: **Top** now has 21 (Suit, Waistcoat, Hi-vis vest, Jersey, Chef coat, Lab coat, Leather jacket, Tuxedo, Polo, Doublet, Robe, Turtleneck, Flannel, Band tee, Uniform, Crop top added). **Bottoms** has 13 (Track pants, Overalls, Long dress, Hose (two-tone legs), Cargo pants, Kilt, Bell-bottoms, Ripped jeans, Shorts & leggings, Mini skirt added).
- New rows: **Shoes** (10: sneakers, white, red, boots, high-tops, dress shoes, sandals, pointy, rain boots, platforms), **Hat** (13: hard hat, chef hat, fire helmet, police cap, top hat, cowboy, wizard, crown, beret, feathered cap, hood, racing helmet), **Face** (10: moustache, beard, goatee, glasses, round glasses, eye patch, freckles, blush, stubble).
- Saved characters still load (the new rows start plain). Bots and random looks wear the new things.

## Any colour + more hair (v1.45.0)
- Character creator: the rows of colour squares are gone. Skin, Hair, Top and Bottoms each have one round colour button. Tap it: a window opens zoomed in on that part (the head for hair and skin, the body for the top, the legs for bottoms) with the standard colours, a colour square to drag across for any colour, the browser's colour picker, and a hex box. Done (or Esc / tap outside) closes it.
- A picked colour travels with your character: everyone in the room sees it (needs the updated server).
- New hair: **Flame spikes**, **Widow's peak**, **Long locks** (full fringe, locks down the sides, long behind), **Bob & headband**, **Side tail**, **Fluffy mop**, **Wild crop**. New standard hair colour: teal. New hat: **Goggles** (pushed up on the head).

## Audience link when live (v1.45.1)
- Go live: the live panel shows **Audience link** with **Copy** (and **Share** on phones). The link opens the venue on the same server you're on (a home show's tunnel address included) with your room code already filled in.
- Jam mode: a **🔗** button next to the room in the audience panel copies it (shares it on a phone).
- On your own server (home show), a pop-up reminds you to send the link.
- `venue.html?room=ABCD` fills in the room code on the join screen.

## v1.45.2 — Note highway: no more silent empty board

- Pick a song from your computer, go live, start a Note highway round. Notes should come down as before.
- Songs longer than 15 minutes are now charted for their first 15 minutes instead of failing.
- If a file can't be read, the performer's round status says so, and the audience board shows "NO NOTES FOR THIS SONG" instead of sitting blank. If you ever see that, tell me the file type and length.
- Server unchanged in behaviour (version bump only), but redeploy Render to keep versions matched.

## v1.46.0 — Tuning lab

Open `venue.html?practice&lab` (or the new **🔧 Tuning lab** link on the join screen). A panel opens on the right (bottom sheet on a phone).

- Tabs: Walking, Step & Target dance, Note highway, Keepy uppy, Roller & Ice rink, Mosh pit. Each has a short explainer and every movement, timing and scoring number for that game, with what it does and its default.
- **▶ Play … now** starts that game in practice with the first song. The panel stays open so you can change a slider and feel it straight away. Changed values turn yellow, ↺ puts one back.
- Changes are saved on this device and apply everywhere you play on it, until you press **Reset everything**. 🔧 Lab button (top right) shows how many are changed.
- **Share box:** **Copy settings** copies a text list of only what you changed, ending in a JSON line. Paste that to me and I bake the values in as the new defaults. You can also paste someone's settings into the box and press **Apply pasted**.
- Check: change Keepy "Jump power" to 150, play Keepy uppy, jump: much taller. Copy, Reset everything, paste, Apply: the value comes back.
- Server unchanged (version bump only). Redeploy Render to keep versions matched.

## v1.47.0 — Graphics lab

Open `gfx.html` (or the new **🎨 Graphics lab** link on the venue join screen). It works on its own, no server needed.

**Stage & lights** (live preview with a performer and dancers, beat at 128 BPM)
- Row under the picture: lights mode, weather, fog, darkness, lasers, fireworks, neon night, disco ball, sunset, fire, follow-the-notes, 💥 burst, BPM.
- Side tabs: Stage lights, Weather & air, Lasers/strobe/fireworks, Neon & disco ball, Colour grade. Each value has a plain explanation, a default and a reset.
- Colour grade (brightness, contrast, saturation, hue, sepia, blur) is a filter over the whole picture, and it also applies in the venue on this device.

**Assets & animation**
- Types: Character (pose by hand), Dance (every style and variation), Instrument (every kind, with a note slider), Prop (keyboard, mic, key panel, keepy objects, rinks, disco ball).
- Dance frames: the loop is 4 beats. Left character = original, right = with your tweaks. Scrub to a frame, move the nudge sliders (arms, legs, bounce, sideways, tilt), **Save frame at this beat**. The change fades in and out around that beat and plays in the game on this device.
- Each asset has brightness, contrast, saturation and hue sliders and a **Save this look**. Those saved looks are for sending to me: they appear in the share box, and I apply them to the artwork.

**Sharing:** the share box lists everything changed plus JSON lines. **Copy changes** → paste to me; I lock them in as defaults. Paste a saved set and press **Apply pasted** to load it. **Reset everything** clears values, dance tweaks and asset looks.

Server unchanged (version bump only); redeploy Render to keep versions matched.

## v1.48.0 — Puppet dance, spins, pull-out dots, move queue

Free dance (all in the free dance panel).

- **Puppet** (new dance, last button on the right): nothing moves by itself. Left dot = body (slide to shift and lean, up to rise, down to crouch). Right dot = limbs (up raises them, left/right swings them). Moves: Arms, Legs, Arms + legs, Cross (one arm up, the other down).
- **Spin** (T) and **Twirl** (G, two fast turns): new buttons in the free dance panel and the reaction bar. Your character turns right round on the spot; everyone in the show sees it.
- **Pull a dot out:** drag a dot only a little past its ring and it just stretches. Pull hard (well past the edge) and it tears out: the ring glows gold and your dancer carries on by itself (Puppet loops your last couple of seconds; the other dances keep dancing). Slide the dot over a dance or move button and it switches after a moment (button lights up). Let go and the dot pops back into its ring and you're in control again.
- **Move queue:** with a dance and move showing, press **＋ Add this move** (up to 8). When it's your turn in the middle, the queue plays in order and splits your turn evenly; the current one is lit gold. Tap a chip to remove it, Clear to empty. Kept on this device.
- Server changed: accepts dance 16 and the spin/twirl reactions. **Redeploy Render** or other players won't see Puppet or spins.

## v1.49.0 — Phone-friendly labs, more graphics sliders, asset looks in the game

- **Phones:** open `venue.html?practice&lab` (Tuning lab) or `gfx.html` (Graphics lab) on your phone. The panel is a bottom sheet with one scrolling row of tabs; the share text box is tucked away. **Copy settings / Copy changes** copies straight to your clipboard. **✎ Text** opens the box to paste a set back in.
- **New section "Sunset, fire & Jumbotron"** in the Graphics lab: sun size and sky strength, flame height, window glow, ember count, Jumbotron light speed and frame thickness. Turn on Sunset or Fire in the effect row to see them.
- **Asset looks now apply in the game:** in the Graphics lab, set an asset's brightness / contrast / saturation / hue and press **Save this look**. Instruments, keyboard, mic stand, keepy objects and both rinks use their saved look in the venue and on the stage on this device. Works in Chrome, Edge and Firefox; Safari ignores it. **Reset look** puts it back.
- Server unchanged (version bump only).

## v1.49.1 - practice menu tucked behind a Dance button
- Practice mode (`venue.html?practice`): the big "Dance practice" menu is hidden behind a **💃 Dance** button top left, under the fullscreen and Leave practice buttons.
- On a phone (narrow screen or touch) the menu starts closed. On a computer it starts open. Tap Dance to open or close it.
- Pressing **Start round** closes the menu. The button hides during a round and returns after.
- The Tuning lab's Play button opens the menu if it needs a song picked first.

## v1.49.2 - Graphics lab one tap away in practice mode
- Practice mode now has a **🎨 Graphics** button under 🔧 Lab (top right). It opens the Graphics lab (stage lights, effects, assets and animation frames) in a new tab. Works on a phone.

## v1.50.0 - Pixel editor (Graphics lab)
- Graphics lab > Assets & animation > Asset type > **🖌 Pixel editor**. Pick a **Part**, then which one (for example Hair style: Mohawk), and paint it one pixel at a time.
- Parts: hair style, hat, face, extras (shades etc), top, bottoms (hips), left/right arm, left/right leg, instrument (with the performer), keyboard, mic stand.
- Tools: Pen, Erase paint, Hole (cut a pixel out; characters only), Fill, Pick (eyedropper), Scroll (pan on a phone). Also Mirror (head and body), Grid, Undo, Redo, Clear this layer, colour picker plus swatches of colours already in the picture.
- Edits save as you go and show in the game for everything that uses that part. Arms and legs are painted hanging straight down and turn with the dancing; head layers follow the head's bow.
- Share box: pixel edits go out as `PIXELS-JSON`; paste back and Apply pasted loads them. Reset everything clears them.
- Check: paint a few pixels on a hair style, go back to the venue practice and confirm characters with that hair show them while dancing.

## v1.50.1 - Pixel editor: part on its own, full screen mode
- The pixel editor now shows only the selected part floating on the checkerboard (the hair, hat, face, top, one arm or leg, or the instrument without the performer), not the whole character.
- **⛶ Full screen editor** button: the editor fills the screen with a bar at the top: ✕ exit, pen, erase, hole, fill, pick colour, ✋ drag, undo, redo, zoom slider, colour and swatches, grid, mirror.
- Zoom goes up to 10x. Use ✋ Drag, then drag on the picture to move around when zoomed in.
- Check: pick Hair style > Mohawk, open full screen, zoom in, drag around, paint with the pen, undo, exit.

## v1.50.2 - Pixel editor: body reference, big undo button
- **👤 Show body** (panel) / 👤 (full screen bar): draws the whole character, or the performer for instruments, faintly behind the part so you can line things up. It is reference only: it is never painted, filled or picked from.
- Full screen: big **Undo** button bottom left with a smaller **Redo** beside it (they left the top bar).
- Check: Hair style > Mohawk > full screen > 👤 shows the head and shoulders behind the mohawk; paint a pixel, tap Undo, tap Redo.

## v1.50.3 - Pixel editor: palettes, saner zoom
- **Palettes**: pick a ready-made set of 5-8 colours that go together (Neon night, Sunset, Skin tones, Hair naturals, Hair wild, Denim, Leather & rock, Pastel, Forest, Ocean, Retro arcade, Gold & steel, Greys) and tap a colour to paint with it.
- **Your own palettes**: ＋ adds the current colour (on a ready-made set it makes your own copy first), New palette, Save picture colours (the colours already in the picture), ✕ then tap a colour to remove it, Delete palette. They are kept on this device and go out in the share box as PALETTES-JSON.
- Palettes show in full screen too: a dropdown, ＋, ✕ and the swatches on the third row.
- **Zoom slider** is now smooth and shorter: the part fits the screen at about 40% of the way, the far right is 4x (it used to reach 10x, so 30% was already very close).
- Check: Hair style > full screen > choose Sunset > tap colours and paint; ＋ to start your own palette.

## v1.50.4 - Pixel editor: two-finger pinch zoom and move
- Two fingers on the picture: pinch to zoom in and out, and drag to move around. The zoom slider, ✋ Drag and 💧 Pick colour buttons are gone. One finger paints as before; putting a second finger down cancels the pixel the first finger just made.
- Mouse: the scroll wheel zooms around the pointer.
- Check: full screen, pinch out, drag with two fingers, pinch in; confirm no stray pixels are painted while you do it.

## v1.51.0 - Mars Rally (kart mini game)
- First version (top-down bike race). Replaced by the v1.52.0 version below.

## v1.52.0 - Mars Rally: UFO intro, space track, stick drives the direction
- **Intro**: the round starts on the normal dance floor. A UFO drops under the performer and they fly to the top-left corner and play from there. The floor fades to space and the camera zooms out to show the dance floor is part of a neon track (track name shows), then everyone pops into a bike, the driving controls slide up and the camera drops in behind you.
- **Dance floor** is a pulsing, beat-synced plaza the start line runs through. It stays under the grid all race.
- **Lights**: 3, 2, 1, GO. **Hold GAS from the "2" and keep holding at GO for a rocket start** (about 1.4 s of boost). Holding it before the 2 shows floods the engine (a short stall).
- **Controls**: push the left stick (or WASD / arrows) the way you want to drive; the bike swings round to face it. Hold **GAS** (or Space) to go. **DRIFT** (or Shift): hold it in a turn and let go for a blue or orange boost. **BRAKE** (or B). Yellow pads boost. Rails along the road and round the dance floor: you slide along them.
- Camera follows you up close; the game no longer turns the track on its side for phones.
- Tuning lab, Mars Rally group: new Intro speed (turn the intro down while testing), Rocket start length, Rail bounce, Turn speed. Auto gas is off by default.
- Server change: **redeploy Render** (bots wait out the intro, then race).
- Check: practice > Mars Rally > Start. Watch the intro (set Intro speed to 0.3 in the lab to test faster). Hold GAS from the 2 for the rocket start. Drive with the stick pointing round a corner and use DRIFT.

## v1.52.1 - Stop old scripts being cached
- Every page now loads its scripts with the version on the end (kart.js?v=1.52.1), so a phone can't keep running an old kart.js or art.js after an update.
- Check: open the venue after a deploy and confirm there is no red "Out of date" line at the bottom and Mars Rally starts with the UFO intro.

## v1.52.2 - Bigger character on the join screen
- Phones: the character preview now sits on top, about twice as big, with the options underneath. Computers: the preview box is bigger too.
- Check: open the venue on a phone and confirm the character fills the box above the Skin / Hair / Top options.

## v1.53.0 - Mars Rally: real karts, stick throttle, hop drift
- **Karts**: a pixel-art kart sprite sheet with 16 turning angles (built from 3D boxes, shaded and outlined), in each player's colour, with your character sitting in the cockpit.
- **Stick = speed and direction**: push the way you want to go, further is faster. Pull the opposite way to brake; keep holding and you reverse. No GAS or BRAKE buttons any more, so there's nothing to juggle with DRIFT.
- **Drift**: tap DRIFT (Space / Shift) and the kart hops. While it's in the air, swing it into the turn with the stick. The angle you land at locks the turn; left / right trims it a little. Keep holding DRIFT to charge sparks (blue, orange, purple) and let go for the matching boost. Land at a bad angle and you'll have to let go early to make the corner.
- **Effects**: animated drift sparks at the back wheels, exhaust flames and embers while boosting, dust when you land.
- **Camera**: the intro now only zooms out to about twice the dance floor distance, and the race stays at that distance.
- **Rocket start**: push the stick when the 2 lights up and keep it pushed at GO.
- Tuning lab Mars Rally group rebuilt for the new controls (hop time, hop swing speed, drift tightness, spark charge times, three turbo lengths, reverse speed).
- Server change: **redeploy Render** (bots now send which way their kart faces).
- Check: practice > Mars Rally. Drive with the stick only. At a corner tap and hold DRIFT, swing the stick into the corner while it's in the air, hold through the turn until the sparks go orange, let go.

## v1.54.0 - Mars Rally: dance-floor road, driver in the seat, Track builder
- **The road is the dance floor**: the same dark checker tiles as the venue floor, glowing in waves on the beat, with the floor's edge lines. The start plaza and the road are one floor.
- **Driver**: sits down in the kart (head, chest and arms above the cockpit), hands on the wheel, and turns their head into each corner.
- **Camera**: the race view is 1.4x further out than the dance floor (the intro starts at floor size and pulls back 1.4x).
- **New template track** "Dance Floor Snake": snakes down the floor in four hairpins and runs back up the left side; about 27 s a lap flat out, 5 boost pads.
- **Track builder** (join screen, or the 🏁 Track button in practice): drag the dots, tap an empty spot to add one, select a dot to delete it or make it the start, reverse direction, change road width, tap the road in Boost pad mode to add or remove pads. Warns in red if the road overlaps itself. Saves on this device by itself. Share copies a TRACK-JSON line to send me; paste one and Apply to load it.
- **Test drive** opens practice and starts Mars Rally on your track straight away, with 3 practice drivers.
- Live shows: the performer page sends your saved track with each Mars Rally round, so everyone races the track you built. Server change: **redeploy Render**.
- Check: open the Track builder, move a few dots, add a pad, press Test drive.

## v1.54.1 - Karts: driver sits properly at every angle
- Checked all 16 kart angles with a driver in. The seat back no longer covers the driver's face (side views); only the low parts in front of the cockpit (nose, bumper, front wheels, or the spoiler when driving away) are drawn over them.
- The kart is 20% bigger and the driver sits lower, so they're in it rather than standing on it.
- Driving away from you shows the back of the driver's head instead of their face.
- Check: practice > Mars Rally, drive a full lap and watch your driver as the kart points left, right, up and down.

## v1.54.2 - Track builder: Reset track
- The old "Template" button is now an orange **↺ Reset track** button. It puts back the original Dance Floor Snake exactly (dots, width, boost pads, name), re-centres the view and saves it. Undo brings your version back.

## v1.54.3 - Track builder: Redraw
- **✍️ Redraw**: the current track fades to a faint ghost and you draw a brand new one over it with one finger, all the way round, then lift. Your line becomes dots (about one every 85 units), smoothed to take out finger wobble, starting where you started and running the way you drew. Boost pads that still sit on the new road are kept; the rest are dropped.
- Press **✕ Cancel redraw** to back out, or Undo afterwards to get the old track back. Two fingers still zoom and move while redrawing.
- Check: Track builder > Redraw > draw a loop over the ghost > lift > drag a few dots to tidy up > Test drive.

## v1.54.4 - Pixel editor: Redraw
- **✍️ Redraw** (side panel and the full screen bar): wipes the part you're editing to nothing and shows the original faintly underneath, so you draw it fresh over the top. Your new pixels are all that shows in the game.
- **👻 Faint original** turns that faint copy on and off. The colour swatches show the original's colours while it's on, so you can pick them.
- Works for every part: character parts (hair, hats, tops, arms...) and the instruments, keyboard and mic (for those the original drawing is skipped entirely once redrawn).
- Undo brings the old picture back; Clear this layer goes back to the untouched original.
- Check: Graphics lab > Assets > Pixel editor > pick a part > Redraw > draw over the faint copy > back to the venue and look at it on a character.

## v1.54.5 - Dance animation: full screen editor
- Graphics lab > Assets > Dance > **⛶ Full screen editor**.
- **Timeline** across the bottom: the 4-beat loop as a line with 16 notches (a frame every quarter beat, tall notches on the beats). Pink dots mark frames you've changed. Tap or drag along it to pick a frame; ◀ ▶ step one frame.
- **▶ Play** to test the loop (speed button cycles 0.25× to 2×). Space plays/pauses on a keyboard, comma / full stop step frames.
- **Drag to pose**: drag a hand or foot handle to swing that arm or leg; drag the square on the body to move the whole body (sideways and bounce).
- **D pad**: moves the selected part one pixel per press (hold to repeat); ⟲ ⟳ turn it a little (for the body that's the tilt). Tap the middle of the D pad, or the 💪 / 🦵 / 🧍 buttons, to pick the part.
- 👻 shows the original dance faintly behind, ↶ undoes, 🗑 clears the frame. Every change saves straight away and goes out in the share box as DANCE-JSON, same as before.

## v1.54.6 - Graphics lab tabs, pixel editor tools
- Top tabs are now **Stage & Lights / Animations / Pixel Editor**.
- **No more automatic black border round your paint**: pixels you paint aren't outlined by the game; you draw any outline yourself.
- **Erase works on the original picture** too (it used to only remove your own paint), including the original's black outline pixels, and on the instruments, keyboard and mic.
- The Hole tool is gone (Erase does that now). New tools:
  - **📏 Line**: drag from one end to the other; it stays dead straight.
  - **〰️ Curve**: drag out a straight line, then drag anywhere on it to bend it (as many times as you like). **✓ Done** (or Enter) keeps it, **✕ Drop curve** throws it away.
  - **⬠ Shapes**: pick a shape (rectangle, rounded, ellipse, triangles, diamond, pentagon, hexagon, four arrows, 4/5/6-point stars, heart, lightning) and drag out its box; it grows as you drag, like MS Paint. **◻ Outline / ◼ Filled** switches between the two.
- **Right click = undo** on a computer (Ctrl+Z / Ctrl+Shift+Z work too). Right click also undoes in the full screen dance editor.

## v1.54.7 - Pixel editor on a computer
- No Full screen editor button on a computer (it's still there on phones and tablets).
- The long help text above the tools is gone.
- On a computer the part opens zoomed in a bit more (scroll wheel still zooms).
- The drawing area is now a light grey and white checker on every device, so the pixels stand out (the cursor square is pink).

## v1.55.0 - Track builder: endless canvas, side boost pads
- **Endless canvas**: dots can go anywhere (about 9000 x 9000 units, the old map was 1000 x 620). A faint grid shows the space. Two fingers zoom and move; on a computer the wheel zooms and right-drag (or Space + drag) moves. **🔍 Fit** shows the whole track. Up to 200 dots.
- Races work on big tracks too: the space backdrop, dance-floor road and the bots all follow the track wherever it is.
- **Boost pads off to the side**: in Boost pad mode, tap the middle of the road for a full-width pad, or nearer an edge for a small pad right where you tapped. Pads keep their side when you reverse, move the start or redraw.
- Server change: **redeploy Render** (positions now cover the bigger area; old and new pages can't race together, so everyone should reload).

## v1.55.1 - Mars Rally: mouse steering, no reverse, practice speed
- **Computer: the mouse steers.** Your kart is the middle of the stick: point the mouse where you want to go, and the further the pointer is from the kart, the faster you go. Hold the **left mouse button** to hop and drift (Space / Shift still work, and WASD / arrows still override the mouse while held).
- **No reverse.** Point the stick or mouse behind you and the kart swings round that way at full turn speed and keeps driving.
- **Practice speed**: a **Speed − / +** box under your place (practice only) sets the top speed in steps of 10 and remembers it. It's the same setting as Top speed in the Tuning lab, so it goes out in the lab's share text.

## v1.55.2 - Performer page: character colour picker on top
- The colour picker (skin, hair, top, bottoms) now opens in front of the "Your character on stage" window instead of behind it.
- While that window or its colour picker is open, typing (like a hex colour) no longer plays notes or swaps the key (Shift used to pop up "alt key").

## v1.55.3 - Your track is the base track
- Mars Rally's built-in track (and the Track builder's ↺ Reset track) is now your Dance Floor Snake: 29 dots, 15 boost pads, about 41 s a lap flat out.
- Anyone without their own saved track gets it. Server change: **redeploy Render** so the practice bots in live shows ride it too.
## v1.56.0 - Characters can turn round (front, side, back, other side)
- Every character now has four views: **front, facing right, back, facing left**. Every part has its side and back version: all 30 hair styles (long hair hangs down the back, ponytails and buns sit where they should), all 13 hats, glasses / beards / patches in profile, headphones and bandanas, every top (hoods hang at the back, the jersey has a number on the back, lab coats have tails), skirts, dresses and overall straps.
- **Character maker** (join screen and the performer's character window): ⟲ ⟳ buttons on the preview, or drag sideways across it, to turn the character round.
- **Mars Rally**: drivers face the way their kart points: you see their face coming towards you, their profile going sideways, and the back of their head driving away.
- Pixel-editor paint still only shows on the front view for now.
- Check: on the join screen tap ⟳ four times with a few different looks (try long hair, a ponytail, a hood, a cowboy hat).

## v1.56.1 - Mars Rally top speed 260
- Top speed is now **260** by default (was 135), for everyone and for the bots. The practice Speed box and the Tuning lab now go up to 400.
- If you'd set your own speed in practice, that saved setting still wins on your device; Reset in the Tuning lab's Mars Rally group goes back to 260.
- Server change: **redeploy Render** so the live-show bots drive at the new speed.

## v1.77.0 - Main menu

- The first screen is now a main menu. Your character dances on a little stage and turns through all 8 directions, with your name under it and three buttons:
  - **Join game:** goes to the room code screen, then Enter venue.
  - **Practice:** goes straight into the practice zone, with no reload.
  - **Character:** opens the character maker. Done brings you back. Tapping your character on the menu also opens it.
- **Instrument:** opens the phone instrument (index.html?instrument). It starts behind a big START PLAYING button because phones need a tap before they'll play sound. The ✕ in the instrument brings you back to the menu.
- Your name is saved on this device as you type it, so it's still there after a reload, after practice, or after coming back from the instrument.
- **iPhone:** the fullscreen button is hidden on iPhones, where Safari can't do fullscreen. That covers the audience page, the performer page and the phone instrument. Leave practice moves into its spot. It's also hidden in the Home Screen app, which is already fullscreen. Android, iPad and computers keep the button.
- **Character maker:** the turn buttons and dragging now step through all 8 directions, diagonals included (was 4).
- **Character maker, Male / Female / Both:** a new Style switch at the top. Male hides the women's hairstyles and the skirts. Female hides the men's hairstyles and the facial hair (moustache, beard, goatee, stubble). Both shows everything. Unisex styles show either way. If your current pick doesn't fit when you switch, it moves to the next one that does. Surprise me follows the switch too, and the choice is remembered on this device.
- The character on the menu is a size smaller and sits lower, so hats aren't cut off.
- A link with a room code in it (?room=ABCD) opens straight on the room code screen.
- If you get disconnected, you land back on the room code screen with the message.
- The logo is pixel art, and the join and character panels have square corners.

Page-only change: no Render redeploy needed.

**Test it:** open venue.html. Change your character and press Done, then Practice, then Leave practice. Your name and character should still be there. Then try Join game with a room code from a live show.

## v1.76.0 - Capture the flag sprint and refills, a stand-in performer in practice, one Dance button

Capture the flag:
- **Sprint:** hold the SPRINT button (bottom right), Space or Shift to run 60% faster. It drains a meter in about 2.4 s, and the meter charges back up over about 9 s. You need 30% charge to start a sprint, so it has to charge first. The button fills up as it charges and is dim until it's ready.
- **Sprint refills:** cyan lightning bolts on the map. Run over one and your meter is full at once. It comes back 10 seconds later, with a ring that fills up while you wait. The server referees who got it, so everyone sees the same thing.
- **Twin Forts rebalanced:** the boost pad strips in the top and bottom lanes are now refills, and there are two more refills in the middle. That leaves 6 refills and 14 boost pads (was 26 pads). Boost pads stay in the middle lane and by the forts. If your saved copy is the untouched old Twin Forts, it upgrades by itself. If you've edited it, it's kept as it is.
- **Map designer:** new "⚡ Sprint refill" tool. The status line counts refills.
- **Bots:** they sprint when carrying the flag, chasing a thief, or on a long run with a full meter. When they're low, they grab a refill if one is close.

Practice:
- A stand-in performer ("Stand-in") is on stage in every practice game, playing a riff on the beat. That includes riding the ski lift and standing in the Capture the flag corner.
- There's now one Dance button: the one by the stick opens and closes the practice menu. The extra top-left Dance button is gone.

Needs a Render redeploy (server.js and bots.js changed).

**Test it:** practice → Capture the flag. Hold Space while running to check the meter drains, refills, and that it's dim until 30%. Run over a ⚡ to fill it. Check the Stand-in is on stage in a few games.

## v1.75.0 - 8 directions in every game, the performer rides a ski lift

8 directions (audience and performer screens):
- Before, anyone in a game round faced the front, because a game counts as dancing. In the roller rink, ice rink, Keepy uppy, Mosh pit and free dance, players now face the way they're moving, diagonals included.
- Skaters keep their heading when they slow down. In the other games, standing still faces the stage.
- Mars Rally drivers turn with the kart in 8 directions (before: 4).
- Already 8-direction: Capture the flag, Ski (downhill angles), and walking around between rounds.
- Side-on by design: the Half pipe and the Dance walk race.
- The dance games (Step, Target, Note highway) still face the stage.

Ski lift:
- A ski lift runs down the left side of the run. It has two cables with shadows on the snow, a pylon every so often, and empty red chairs going back up.
- The performer sits on a chair coming down the mountain alongside you, easing along to stay level with you. On the performer's follow view, the chair stays level with the leader.
- There's no performer in practice, but the lift is still drawn there.

Page-only change: no Render redeploy needed.

**Test it:** in practice, try the roller rink and Keepy uppy. Skate or run around and check your character turns to face each of the 8 directions. Then run a live Ski round: the performer should ride a lift chair beside you on the audience screen and beside the leader on yours.

## v1.74.0 - Everyone can see each other in every game, pixel art buttons and joystick

I ran every game live (performer page, an audience page, 6 bots) and checked both screens mid-round.

What was wrong, and what changed:
- **Ski and Capture the flag:** the audience couldn't see the performer at all, because the game covers the whole screen. The performer now plays in the top left corner of those games, the same way they ride the UFO in Mars Rally. Nothing is drawn there in practice, where there's no performer.
- **Step / Target / Note highway rounds:** the performer stepped left to make room for your big dancer and ended up under the round info box. They now step right.
- **Half pipe:** the performer stood behind the SUPER meter and trick callouts. They now stand off to the right of the stage.
- **Free dance:** the round info box covered the top of the dance list on the left. The list moves down.
- **Mars Rally and Ski:** the round info goes back to the top middle there, clear of the performer in the corner. The sign isn't visible in those games anyway.
- **Capture the flag:** the round info sits under the team score, and the arena starts lower to make room. Phones get extra room for it.
- **Performer page (stage view):** the faint arrow and SPACE/D/E/3 key indicators sat in the middle of the floor over the dancers during games. They're hidden while a round is on (the stage has its own controller that lights up).
- All 14 games already showed every player to the performer in real time; no change needed there.

Pixel art controls (audience page):
- The joystick is now a real pixel drawing: a round base with a rim and arrow notches, and a round knob, shown with crisp pixels. The rim turns pink while you hold it. The skating knob uses the same knob.
- Every button (Leave practice, Dance, Talk, Stop, Log, Send, fullscreen, the free dance list, reactions, round and vote buttons, practice menu) has square notched corners, a flat colour with a hard bevel, and the pixel font. Gradients on the "on" buttons are now a flat pink.
- The dance walk pad is a pixel panel with notched corners and a pixel font.

Page-only change: no Render redeploy needed.

**Test it:** start a live show with bots and play Ski and Capture the flag. The performer should be top left on the audience screen. In a Step round, the performer should stand to the right of your big dancer. On a phone, check the joystick and buttons look pixelated.

## v1.73.0 - Half pipe: cleaner screen

- The pipe is a bit smaller: narrower and with lower walls.
- The disco ball now sits in the middle of the pipe, between the two boost pads, and swells and throws rings on every beat. No BEAT label on it.
- The trick guides (Headspin, Thriller, Robot, Shuffle, Boogie) are a row along the bottom right, next to the TRICKS stick. On a phone they sit just above the stick.
- The TRICKS stick is round.
- The 1 2 3 4 style buttons are gone, along with the "1–4 for style" hints.
- The round info (round name, who's leading) now sits top left under the corner buttons on computers and tablets, so it no longer covers the UNHOLY KEYS sign. This applies to every game. On phones it stays centred at the top.

Page-only change: no Render redeploy needed for this one.

**Test it:** practice → Half pipe. Check that the ball pulses between the pads, the guides sit beside the round stick, and the round box sits top left.

## v1.72.0 - Dance walk race: fewer style changes, racers really dance-walk

- The dance style now changes every 32 beats (was every 8), so you get time to settle into each one.
- Racers really walk forward to the beat while doing the active style: the legs stride, and the arms and bounce come from the style. Before, they slid along standing still.
- The cursor circle goes a bit slower: one loop every 5 beats (was 4). Tuning lab: Dance walk race → Beats per loop.
- Also in this version (from #102 and #103, which skipped the version bump): ski divots are curved grooves round the flag that sweep you round and fire you out fast, ski movement snaps to the ski angle frames in straight lines, and Capture the flag uses your Twin Forts as the built-in arena.

Needs a Render redeploy (bots.js changed).

**Test it:** practice → Dance walk race. Watch the racers' legs step on the beat as they move up the track, and check the style banner only changes about every 32 beats.

## v1.71.0 - Half pipe: no more pumping, two sticks, beat boost pads

- **Speed is automatic:** you roll up to cruising speed on your own, enough to reach the lip. There's no pumping any more.
- **Boost pads:** two pads sit on the flat in the middle of the pipe, one near the back and one near the front. They take turns on the beat: back on even beats, front on odd beats. The lit one glows yellow and pulses, the other goes dark. Roll over the lit pad as you cross the middle for BOOST!: extra speed, so your next jump goes higher. Hitting the dark one does nothing (NOT LIT). Extra speed eases back down to cruising if you stop hitting boosts. The disco ball (moved to the bottom left, or the top on a phone) keeps time so you can plan it.
- **Left stick:** up and down moves you between the back and front of the pipe to line up with the lit pad. Left and right lean you on the ramp and spin you in the air. On a computer that's W/S and A/D.
- **Right stick:** the TRICKS stick, always there. Draw a move ending with a flick up (Headspin ↑, Thriller ← ↑, Robot → ↑, Shuffle ↓ ↑, Boogie loop ↑). A harder flick goes higher. On a computer, drag the mouse, or use the arrow keys in order ending with ↑ (Space is a quick Headspin).
- Skaters now show where they really are front to back, on your stage view too.
- **Bots:** they chase the lit pad and get the boosts as well.
- New Tuning lab values: Cruising speed, Boost pad kick and Boost fade.

Needs a Render redeploy (bots.js changed).

**Test it:** practice → Half pipe. Use W/S (or the left stick) to sit on the lit pad as you cross the middle, then flick a trick at the lip.

## v1.70.0 - Half pipe: pump to build speed, draw your trick on the stick

- **PUMP:** the right-hand button is now PUMP. Every tap pumps your feet once (you can see the knees go), so tapping fast builds speed fast. It doesn't matter if you're on the beat. Momentum slowly fades if you stop. Space pumps too.
- **The trick stick:** as you go up the wall to the lip, you can't pump any more. The PUMP button turns into a stick (FLICK!, with a knob that follows your thumb). Draw the move on it, ending with a flick up. How hard you flick sets how high you go:
  - **Headspin:** straight up
  - **Thriller:** left, then up
  - **Robot:** right, then up
  - **Shuffle:** down, then up
  - **Boogie:** spin round in a loop, then up (worth the most)
- A flick a moment before the lip is held until you get there.
- **Guides:** small pixel drawings of each move down the left side show how to draw it. They light up when it's time to flick.
- The **left stick** still sets your angle on the ramp and spins you in the air. 1 to 4 still change stance in the air, and landing still has to line up with the wall.
- **On a computer:** drag the mouse anywhere to draw the move. With keys, A/D or ←/→ lean. For tricks, press the arrows in order ending with ↑: ↑ alone, ← ↑, → ↑, ↓ ↑, or ← ↓ → ↑ for Boogie.
- New Tuning lab values: Momentum per pump and Momentum fade.

No server changes.

**Test it:** practice → Half pipe. Tap PUMP fast until you're climbing high, then draw a trick on the stick at the lip.

## v1.69.1 - Ski: pixel skis that turn in frames, a smaller hop

- **Skis:** they're now pixel art that snaps between 7 set angles (every 30 degrees), like a sprite swapping frames, instead of smoothly rotating rectangles. The skier's facing follows the same frame: front when going straight down, three-quarter for a gentle turn, side-on for a hard turn. A spin trick shows the skis clicking round through the frames. Your stage follow view matches.
- **Hop:** shorter (0.28 s in the air, was 0.35) with a gentler sideways shove, and it no longer adds any speed. Only landing in a divot (SWOOP) speeds you up. A cut still scores CUT and briefly skips the carving slowdown.

No server changes.

**Test it:** practice → Ski. Turn gently and hard both ways and watch the skis click between angles.

## v1.69.0 - Capture the flag (first version) and the Capture the flag designer

A new minigame: **🚩 Capture the flag**. Pick it in Start song (or the crowd vote), or in dance practice.
- **The arena:** the floor turns into a top-down arena of dance-floor tiles with walls, a red base on one side and a blue base on the other. Everyone is put on a team (red or blue, evened out) and starts at their team's spawn. The count-in is 8 beats, then GO.
- **Moving:** arrow keys / WASD, or the stick on a phone.
- **Boost pads** (yellow chevrons) shove you hard the way they point.
- **The flags:** run into the other team's base to grab their flag (+100), then bring it back to your own base while your own flag is at home to score a capture (+500, and the team scores a point).
- **Tagging:** bump into someone from the other team while they're on your half and they're sent back to their spawn (+150, or +250 if they had your flag, which goes straight back to your base).
- The server referees everything, so all screens agree on who has which flag.
- **Stage view:** the whole arena fills your screen with everyone in it, team colours under their feet, the flags, who's carrying what, everyone's points over their heads and RED 0 - 0 BLUE at the top.
- **Bots** play it properly: some attack, some defend, carriers run home, and anyone chases a thief on their side. Bots on the other team's half also dodge defenders.

**Capture the flag designer:** Setup → Creator tools → Capture the flag designer (ctf.html).
- Paint walls, floor, boost pads (click Boost again to turn it: ▶ ▼ ◀ ▲), the red and blue bases, and the red and blue spawns. Drag to paint; right-click rubs out.
- 🪞 **Mirror** (on by default) copies everything to the other side with the teams swapped, so arenas come out fair.
- Small / Medium / Large / Huge sizes, Undo (Ctrl+Z), a name, ↺ Reset (back to the starting arena "Twin Forts"), 🗑 Clear, 📋 Share, and ▶ Test run (a practice game on your arena).
- It saves on your device, and your arena goes out with every Capture the flag round you start.

Needs a Render redeploy (server.js and bots.js changed).

**Test it:** practice → Capture the flag. Then make an arena in the designer, press Test run, and finally go live with bots and start a Capture the flag round.

## v1.68.1 - Dance editor: previous frame outline, copy and paste frames

- In the full-screen dance editor (Graphics lab), the previous frame's pose now shows as a see-through white outline behind the character, so you can pose each frame against the one before (onion skinning).
- The new **Prev frame** button in the top bar turns it on and off. It's on by default. 👻 still shows the original, unedited dance.
- **📋 Copy / 📥 Paste** (or Ctrl+C / Ctrl+V): copy a frame's whole pose and paste it onto any other frame, which then ends up in exactly that pose.
- The separate arm/leg/body buttons are gone from the top bar: pick a limb by grabbing its handle on the character (the D pad still nudges whichever one you last grabbed).

No server changes.

**Test it:** Graphics lab → a dance → full-screen editor. Step through the frames and check the white outline is the frame before.

## v1.68.0 - Ski: slalom flags with divots, swoops, ski-on intro, no more getting stuck on trees

- **Slalom flags:** flag zones now use single flags like the real thing (and SkiFree): red flags with a ← arrow, blue with →. Pass each flag on the side its arrow points. Right side = FLAG points and the streak goes up; wrong side = WRONG SIDE and the streak resets. Clip the pole and you go down.
- **Divots:** beside every flag, on the side you pass, there's a carved bowl in the snow with chevrons pointing the way through.
- **Swoop:** jump (a hop, a ramp or a mogul) and land in a divot and it swoops you out cleanly: pointed at the next flag's side, a burst of speed, +150 SWOOP and the streak goes up.
- **The start:** the round opens zoomed right in on the skiers at the top. Their skis lie either side of them, slide in under their boots and click on (with a sparkle) while they bend down to do up the bindings. Then the view slowly pulls back to show the whole mountain by GO. Your stage follow view does the same zoom out.
- **Trees and rocks:** a crash now throws you clear to the side, and for a moment after you get up you can't hit anything, so you can't get stuck crashing into the same tree over and over.
- Courses made in the Ski designer keep their two-flag gates.

No server changes.

**Test it:** practice → Ski. Watch the skis go on, then pass a few flags on their arrow side, and hop into a divot to get SWOOP.

## v1.67.0 - Mosh pit you can follow, points over heads, longer chat, server-version warning

**Mosh pit, seen from the stage**
- The floor shows which part of the pit it is (MOSH PIT, CIRCLE PIT, WALL OF DEATH, CHARGE!, PUSH WAR!) in the top left, and in the plain pit what's coming next and when ("NEXT: CIRCLE PIT IN 0:12").
- Circle pit: the two rings and arrows running round, the same as the players see.
- Wall of death: the dashed line down the middle, how many are on each side, and the big count-in.
- Push war: the live LEFT vs RIGHT tally bar, then who won.
- A POINTS table on the right during the pit and circle pit.
- Bots now actually mosh: they thrash about in the middle, run laps in the circle pit, split evenly for the wall of death, charge, pack in and push, and the winning side gets the bonus. Their points add up the way a player's do (laps, shoves, bumps, the wall win) instead of a made-up number.
- With two games per song, the mosh pit's wall of death and circle pit are now fitted inside the game's time. Before, they could fall outside it and never happen.

**Points over heads:** in every game except Free dance, each player's points show over their head on your stage view, and a green +N rises when they score. The server now sends you everyone's score every 3 seconds.

**Chat**
- Speech bubbles stay up for 10 seconds, or until that person walks away, whichever comes first.
- The whole message shows: bubbles wrap onto as many lines as they need instead of being cut off with "...". Messages can be up to 300 characters.
- The server lets you send chat faster before it starts dropping messages.

**Server-version warning:** when you go live and the server is older than the page, a red banner tells you to redeploy Render.

Bots also stop showing an old step-dance combo during other games, and their scores in step/target/highway rounds now count from when that game started (matters with two games per song).

Needs a Render redeploy (server.js and bots.js changed).

**Test it:** go live with bots, start a Mosh pit, and watch the stage view through a circle pit and the wall of death.

## v1.66.0 - Ski: flag zones, jump zones, faster, and the pop and cut

- **Layered mountain:** the made-up mountain now goes flag zone, jump zone, flag zone, jump zone, all the way down. A dashed line and FLAG ZONE / JUMP ZONE on the snow mark where each one starts, with a banner as you cross it.
  - **Flag zones:** slalom gates down the line, a little closer together than before, with no ramps.
  - **Jump zones:** a run of ramps along the line, swapping sides, with moguls between them. Tricks are worth ×1.5 here.
  - Courses made in the Ski designer are unchanged.
- **Faster:** top speed 230 (was 170), quicker acceleration, sharper turning, and less speed lost when carving. The camera pulls back a little at full speed so you can see what's coming.
- **The pop:** a hop (Space / HOP) gives a small kick of speed and shoves you sideways the way you're steering (or already sliding), with a puff of snow.
- **The cut:** while you're up from a hop, your skis swing round about 3.5 times faster. Land on a new line (half a radian or more of turn) and you get CUT, a little speed and no carving slowdown for a moment. Arrow keys mid-hop now steer instead of doing tricks; tricks are for ramps and moguls (the trick buttons still work anywhere in the air).
- New Tuning lab sliders: Hop pop speed and Hop pop sideways shove.
- **Fix:** the server's ski bots had gone missing in v1.62.0. In a live Ski round with bots that would have broken the bots (and possibly the server). They're back.

Needs a Render redeploy (bots.js changed).

**Test it:** practice → Ski. Cross a flag zone, then a jump zone. Hop and swing hard left or right while you're up, and check you land on the new line with CUT.

## v1.65.0 - 8 directions for every character

Characters now face 8 ways instead of 4: front, back, left, right, and the four diagonals.
- **Front diagonals** (walking down-left or down-right): the head turns toward the way you're walking, the face sits to that side with an ear showing on the other, and the far arm and leg tuck in, a shade darker.
- **Back diagonals** (walking up-left or up-right): the back view with the head turned, a sliver of cheek and ear showing on the side they're looking toward, and the far side in shadow.
- They're built from each character's own parts, so every hair, hat, top and face option works in all 8 directions, including anything made in the character creator.
- Walking picks the nearest of the 8 directions, with a little stickiness so a heading between two doesn't flicker. They keep facing that way when they stop. Your stage view uses the same 8 directions.
- Dancing still faces the stage. The Half pipe, Ski, walk race and Mars Rally keep their own facing rules for now.

No server changes.

**Test it:** walk around the floor diagonally (two arrow keys, or the stick at an angle) and check the character turns to face each diagonal.

## v1.64.1 - Half pipe: the beat pulses out of a disco ball

- The beat bar is replaced by a pixel disco ball at the bottom of the screen (above the pad and stick on phones).
- On every beat a ring of light and sparks bursts out of the ball and its mirrors flash. Every 4th beat the burst is bigger and yellow.
- A white ring closes in on the ball and touches it right on the next beat, so you can see the timing coming.
- Hit the beat and the burst turns green with NICE!. When it's time to swipe, the ball glows gold with SWIPE!.
- The whole pipe pulses harder with the beat: more of the glowing tiles light up, they flash brighter, and the floor gets a coloured wash on each beat.

No server changes.

**Test it:** practice → Half pipe. Tap BEAT as the white ring touches the ball; the burst should go green.

## v1.64.0 - Two games per song, crowd vote, full show, pixel boost pads

**Pick up to 2 games per song** (Start song menu, step 2). Tap a game to add it; tap again to take it off. Numbered badges show the order.
- The song starts right away with everyone in free dance. The first game starts after an intro (15 to 30 s, longer on long songs).
- Each game runs for 2:30 at most. With two games there's a break of at least 20 s between them, which is when the first game's results show. Whatever's left of the song is free dance at the end.
- If the song is too short for two games of at least 40 s, only the first one is played.
- Free dance and Battle still take the whole song, the same as before.
- The bar at the bottom shows what's on ("Free dance · Half pipe next"), and the round panel counts down to the next game.

**Crowd vote:** pick 🗳 Crowd vote instead of a game (tap it twice to have the crowd pick both games). About 15 s before that game's countdown, everyone gets a panel with 3 games to choose from, with live vote counts. The game with the most votes is played; a tie is decided at random, and so is a vote nobody joins. Bots vote too.

**Full show:** tick 🎪 Full show and a game that's been played won't be offered in the crowd vote again. Once every game has been played, they all come back. ↺ New show starts the list over. The menu shows how many have been played so far.

**Mars Rally boost pads** are now pixel art on the track's pixel grid, with the chevrons sweeping across them in steps.

Needs a Render redeploy (server.js changed: the crowd vote).

**Test it:** go live with bots, open Start song, pick Crowd vote + Half pipe, and play a song of 3 minutes or more. You should get free dance, then the vote, then the winning game, a break with the results, then Half pipe, then free dance to the end.

## v1.63.1 - Half pipe: beat bar and a bigger, shallower pipe

- **Beat bar** along the bottom of the screen (above the pad and stick on phones): blocks slide in from both sides and meet in the box on every beat, so you can see when to tap BEAT. Every 4th beat is a bigger yellow block. The box flashes green when you hit the beat and turns gold with SWIPE! when it's time to swipe.
- **Bigger pipe:** it's wider (nearly the full screen), deeper front to back (9 rows of tiles instead of 6), and the walls are lower.
- Bots ride all the way up the wider walls.

Needs a Render redeploy (bots.js changed).

**Test it:** practice → Half pipe. Tap BEAT as the blocks meet in the box; the box should flash green on each hit.

## v1.63.0 - Pixel art sweep

Everything round, glowing or blended in the games is now drawn the pixel-art way:
- **Circles and ovals** (walk-race circles, target-dance notes, shadows under feet, medals, UFO, roller rink rails and centre line, moon and planets) are stepped pixel shapes on the same pixel grid as the stage.
- **Gradients** (spotlight pools, glows, sky, water, fog) step through flat bands instead of blending smoothly.
- **Soft glows** around the walk circle and rink rails are now chunky pixel halos.
- **Mars Rally**: the whole track is painted in big pixels, with every floor tile exactly 4 x 4 pixels.
- **Jam visualizers** and the phone-mode glow behind the pads are drawn at the stage's pixel size and scaled up blocky.
- **Note blocks** in the jam piano roll have notched pixel corners.
- **In-game text and buttons**: banners (SHUFFLE!, MISSED GATE, SUPER MOVE), scores and combos use a pixel font (Silkscreen) with hard drop shadows. The BEAT, HOP, JUMP, DRIFT and trick buttons and the joystick have notched square corners.
- Menus, chat and setup screens are unchanged, so they stay easy to read.

No server changes.

**Test it:** open practice and try Dance walk race, Half pipe, Ski, Mars Rally and Roller rink. Nothing should look smooth or blurry in the game itself. Then go into Jam mode in classic view: the visualizer behind you should be chunky pixels.

## v1.62.0 - Half pipe v2

The half pipe is rebuilt from scratch around your request.
- **Groups:** players are split into groups of 4 to 5 on the same pipe. You only see your own group, so the pipe never gets crowded.
- **Own pace:** everyone rolls at their own, slower speed. Hit **BEAT** (or Space) on the beat to build momentum; missing beats lets it drain. Momentum keeps building through the song.
- **Lean:** the left stick (A/D or ← →) sets how you hit the lip, and spins you in the air.
- **Swipe:** when the BEAT pad turns into **SWIPE!** near the top of the wall, swipe on it (or drag the mouse anywhere, or press ↑/↓). The direction picks the trick: ↑ Headspin, ← Thriller, → Robot, ↓ Shuffle. A harder, faster swipe goes higher.
- **Landing:** line the board up with the wall (upright, or a full half/whole spin). Close = clean, a bit off = sketchy for half points, way off = bail.
- **Stances:** 1 to 4 (Point, Vogue, Kick, Freeze) change your pose mid-air for bonus points.
- **Super move:** clean landings fill the SUPER bar. When it's full your next trick goes higher and scores triple.
- The pipe is now built from the dance floor's own tiles, bent up the walls, with the glowing tiles pulsing on the beat.
- Bots skate the new way too, and your stage view shows everyone at their real height and spin.

Needs a Render redeploy (server.js and bots.js changed).

**Test it:** practice → Half pipe. Tap BEAT on the beat until the bar fills, swipe at the top, and try to land straight. Then go live with bots and start a Half pipe round.

## v1.61.0 - Ski designer

A map designer for the Ski mountain: **Setup → Creator tools → Ski designer** (ski.html).
- **Placing things:** pick Gate, Tree, Rock, Ramp or Mogul and click (or tap) the slope to place it; Erase removes the nearest thing. Gates alternate red and blue down the course automatically.
- **Getting around:** scroll the mouse wheel to zoom; drag with the right button (or hold Space and drag) to move around. On a phone, drag to scroll and pinch to zoom.
- **Length:** − / + change how long the course is (in 50 m steps). After the end it repeats from the top, so a round never runs out of mountain.
- **Other buttons:** Undo (Ctrl+Z), a name, ↺ Reset (back to the starting mountain), 🗑 Clear, 📋 Share (copy your mountain or paste someone else's) and ▶ Test run (opens a practice ski run on your course).
- It saves on your device. Your course goes out with every Ski round you start. Players, bots and your follow view all use it, and bots ski the line through your gates.
- The trees along the edges of the run are still added automatically.

Needs a Render redeploy (server.js and bots.js changed).

**Test it:** open the Ski designer, add a few gates and a ramp, press Test run. Then go live and start a Ski round: everyone should be on your course.

## v1.60.3 - Ski in pixel art

The ski mountain is now drawn with hand-made pixel-art sprites instead of smooth shapes: two kinds of pine tree with snow on the branches, rocks (some snow-capped), red and blue slalom flags, ice ramps with an arrow, snow moguls, pixel shadows, and snowbanks along the edges of the run. Skiers are drawn bigger, at a whole-number pixel size so they stay crisp. The same art shows in your follow view. On a computer the left stick is hidden (the mouse steers); phones keep it.

**Fix:** a half pipe no longer flashes on screen for a moment when the page first opens (its "flatten back down" animation was timed from page load).

## v1.60.2 - Old Dance menu removed

The Dance button no longer opens the old list of games (Free dance / Step dance / Target dance / Note highway…).
- In Dance practice it opens the practice panel (the newer menu with every minigame).
- At a show with no round on, it starts free dancing straight away. When a round is on it still joins the round, and pressing it again stops.

**Ski on phones:** the left stick is back during Ski. Push it the way you want to go (down is fastest, sideways carves, up stops you). The trick buttons sit above HOP on the right, and on tall phones your skier sits lower so the round banner doesn't cover them.

## v1.60.1 - Your follow view of the Ski round

During a Ski round, jam mode switches to a follow view of the mountain (and back when the round ends):
- The camera rides with whoever's furthest down, on the same course everyone's skiing.
- Every skier is shown where they are, with gold, silver and bronze rings and 1/2/3 badges on the top three.
- Anyone too far back to be on screen gets a tag at the top: "↑ Name · 93 m back".
- A standings list on the right shows everyone's distance down the mountain.
- You're playing on a snowy ledge in the top left.
- The mountain (course, trees, gates, ramps) now lives in art.js, shared by the players' screens and yours, so they always match.

**Test it:** go live with a few bots and play a Ski round; watch the camera follow the leader and the standings reorder.

## v1.60.0 - New minigame: Ski

The dance floor tilts and whites out into a slope, and the camera follows you down an endless SkiFree-style mountain. It starts as narrow as the dance floor (everyone lined up on a strip of it at the top) and opens out wide below.
- **Steering:** point where you want to go with the mouse (or touch and drag on a phone). Straight down is fastest, sideways slows you, pointing uphill stops you. Left / right arrows steer too, down points you straight.
- **Start:** "READY… 3, 2, 1, GO!" on the beat (beat 8).
- **Slalom gates:** go between each pair of flags (alternating red and blue) for points. Gates in a row build a **combo** (×1.1, ×1.2, …); miss one and the combo resets.
- **Air and tricks:** hit a blue ramp (or a mogul) for air, or hop with **Space** / HOP (hop over rocks). In the air: ⬅ 360, ⬆ Backflip, ➡ Daffy. Land a trick to score it; still mid-trick when you land and you wipe out.
- **Crashes:** trees and rocks knock you down for 1.4 s and reset your combo. The sides of the run are thick forest.
- **Scoring:** gates and tricks (with the combo), plus a point for every bit of slope you cover.
- Everyone skis the same course (made from the round number), so you'll see the others when they're near you. **Bots** ski the slalom line at their own pace and sometimes crash.
- In your round picker and Dance practice. **Tuning lab → Ski**: top speed, acceleration, turn speed, hop and ramp air time, crash time, points per gate.

Needs a Render redeploy (server.js and bots.js changed).

**Test it:** Dance practice → Ski with a song. Steer through gates, hit a ramp and try a trick, crash into a tree. Then live with a couple of bots.

## v1.59.1 - Your view of the Half pipe and the Dance walk race

During a Half pipe or Dance walk race round, jam mode switches to the stage view by itself (even if you picked classic; your choice comes back when the round ends), so you can watch the game while you play.
- **Half pipe:** the floor bends up into the pipe, and everyone skates it exactly as they see it on their phones: on the walls, in the air, boards flipping and spinning, bails. It also shows in the small live preview in the audience panel.
- **Dance walk race:** the start and finish lines are on the floor, racers face the finish line, lie flat when they trip and turn to the crowd once they're in.
- The half pipe's shape and drawing now live in art.js, shared by the audience screen and yours, so the two always match.

**Test it:** go live with a few bots and play a Half pipe round, then a Dance walk race, with your view set to classic. Both should switch to the stage view and back.

## v1.59.0 - New minigame: Half pipe

The dance floor bends up into one wide half pipe (it warps up over a couple of seconds when the round starts, and flattens again after) and everyone skates it at once, each in their own lane.
- **Riding:** you swing from wall to wall in time with the music, one crossing every 2 beats.
- **Pumping:** press **Space** or the big **PUMP** button as you pass the bottom, on the beat, to go higher. The bar at the bottom fills as the moment comes; the meter beside PUMP shows how high you're swinging. "PERFECT PUMP" for spot on; pumping at the wrong time ("OFF BEAT") or skipping a swing loses a little height.
- **Air and tricks:** swing high enough and you fly over the lip. In the air, an arrow (or the trick buttons) does a trick: ⬅ Kickflip, ➡ Heelflip, ⬆ Indy grab, ⬇ 360. You can fit two near the top of a big swing.
- **Landing:** finish the trick before you come down and it scores (more for higher air). Clean landings in a row build a **combo** multiplier (×1.25, ×1.5, …). Still mid-trick when you land and you **bail**: you go flat, lose your combo and drop most of your height.
- **Bots** skate too: pumping mostly on the beat, throwing tricks, sometimes bailing.
- In your round picker and Dance practice. **Tuning lab → Half pipe**: pump timing window, pump power, height lost per missed pump, bail time.

Needs a Render redeploy (server.js and bots.js changed).

**Test it:** Dance practice → Half pipe with a song. Pump on the beat until you're getting air, try each trick, and try a trick right before landing to see a bail. Then live with a couple of bots.

## v1.58.0 - New minigame: Dance walk race

Everyone lines up on the left of the dance floor and dance-walks to the finish line.
- **The pad:** a circle glides along an invisible path on your pad (bottom right; bottom middle on phones). Keep your cursor (or finger) inside it to walk at full speed.
- **The dances:** every 8 beats the dance changes (Sway, Spin, Shuffle, Wave, Bounce, Box step) and so does the circle's path. The pad shows the dance now and warns you two beats before the next one. Your character does that dance as they walk.
- **Slipping out:** outside the circle you slow down, the further out the slower. Stay out for about 1.4 seconds and you **trip** (1.3 seconds on the floor). The pad's border goes orange, then red, as you get close to tripping.
- **Start:** "READY… 3, 2, 1, GO!" on the beat (the race starts on beat 8 of the song).
- **Finish:** first across the line wins. The round ends by itself a few seconds after everyone's finished. Places are decided by the server, so every screen agrees.
- **Scoring:** 1st 4,000, 2nd 2,500, 3rd 2,000, then 1,000 + 3,000 ÷ place. Anyone still racing at the end scores by distance (up to 1,000). Show points then split 1,000 per round as usual.
- **Bots** race too, each at their own pace, and sometimes trip.
- In your round picker and in Dance practice. **Tuning lab → Dance walk race** has sliders for race time (40 s at full speed), circle size, slowest speed, time out before tripping, trip time and how fast the circle loops.

Needs a Render redeploy (server.js and bots.js changed).

**Test it:** Dance practice → Dance walk race with a song. Then live with a couple of bots: race, slip out on purpose to trip, and check the round ends once everyone's in.

## v1.57.3 - Every round is worth 1,000 show points, with a high floor

Each round now hands out exactly 1,000 show points (before: 10 / 7 / 5 / 3 / 1 by finishing place).
- **40% is shared equally** by everyone who took part in the round, so nobody walks away with nothing.
- **60% goes by score, softened** (square root), so a blowout win is worth only a bit more than a solid second.
- Example: Mars Rally scores of 2,651 / 2,449 / 1,889 / 1,459 pay 269 / 263 / 243 / 225. A lopsided round of 3,000 / 800 / 500 / 100 still pays the last player 152.
- A game with huge score numbers counts the same as one with small numbers.
- Steady beats spiky: over three rounds, a player who wins one round big then flops finishes behind someone who's a solid second every time, and the gaps stay small enough that a slow starter can catch up.
- Battles split by matches won; free dance by votes. Works the same in Dance practice.

Needs a Render redeploy (server.js changed).

**Test it:** play a few rounds with bots; each round's "+points" add up to 1,000, and the show standings stay close.

## v1.57.2 - Dance floor fills tall phone screens

The floor used to stop at 78% of the screen height (room for the old, always-open chat log), which left a black band at the bottom on tall phones, most noticeably in the Home Screen app. It now runs down to the chat bar, or to the bottom of the screen in Dance practice.

**Test it:** open the Home Screen app on the iPhone, in portrait and landscape, live and in Dance practice: no black band under the floor.

## v1.57.1 - Drift steering tightened

Once a drift has landed, the stick can now only change the turn by 15% (was 35%), and that steering builds up over about two-thirds of a second instead of instantly. Land at a bad angle and you'll have to let go and recover, rather than steering out of it.

Two new Tuning lab sliders under Mars Rally if you want to adjust it: **Drift steering** (how much, default 0.15) and **Drift steering speed** (how fast it builds, default 1.5/s).

**Test it:** practice a Mars Rally, land a drift too sharp for a corner, and try to steer it wider: you shouldn't make the turn.

## v1.57.0 - Stage button, characters face the way they walk, audience screen trimmed

**Performer jam screen**
- The **Stage** button in the bottom bar now opens the stage effects (lights, weather, fog, Jumbotron, banner, balloon drop, confetti, crowd moments) in a pop-up. Click outside or press Esc to close.
- Switching between the classic jam view and the stage view moved to **Setup → Stage view: On/Off**.

**Characters face the way they walk** (audience screen, and your Hang out view)
- Walk right and they turn right, walk left and they turn left, walk up and you see their back, walk down and they face you.
- When they stop, they keep facing the way they were going. Dancing turns them back to face the stage.

**Audience screen**
- The join screen shows only name, room code, character, Join and Dance practice. (This was meant to ship in v1.56.8 but missed the merge.)
- Dance practice no longer shows the Lab / Graphics / Track buttons. They appear only when you open the Tuning lab from your Setup menu, or test-drive from the Track builder.
- Tuning lab, Graphics lab and Track builder are in your Setup menu under **Creator tools**.

**Test it:** in jam mode click Stage and change the lights; Setup → Stage view toggles the view. On the audience page or in Dance practice, walk in each direction and stop.

## v1.56.9 - Caps Lock no longer toggles chords

Caps Lock does nothing in the game now. To use chord mode, open Setup → Play and click the **Chord mode** badge (it reads "Off -- click to turn on"); click it again to turn chords off.

## v1.56.8 - Jam screen tidy-up, chat log folds away, back-view arms

**Performer jam screen**
- Top right: just **Go live** and **Fullscreen**.
- Bottom left: one bar with Stage, FX, the visuals buttons, play controls, Start song and Hang out / Back on stage.
- **Setup** moved to the bottom right (the audience panel sits above it when you're live).
- New **🎸 instrument button** top left: shows what you're playing; click it for a menu of every instrument by family, click one to switch.
- The Jumbotron is about 20% smaller, and the SPACE / D / E / 3 key panel sits just left of it instead of over the sign (on the audience screen too).

**Audience screen**
- The chat log is folded away by default; a **💬 Log** button next to the chat box opens it, with a count of new messages. The controls move down to use the space. It remembers if you leave it open.

**Audience join screen**
- Only what the audience needs: name, room code, character, Join, and Dance practice. The Tuning lab, Graphics lab and Track builder links moved to your Setup menu under **Creator tools** (they open in a new tab).

**Characters**
- Seen from behind, arms that reach forward now go behind the body instead of in front.

**Test it:** open jam mode and check the layout; click the instrument button and switch instruments; on the audience page send a few messages with the log closed (badge counts up), then open it.

## v1.56.7 - After the race, karts after a blip, no right-click menu

- **End of the race:** on the audience screen your UFO now flies you from the top-left corner back to the stage, sets you down and drops away, so you finish the song on stage. On your own screen the race view fades back to your stage view.
- **Karts vanishing (Jed's report):** if a player's connection blipped mid-race, everyone else saw them as a faded figure on the start line for the rest of the race, and they saw everyone else that way too. Karts now re-announce themselves every second, so a rejoined player is back on everyone's track straight away.
- **Right-click:** no browser menu on the performer page or the audience page (text boxes still have it, for paste).

**Test it:** in a race on two phones, turn one phone's Wi-Fi off for a few seconds and back on: the other phone should see their kart come back within a couple of seconds. At the end of the round, watch the UFO bring the performer home.

## v1.56.6 - Race view fixes

- Your character no longer disappears from the UFO when you play a note.
- Karts stay on the road: between position updates they now glide along the track instead of cutting straight across bends.
- The 1/2/3 order is right from the start (a kart's first position before it reached the grid used to confuse the lap counter).
- With Stage view on, the big Jumbotron and the stage copy of you no longer draw over the race.
- If the song has a video, it plays on a little Jumbotron behind you in the top left.

**Test it:** a Mars Rally round with a YouTube or video song, Stage view on. Play notes the whole time; watch karts round the hairpins; check the video sits behind you on the UFO.

## v1.56.5 - Performer sees the Mars Rally race

During a Mars Rally round, jam mode switches to a race view: the whole track from above, with you playing on your UFO in the top left. Every racer's kart is on the track in real time, the top three have gold, silver and bronze rings with a 1/2/3 badge over their kart, and a standings list on the right shows everyone in order plus the leader's lap. It goes back to your normal view when the round ends.

**Test it:** go live, pick Mars Rally with a few bots, start a song. Once the karts pop out (about 6 seconds into the race intro) you should see them move round the track and the standings reorder as they pass each other.

## v1.56.4 - Go live from jam mode

Jam mode now has its own **🔴 Go live** button (next to Hang out), so you don't have to leave jam mode to start a show. Once you're live it turns into a pulsing **🔴 LIVE** badge (or **📡 Reconnecting…** during a blip). Clicking it while live asks before ending the show.

**Test it:** enter jam mode, click Go live, check the audience panel appears and the button reads LIVE. Click it again and pick Cancel: the show keeps going.

## v1.56.3 - Reconnecting after a connection blip

If the performer page loses its connection mid-show (Wi-Fi drop, phone switching networks, a server hiccup), the show no longer ends. The server holds the room, the audience, the round and the scores for a minute while the page reconnects on its own.

**What you see:**
- Performer: a yellow "Connection blip: reconnecting…" toast and the Live button reads **Reconnecting**. When it gets back in, a green "Reconnected" toast appears and the button reads **LIVE** again.
- Audience: a blinking "📡 Performer reconnecting…" banner at the top, which disappears when the performer is back. Nobody gets kicked.
- If the performer can't get back within a minute, the show ends as before ("Performer has left the stage").
- Pressing **Stop** still ends the show straight away for everyone.

**Test it:**
1. Go live and join from a phone or a second tab.
2. On the performer computer, turn Wi-Fi off for 5 to 10 seconds, then back on.
3. The audience tab should show the banner, then clear it. The performer's audience list and the round carry on.
4. Press Stop: the audience should see "Performer has left the stage" immediately.

Needs a Render redeploy (server.js changed).

## v1.56.2 - Fix: live show dropping when a round starts
- The bug: the server cut off any message over 16 KB. A round start carries the song's step chart (and for Mars Rally, your track), and for a longer song that's over 16 KB, so the server disconnected the performer the moment the round started. Everyone then lost the performer: no music, no round, and the performer page stopped seeing the audience.
- The fix: the performer can now send up to 240 KB (everyone else stays capped at 16 KB). The server also logs when it drops an oversized message.
- Server change: **redeploy Render** (this fix only works once the server is updated).
- Check: go live, have someone join, start a round with a full-length song (try Mars Rally too). The round should count in and the music should play for them.
