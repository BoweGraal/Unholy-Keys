/* Unholy Keys tuning lab: every number a minigame uses for movement, timing and scoring, in one list.
   The games read their numbers with TUNE.v("game.name"). Changes made in the lab are kept on this device
   (localStorage "uk_tune") and can be copied as text, pasted back in, or sent to the developer to lock in. */
var TUNE=(function(){
  function V(k,label,def,min,max,step,help,unit){return{k:k,label:label,def:def,min:min,max:max,step:step,help:help,unit:unit||""};}
  var GROUPS=[
  {id:"walk",name:"Walking",icon:"🚶",mode:"free",cat:"Dance",
   about:"How you move around the floor outside the skating and mosh games. Arrow keys, WASD, the joystick and tap-to-walk all use the same speed.",
   vars:[
    V("walk.speed","Walk speed",0.33,0.1,1,0.01,"Fraction of the room width crossed per second. 0.33 is about 3 seconds to cross the room.","room/s"),
    V("walk.moshBoost","Mosh pit speed boost",1.45,1,3,0.05,"Walking is this many times faster while the mosh pit is on.","×"),
    V("walk.ease","Avatar catch-up",0.35,0.05,1,0.05,"How tightly the drawn avatar follows where you are heading. 1 is instant, small is floaty.","")]},
  {id:"step",name:"Step & Target dance",icon:"⬆️",mode:"step",cat:"Rhythm",
   about:"Arrows fall to the hit line (Target dance: rings close on a spot). Press the matching key as it lands. Closer to the beat means a better call. Combo adds a score bonus and everyone in the show plays the same chart.",
   vars:[
    V("hit.perfect","PERFECT window",60,20,200,5,"Milliseconds either side of the beat that count as PERFECT.","ms"),
    V("hit.great","GREAT window",120,40,300,5,"Milliseconds that count as GREAT.","ms"),
    V("hit.good","GOOD window",180,60,400,5,"Milliseconds that count as GOOD. Anything later is a miss.","ms"),
    V("hit.ptsPerfect","PERFECT points",100,10,500,10,"Base score for a PERFECT hit before combo and fire multipliers.","pts"),
    V("hit.ptsGreat","GREAT points",60,5,400,5,"Base score for GREAT.","pts"),
    V("hit.ptsGood","GOOD points",30,1,300,5,"Base score for GOOD.","pts"),
    V("combo.every","Combo step",10,3,50,1,"Every this many hits in a row raises the combo bonus one level.","hits"),
    V("combo.bonus","Combo bonus per level",0.1,0,0.5,0.01,"Score multiplier added per combo level (0.1 means +10% each).","×"),
    V("fire.mult","On-fire multiplier",2,1,5,0.25,"Score multiplier while the big moments / on-fire state is on.","×"),
    V("step.travelMin","Fall time, shortest",1400,600,3500,50,"The fastest an arrow takes to reach the line (fast songs). Lower is faster.","ms"),
    V("step.travelMax","Fall time, longest",2300,800,4500,50,"The slowest an arrow takes to reach the line (slow songs).","ms"),
    V("step.travelBeats","Fall time in beats",3.5,1,8,0.1,"Fall time is this many beats, clamped between the shortest and longest above.","beats")]},
  {id:"hw",name:"Note highway",icon:"🎹",mode:"keys",cat:"Rhythm",
   about:"Notes fall down seven lanes (A S D F G H J) or four fat keys (D F J K). Hold bars need holding and letting go at the right moment. Hype fills as you play well and speeds up the stage lights.",
   vars:[
    V("hw.fall7","Fall speed factor, 7 keys",0.85,0.3,1.5,0.01,"Multiplies the fall time. Lower is faster notes, higher is slower.","×"),
    V("hw.fall4","Fall speed factor, 4 keys",0.72,0.3,1.5,0.01,"Same, for the 4-key highway.","×"),
    V("hw.p7","PERFECT window, 7 keys",75,20,200,5,"Milliseconds either side that count as PERFECT.","ms"),
    V("hw.g7","GREAT window, 7 keys",140,40,300,5,"GREAT window.","ms"),
    V("hw.o7","GOOD window, 7 keys",205,60,400,5,"GOOD window.","ms"),
    V("hw.p4","PERFECT window, 4 keys",70,20,200,5,"PERFECT window on the 4-key highway.","ms"),
    V("hw.g4","GREAT window, 4 keys",130,40,300,5,"GREAT window on 4 keys.","ms"),
    V("hw.o4","GOOD window, 4 keys",190,60,400,5,"GOOD window on 4 keys.","ms"),
    V("hw.holdBase","Hold bar base points",40,0,200,5,"Points for finishing a hold, plus the extras below.","pts"),
    V("hw.holdPer","Hold points per 100 ms",5,0,30,1,"Extra points per 100 ms of hold length.","pts"),
    V("hype.perfect","Hype gain, PERFECT",0.035,0,0.2,0.005,"How much the hype meter (0 to 1) fills per PERFECT.",""),
    V("hype.great","Hype gain, GREAT",0.025,0,0.2,0.005,"Hype per GREAT.",""),
    V("hype.good","Hype gain, GOOD",0.012,0,0.2,0.002,"Hype per GOOD.",""),
    V("hype.miss","Hype loss, miss / let go",0.08,0,0.4,0.01,"Hype lost on a miss or letting go early.",""),
    V("hype.drift","Hype drift back",0.0008,0,0.01,0.0001,"How fast hype drifts back to its resting level each frame when nothing is happening.","")]},
  {id:"fish",name:"Fishing",icon:"🎣",mode:"fish",cat:"Ride & race",
   about:"Swoop to cast (how far round the lane you get = power: distance, fish size, points). Reel by winding past the notch on each beat; swing the rod against the fish's run to cut its pull. Keep the tension meter out of the red (snap) and off empty (it gets off). Net it at the edge. The marlin shows up at the far water now and then.",
   vars:[
    V("fi.swoopGrace","Perfect cast: free time",450,0,1500,25,"How long you can take on the swoop before the cast's power starts dropping. Bigger = an easier perfect cast.","ms"),
    V("fi.swoopDrain","Cast power drain",1600,500,5000,50,"After the free time, how long the power takes to drain away. Bigger = more forgiving.","ms"),
    V("fi.reel","Reel speed",0.24,0.05,0.8,0.01,"How fast a full-speed reel (spinning at the BPM) pulls the line in.","/s"),
    V("fi.spinWin","BPM match window",0.15,0.04,0.4,0.01,"How close your spin has to be to the BPM for full speed (share either side). Over it also adds tension.",""),
    V("fi.tenOver","Tension from overspinning",0.9,0,3,0.05,"How much spinning faster than the BPM strains the line.",""),
    V("fi.recastSpd","Recast reel-in speed",0.9,0.2,3,0.05,"How fast the line comes in while you spin the reel after pressing RECAST.","/s"),
    V("fi.run","Fish pull-out",0.14,0,0.6,0.01,"How fast a running fish pulls line back out.","/s"),
    V("fi.fishStr","Fish strength",1,0.2,2.5,0.05,"How hard every fish fights (multiplies its pull).","×"),
    V("fi.burst","How often it runs",0.62,0,1,0.02,"The chance each spell is a run rather than a rest. Higher = more runs.",""),
    V("fi.tenReel","Tension from reeling",0.45,0,1.2,0.01,"How much tension full-speed reeling adds on its own.",""),
    V("fi.tenPull","Tension from the fish",1.15,0,2.5,0.05,"How much tension the fish's pull adds while you reel.",""),
    V("fi.rodHelp","Rod against the run helps",0.7,0,1,0.02,"How much pulling the rod the opposite way to the run cuts the fish's pull (1 = all of it).",""),
    V("fi.tenRise","Tension response",5,1,15,0.5,"How quickly the meter follows what's happening. Lower = smoother, slower.",""),
    V("fi.snapT","Snap after",0.5,0.1,3,0.05,"How long the meter can sit at the top before the line snaps.","s"),
    V("fi.slackT","Slack: lose after",3.5,1,10,0.25,"How long the meter can sit empty before the fish gets off.","s"),
    V("fi.netT","Net time",4000,1000,10000,250,"How long you have to tap NET once it's at the edge.","ms"),
    V("fi.swoopR","Swoop lane width",0.1,0.04,0.25,0.005,"How wide the cast lane is. Bigger is easier.",""),
    V("fi.marlinStr","Marlin strength",0.9,0.3,2.5,0.05,"How hard the marlin fights.","×"),
    V("fi.marlinReel","Marlin reel speed",0.55,0.1,1.5,0.05,"How much slower the marlin reels in (1 = like any fish).","×"),
    V("fi.marlinEvery","Marlin: every",26000,8000,90000,1000,"How often the marlin can show up.","ms"),
    V("fi.marlinReach","Marlin: aim reach",0.11,0.03,0.3,0.01,"How close the cast has to land to him to hook him (share of the screen).","")]},
  {id:"boats",name:"Bumper boats",icon:"🚤",mode:"boats",cat:"Ride & race",
   about:"Steer round the floating pool, BOOST to ram. Over the edge and you're out; the pool drains as the song goes.",
   vars:[
    V("bb.accel","Steering push",1.3,0.3,4,0.05,"How hard the stick pushes your boat.",""),
    V("bb.drag","Water drag",1.1,0.2,4,0.05,"How quickly boats slow down.",""),
    V("bb.max","Top speed",0.7,0.2,2,0.05,"Fastest without boosting.",""),
    V("bb.boost","Boost kick",0.7,0.1,2,0.05,"The ram's kick.",""),
    V("bb.boostCd","Boost refill",4500,500,10000,100,"Time before you can boost again.","ms"),
    V("bb.lip","Edge push-back",1.6,0,5,0.1,"How hard the water pushes you back in near the edge.",""),
    V("bb.bounce","Bump bounce",0.25,0,1,0.05,"Extra push apart when boats hit.",""),
    V("bb.knock","Knock-off points",300,0,1000,10,"Points for knocking someone off.",""),
    V("bb.last","Last boat points",500,0,2000,10,"Bonus for the last boat floating.","")]},
  {id:"swim",name:"Coin dive",icon:"🐠",mode:"swim",cat:"Ride & race",
   about:"The venue floods and everyone swims. You glide the way you push, and on every beat you take a stroke that surges you forward. DASH on the beat is a big kick. Coins pop in on the song's beats along trails made from its analysis; gold in the loud parts, a ring at the drop.",
   vars:[
    V("sw.speed","Game speed",1,0.4,1.6,0.05,"Everything you do in the water plays at this speed. Lower is slower.","×"),
    V("sw.glide","Glide pull",0.55,0,2,0.05,"The steady pull while you push the stick, between strokes.",""),
    V("sw.stroke","Stroke surge",2.4,0,6,0.1,"How hard each beat's stroke surges you forward.",""),
    V("sw.drag","Water drag",1.5,0.3,4,0.1,"How quickly you slow down when you stop pushing. Lower is floatier.",""),
    V("sw.max","Top speed",0.8,0.2,2,0.05,"Fastest you can swim (screens per second).",""),
    V("sw.perfect","DASH: on-beat window",0.13,0.04,0.3,0.01,"How close to the beat a DASH must be for PERFECT (fraction of a beat either side).",""),
    V("sw.flick","DASH: flick speed",200,80,500,10,"How quickly the stick has to go from the middle to the edge to count as a flick (dash). Bigger is easier.","ms"),
    V("sw.life","Coin time",6,2,12,0.5,"How many beats a coin stays before it goes.","beats"),
    V("sw.coinSize","Coin size",1,0.5,2,0.05,"How big the coins are drawn.","×"),
    V("sw.reach","Grab reach",1,0.5,2,0.05,"How close you need to be to grab a coin.","×")]},
  {id:"ski",name:"Ski",icon:"⛷",mode:"ski",cat:"Ride & race",
   about:"Ski down an endless mountain. Point where you want to go: straight down is fastest, sideways slows you, uphill stops you. Go between the slalom flags for points (in a row for a combo), hit ramps for air and press a trick key; trees and rocks knock you down (hop over rocks).",
   vars:[
    V("ski.gameSpeed","Game speed",0.85,0.4,1.5,0.05,"Everything on the slope plays at this speed: 1 is the original speed, lower is slower.","×"),
    V("ski.maxSpeed","Top speed",165,60,300,5,"Fastest you can go, pointing straight down the slope.","u/s"),
    V("ski.accel","Acceleration",290,60,500,10,"How quickly you pick up speed.",""),
    V("ski.turn","Turn speed",4.2,1,8,0.1,"How fast your skis swing round to where you're pointing.","rad/s"),
    V("ski.hop","Hop air time",0.28,0.2,1,0.05,"How long a hop (Space) keeps you in the air. While you're up you can swing round fast to cut onto a new line.","s"),
    V("ski.hopBoost","Hop pop: speed (unused)",0,0,60,1,"The little kick of speed a hop gives you.","u/s"),
    V("ski.hopPush","Hop pop: sideways shove",55,0,200,5,"How hard a hop shoves you sideways, the way you're steering or sliding.","u/s"),
    V("ski.rampAir","Ramp air time",1.3,0.4,2,0.05,"How long a ramp keeps you in the air at top speed.","s"),
    V("ski.djSlow","Dance jump: slow motion",0.3,0.1,1,0.05,"How fast the jump's air time runs while a swoop is up. Lower is slower (more time to drag it). 1 is no slow motion.","×"),
    V("ski.djPower","Dance jump: flick power for jump 2",2.1,0.5,5,0.1,"How hard the first swoop's flick must be (screens per second at the end of the drag) for the next ramp to give jump 2.",""),
    V("ski.djSuper","Dance jump: flick power for the Super",3.2,0.5,6,0.1,"How hard the Super swoop's flick must be.",""),
    V("ski.djAir","Dance jump: extra air",1,0.3,2,0.05,"How much higher (more air time) a landed swoop throws you.","×"),
    V("ski.crash","Crash time",1.4,0.4,4,0.1,"How long a crash keeps you down.","s"),
    V("ski.gatePts","Points per gate",100,10,500,10,"Points for going between a pair of flags (before the combo multiplier).","")]},
  {id:"pipe",name:"Half pipe",icon:"🛹",mode:"pipe",cat:"Ride & race",
   about:"Groups of 4 or 5 share a half pipe, each rolling at their own pace. Tap BEAT (Space) on the beat to build momentum; lean with the left stick (A/D). At the top of the ramp, swipe: the direction picks a dance trick, how hard sets the height. In the air, spin with the stick to line the board up with the wall, and add style with 1–4. Clean landings fill the SUPER meter.",
   vars:[
    V("pp.cross","Time to cross the pipe",2.8,1,4,0.1,"Seconds to roll from one wall to the other. Higher is slower.","s"),
    V("pp.window","Beat timing window",0.2,0.05,0.5,0.01,"How far from the beat (in beats) a BEAT press still counts.","beats"),
    V("pp.cruise","Cruising speed",1.0,0.6,1.6,0.05,"The momentum you roll up to on your own (0.95 or more reaches the lip).",""),
    V("pp.boost","Boost pad kick",0.3,0.05,0.8,0.05,"How much momentum the lit boost pad adds when you roll over it.",""),
    V("pp.decay","Boost fade",0.06,0,0.4,0.01,"How quickly extra speed from boosts eases back down to cruising.","/s"),
    V("pp.spin","Spin speed",420,120,900,10,"How fast the left stick spins you in the air.","°/s"),
    V("pp.clean","Clean landing angle",25,8,60,1,"How far off the wall's angle you can land and still be clean (twice this is sketchy).","°"),
    V("pp.superPts","Points to fill SUPER",2500,500,10000,100,"Clean-landing points needed to fill the SUPER meter.",""),
    V("pp.bail","Bail time",1.2,0.4,3,0.1,"How long a bail keeps you down.","s")]},
  {id:"rhythm",name:"Rhythm games (all)",icon:"🎵",mode:"keys4",cat:"Rhythm",
   about:"Shared by Step dance, Target dance and both Note highways. The players' own speed button (1.0×, 1.25×…) multiplies this.",
   vars:[
    V("rhythm.scroll","Base scroll speed",1.5,0.6,3,0.05,"What 1.0× on the speed button means. 1.5 is the old 1.5× (faster notes, more reading room). Higher is faster.","×")]},
  {id:"ctf",name:"Capture the flag",icon:"🚩",mode:"ctf",cat:"Team",
   about:"Two teams on a tile arena: grab their flag, bring it home, tag anyone on your half. Practice uses these numbers straight away; shows use the server's until you send them to lock in.",
   vars:[
    V("ctf.speed","Run speed",6.2,2,14,0.1,"Tiles a second running.","tiles/s"),
    V("ctf.sprint","Sprint multiplier",1.6,1,3,0.05,"Speed while sprinting.","×"),
    V("ctf.stam","Sprint meter",1.2,0.5,8,0.1,"Seconds of sprint in a full meter.","s"),
    V("ctf.carry","Carrying the flag",0.85,0.4,1,0.01,"Speed while you carry their flag.","×"),
    V("ctf.pad","Boost pad push",2.4,0,6,0.1,"How hard a boost pad throws you.","×"),
    V("ctf.tagR","Tag reach",1,0.4,2,0.05,"How close two players have to get to tag.","tiles")]},
  {id:"kflag",name:"Kart flag",icon:"🏎️",mode:"kflag",cat:"Team",
   about:"Capture the flag in karts: LAUNCH (hold, aim, let go) to fly, IMPACT to knock your flag out of a carrier, power-up boxes for items. Practice uses these straight away; shows use the server's until you send them.",
   vars:[
    V("kf.speed","Top speed",9.5,3,20,0.1,"Tiles a second at full stick.","tiles/s"),
    V("kf.launch0","Launch, quick tap",0.95,0.6,3,0.05,"Speed after a tap of LAUNCH, as a multiple of top speed.","×"),
    V("kf.launch1","Launch, fully charged",1.4,0.8,4,0.05,"Speed after a full charge.","×"),
    V("kf.aim","Launch charge time",700,200,2000,50,"How long to hold LAUNCH for a full charge.","ms"),
    V("kf.launchCd","Launch cooldown",4000,0,15000,250,"How long after a launch before you can LAUNCH again.","ms"),
    V("kf.impactR","IMPACT reach",3,1,8,0.1,"Radius of the IMPACT blast.","tiles"),
    V("kf.impactCd","IMPACT cooldown",8000,1000,20000,250,"Time before you can IMPACT again.","ms"),
    V("kf.spin","Spin-out time",1300,300,4000,50,"How long a hit kart spins.","ms"),
    V("kf.box","Box comes back after",8000,1000,30000,500,"Respawn time of a power-up box.","ms"),
    V("kf.shield","Shield time",4000,500,10000,250,"How long a shield lasts.","ms"),
    V("kf.nitro","Nitro time",2200,500,6000,100,"How long nitro lasts.","ms"),
    V("kf.tile","Zoom (tile size)",44,24,90,1,"Pixels per tile on screen. 44 is halfway between the old wide view and Mars Rally (54).","px")]},
  {id:"battle",name:"Dance battle",icon:"⚔️",mode:"free",cat:"Dance",
   about:"Battle rounds: a knockout of 1 v 1s inside one song, the crowd votes live, the final takes the end of the song. Practice uses this straight away; shows use the server's until you send it.",
   vars:[
    V("battle.match","Match length",20000,8000,45000,500,"Length of each 1 v 1 (the final takes the finale).","ms")]},
  {id:"fd",name:"Free dance",icon:"🕺",mode:"free",cat:"Dance",
   about:"Dancing on the floor and the spotlight turns in the middle.",
   vars:[
    V("fd.turnH","Spotlight zoom",0.5,0.2,0.9,0.01,"In your spotlight turn the camera zooms until you are this much of the screen tall (it never goes past the gap between the button columns).","of screen")]},
  {id:"walk",name:"Dance walk race",icon:"💃",mode:"walk",cat:"Dance",
   about:"Race across the floor. Keep your cursor (or finger) in the circle as it moves along an invisible path to walk at full speed. The dance, and the circle's path, change every 8 beats. Out of the circle you slow down; stay out too long and you trip.",
   vars:[
    V("wk.time","Race time at full speed",75,30,180,1,"Seconds to run the whole track if you never leave the circle (the track is a few screens long, so the finish is off screen at the start).","s"),
    V("wk.radius","Circle size",0.26,0.1,0.5,0.01,"Radius of the circle, as a fraction of half the pad.",""),
    V("wk.minSpeed","Slowest speed",0.25,0,0.8,0.01,"Your speed when you're well outside the circle, as a fraction of full speed.","×"),
    V("wk.tripTime","Time out before tripping",1.4,0.4,4,0.1,"How long you can stay outside the circle before you trip.","s"),
    V("wk.stun","Trip time",1.3,0.3,4,0.1,"How long a trip stops you.","s"),
    V("wk.loopBeats","Beats per loop",5,2,8,1,"How many beats the circle takes to go once round its path. Lower is faster and harder.","beats")]},
  {id:"keepy",name:"Keepy uppy",icon:"🎈",mode:"keepy",cat:"Ride & race",
   about:"Keep balloons, balls and feathers off the floor. Get under one and head it up. Jump (Space) once for a hop, again in the air for a double jump that hits harder and scores double.",
   vars:[
    V("kp.speed","Move speed",0.42,0.1,1.2,0.01,"Walking speed on the keepy floor, fraction of room width per second.","room/s"),
    V("kp.jump1","Jump power",78,30,160,2,"Upward speed of the first jump.",""),
    V("kp.jump2","Double jump power",92,30,200,2,"Upward speed of the second jump in the air.",""),
    V("kp.gravity","Gravity",240,80,600,10,"How fast you fall back. Higher means short snappy jumps.",""),
    V("kp.reachX","Reach sideways",9,3,30,1,"How close sideways (screen pixels, half-scale) an object must be to hit it.","px"),
    V("kp.reachY","Reach depth",7,2,30,1,"How close in depth an object must be to hit it.","px"),
    V("kp.zMin","Hit height, lowest",8,0,40,1,"Objects below your head by less than this are too low to head.",""),
    V("kp.zMax","Hit height, highest",30,10,80,1,"Objects higher than this above you are too high.",""),
    V("kp.cooldown","Hit cooldown",380,100,1500,20,"Time before you can hit the same object again.","ms"),
    V("kp.dblKick","Double-jump kick boost",1.25,1,3,0.05,"How much harder a double-jump hit launches the object.","×"),
    V("kp.dblPts","Double-jump points",2,1,5,0.5,"Score multiplier for a double-jump hit.","×"),
    V("kp.spinPts","Spin-in-air bonus",2,1,5,0.5,"Score multiplier for a hit while you're in the air and spinning (SPIN, TWIRL, or the double jump's spin). Stacks with the double-jump bonus.","×"),
    V("kp.streak","Streak bonus",0.15,0,1,0.05,"Extra score per hit in a row on the same object.","×")]},
  {id:"skate",name:"Roller & Ice rink",icon:"🛼",mode:"skate",cat:"Ride & race",
   about:"Skate laps round the island. Build speed, jump for air, then hold a direction on the wheel for tricks and switch for a chain. Let go before you land or you bail. Laps and tricks score.",
   vars:[
    V("sk.accel","Acceleration",900,300,2500,50,"How hard you push when steering. Scaled by rink size.",""),
    V("sk.maxSpeed","Top speed",640,300,1400,20,"Maximum skating speed. Scaled by rink size.",""),
    V("sk.dragMove","Drag while steering",0.62,0.2,0.95,0.01,"Speed kept per second while pushing. Lower is more drag (0.62 = keeps 62%). Ice feels icier near 0.9.",""),
    V("sk.dragIdle","Drag while coasting",0.5,0.1,0.95,0.01,"Speed kept per second when you let go of the stick. Higher glides further.",""),
    V("sk.minJump","Speed needed to jump",0.22,0,0.8,0.02,"Fraction of top speed you need before JUMP works.",""),
    V("sk.airBase","Air time, minimum",450,150,1500,50,"Shortest jump length.","ms"),
    V("sk.airExtra","Air time, extra at speed",1300,0,3000,50,"Extra jump length added at full speed.","ms"),
    V("sk.peakBase","Air height, minimum",10,2,40,1,"Shortest jump height.",""),
    V("sk.peakExtra","Air height, extra at speed",24,0,80,1,"Extra height added at full speed.",""),
    V("sk.bailTime","Bail time on the floor",1.3,0.3,4,0.1,"How long you lie there after a bail.","s"),
    V("sk.bailKeep","Speed kept after a bail",0.15,0,1,0.05,"Fraction of your speed left after a bail.",""),
    V("sk.trickPts","Trick points per second",150,20,600,10,"Points earned each second you hold a trick in the air.","pts/s"),
    V("sk.chain","Chain bonus",0.6,0,2,0.1,"Extra trick score per extra trick in the chain.","×"),
    V("sk.landPts","Landing bonus per chain",40,0,300,5,"Flat points per trick in the chain, banked on a clean landing.","pts"),
    V("sk.lapPts","Lap points",100,0,500,10,"Points for each full lap of the island.","pts"),
    V("sk.rail","Rail bounce",1.5,1,2.5,0.1,"How hard you bounce off the rails. 1 is a dead stop against the rail, 2 is a full rebound.","×")]},
  {id:"kart",name:"Mars Rally (kart)",icon:"🏍",mode:"kart",cat:"Ride & race",
   about:"Space kart racing on the dance floor. The stick (or the mouse on a computer) is speed and direction; point behind you and the kart swings round. Tap DRIFT to hop, swing into the turn, land at a good angle and hold it; let go for a boost. Points for distance, laps, boosts, overtakes and running near the front.",
   vars:[
    V("kt.maxSpeed","Top speed",260,70,400,5,"Track units per second with the stick pushed all the way (a lap is 2000 to 3000 units).",""),
    V("kt.accel","Acceleration",130,40,400,5,"How fast you pick up speed.",""),
    V("kt.coast","Coasting slow-down",70,10,300,5,"How fast you slow down with the stick let go.",""),
    V("kt.turn","Turn speed",3.4,1,7,0.1,"How fast the kart swings round to face where the stick points (radians per second).",""),
    V("kt.grip","Grip",0.002,0.0001,0.2,0.001,"Sideways speed kept per second when not drifting. Lower is grippier.",""),
    V("kt.wall","Rail bounce",0.35,0,1,0.05,"How much you bounce off the rails (0 = slide along them).",""),
    V("kt.hop","Drift hop time",0.3,0.1,0.8,0.02,"How long the kart is in the air after you press DRIFT.","s"),
    V("kt.hopTurn","Hop swing speed",7,2,14,0.5,"How fast you can swing the kart round while it's in the air.","rad/s"),
    V("kt.driftK","Drift tightness",2.2,0.8,4,0.1,"How tight the locked drift turns for the angle you land at.",""),
    V("kt.driftTrim","Drift steering",0.15,0,0.6,0.01,"How much the stick can tighten or widen a drift after you land it (0.15 = 15%). Lower means the landing angle matters more.",""),
    V("kt.trimRate","Drift steering speed",1.5,0.3,6,0.1,"How quickly that steering builds up. Lower means you can't rescue a bad landing quickly.","/s"),
    V("kt.miniT","Blue spark charge",0.8,0.3,3,0.1,"Seconds of drifting for blue sparks (mini-turbo).","s"),
    V("kt.turboT","Orange spark charge",1.6,0.6,5,0.1,"Seconds of drifting for orange sparks (super turbo).","s"),
    V("kt.ultraT","Purple spark charge",2.6,1,7,0.1,"Seconds of drifting for purple sparks (ultra turbo).","s"),
    V("kt.boost1","Mini-turbo length",0.7,0.2,2,0.1,"","s"),
    V("kt.boost2","Super turbo length",1.1,0.3,3,0.1,"","s"),
    V("kt.boost3","Ultra turbo length",1.6,0.3,4,0.1,"","s"),
    V("kt.boostMul","Boost top speed",1.4,1.1,2,0.05,"Top speed multiplier while boosting.","×"),
    V("kt.padTime","Boost pad length",1.1,0.3,3,0.1,"How long a yellow pad boosts you.","s"),
    V("kt.startBoost","Rocket start length",1.4,0.3,3,0.1,"Boost for pushing the stick from the 2 light and still holding at GO.","s"),
    V("kt.intro","Intro speed",1,0.1,2,0.1,"Length of the UFO and zoom-out intro (1 is full, 0.1 is almost skipped).","×"),
    V("kt.distPts","Points per 100 units",40,0,200,5,"Points for new ground covered.","pts"),
    V("kt.lapPts","Lap points",400,0,2000,50,"Points for each lap.","pts"),
    V("kt.rankPts","Front-runner points",6,0,40,1,"Points per second for the leader, fewer further back.","pts/s"),
    V("kt.passPts","Overtake points",30,0,300,5,"Points each time you move up a place.","pts"),
    V("kt.driftPts","Boost points",50,0,300,5,"Points for a mini-turbo (super pays double, ultra triple).","pts")]},
  {id:"mosh",name:"Mosh pit",icon:"🤘",mode:"mosh",cat:"Dance",
   about:"Pick a side, wait for the drop and charge. Win the tug of war by tapping, then circle pits: push forward to sprint, in or out to change lanes, and shove people for points.",
   vars:[
    V("mp.sprint","Circle sprint",1.8,1,4,0.1,"Speed multiplier when pushing forward in the circle pit.","×"),
    V("mp.back","Circle backpedal",0.55,0.1,1,0.05,"Speed multiplier when pushing back in the circle pit.","×"),
    V("mp.circleSpeed","Circle base speed",0.95,0.3,3,0.05,"Base angular speed round the circle.","rad/s"),
    V("mp.walkIn","Chase speed, steady",0.6,0.2,2,0.05,"How fast your avatar is carried to your place on the circle.",""),
    V("mp.walkSprint","Chase speed, sprinting",0.9,0.2,3,0.05,"The same while sprinting.",""),
    V("mp.split","Speed to your side",0.55,0.2,2,0.05,"How fast you are moved to your side before the drop.",""),
    V("mp.charge","Charge speed",1.1,0.3,3,0.05,"Speed of the wall charge when the drop hits.",""),
    V("mp.tug","Tug-of-war approach",0.9,0.3,3,0.05,"Speed to your place in the push war.",""),
    V("mp.damp","Shove damping",0.04,0.005,0.5,0.005,"Fraction of a shove's speed left after one second. Lower stops sooner.",""),
    V("mp.lapPts","Lap points",150,0,500,10,"Points per lap of the circle pit.","pts"),
    V("mp.swingPts","Swing points",10,0,100,1,"A swing that doesn't land: windmilling your arms, or a punch that misses.","pts"),
    V("mp.swingBeatPts","Swing on the beat",20,0,100,1,"The same swing, on the beat.","pts"),
    V("mp.punchPts","Punch lands",40,0,200,5,"A punch that hits someone.","pts"),
    V("mp.punchBeatPts","Punch lands on the beat",60,0,200,5,"A punch that hits someone on the beat.","pts"),
    V("mp.bangPerfect","Headbang perfect window",40,15,120,5,"How close to the beat a headbang must be for PERFECT (GREAT is twice this, GOOD about three times).","ms"),
    V("mp.tugMs","Push war length",10000,4000,30000,500,"How long the push war after the wall of death charge lasts.","ms")]}
  ];
  var DEF={},VALS={},BYK={},listeners=[];
  GROUPS.forEach(function(g){g.vars.forEach(function(x){DEF[x.k]=x.def;BYK[x.k]=x;});});
  try{var s=JSON.parse(localStorage.getItem("uk_tune")||"{}");for(var k in s)if(BYK[k]&&isFinite(+s[k]))VALS[k]=clamp(k,+s[k]);}catch(e){}
  function clamp(k,n){var d=BYK[k];return Math.max(d.min,Math.min(d.max,n));}
  function save(){try{localStorage.setItem("uk_tune",JSON.stringify(VALS));}catch(e){}}
  function fire(){listeners.forEach(function(f){try{f();}catch(e){}});}
  function v(k){return VALS[k]!==undefined?VALS[k]:DEF[k];}
  function set(k,n){if(!BYK[k]||!isFinite(+n))return;n=clamp(k,+n);if(n===DEF[k])delete VALS[k];else VALS[k]=n;save();fire();}
  function reset(k){delete VALS[k];save();fire();}
  function resetGroup(id){GROUPS.forEach(function(g){if(g.id===id)g.vars.forEach(function(x){delete VALS[x.k];});});save();fire();}
  function resetAll(){VALS={};save();fire();}
  /* the share text: only what you changed, plus a JSON line that can be pasted straight back in */
  function exportText(){
    var lines=["UNHOLY KEYS TUNING"],n=0;
    GROUPS.forEach(function(g){var rows=g.vars.filter(function(x){return VALS[x.k]!==undefined;});if(!rows.length)return;
      lines.push("","["+g.name+"]");rows.forEach(function(x){n++;lines.push(x.k+" = "+VALS[x.k]+"   ("+x.label+"; default "+x.def+(x.unit?" "+x.unit:"")+")");});});
    if(!n)lines.push("","(nothing changed: every value is at its default)");
    lines.push("","JSON: "+JSON.stringify(VALS));
    return lines.join("\n");
  }
  function importText(t){
    var m=/JSON:\s*(\{[\s\S]*\})/.exec(t||""),o=null,n=0;
    try{o=JSON.parse(m?m[1]:t);}catch(e){o=null;}
    if(!o){o={};String(t||"").split(/\n/).forEach(function(l){var q=/^\s*([a-z0-9.]+)\s*=\s*(-?[0-9.]+)/i.exec(l);if(q)o[q[1]]=+q[2];});}
    VALS={};for(var k in o)if(BYK[k]&&isFinite(+o[k])){var c=clamp(k,+o[k]);if(c!==DEF[k]){VALS[k]=c;n++;}}
    save();fire();return n;
  }
  function changed(){var n=0;for(var k in VALS)n++;return n;}
  return{v:v,set:set,reset:reset,resetGroup:resetGroup,resetAll:resetAll,groups:GROUPS,def:function(k){return DEF[k];},has:function(k){return VALS[k]!==undefined;},exportText:exportText,importText:importText,changed:changed,onChange:function(f){listeners.push(f);},all:function(){var o={};for(var k in DEF)o[k]=v(k);return o;}};
})();
