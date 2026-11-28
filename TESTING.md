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

## v1.79.9 - Every game shows the Jumbotron and the performer

A sweep of all 14 mini games, on a computer and an upright phone, with the Jumbotron down and the performer on stage. Before the fix:

| Game | Computer | Phone |
|---|---|---|
| Step dance, Target dance, Note highway, 4-key highway | OK | The game panel covered the performer |
| Free dance, Mosh pit, Roller rink, Keepy uppy, Dance walk race, Mars Rally | OK | OK |
| Half pipe | SUPER meter ran across the Jumbotron | Same |
| Ski, Capture the flag | No Jumbotron (performer was in the corner) | Same |

Fixes:
1. **Ski and Capture the flag** now show the Jumbotron as a small screen in a corner (above the game), so a video on it stays in view. The performer stays in the corner on their stand.
2. **Phone and tablet held upright**: the game panel now starts under the stage, so the performer and the Jumbotron stay visible above it. In practice the round line moves to the top edge.
3. **Half pipe**: the SUPER meter moved under the score.

To check: join a room on a phone with a video on the Jumbotron and start Step dance, Ski and Capture the flag. You should see the Jumbotron and the performer in each. Not covered by the sweep: Ice rink (it uses the same drawing as the Roller rink, which passed) and a live video playing (the sweep forced the Jumbotron down).

## v1.79.8 - Presets you can actually hear

You tried the violin presets in v1.79.7 and all but Haunted sounded the same. That was right: they were tuned to keep the volume level, not to sound different, and most only added a little reverb. The measurements agreed: Haunted's tail was about 13 dB longer than the dry sound, while Concert Hall's was about 2 dB longer.

What changed:
1. Every preset was rebuilt with a strong character (big hall, close room, heavy chorus, deep echo, drive, tape wobble, wah and so on) instead of a light touch.
2. The test now measures how audible a preset is: how much the tone changes, how long the tail gets and how much it wobbles, all against the dry sound. A preset is only kept if it is clearly different from dry AND clearly different from every other preset for that instrument.
3. Levels are still matched to the dry sound within 2 dB, and no preset may peak above -1.5 dBFS.
4. The generic presets are unchanged and still under "More sounds".

| Type | Presets |
|---|---|
| Piano, harpsichord | Concert Hall, Felt Piano, Honky-Tonk, Tape Keys, Dreamy Piano |
| Electric piano | Rhodes Tremolo, Warm Drive, Neo Soul |
| Organ | Cathedral, Rotary Slow, Rock Organ, Gospel Warm |
| Accordion, harmonica, bagpipe | Cafe Room, Blues Harp, Wide Squeeze, Folk Hall |
| Synths, keytar, chip, EDM | 80s Chorus, Sweep Lead, Wide Pad, Arp Echo, Gritty |
| Electric / distorted / jazz guitar | Clean Chorus, Edge of Breakup, Crunch Lead, Ambient Swell, Surf Spring |
| Acoustic guitar, banjo, sitar, harp, zither | Campfire, Shimmer Stereo, Nashville, Cavern, Lo-fi Porch |
| Bass | Tight Studio, Drive Pick, Fretless Chorus, Dub Echo, Lo-fi Sub |
| Violin, cello, double bass | Concert Hall, Warm Section, Cinematic Swell, Folk Fiddle, Haunted |
| Trumpet, trombone, horn, tuba | Big Hall, Fanfare, Mariachi Slap, Warm Section |
| Sax, clarinet, bassoon | Smoky Club, Breathy Hall, Late Night Echo, Wide Section, Funk Sax |
| Flute, pan flute, ocarina, whistle | Dreamy Flute, Canyon Echo, Folk Hall |
| Mallets, bells, music box, kalimba, steel drum | Glass Hall, Music Box Echo, Dreamy Shimmer, Lo-fi Chimes, Island Tremolo |
| Drums, timpani | Tight Room, Big Hall Hits, Lo-fi Break, Dub Space, Crunch |
| Voice, choir | Studio Vocal, Cathedral Choir, Robot Choir |

Everything was tested offline with the real Tone.js against stand-in sounds, because the real instrument samples can not be downloaded from the build machine (91 candidates, 4 renders each). Rejected: Rhodes-style "Chorus Dream", "Funk Wah" on most instruments (it pushed peaks over the limit), "Chamber" on strings and a few more that sounded like another preset or like the dry sound.

Please try the violin again, then a few others, and tell me which ones still sound too alike or too much.

## v1.79.7 - Presets for each type of instrument

Every instrument now shows its own sounds on its picker page: **Studio** plus 3 to 5 presets made for that type of instrument. The generic presets (Lo-fi, 80s Synth, Funk Machine, Guitar Sweep, Dreamy Hall, Warm Tube and the rest) are still there under "More sounds".

| Type | Presets |
|---|---|
| Piano, harpsichord | Concert Hall, Warm Felt, Bar Piano, Tape Keys, Dreamy Piano |
| Electric piano | Rhodes Tremolo, Chorus Dream, Warm Drive, Slap Echo, Neo Soul |
| Organ | Cathedral, Rock Organ, Gospel Warm |
| Accordion, harmonica, bagpipe | Cafe Room, Blues Harp, Wide Squeeze, Folk Hall, Wobble |
| Synths, keytar, chip, EDM | 80s Chorus, Sweep Lead, Wide Pad, Arp Echo, Gritty |
| Electric / distorted / jazz guitar | Edge of Breakup, Crunch Lead, Funk Wah, Ambient Swell, Surf Spring |
| Acoustic guitar, banjo, sitar, harp, zither | Studio Wood, Shimmer Stereo, Nashville, Cavern |
| Bass | Tight Studio, Drive Pick, Fretless Chorus, Dub Echo |
| Violin, cello, double bass | Concert Hall, Warm Section, Chamber, Folk Fiddle, Haunted |
| Trumpet, trombone, horn, tuba | Big Hall, Warm Section, Jazz Club, Fanfare, Mariachi Slap |
| Sax, clarinet, bassoon | Smoky Club, Breathy Hall, Late Night Echo, Gritty Tenor, Wide Section |
| Flute, pan flute, ocarina, whistle | Open Air, Folk Hall, Breathy Lo-fi |
| Mallets, bells, music box, kalimba, steel drum | Glass Hall, Music Box Echo, Dreamy Shimmer, Lo-fi Chimes, Island Tremolo |
| Drums, timpani | Tight Room, Big Hall Hits, Lo-fi Break, Dub Space, Crunch |
| Voice, choir | Studio Vocal, Cathedral Choir, Ethereal, Slap Back Retro, Robot Choir |

How they were tested: all 12 existing presets plus 80 new candidates (69 passed) were rendered offline with the real Tone.js against a stand-in sound for each of 15 instrument types (about 520 renders). The real instrument samples can not be downloaded from the build machine, so the stand-ins are synthesized voices with the right character (a plucked string for guitar, a slow-attack saw for strings and so on). Each preset's loudness was matched to the dry sound (the trim in the table is measured, within 1.5 dB), and presets whose peaks jumped more than 3 dB above the dry sound were dropped. Those were mostly the long-echo versions on loud sustained sounds: Rotary Slow / Fast on organ, Funk Wah on bass, Dreamy Flute and Canyon Echo on flute, Cinematic Swell on strings, Clean Chorus on electric guitar and Campfire on acoustic guitar.

What this does NOT prove: nobody has listened to these on the real samples yet. Please try them and tell me which ones sound wrong, and I will change or replace them.

1. Setup tab > Browse instruments > pick any instrument > tap each sound.
2. Check the volume stays about the same from sound to sound.

## v1.79.6 - New instrument picker with favourites

1. Setup tab, Instrument section: a card shows your current instrument with **Browse instruments** and **Favourites** buttons (the old list is under "Show the classic list"). The performer's instrument button and the phone's favourites screen ("Browse all instruments") open the same picker.
2. Pick a family tile (Keys, Synths, Guitar & Bass, Strings, Brass, Woodwinds, Mallets & Bells, Drums & Perc, Voices, or Everything). Filters sit at the top: collection chips, type chips, and a search box that looks through every instrument. **Back** steps up one level.
3. Tap an instrument: it plays a short phrase. On its page tap **Studio**, **Guitar Sweep**, **Dreamy Hall** or **Warm Tube** to hear it with that sound (the other presets are the small chips below). Prev / Next flips through the list.
4. Tap a numbered slot to save instrument + sound as a favourite. Slots are the same 1-9 hotkeys as before, and loading one now also restores its sound.
5. **Favourites** tile: tap a slot to play it, or Remove it.

## v1.79.5 - Auto level for playing along with songs

1. Open the Volume panel. There is a new **Auto level** button with three positions: **Blend** (sits inside the track), **Lead singer**, **Solo** (cuts through).
2. Start a backing track, turn Auto level on and play a few notes. Your Keys volume moves by itself to sit at the chosen spot against the song. The line under the buttons shows what it is doing.
3. Switch to a much quieter or louder song: your volume follows within a couple of seconds. It only changes between notes, never mid-note.
4. Drag the Keys slider while it is on: that becomes your new offset, and it keeps it from then on.
5. It learns each instrument's own loudness from the notes you play, so a loud synth and a quiet flute both land in the right place. The first few notes of a new instrument are a rough guess.
6. YouTube audio can not be measured from the page, so Auto level only works with uploaded tracks and video files.

Tested with real Tone.js: a -26 dB song brought the Keys to 23%, a -8 dB song pinned it at the top, and Solo sat about 4 dB above Lead singer.

## v1.79.4 - Effects: why the wah sounded bad, and 3 tested presets

**What was wrong.** I rendered every preset offline (a plucked guitar, a strummed guitar and a saw synth) and measured it. Anything with the auto-wah came out about 9 to 10 dB louder than the dry sound and clipped (up to 4% of the samples), because the wah had a built-in 20 dB boost. That's the harsh, loud "sweep". The master limiter doesn't catch it, so anything over full scale just distorts. The crush and lo-fi presets were also 3 to 7 dB louder than dry.

**Fixed.**
- The wah boost is 4 dB now (was 20), with a gentler resonance. This is the biggest change for Funk Machine, Full Board and the Auto-Wah pedal.
- Presets can carry a loudness trim. Funk Machine -4 dB, Full Board -6, Lo-fi Chikk -3, Crushed Lo-fi -3. Touching any effect by hand drops the trim again.
- Presets can set the pedal parameters too (wah range, sweep speed, delay time, tremolo rate). Anything a preset leaves out goes back to the default, so a preset no longer inherits the last one's wah or delay settings.

**3 new presets** (Performance presets list, after Full Board). All three land within about 2 dB of the dry level and peak at least 1.7 dB under full scale.
- **Guitar Sweep:** a smooth auto-wah that opens on every note (200 Hz up about 4.5 octaves), a touch of grit and chorus, a dotted-eighth echo and a small room.
- **Dreamy Hall:** slow chorus, a big hall and a dotted-eighth echo. Good on guitar, strings, keys and pads.
- **Warm Tube:** light tube-style drive, a short slap echo, gentle tremolo and a plate reverb. Adds bite to guitar, keys and brass.

How to check by ear: pick a guitar, tap each of the three presets and play single notes, then chords. The volume should stay about the same as Dry Clean, with no harsh crackle. Try Funk Machine and Full Board too, they should no longer jump in volume.

Page-only change: no Render redeploy needed.

## v1.79.3 - Graphics lab: cleaned up, with a Pixel edit button next to each selection (beta)

Open gfx.html (the Graphics lab).

- **Pixel edit buttons:** a teal **Pixel edit** button sits next to each selection that has pixel art.
  - Animations, Instrument: opens that instrument in the full screen pixel editor.
  - Animations, Prop / object: Keyboard and Mic stand have one (the rest have no pixel art yet, so no button).
  - Animations, Character pose or any Dance: a "Pixel edit this character (beta)" box lists hair, hat, face, extras, top and bottoms, each with its own Pixel edit button.
  - Pixel Editor tab: **Full screen** next to Part and Which.
  - Press **✕** in the full screen editor to come back to where you were.
- **Clean up:** the lab now looks like the game (pixel type, square bevelled buttons, flat panels, no emoji). Each selection has its small label above it. The share box text is tucked away behind **Text**; Copy changes still works.

How to check: Animations, pick Instrument, press Pixel edit, draw a pixel, press ✕, and the instrument shows your edit. Then Character pose, press Pixel edit next to Hair.

Page-only change: no Render redeploy needed.

## v1.79.2 - Main menu: the last non-pixel bits

- The button icons (play, dance, palette, piano, check, back) are now little pixel icons drawn in the game's own style, replacing the emoji.
- The small lines under each button, the Room Code label and box, the Enter Venue button and the server badge (Render / self-hosted) now use the pixel font with square corners. The server badge got a square pixel dot instead of the emoji.
- The name box no longer shows the red spell-check underline.

How to check: open the main menu on a phone, then Join game and Back. Nothing should be rounded or in the plain system font.

Page-only change: no Render redeploy needed.

## v1.79.1 - Phone instrument: the circle can't get stuck

- Fixed: on iPhone the circle could stay stuck on one note, and pressing again did nothing, when the "finger up" never arrived (a system swipe, switching apps, a call). Now a new press always takes over, and everything is let go when the screen loses focus, the phone turns, the page is hidden, or the last finger lifts anywhere on the screen. The zones get the same protection.

How to check: hold the circle, swipe up from the bottom edge or pull down the control centre, come back: no note should be stuck. Press the circle again and it should play.

Page-only change: no Render redeploy needed.

## v1.79.0 - Phone instrument in pixel art, with your character on stage

Open the phone instrument (main menu **Instrument**, or the phone button on the performer page).

- **Your character plays in the middle**, between the zones and the circle, holding the instrument you picked and playing each note as you touch it. From the main menu it's the character you made there. From the performer page it's your stage character. Switch instruments from the top and the character swaps to match: a keyboard has you behind it, a violin or trumpet goes up to your chin, drums and sections bring the band along.
- **The stage:** a lit pad under the character's feet, a spotlight that takes the colour of the note while it plays, little stage lights on top that flash faster while you play, and square pixel sparks on each new note. It redraws when you turn the phone.
- **Pixel buttons everywhere:** the five zones are chunky bevelled blocks in their colours, the top bar and mode chip use the same bevelled pixel buttons as the rest of the game, and the circle uses the pixel stick and knob from the games. The note name moved to the top right of the stage so it never covers the character. The mode chip (Sustain / Impact / ...) is top left.
- Portrait: the stage gets the whole top, the zones and circle sit underneath.

How to check: tap each of the four quadrants, hold a zone, change octave, tap the instrument button and pick a few different ones (piano, drums, harp, trumpet, a string section). The character should always be in the middle and not covered by the note name.

Page-only change: no Render redeploy needed.

## v1.78.0 - Menu extras that missed v1.77.0

These were pushed to #109 after it was merged, so they never reached main.

- **Instrument:** opens the phone instrument (index.html?instrument). It starts behind a big START PLAYING button because phones need a tap before they'll play sound. The ✕ in the instrument brings you back to the menu.
- Your name is saved on this device as you type it, so it's still there after a reload, after practice, or after coming back from the instrument.
- **iPhone:** the fullscreen button is hidden on iPhones, where Safari can't do fullscreen. That covers the audience page, the performer page and the phone instrument. Leave practice moves into its spot. It's also hidden in the Home Screen app, which is already fullscreen. Android, iPad and computers keep the button.
- **Character maker:** the turn buttons and dragging now step through all 8 directions, diagonals included (was 4).
- **Character maker, Male / Female / Both:** a new Style switch at the top. Male hides the women's hairstyles and the skirts. Female hides the men's hairstyles and the facial hair (moustache, beard, goatee, stubble). Both shows everything. Unisex styles show either way. If your current pick doesn't fit when you switch, it moves to the next one that does. Surprise me follows the switch too, and the choice is remembered on this device.
- **Practice buttons:** next to the stick there's now **Free dance**, which starts free dancing right away, and **Start game** (pink), which opens and closes the mini game menu. Start game hides while a round is running. At a live show the button still just says Dance.
- The character on the menu is a size smaller and sits lower, so hats aren't cut off.

Page-only change: no Render redeploy needed.

**Test it:** check the main menu has four buttons (Join game, Practice, Character, Instrument). Type your name and reload: it should still be there. On an iPhone, check the fullscreen button is gone. In the character maker, check the turn buttons go round 8 directions and the Male / Female / Both switch works. In practice, check for the Free dance and Start game buttons.

## v1.77.0 - Main menu

- The first screen is now a main menu. Your character dances on a little stage and turns through all 8 directions, with your name under it and three buttons:
  - **Join game:** goes to the room code screen, then Enter venue.
  - **Practice:** goes straight into the practice zone, with no reload.
  - **Character:** opens the character maker. Done brings you back. Tapping your character on the menu also opens it.
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

## v1.79.10 - Half pipe: closer camera, less turning
- The camera is in tighter: skaters and boards are drawn 50% bigger, the walls are taller and the pipe fills the full width of the screen.
- Less turning: everyone keeps facing the stage instead of flipping left and right at each wall, the board tilts only a third as far up the walls, and the leaning pose is calmer.
- In-air spinning (left stick) is unchanged, since the tricks depend on it.

**Test it:**
1. Open venue.html?practice, run the half pipe test (`ukPipeTest(3)` in the console), on a computer and on a phone.
2. Watch yourself swing from wall to wall: you should stay big, face forward, and the board should only tilt slightly.
3. Do a trick and spin in the air with the left stick: spinning and landing still work.

## v1.79.11 - Phone: no stand-in name tag, how-to-play text fades
- Practice mode no longer puts a "Stand-in" name under the performer.
- On phones, the how-to-play lines in the mini games (mosh, roller rink, keepy uppy, dance walk, half pipe, ski, capture the flag) now wrap to fit and fade out after about 6 seconds. The round description under the round title fades too, except when it's your turn.

**Test it:**
1. On a phone, open venue.html?practice and start each mini game.
2. The hint text should be readable for a few seconds, then disappear and leave the play area clear.
3. Leave practice: the performer should show no name tag.

## v1.79.12 - How-to-play card before every minigame
- For the last 15 seconds of a round's countdown, a card covers the screen with a looping pixel demo of the game, a one-line goal, **How to play** (touch or keyboard, depending on your device) and **Rules**. A bar shows how long until it starts. The last 3 seconds go back to the big 3-2-1-GO.
- Covers Step dance, Target dance, Note highway (7 and 4 keys), Free dance, Mosh pit, Roller rink, Ice rink, Keepy uppy, Mars Rally, Dance walk race, Half pipe, Ski and Capture the flag. Battle rounds add a line about the knockout.
- **Skip ✕** closes it for that round.
- Countdowns are now at least 18 seconds (15 for the card + 3 for the count): the Countdown setting on the performer page and in practice is 18, 25 or 30 s. Songs in a timed set keep the countdown the set gives them (the card shows for as much of it as fits).

**Test it:**
1. Practice → pick a game → Start game. The card should appear straight away with the demo animating, then clear at 3 seconds for the count.
2. Try a few games, on a phone and a computer. Check the demo matches the game and the text fits without scrolling on a phone.
3. Tap Skip ✕: the card goes and the countdown carries on.
4. Console: `EXPLAIN.show("pipe")` shows any game's card without starting a round.

**Update (same version): the card no longer covers the performer.** It sits below the stage, so the performer stays in view when a game starts partway through a song (the second game in a set). On a wide screen it lays out as demo on the left, text on the right. The round title strip is hidden while the card is up.

## v1.79.13 - Ski: smaller skier, bigger mountain, swoops lined up with the next flag
- The skier is drawn smaller and the mountain (trees, flags, ramps, snow) a bit bigger. The skis stay full size.
- **Flags lined up with the swoops.** A swoop fires you out toward the flag's own side, so the next flag used to be behind you. Now the flags are spread so the run from one swoop to the next is a **45-65 degree line, random for each flag**. Red flags are passed on their left and sit on the left, blue are passed on their right and sit on the right, so the swoops send you across the course in a zigzag.
- Each flag zone opens with 5 plain flags at a fixed 50 degrees on a straight line, 210 apart. The flag zone is straight all the way and longer (1600), then the line eases back into the wave for the jump zone.
- Server change: the ski bots follow the same straight line. **Redeploy Render.**

**Test it:** practice → Ski. Land in a red swoop: you should be fired out toward the next (blue) flag's swoop, then back across to the next red, at a slant, not sideways. Check the skier size on a phone.

## v1.79.14 - Ski: bigger, longer jumps, and a hop at the end of the ramp jumps higher
- Ramps are drawn bigger and spaced further apart (420 instead of 230), and the jump zone is longer to fit them.
- Jumps are longer and higher: the plain ramp jump is about 1.5 s of air (it was about 1.1 s).
- **Hop while you're on a ramp** to take off from it. The nearer the lip, the bigger the jump: up to about 1.5x the air time and 1.9x the height. Late on the ramp you get **PERFECT JUMP!** and 100 points; the middle is **BIG AIR!**. Roll off the end without a hop and you get the plain jump.
- Tuning lab: Ski, Ramp air time is now 1.3 s (it was 1.0).
- Server change: the ski bots use the new zone length. **Redeploy Render.**

**Test it:** practice → Ski, in a jump zone. Roll up a ramp and tap HOP at the start, middle and very end: the jump should get bigger each time. Skip the hop and you still get a decent jump.

## v1.79.15 — half pipe overhaul
- Phone: camera follows you so only the pipe side you're on shows; skater faces 8 directions when moving diagonally.
- Skater pushes off with a foot on the flat; crouches (angle locked) from the incline line until leaving the ground.
- Left stick = power/height (quicker work = higher jump); a gauge each side shows jump strength; power resets after each jump/bail. Jumps and skating are slower.
- Grind: hold right stick down (or up) as you reach the lip, slide along the rail, balance with the left stick, flick right stick sideways/up for moves, release to hop off. Falls off past the red zone.
- Check: practice pipe test, hold right stick down at the lip → BALANCE meter, points; super meter resets on use.

## v1.79.16
- Half pipe camera no longer clamps to the pipe edge while airborne/grinding: skater stays centred mid-jump.

## v1.79.17 — half pipe controls
- Left stick steers only. Press the right stick at the yellow incline line to crouch; flick it at the lip: flick = trick, flick speed = height (no crouch = weaker jump). Side gauges show flick strength live and launched strength in the air.

## v1.79.18
- The "Round N · title / Leading: …" strip fades out when a normal round starts (still shown for free dance, battles and the join prompt).

## v1.79.19
- Kart: Speed -/+ box removed from the game screen (Tuning lab still sets it).
- Practice: top "Leave practice" button hidden while a minigame is on (the bottom STOP does the job).

## v1.79.20
- Practice minigames: the "Viewers: N" counter is hidden (players on screen are untouched).

## v1.79.21 — kart laps
- Race is 5 laps: counter shows LAP n/5, banners "3 LAPS TO GO", "2 LAPS TO GO", "FINAL LAP!", "FINISH!"; lap points stop after lap 5.

## v1.79.22
- Kart rounds inside a show end after about 90 s of racing (other games unchanged).

## v1.79.23 — free dance sticks
- Left stick walks you around the floor while the dance loop keeps going (WASD on a computer); the dance reads the same stick so the footwork follows.
- Right stick (arrows) is the per-dance control; help text for every dance now says what it does.
- Shuffle: right stick UP = step up on toes with high knees, DOWN = low stomp, sideways = arms; left stick sets slide direction and speed.
- Test hook: ukFree(i).

## v1.79.24
- Free dance: dragging a dot out of its ring no longer tears it off to hover over buttons; dances and sub-moves are picked by tapping their buttons.

## v1.79.25
- Free dance: the dancer only turns to face the walking direction when the left stick is pushed right to its edge (others see it as full-pace movement); otherwise they keep facing front and just slide.

## v1.79.26
- Free dance: small buttons above the dots — 180 (half turn and back), 360 (fast full turn with a hop), Spin move (low spin, arms out). Keys Z / X / V. Server accepts the new reactions (redeploy Render).

## v1.79.27
- Half pipe: one FLICK meter (right side). Starts empty, only fills as the right stick moves (faster = more), sets jump height, holds in the air, resets on landing/bail.

## v1.79.28 — eight-way right stick in free dance
- Every dance except Robot, Worm and Puppet (which read the stick directly) has 8 named moves on the right stick (up, up-right, right, down-right, down, down-left, left, up-left); push it out past about half and the move name shows above the buttons. A light push still works as the dance's own control.

## v1.79.29 — more rhythm on touch screens
- The two-thumb chart rule is looser: off-beat steps (quarter-beat grid) stay in, minimum gap about half a beat (190 ms floor), and holds only count as busy thumbs: a hold plus one single arrow, or two holds, but never more than two presses at once. On a synthetic dense chart the notes kept went from 99 to 193 with the maximum still 2.

## v1.79.30 — one chart for everyone
- The two-thumb chart rule now applies to every player, phone or computer, so a round's notes are identical for all (checked: touch and non-touch give byte-identical charts at all three levels).

## v1.79.31 — first place bonus
- First place in a round gets +50 show points on top of the usual 1,000 split (ties for first all get it; needs a score above 0). Battles: the winner of the bracket. Works in practice too. Needs a Render redeploy (server.js).

## v1.79.32 — show leaderboard
- A small STANDINGS panel (top right, tap to shrink) stays up all show with points and ▲/▼ moves since the last round; hidden inside minigames. After each round a toast says who took the lead and who passed who ("Moth takes the lead!", "Phyl passed Rook for 3rd"). Test: ukTotals([...]) twice with different orders.

## v1.79.33 — phone keyboard buttons like the real keyboard
- Phone play screen, left side: two small buttons on top (E and 3, same as Space+E and Space+3), then a peanut: top half = D, bottom half = Space, the waist = both (Space+D). A finger on each half also counts as both, and you can slide between halves to change level. Root (no finger) is unchanged.

## v1.79.34
- Practice: the viewer count is gone, and Leave practice moves into the bottom stack with Dance and Start game, all hugging the right edge. Still hidden while a minigame is on.

## v1.79.35 — real 3D spins
- Spin, Twirl, 180, 360 and Spin move now turn the dancer through all the facings (front, three-quarter, side, back) instead of squeezing flat like paper.
- Your own spin keeps going if you swing the right stick round in a circle (either way; faster swing = faster spin, up to a cap). Let go and it slows and lands facing front. Other players see the button spin only.

## v1.79.36 — hand joysticks, 15 s centre turns
- Free dance: two small hand rings sit above the big sticks (left hand / right hand). Hold one and that arm follows your finger (down = hanging, side = out, up = overhead; across the body works too) while the legs and body keep doing the selected dance. Let go and the arm goes back to the dance. Other players see it.
- Centre turns: each dancer gets 15 s in the middle with 4.5 s between turns, first dancer is called 15 s ahead, and everyone gets two turns when the song is long enough. Free dance rounds already take the whole song.

## v1.79.37 — free dance takes the whole song
- Picking Free dance (alone or with another game) now always plays free dance for the whole song, never sharing it with a second minigame, so every dancer gets two centre turns when the song is long enough. Before, with Free dance as the second pick the first game was the one that ran.

## v1.79.38 — the circle and the planner
- Free dance turns: once the turns are fixed (8 s in) everyone forms an oval on the floor with a gold dashed outline and a "NEXT IN" marker at the top. Whoever is due north walks into the middle for their 15 s, walks back, the whole ring turns one place left, and the next dancer walks in.
- While you wait, the bottom half of the screen is your planner (the sticks come back for your turn): "You're #3 of 8 · turn 1 of 2 · up in 0:44", and the first dancer gets "YOU'RE FIRST · you start in 15 s. Plan your moves!". Pick up to 3 dances and moves, reorder with the arrows, remove with the cross. 1 pick = 15 s, 2 = 7.5 s each, 3 = 5 s each. Picking a dance shows it live on your own dancer.
- Needs the server redeploy (turn timing, ring order sent to late joiners).

