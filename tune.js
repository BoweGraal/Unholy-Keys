/* Unholy Keys tuning lab: every number a minigame uses for movement, timing and scoring, in one list.
   The games read their numbers with TUNE.v("game.name"). Changes made in the lab are kept on this device
   (localStorage "uk_tune") and can be copied as text, pasted back in, or sent to the developer to lock in. */
var TUNE=(function(){
  function V(k,label,def,min,max,step,help,unit){return{k:k,label:label,def:def,min:min,max:max,step:step,help:help,unit:unit||""};}
  var GROUPS=[
  {id:"walk",name:"Walking",icon:"🚶",mode:"free",
   about:"How you move around the floor outside the skating and mosh games. Arrow keys, WASD, the joystick and tap-to-walk all use the same speed.",
   vars:[
    V("walk.speed","Walk speed",0.33,0.1,1,0.01,"Fraction of the room width crossed per second. 0.33 is about 3 seconds to cross the room.","room/s"),
    V("walk.moshBoost","Mosh pit speed boost",1.45,1,3,0.05,"Walking is this many times faster while the mosh pit is on.","×"),
    V("walk.ease","Avatar catch-up",0.35,0.05,1,0.05,"How tightly the drawn avatar follows where you are heading. 1 is instant, small is floaty.","")]},
  {id:"step",name:"Step & Target dance",icon:"⬆️",mode:"step",
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
  {id:"hw",name:"Note highway",icon:"🎹",mode:"keys",
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
  {id:"ski",name:"Ski",icon:"⛷",mode:"ski",
   about:"Ski down an endless mountain. Point where you want to go: straight down is fastest, sideways slows you, uphill stops you. Go between the slalom flags for points (in a row for a combo), hit ramps for air and press a trick key; trees and rocks knock you down (hop over rocks).",
   vars:[
    V("ski.maxSpeed","Top speed",230,60,300,5,"Fastest you can go, pointing straight down the slope.","u/s"),
    V("ski.accel","Acceleration",320,60,500,10,"How quickly you pick up speed.",""),
    V("ski.turn","Turn speed",4.2,1,8,0.1,"How fast your skis swing round to where you're pointing.","rad/s"),
    V("ski.hop","Hop air time",0.28,0.2,1,0.05,"How long a hop (Space) keeps you in the air. While you're up you can swing round fast to cut onto a new line.","s"),
    V("ski.hopBoost","Hop pop: speed (unused)",0,0,60,1,"The little kick of speed a hop gives you.","u/s"),
    V("ski.hopPush","Hop pop: sideways shove",55,0,200,5,"How hard a hop shoves you sideways, the way you're steering or sliding.","u/s"),
    V("ski.rampAir","Ramp air time",1.0,0.4,2,0.05,"How long a ramp keeps you in the air at top speed.","s"),
    V("ski.crash","Crash time",1.4,0.4,4,0.1,"How long a crash keeps you down.","s"),
    V("ski.gatePts","Points per gate",100,10,500,10,"Points for going between a pair of flags (before the combo multiplier).","")]},
  {id:"pipe",name:"Half pipe",icon:"🛹",mode:"pipe",
   about:"Groups of 4 or 5 share a half pipe, each rolling at their own pace. Tap BEAT (Space) on the beat to build momentum; lean with the left stick (A/D). At the top of the ramp, swipe: the direction picks a dance trick, how hard sets the height. In the air, spin with the stick to line the board up with the wall, and add style with 1–4. Clean landings fill the SUPER meter.",
   vars:[
    V("pp.cross","Time to cross the pipe",2.2,1,4,0.1,"Seconds to roll from one wall to the other. Higher is slower.","s"),
    V("pp.window","Beat timing window",0.2,0.05,0.5,0.01,"How far from the beat (in beats) a BEAT press still counts.","beats"),
    V("pp.cruise","Cruising speed",1.0,0.6,1.6,0.05,"The momentum you roll up to on your own (0.95 or more reaches the lip).",""),
    V("pp.boost","Boost pad kick",0.3,0.05,0.8,0.05,"How much momentum the lit boost pad adds when you roll over it.",""),
    V("pp.decay","Boost fade",0.06,0,0.4,0.01,"How quickly extra speed from boosts eases back down to cruising.","/s"),
    V("pp.spin","Spin speed",420,120,900,10,"How fast the left stick spins you in the air.","°/s"),
    V("pp.clean","Clean landing angle",25,8,60,1,"How far off the wall's angle you can land and still be clean (twice this is sketchy).","°"),
    V("pp.superPts","Points to fill SUPER",2500,500,10000,100,"Clean-landing points needed to fill the SUPER meter.",""),
    V("pp.bail","Bail time",1.2,0.4,3,0.1,"How long a bail keeps you down.","s")]},
  {id:"walk",name:"Dance walk race",icon:"💃",mode:"walk",
   about:"Race across the floor. Keep your cursor (or finger) in the circle as it moves along an invisible path to walk at full speed. The dance, and the circle's path, change every 8 beats. Out of the circle you slow down; stay out too long and you trip.",
   vars:[
    V("wk.time","Race time at full speed",40,15,120,1,"Seconds to cross the floor if you never leave the circle.","s"),
    V("wk.radius","Circle size",0.26,0.1,0.5,0.01,"Radius of the circle, as a fraction of half the pad.",""),
    V("wk.minSpeed","Slowest speed",0.25,0,0.8,0.01,"Your speed when you're well outside the circle, as a fraction of full speed.","×"),
    V("wk.tripTime","Time out before tripping",1.4,0.4,4,0.1,"How long you can stay outside the circle before you trip.","s"),
    V("wk.stun","Trip time",1.3,0.3,4,0.1,"How long a trip stops you.","s"),
    V("wk.loopBeats","Beats per loop",5,2,8,1,"How many beats the circle takes to go once round its path. Lower is faster and harder.","beats")]},
  {id:"keepy",name:"Keepy uppy",icon:"🎈",mode:"keepy",
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
    V("kp.streak","Streak bonus",0.15,0,1,0.05,"Extra score per hit in a row on the same object.","×")]},
  {id:"skate",name:"Roller & Ice rink",icon:"🛼",mode:"skate",
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
  {id:"kart",name:"Mars Rally (kart)",icon:"🏍",mode:"kart",
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
  {id:"mosh",name:"Mosh pit",icon:"🤘",mode:"mosh",
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
    V("mp.lapPts","Lap points",150,0,500,10,"Points per lap of the circle pit.","pts")]}
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