## v1.79.39 — start in the Two-step, planner only once the circle forms
- Free dance no longer has the blank Freestyle option: you start in the Two-step and the dance list begins there. Number keys 1–9 pick Two-step … Shuffle, 0 Thriller, then - = ] [ \ ' for the rest.
- Before the circle forms everyone just free dances with the sticks. The planner appears when the circle forms (7 s before the first turn); only the first dancer is called into it early, 15 s before their turn.

## v1.79.40 — no walking to the bottom from the controls
- Free dance: tapping the floor in the lower half of the screen (where the sticks, dance buttons and planner are) no longer walks you there. A tap that just missed a button used to send your dancer to the bottom edge.

## v1.79.41 — no "Add this move" on the sticks screen
- The "Line up moves for your turn / Add this move / Clear" strip is gone from the stick controls; moves are planned in the planner panel. If you have planned moves, a small "Your turn plays:" list shows them during your turn.

## v1.79.42 — 180 keeps you turned, lighter from behind, pixel pass 2
- The 180 button turns you round and you stay facing away until you press 180 again (other players see it too). Spin, twirl and 360 start from whichever way you face.
- The lighter / phone light is drawn in the correct hand when you face away (it floated off to the side before).
- Pixel pass: the practice picker, the round banner, leaderboard panel and toasts, top-left HUD, hints, free dance help text, planner, sticks and hand rings (now the pixel stick art, not smooth circles) all use the pixel font and square corners.

## v1.79.43 — spinning is locked in place
- While you spin (Spin, Twirl, 360, Spin move) the right stick only keeps the spin going; it no longer drives dance moves, lifts or bounces, so the dancer stays put and just turns. Spin move no longer hops.

## v1.79.44 — bending down keeps the dance; scroll-wheel zoom
- Pushing the right stick down / down-diagonal (a bend) keeps the dance's own arm and leg motions (hands on knees stays hands on knees) and just lowers the body with bent, slightly wider knees. Before, it swapped to a generic arms-out pose.
- PC: the scroll wheel zooms the venue floor in and out (up = in, down = out, up to 2.6x). Taps and clicks still land where you point. Remembered between visits. Works in free dance and on the plain floor; other minigames keep their own cameras.

## v1.79.45 — YouTube: not clickable, ads handled before the game starts
- Audience screens: the YouTube overlay can no longer be clicked (no pausing, seeking or clicking through to YouTube). It only becomes clickable while a phone needs its one tap to allow sound.
- Audience ads: the host now tells the room the song's real length. If a screen's video is a different length (an ad), it is hidden and muted with "Ad playing · the music joins when it ends", then unmutes and syncs to the beat.
- Host: picking a YouTube song now loads it muted and hidden first, so any ad plays then. The Now Playing bar says "An ad is playing (muted and hidden). Waiting for it to finish…" and then the song is parked at 1 s. The countdown/game starts only once it is ready (45 s at most), and the song then unmutes and starts from 0.
- NOT tested against real YouTube from the build machine (no network): try one song with an ad on both host and phone.

## v1.79.46 — the big screen always shows the notes and the visualizer
- Host: the visuals stream to the venue's big screen now runs outside jam mode too (jam visualizer behind the note roll), so it no longer falls back to just the YouTube video. Needs sound sharing on (Go live → share tab).
- Venue: if the performer's visuals still aren't arriving while a video is on the big screen (sound sharing off), a note roll is drawn over the video from the notes the room hears.
- Check: go live without opening jam mode and play; the big screen should show the visualizer with notes, not the video.

## v1.79.47 — new shades (graphics defaults)
- Brian's graphics-lab export is now the shipped look for everyone: stage lights (brighter, wider, faster beams, hazier, purple/indigo/mauve/red colours, stronger floor and sign glow), the Two-step bob tweaks, and the purple hair:12 and shades (extra:1) pixel edits. Anyone who has saved their own values on a device keeps those on top.

## v1.79.48 — missed pixel assets
- The STREAK pop-up ("10 STREAK!") is pixel font with a pixel-drawn bolt (flame from 50) instead of emoji; the streak aura/lightning is drawn chunky-pixel.
- All remaining canvas text (scores, combo/judge, pops, tug of war, names, NEXT IN, kart HUD) and the game HUD CSS (score/combo/banners/hints/buttons) now use Silkscreen; emoji icons on score HUDs and banners removed.
- Check: hit a 10 streak in a rhythm minigame; look at each minigame's score text. Silkscreen is wider, so watch for text overflowing buttons.

## v1.79.49 — same track for everyone
- The round's notes now follow the round's shared clock whenever this device's own sound clock drifts more than 4 s from it (slow phone, stalled sound stream), instead of waiting on the bad clock, so nobody gets an empty highway or starts late.
- Check: join a round on a throttled phone; the notes should start with everyone else's.

## v1.79.50 — three preset banks; dark dropdown lists
- The 9 numpad instrument slots (with their FX presets) now come in 3 banks. PC: Num Lock = bank 1, / = bank 2, * = bank 3 (the visualizer random/alt keys on * and / are gone; F5 still cycles). Mobile: a 1/2/3 picker in the top bar. Setup > Presets also shows 1/2/3. Bank 1 is your existing slots.
- Dropdown option lists get a dark background with white text (were white on white).
- Check: set slot 1 in bank 1, press / and set a different one, press Num Lock to go back; reload and confirm all three kept.

## v1.79.51 — pixel editor: one click, one pixel; Brush tool
- Pen/Erase always change exactly the pixel you click. The extra pixel beside it was Mirror (left/right) being on: it paints the mirrored copy, which sits right next to the centre column. With Mirror on, the copies now show as yellow boxes before you click.
- New Brush tool (pixel brush cursor, sizes 1-6, round-cornered from 4) in both the side panel and the full-screen bar.
- Check: Mirror off, click a pixel at the centre line: only that pixel changes. Pick Brush, size 3: a 3x3 dab.

## v1.79.52 — pixel editor: Shift all
- New "Shift all" arrows (up/down/left/right) in the pixel editor, side panel and full screen bar: the whole part, original art and your paint together, moves one pixel. Pixels pushed off the edge are lost; Undo (right click) puts it back.
- Check: open a part, press up: the whole thing is one pixel higher; down returns it.

## v1.79.53 — pixel editor: right click erases
- Right click (and drag) rubs out pixels in the pixel editor; right click no longer undoes. Ctrl+Z undoes, Ctrl+Shift+Z redoes. (With a curve open, right click still drops the curve.)
- Check: right click a pixel: only it disappears; Ctrl+Z brings it back.

## v1.79.54 — AFRO! (new pixel edits, on every angle)
- Shipped Brian's new pixel edits: the afro (hair 5: dark outline and blue crown band), the blue pixel on hair 3, and the new shades (extra 1). The stage lights and dance tweaks in that export were already the shipped values.
- Pixel paint used to show on the front view only. Hair and hat paint (from the forehead up) now also shows on the side and back views (squeezed to the side head's width), glasses/extras paint shows on the side view, and the front three-quarter view shifts the paint with the head. Faces, clothes, arms and legs stay front-only. This applies to any paint, so future edits carry across angles automatically.
- Check: put on the afro and the shades; turn the dancer round (left stick all ways): the blue crown band and shades should read from the side, back and three-quarter views.

## v1.79.55 — pony tail (hair 6) on every angle
- Shipped Brian's pony tail edits (hair 6: blue hair band, trimmed tail). The paint is carried to the side view (tail hangs behind the head) and back view (tail swaps sides, as the back view draws it) as well as the front. Same for the long-hair lock pixel (hair 3).
- Check: pick the ponytail, spin the dancer: band and tail should match from the side and back.

## v1.79.56 — performer can play the round
- Host page: new "Play round" button (next to Dance). While live it opens your own room as a player in an overlay (auto-joins with your stage name, muted so your backing track is the only sound), so you play the minigame instead of your instrument for that round. "Back to instrument" closes it; your instrument keys go to the game while it's open. Not live: it says to go live first.
- Check (needs a live room): go live, start a round from a second device, press Play round, play, close it and confirm the instrument works again. Untested here: the live join itself (no server on the build machine).

## v1.79.57 — Shift all no longer bakes the part
- Shift all used to copy the whole rendered part (including its outline and the current hair colour) into your paint, which gave the thick double outline. It now keeps a shift offset with the part: the original art moves with its own colours and outline, and your paint and holes move with it. Applies to hair, hat, face, extra, top, bottom (other parts shift their paint only). On the side and back views only the up/down part applies.
- If a part was already shifted with the old version, undo (Ctrl+Z) or use Redraw/reset on it.
- Check: open the afro, press up: it moves one pixel with the same single outline; down puts it back.

## v1.79.58 — game panel: no more size jumps, see-through
- The panel's score line (Score · Combo · Best) wrapped onto a second line when the numbers got long, which made the whole panel grow and jump. The line now has a fixed two-line height and a smaller font, so the panel never changes size.
- The panel background is more see-through (and no longer blurred), so the dance floor and the other dancers show through behind the lanes.
- Check: play a round to a big combo/score: the panel stays put. Dancers and floor are visible behind it.

## v1.82.182 — The Big Sweep: big inflatable bonuses, a variety; renamed

1. The supermarket game is now called **The Big Sweep** everywhere (menus, vote panels, practice, the start banner, the how-to-play card).
2. Inflatable bonuses are big: standing on the floor, more than half a player's height, swaying a little, each with a white BONUS tag. Nine kinds, four picked at random each game: a giant banana, soda bottle, turkey, cheese wedge, a shaggy grey dog, a lavender bunny, an eagle, an ice-cream bar and a chocolate bar.
3. You carry the bonus over your head (same size) while you run it to the front.

## v1.82.181 — Supermarket sweep: the hand-off animation

1. Taking something off a shelf with your cart parked by you: both arms reach out to the item, bring it in to your chest, then you turn and toss it in an arc into the basket. It lands in the cart at the end (the cart shows it then).
2. It works wherever the cart is: beside you, behind you, below you, ahead of you, diagonal. The arms and the way you face follow the item the whole way. Any item works (turkeys, cheese wheels, snacks, salami…).
3. Too far from your cart: the same reach, then the item goes up over your head to carry. Dropping a carried item in the cart: it comes down from over your head, then in.
4. Bonuses: the reach, then up over your head.
5. Hold GRAB to sweep a spot: one smooth hand-off after another. Practice bots do the same hand-off into their parked carts.

## v1.82.180 — Supermarket sweep: bonuses are run to the front by hand

1. GRAB an inflatable bonus: it always goes in your hands (even with your cart parked right there) and you carry it over your head: "🎈 GOT A BONUS → RUN IT TO THE FRONT!". Your cart stays where it is.
2. Run it to the front of the store (the checkouts or the host): it's turned in automatically, the host cheers, "🎈 BONUS TURNED IN! (REVEALED AT THE END) · BACK TO YOUR CART". Then go back to your cart.
3. You can't put a bonus in the cart; pressing GRAB anywhere else while carrying one reminds you to run it to the front.

## v1.82.179 — Fishing: power wheel instead of the BPM meter

1. Reeling a fish in: the BPM box is gone. The reel's outer ring is now a **power wheel**: it fills clockwise as you wind faster (blue, then green = full power), with a **red zone** at the top end.
2. Winding faster reels the fish in faster, up to full power. Winding into the red strains the line (tension climbs, "⚠ TOO FAST"), and staying there snaps it. Winding slowly eases the line off.
3. It no longer depends on the song's tempo. The screen-edge flash still pulses on the beat, coloured by your zone (green good, blue slow, red too fast).

## v1.82.178 — Supermarket sweep: cart swap, 5 per spot, 5 of a kind per cart

1. Every spot on the shelves (and each deli spot) holds **5** and shows "×5"; each one you take counts it down, and a spot swept clean stays empty (no restock). Holding GRAB by a parked cart sweeps the whole spot in, one after another.
2. A cart takes at most **5 of any one item**. A 6th: "5 SNACKS IS THE LIMIT · TRY ANOTHER AISLE". So a cart needs a few different aisles.
3. **Cart swap**: push your cart into the checkout and it's stored, full, in a row along the front of the store; you get an empty one ("CART SWAP!").
4. Practice bots only go for spots with stock left and take from them too.

## v1.82.177 — Supermarket sweep: hands on the handle, park to load, the host, a real-looking store

1. Pushing a cart, both hands are on the red handle bar in every direction: pushing down the bar is at your waist with the cart in front of you; side on the handle post is in your hands with the basket at hip height; pushing up the cart sticks out ahead of you. No bouncing on the beat while pushing, so your hands never slip off.
2. **You can't load a cart you're pushing.** Pushing, press GRAB: you park it ("PARKED · GRAB TO LOAD IT"). Then GRAB by a shelf with the parked cart right beside you sweeps the item into it (hold GRAB to keep sweeping). Too far from the parked cart and it goes in your hands instead. GRAB (or CART) by the cart, away from a shelf, takes it again.
3. Practice bots park beside the shelf while they grab too. Other players' parked carts now show for everyone (needs the server redeploy).
4. The host: a man in a purple sweater (teal collar, jagged pattern) by the checkouts, clapping; every cart banked (yours or anyone's) he jumps with his arms up and shouts ("WHAT A SWEEP!").
5. The store: polished pale floor with the lights shining down each aisle; shelves stocked both sides with rows of products, shelf edges and price tags, and a tall end cap showing its shelves at the front; numbered aisle signs with red-and-white diamonds; a pink back wall with department signs, diamonds and plants; a white glass deli case; white chest freezers with glass lids; a white meat case with a red kick plate.

## v1.82.176 — Supermarket sweep: life-size store, real carts held at the handle, sweatshirts

1. Supermarket sweep on a phone: the camera zooms in close and follows you; the store is life size (bigger than the screen). Aisles are about three people wide; products, carts and people are to scale. On the TV the whole store fits the screen.
2. Everyone wears a long-sleeved sweatshirt in their own shirt colour (and no instrument on their back).
3. The cart is a real cart: wire basket with mesh and a bright rim, the folded child seat, the red handle bar, frame and wheels. You hold it at the handle with both hands. Pushing up an aisle it's ahead of you; pushing down it's in front of you (over your legs, wheels showing); side on it's long with its side panel.
4. Grabbing takes a moment: you stop, turn to the shelf and sweep your arm. **Hold GRAB while pushing along a shelf** and you keep sweeping things into the cart, one after another.
5. Carts hold more (24) so they take longer to fill. Practice bots take longer per item too.
6. Labels and pop-ups are sized for the zoom.

## v1.82.175 — TV practice off the phone menu

1. Phone / tablet main menu: no TV practice button.
2. A computer (mouse or trackpad): TV practice is still there.

## v1.82.174 — Bots: wander after a game, talk less, chat stays out of the log

**Needs a Render redeploy** (bot chat flag + chat timing on the server).

1. Practice: after a game ends, the practice dancers walk around the dance floor at a walking pace (to a spot, hang there a few seconds, walk on) instead of standing where the game left them.
2. In a room with the server's bots: they talk about half as often (each one every 2–5 minutes, rarely at the start of a round).
3. A bot's chat shows as a speech bubble over them only; it doesn't go into the chat Log. Real people's chat still goes in the log.
4. Fix (from v1.82.172): every game's countdown card threw an error after Supermarket sweep was added. Rounds start normally again.

## v1.82.173 — Dungeon: sword and shield in hand the whole time

1. In the dungeon you always hold the sword (blade down, in the right hand) and the shield (on the left arm, at your side), in all 8 directions, walking or standing.
2. Hold **BLOCK** (E): the shield comes up in front. Spiders that hit you from the front glance off (CLANG!, no heart lost); from behind they still bite.
3. Swinging and the spin attack work as before (the sword leaves the rest pose for the swing). Rolling and being down hide them for a moment.

## v1.82.172 — New minigame: Supermarket sweep 🛒

**Needs a Render redeploy** (the server has to know the new game).

Practice → pick **Supermarket sweep** (Ride group), or it turns up in game votes.

1. The floor becomes a supermarket seen from above. Everyone starts at the front with a cart.
2. The store: the **deli** across the back (cheese wheels, cheese blocks, jumbo salamis hanging over the counter); the **meat case** down the far right (turkeys, beef, chicken) with the **freezer** next to it (frozen turkeys, pizza, ice cream); the **coffee** aisle next (with the red **coffee grinder**); the **snacks** aisle next (with the **candy bar** bins); grocery and health & baby (diapers, vitamins) on the left.
3. **GRAB** (button / Space): the item in front of you (it's ringed in gold with its price). With your cart right there → straight into the cart. Otherwise you pop off the cart and carry it overhead → walk back and GRAB at your cart to drop it in.
4. **CART** (button / E): let go of the cart, or take it back.
5. The cart fills by size (turkey 4, cheese wheel 5, coffee 1… holds 16). "CART FULL" → push it into the green **CHECKOUT** lanes at the front: banked, and you get a new cart.
6. **Coffee grinder**: stand at it and hold GRAB 3 s → +$100 (once).
7. **Candy bar**: hold GRAB to scoop (it pours unevenly), let go to weigh. **$0.97–$1.03** → +$100. Over → tipped out, try again. Under → keep scooping.
8. **Inflatable bonuses** (banana, bottle, turkey, cheese) float around the store: grab them like anything else; their prize ($50–$250) is only revealed at the end.
9. **The buzzer**: whatever's still in your cart counts, and the inflatables pay out.
10. Practice bots shop the aisles and bank their carts. Other players' carts show in front of them; when they're carrying something it's over their head.
11. On a phone the checkouts are in the gap between the stick and the buttons, so nothing's hidden under the controls.

## v1.82.171 — Game vote: 20 s after the first, 🎲 Random and a spinning wheel

**Needs a Render redeploy** (the server picks the random game).

1. The first game vote of a show is 25 s; every vote after that (the 2nd song on, and mid-song votes) is **20 s**.
2. Every game vote has a **🎲 Random: spin the wheel** choice (on phones under the six games; on the TV its votes show in the heading).
3. If Random wins, nobody votes, or it's a tie: **the wheel spins**. A gold frame and ▼ arrow hop along the tops of the games, fast then slowing, and land on one (about 3.5 s). A tie spins between the tied games only. On phones the list hops the same way.
4. The landed game then plays: the game waits for the wheel to land before starting.

## v1.82.170 — Party: longer game vote, two games for 2:45+ songs, bots fill to 4

1. The game vote before each song now lasts **25 s** (was 15) — six panels to look at.
2. Songs **2:45 or longer** get two games (was 3:00, so "3-minute" songs at 2:58 got one). YouTube songs whose length isn't known yet get pairs offered; if the song turns out short, just the first game of the pair plays. At a party, the pre-played YouTube copy usually knows the real length already.
3. **Bots**: a party now fills to **4 players** with bots by default (you + 3 bots); they leave as real people join. 🎉 HOST → "BOTS: FILL THE ROOM TO" → Off / 4 / 6 / 8 players (remembered on that phone).
4. The selected show length and bot setting are now highlighted in the panel.

## v1.82.169 — One Host button: just phones, phones + a TV, or a computer

**Needs a Render redeploy** (the party remembers whether there's a TV).

1. Main menu: one **🎤 Host** button (replaces "Host a party" and "Host a room"). It asks for your name first if it's empty.
2. Tap it → choose:
   - **📱 Just phones**: no TV. You land in your room as the host (playing too). Your phone plays the music, so use a speaker. YouTube videos show on everyone's phone, muted (the music comes from yours).
   - **📺 Phones + a TV**: same, and a "Put it on the TV" card pops up: Cast (Android + Chromecast), TV mode (mirror), the TV link to open on the TV's browser, or Later. Videos show on the TV only.
   - **💻 From a computer**: the full show page, as before.
3. Either phone option: tap 🎉 HOST any time to add songs, start the show, end it, or get the TV options again.

## v1.82.168 — Party: YouTube ads play out ahead of time; the host's phone has the sound

1. Host a party. A friend adds a YouTube song while you're jamming: a hidden player on the host's phone starts it straight away, muted, so any ad (even a 3-minute one) plays out by itself while everyone jams. You don't see or hear anything.
2. When that song's turn comes, the same player plays it from the start WITH sound: no new ad, the game starts with the song.
3. Sound: the host's phone plays the music (in TV mode that comes out of the TV). The TV shows the video muted. No "tap for sound" on the TV.
4. If the host's phone refuses to play sound, after ~2 s it switches: the host copy goes muted and the TV plays the sound instead.
5. If the song comes up before its ad has finished, the game holds at the start as before (Ad break), then goes.
6. Only the next YouTube song in the playlist is pre-played at a time; the one after starts its ad as soon as the first begins.

## v1.82.167 — Party: YouTube songs actually play (ads, then the game)

The hidden host copy of the game ran in a 2×2-pixel frame, so its YouTube player was ~2 px and YouTube refused to play it: no ad pre-play, the song never "started", and games waited forever (e.g. the mosh pit stuck on its first move). It now runs in an invisible 480×360 frame behind everything.

1. Host a party, put a YouTube song on, start the show.
2. If YouTube runs an ad: the game holds at the start ("Ad break · back in a moment") and the TV hides the ad, then the song and the game start together.
3. The game (mosh pit or any other) actually runs through the song.
4. Nothing new is visible on the host's phone.

## v1.82.166 — Party: End the show really ends it, background music, YouTube titles, video on the TV only

**Needs a Render redeploy** (server looks up YouTube titles).

1. Host a party, start the show, then 🎉 HOST → **End the show**, mid-song or during the game vote: the song stops, the game round ends, everyone's back to jamming at once. A song that was still in its game vote goes back to the top of the playlist.
2. Jam time (no song on): the normal background music plays from the host's phone (so out of the TV in TV mode). It fades out when a song starts and comes back after, in the breaks too.
3. Add a YouTube link from any phone: the playlist (host panel, Up next, the TV) shows the video's real title instead of "YouTube video".
4. A YouTube song at a party: the video plays on the TV only (with its sound). Phones don't show the video; the hidden host plays it muted to keep time.

## v1.82.165 — Bumper boats: the last boat floating ends the round

1. Bumper boats with 2+ players (or practice bots): knock everyone else off. As soon as only one boat is left, "🏆 <NAME> WINS THE ROUND!" (or "YOU WIN" if it's you) and about 2 seconds later the next round starts: pool refills, everyone back in their boat. No more waiting out the clock alone.
2. If it happens in the final round, the pool refills for another go (the game still ends with the song's game time).
3. The round still ends on the clock if nobody wins it first.
4. Practice bots that fall out now show as out on the bench properly.

## v1.82.164 — The performer always looks like they're playing live

1. Dragon riders, boss fight: the demon at the organ now plays it. No instrument in hand, both hands over the keys, striking on the song's eighth notes (alternating hands, both slam on the accents), head nodding, mouth on the hits.
2. Any song where the performer isn't playing live notes (a backing track, a YouTube song, a party's playlist): the performer on stage plays along on the song's own beat: a phrase walking round the chords, a held note every 4th beat, a quicker fill at the end of every 4 bars. Their band plays along too. (Practice used to be the only place this happened.)
3. When the performer IS playing live, nothing changes: you see their real notes.
4. Between songs (no song on): the performer stands idle as before.

## v1.82.163 — Fishing: the reel lights up on a nibble

1. Cast and wait. When a fish swims up and nibbles under the float, the reel's rim pulses gold with a glow.
2. When it bites (the "!"), the reel flashes red with a big glow and pops a little bigger: turn it now to hook.
3. The fish swims off / you hook it: the reel goes back to normal.

## v1.82.162 — Fishing: left stick jerks the float, the reel hooks the fish

1. Cast, then while waiting flick the left stick left or right: the float jerks a clear step that way (twice the old nudge) with a dip and a splash ring. Never says TOO EARLY, even if the flick drifts downward.
2. When the "!" shows (HOOK!): turn the reel on the right (about an eighth of a turn, either way) → HOOKED, and you're already winding. The reel stays on screen through the bite now.
3. A tiny touch of the reel (under ~45°) doesn't hook; the left stick never hooks.
4. Keyboard: S / ↓ still hooks. The how-to card and its demo now say "turn the reel".

## v1.82.161 — Pool fishing: quicker catch zone, hard fish jump less wildly

1. Hold REEL: the catch zone rises about 20% faster; let go: it sinks about 20% faster.
2. Pike and Golden koi still dart about but no longer leap most of the box or flip end to end; the biggest jump is about half the box. You should be able to stay on a koi most of the time with practice. The koi is still the hardest.
3. Minnow / Perch / Bass feel about the same, a bit easier with the quicker zone.

## v1.82.160 — Pool fishing: fish drawn to scale

1. Hook different fish in pool fishing: each is drawn on one shared ruler by its average length (Minnow 7 cm, Perch 25, Bass 40, Golden koi 55, Pike 70). The pike nearly fills the lane; the minnow is a small sliver; perch is clearly smaller than bass.
2. The catch zone circle is unchanged (same size for every fish).

## v1.82.159 — Pool fishing: the instructions stay clear of the stick

1. Pool fishing, phone upright: the instruction line ("Tap CAST…", "Hold REEL to rise…") sits just above the stick and the button, centred, never over the stick.
2. Phone sideways while reeling: the line runs along the bottom between the stick and the reel box, without touching either.
3. Rotate mid-game: it moves to the right place.

## v1.82.158 — Pool fishing gets the pixel fish, no divider line, zoom control removed

1. Pool fishing → hook a fish: the reel box shows a proper pixel-art fish for each kind (Minnow: slim, silver-blue with a dark stripe; Perch: yellow with dark bars and orange fins; Bass: green with a dark side band; Pike: long, pale spots, fangs; Golden koi: orange with white/red patches and whiskers). Same style as the sea fish in Fishing.
2. The white line down the water in the reel box is gone.
3. The "− Game 100% +" zoom box at the top no longer shows in practice (or anywhere). Every game is back at its default zoom. (For testing it still appears with ?zoom in the address.)

## v1.82.157 — Dungeon: walk the whole room in landscape, legs walk

1. Start the dungeon, then turn the phone sideways (or start it sideways): you can walk all the way down to the bottom of the room (it used to stop about halfway, at where the hidden chat bar would be).
2. Walk around: the legs stride and the body bobs, with the sword and shield still posed (no more gliding). Side-stepping with the shield up or while charging also walks. Other players and the practice dancers walk the same way.

## v1.82.156 — Dungeon: shorter downward sweep, a tiny lean, facing away chops down

1. Slash in each direction: the sweep still starts high but stops about 25° sooner at the bottom (less far down).
2. A small lean into each slash: the body tips toward the way you face and back (facing us: a small dip; away: a small rise). Watch the feet: they stay exactly where they were. Nothing moves your position.
3. Facing away (up): the slash starts high over the right shoulder and comes down and out to the left (it used to sweep up from the side).

## v1.82.155 — Version on the main menu only, UI clears the rounded bottom of the phone

1. Main menu: the version / server line shows (bottom right). Go into any room (party, join, practice) or the TV view: it's gone.
2. iPhone with a home bar (and Safari or the home-screen app): the chat bar (Log / Say something / Send) sits above the home bar and clear of the rounded corners; the stick, emotes and buttons move up with it. In games with no chat bar, the controls also stay above the home bar.
3. Landscape on a notched phone: the stick and the chat bar keep clear of the notch side.

## v1.82.154 — Party: Cast to the TV, TV mode (mirroring), no stand-in bot

1. **Android + Chromecast / Google TV** (Chrome): 🎉 HOST → **📡 Cast to the TV** → pick the TV. The TV shows the party view; your phone keeps the full player + host view. The button becomes **■ Stop casting**. (The music still plays from the phone itself.)
2. **iPhone** (or no Chromecast found): **Cast to the TV** opens a short help card: open the TV link on something at the TV (keeps your phone view), or **📺 TV mode**.
3. **TV mode**: this same tab turns into the TV view (dance floor, playlist, QR, the vote grid) with a small 🎉 HOST button in the corner. Mirror the phone (iPhone: Control Centre → Screen Mirroring; Android: Cast / Smart View) and turn it sideways. The music comes out of the TV. 🎉 HOST → **Back to the phone view** returns to dancing. The screen is kept awake.
4. Cast never opens a new tab any more (the phone paused the old tab, and the music with it).
5. The hidden DJ's stand-in bot no longer walks the dance floor at a party (the host is there as themselves).
6. TV view: the empty "Room:" label in the corner is gone (the code is in the QR box).

## v1.82.153 — Host a party (phone host + TV cast), 6-panel game vote with live previews on the TV

**Needs a Render redeploy** (server: `pl-state`, song requests can name one of the game's songs, votes take 6 options and game pairs).

Host a party:
1. On a phone open the venue → type your name → **🎉 Host a party**. After a few seconds you're in your own room with code shown, as a player (a hidden "DJ <name>" performer runs on your phone and plays the music).
2. Tap **🎉 HOST** (top right) → the party panel: room code, **Cast / open on the TV**, **Copy TV link**, the playlist (remove / move up), show length (3 / 5 / 8 / All), **START THE SHOW**, and while it runs **Skip the break** / **Stop the show**.
3. On the TV open the TV link (`venue.html?tv=CODE`): dance floor + the join QR + a **JAM TIME / UP NEXT** list that updates live.
4. Friends join with the code → **🎵 ADD SONG** → a YouTube link, one of the game's songs (new picker) or a file from their phone. It goes **straight on the playlist** (no approval); their box shows "Up next".
5. **START THE SHOW** → plays the first N songs back to back, each with its game vote, rounds and the break between games. The TV shows "THE SHOW · SONG 2 / 5" and the song now playing.
6. The break between games: everyone presses **Skip** on their phone; the TV shows **SKIP THE BREAK x / y** while it counts.
7. Only the host's phone plays sound. Players' phones and the TV are silent (the TV is pictures only).

6-panel game vote:
1. The vote before each song now has **6 panels**. A song of 3 min or more: each panel is a **pair** of games ("Mosh pit + Ice rink"); the winning pair is the song's 2 games. A short song (or a YouTube one, whose length isn't known yet): 6 single games.
2. On the **TV**: a big 3×2 grid, each tile playing the game's **live demo** (two side by side for a pair) with its vote bar; the winner grows, the rest dim.
3. On **phones**: the simple list (pairs on two lines). If the Add-song box is open when a vote starts, it closes.

## v1.82.152 — Dungeon: slashes start at the top and come down

- **Direction:** every slash now starts high and comes down.
  - Facing right: from above, down in front of you.
  - Facing left: from above-left, down.
  - The diagonals: from their upper side, down across.
  - Facing us or facing away there's no "up", so it starts from the sword hand and sweeps across.
- The hit area, the trailing tail and the practice dancers' swings follow the same direction.
- The sword stays in the right hand. Checked in all 8 directions.

1. Face right and slash: the blade starts above your head and comes down in front.
2. Face left: the same, mirrored.

## v1.82.151 — Dungeon: always right-handed (sword right, shield left) in every direction

- **Why it swapped:** the character art doesn't call the same limb "right" in every view. From the front and from behind the right hand is one limb, side on it's the other, and the left-facing views are the right-facing ones flipped, which swaps them again. So the sword changed hands depending on the way you faced.
- **The fix:** one table now says which drawn arm is the real right hand in each of the 8 views. The sword always goes in that hand and the shield in the left.
  - Facing you: the sword is on screen left.
  - From behind: on screen right.
  - Side on: in the near hand facing right, the far hand facing left.
- **The swing** now starts on the right-hand side and sweeps across the front to the left, in every direction. The hit area matches, and so do the practice dancers.
- **The shield guard** is worked out for the left hand in each view: across the chest from the front, edge on side on, peeking out at the side from behind.
- Checked frame by frame in all 8 directions (swing start, a third, two thirds, end, charge, block).

1. Dungeon: face each of the 8 ways and swing. The sword is always in the right hand and the swing always starts on the right.
2. Hold BLOCK in each direction: the shield is always on the left arm.

## v1.82.150 — Dungeon: no body shift at all in a slash

- The slash no longer shifts the body forward at all, not even as a lean. The body stays exactly where you stand for the whole swing, and the reach comes from the arm and the blade. You're still rooted until the swing ends.

1. Face right and slash: the body doesn't slide right at all. Only the arm and sword move.

## v1.82.149 — Dungeon: swings root you in place, the spin twirls your body, a longer reach

- **Rooted:** a sword swing or a spin attack holds you to the spot until it finishes, plus a short recovery (about 0.1 s). Then you walk again. Rolling still moves you.
- **Twirl:** during the spin attack your whole body turns round with the blade, through all 8 facings, with the arm following the sword.
- **Reach:** the blade is drawn further out, a bit longer in a swing and longer still in a spin, so it reaches the area it actually hits.

1. Walk and swing: you stop for the swing, then carry on walking.
2. Hold to charge, then let go: you twirl round with the sword.

## v1.82.148 — Dungeon: the shield is held in the off hand, checked in all 8 directions

- **Off hand:** the shield is drawn on the avatar's real off hand (the sword is in the other), with a guard pose that brings the arm across.
  - Front: up across the chest, face on, with its gold boss.
  - Front diagonals: a three-quarter oval out toward the way you face.
  - Side on: edge on, straight ahead.
  - From behind: held out at the shield side, peeking past the body, showing its back and strap.
- **Drawn with the body:** it moves with the body, including the lean and the roll. It's drawn behind the body when you face away.
- The old shield that floated in front of the face is gone.
- Checked in front, front-right, right, back-right, back, back-left, left and front-left.

1. Dungeon: hold BLOCK facing each way. The shield is in the off hand, never floating, and the sword arm hangs ready.

## v1.82.147 — Dungeon: shield + BLOCK, ROLL, crits on the beat, a lunge that doesn't move you

- **The lunge** is now just the body leaning out over the planted feet and back. Your position never changes.
- **BLOCK** (hold; E on a keyboard, B on a controller): raises a round wooden shield with an iron rim and a gold boss in front of you.
  - A spider biting from the front (about 70° either side) glances off it: CLANG, sparks, it gets knocked back and you lose no heart. From behind or the side it still bites.
  - While blocking you keep facing your guard, so you can side-step. From behind, the shield is drawn on your back.
- **ROLL** (Q or Shift; X on a controller): a quick tumble the way you're pushing, or facing if you aren't. The body rolls over and you can't be bitten mid-roll. It covers about an eighth of the room, with a short cooldown.
- **Crits:** a swing or spin that starts on the beat does double damage, with a pink CRIT! and a burst. An on-beat swing kills a normal spider in one hit.
- The intro card, the hint line and the controller strip list the new controls.

1. Dungeon: swing and check you don't slide forward. The body leans out and back.
2. Hold BLOCK facing a spider: it bounces off (CLANG). Turn your back and it bites.
3. ROLL through a spider: no damage.
4. Swing right on the beat: CRIT!, and a spider dies in one hit.

## v1.82.146 — Dungeon: the sword stays in the hand, a slash tail, a lunge, checked in all 8 directions

- **In the hand:** the sword is now drawn in the avatar's real right hand, the way the lighter is. The arm reaches along the blade through the whole slash, so the grip never leaves the fist.
- **Tail:** the big crescent is gone. A short tail of fading afterimages trails the blade (4 in a swing, 6 in a spin), and the spin keeps a ring of sparks.
- **Lunge:** each swing carries you a step forward in the way you face. The practice dancers lunge too.
- **All 8 directions:** every facing does the same move, turned. It starts on the sword-hand side, sweeps 140° across the front and ends on the other side, always with the same hand.
  - The views facing left are drawn as the right-facing ones flipped, so the hand and arm are worked out in the flipped view.
  - Facing away, the blade is drawn behind the body.
  - Checked frame by frame (start, a third, two thirds, end, charge, spin) in front, front-right, right, back-right, back, back-left, left and front-left.

1. Dungeon: swing facing each of the 8 ways. The blade stays in the fist, sweeps across the front with a short tail, and you lunge forward a step.
2. Face up (away): the sword passes behind your back.
3. Hold to charge: the blade points ahead and sparkles. Let go: a full spin with the sword in your hand.

## v1.82.145 — Dungeon (new game): swords, spiders and the spin attack

- **Dungeon** (new game, under Team in practice, also in the crowd vote): the dance floor becomes a stone dungeon seen from above, in the style of A Link to the Past.
  - **The room:** stone walls, torches that flare on the beat, a door on each side.
- **Spiders** (the starter mob): they hop at the nearest player on the beat. Some hop bigger. From room 4, some are big ones with 3 HP.
- **Sword:** SWORD, Space or the controller's A swings a swoopy 140° arc the way you face. You keep facing that way while the blade is out.
- **Spin attack:** keep holding after the swing and the sword charges. It sparkles at the tip when ready (about 0.65 s); let go for a full-circle spin that hits everything round you for double damage. Let go early and nothing happens, as in Zelda.
- **Hearts:** you have 3. A spider bite costs one, knocks you back and makes you blink for 1.2 s. Lose all three and you're down for 2.5 s (−50 points), then back with full hearts.
- **Rooms:** clear one (+100) and the right-hand door opens. Walk through it and the screen slides sideways into the next room, which has more spiders.
- **Points:** 25 per spider, 40 per big one.
- **Practice dancers:** they hunt spiders and swing at them.
- **Multiplayer note:** each phone runs its own spiders for now.
- **Server:** accepts the new mode (redeploy Render).

1. Practice → Team → Dungeon. Tap SWORD next to a spider to kill it in 2 hits.
2. Hold SWORD until it sparkles, then let go: you spin and hit everything round you.
3. Clear the room, walk through the right door: the screen slides into room 2.
4. Controller: A swings, hold A to charge, release for the spin.

## v1.82.144 — Controller support (first pass) + TV practice

- **Controllers:** any controller the browser sees works. Two-stick controllers get everything, and controllers that report a non-standard layout fall back to a basic one.
  - **Sticks:** the left stick is the on-screen stick (walk, steer, swim, fly). The right stick is the second stick where a game has one; in free dance that's your hands.
  - **D-pad:** the arrow keys.
  - **Buttons:** they press the keys a computer player would, so every game that plays from a keyboard plays from a controller.
    - A = Space, the main action (jump, fire, cast, boost; held: reel or sprint)
    - B = E, X = Q, Y = F
    - LB / RB turn 90° in free dance
    - LT / RT = Shift (sprint or drift)
    - Start skips the countdown timer
    - Back = Esc
  - **Step dance and the 4-key highway:** the face buttons are arrows too (X ←, A ↓, Y ↑, B →), so it plays like a dance pad.
  - **Free dance:** Y picks the next dance and B the next move.
  - **Half pipe:** the left stick leans (A / D).
- **Menus:** off the dance floor, the d-pad or left stick moves a yellow highlight between buttons, A presses it and B goes back.
- **TV practice (new main-menu button):** practice laid out for a big screen and a controller. It opens the practice menu, greys out the games that need a phone (target dance, the 7-key highway, dance walk race, ski, ocean fishing), and shows a strip along the bottom with what each button does in the current game.

1. On a computer, plug in a two-stick controller and open the main menu. A "Controller connected" note appears and the d-pad moves the highlight.
2. Go to 🎮 TV practice, pick a game and a song with the controller, then Start to skip the timer.
3. Free dance: the left stick moves your feet and walks you at the edge, the right stick moves your hands, Y gives the next dance.
4. Step dance: hit the arrows with the d-pad or X A Y B.
5. Dragon, Ball run, Keepy uppy, CTF, Kart, Boats, Pool fishing: the left stick moves you and A is the action.

## v1.82.143 — Dragon spin breathes a fire barrier

- **What it does:** the corkscrew spin now breathes a small ring of dragon fire round your dragon for 0.8 s.
  - The organ boss's flaming notes that touch it burn up (BLOCKED).
  - Imps, skulls, bats and gargoyles that fly into it take a hit and get knocked back. Ones that die give their usual points.
- **What it looks like:** the ring puffs out fast, holds, then thins away, with sparks circling.
- **Cooldown:** the gap between spins is now 1.65 s instead of 1.1 s, so the barrier can't be chained into a permanent shield.

1. Dragon riders: flick ↑ then ↓ as enemies or boss notes reach you. They burn up on the ring instead of hitting you.

## v1.82.142 — Capture the flag: team colours, a bigger team disc, no shaking when standing; Skip fallback

- **Team colours:** everyone in capture the flag now wears their team's colour (red or blue shirt), so you can tell the teams apart at a glance.
- **Team disc:** the disc under each player is bigger and brighter, with a ring in the team colour.
- **No shaking:** standing still no longer shakes. The beat bump and the dance bob are gone when you're stopped, and the running stride no longer flickers on and off at low speeds.
- **Skip timer:** a plain click on Skip now counts too. This covers a tap the phone turns into a gesture while another finger is on the stick.

1. Practice → Capture the flag: red and blue shirts, a bright team disc under everyone.
2. Stand still: your character stays still. Run: the stride starts and stops cleanly.
3. Start a second practice game and tap Skip timer while holding the stick.

## v1.82.141 — Practice from the menu is really practice (ball run had no ball)

- **Cause:** practice only counted as "on" when the page was opened with `?practice` in the address. The menu's Practice button never switched it on, so every game that asks "is this practice?" got "no" and waited for a host or server that isn't there.
- **Ball run:** this was the missing ball. With no host page to roll it, nothing rolled it, the bots stood still and only your score went up.
- **The same bug also hit:**
  - Dragon riders: no local waves or boss.
  - The difficulty you pick in the practice menu.
  - Battle votes.
  - Capture the flag, coin dive, tug of war and ski in practice.
  - Jumps and reactions, which were sent to a server that isn't there.
  - The menu music watchdog.
- **The fix:** entering practice, however you get there, now switches practice on. Leaving practice reloads the page, which switches it off.

1. Main menu → Practice → Ball run. The ball rolls after you and the bots, and flattens anyone it catches.
2. Practice → Dragon riders: waves come, then the boss.
3. Practice on Easy versus Expert: the steps really change.

## v1.82.140 — Menu: MUSIC ON button in the middle

- The ♫ MUSIC ON / OFF button moved from the top-right corner to the centre under the title, replacing the "Live Venue" line.

1. Open the main menu: the button sits centred under UNHOLY KEYS and still turns the menu music on and off.

## v1.82.139 — Pool fishing (the original fishing game, back as a second game); dragon corkscrew

- **Pool fishing** (new game, in Water next to Fishing, also in practice and the crowd vote): the original fishing game, where a round pool opens in the dance floor and everyone stands round its edge.
  - **Controls:** CAST, wait for the bite, then the Stardew-style bamboo reel box.
  - **Reeling:** the old version needed the two joined bars because one finger had to both reel and steer. Now the left stick slides your glow left and right while the other thumb holds REEL to make it rise. Let go and it sinks.
  - **Catching:** on the fish the meter fills, off it the meter drains. When it's full, tap NET when the net swings over the fish (2 tries).
  - **Fish:** minnow, perch, bass, pike, golden koi. The big ones bite in the loud parts.
  - **PC:** Space casts and nets, and held it reels (so do ↑ / W or holding the mouse). ← → or the mouse slide the glow.
  - **Host TV:** shows the pool with everyone's lines.
  - Has its own intro card with a demo.
  - **Server:** accepts the new mode (redeploy Render).
- **Dragon spin:** now a corkscrew instead of a flat flip. It rolls through 8 steps: side on, tipping, its back from above (rider on top, both wings spread), tipping over, upside down with the rider still in the saddle, tipping back, its belly from below, and side on again. The dragon spirals up and over, down and under, and two trails of air corkscrew off behind.
- **Dragon far wing:** it never drew in normal flight because of a check bug. It's back.

1. Practice → Pool fishing on a phone: CAST, then hold REEL with one thumb and slide with the stick. Net the fish.
2. Dragon riders: flick ↑ then ↓ to spin and watch it corkscrew.

## v1.82.138 — Every button works while you hold a stick

- **The rule:** any button can be tapped while another finger is on a stick, slider or pad, everywhere in the game.
- **Why some buttons went dead:** iPhones don't send a "click" for a tap made while another finger is already down. Buttons that act on the press already worked (jump, turn arrows, fishing). Buttons that act on click didn't: dance styles, moves, WIDE/NEAR and many more.
- **The fix:** one global handler. A tap on a button made while another touch is held now presses the button when you lift (if you're still on it). It works even when the phone has taken the fingers for a gesture, and it never fires twice.
- **Round card:** the "ROUND 1 · …" card at the start of a round sat on top of the left stick and swallowed touches. It now lets touches through, and only its own buttons (skip, votes, tap to close results) take taps.

1. Free dance on a phone: hold the left stick and tap a dance style, a move (Clap, Point…), WIDE/NEAR. Each one works, once per tap.
2. At the start of a round, use the left stick while the round card is showing.

## v1.82.137 — Step dance: a library of step patterns that fits the song; keepy uppy landing spots

- **Step patterns:** Step Dance no longer turns the song's hits into arrows one by one (which on Normal often came out as one arrow a beat for long stretches). It now picks a pattern from a library of 55 hand-designed one-bar patterns for every bar. Each bar takes the pattern that best lands on the song's own hits, with a little randomness. Phrases go A, B, A mirrored, then an ending fill.
  - **Easy (on the beat):** walk the stairs, ping-pong, box, zig-zag, crossover, double tap, three and rest, hold and step, two holds, hold the bar.
  - **Normal (half beats, never more than three quick ones in a row):** left right left pause right left right pause, anchor (hold ← for the bar and tap ↓ ↑ ↓ in between), gallop, tresillo (3-3-2), tresillo hold, hold and run, pairs, offbeats, jump in, echo, skip, candle, plus fills (stair run, jump finish, hold out).
  - **Hard:** staircase stream, trill and roll, anchor offbeats, jump step, gallop runs, box spin, jacks and cross, hold ladder, tresillo stream, tresillo jumps, plus fills.
  - **Expert (quarter beats):** gallop stream, anchor sixteenths, jump stream, trill burst, tresillo sixteenths, hold swap, ta-ka pairs, crossover run, sixteenth roll.
  - **Safety rules:**
    - Calm parts (intro, breakdown, the build before the drop) get calm patterns, choruses and peaks get busier ones, and a bar with no music stays empty.
    - Above Easy, a bar with one arrow per beat is a rest and never two in a row.
    - A pattern too fast for the song's tempo at that level is never picked. Above 150 BPM the patterns run at half speed.
    - The drop lands on a jump (← + →).
    - The last pass makes sure there are never more than two presses at once (a held arrow counts) and nothing on a held arrow.
  - **Unchanged:** hand-made charts, and the other games (keys, aim).
- **Keepy uppy:** a solid black circle on the floor right under the balloon, ball and feather shows where to stand and jump. When it's low enough to reach, a ring in its colour pulses round the circle.

1. Practice → Step Dance on Normal. Expect varied rhythms (gallops, 3-3-2s, held ← with taps between), not long runs of one arrow a beat. Try each level.
2. Practice → Keepy uppy. Each object has a black circle under it, ringed in its colour when it's low.

## v1.82.136 — Fishing: nudge the float with the left stick; every fish has its own shadow

- **Nudge:** while you wait for a bite, flick the left stick left or right and the float twitches one small step that way, so you can line it up with a fish. Each flick is one step, and it spooks a fish that's nosing at the float, as reeling does. The hook jerk is now a jerk **down** only, so a sideways flick never counts as an early jerk.
- **Shadows:** each kind of fish has its own pixel silhouette, nose first the way it's swimming, so a keen eye can pick the best one:
  - **Knifejaw:** short and tall, a deep disc.
  - **Salmon:** slim, with a small forked tail.
  - **Cod:** chunky, big head, rounded tail.
  - **Barracuda:** very long and thin.
  - **Kingfish:** a torpedo with a deep forked tail.
  - **Marlin:** a tall sail fin and a long bill.
  - **Tuna:** big and round, with finlets and a big forked tail.

1. Cast, then flick the left stick left or right: the float moves a little each time.
2. Look at the shadows: the shapes differ, and the far-out ones (marlin, tuna) are the big ones.
3. A jerk down still hooks on ❗; sideways flicks don't.

## v1.82.135 — No more two songs at once in practice

When you left a game early, the dance floor's menu music came back (as intended). But when you then started another game, the menu music only faded out slowly, over about 4½ seconds. On iPhones the fade did nothing at all, because Safari ignores volume changes on that kind of audio player, so the menu track played at full volume over the new game's song. Now the menu music stops the moment a game starts (and again when its song starts, in case anything brought it back), and anywhere else it fades in about half a second.

1. Practice: start a game, skip the timer, then Exit early. The menu music comes back on the dance floor.
2. Start another game: the menu music stops straight away. Only the game's song plays, on the countdown and after skipping.
3. On an iPhone especially: never two tracks at once.

## v1.82.134 — The groove (Robot "Pop" and the default dance); new MJ style; Running man "Half"

- **The groove:** from your clip, one swing every 2 beats.
  - The left arm (on screen) swings from hanging low and out, in and up across the belly, the forearm bent up to the shoulder, then back down.
  - The right arm stays out to the side at waist height, rising from about 45° to level as the other comes in, hand flapping.
  - The knees bounce on every beat with the head bobbing; the body sways a pixel toward the outstretched arm; mouth open.
  - It's the Robot's **Pop** now, and it's the **default dance**: anyone dancing without a style picked does the groove.
- **MJ:** a new style button for Michael Jackson classics:
  - **Moonwalk:** moved here from Running man, and now always seen side on.
  - **Toe stand:** three easy sways, then up onto the toes, knees together, freeze.
  - **Lean:** side on, stiff as a board, tipping forward from the heels with the feet staying put, holding, and back up.
  - **Spin kick:** a sharp kick with an arm pointing up and across, alternating, then a fast spin landing on the toes facing front.
- **Running man:** the Moonwalk slot is now **Half**, the running man at half speed (the opposite of Fast).

1. Free dance → Robot → Pop: matches the clip (the arm swing, the out-stretched arm, the bounce).
2. Dance without picking a style: you do the groove.
3. MJ: try all four moves, and turn round. The moonwalk and the lean stay side on, and the lean always tips forward.
4. Running man → Half: half as quick as Classic.

## v1.82.133 — The worm faces the way it wriggles; quicker walking at the stick's edge

- **The worm:** pushing the left stick left or right wriggles you across the floor (a slow crawl), and the worm faces the way you're going: head first to the right when you push right, to the left when you push left. Before, moving right could leave it facing left.
- **Walking:** pushing the left stick right to the edge now walks you about 15% quicker than before.

1. The worm: hold the left stick right. It crawls right, head first. Hold it left: it turns and crawls left.
2. Any other dance: push the left stick to the edge. You walk a little quicker than before.

## v1.82.132 — Turn arrows swapped sides

The turn arrows trade places: **↻ (turn right)** is now at the left edge and **↺ (turn left)** at the right edge.

1. Free dance: the left-edge arrow turns you right and the right-edge arrow turns you left. Double / triple taps still add up.

## v1.82.131 — Turn arrows work while your other thumb is on the stick

- **The tap registers:** the arrows react the moment they're touched. A normal tap doesn't register while another finger is on the screen, so holding the left stick blocked them.
- **The turn adds on:** turns go on top of whatever way the stick has you facing, angled or walking. Before, walking at the stick's edge set your facing to the walking direction and wiped the turn out. Now, walking left and tapping ↻ turns you from facing left round to the front, and the sweep is relative to where you were. Other players see the same.

1. Hold the left stick (angled or right at the edge) with one thumb and tap ↺ / ↻ with the other: you turn every time.
2. Let go of the stick: you face where the arrows left you.

## v1.82.130 — Lighter in the right hand from every angle; turn arrows moved and see-through

- **Lighters up:** the lighter, phone torch and glow stick used to float behind you (at the waist) whenever you were side on or at a mirrored angle, because their position was worked out as if you faced front, and from the wrong arm. Now they sit in your raised right hand in all 8 facings.
- **Turn arrows:** moved out to the screen edges beside the little hand controls (they fit any phone width), and now just the blue arrow shows, with no box, border or background.

1. Lighters up (every move): turn round with the arrows. The lighter stays in the raised hand, side on and from behind too.
2. The ↺ / ↻ arrows sit at the far left and right edges, level with the hand controls, as plain blue arrows.

## v1.82.129 — Turn arrows replace 90 / 180

The 90 / 180 buttons are gone. In free dance there are two turn arrows instead, above the little hand controls: **↺** (left) turns you left and **↻** (right) turns you right, a quarter turn per tap. Taps while you're still turning add on: **double tap = 180°, triple tap = 270°**, as one smooth turn. The body sweeps round through the in-between angles (front → front-right → right → back-right → back…), about a tenth of a second each, and other players see the turn sweep round too. On a computer: **,** turns left and **.** turns right. WIDE stays as a small button in the middle.

1. Free dance: tap ↻ once. You turn to face right, passing through front-right.
2. Double-tap ↻: a half turn. Triple-tap ↺: three quarters the other way, all in one move.
3. Running man after turning: side on when facing a side, from the back when facing away.
4. A second phone sees the turn sweep, not a snap.

## v1.82.128 — Running man faces the crowd

Running man (and the other side-on moves: Fast, Moonwalk, Arms pump, the Shuffle's running man) used to start side on even when you faced the crowd. Now facing the crowd it's done **from the front**: the knees drive up toward you in turn and the arms pump bent in front of the chest. Facing away, it's from the back. Facing left or right (or the diagonals) it's side on, turned to that side. The 90 / 180 buttons work the same way: front → right side → back → left side.

1. Free dance → Running man without walking first: it faces you, knees coming up, arms pumping at the chest.
2. Tap 90: side on to the right. Again: from the back. Again: side on to the left.
3. Walk left or right, then stop: side on that way.

## v1.82.127 — Shake it: Drop it holds low, Pop it brings you back

- **Drop it** now drops you down low and keeps you there: bent over, hands on the thighs, the butt still popping on the half beats and the hips tilting. It used to bob up and only drop on beat 4.
- While you're dropped, the **Drop it** button reads **Pop it**. Press it (or X on a computer) and you pop back up into **Wiggle**.

1. Shake it → Drop it: you stay low the whole time, still popping. The button now says Pop it.
2. Press Pop it: back up into Wiggle, and the button says Drop it again.

## v1.82.126 — Free dance WIDE button; Shake it "Hands up" turned round

- **WIDE / NEAR:** a small button next to 90 / 180 in free dance. WIDE zooms right out to the normal view of the whole room: it overrides the close-up camera, your turn in the middle, the dance circle, and any pinch or wheel zoom. NEAR puts the close-up back. It's remembered on this device.
- **Shake it → Hands up:** now turned round like Wiggle and Drop it, butt out and shaking to the beat, but standing taller with both hands up in the air, loose and swaying side to side.

1. Free dance: tap WIDE. The camera eases out to the whole room and the button reads NEAR. Tap again to zoom back in. Reload and it stays as you left it.
2. Shake it → Hands up: back to the crowd, butt shaking, hands up and swaying.

## v1.82.125 — Each dance jumps its own way; the left stick angles you; robot hands; 90 / 180 bar fixed

- **A flick jump for every dance, each its own way:** two-step tucks; hands on knees keeps the hands on the knees in a squat jump; shake it goes up with the hips out; running man leaps in a stride; skank kick-jumps; the **robot** jumps stiff as a board with its arms locked out; the worm pushes off the floor; **silly** does a star jump; the shuffle kicks its feet out to the sides; **thriller** does a zombie hop; street jam throws a fist up with a knee up; cyber goth reaches up with high knees; **headbang** jumps head down, knees tucked; **lighters up** keeps the lighter held high; techno march punches a fist up; the **puppet** is hauled up limp on its strings.
- **The left stick in free dance keeps you planted:** pushing it left or right angles your body three-quarters toward that side, feet on the spot, like swinging side to side. Only right at the edge of the stick do you walk (and turn to face the way you go). Everyone sees your angle. The Shuffle and the worm still use the stick their own way.
- **Robot:** the two little hand controls above the sticks now point the arms the same way the sticks do, snapped to the robot's 45° steps.
- **90 / 180 bar:** it was still sized for four buttons after Spin and Twirl went, leaving half of it empty. Now it fits the two. Both buttons work: 90 goes front, right, back, left; 180 goes back and forth.
- There are no spin, twirl or jump buttons anywhere now: spin by circling the left stick, jump by flicking it.

1. Free dance: push the left stick halfway left or right. You turn to that side without moving. Push it all the way: you walk.
2. Flick-jump in a few dances (Robot, Silly, Thriller, Headbang, Puppet): each has its own air pose.
3. Robot: drag the little hand controls. The arms snap to 45° like with the sticks.
4. The 90 / 180 bar is compact and centred.

## v1.82.124 — Flick to jump; the worm dives in and pushes off

**Jumping is a flick now.** No more jump buttons (the one between the dance sticks and the one on the reaction bar). Pull the **left stick down and flick it up**:
- **How fast** you flick sets the height: a quick snap is a big leap, a slower flick a small hop.
- **The angle** of the flick sets where you land: flick up-left and you leap left across the floor, straight up and you jump on the spot.
- It has to pass through the middle of the stick, so circling the stick to spin never counts as a jump.
- It works in free dance on the dance stick (including the Shuffle, where a flick no longer sets off the stomp) and on the main stick when you're just walking around.
- On a computer, **Space** does a middling straight jump.
- Everyone sees your jump's real height. **Needs the Render redeploy:** the server now passes the height on.

**The worm:** "Dive in" isn't a move choice any more; it's how the worm starts. Picking the worm, you jump up with your arms out and dive onto the floor, then the wave begins. A flick during the worm is a **big push**: the whole worm launches up into the air and lands back into the wave.

1. Free dance (any style): pull the left stick down and snap it up for a high jump, then flick it slowly for a small one.
2. Flick up-left or up-right: you leap that way.
3. Circle the stick: you spin, not jump.
4. Pick The worm: it dives in, then waves. Flick: it launches into the air and lands back in the wave.
5. Outside a dance, flick the main stick: same jump.
6. With two phones: the other phone sees the same height.

## v1.82.123 — Turning mid-dance carries the step straight on

Every facing already shares the dance's beat, so the step was in time. But the view or move changing used to jump to the new pose. Now:
- **Any turn or switch eases from the old pose to the new one over about a sixth of a second:** the 90 / 180 buttons, a stick spin, turning round while walking, or switching dance or move. Arms and legs carry on from where they were and swing into the new view. It only smooths the change itself; the dance's own sharp hits aren't softened.
- **Spins hold the dance where it was:** the stick steering the spin (the left one for a stick-circle spin) used to snap that part of the dance to neutral the moment you started spinning, and back when you stopped. Now it keeps its pre-spin value until the spin ends.
- A side-on move flipping sides (the moonwalk glide, for one) no longer jumps sideways.

1. Free dance, Running man: walk right, then left. The turn reads as one motion, with no pop.
2. Tap 90 and 180 mid-step: the body turns and the limbs carry on.
3. Circle the left stick to spin and let go: no jump into or out of the spin, and the dance picks straight up.
4. Switch between moves (Classic → Fast → Moonwalk): each change eases in.

## v1.82.122 — The Shuffle spins from a stick circle too

Circling the left stick now works in the Shuffle as well: a full circle (or pushing to the top edge, as before) starts the T-step stomp spin, and it spins the way you're circling: clockwise right, anticlockwise left. Keep circling to keep it going; let go to finish the turn.

1. Free dance, **Shuffle**: circle the left stick clockwise. It stomps and spins right, and keeps going while you circle.
2. Circle anticlockwise: it spins left.
3. Let go: it finishes the turn and goes back to the running man.

## v1.82.121 — Dance facings audit; spin by circling the left stick

**Audit.** I rendered every dance and every sub-move in all 8 facings at 4 points in the beat. That's 16 dances, 72 sub-moves and about 2,300 poses, drawn through the game's own character drawing. An automatic check looked for blank or cut-off sprites (none, apart from a glow stick reaching past the box, which is fine). Fixes:
- **Side-on moves when you're facing a way from walking:** Running man (Classic / Fast / Moonwalk / Arms pump), the Shuffle's running man and the side-on parts of Mix it up used to turn with your facing. So after walking right you saw them from the *back*, and after walking left from the *front*. Now they stay side on, facing your way: right for right / front-right / back-right, left for left / front-left / back-left, and the moonwalk still glides backwards. The 90 / 180 buttons still turn the move round on purpose.
- **The worm** now faces left when you face left (and Back goes the other way).
- Everything else read correctly in every facing.

**Spin / Twirl buttons removed.** Circle the **left stick** one full turn and keep going: anticlockwise **spins you left**, clockwise **twirls you right**. Keep circling to keep it going; let go and you finish the turn you're on. You don't walk while spinning. It doesn't apply to the Shuffle, which has its own stomp-spin, or the worm, which is on the floor. On a computer, T / G / V still spin.

1. Free dance, any style (not Shuffle or worm): circle the left stick half a turn and nothing happens. A full turn starts the spin, the opposite way spins the other direction, and letting go finishes it.
2. The 90 / 180 buttons are still there; Spin and Twirl are gone (from the reaction bar too).
3. Walk right, then pick Running man: it's side on, facing right. Walk left: facing left. Tap 90: it turns to face front, as before.
4. The worm faces the way you last walked.

## v1.82.120 — Headbang shows from the side; the worm loops cleanly

- **Headbang, side on:** a bowed head only used to drop 3 pixels, which you can't see from the side. Seen side on, the head now pitches forward over the chest and the shoulders lean in after it, then it snaps back on the lift. The other headbang moves (hair windmill, air guitar, rock on) get it too, and so does any move that nods. The front view is unchanged.
- **The worm loop:** it used to inch sideways for 4 beats and then jump back to its spot in a single frame. Now the body surges forward as the chest pushes up and settles back as the hips flick, so every wave ends exactly where it began. The motion also follows a smooth curve through the key poses instead of pausing at each one. In a check through the whole cycle, nothing moves more than about 0.4 px per 1/100 of a beat.

1. Free dance, **Headbang**, then walk left or right so you're side on: the head clearly whips forward and down on each beat.
2. **The worm** (Forward and Back): a steady, flowing wave with no snap back at any point.

## v1.82.119 — The worm, rebuilt as a bending body

The worm used to be the standing sprite tipped on its side, so it couldn't bend: the hips could never go up while the chest stayed down, which is the whole move. Now it's drawn as a jointed body seen side on: a torso, thigh + shin and upper arm + forearm, with your own side-view head (your hair, hat and face). The wave is keyed to three clips (a ballroom floor, a UFC celebration, a wrestling ring), one full wave every 2 beats:

1. Chest down on the floor, hands planted by the chest with the elbows up, hips high, legs kicked up behind.
2. The wave runs back: the hips come down and the legs lower.
3. Hips and legs flat, chest pushed right up on straight arms, head up.
4. The hands leave the floor and fly forward, chest up, knees bending so the feet lift.
5. The chest drops forward onto the hands as the hips flick back up, and round again.

- **Forward** goes right, **Back** goes left, **Flop** rocks between hips-up and chest-up on the beat, and **Dive in** still jumps and dives into it.
- The thumbsticks still add chest lift (left stick up) and hip kick (right stick up).

To test: free dance, pick **The worm** (key 7), and watch the moves above. Then try Back, Flop and Dive in, and check other players see it the same way.

## v1.82.118 — Walking diagonally: the feet point the right way

On the four diagonal facings, the shoes used to point outward (one each way), copied from the straight front and back views. Walking up and to the right, the near foot looked backwards. Now both toes point the way you're heading: right for front-right and back-right, left for front-left and back-left.

1. Walk diagonally up-right, up-left, down-right and down-left: both shoes point the way you're going.
2. Straight front, back and side views look the same as before.

## v1.82.117 — Dragon riders: riders sit side on in the saddle

Riders used to face the front, standing with their legs dangling below the dragon. Now they face the way the dragon flies (side on). They sit down in the saddle with their knees forward over the flank and their hands forward on the reins (raised up for SUPER), and bob with the wingbeat.

1. Dragon riders (practice is fine): your rider and the others face right and sit in the saddle, with no legs hanging below the belly.
2. Fire a SUPER: the arms go up.
3. A rider whose dragon has fallen goes back to standing on the sideline as before.

## v1.82.116 — Voice chat during songs (host option)

New host button next to **🎙 Voice**: **🎵 Voice in songs: off / ON**. It's remembered on this browser and sent each time you go live. Turned on, voice chat no longer mutes while a song, a video or a game plays: people's mics stay open. In a game, phones get a small mic button at the top centre: tap to talk, tap again to mute. Turned off, everything works as before: mics mute for the song.

**Needs the Render redeploy** (the server passes the setting on) and a refresh of the host page.

1. Host: go live and turn on **🎵 Voice in songs**.
2. Phone: join, then start a game. A small mic button shows at the top centre. Tap it: it turns green and you're talking. Talk on a second phone and check the first hears it during the game.
3. Start a video or play on the host keyboard: the phone mics stay on (the button doesn't change to "mic off for the song").
4. Host: turn it off mid-song. The phone mics mute for the song and the small button goes away.
5. Join with the setting already on: it applies straight away.
6. Note: on phones, having the mic open can make the music a bit quieter (the phone switches to call audio). That's why it's off by default.

## v1.82.115 — Fishing: the rod sits behind your head

The rod used to be drawn on top of everyone, across the face. Now it's drawn before the dancers, so your head sits over it, while the line and the float still show on top.

1. Fishing: check the rod comes up from behind your head between casts, while aiming left and right, and with the float out.
2. Check other players the same way.

## v1.82.114 — Fishing: real fish under the float, the reel replaces RECAST, a rod you can swing

- **Bites come from real fish.** The fish shadows in the water are now the actual fish. You only get a bite when one swims under your float at the float's distance, and further out means bigger fish. The number of fish grows with the number of players (6 + 3 per player, up to 28).
- **Line it up with the reel.** While you wait, the RECAST button is gone and the reel sits in its place. Spinning it (or holding ↑ / Space) pulls the float in, so you can drop it into a passing fish's path. Pull it all the way in to cast again. Moving the float spooks a fish that's nosing at it.
- **The rod.** Between casts, drag on the water (on a computer, just move the mouse) and the rod swings round with your aim. Once the float is out, the rod points at it. It now comes from your right hand and reaches up and out over the water. You can still walk along the side with the stick or the arrows between casts.

1. Cast, then don't touch anything: you only get a ❗ when a shadow is right under your float.
2. Spin the reel during the wait: the float comes in. Line it up so a shadow swims into it, and it bites.
3. Spin it all the way in: ✔ READY, then cast again.
4. Between casts, drag left and right on the water: the rod and the swoop swing round. Push the stick left or right to walk.
5. With more players in the room there are more shadows.
6. The BPM panel stays hidden while you wait, so the cast readout isn't covered.

## v1.82.113 — Fishing: RECAST reels itself in

Pressing **↺ RECAST** while you wait for a bite now pulls the line straight back in by itself, at full speed. You no longer have to spin or hold to bring it back. Spinning still makes it a bit quicker.

1. Cast, then press **↺ RECAST** while you wait.
2. Take your hands off: the line comes back in about a second and you're ready to cast again.
3. Spin the reel during it: it comes in a little faster.

## v1.82.112 — New game intros: 8-bit demos and short instructions for every game

The card that shows before each game (the last ~15 s of the countdown) is redone for all 22 games. The instructions are cut down to a goal line, 2–3 short HOW lines and 2–3 RULES, with symbols instead of sentences. Every demo is now drawn in whole pixels (no smooth circles or lines). The fishing, mosh pit and ice rink demos are rebuilt to match how those games work now, and Coin dive, Ball run and Dragon riders get a card for the first time.

1. Start practice, pick **Fishing**, and watch the card during the countdown. The demo runs through the 5 steps, with a caption for each: **1 SWOOP UP FAST** (the power bar with the fish tiers, PERFECT! MARLIN), **2 WAIT**, **3 JERK!** (❗ over the float), **4 SPIN ON THE BEAT** (the reel, the BPM, the vertical tension bar on the right, the edge pulsing on the beat, TOO FAST), **5 NET IT!** (MARLIN +1500). The text says nothing about the old box or bars.
2. **Mosh pit**: SWING ON THE BEAT → HEADBANG ON THE LINE → PICK A SIDE / CHARGE ON THE DROP.
3. **Ice rink**: COPY THE ARROWS → SPIN: CIRCLE / HOLD IT → BIG JUMP (mash bar, then the jump).
4. **Coin dive**, **Ball run** and **Dragon riders** now get a card: the dive shows dashing on the beat for coins; the ball run shows a giant ball steered by the performer squashing a runner; the dragons show the fire bar, eating notes for SUPER, then the boss organ with its HP bar and the flamethrower.
5. Spot-check the rest: every card fits on a phone without much scrolling, the text is short, and nothing looks smooth or blurry.
6. The help line in the game for Dragon riders and Fishing now matches the current controls.

## v1.82.111 — Fishing: no more snaps with the tension bar half full

A big fish (usually the marlin) used to "snap" out of nowhere: once it had pulled out all your line, the catch ended on the spot, wherever the tension bar was. Now when it runs out your line you get a warning, and the bar climbs to the top before the line goes.

1. Hook a marlin and stop reeling so it keeps running.
2. When it's nearly out of line: **⚠ LINE OUT!** pops up, the phone buzzes and the tension bar's border flashes red.
3. Keep not reeling: the tension climbs to the top (red) and only then does it **💥 SNAP**.
4. Reel hard as soon as you see the warning: the tension drops and the fish comes back in.

## v1.82.110 — Fishing: the beat pulse is on the whole time

- The screen edge pulses on every beat **for the whole fishing game**: casting, waiting, the bite, netting. It's **yellow** then, and while reeling it shows your spin (green on the BPM, blue easing off, red straining), as before.

## v1.82.109 — No ADD SONG during rounds; Skip timer says what it's doing

1. **ADD SONG is hidden during a round's countdown and the game itself.** It comes back between rounds.
2. **Skip timer in a room** now shows its state:
   - "Waiting for host…" once your press went through (it starts within a moment).
   - "Waiting · 1/3 ready" while others still need to press.
   - **"⚠ Server needs updating"** if the server never answers. That means the live server is an older build without room skips: **redeploy Render, and refresh the host page.**
3. Fishing's countdown card now explains fishing ("Swoop to cast · jerk on the ❗ · spin the reel to the ♩") instead of "Everyone gets the same steps".

## v1.82.108 — Playlist nights: the room votes the games before each song

1. **Build a playlist** (host's song menu → Playlist), add your songs, keep "Next song plays on its own" on, and start the first one.
2. When a song ends, the room votes on the next song (from the next 4, as before). Then, **before it starts, the room votes on the games** (3 choices, about 15 s on every phone).
3. **The top-voted game plays, or the top two in vote order for a song over 3 minutes** (a song under 3 minutes always gets one game). Ties are drawn at random, and if nobody votes the order is random.
4. Videos play on the TV as before. Any YouTube ad plays while the song is starting, and the games wait for the song itself (they follow the video's clock), so an ad never eats into a game.
5. The "Crowd picks the game too" switch is now "The crowd votes the games before each song".

## v1.82.107 — 8-bit graphics pass, and the host page and TV go 8-bit too

1. **New shared file `px8.js`** (loaded by the phone page / TV and the host page). It holds the pixel icons (now **190+**, every symbol on both pages, from the host menu to the faces) and the 8-bit rules below.
2. **Game graphics:**
   - Canvases are scaled up with hard pixel edges (they were softly blurred up to the phone's resolution).
   - Image smoothing is always off.
   - Canvas glows (soft blur) are switched off.
   - Smooth gradients become 4 hard colour bands between each pair of colours (the rink, the water, the skies, the glows).
3. **Page styles:**
   - Blurred shadows and glows become hard pixel ones: a glow becomes a solid ring, a soft drop shadow becomes a hard offset.
   - No backdrop blur.
   - Square corners everywhere.
4. **Host page:** the pixel font, pixel icons and hard styles too. The TV screen is the phone page, so it's covered.
5. Checked: all 20 games and the host page, with no symbol lacking a pixel version, no smooth emoji left, and no errors.

## v1.82.106 — 8-bit everywhere: pixel symbols and pixel text in every game; a pixel reel

1. **Every symbol in every game on the phone** (all 120 used, from arrows and stars to 🎣 🐉 🛹 🏆) is drawn as **pixel art**, never your phone's smooth emoji:
   - Page text (buttons, banners, hints, cards, menus) swaps them in automatically.
   - So does anything a game draws on its canvas (pop-ups, labels).
   - The skate/ski score icons and "⏸ Paused" set in the CSS get pixel icons too.
   - Typed text in boxes is left alone.
2. **One pixel font everywhere** (Silkscreen): any text that used a smooth system font (some labels, the dragon's notes, a few canvas texts) now uses it. No faux-bold smearing.
3. **The fishing reel is real pixel art:** a 40×40 sprite with a stepped rim, eight spokes that turn as you wind, the arm and a chunky knob. The rim lights cyan while you hold it and yellow on the beat.
4. Checked: all 20 games started in practice, with no symbol lacking a pixel version and no smooth emoji left in visible text.

## v1.82.105 — Fishing: the symbols are pixel art too

- Every symbol in fishing is drawn as **8-bit pixel art** instead of your phone's smooth emoji: ⭐ ✔ ✖ ⚠ ❗ ⏳ 👆 🖱 🥅 👀 👋 🐟 🐢 ⚡ ⟳ ↺ ⇗ ↔ ♩ ⬅ ➡ ↓ 🎣 💥. That covers the hint line, the first-catch coach, the button, the ⭐ ◀ ▶ adjuster, the BPM panel, the tension and reel labels, and the pop-ups over your head. The keepy uppy pop-ups get them too.
- **No soft glows:** the beat pulse on the screen edge is now hard pixel bands (colour / black / colour), the beat lights get hard rings, and the tension bar's colours are solid bands (green / yellow / red) that step as they fill.

## v1.82.104 — Fishing: fewer words, more symbols; the screen edge pulses on the beat

1. **Much less text:**
   - **Hints:** "👆 aim · ⇗ swoop fast", "⇗ stay in!", "⏳", "❗ JERK!", "⟳ to the ♩ · ↔ vs fish", "⟳ reel in", "🥅 NET!".
   - **Pop-ups:** ⭐ PERFECT · GREAT · ✔ HOOKED · ✖ TOO EARLY · ✖ TOO SLOW · ⚠ TOO FAST · 💥 SNAP · ✖ SLACK · ⏳ MARLIN · 👀 MARLIN · ✔ READY.
   - **First-catch coach:** "⟳ one turn each ♩", "🐟 ⬅ pull", "⚠ slow down", "🥅 NET!".
   - **Panels:** ⭐ ◀ 0.53s ▶ for the perfect cast; 120 ♩ / ⟳ 119 with 🐢 ✔ ⚠ on the BPM gauge; ⚡ under the tension bar; ⟳ under the reel; the button reads ↺ RECAST.
2. **The edges of the screen flash on every beat while you reel:** green when you're on the BPM, blue when you're spinning slow (easing off), red when you're straining, yellow when you're not spinning. You can keep the beat without looking at the panel.

## v1.82.103 — Fishing: no more tension spikes

- **Tension can only climb so fast:** at most about a third of the meter per second (empty to full takes about 3 s), and **half that for the first 2 s after the hook**, so it no longer shoots up right away or jumps. It can still drop faster than it rises (up to about 0.9 of the meter per second).
- Three new FEEL / Tuning-lab sliders to fine-tune it: "Tension: fastest climb", "first 2 s after the hook", "fastest drop".

## v1.82.102 — Fishing: spinning slow is a tool, not a mistake; tension meter on the right

1. **Slower than the BPM:** the reel turns slower in proportion (half the BPM = half speed) and **the tension drops**, so easing off calms a fighting fish.
   - **At the BPM:** full speed.
   - **Faster:** still full speed, but tension climbs ("TOO FAST!").
   - Measured: at the BPM, tension about 80%; at half, about 40%; at double, over the top.
2. The BPM panel's gauge now reads **EASY · ON IT · STRAIN** (blue → green → red).
3. **The vertical TENSION meter is on the right side** of the screen, above the BPM panel and the reel.
4. New FEEL/Tuning-lab slider: "Tension eased by spinning slow".

## v1.82.101 — Fishing: easier perfect cast, a PERFECT CAST adjuster, and RECAST

1. **Easier perfect cast:** you now have about **0.53 s** to get round the swoop for a top-of-the-bar cast (was about 0.35 s). The power also drains more slowly after that.
2. **PERFECT CAST ◀ ▶** in the top right while you're casting or waiting (rooms and practice): ▶ gives you more time (easier), ◀ less, in 0.05 s steps. It's saved on this device, and the same setting is in the FEEL sliders / Tuning lab ("Perfect cast: free time"). New sliders there too: cast power drain, BPM match window, tension from overspinning, recast reel-in speed.
3. **RECAST:** while you're waiting for a bite, the button reads RECAST. Tap it, then spin the reel (any speed, or tap Space) and the empty line comes in fast (about 1 s of spinning from a long cast). Then you're back to casting. Not spinning barely brings it in.

## v1.82.100 — Skip timer works in a room (not just practice)

The real cause: in a **room**, the countdown card showed Skip timer, but the button only worked in practice. In a room the host runs the countdown, so pressing it did nothing.
1. **Room:** Skip timer now asks to skip. When **every real player** in the room has pressed it (bots don't count, so if it's just you it's instant), the host starts the game right away. With more people the button shows **"Waiting · 1/3 ready"** and the others see the count on theirs.
2. **Practice:** unchanged (it already worked there).
3. **Render needs a redeploy** (server change), and the host page needs a refresh.

## v1.82.99 — Fishing: vertical tension meter

- The **TENSION meter is a tall vertical bar** up by the water, just left of the middle beside the fish. It fills from the bottom (green → yellow → red at the top), with the beat light above it and the TENSION label below.

## v1.82.98 — Fishing: overspinning strains the line; the tension meter moved to the middle

1. **Spinning faster than the BPM raises tension:** the more you overspin, the more it climbs (double speed can push it past the limit and snap the line), with a **"TOO FAST! Easy on the reel"** warning. Slow spinning just reels slowly.
2. **The TENSION meter is now in the middle of the screen, up by the water,** wider and right above where the fish is, so you can watch tension without looking away from the fish.
3. Fix: the BPM panel's needle now moves (it was stuck at the left).

## v1.82.97 — Fishing: spin the reel at the BPM (no notch)

1. **Reeling is about speed, not position:** spin the reel at the song's tempo, one full turn per beat, anywhere round and either way. Within about 15% of the BPM is full reel speed, a bit off is partial, and way off (like half or double) is slow. The notch is gone.
2. **BPM panel** above the tension bar while reeling:
   - The song's **BPM**, with a light that blinks on every beat.
   - **YOUR SPIN** (turns per minute): green when you're on it, yellow when close, red when off.
   - A gauge from SLOW to FAST, with the needle in the middle when you match.
   - The target follows the song if it speeds up or slows down.
3. **Computer:** wind with the mouse the same way, or tap Space / click once per beat (each counts as a turn).

## v1.82.96 — Keepy uppy is in the Dance section

- **Keepy uppy** moved from "Ride & race" to **Dance**, both in the host's game picker (song menu) and in the phone's practice menu.

## v1.82.95 — Fishing: real ocean fish, each with its own pixel sprite

1. **The fish, smallest/nearest to biggest/farthest:** Barred knifejaw (60) → Salmon (140) → Cod (240) → Barracuda (400) → Kingfish (650), and at the top of the power bar the **Marlin** (1,500, when he's out) or a **Bluefin tuna** (1,000, replaces 1.82.94's sea bass: tough fight, 1 s jerk window, "TUNA ON!").
2. The cast readout's tiers are the same six, spaced evenly up the bar: KNIFEJAW, SALMON, COD, BARRACUDA, KINGFISH, MARLIN / BLUEFIN TUNA. What can bite: under 25% power only knifejaw; 25%+ salmon; 45%+ cod; 65%+ barracuda; 85%+ kingfish; 95%+ the top.
3. **New sprites from reference photos**, so each one looks like itself:
   - **Knifejaw:** deep, pale body with bold black bars and a little beak.
   - **Salmon:** blue-green back, silver sides, black spots, forked tail.
   - **Cod:** olive and speckled, with a pale side line, three back fins and a chin barbel.
   - **Barracuda:** long and silver, with dark blotches and fangs.
   - **Kingfish:** blue-green back with a yellow side stripe and a yellow tail.
   - **Tuna:** navy torpedo with yellow finlets and a crescent tail.
   - **Marlin:** cobalt with pale stripes, a tall sail and a bill.

## v1.82.94 — Fishing: the cast readout with the fish on it, and the sea bass

Replaces 1.82.93's meter during the swoop:
1. **The flick sets the power:** the quicker you get from the ring to the top of the swoop, the stronger the cast. There's no meter while you swoop.
2. **Then the readout:** right after the cast a bar beside you fills up to your power, with the fish marked along it: MINNOW, BASS, PIKE, KOI, and at the very top **MARLIN** (when he's out) or **SEA BASS**. The tier you reached lights up and blinks, and the bar fades after about 2.5 s.
3. **The top of the bar** (95%+, a quick clean flick, "PERFECT CAST!"):
   - If the marlin is out, you hook him, or it holds for him until he passes or leaves.
   - Otherwise a **sea bass** bites. It's new: tough to reel in (a little easier than the marlin), worth about 3× a normal fish (1,000 base), "SEA BASS ON!", and a 1 s jerk window like the marlin.
4. Lower tiers work as before: the higher your power, the bigger the fish that can bite.

## v1.82.93 — Fishing: the swoop's speed sets the cast, with a power meter

1. **Faster swoop = farther cast:** a **POWER** meter beside you starts full when you start the swoop from the ring and drains as you go (about 1.3 s after a short head start). How full it is when you reach the top is your cast. About 0.35 s to the top is a perfect cast, about 0.9 s is about half, and dawdling gives a weak flick.
2. The meter shows green at the perfect line (the white mark, 85%+), then yellow, then red. Stop short or slip off the swoop and you only get part of it.
3. **No more fish labels** (BASS / PIKE / KOI / MARLIN) along the swoop while casting.

## v1.82.92 — Fishing: jerk to hook, and a perfect cast waits for the marlin

1. **Hooking takes a jerk:** when a fish bites, a yellow **!** pops over your bobber (the phone buzzes) and the button reads JERK!.
   - **Phone:** flick the stick hard (from resting to the edge in a flash).
   - **Keyboard:** tap S or ↓.
   - You have about 1.2 s (1 s for the marlin), or "Too slow! It got away" / "The marlin spat the hook!" and you wait for another bite.
   - Jerking before the ! shows: "Too early! Spooked it", and the bite comes later.
   - On the first-catch lesson there's no time limit, and the coach tells you to jerk.
2. **A perfect cast while the marlin is out holds for him:** "WAITING FOR THE MARLIN…". Nothing else bites until he swims past your bobber (MARLIN ON!) or leaves ("He swam off…"), and then normal bites start again.

## v1.82.91 — Step dance, 7-key highway and Target dance get the same treatment

All the rhythm games now build their notes the same way as the 4-key highway (1.82.90): **the song's own rhythm at every level**, off-beats included, spaced out more on the easier levels (Easy 1 beat apart, Normal ½ beat with at most two quick notes then a breath, Hard ⅓, Expert ¼). The level thinning no longer leaves long empty stretches. Hand-made charts are unchanged.
1. **Step dance:** the arrows come from the pattern engine: walks (← ↑ ← ↑), stairs (← ↓ ↑ →), side to side (← →), and no same arrow twice on fast runs. Jumps (two arrows) land on the big downbeats, more on higher levels.
2. **Note highway (7 keys):** its own pattern engine: scales up and down, arpeggios (A D G J G D), hand-to-hand jumps on fast runs, trills, and chords on the big downbeats. Easy stays on the middle five keys. While you hold a key, that hand rests.
3. **Target dance:** targets flow along a shape in time with the beat (a circle, a zig-zag, a figure 8, a sweep), a new shape every 2 bars, instead of popping up at random. Easy keeps the moves smaller.

## v1.82.90 — 4-key highway follows the song's own rhythm at every level

Replaces the beat-grid fill from 1.82.88 (Normal was locked to on-beat notes, which felt robotic):
1. Every level now uses **the song's own rhythm**, off-beats and syncopation included. The levels only differ in how close together notes can be. The beat notes go in first, then the song's other notes wherever they fit:
   - **Easy:** at least 1 beat apart (mostly the beat).
   - **Normal:** half a beat, but never more than two quick notes in a row, then a breath of a beat. Easier and slower, but it still grooves with the song.
   - **Hard:** a third of a beat.
   - **Expert:** a quarter of a beat (sixteenth runs where the song has them).
2. Notes on the beat are only added for a long stretch where the song is playing but no notes were found (every other beat on Easy).
3. Normal's patterns are simpler (D K, F J, staircases, D J F K) and stay longer before changing, so they're fun to settle into.
4. Holds as before: short → tap, long → cut to 2 beats (3 on Easy/Normal).

## v1.82.89 — Dragon riders: barrel roll, and the whole sky in landscape

- **The spin is a real barrel roll now:** the dragon rolls along its own length (squashes edge-on, turns belly-up with the rider hanging under it, then comes back), not a loop. Air spirals off behind it.
- On a phone turned sideways you couldn't fly lower than about halfway: the room kept for the chat box (160 px) took half of a landscape screen. In Dragon riders you can now fly down to 87% of the height in landscape (82% in portrait, where the stick and FIRE sit low).

## v1.82.88 — Note highway · 4 keys: real patterns, on the beat

1. **More notes, on the beat:** the 4-key highway fills in the beat grid wherever the song is playing. Easy: every other beat. Normal: every beat. Hard: every beat, plus half beats in the big moments. Expert: half beats all the way through, with a few rests for swing. Song breaks (8+ beats with nothing) stay quiet.
2. **Patterns that bounce:** alternating hands (D K, F J), staircases (D F J K / K J F D), zig-zags, rolls (D J F K), and hand-to-hand runs on fast stretches. The pattern changes every bar or so, never the same key three times running, and chords land on the big downbeats (more at higher levels).
3. **Holds:** short ones become taps, long ones are cut to 2 beats (3 on Easy/Normal). While you hold a key, that hand rests and the other hand plays.
4. Same song and level = the same notes on every phone. Hand-written charts are unchanged.

## v1.82.87 — Dragon riders: new dragons, real wingbeats, barrel roll

1. **New dragons:** big bony-fingered wings with a scalloped membrane, a long S-curved neck, horned head (the jaw drops open when it breathes fire), spikes down the back, a long tail that ripples as it flies, claws tucked underneath, saddle and strap.
2. **Flying:** a quick downstroke and a slower upstroke, and the body lifts a little on each beat. Wings beat faster when climbing and slower when diving. The dragon banks (tilts) as you climb or dive.
3. **Barrel roll:** flick the stick from right at the top to right at the bottom fast (or tap ↑ then ↓ quickly on a keyboard). The dragon and rider roll a full turn with a whoosh and "SPIN!". You can't be hit while rolling, so use it to dodge. Everyone else sees your roll too.

## v1.82.86 — Dragon riders: the boss is the last 90 s, much tougher, and comes back for an ENCORE

1. The demon organist now takes over for the **last 90 seconds of the song** (or the last 70% of a short song) instead of at 62%.
2. **Much more health:** 100 + 150 per rider (was 60 + 45).
3. **Beat it before the song ends:** "THE RIDERS WIN!" shows, then after about 4.5 s **"ENCORE! <name> RETURNS"**. The organ slides back in with 1.5× the health and its notes fly faster, again each time. Every kill pays +250 to the riders still flying. No more empty flying around at the end.
4. The host's switch to the church organ happens at the same new time.

## v1.82.85 — Dragon riders: health, and someone wins

1. Every rider has **5 hearts** (under your dragon, below the breath bar and super pips). A monster or a flaming note hitting your dragon's body costs one heart. Catching a note in the jaws still feeds the SUPER and doesn't hurt.
2. At 0 hearts **your dragon falls into the lava**: you're out for the rest of the round, standing at the bottom edge to watch, and the FIRE button goes away.
3. **The riders win** if they bring the organ's health to 0: "THE RIDERS WIN!", and +250 to every rider still flying.
4. **The demon (the performer) wins** if every rider who joined the round falls first: "DEMON <name> WINS!". The server referees, so every phone, the host and the TV agree. The host gets a toast either way.
5. Bots lose hearts too (more often in the boss fight). In practice, your bots count.

## v1.82.84 — Dragon riders: 8-bit, breath meter, eat the notes for a SUPER, demon performer in the organ

1. **8-bit:** the whole dragon scene (sky, dragons, monsters, fire, the organ) is drawn in chunky pixels with hard edges, in banded colours.
2. **Breath meter:** the orange bar under your dragon fills in about a second. Tap **FIRE** (bottom right; Space on a keyboard) to let it go. The fireball's size and damage match the bar (a full one does 4 damage and burns through several monsters), then the bar empties.
3. **Eat the notes:** catch the demon organ's flaming notes in your dragon's jaws (+5 each). If one hits your body instead, you're scorched. Five fills the pips under the breath bar, and a **🔥 SUPER** button appears (E or Q on a keyboard): a 3-second flamethrower that burns everything in its line and pounds the organ.
4. **The boss is the performer:** when the monster waves end, the performer on stage turns demonic (red flashes), leaves the stage and flies into the organ. The boss is the performer's own character, burned red, with horns, wings and glowing eyes: "DEMON <name>". On the host, your instrument switches to **Church Organ** for the fight and back to what you had when the round ends.
5. **Boss health fix:** your hits now take health off the boss on your phone straight away, and the server's shared number (everyone's hits) pulls it lower. Before, the bar only moved when the server answered, so on a server that hadn't been redeployed it never went down.

## v1.82.83 — Dragon riders (Hell's gig); Ball Run runs itself; Skip timer fix; star only in boats

**Dragon riders** (new game, in the song picker under Dance; in practice: Dragon riders):
1. Everyone rides a saddled dragon through a burning sky. Fly with the stick, arrows or WASD; your dragon breathes fire by itself.
2. Imps, flaming skulls, bat swarms and stone gargoyles come in from the right. Burn them for 10 / 15 / 6 / 30 points. If one hits you, you're SCORCHED and can't breathe fire for a moment.
3. Host: during the round, each arrow you play sends a wave (← imps, → skulls, ↑ bats, ↓ a gargoyle). A toast tells you when it starts.
4. About 62% of the way through, THE ORGANIST RISES: a demon on a floating cathedral organ. Now each arrow fires a flaming note out of one of its four pipes, and the notes chase the riders a little.
5. Everyone's fireballs come off one shared boss health bar (+2 per hit). Bring it down and every rider gets +250.
6. No performer pressing (practice, a bot performer, or you've stopped for 4 s): the waves and the boss's notes come from the song's own steps, the same on every phone.

**Ball Run with nobody steering:** if the host page isn't steering the ball (bot performer, no host page), the server now rolls the ball itself after the nearest player, so the ball shows and the bots run. If practice showed no ball before: that build loaded an old cached art file. 1.82.83 fixes that.

**Skip timer** on the practice countdown card now works even when something see-through is layered over the card.

**Gold star over you:** bumper boats only.

**Render needs a redeploy** (server changes).

## v1.82.82 — Ball Run minigame; soft elbows when you dance

**Ball Run** (new game, in the song picker under the dance games):
1. Host: pick Ball run for a round and go live. During play, your instrument arrow keys steer a giant ball round a circular disk (a toast tells you). Stop pressing for about 2 seconds and the ball chases the nearest player by itself.
2. Phone: run with the stick / arrows / WASD. Everyone gets 2.5 seconds to scatter at the start of each of the 3 rounds. Get rolled over and you see FLATTENED!, then sit out on the sideline with 💫 until the next round.
3. Points: +4 a second while you're alive, +100 for the last one standing in a round.
4. Practice: Ride → Ball run. The ball chases you and the practice bots; the bots dodge.
5. Render needs a redeploy for this (server and bots changed). The YouTube ad-break notice also shows in the song bar again.

**Soft elbows:** in free dance (dragging the hands) and in dances where the stick points an arm, arms now bend a little at the elbow. They curve more as they rise, and the forearm trails behind when you swing fast. The robot stays stiff, and moves with their own arm shapes are unchanged.

## v1.82.81 — No star over you in fishing

1. Play Fishing: no gold star over your head (the camera keeps you in the middle anyway).
2. Every other game still shows your star.

## v1.82.80 — Your notes make the snow; chat above the keyboard; free dance on the beat

1. **Snow from your playing:** on the ice rink and in the ski game, every note the performer plays drops a little flurry of three flakes (one with a sparkle). Low notes fall on the left, high notes on the right; the flakes drift down and melt near the bottom. The rink no longer snows by itself, so the snow is yours. The dance floor and other games are unchanged.
2. **Chat on a phone:** tap Say something. The chat bar sits right on top of the keyboard (it used to hide behind it) and gets bigger: a white box with large text, a big pink Send, and recent messages above it. It goes back to normal when the keyboard closes. iPhones won't zoom in when you tap it.
3. **Free dance in practice keeps to the song:** the menu music now goes through the same sound system the beat detector listens to, so the shuffle (and every free-dance move) follows the song's real tempo, like in the dance game. It takes a few seconds to lock on when a song starts. (Before, it ran on a fixed 120 BPM clock, so it drifted behind.)

## v1.82.79 — The performer's bot (and playing the game yourself)

Server change: redeploy Render.

1. Go live. A bot with your stage name and look joins the dance floor and dances and plays every game as you. It plays a bit better than the filler bots, and the bot fill never removes it.
2. **🤖 My bot: on / off** (host's bottom bar) switches it. The setting is remembered on this computer.
3. **🎮 Play the game** opens your player view over the host page: your bot steps aside and you're on the floor as yourself, where it was standing. Your song keeps playing on the host page (the player view is silent so there's no echo).
4. **⬅ Back to the stage** closes it and your bot takes over again. Ending the show closes it too.
5. Good for a backing track or YouTube song you aren't playing live: hop in and play the game.

## v1.82.78 — You can't be in your own room twice; come back to hosting

1. Host a room (Host a room on a phone, or the host page), go live, then leave the host page (Back, or open the phone menu).
2. The phone menu shows a gold **▶ Back to hosting your room** (with the code) instead of a Join button for it. Tap it: the host page reopens and you're LIVE in the same room again, everyone still in it. This works within about a minute of leaving; after that the room has closed.
3. Typing your own room's code into Join game asks "You're hosting room XXXX. Go back to hosting it?" and won't join you as a player.
4. End the show properly and the gold button goes away.

## v1.82.77 — Phones: the phone menu, with Host a room

1. On a phone, open the host's address (index.html). It goes straight to the phone menu (the same one players use).
2. The phone menu has a new orange **Host a room** button ("run the show from here: songs, playlists, the TV"). Tap it: the host's page opens.
3. On the host's page on a phone, the bottom buttons (Stage & FX, Start song, Hang out, TV mode, Cast to TV) wrap neatly into rows above Setup; no more squashed column with overlapping labels. The Cast to TV panel fits the screen.
4. Computers are unchanged. The phone instrument (Instrument button) still opens as before.

## v1.82.76 — Playlists, song requests from the room, crowd votes the next song

Server change: redeploy Render.

**Host: the 📜 Playlist tab** (in Start song; it opens there once you have a queue or saved playlists)
1. **Up next:** pick a song above (site song, your music, a video or YouTube) and press ＋ to queue it. Each row has ▶ play now, ▲▼ reorder, ☆ favourite and ✕ remove. Name tonight's playlist in the box.
2. **Settings** (all on by default):
   - When a song ends, go on to the next from this playlist.
   - The crowd votes on which one (from the next 4).
   - The crowd picks the game too.

   After a song, the phones get "🗳 PICK THE NEXT SONG"; 20 seconds later the winner starts, with the crowd's game vote. With the vote off (or only one song left), the next song just plays.
3. **💾 Save playlist** keeps it. Saved playlists each have Load (becomes tonight's queue), ＋ (add to the queue), ★ favourite and ✕ delete; favourites sit on top.
4. **History:** every night's played songs, with Load and 💾 save as a playlist.
5. **Favourite songs:** starred songs, with ＋ to queue.
6. **Export / Import** moves playlists between computers.
7. Everything is saved on this computer. Your own song files and ones players send are kept in the browser's storage, so saved playlists still play next time.

**Players: 🎵 ADD SONG** (top right in the room; hidden during games)
1. Paste a YouTube link and press Send, or Choose a song file (up to 15 MB; it shows Sending… %).
2. On the host, a toast appears, the Start song button glows green, and the Playlist tab shows "Songs the room sent" with ✔ add / ✕ pass. YouTube titles fill in by themselves.
3. The player is told "✔ <song> is on the playlist!" or that the host passed.

**YouTube ads:** they play in the normal player on the host and TV (YouTube's rules: never hidden or muted). The game waits while an ad plays: the phones show "📺 Ad break · back in a moment" and the host shows "Ad break: the game waits"; the game picks up when the song starts.

## v1.82.75 — Cast to a TV while you host; join rooms on your WiFi

Server change: redeploy Render.

**Cast to TV (host):**
1. Go live, then press 📡 Cast to TV (next to TV mode). A panel offers three ways:
   - **Cast** (Chrome or Edge): picks a Chromecast or cast-ready TV on your WiFi.
   - **Open a TV window:** drag it onto a TV on HDMI and double-click it for fullscreen.
   - **The link,** for a smart TV's web browser.
2. The TV shows the whole room: stage, performer, every player, games, scoreboards and round cards. There's nothing to tap on it, it doesn't zoom in, and the screen stays awake.
3. A JOIN ON YOUR PHONE card (QR plus code) sits in the TV's corner.
4. You keep playing instruments and picking songs on the computer. The TV isn't a player, isn't counted in the viewer count, and makes no sound (the sound stays on your computer; add `&sound=1` to the TV link if you want it).
5. The button shows 📺 On 1 TV while a TV is watching, and goes back when it leaves.

**Rooms on your WiFi (players):**
1. With a host live on the same WiFi, open the site on a phone. Under your name, "On your WiFi" lists ▶ Join Brian's room (with the player count and code).
2. Tap it to go straight in, no code needed. Joining with the code still works.
3. It refreshes every few seconds. On a server running on the host's own computer, every room on it shows.

## v1.82.74 — Your star, neon hands, ice routine controls, keepy uppy facing + spin bonus

1. **Your star:** in every game a small gold star bobs over your own head (nobody else's), so you can always find yourself, even in neon bumper boats or when you're out.
2. **Neon hands:** in neon bumper boats, the performer's hands are glowing outlines like the rest of them (they used to be plain skin-coloured squares).
3. **Ice routine (phone):**
   - The joystick is in the middle, bigger, and level with the TAP button.
   - Only the control you need right now shows: the stick for steps, spins and jumps; TAP for pumping and the final pose; neither while you just skate together. (Free dance still uses its pad.)
   - The move prompt (arrow plus countdown ring) is big and sits right on the performer, with rings closing in on him every beat. Its words sit just above it.
   - The free-dance buttons (with Stop) no longer show during the routine.
4. **Keepy uppy:**
   - Everyone faces the front while moving around.
   - A double jump spins you all the way round on the way up, arms out in a T, and you land facing front. SPIN and TWIRL still spin you.
   - A hit while you're in the air and spinning (SPIN, TWIRL, or the double jump's spin) shows "SPIN BONUS!" and scores ×2 (Tuning lab: "Spin-in-air bonus"), on top of the double-jump bonus.
   - The hint sits above the controls.

## v1.82.73 — Fishing feel sliders, higher sticks, swim DASH button, snorkels

1. **Fishing feel sliders:** in practice (or any room with `?fishtune` in the address), a 🎛 FEEL button sits top left, under the scoreboard, during Fishing. Tap it for sliders: reel speed, on-beat window, fish pull-out, fish strength, how often it runs, tension from reeling, tension from the fish, how much the rod helps, tension response, snap time, slack time, net time, swoop lane width, and the marlin's strength, reel speed, timing and aim reach. Changes apply instantly and stay saved on the device (the full Tuning lab shows the same values). Reset puts them back. Sliding them doesn't cast or swing the rod.
2. **Sticks higher on phones:** in every game the joystick, the right-hand stick or button, and the hints above them sit about 6% of the screen higher, where thumbs rest. Computers are unchanged.
3. **Coin dive:** the flick stick is gone, and the big DASH button is back. It dashes the way the left stick points (or the way you're facing) and glows on the beat. The hint reads "Left stick to swim · tap DASH on the beat for PERFECT".
4. **Snorkels:** everyone swimming in Coin dive wears a mask and a yellow snorkel with a red tip, from every angle.

## v1.82.72 — Fishing: the first catch is a tutorial

Shows once per device. To see it again, open the site with `?fishtut` added to the address; the first catch of that game is the tutorial.

1. Cast and hook a fish. A coach box appears mid-screen: "Fish on! Wind the reel past the notch on each beat".
2. After a calm start the fish runs one way, then the other. The coach calls it out ("It's running LEFT! Push the stick RIGHT ➡", or "Hold D ➡" on a computer), and a dashed yellow ghost knob on the joystick shows where to push. Match it and it says "Nice, hold it there!".
3. Wind straight through a run without steering and the tension climbs: "⚠ TOO TIGHT! Slow down your reeling" (red, shaking).
4. When the fish rests: "It's resting: wind on the beat!".
5. You can't lose it: the line won't snap or go slack, the fish can't run off, and the net waits as long as you need ("Got it to the edge! Tap NET").
6. Landing it shows "YOU'RE A NATURAL!". The next fish is a normal one, which you can lose.

## v1.82.71 — Fishing: nobody standing on water, no CAST button

1. Start a real Fishing round with the countdown. During the countdown it's still the normal dance floor; the wall only flies up and the floor only breaks away once the game starts. Nobody should ever be standing on the water.
2. There's no CAST button any more: you cast with the swoop. The button only comes up as NET when a fish reaches the edge.
3. The DRAG label over the swoop's ring is readable (before, it showed as a white bar).

## v1.82.70 — Fishing: aim and swoop, a real reel, the marlin

1. **Camera:** at the edge you're always in the middle of the screen, zoomed to 135%, with the edge low so it's mostly water.
2. **Aim:** tap or click the water to aim left or right; the swoop swings round to point there.
3. **Swoop:** press on the ring at your hands and drag out through the swoop lane (the two dotted edges); there's no ball to follow. Stay inside the lane: leaving it shows "Off the swoop!" and the cast stops where you got to. Letting go does the same. The further round you get, the further out it goes. The lane is marked with BASS / PIKE / KOI, the biggest fish you can reach from that point. A tiny swoop just tangles.
4. **Reel (phone and computer):** it looks like a fishing reel. Grab the handle and wind it round; the spool spins, and it spins backwards when the fish pulls line out. Each pass of the notch at the top on the beat is a full-speed wind.
5. **Rod:** on a computer, A / D swing the rod left and right (the left stick on a phone). It now comes up from behind the shoulders, over the head.
6. **Marlin:** every half minute or so, "MARLIN SPOTTED!" appears and a marlin races across the very far water, leaping. MARLIN shows on the swoop lane while he's there. A full swoop aimed where he'll be hooks him. He fights harder and takes longer to reel in, and he's worth 1,500 base points (about 4× a pike); a full-power catch is 2,250. Everyone in the room sees him at the same time.

## v1.82.69 — Fishing minigame: swoop cast, beat reel, tension

1. Once everyone's at the edge, the camera eases in a little (about 135%; the − / + box in practice still changes it).
2. **Cast:** a dotted swoop curves out from you over the water, with DRAG at its start. Touch anywhere (or press the mouse) and a ball flies along the swoop. Keep your finger on it: the ring is green while you're on it and POWER shows above you. The rod swings round with the ball. Let go early for a short cast. The CAST button / Space is a weak quick cast.
3. Power sets how far the line lands, how big a fish can bite (a full-power cast can hook a Pike or Golden koi) and the points.
4. **Reel:** the CAST button turns into a reel stick with a yellow notch at the top. The notch and the dot beside the tension bar pulse on each beat. Wind the stick round past the notch on each beat: the notch flashes green on the beat. One wind per beat on the beat is full speed; spinning faster counts for less. If the song's tempo changes, the beat changes with it.
5. **Rod:** the left stick swings the rod left and right. The fish runs left and right; pulling the opposite way to its run lowers the strain and lets you gain line.
6. **Tension bar:** too high (red, flashing) for half a second and the line snaps. Slack (empty) for a few seconds and the fish gets off. If it takes all your line out, it's gone.
7. Bring it to the edge and it thrashes there: tap NET (Space on a computer) within 4 seconds to land it.
8. Computer: click / Space on each beat to reel (holding is a slow steady reel), move the mouse or ← → to swing the rod.

## v1.82.68 — Fishing: the dance floor breaks away

1. Start Fishing. The stage wall flies up and the ocean appears behind it. The dance floor stays a dance floor, not wood.
2. The top of the floor should break away in chunks that sink, with the water revealing down the screen. Everyone runs ahead of it to the new edge, about two thirds of the way down.
3. Anglers end up in a row at the jagged, foamy edge, facing the water. Cast lines go a long way out to sea.
4. The piano slides down to the bottom middle, between the joystick and CAST, and never sits over the water.
5. The hint ("Tap CAST · stick walks the edge") sits below the scoreboard and score, not over them.

## v1.82.67 — Menu music: fail-safes so it always starts

1. iPhone with the ring/silent switch ON: open the site and tap anywhere. The menu music should play (before this, the silent switch could mute it).
2. Any phone: open the site, tap once. Music within a second or so.
3. If it ever isn't playing after you've tapped, the MUSIC button (top right) turns yellow, pulses and says TAP FOR MUSIC. Tapping it should start the music.
4. Lock the phone and unlock it, or switch apps and come back, while on the menu: the music comes back.
5. MUSIC OFF still turns it off and stays off after a reload. Going into a room or a game round still fades it out.

## v1.82.66 — Fishing: out to sea on the back of a boat

1. Start a game with Fishing (or practice → Fishing). As it opens, the stage wall should fly up and off the top of the screen, showing a night ocean behind it (moon, stars, rolling waves).
2. The dance floor should turn into the wooden back deck of a boat, with a rail along its edge. The rail slides down a little as everyone walks to it: all players and bots end up in a row along the rail, facing the water.
3. The performer's piano should move down onto the deck, behind the anglers.
4. You can't cast until everyone's at the rail (about 2.5s). Then Tap CAST / Space: the line should go well out into the ocean, not land at the rail. The stick or ← → walks you along the rail.
5. Bites, reeling and the net work as before (the minigame itself is next).

## v1.82.65 — Skip timer works on every practice countdown

What was wrong: Skip only worked on the countdown before the song, when you start a round from the practice menu. Other countdowns showed the button, but tapping did nothing. When the game explainer was showing, the floating Skip button only appeared for that first countdown too.

1. Check the version reads **v1.82.65**. In practice, start any game.
2. With the game explainer showing: the **Skip timer** button floats at the top. Tap it and the countdown goes straight to GO.
3. With the explainer closed: tap **Skip timer** on the round card. Same thing.
4. While the song is still loading, the button says **Starting…** and stays that way until the song starts.
5. Try a few different games (Fishing, Coin dive, Step dance): Skip works on all of them.

## v1.82.64 — Shuffle: a stomp and spin

1. Check the version reads **v1.82.64**. In free dance pick **Shuffle → Spin**.
2. One leg stays straight the whole time as the pivot, its heel tweaking out and back on the eighths.
3. The other knee snaps up on the "and" and stomps down on the beat (with a little dip), in the shuffle's stop-and-go timing.
4. You turn round smoothly through all 8 facings, a full 360 every bar, the facing turning on every stomp and lift, then round again.

## v1.82.63 — Thriller opens with the claw walk

1. Check the version reads **v1.82.63**. In free dance tap **Thriller**: it starts on **Claw walk** (that button is lit), not Zombie arms.
2. Pick **Mix it up**: it opens with the claw walk, then zombie arms, then the shoulder pop, round again.

## v1.82.62 — Phone light faces the right way

1. Check the version reads **v1.82.62**. In free dance pick **Lighters up → Phone light**.
2. Facing the crowd (front): you see the phone's bright screen and its glow.
3. Turn round to face the stage (180): you see the **back** of the phone (dark) with the torch glinting over the top, and the glow is fainter and higher, shining away toward the stage.
4. The glow is stepped pixel rings now, not a smooth blur.

## v1.82.61 — Skank: a real knee lift

1. Check the version reads **v1.82.61**. In free dance pick **Skank** (Classic).
2. On each beat one arm swings out, and on the other side the **knee comes right up**: the thigh rises, the knee bends, and the foot tucks in across the body. The standing leg stays straight.
3. It swaps sides each beat, with a short break between.

## v1.82.60 — No more drifting off on your own · Running man from every angle

**Drifting**
1. Check the version reads **v1.82.60**. Play a game where you use the movement stick (Coin dive, Bumper boats, Ski), and keep your thumb on the stick as the game ends.
2. Go into free dance (or just stand on the floor) without touching anything. Your character stays put and doesn't walk off toward a corner.

**Running man**
3. In free dance pick **Running man**. Facing the side, the knee comes up in front of you.
4. Press **180**: facing the other way, the knee still comes up in front (it used to come up behind).
5. Press **90** (front or back view): the legs stay under the hips and the knees lift toward you, instead of the feet kicking out sideways.

## v1.82.59 — Coin dive: left stick swims, right stick flicks the dash

1. Check the version reads **v1.82.59**. On a phone in **Coin dive** there are two sticks: the **left** one swims, and the **right** one (labelled FLICK) dashes.
2. Flick the right stick quickly from the middle out to the edge: you dash that way, turning sharply into it. A slow push on it does nothing.
3. The right stick glows gold on the beat. Dash then for **PERFECT**.
4. The left stick never dashes now, however fast you move it.
5. On a computer nothing changes: click to dash, Space to dash the way you're steering.

## v1.82.58 — Coin dive: flick or click to dash · no swimmers on a dry floor · Ski: just JUMP, wide curvy swoops

**Coin dive dash**
1. Check the version reads **v1.82.58**. The DASH button is gone.
2. **Phone:** flick the stick quickly from the middle to the edge. You dash that way, turning sharply into it. A slow push just swims as normal.
3. **Computer:** click anywhere on the water and you dash toward the click. **Space** still dashes the way you're steering.
4. A ring round your swimmer pulses on the beat and turns **gold** while a dash would be **PERFECT**.
5. Tuning lab → Coin dive → **DASH: flick speed** sets how fast a flick has to be.

**After the game**
6. When Coin dive ends, the water drains in under a second and everyone stands back up. Nobody's left lying in a swimming pose on the dry floor (on phones or the laptop).

**Ski**
7. The Swim / YMCA / Disco trick buttons are gone. On a computer, the little mouse shows just **JUMP** on the left button at the start, and hides after your first jump (or 12 s after GO) for the rest of the game. Left click jumps, and right click does nothing.
8. Dance jump swoops are now **wide, flowing S-curves** across the screen. Jumps 2 and the Super have a **loop** in them. The line you can stay on is wider and more forgiving (a wobbly drag still counts), and it still narrows toward the end.

## v1.82.57 — Coin dive: coins spread across the whole water

1. Check the version reads **v1.82.57**. Play **Coin dive** with a few people (or practice swimmers).
2. Coins now come in on **three trails at once**, one in each third of the water (left, middle, right), each sweeping around its own area. The song's notes are shared between them, so there's always something to go for away from everyone else.
3. The drop's ring is much bigger, right across the water (16 coins).
4. Practice swimmers each work their own trail, so they spread out instead of piling onto one coin.

## v1.82.56 — Coin dive on the laptop · streak effects in pixel art

**Coin dive on the stage view**
1. Check the version reads **v1.82.56**. Go live, then start **Coin dive** with a song.
2. On the laptop's stage view you now see the coins. They're the same coins in the same places as on everyone's phones, popping in on the beat (gold in the loud parts, a ring at the drop).
3. When someone grabs a coin on their phone, it disappears from the laptop too.
4. Two phones side by side show the coins in exactly the same spots, even if one has the chat bar open.

**Streak effects**
5. In a dance game, get a streak going (10+). The flame or glow behind a dancer is now made of blocky pixel cells, and the lightning at 100+ is a pixel zigzag.
6. The **"25 STREAK!"** pop-ups and the **x12** combo counters over heads are in the pixel font, with no smooth text.

## v1.82.55 — Harmony and strum start off · a two-key song ticks Alt for you

1. Check the version reads **v1.82.55**. Turn on **Harmony layer** and **Strum**, then reload the page: both are **Off** again. Your harmony interval and strum speed are kept.
2. In **Start song**, pick a song whose name has two keys (e.g. "Song - D Major - B Minor"). The key and alt key fill in, **Alt is ticked for you**, and the tip says it changes key.
3. Then pick a song with one key in its name, or none: Alt unticks again (only if it was ticked for you).

## v1.82.54 — Alt key off until you tick it · chord mode starts off

1. Check the version reads **v1.82.54**. Reload the laptop page.
2. **Start song** panel: the **Alt** key row has a checkbox, unticked, and its two dropdowns are greyed out. The same goes for **Setup → Play**: the Alt root, scale, octave and the Swap button are greyed out until you tick **Alt**.
3. Press **Shift** with Alt off: nothing swaps, and a small note says "Alt key is off: tick Alt to use it".
4. Tick **Alt** and pick a key: Shift swaps between your key and the alt key as before.
5. Untick Alt while you're on the alt key: you go back to your main key.
6. **Chord mode** is off every time the page loads, even if it was on last time. Turn it on when you want it. Picking a preset that has a chord still turns it on.

## v1.82.53 — Sound effects in pixel art

1. Check the version reads **v1.82.53**. Play a guitar, banjo, horn or anything that sends out sound waves.
2. The little sound-wave arcs coming off the instrument are now stepped pixel arcs, not smooth lines. The same goes for the puffs off wind instruments and the band drummer's sticks.

## v1.82.52 — New mini game: Coin dive (swim to the beat, grab the coins)

**Needs the Render server redeployed** (the server now relays coin grabs).

1. Check the version reads **v1.82.52**. On a phone, go into **Practice → Start game → Ride & race → Coin dive** with a song. Or on the laptop, **Start song** → the **Water** category → **Coin dive**.
2. The venue floods within a couple of seconds and everyone lies flat, swimming.
3. Push the stick (or the arrows / WASD). You glide that way, and on **every beat** you take a stroke that surges you forward. Your arms pull round in time, and a little swirl shows behind you each stroke.
4. **DASH** (the button bottom right, or Space) lights up gold on the beat. Dash right on the beat: **PERFECT**, a big kick and +5. Off the beat: a small kick and **OFF BEAT**.
5. Coins pop in on the song's beats. They follow trails made from the song's notes that sweep across the water bar by bar, so you swim along them in time. Loud parts make **gold** coins worth more, and the drop bursts a **pink ring** of coins.
6. Grab a coin while it's fresh for full points (less once it's older), and **on the beat for double**. Coins blink before they go (about 6 beats).
7. Practice swimmers chase coins too, and a coin anyone grabs disappears.
8. Live with 2 phones: a coin one person grabs disappears on the other phone too, and only the first grab counts.
9. The laptop's stage view floods as well.
10. **Sliders:** Setup → Tuning lab → Coin dive: game speed, glide, stroke surge, water drag, top speed, the DASH on-beat window, how long coins last, coin size and grab reach.

## v1.82.51 — The computer band's drummer plays a full drum kit

1. Check the version reads **v1.82.51**. Start a song with **Auto band** on, so a drummer joins.
2. The drummer sits behind a kit: kick drum in front (red shell, white head), snare and hi-hat on the left, a rack tom on the kick, a floor tom and a crash cymbal on the right.
3. On kicks the kick drum's head flashes with a ring. On snares the left stick comes down on the snare. On hi-hats the right stick (crossed over) hits the hat, which flashes. About every 4th kick, the right stick goes out to the crash.

## v1.82.50 — Ski: one dance jump per ramp (1, 2, Super across jumps), slower, speed sliders · plucked strings start in Impact

**Dance jumps across ramps**
1. Check the version reads **v1.82.50**. Each ramp jump now gets **one** swoop, never several in a row.
2. Ramp 1 is jump 1. Flick it hard enough and a pop-up says **LAND IT: NEXT RAMP = JUMP 2**. Land cleanly and the next ramp gives swoop 2. A soft flick says **FLICK HARDER FOR JUMP 2** and the next ramp is jump 1 again.
3. Complete swoop 2 and land: **NEXT RAMP = SUPER!** The Super on the following ramp needs a really hard flick. After it, you're back to jump 1.
4. Crashing, going off the line, letting go early, or landing before you finish all send you back to jump 1.
5. When a song ends, the swoop disappears instead of staying over the results.

**Slower, and sliders for it** (Setup → Tuning lab → Ski; saved on that device)
6. Ski is a bit slower by default. The new and changed sliders:
   - **Game speed:** everything on the slope, 0.85 by default; 1 was the old speed.
   - **Top speed** and **Acceleration** (defaults lowered a little).
   - **Dance jump: slow motion:** how much time slows while a swoop is up.
   - **Dance jump: flick power for jump 2** and **for the Super**.
   - **Dance jump: extra air.**

**Plucked strings start in Impact**
7. Pick any guitar, banjo or shamisen: the mode switches to **Impact** by itself. Basses aren't included.
8. Then pick a violin, piano or anything else: it goes back to the mode you had before (e.g. Sustain). If you changed the mode yourself while on the guitar, it keeps your choice.

## v1.82.49 — Ski: clean swoops after the first, tapering from wide to skinny

1. Check the version reads **v1.82.49**. HOP off a ramp: the first swoop still has the dimmed slope, the title and the **FLICK!** label, so you learn it.
2. Flick it hard enough for the 2nd: it's just the swoop and the hand. No dimming, banner, titles, FLICK! label or hint text. The same goes for the Super.
3. Every swoop starts wide at the hand and narrows toward the end, and the line you have to stay on narrows with it.

## v1.82.48 — Ski: dance jumps (drag and flick the swoop)

1. Check the version reads **v1.82.48**. Start **Ski**. The first few ramps have a sign at the lip: **HOP AT THE END! big air = dance jumps**.
2. HOP right at the end of a ramp. As you take off, time slows and a swoop pops up: a curl with a hand in its inner end, an arrow and **FLICK!** at the open end, and **DANCE JUMP 1/3** along the bottom.
3. Put your finger on the hand (or click it with the mouse), drag it along the swoop, and flick it out of the end as hard as you can. You go higher, do a dance move, and get points. The result shows your **POWER %**.
4. A hard enough flick (100% power) brings up the **2nd** swoop: a longer curl. Get it round and out and the **SUPER 3/3** swoop comes up: a long spiral, a narrower line, and it needs a really hard flick. Too soft says **NOT HARD ENOUGH (x%)**.
5. Wander off the line and it says **OFF THE LINE**. Let go before the end and it says **FLICK IT OUT THE END!** Either way, no crash: you just land normally.
6. Roll off a ramp without hopping: you get less air (the swoop still comes up, but there's little time) and a pop-up says **HOP AT THE END = MORE AIR!**
7. On a computer, the little mouse help picture hides while a swoop is up.

If the power needed feels too hard or too easy on your phone, tell me the % you're getting and I'll tune it.

## v1.82.47 — Bumper boats: tipping at the edge, knockout saves, rounds with a shrinking pool

**Tipping at the edge**
1. Check the version reads **v1.82.47**. Start **Bumper boats** (practice with a few dancers is fine).
2. Drift slowly over the edge. Your boat slides out and tips, your character leans over, a flashing **!** appears over you, and the hint says **STEER BACK IN!**
3. Steer back toward the middle: the boat comes back level and you stay in.
4. Do it again but don't steer: you tip further and go over.
5. Drive (or BOOST) straight at the edge flat out: you go straight over with **TOO FAST!**

**Knockout saves**
6. Bump someone so they go over within 3 seconds: you get **KNOCKED OFF** points plus **🛟 +1 SAVE**, and the hint shows 🛟×1. You can hold up to 2.
7. Next time you'd go over (tipping too far or too fast), a ring bursts out, it says **🛟 SAVED!**, you're pulled back in, and the save is used up.

**Rounds**
8. The score shows the round above it (R1/3; R1/2 for short songs). The pool visibly shrinks during each round, down to under half size.
9. When the next round starts, everyone who was out is back in a boat, the pool fills back up, and the banner says **ROUND 2 OF 3**. The last round says **FINAL!**
10. The last boat floating each round gets the bonus. Points carry across all the rounds.

## v1.82.46 — Free dance Shuffle matches the game version

The Shuffle in free dance now works the same way as in the games (Keepy uppy).

1. Check the version reads **v1.82.46**. In free dance, pick **Shuffle**.
2. Move the left stick a little, or partway, in any direction. You keep doing the running man while you move around the floor, the same as in Keepy uppy.
3. Push the stick right out to the side. That's the T-step, travelling that way.
4. Let go and you're back to the running man on the spot. Pushing the stick to the top edge still does the spin.

## v1.82.45 — Floss reworked

1. Check the version reads **v1.82.45**. In free dance, pick **Silly**, then **Floss**.
2. On each beat both arms swing together to one side, low and nearly straight. The far arm goes out to the side, and the other crosses the body at hip height.
3. The body leans toward the arms while the hips and feet swing the other way, then everything swaps on the next beat.
4. Left stick left and right changes how wide the swing is. Up and down changes the speed.

## v1.82.44 — Skank: the kick is on the opposite side to the arm

1. Check the version reads **v1.82.44**. In free dance, pick **Skank** (Classic).
2. On each beat one arm swings out. The knee that comes up is on the **other** side, turned in a little but still under its own hip (not crossing under the arm).
3. The next beat swaps: the other arm out, the other knee up.

## v1.82.43 — Menu music keeps playing in practice free dance

1. Open the site and check the version reads **v1.82.43**. Tap once so the menu music starts.
2. Go into **Practice**, then tap **Free dance**. The music keeps playing at the same level while you dance.
3. Start a mini game from **Start game**. The menu music fades out for the round's song, and comes back when the round ends.

## v1.82.42 — YouTube videos always play on the Jumbotron

YouTube's embed rules say the player must be visible, at least 200 px tall, never covered, never hidden, and never played muted out of sight. YouTube songs now follow those rules everywhere.

**On the laptop (performer):**
1. Start a YouTube song in jam. The screen switches to the stage view and the video plays on the Jumbotron, about 480 x 270, with nothing drawn over it (you stand beside it, not in front).
2. Press **T**: it says "YouTube videos stay on the Jumbotron" and the video doesn't hide.
3. In **Stage & FX**, raise the Jumbotron: it stays down while the YouTube video plays.
4. Start a YouTube song from **Start song**: there's no "getting the video ready" wait any more. If an ad plays, it shows on the Jumbotron and the game waits at the start of the song until the ad is over.
5. Song search without a YouTube API key now asks for a key (Search → Add key). Pasting a link still works without one. Playlists need the key.

**On a phone:**
6. While the performer plays a YouTube video, the Jumbotron comes down even if the performer raised it, sits below the fullscreen button, and the video is at least 356 x 200.
7. You can tap the video now (YouTube's controls work). If you pause your copy, it catches back up with the performer within a few seconds.

Your own music files and the site songs don't change: they still play however the show is set up.

## v1.82.41 — Main menu music starts on the first tap

The opening song wasn't starting on phones. The first touch on a phone doesn't count as permission to play sound, so the song was blocked and then never tried again. Now every tap or key retries until it's actually playing.

1. On your phone, open the site fresh (close the tab first). Check the version reads **v1.82.41**.
2. Tap anywhere on the main menu once. **After-hours Entry** should start within a second at a normal background level.
3. Try it on a laptop too: one click on the menu should start it.
4. Tap **MUSIC OFF** and then **MUSIC ON**: it should stop and come back.
5. If it's still silent on iPhone, check the ringer switch on the side isn't set to silent.

## v1.82.40 — TV mode: a laptop on the TV, everyone on their phones

**Needs a server redeploy** (clock sync, the TV's song position, the sync check).

**Set up (beta test):**
1. Plug the laptop into the TV (HDMI) and open the performer page. Tap **📺 TV mode** on the bottom bar (or open `index.html?tv`). It goes fullscreen and remembers the setting.
2. **GO LIVE.** A **join card** appears: a QR code, the room code in big letters and the web address. Between songs it sits big in the middle of the screen so the room can scan it from the couch; during a song it moves to the corner. The mouse pointer and buttons hide after 3 seconds of no movement.
3. Everyone scans the QR code (or types the code) on their phone and joins as usual. **Phones can stay quiet**: the sound comes from the TV.
4. Once people have joined, tap **🎯 Sync check** on the join card. The TV beeps 16 times and flashes; everyone taps the big button on their phone on each beep. The TV works out how late its own sound is (TVs add a delay, especially over HDMI), saves it, and shows "Synced! The TV's sound is N ms late". Do it once per TV; it's remembered on the laptop.

**How the timing works now:** every phone measures the difference between its clock and the server's (quick pings, keeping the fastest). While a song plays in TV mode, the laptop tells the room every second which point of the song is being *heard* right now, at what server time, allowing for the laptop's own audio delay. Each phone works out the song position from that, less the TV's sound delay, so **every phone plays to the TV's sound, whatever its own network lag**, and nobody is behind because of a slow connection. (Tested with a local server: phones were within 2 ms of the TV's position, and the delay was taken off exactly.)

- Check: TV mode → go live → scan the QR code with a phone → sync check (tap along) → start a step dance round: the arrows should land on the beat you hear from the TV. If they feel early or late, run the sync check again.
- To leave TV mode: ✕ on the join card, or the TV mode button.

## v1.82.39 — "Your turn plays" only in a free dance round

- The **Your turn plays: 1. … 2. … 3. …** bar is hidden when you're just dancing on the floor. It only shows during a free dance round (the mini game where your turn in the spotlight plays those dances), live or in practice.
- Check: free dance from the floor: no turn bar. Start a free dance round: it's there.

## v1.82.38 — Cyber goth: Stomp & reach

- **Cyber goth → Stomp & reach** (it was Stomp & punch), from a new clip: a **wide, low stance**; on each beat **both arms reach up** in a V tilted to one side, then **pull down hard** with the fists to the chest as that foot **stomps** and the weight drops onto it, then the other side. The reach is quick and the pull is the hit. It's also the base of Mix it up. Right stick: arm size, and up for double time. Left stick moves you.
- Check: free dance → Cyber goth: reach up to one side, pull down with a stomp, swap.

## v1.82.37 — Shuffle's Running man side-on

- **Shuffle → Running man** is now **side-on** like the Running man dance, from a new clip, but with the shuffle's sharp timing: on the "and" a knee **snaps up** in front and holds; on the beat it **stomps down** as the standing foot slides back, and the **other leg** takes the next one. Arms loose and low, bent, a hand pumping up with the knee.
- T-step and Spin are unchanged (T-step still faces front). Mix it up's running-man bars are side-on too, and 90 / 180 turn it.
- Check: free dance → Shuffle → Running man: side-on, knees alternating with a snap and a slide.

## v1.82.36 — 90 / 180 / Spin / Twirl work again in turned dances; Skank kicks across the body

- **Fixed:** the 90, 180, Spin and Twirl buttons did nothing in dances that set their own facing (Running man side-on, Shake it facing away, the moonwalk). The dance's facing is now turned by the buttons instead of replacing them: Running man faces right, 180 faces left, 90 faces the front, and spins go round.
- **Skank → Classic**, from the new photo: on each beat a snap and a hold (the stop frame): **one arm swung out to the side**, the **other fist bent across the chest**, and **the leg on the other side kicking inward across the body** with the knee up. The first stop frame is the left arm out, then it swaps sides, with a short break between.
- Check: free dance → Running man → tap 180 then 90: it turns. Skank: arm out + fist at the chest + knee across, swapping each beat.

## v1.82.35 — Running man side-on, legs taking turns

- **Running man** (Classic and Fast) now starts **side-on, facing right**, from a new clip: on each beat one knee drives up in front while the standing foot slides back into a long stride, then that knee comes down in front and **the other leg** comes up on the next beat, so the legs alternate properly. The hands are bent up at the chest, pumping down as the knee rises. Arms pump swings the arms like running. Moonwalk is unchanged.
- Check: free dance → Running man: side-on, left knee then right knee, the feet sliding back each beat.

## v1.82.34 — Puppet dance removed

- **Puppet** is gone from free dance: it's no longer in the dance buttons, the "your turn plays" random picks, or on the ' key. (Someone on an older page still dancing it shows up fine.)
- Check: free dance: the list ends at Techno march.

## v1.82.33 — Skank (Classic) from a new clip

- **Skank → Classic** now snaps on each beat: **one arm pumps up** (bent at the elbow) as **the opposite foot kicks out**, holds, eases back, then a **short break** in a bouncy bent-knee stance with the fists by the chest, before the other side: right arm + left foot, then left arm + right foot.
- Sinks into each hit with a little bounce in the break. Left stick still moves you and up kicks higher; right stick up throws the arm higher. Windmill / Pogo / Elbows / Kicks are unchanged.
- Check: free dance → Skank → Classic: arm up + opposite kick on every beat, with a clear pause between.

## v1.82.32 — Mosh pit: dedicated headbang moments; Shake it body moves with the butt

- **Headbang is its own moment now.** Each song's mosh pit gets two **🤘 HEADBANG!** moments (16 beats each, in the middle of the two mosh pit stretches). Outside them there's no headbang meter, so the screen stays clear for moshing.
  - When one starts, the banner says **HEADBANG! ON THE BEAT**, punching stops, and the aim stick is swapped for a **BANG panel** in the same bottom-right spot: a block drops onto the red line on every beat.
  - **How to score:** tap the BANG panel (or anywhere on the floor) on a phone, or press **Space** on a computer, right as the block hits the line, once a beat. PERFECT +60, GREAT +35, GOOD +15, and a streak adds up to double. The panel says all this, and the result flashes over your head ("PERFECT BANG x5").
  - Laid out for both portrait and landscape phones (a short, wide panel in landscape), clear of the movement pad.
- **Shake it (Wiggle / Fast):** the body now rides up and down with the butt: it dips on each snap, sinks when you push the butt down with the right stick and rises when you lift it. Still no side-to-side sway.
- Check: a mosh pit round: about a quarter of the way into the song the HEADBANG moment comes up; tap on the beat and watch the points. Rotate the phone: the panel still fits. Free dance → Shake it: the body bobs with the butt.

## v1.82.31 — Mosh pit aim stick, 8-bit

- The mosh pit's **AIM · SWING** stick on phones is now pixel art like the movement pad: a red ring with a red pixel knob, the ring turning yellow while you hold it (it was a smooth glowing ball).
- The mosh score no longer sits on top of the stick: it's just above it.
- Check: phone → mosh pit round: the right stick is chunky pixels, and the score is clear of it.

## v1.82.30 — Auto band: a computer band that plays along with the song

**Needs a server redeploy** (the server passes the band on to the audience).

- **🥁 Auto band** (a new tickbox in Start a song, next to Auto key / Auto stage; it's remembered): when the song starts, its analysis now listens to the music itself too, and puts a computer band on stage with you. Everyone sees it on their stage.
  - **Who's in the band** comes from the song: a **drummer** when there's a steady kick / snare on the beat, a **bassist** when there's weight in the low end, a **guitarist** (electric when it's bright and gritty, acoustic when it's not) and/or **keys** when the middle is full. An electronic track like Deep 808 Groove gets drums and bass. The other site songs get the full band.
  - **The drummer hits with the song's real drum hits**: the analysis finds the kicks, snares and hats.
  - **Slow and fast parts:** every couple of bars is marked slow, mid or fast from how loud and how busy it is. The band follows: in slow parts the bass plays every other beat, the guitar lets chords ring for a bar and the drummer just keeps time on the hat; in fast parts the bass drives short notes and the guitar strums eighths.
  - Works for your own song files and site songs. For YouTube songs that went through practice, it uses the stored analysis (drums, bass and guitar).
  - The band leaves the stage when the song ends or is paused.
- Check: Start a song → tick Auto band → pick a site song → Start: the band appears round you, the drummer hitting with the drums, and they ease off in the quiet parts. Viewers see the same band.

## v1.82.29 — Jump on stage: viewers play an instrument between songs

**Needs a server redeploy** (the server keeps the stage list and passes the notes on).

- **🎤 Jump on stage** (a new button with Talk / Voice / Dance on the venue page): up to **3 viewers** at a time get up on stage beside the performer, holding their instrument and playing it as they go. **Everyone in the room hears them**, the performer too, each on their own instrument.
- **Your instrument:** on a phone, the play pad fills the bottom half of the screen (the same D / Space / E / 3 + circle pad as the phone instrument, with S+D). On a computer it's a panel at the bottom, and the **arrows and D / Space / E / 3** play it like the jam screen (click it first). Tap "Tap to start playing" to turn the sound on. You play in the performer's key, and it follows when they change it. Instruments, octave and the 1/2/3 banks are all there.
- **A song starting sends everyone back to the floor** ("A song's starting: back to the floor!"), and the stage stays closed until the song ends. The button shows "Stage full (3/3)" or "Stage closed (song on)" when you can't get up.
- Leave any time with **▼ Leave stage** (or the ✕ on the pad). Leaving the room takes you off stage too.
- Not in practice (there's nobody to hear you there) or during games.
- Check: two phones in a live room. One taps Jump on stage, then Tap to start playing, and plays: the other phone and the performer hear it and see them on stage. Start a song: they're sent back down.

## v1.82.28 — Phone play screen: pixel-art lit slice, S+D button back

- **The lit slice of the circle** (the part that lights up while you hold a note on the phone play screen) is pixel art now: a stepped wedge with a dithered fill and a bright edge, in the note's colour (it used to be a smooth see-through shape).
- **S+D is back:** a small **S+D** button under the tall D button on the left plays the top level (Space and D together) with one thumb. Holding D and Space together still works too.
- Check: phone → play: hold the circle, and the slice is chunky pixels. Tap S+D: the bottom bar says Zone 4 · Space+D and the notes move up.

## v1.82.27 — Instrument / Fullscreen / Setup buttons 8-bit; Use this instrument in the top bar

- The **instrument** button (top left), **Fullscreen** and **Setup** on the jam screen get the 8-bit look: Silkscreen type, square chunky borders, pixel shadows. The quick instrument menu that drops from the instrument button matches.
- In the instrument browser, **Use this instrument** is now up in the top bar next to Back (top right, beside the ✕), so it's always in reach without scrolling.
- Check: jam screen: the three buttons are pixel style. Instrument button → browse → open any instrument: "✓ Use this instrument" is top right.

## v1.82.26 — Start a song panel, 8-bit and cleaned up; a 3-button bar

1. **Start a song** (performer jam screen) is restyled in the game's 8-bit look: Silkscreen type, square chunky borders, pixel shadows.
   - **The song:** the site's own songs are in a dropdown at the top. **Music / Video / YouTube** open your own songs, videos or a YouTube search underneath; click the same one again to fold it away.
   - **The games:** a clean row of categories: No game, Crowd vote, Rhythm, Dance, Ride & race, Team, Water. Click a category to see its games and pick up to 2. A category with a picked game shows a yellow count.
   - **Only blocks the screen when you're live.** When you're not live it floats on the right with no dark cover, and the stage behind it still works.
2. **The bottom bar** is down to three buttons: **Stage & FX**, **Start song**, **Hang out**. Stage & FX opens the stage effects with a **Visual FX on the Jumbotron** button at the top (that was the FX button). The ✨ / ⏭ / 🎲 / ▶ / ▶❚❚ buttons are gone, since the song panel runs the song now.
3. **Setup** keeps the full classic master control panel as a backup, unchanged.
- Check: jam screen → Start song: pick a site song from the dropdown, open Ride & race and pick two games, Start. Not live: you can still click the stage behind the panel. Stage & FX → Visual FX opens the visual picker. M still opens Setup.

## v1.82.25 — Bumper boats is neon night

- **Bumper boats always plays in neon night:** the room goes black with lasers, and everyone (and the performer) is drawn as glowing outlines.
- **The boats are glowing neon rings** in each rider's colour, as bright as that colour goes, with a white-hot core, a glow lighting the water under them, and a bigger glow while boosting.
- **The water and room:** the floor drops away to a black void with a neon grid running off into the dark and pink/cyan sparks. The pool is deep dark-blue water with glints, a pulsing cyan rim and a pink outer ring, and its underside is traced in pink. The waterfall drips are cyan and pink, splashes flash neon, and the OUT raft is a dark plank edged in neon pink.
- The performer's own boats view gets the same dark water, glowing rims and neon rings.
- Check: start a bumper boats round (practice or a show). Neon night switches on for the round and off after.

## v1.82.24 — Chill music carries on into practice; Queue Lights after After-hours Entry

- The front-page music keeps playing when you go into **Practice** and walk around the dance floor. It fades out when a practice round or game starts and comes back when it's over.
- When **After-hours Entry** finishes, it moves on to **Queue Lights**, then back again (it used to loop the one song).
- Check: click on the front page (music starts), go into Practice: it carries on. Start a round: it fades out. Finish: it comes back. Leave it running to the end of the song: Queue Lights comes on.

## v1.82.23 — Faded SPACE / D / E / 3 keys gone from the jam screen

- The row of faded SPACE, D, E, 3 key hints above the stage on the performer's PC jam screen is gone. The keys still work.
- Check: open jam mode on a PC: no faded key row.

## v1.82.22 — No Next Song popup at the end of a song

- When a song or backing track finishes on the performer page, the **Next Song** picker no longer pops up over the screen. You just get the small "Song ended" notice. The picker still opens from its button whenever you want it.
- Check: let a song play to the end on the performer page. No popup, just the notice.

## v1.82.21 — Refresh lands on the front page; menu music at a normal level

- **Refreshing goes to the front page.** The Practice button used to put `?practice` in the address, so every refresh after that jumped straight onto the dance floor. It doesn't any more, and an address left with a bare `?practice` from before is cleaned up on load and stays on the front page. Links with extra flags (tuning lab, test drives, the host's embed) still go straight in.
- **Menu music:** no more very quiet start and slow 10-second swell. It comes in at a normal background level with a 1-second fade, and still fades out when you leave the menus.
- Browsers don't allow sound until you've clicked, tapped or pressed a key on the page, so the music starts on your first click or tap on the front page.
- Check: open the venue fresh (even an old `…?practice` address): you're on the front page. Click anywhere: the music is at a comfortable level within about a second. Go into Practice, then refresh: you're back on the front page.

## v1.82.20 — Emote wheel; Shake it butt on the right stick; no dance help text

**Needs a server redeploy** (the server has to accept the new emotes).

1. **Emote wheel:** a button in the bottom-right corner (a smiley) opens a ring of 10 emotes: Hearts, Big heart, Clap, !, Confused, Happy, Excited, Wow, OMG, Surprised. Click one, or press **E** to open it and **1–0** to pick. Esc or a click outside closes it.
   - Each new emote pops a pixel icon up over your head (a face, a red "!", or a WOW / OMG speech bubble), with its own pose: Happy bounces, Excited hops with fists up and sparkles, ! jumps startled, Confused scratches the head with a "?", Wow flings the arms up, OMG puts the hands on the cheeks, Surprised jolts back. Each has a little sound.
   - The hearts / big heart / clap / whistle buttons and their keys (E R Y U) are gone from the bar; the wheel replaces them. Jump, spin and twirl stay as buttons (Q T G).
   - The performer screen shows the new emotes on people, and the crowd bots use some of them.
2. **Shake it (Wiggle / Fast):** the body stays steady (no sway, no bounce); only the butt shakes left and right to the beat. The **right stick moves the butt itself**: left, right, up, down. Let go and it shakes on its own again. Drop it no longer sways the body either, and its right stick moves the butt too.
3. **Free dance help text** under the character is gone.
- Check: press E, pick each emote and watch it on yourself and on the performer screen. Free dance → Shake it: the body holds still and the butt follows the right stick.

## v1.82.19 — Moonwalk side-on; performer screen shows turned dances

- **Moonwalk** starts side-on, facing right, and glides backwards to the left. After 4 beats it turns to face left and glides back to the right, so it's always moving backwards.
- Fixed: a leaning body facing left was drawn facing right. That affected the moonwalk and any other dance that leans while facing left.
- **Performer screen:** dances that turn you (Shake it facing away, the moonwalk side-on, the shuffle spin) now show the same way on the big screen. Before, everyone there faced front.
- Check: free dance → Running man → Moonwalk. You face right and slide left for 4 beats, then face left and slide right. Watch it on the performer screen too, along with Shake it from behind.

## v1.82.18 — Shake it: Drop it turned round, popping and dropping low

- **Drop it** now matches the reference clip: you turn your back to the crowd, stand with your feet wide, and bend over with your hands on your thighs. The butt pops down and up every half beat, the hips tilt to one side then the other each beat, and on beat 4 you drop right down low with the knees out wide, then come back up.
- Right stick: up = stand taller, down = squat lower, sideways = pop harder. It no longer triggers the named moves or throws the arms up in Drop it. Left stick: move around the floor.
- The squat comes from **bending the knees**: the feet stay at hip width and the knees push out to the sides as you sink, instead of the legs spreading apart. Wiggle and Fast squat the same way.
- **The butt shows from behind:** in Wiggle, Drop it and Fast you get two rounded cheeks in your trouser colour, wider than the hips, with a crease. They get bigger the lower you squat, and one cheek bounces up on each pop or shake. (Long dresses don't get it.)
- Hands up is unchanged.
- Check: free dance → Shake it → Drop it. You face away, pop on every half beat and drop low on the 4 with the knees bending out. Push the right stick down and you stay lower all the time. The butt is clearly visible and bouncing. Watch another player do it on the performer screen too.

## v1.82.17 — Shake it: Wiggle / Fast turned round
- Wiggle and Fast turn you round, bent forward with your hands on your knees, shaking your butt side to side on the beat. Right stick sets the butt level (up taller, down squat, sideways shake harder). Left stick moves you.

## v1.82.16 — Free dance keys
- WASD moves you straight away on a tap and eases out to the edge the longer you hold. Smaller Shuffle dead zone.

## v1.82.15 — Fishing / boats tuning sliders
- New Fishing and Bumper boats sections in the tuning panel (paddle rise, fall, drag, bounce, size, catch speed, drain, fish speed, and more). No line tension any more: the reel just spins. The catch fills quicker and you lose the fish in about 5 s if it's out of the paddle. In Shuffle, holding up or down walks you up or down.

## v1.82.14 — Hair keeps its sides through turns; rod held in both hands
- Ponytails, side tails and braids go round behind the head as you turn, instead of flipping sides. Anglers hold the rod in both hands.

## v1.82.13 — Brighter Jumbotron visuals
- The visualizer on the Jumbotron gets a brightness boost and a glow pass, so it reads from across the room.

## v1.82.12 — Performer jam screen tidied
- The faded keypad and the visualizer name are gone from the performer's jam screen.

## v1.82.11 — Fishing: mouse lined up with the box
- On PC the paddle sits exactly under your mouse inside the box. The glow goes green on any touch of the fish. The net strip sits under the box.

## v1.82.10 — Shuffle spin
- The spin is a T-step stomp in place, steered by circling the left stick. The T-step no longer slides on its own.

## v1.82.9 — Shuffle on the stick
- Stick left or right: face front and T-step that way, slower near the middle. Push to the top edge for the turnaround spin; bring the stick down again to re-arm it.

## v1.82.8 — Menu music
- "After-hours Entry" plays on the menus, starting very low, swelling to a low background level, and fading out when you leave. Toggle on the menu.

## v1.82.7 — Test hairs
- Test hairs 1-3 from Assets/Hair, recoloured to the player's hair colour.

## v1.82.6 — Fishing paddle physics; CPU karts and boost pads
- The paddle falls on its own, rises while you reel (click and hold), and bounces softly off the box sides. Phone: two-bar pad (top half reels, bottom half lets go, left/right moves the paddle). More time to catch. CPU karts route round boost pads that would push them backwards.

## v1.82.5 — Step dance Hard eased
- Hard sits between Normal and Expert again.

## v1.82.4 — Fishing reel box
- Fish swim inside the box and you keep the paddle on them. Free dance keys ease out; no stuck limbs after leaving a dance.

## v1.82.3 — Ski follow view by points
- The ski camera ranks and follows skiers by points, showing how far ahead or back they are.

## v1.82.2 — Free dance: watch the middle dancer big; 8-bit fishing & boats; boats rebalanced

**Needs a server redeploy** (the server bots follow the new bumper boats pool size).

1. **Free dance spotlight, watching:** whoever's in the middle is now shown as big as on your own turn, and the camera frames them in the space above the planner. Everyone else is right out at the edges and behind, slowly shuffling round the circle.
2. **Planner:** a new **▼ WATCH** button hides it so you can just watch. A small **▲ PLAN MOVES · your turn in 0:42** tab at the bottom brings it back. It opens again by itself after your turn. On a PC the planner is only as tall as it needs to be.
3. **PC zoom:** free dance starts at 150% on a computer, and so does the dance floor when you first load. Your own zoom choice is still remembered.
4. **WASD in free dance:** a tap just sways you a touch. Hold it and you slowly start to travel, up to half walking pace. The stick still works the old way.
5. **The leftover "CAST" tag** (from fishing) no longer hangs about after the game.
6. **8-bit pass on fishing and bumper boats:** every oval, ring, line, glow, gradient, fish, net, reel and boat is now drawn in whole pixels, on the venue and the performer screen. The CAST / NET and BOOST buttons are chunky pixel buttons, and BOOST refills from the bottom in pixel bands.
7. **Bumper boats:**
   - BOOST is gentler (about two-thirds the kick) and takes 4.5 s to refill (was 2.2 s).
   - The pool drains over the whole game: water pours off the rim in streams of drips, and it shrinks to 40% by the end (it used to stop shrinking after 80 s).
   - The last boat floating wins ("🏆 YOU WIN!") and can't go over any more, so a round can't end with everyone out.
   - Once you're out, the stick and BOOST button hide while you watch from the raft.

## v1.82.1 — Fishing: bamboo reel bar

1. **The reel panel** now looks like Stardew Valley's fishing bar turned on its side: a bamboo frame round two strips of water, a green catch box, and the fish glowing when it's in the box while you reel.
2. **Bottom bar renamed:** the top bar is "▲ REEL" and the bottom bar is "▼ SWAY · NO REEL" (it was SLACK). Same controls: up reels, down sways without reeling. Hints and the help card say the same.
3. **Catch meter and line tension:** the catch meter is a bamboo tube underneath that fills green. Line tension is the ring round the reel at its end; it flashes red with "SNAP!" when it's about to break, and the handle spins while you reel.
4. **Fish** have a dark outline so pale ones (the minnow) stand out on the water.

## v1.82.0 — 2-parters (Ice rink → Ski, Fishing → Bumper boats), and two new games

**Needs a server redeploy** (new modes, scores carry over between the two halves, server bots play the new games).

1. **2-parters in the game picker** (performer, Start a song): *Ice rink ➜ Ski* and *Fishing ➜ Bumper boats*. Each takes the whole song: part 1, then part 2 takes over around the middle (on the drop if there is one near the middle, otherwise on a bar or a part change). There's no results screen in between, and points carry on into part 2. Results come at the end.
2. **Transitions** (every player's screen): Ice ➜ Ski freezes the rink, tilts it up into a slope, snows it into a white-out, and clears when the mountain is ready. Fishing ➜ Boats breaks the dance floor into tiles that fall away into the dark, and the pool rises up floating. A small card says "Part 2 · your points carry on" with the countdown.
3. **Fishing** (also on its own in the picker, and in Practice):
   - A pool opens in the middle of the floor and everyone stands round the edge.
   - CAST (Space / tap), then wait for the bite.
   - **Reel:** the two joined bars are your stick. UP (top bar) reels in, DOWN (bottom bar) gives slack, and left/right sway the box to stay on the fish. Reeling on the fish fills the green catch meter. Reeling off the fish, or a big fish fighting, pulls the LINE meter up, and full = SNAP. Slack lets the line relax but the fish starts getting away.
   - **Net:** fill the meter and a net swings left and right over the fish. Tap NET when it's on it (two tries, the second faster; dead centre = PERFECT NET ×1.5).
   - Fish: Minnow 60, Perch 120, Bass 220, Pike 380, Golden koi 650. The big ones bite in the drop / chorus / finale.
   - You can walk round the edge with the stick while you're not fishing.
4. **Bumper boats** (also on its own, and in Practice):
   - The floor is gone and the pool floats.
   - Steer with the stick / WASD, and BOOST (Space / tap; it refills) to ram.
   - Bumps bounce both boats. Near the edge the water pushes you back, so it takes a real hit (or a boost) to go over.
   - Over the edge = out till the end of the round, sat on the raft at the bottom.
   - Points: staying afloat (8 a second), hard bumps / rams, **knocking someone off** (+300 if you hit them in the 3 s before they fell), and **LAST BOAT FLOATING** (+500).
   - The pool slowly shrinks (to just over half size by 80 s) so it always ends.
5. **Performer screen:** shows the pool with everyone's fishing lines, and for boats the void, the floating pool and a coloured bumper ring round each player.
6. **Bots:** the room-fill bots stand round the pool and fish, or drift round in boats and sometimes get knocked off. Practice dancers do the same.

To test the hand-over without a whole song: in Practice pick Fishing, then Bumper boats, to see each half. The 2-parter itself runs from the performer's game picker.

## v1.81.99 — Mosh pit: aim and swing on the beat; practice bots move again

1. **Twin-stick punching:** hold the right stick (phone) toward someone and you swing that way on every beat. A cone shows where you're aiming, and a ring closes in on each beat. Anyone inside the cone gets a PUNCH; dead centre is a SMASH (worth more). Swinging at nothing is a MISS and resets your streak, and landing swings in a row builds a multiplier. On a PC, hold the mouse button and point at someone, or aim with I J K L. Flicking and windmilling no longer score.
2. **HEADBANG box** (the BANG meter) now says what it is ("HEADBANG · tap as it hits"). It sits above the punch stick on a tall phone screen and beside it on a wide one, so it no longer covers the stick.
3. **Bots:** the practice dancers in the games menu now move and play again in the mosh pit, keepy uppy, walk race, half pipe, ski and the rink. Before, they only moved during a practice song, so they stood still.

## v1.81.98 — Ski: lower top speed, less slowdown on slants

1. **Top speed** pointing straight down is about 20% lower (185, was 230), so it stays controllable.
2. **Slants:** skiing across the slope keeps much more speed. A 45° slant now cruises at about 85% of top speed (was about 70%), and a steep 60° slant at about 70% (was under half). The extra drag from carving is also lighter. Pointing fully sideways still brings you to a stop.

## v1.81.97 — Keepy uppy buttons in the bottom-right corner

1. **Keepy uppy on a phone:** JUMP sits in the bottom-right corner, level with the stick on the left, with SPIN above TWIRL just to its left. They no longer float halfway up the right side over the dancers.
2. **On a PC** the same layout, slightly smaller (Space, Q and E still work).

## v1.81.96 — Triples, a circular hair windmill, T-step faces front

1. **Ice free dance triples:** every third double (once the cascades start) gets a third dot in the middle of its line, a beat after the first tap. The pulse runs through it: tap, tap, tap. Your skater keeps flowing through the middle.
2. **Hair windmill** (Headbang): the hair now whips right round the head in a full circle (right, down over the face, left, up) with a fainter trail behind, while the head and body circle with it. Also on the performer's view.
3. **T-step** (Shuffle, and Keepy uppy's stick-out-sideways move) always faces the crowd while it travels; it no longer turns to walk sideways. Spins and deliberate 90 / 180 turns still work.

## v1.81.95 — Ice free dance: connected doubles that pulse and cascade

1. Each double's line is drawn in its first move's colour. Once its first target's beat comes, a **pulse runs over the line** and lands on the second target right on its beat: tap the second one as the pulse arrives (no tracing).
2. The first two doubles come on their own. After that they **cascade**: a second double starts a beat after the first, so two are in flight at once. Then there's a short breather before the next pair.

## v1.81.94 — Ice jumps: crouch & jump with the stick; spins fixed

1. **No more slider.** At a big jump (or the axel), pull the stick back and your skater crouches (deeper the further you pull), then shoot it forward to jump. Keyboard: hold ↓ to crouch, tap ↑ to jump. Let go without pushing forward and you stand back up. Height = pumped speed × how deep you crouched.
2. The stick glows **↓ CROUCH**, then **↑ JUMP!**, and the prompt says NOW SHOOT IT FORWARD!
3. A jump you did early no longer shows "BIG JUMP IN 1" again afterwards.
4. **Spins and jumps** turn through the front, three-quarter and back views only. The side-on frames dropped the arms and the leg, which broke the low (sit) spin; now the leg-out position shows all the way round.

## v1.81.93 — Ice free dance: doubles only

1. The free dance pad now only has **doubles**: two targets joined by a line. Tap the first as its ring closes, then the second 2 beats later. No tracing the line. A new double comes every 4 beats.
2. Your skater strikes the first move, flows towards the second while you wait, and strikes it when you hit the second target.
3. Hit both halves of every double for FLAWLESS ROUTINE.

## v1.81.92 — Pump meter freezes when the flick ring comes up

1. Mash to pump up speed before a big jump (or in the build before the axel). The moment the pull-back ring appears, the speed meter stops draining and holds where you got it, so you can take your time pulling back and flicking without losing height.

## v1.81.91 — Big jumps: speed only, longer flick zone

1. **Big jumps don't care about the beat:** height is just how fast you pumped × how far you pulled back. The prompt says PULL BACK & FLICK, any time.
2. The ring is up much longer for a big jump: **4 beats before to 4 beats after** the moment.
3. The ring's slot is taller: you pull further down for a full-strength jump.
4. The axel on the drop still keeps its (gentle) beat timing.

## v1.81.90 — Ice jumps: more time to pull and flick, slow jumps on the beat

1. The flick ring now comes up **2.5 beats before** the jump moment and stays **2.5 beats after** (it was 1 before, 1.5 after), so there's time to pull back and let go. Timing is judged in beats: PERFECT within about a third of a beat, GREAT about two thirds, GOOD about a beat.
2. Pumping runs for the 8 beats before the ring appears.
3. The jump is much slower: you hang in the air for 3 to 4 beats (higher jumps stay up longer) and always land right on a beat. You go higher, the turns spread over the whole flight, and your arms flare out on every beat in the air. The practice skaters jump slow too.

## v1.81.89 — Ice free dance = a target routine; Target Dance Normal eased

1. **Ice free dance:** your skater stops on the spot and a target pad opens (bottom of the screen). Each target is the next move of a little ice-dance routine (ARMS UP, REACH LEFT/RIGHT, SWAN, LUNGE LEFT/RIGHT, CROSS), sitting where that move points. Tap it as its ring closes and your skater strikes the move: PERFECT is crisp, GOOD wobbles, a miss stumbles. Every few moves there's a swoop: tap, keep your finger on the ball, and the skater flows into the next move. Hit every one for **FLAWLESS ROUTINE +300**. Everyone sees the moves.
2. **Target Dance on Normal** is easier: at least a beat between targets (no more half-beat targets), a beat of breathing room after each swoop, and each target appears near the last one. Hard keeps half a beat; Expert is unchanged.

## v1.81.88 — Ice routine: pump & flick jumps, sit spin and camel spin

1. **Jumps (big moves and the axel):** in the run-up (the 6 beats before a big jump, or the whole BUILD SPEED part before the axel), **MASH** TAP / SPACE. Your click speed fills the speed meter, which drains when you stop. Then a ring appears in the middle of the screen: **pull it back and let go (flick)** to jump. On PC, hold ↓ and let go, or drag the ring with the mouse. Height = pumped speed × how far you pulled × timing. The axel becomes SINGLE / DOUBLE / TRIPLE by height (too low = fall).
2. **Biggest jump:** whoever jumps highest at that moment gets **BIGGEST JUMP +250**.
3. **Long spins:** circle the stick to wind up. Once it says **LEG OUT**, stop circling and hold the stick:
   - 1st long spin = **SIT SPIN**: hold ↓. You sink low on a bent leg with the other leg straight out.
   - 2nd long spin = **CAMEL SPIN**: hold ← or →. You lean over with your leg stretched out behind.
   Holding the position keeps you spinning and doubles the points per turn; holding it to the end scores a bonus. Everyone sees the position.

## v1.81.87 — Ice routine: every part says what to do (and it's not all tapping)

1. **Instruction cards:** about 3 beats before each part starts (and for its first couple of beats), a big card shows the part's name, one line on what to do, and an IN 3 / IN 2 / GO! countdown. A big move gets its own card 4 beats ahead.
2. **Intro = copy the moves:** an arrow shows (↑ ARMS UP, ↓ CROSS, ← ARABESQUE, → PRESENT). Flick the stick / arrow keys that way on the beat, and your skater strikes the move. The wrong way is a miss.
3. **Glide = nothing to press:** just skate together. The prompt says SKATE TOGETHER and how many beats until the next big move or part. The constant stroke-tapping is gone.
4. **Big move = HOLD:** "BIG MOVE IN 3, 2, 1", then hold TAP / SPACE as the ring closes and keep holding for the spiral (a fill bar shows it). Points come from your timing and how long you held. Big moves are marked in yellow on the timeline.
5. Spin (circle the stick), free dance (move the stick), build (press every beat), axel (JUMP IN 3, 2, 1) and finale (POSE IN 3, 2, 1) all count down too.
6. The timeline label shows what's next ("next: LONG SPIN in 6").

## v1.81.86 — Ice routine: circle to spin, and the objective always lit

1. **Long spin:** the left stick glows with a flashing **SPIN ↻** tag next to it until you start circling it (or the arrow keys). The faster you go round, the faster you spin and the more each turn is worth (FAST SPIN pops past full speed). Still spinning at the end scores a bonus by your speed. Holding Space also spins on a keyboard.
2. **The objective is always lit:** whatever scores right now glows with a tag beside it. The stick says SPIN ↻ / DANCE. The button says TAP, BIG MOVE!, FASTER!, JUMP! or POSE!, and brightens as the beat ring closes.
3. On a computer the button shows as a **SPACE** key (still clickable); on a phone it's **TAP**.

## v1.81.85 — Ice rink: a figure skating routine

The ice rink is now a routine planned from the song's analysis (the roller rink is unchanged). Everyone skates the same path round the rink in formation, in time with the music. A timeline across the top shows the parts, and a prompt at the bottom says what to do now. Space on a keyboard; the TAP button on a phone.

1. **Intro:** a preset dance on the ice (Arms up, Arabesque, Swan, Present, Cross, Reach), one move every 2 beats. Tap as the ring closes on each.
2. **Glide:** skate the path with everyone. Tap every 2 beats to stroke. On the song's big moments, **BIG MOVE!** asks for a spiral (arms out, leg up), worth more.
3. **Spin** (in a calm part like a breakdown or bridge): hold the button to spin faster and faster. Keep it held to the end for PERFECT SPIN.
4. **Free dance** (a chorus or solo): you dance the Two-step on the ice. The stick / arrows move your arms, the move changes every 8 beats, and Space on the beat twirls.
5. **Build speed** (16 beats before the drop): tap every beat to fill the speed meter (left).
6. **Axel** (on the drop): jump right on the beat. Speed decides SINGLE, DOUBLE or TRIPLE (triple needs a full meter and a GREAT or better). Miss it and you fall.
7. **Finale:** strike the final pose on the last beat. **BRAVO!**
8. Everyone sees each other's spins and jumps turning round, the free dance, and the poses. So does the performer's view.

Timing: PERFECT within 45 ms, GREAT 90, GOOD 140. A streak adds up to double points.

## v1.81.84 — Ski jump: 70s dance moves instead of tricks

1. In the air in Ski, the three trick buttons are now 70s dance moves (same keys/clicks, same points and timing):
   - **⬅ Sinking Swim**: pinch your nose, wave the other hand up, shimmy down like you're going under
   - **⬆ YMCA**: spells Y, M, C, A with your arms
   - **➡ Disco Point**: the Saturday Night Fever point, up to the side then down across, hand on hip
2. No more spinning skis or flipping. You face the crowd while you do the move, and everyone else sees your arms doing it.
3. Combos, the repeat penalty and the trick mouse guide all work the same with the new moves.

## v1.81.83 — Mosh pit: headbang

1. In the mosh pit (and the circle pit), a little BANG track sits bottom right: a white dot races up and down (with a slight sway), hitting the red line on every beat.
2. Press BANG right as it hits (Space or B on a keyboard, or tap the track). PERFECT is a tight window (40 ms by default, "Headbang perfect window" in the tuning lab), then GREAT and GOOD; too far off is a MISS and breaks your streak. One bang per beat, so mashing doesn't help.
3. A good bang plays the Headbang dance for a couple of beats, and everyone sees it. Streaks add up to double points.

## v1.81.82 — Keepy uppy: locked in a shuffle

1. Start Keepy uppy. Your dancer shuffles the whole game (running man), standing still or moving. Everyone else sees it too.
2. Push the stick all the way out to the side (or hold left/right on a keyboard): they T-step sideways that way.
3. New SPIN and TWIRL buttons above JUMP (Q and E on a keyboard) spin you round, and everyone sees it.
4. The camera shows the whole dance floor again (no 150% zoom); the calmer move speed on PC stays.

## v1.81.81 — Free dance looks the same on everyone's screen

**Needs a server redeploy on Render** (the server now passes spins along).

1. Two phones in free dance. On one, spin (the spin move, then keep swinging the right stick): the other phone sees them spin round too, through all the facings, for as long as they keep it going.
2. Turn round or quarter-turn (90/180), or hold an arm out: the other phone now shows it. These were being dropped on arrival before.
3. Wiggle the dots: on the other phone the moves glide smoothly instead of jumping about 10 times a second.

## v1.81.80 — Keepy uppy on PC: calmer speed, 150% zoom

1. Play Keepy uppy on a computer. It starts zoomed to 150% with the camera following you, and walking is about a third of the old speed on a wide screen, so it feels like the phone version.
2. Phones are unchanged (100%). The zoom +/- in practice still works and remembers your choice.

## v1.81.79 — Abs feather turns with the hat

1. Put on Abs and keep pressing rotate. The feather goes round the head like it's really attached: front right, then behind the dome (just the tip peeking over) as you turn right, across the back, round the near side, and back to the front.
2. Paint layers can now have a drawing for each of the 8 turns (hat:15|d0 to |d7), drawn exactly as it should look on screen.

## v1.81.78 — Painted hats keep their sides when you turn

1. Put on the Abs hat and turn the character with the rotate buttons. The white feather stays on the same side through front, front-left and front-right, and through back, back-left and back-right. It no longer jumps across when you turn slightly.

## v1.81.77 — Stage: 8-bit glow, lasers, banner and Go live

1. Jam in Stage view and play a note: the pink glow behind you is now stepped pixel rings, not a smooth circle.
2. Turn on Lasers (Show → Extras): the beams are runs of square pixels.
3. Lower the Banner with the screen down: the fringe along the bottom is pixel teeth, and the banner hangs below the buttons in the top-left corner and clear of the key panel. The UNHOLY KEYS wall sign no longer peeks out cut off above the screen.
4. The Go live button (top right in jam) is square and pixel-font, with a hard shadow and a pixel dot (blinking red while you're live) in place of the 🔴 emoji.

## v1.81.76 — Abs hat at every angle

1. Put on the Abs hat and turn the character all the way round in the maker. From the side the hat covers the head, brim included, with no hair poking through the top. From the back it's mirrored, with no front shine.
2. Hats can now carry their own side and back drawings (hat:15|v1 and hat:15|v2 in the shipped pixels); other hats still work them out from the front.

## v1.81.75 — Abs hat cleanup

1. Put on the Abs hat: no stray white pixel off to the left, and no dark band cutting down across the face and shoulder.

## v1.81.74 — Character maker: arrows stay put

1. Open the character maker and click through Hats, Hair, Tops etc. with the ▶ arrow. The arrow no longer moves as the names change length, so you can keep clicking in the same spot. Long names shrink a little to fit.

## v1.81.73 — New hat: "Abs" (placeholder name)

1. Open Character → Hat and go to the last one, **Abs**: your new grey-and-white hat from the graphics lab.
2. Police cap still looks like the police cap.

## v1.81.72 — Ski on PC: big mouse guide, cleaner controls

1. On a computer, once you're moving, a big pixel mouse sits above the trick buttons: the left button reads **HOP or TRICK**, the right reads **NEXT TRICK**. Nothing else around it.
2. The trick buttons show just their names (no arrows), and there's no HOP button on the right. On phones, the HOP button and arrows are unchanged.

## v1.81.71 — Ski: no more CUT +25

1. Hop and swing round to a new line: no "CUT +25" pop-up and no points. You still keep your speed through the turn.

## v1.81.70 — Ski: trick combo bonus

1. Take a ramp, do a trick, right-click to switch, do a different trick, and land clean: **TRICK COMBO! +200** (on top of each trick's own points).
2. Three different tricks in one jump: **TRIPLE COMBO! +400**. The same trick twice doesn't count, and if you're still mid-trick when you land it's a wipeout with no bonus.

## v1.81.69 — Ski: hop over trees, small boost out of a swoop

1. Hop and pass over a tree while you're properly up in the air: no crash. Clipping a tree right at take-off or just as you land still crashes you.
2. Come out of a swoop: you get a small burst of speed (a puff of snow at the exit) that carries for about a second before settling back to normal.

## v1.81.68 — Ski: "HOP IN! +300" arrows on the first two divots

1. Start a Ski round. The first two flag divots at the top each have a bouncing yellow arrow pointing into the start of the groove, with a **HOP IN! +300** label.
2. Each arrow disappears once you've passed that flag (or while you're swooping). The divots after those have no arrow.

## v1.81.67 — Ski: mouse guide on PC

1. Play Ski on a computer. Once you're moving, the line of text above the trick buttons is replaced by a pixel mouse: **left = HOP (in the air: trick)**, **right = NEXT TRICK**, with "point to steer · land in a divot to swoop" under it.
2. In the air the left label lights up yellow. On a phone you still get the old text hints.

## v1.81.66 — Pixel icons in game banners

1. Crash into a tree or rock in Ski: the banner shows a pixel-art burst next to TREE! / ROCK!, not the phone's 💥 emoji.
2. Check the other game banners too (Kart flag, Capture the flag, Dance walk race, Keepy uppy, Mosh pit, Wall of death, Circle pit, Bail/Tripped, Finished): every icon should be pixel art.

## v1.81.65 — Voice room: one mic opens voice for everyone

**Needs a server redeploy on Render** (the server now tracks who has their mic on).

1. Open the room on two or three phones/tabs. Nobody has voice yet.
2. On one phone, tap the small 🎙 Voice button. Every other phone should show a big glowing **🎙 TAP TO TALK** button at the top and start hearing that person straight away, with no tap needed.
3. Tap **TAP TO TALK** on a second phone: it turns green (**MIC ON · TAP TO MUTE**) and both talkers hear each other. Tap again to go back to listening; you keep hearing the others.
4. Up to 8 people can have their mic on at once. A 9th sees **VOICE FULL · LISTENING** for a few seconds and keeps hearing everyone.
5. Someone who joins the room after voice is open starts listening as soon as they arrive.
6. During a song the big button reads **MIC OFF FOR THE SONG**, and it is hidden during games and in practice.

## v1.81.64 — Performer listens to voice automatically; no mic = listen only

- **Performer:** going live joins voice as a **listener**: you hear anyone who joins voice, and no mic is asked for. The button reads "🎧 Listening · tap for mic". Tap it to turn your mic on; tap again to go back to listening. Also after a reconnect.
- **No mic, or mic permission refused** (anyone): you stay in voice and listen ("🎧 Listening (no mic)"), instead of being thrown out.
- Tested: a listen-only player hears a player who joins with a mic.

## v1.81.63 — CTF: smaller video on the floor

- **CTF and Kart flag:** the video on the arena floor is about half the size it was: about 4 tiles wide in CTF, 5.5 in Kart flag (was 9–12). The performer and platform stand just above it, clear of the picture.
- **Performer screen:** your copy is still enlarged so you can read the lyrics.

## v1.81.62 — Voice you can actually hear; karts on the performer's Kart flag map

- **Voice:**
  - **Relay fallback:** it now falls back to free public relay servers when two devices can't connect directly (mobile data, strict home routers). Before, it only tried a direct link, so someone could light up as talking (that signal goes through the game server) while their sound never arrived.
  - **Retries:** a failed link retries up to 3 times instead of going quiet for good.
  - **Blocked playback:** if the browser blocks the sound until you tap, it starts on your next tap or key press.
  - **Status:** hover the performer's 🎙 button to see each person: ✓ connected, … connecting, ✕ retrying.
- **Kart flag, performer screen:** everyone is drawn in their kart, in team colours, pointing the way they're going. Before, they were people walking, because the kart drawing needed a race to be running and quietly failed.
- Check: join voice from two phones on mobile data and talk between songs; play Kart flag live and look at the performer's map.

## v1.81.61 — Rhythm games: notes use the whole pad again

Measured with a chart lab on two structured test songs (100 and 128 BPM, intro/verse/chorus/breakdown/chorus/outro), every game and every level, from audio and from the stored analysis YouTube songs use (both gave the same results).

**What was wrong**
- **"Leftmost lane wins":** whenever a double or a held lane was trimmed to one arrow, the leftmost was kept. Before: arrows on Easy 67% left; 4 keys on Easy 71% left.
- **4 keys:** the lane came from the beat number (beats 1 and 3 on the left two keys, 2 and 4 on the right two), and the chart's own lanes were thrown away. Whenever beats 2 and 4 were thinned out (quiet parts on Normal, verses on Easy), every note landed on the left. This is the Dip problem.
- **Note highway:** it walks up or down the keys from the chart's lane, so the left bias dragged it left: 70–82% on the left, and the far-right key got 0–5%.
- **Long one-sided stretches:** up to 21 notes in a row on one side.
- **Normal choruses** were no busier than the verses.

**Now**
- Trimming keeps a fair, varied lane. The 4-key highway uses the chart's flowing lanes, and Normal gets at most one chord a bar.
- After 6 notes on one side, the next is mirrored to the other side (arrows and 4 keys). The Note highway heads back across after 6 on one half of the keyboard.
- Normal gets one more off-beat note per bar in the loud parts.

**After (100 / 128 BPM)**
- Arrows and 4 keys: 44–55% left at every level, the longest one-sided run is 6–7 notes, and 5–24% repeat the lane before.
- Note highway: keys used symmetrically around the middle, at every level.
- Normal at 128 BPM: chorus 1.25 notes per beat vs verse 0.81.
- Check: Dip on Normal, 4 keys and Note highway; the notes should move across the whole pad.

## v1.81.60 — Skip timer works while the song is still loading

- **Practice, Skip timer:** it now works from the moment the countdown card appears. Before, it did nothing until the song's steps had loaded, which for a YouTube song can take several seconds. If the steps are still loading it shows "Starting…" and starts the round as soon as they're ready.
- Tested: pressing Skip straight after Start (steps still loading) → "Starting…" → the round started within 2.5 s.

## v1.81.59 — Ski: repeat penalty is 10%, floor 50%

- The same trick again is worth **10%** less each time (was 25%): ×0.9, ×0.81, ×0.73…, never below **×0.5** (was ×0.2). Swapping tricks still lets the others recover.

## v1.81.58 — Ski: swoop tiers and the flag streak

- **Hop into a divot (HOP SWOOP)** is worth more than **riding into one on the snow (SWOOP)**, which is worth more than passing the flag outside its divot. Each swoop also scores the flag.
  - Hop swoop: flag + 300
  - Ski swoop: flag + 150. This is new: riding into the top of a divot without hopping now swoops you too.
  - Outside the divot: the flag only
- **Flag streak:** each flag passed on the right side adds ×0.1 to the bonus on flag and swoop points (FLAG +100, ×1.1 +110, ×1.2 +120…). A wrong-side flag or a crash ends the streak. The label shows the multiplier.
- Measured with the auto-skier: FLAG +100 → ×1.1 +110 → ×1.2 +120 → SWOOP ×1.3 +195.

## v1.81.57 — Ski: mix up your tricks

- **The same trick again is worth less:** ×0.75 each time, not below ×0.2. The points label shows it, e.g. "Backflip ×0.56 +629".
- **Doing a different trick lets the others recover** by half a step each, so swapping between 360, Backflip and Daffy keeps tricks near full points.
- It resets each round.
- Measured: repeating Backflip went ×0.75 → ×0.56 → ×0.42.

## v1.81.56 — Ski: flags side by side only judge the nearest one

- **Paired slalom flags** (two flags at about the same height, within 60): only the flag you're nearest when you pass that line counts. Before, passing one flag of a pair scored "WRONG SIDE" on the other, because you were out of its range.
- **Bot / auto line:** goes between a pair that faces each other. For a pair facing away, it goes round the flag nearer its line, and it passes every flag on its arrow side, not through the pole.
- Measured on First run with the auto-skier: 0 wrong-side misses (was several), and about double the score over the same distance.

## v1.81.55 — Ski on PC: click tricks

- **Left click:** hops on the snow; in the air it does the highlighted trick.
- **Right click:** moves the highlight to the next trick (360 → Backflip → Daffy). The highlighted button is yellow (PC only).
- The arrow keys and the trick buttons still work as before. The hint says so on a computer.

## v1.81.54 — Ski: Brian's "First run" is the house mountain (updated layout)

- **"First run"** (latest layout: 14 slalom flags, 157 trees, 10 rocks, 5 ramps, 32 moguls, 300 m then repeating) is built in. It's used for every Ski round when the performer hasn't saved their own course, live and in practice, on both screens. The Ski designer starts from it, and Reset goes back to it.
- A course saved in the designer still overrides it, as before.

## v1.81.52 — Ski designer: right click erases

- **Ski designer:** a right click (without dragging) erases whatever's under the cursor, whichever tool is picked. Right-drag still scrolls the view.

## v1.81.51 — Playtest zoom for every game

- **A − / + zoom box at the top of the screen in every game** (dance practice; or add `?zoom` to a live link). It shows the game and the zoom, e.g. "CTF 60%". Steps are 10%, from 50% to 250%. Tap the label to reset to 100%. Each game remembers its own zoom on that device.
- **Camera games** (CTF, Kart flag, Ski, Mars Rally, Half pipe): the game's own camera zooms.
- **Floor games** (Free dance, Mosh pit, rinks, Keepy uppy, Walk race, Step, Target, the highways): the whole room zooms. Zoomed in follows you; zoomed out shows the room smaller.
- To use: play each game on phone and PC, set the zoom that feels right, and send me the numbers (e.g. "CTF PC 80%, phone 110%"). I'll make those the defaults.

## v1.81.50 — Colour keys: painted and imported art follows the player's colours

- **Colour keys:** in painted or imported art, pure magenta = hair colour, cyan = top colour, yellow = bottoms colour, orange = skin. Lighter or darker shades of a key keep their shading on the player's colour. Other colours stay fixed. One PNG now works for every hair/clothes/skin colour.
- **Import PNG and the pen** turn key colours into these tokens. **Export PNG** writes anything that follows the player's colours out in key colours, ready to edit and re-import.
- New palette: **Colour keys (follow the player)**, with each key's base, light and dark shades.
- **Fix:** three hand-painted hair fixes stored fixed colours: Braid had a 70-pixel patch in palette purple, and two styles had pixels in the blue hair colour. Everyone saw those colours whatever hair colour they picked. They now follow each player's hair colour (also on devices with a saved copy).
- **Fix:** the held instrument no longer leaks into a part's picture in the pixel editor (and so into exports).
- Check: Graphics lab → Hat → Import a hat with a magenta band → change the character's hair colour → the band follows.

## v1.81.49 — Pixel editor: Import PNG (for the designer templates)

- **⬆ Import PNG:** brings in a PNG drawn on the template, at the exact canvas size or any whole-number multiple (e.g. the 8× template, 160 × 176 for head parts). It replaces the current layer, and the original art underneath is cleared, the same as Redraw. A wrong-size picture gets a message with the size it needs.
- Pixels less than half opaque are dropped; the rest become solid.
- Tested round trip: a hat drawn on `hat-BLANK-8x.png`, imported over Beret, renders pixel for pixel.

## v1.81.48 — Pixel editor: reference picture, layers, PNG export

- **🖼 Reference picture:** pick an image from your device.
  - **Behind (see-through):** fitted to the part, under your pixels; the slider sets how see-through it is.
  - **Side by side:** next to the canvas, which takes half the width.
  - **Hidden**, or **✕ Picture** to remove it.
  - The picture is kept on the device if it fits in storage.
- **Layers (up to 5):** the numbers pick which layer you paint on; 👁 shows or hides one; + adds a layer on top; 🗑 deletes the current one. The game gets them stacked into one (the top layer wins). Undo works on the layer you're on. Layers are saved per part on this device.
- **⬇ Export PNG:** saves the current part as a PNG at 8× size, with crisp pixels.
- All of these are in both the side panel and the full-screen editor's toolbar.
- Includes #218 (body around the part); merging this brings it too.
## v1.81.46 — Graphics lab: see the body around the part

- **Pixel editor, with Show character on:** the canvas zooms out to show 8 pixels of the character around the part you're editing (the torso and other arm round an arm, the hips round a leg). The surrounding body is faint, and you still only paint inside the part's box. Turn Show character off to go back to the close-up.

## v1.81.45 — Graphics lab: Part list grouped

- **Pixel editor → Part:** three groups:
  - **Body:** Head · Hair style, Head · Face, Top, Bottoms, Left/Right arm, Left/Right leg.
  - **Hats & accessories:** Hat, Extras (shades…).
  - **Props:** Instrument, Keyboard, Mic stand.

## v1.81.44 — Feet sweep: shoes on every angle, feet on the floor in every dance

- **Toes follow the leg:** the shoe sits square across the end of the leg at any angle, so lying, kicking and sideways legs (the worm, kicks, floor spin) get a proper foot, not a longer leg. Checked in all 8 facing directions.
- **Feet planted in every dance:** I measured the lowest foot pixel against the floor for every move of every dance, 16 moments each.
  - Before: squats and leans (Hands on knees, Drop it, Thriller, Strike a pose, Cyber goth, Headbang) pushed the feet 3–7 px through the floor, and some wide stances floated.
  - Now: squats bend the legs (down to 4.5 of 7 long, then the body stays up), and the lean of the body is included. Feet land within 1–2 px of the floor (pixel rounding). Hops and beat bounces still leave the floor by their own height.
- Applies on both screens (audience and performer) and in the dance walk race. The worm and floor spins are left as they are.
- Check: free dance → Hands on knees (Low), Thriller, Cyber goth (Chop), Headbang: no feet through the floor.

## v1.81.43 — Kart flag: right click for IMPACT

- **Kart flag on PC:** right click is IMPACT (no browser menu). Left click is still hold for drift and aim, let go to LAUNCH. Space still works too.

## v1.81.42 — PC mouse controls, shoes, designer fixes

- **Kart flag on PC:** point to drive (the further from your kart, the faster), hold left click to hop into a drift and aim, let go to LAUNCH (like Mars Rally). Space is still IMPACT. The hint says so on a computer.
- **CTF on foot on PC:** point to run, hold left click to sprint. Zoomed out on big screens (tiles capped at 46 px) so most of the arena fits.
- **CTF players** stand on their shadows (they floated before).
- **Ski:** click on the slope to hop (PC). HOP button colours are locked so it can't render blank. Skiers riding through a divot are no longer hidden under it (divots drawn as ground first, on both screens).
- **Shoes:** every character gets a small toe at the end of each leg: forward in side views, outward from the front. Applies to every dance and game, not skates.
- **Skip timer:** reacts on the press, before anything can grab the pointer. If the song is still loading it shows "Starting…" and goes as soon as it's ready.
- **Practice:** no Talk button in the dance menu (there's no chat with only bots; Talk works when live).
- **Ski designer:** Red flag and Blue flag tools (pass red on its left, blue on its right; flags keep their side when saved, and the default run's flags are no longer dropped). The mouse wheel scrolls down the mountain, Ctrl+wheel zooms, and arrows/PageUp/PageDown work.
- **Flag arena designer:** one Boost button per direction (▶ ◀ ▲ ▼). With Mirror off you paint exactly that direction.

## v1.81.41 — Crowd picks the next song (videos)

- **Start a song → Video → 🗳 Crowd picks:** while live, the room votes for 20 s between 4 random videos from your video folder (bots vote too). Viewers see "PICK THE NEXT SONG" with the song names, with the key part of the file name hidden.
- **Performer:** a small yellow card bottom right shows the live counts. When the vote closes, the winner is picked in Start a song, the Key and Alt pickers fill from its file name, and you press Start.
- The video list shows the key read from each file name ("F# Mixolydian") instead of "video".
- **Needs a server redeploy** (new svote messages).
- Check: go live with a video folder loaded, press Crowd picks, vote on a phone, see the winner selected with its key.

## v1.81.40 — 8-bit pop-ups out of the way, pixel names, key pickers, Kart flag fix

- **Kart flag on the performer screen:** the map view now covers Kart flag (it showed nothing before, e.g. after a mosh pit).
- **Kart flag is a whole-song game:** picking it clears the other picks (like Free dance), and it isn't offered in the mid-song crowd vote.
- **Pop-ups (performer screen):** the round result, the crowd vote and the countdown card sit bottom right. They're compact (top 3 only), with square corners, pixel lettering and a hard shadow, and the result hides after 7 s. Key and hotkey toasts are small pixel chips under the instrument button ("KEY G Major · ALT"), not a big pill over the stage. The duplicate "Round N: X wins" toast is gone.
- **Names:** names under people, on both screens, use the pixel lettering. A bot's 🤖 is a pixel robot, in the result card too.
- **Key pickers in Start a song:** Key and Alt (root and scale). They're filled from the song's name when it has a key in it, e.g. "Song - F# Gb Mixolydian", "Song - G Major.E Minor", "Song (A Dorian)", "Song - C#m", "A Major / F# minor". Applied when you press Start (the Shift swap uses Alt).
- Check: pick "… - F# Gb Mixolydian" and Key shows F#/Gb Mixolydian; play Kart flag after another game; the end-of-round card is bottom right.

## v1.81.39 — CTF centre stage; performer and video visible in every game

- **CTF / Kart flag (audience):** the performer stands on a small lit platform in the middle of the arena. With a video playing, it lies on the ground just below him as part of the map, and players run or drive over it. Walls over the video are drawn as glass outlines (still solid). If the middle is off your screen, the small performer shows top right again.
- **CTF (performer screen):** the whole map, you on the platform in the middle, and the video under you, enlarged to about 40% of the screen so the lyrics are readable.
- **Performer screen, every other game** (crowd, step, target, both highways, free dance, mosh, both rinks, keepy uppy, half pipe, walk race): switches to the stage view during the round, so you see yourself and the video on the Jumbotron. With the video down, you stand beside the screen, not in front of the lyrics.
- **Ski (performer screen):** the video is on a board at the top of the run; you ride the lift on the left.
- **Sweep result:** the performer now sees the video and himself in all 16 games, and players see the performer in all of them.
- Check: start a video song with CTF, look at the middle on both screens; walk away from the middle and the corner performer appears.

## v1.81.38 — Shuffle and Cyber goth from the clips

**Shuffle** (reworked from the shuffle clip): every move now **snaps** into place at the start of its eighth note and holds still, so it reads as stop-and-go rather than floaty.
- **Running man**: plant and sink on the beat with the other foot slid back, then snap a knee up high on the "and" with the opposite arm swinging up.
- **T-step**: the leading foot swivels heel-out then toe-out on each eighth, and the body hops sideways in little stops, out over half the bar and back.
- **Spin**: a quick snap all the way round in half a beat (through all 8 facings), then pop out facing front with the arms open.
- **Mix it up**: running man, T-step one way, T-step back, then running man into a spin.

**Cyber goth**: the base is now the guy in the middle of the clip.
- **Stomp & pump**: knees bent, stomping in place, fists pumping up and down in front of the chest in turn with the elbows bent, the shoulders dipping into each stomp.
- **Mix it up** comes back to the stomp & pump every other bar, between the sweeps, arm rolls, windmills and chops (the arm roll is the girl in the second clip).

## v1.81.37 — Holds and Expert

- **Holds no longer run into the next step on the same arrow.** A hold now ends at least half a beat (and at least 0.26 s) before the next step on that arrow, so you can let go and hit it cleanly. If there isn't room for a hold of at least three quarters of a beat, it becomes a normal step.
- **Expert feels like Expert again.** The phone-friendly thinning that every level goes through was capping everything at half beats, so Expert's quarter-beat bursts never got through. On Expert it now lets quarter beats through (never closer than 0.12 s). On a test chart Expert went from 4.9 to 5.6 steps a second; Hard stays at 3.9 and Normal at 2.1.

## v1.81.36 — Skip timer fixed; Kart flag / CTF count-in

- **Skip timer** now sits inside the countdown card, under the number. When the how-to card is showing, it moves to the top of the screen, above the how-to card, which was covering it and swallowing the tap. It also responds to the finger lifting, not only to a click, and Free dance and Leave practice are hidden during the countdown (Exit stays top left).
- **Kart flag / CTF**: everyone waits on the start line for the first 8 beats. This now counts in on screen (GET READY · 4 · 3 · 2 · 1 · GO!), so it no longer looks like the bots and flags are broken. Tested: after GO the practice bots drive off and pick-ups work. Practice doesn't use the server.

## v1.81.35 — Voice between songs

- **🎙 Voice** button: next to Talk for the audience, and next to End Stream on the performer page. Tap it to join voice. Your browser asks for the mic the first time.
- **Your mic is open between songs and fully off during them.** It turns off while a mini game round plays, the video plays, a song map runs, or the performer has played a note in the last 6 s. The button shows 🔇 Song on while it's off. The mic is released completely, not just muted, so an iPhone stays in music mode.
- A little green speaker shows over anyone talking.
- **Up to 8 people in voice per room.** Everyone connects straight to everyone (WebRTC, free); the server only introduces people. The 9th person sees "Voice full".
- Not in practice (there's no one to talk to). Some strict mobile or work networks may not connect; we'd add a relay (TURN) server if that comes up.
- Server change: needs a server redeploy (new voice messages).
- Test: two phones or a phone and a PC in the same show. Join voice on both, talk between songs, check it cuts out when a song starts and comes back after.

## v1.81.34 — Mobile instrument: D is a side trigger

- On the phone instrument, **D is now a tall trigger button down the left edge**, like the side or shoulder buttons in mobile games. Hold it to raise the notes.
- The peanut's separate D half and its middle "Both" spot are gone. Next to the trigger: E and 3 on top, Space below.
- **Four levels from D and Space**, the same as the keyboard: neither (root), D, Space, or D and Space together (two fingers) for the top level. E and 3 work as before.

## v1.81.33 — Character maker: Undo, Save changes, unsaved warning

- **↶ Undo** (next to Surprise me) steps back through your last 60 changes, including Surprise me rolls.
- **Save changes** keeps the new look (the button lights up when there's something to save). Nothing is kept until you save.
- **Back with unsaved changes** asks first: Save, Discard (back to your saved look) or Keep editing. Closing or reloading the page while editing also warns you.

## v1.81.32 — Mosh points

| | off the beat | on the beat |
|---|---|---|
| Swing (windmilling your arms, or a punch that misses) | 10 | 20 |
| Punch that lands | 40 | 60 |

All four are in the lab: Mosh pit → Swing points, Swing on the beat, Punch lands, Punch lands on the beat.

## v1.81.31 — 4-key notes are squares

- **Note highway, 4 keys**: every tap note is a square as wide as its column (never taller than 30% of the highway). Holds are still long bars. The 7-key highway is unchanged.

## v1.81.30 — Mosh: swing points, wall of death on the drop

- **Swing**: a punch swing off the beat is worth **10** points (was 40). On the beat it's still 60. Both are tunable in the lab (Mosh pit: Swing points, On-beat swing points).
- **Wall of death**: the two walls now meet right on the drop. The charge starts 0.8 s before it, the 3-2-1 before that, and the push war begins at the drop.
- **Not too early**: the song analyser doesn't look for the drop in the first 30% of the song. A drop in a game's first 30 s, or first 30% of its length, is moved later.
- Server change: a live show needs the server redeployed so the server and its bots time the push war from the drop.

## v1.81.29 — Walk race pad dead centre

- The dance pad is now centred on the floor in both portrait and landscape, and as big as it fits: up to 94% of the width, or 64% of the screen height, whichever is smaller. The racers run behind it, and the progress bar along the top shows the race.
- The hint line sits at the bottom, centred.
- This replaces the v1.81.15 portrait band layout.

## v1.81.28 — Late hits are misses

- In step dance, target dance and both note highways, a hit that comes **after** the note's PERFECT window counts as a **MISS**: the streak ends and hype drops. Early and on-time hits still count (PERFECT, GREAT or GOOD by how close they are).
- A late hit on a hold note doesn't start the hold.
- The "on time" allowance after the beat is the PERFECT window (tunable in the lab: hw.p4 / hw.p7 for the highways), so normal touch lag isn't punished.

## v1.81.27 — 4-key tiles the standard size; standings order

- **Note highway, 4 keys**: tap notes are now the same short tile as on the 7-key highway (they were about twice as tall). Only holds are long.
- **Standings**: the top 3 is sorted again with your live score, so you're never listed below someone you're ahead of. Before, your score updated but your place didn't.

## v1.81.26 — Hair goes under hats

- With a hat on, hair above the hat's brim isn't drawn, so spikes, mohawks, afros, buns and the rest no longer poke out around the hat. Hair below the brim still shows: sides, fringes, long hair, ponytails.
- This covers the drawn hair and your painted hair edits, in the front, three-quarter, side and back views.
- The crown and the goggles sit on top of the hair, so hair still shows with those.
- Swept: every hair with every hat (30+ × 14), plus close-ups of the tricky ones in all views.

## v1.81.25 — Planner timing in free dance

- **Everyone free dances for about 30 s** before the circle forms. The ring is locked in at 22 s, the first dancer is told then, and the first turn starts about 37 s in (was 23 s).
- **The planner only shows once the circle has formed.** The exception is the first dancer, who gets it as soon as they're told, so they have about 15 s to plan. After the circle forms it stays up while you're in the circle and not in the spotlight (between turns, and after your turns are done).
- Server change: a live show needs the server redeployed to get the 30 s.

## v1.81.24 — Turn planner the whole time

- In free dance, the half-screen drag-and-drop planner now shows the whole time you're in the circle and not in the spotlight: before the circle forms, between your turns, after your turns are done, and when you're not in the turns this song. The header says which.
- Before, it only showed when you had a turn coming up and the circle had formed, otherwise you got the full-screen style columns.

## v1.81.23 — Cap and witch hat on turned views

- **Cap** (and headphones, bandana): in the three-quarter views they now sit on the head instead of a pixel off to the side. Shades and the mask still sit on the face.
- **Witch hat**: turning left no longer flips the curl. The tip curls the same way in the front, three-quarter and back views (side views still show it trailing behind).
- A cap under a hat is hidden, so it doesn't poke out from under the brim.

## v1.81.22 — Standards sweep

I went through every game in portrait and landscape (practice, with bots) and checked each one against the standards:
- **No "You" label under your own character** in capture the flag (on foot) and ski. Every other game was already clean.
- **How-to lines fade after a few seconds on phones held sideways too** (mosh, keepy uppy, half pipe, ski, walk race, rinks, CTF, free dance). Before, they only faded in portrait. The keyboard controls line doesn't show on a touch screen.
- Checked: the version is hidden in every game, there's no bottom strip in practice, team games are even, and the rhythm games have short tap notes and the speed control.
- The drag ghost in the turn planner is square (pixel style).

## v1.81.21 — Character preview stays in view; afro fix

- **Character maker**: the preview stays pinned at the top while you scroll through the options (smaller on phones so the options have room). This also applies to the performer's character dialog.
- **Afro**: the dark band and the erased row under the afro are gone, so it sits on the head with nothing dead underneath. A copy of your pixel edits saved on a device gets the same fix once.

## v1.81.20 — Plan your turn by dragging

In free dance, while you wait in the circle:
- **Tap a style** to try it on your dancer, as before.
- **Drag a style into a slot** to plan it. Dropped on an empty slot it fills the next open spot; dropped on a filled slot it replaces that one.
- **Drag a planned slot** onto another to swap their order, or drag it out of the slots to take it off. The small ✕ in the corner also takes it off.
- The ◀ ▶ ✕ button row and the "Add to my turn" button are gone, so the panel is shorter.

## v1.81.19 — Performer stands on the stage

- The performer and the piano now stand on the stage, with the legs on the stage edge. In portrait they no longer float halfway up the wall.
- On a short landscape stage they're drawn at two-thirds size, so the lid stays below the UNHOLY KEYS sign.

## v1.81.18 — Kart flag boost pads

- The two pads that fired straight into the middle pillars are gone. The arena is mirrored, so each team gets the same set:
  - top and bottom lanes (3 each, towards the middle), as before
  - **2 out of each base** along the open rows either side of it (a 39-tile clear run)
  - **2 across the middle**, between the pillars (a 20-tile clear run)
- Every pad now has at least 20 clear tiles in front of it.
- If you saved your own Kart flag arena in the designer, practice uses that one. Reset it in the designer to get the new pads.

## v1.81.17 — No bottom strip, version on the menu only, flag in the kart

- **No bottom strip in games**: in practice, and on phones and tablets during a game, the chat bar is gone and nothing reserves space for it, so the arena runs to the bottom edge (Kart flag reads the real value now).
- **Version** shows on the main menu only, not during a game.
- **Kart flag**: a carried flag is planted in the kart and sized to it (it was floating well above).

## v1.81.16 — Rinks in landscape, no false bails, practice defaults

- **Roller and ice rink, landscape**: the rink fills the floor down to the bottom edge (it was a thin strip under the stage), the long controls line is gone and the hint sits at the bottom.
- **Bails**: holding the stick to skate as you jump is no longer a trick, so you don't bail on landing. A trick starts when you change direction (or use the trick wheel) in the air, and you only bail if you're still holding a trick when you land.
- **Practice**: Dip is picked to start with and the difficulty starts on Normal.

## v1.81.15 — Walk race portrait, Spin and Worm; CTF blocking

**Dance walk race**
- **Portrait**: the pad is centred at the bottom and the racers get their own band between the stage and the pad (spread to its edges), so they no longer sit under the pad. Landscape is unchanged.
- **Spin**: racers turn all the way round (a turn every 2 beats) as they race.
- **Worm** 🐛 is a new dance in the rotation: the circle wriggles low along the pad and the body does the worm on the floor.

**Capture the flag (on foot)**
- **Tags only hit the flag carrier** (the flag flies home and they go back). Anyone else just bumps: the other team is solid, so you can block for a teammate.
- **Sprint drains and refills twice as fast** (1.2 s meter, 4.5 s refill).
- **Twin Forts has 4 ⚡ refills**: the middle pair, and one in front of each base.

## v1.81.14 — Kart flag tune-up, skip timer

- **Flag pick-up**: the pick-up is now tested along the kart's path since the last update and karts get a bigger reach (1.25 tiles), so stopping on or driving fast over the flag always grabs it. A hiccup in the button display can no longer stop the rules from running.
- **Zoom**: halfway back out (44 px per tile, was 54; the old wide view was about 33).
- **LAUNCH**: a little softer (tap 0.95×, full 1.4× top speed) and a **4 second cooldown**; the button dims and counts down.
- **Items off**: no ? boxes and no item button, just LAUNCH and IMPACT. (Switch: `K_ITEMS` in art.js.)
- **Practice: ⏩ Skip timer** at the bottom during the countdown starts the song right away (once its steps are ready).
- The practice countdown card now says **Kart flag** (not Capture the flag) with the right one-line rules.

All of these are tunable in the lab: Kart flag → Zoom, Launch quick tap / fully charged, Launch cooldown.

## v1.81.13 — Crew cut hair

- **Hair → Crew cut**: close to the head with a short fringe swept across the brow, a little lift at the front from the side, and the neck showing at the back. Swept mop stays as its own option.

## v1.81.12 — Swept mop hair and Open coat

Matching Brian's teal-haired Graal character more closely:
- **Hair → Swept mop**: a big rounded mop, the fringe swept across the brow, a swoop up and back from the side, ending above the neck at the back.
- **Top → Open coat**: an open coat (in your top colour) over a light blue shirt with a dark blue line down the middle.

## v1.81.11 — Graal home assets

New in the character maker, after Brian's Graal characters:
- **Hat → Witch hat**: Bowe's floppy grey witch hat with the orange band, the tip curling over and the little yellow sigils (front, side and back).
- **Extra → Mask**: a black mask over the nose and mouth.
- **Holding** (new row): a **Violin** tucked under the chin with its bow, or a black sparkly **Electric guitar** slung across the body. They stay on the body while you dance (not on the rinks).

## v1.81.10 — Kart flag LAUNCH feels like Mars Rally

- Pressing LAUNCH does the same hop as the Mars Rally drift, then you land in a slide that slows down while you aim, with the same drift sparks (blue while charging, orange when full).
- The launch is about half as strong: a tap is about top speed, a full charge 1.6× (was 2.4×), and the burst is shorter. Both are in the tuning lab.

## v1.81.9 — The app updates itself

Phones, and most of all the home-screen app on iPhone, could open an old copy of the page after a new version was out. Now the page asks the site for its version (with caching off) when it opens and whenever the app comes back to the front: if there's a newer one it reloads straight into it on open, or, in the middle of a game or a show, shows a yellow "Update ready · tap" button. There's also a **Check for update** button on the main menu (and in the performer page's menu) that checks right away and says "Up to date" or updates.

## v1.81.8 — Kart flag has its own how-to card

The card before a Kart flag round was the old Capture the flag one. It now has its own preview (karts, LAUNCH hold-aim-let go, IMPACT sending the flag home, a ? box) and its own how-to and rules.

## v1.81.7 — Tuning lab, round two

- The lab (performer page → Tuning lab) picks games by kind (Rhythm, Dance, Ride & race, Team), has a **search** box across every setting, a compact **Table** view, and one-tap links to every editor (Notes, Arenas, Tracks, Ski, Graphics).
- New settings: base scroll speed for all rhythm games, Capture the flag (speeds, sprint, carrying, pads, tag reach), Kart flag (speed, launch power and charge, IMPACT reach and cooldown, spin, box, shield, nitro, zoom), dance battle match length, free dance spotlight zoom, mosh pit push-war length.
- Sliders apply live in practice while the game runs; the share box sends them to lock in. Shows use the locked-in numbers.
- Performer page: Note editor link; the flag designer is named for both flag games.

## v1.81.6 — Note editor, Exit button, mosh pit layout

- **Note editor** (charts.html): pick a song from the songs folder (or your computer). It finds the beat, then shows the notes in four lanes (← ↓ ↑ → / D F J K) scrolling up past a line. Tap a lane to add a note, tap again to remove it, drag up from a new note for a hold. Snap to 1, ½, ¼, ⅓ or ⅛ of a beat, zoom, play at 1× / 0.75× / 0.5× with a tick on every note, or **Record** (play and press D F J K). Preview what Hard / Normal / Easy make from your notes. Drafts save on the device; **Save** downloads `<song>.chart.json`, **Share** gives the text to send.
- Put `<song>.chart.json` in the songs folder next to the song and practice and shows use it: Expert exactly as written, easier levels thinned from it, Note highway · 4 keys keeps your lanes.
- Practice: an **Exit** button is always at the top left during any game (the panel games keep their X), so you can never get stuck.
- Mosh pit: every song is mosh pit, circle pit, mosh pit, circle pit, and one wall of death at the drop.

## v1.81.5 — Sweep: only the game on screen

- Scroll speed: the old 1.5× is the new 1.0× in every rhythm game; the speed button still adjusts it (your old saved speed is reset once).
- Note highway · 4 keys: every tap note is the same short tile; only holds are long.
- In every game (not free dance): no instrument box, no Talk / Start game / Leave practice; Stop becomes a small button at the top left so it never sits on JUMP, DRIFT or SPRINT.
- Kart flag uses the same fixed zoom as Mars Rally.

## v1.81.4 — Practice menu sorted into kinds of game

The practice menu starts with four tabs: Rhythm (step, target, note highway, 4 keys), Dance (free dance, mosh pit, dance walk race), Ride & race (roller rink, ice rink, keepy uppy, Mars Rally, half pipe, ski) and Team (capture the flag, kart flag). Only that kind's games show below.

## v1.81.3 — Capture the flag / Kart flag: more room

- One thin bar at the top: score (your team underlined) and the clock. The performer is small in the top-right corner. The arena gets the rest of the screen in both orientations; upright phones get a closer camera that follows you.
- The how-to line only shows for the first few seconds (and when you're tagged), under the bar, and Kart flag has its own words.
- Karts are painted in their team's colour.

## v1.81.2 — Kart flag: jump, aim, launch and IMPACT

- **LAUNCH** (big button bottom right, or Shift / X) replaces drift: hold it and the kart hops and slides to a stop while you aim it anywhere with the stick. An arrow grows as it charges (blue, then orange when full at 0.7 s). Let go and the kart shoots off the way you aimed, harder the longer you held.
- **PULSE is now IMPACT**: same blast round you; an enemy carrying your flag drops it and it flies home.

## v1.81.1 — Kart flag: open arena and drift boost

- Kart flag has its own arena: by default "Open Circuit", 64 x 30, wide and open with a few pillars, boost lanes and power-up boxes. The camera shows more of it.
- **DRIFT** (big button bottom right, or Shift / X): hold it while turning to slide, sparks go blue at 0.45 s and orange at 1 s; let go for a boost (orange is longer and faster). PULSE moves above it.
- Designer: pick "Kart flag arena" at the top to edit that arena separately (new Kart wide / Kart huge sizes). The performer page sends it with every Kart flag round.

## v1.81.0 — Kart flag

A new game: Capture the flag in karts, on the same arenas.
- Steer with the stick (gas is automatic). Drive over the enemy flag to grab it, bring it home to score. Bumping does nothing.
- **PULSE** (big pink button, Space): a shockwave about 3 tiles round you. An enemy carrying your flag drops it and it flies home; other enemies spin out. 8 s cooldown, shown filling up on the button.
- **Power-up boxes** (rainbow ? blocks, back after 8 s) give one item; use it with the item button (E / Shift): Nitro (speed burst), Oil (slick behind you that spins enemies out), Shield (immune to pulses for 4 s), Mega (next pulse has double the reach).
- Arena designer (ctf.html): new Power-up box tool and a Test kart flag button. Arenas without boxes use their sprint refills as boxes.
- Practice: the Kart flag tile. Shows: pick Kart flag on the performer page (or in a crowd vote). Bots pulse carriers and use items. Needs the server redeployed.

## v1.80.8 — Battle matches are 20 seconds

In a battle round (Battle in practice, the battle box on the performer page) every 1 v 1 is now 20 s, voted on live by the crowd; the winner goes through and the final takes the end of the song. If the song can't fit everyone, the lowest seeds sit out.

## v1.80.7 — Mars Rally minimap

No leaderboard box in Mars Rally. Your place stays top right, and under it a tiny map of the track shows you (pulsing, coloured by your place) and the karts in 1st, 2nd and 3rd (gold, silver, bronze). No name under your own kart, and the instrument box no longer sits on STOP.

## v1.80.6 — CTF: team score and clock, real running

The mini leaderboard is gone in Capture the Flag; the top shows the team score and the time left. Players run with a proper stride (knees higher when sprinting) instead of gliding, and bump a little on each beat when standing.

CTF teams are always even: in a show with an odd number of people a bot joins for that game and leaves after it (needs the server redeployed); in practice an extra practice dancer is added.

Standings: now a small pill in the top-left corner showing your place. Tap it to see the top five for 5 seconds. It hides during every game, the round banner, the practice menu, the planner and the dance menu.

## v1.80.5 — Your turn: only your styles, and a smaller camera

During your spotlight turn the style buttons are only the styles you picked in the planner (none picked: the game picks two different ones for you). The camera now stops at a zoom where your whole body, arms out, fits between the two button columns.

## v1.80.4 — Add to my turn moves up

The Add to my turn button now sits right under your queued dances, in the spot the sub-style box used to take, as a wide cyan button.

## v1.80.3 — The planner only picks styles

The sub-style picker is gone from the planner. Each style starts on its default sub-style when you step into the ring, and you swap sub-styles from there.

## v1.80.2 — No "You" label under your own character

## v1.80.1 — Calmer beat pulse on the step arrows

The target arrows no longer jump in size on every beat; the outline just glows softly.

## v1.80.0 — Four difficulty levels, pinch zoom, CTF camera, and more

- Easy, Normal, Hard and Expert, built from the song's own rhythm; scroll speed button; practice level menu has Expert.
- Step dance: bigger 8-bit arrows. Phone game panel has more room. CTF follows you with flag and teammate pointers and tagging a carrier works. Pinch to zoom the venue. STOP in practice returns to the dance floor. The Mars Rally hint no longer covers the kart.
- The version tag in the corner is now always on top and easier to read.

## v1.79.59 — Auto key is off until you tick it
- "Auto key" (sets your instrument's key from the song and follows key changes) was on by default and remembered. It now always starts unticked and has to be ticked each time.
- Check: reload the host page: Auto key is unchecked; play a backing track and the key stays where you set it until you tick it.
