/* Minigame explainer: during the last 15 seconds of a round's countdown, a card shows the game in action (a small looping
   pixel demo), how to play it and the rules. It is drawn on its own canvas, so it never touches the real game.
     EXPLAIN.tick(mode, secsLeft, roundKey, opts)   called about 4 times a second while a countdown runs
     EXPLAIN.hide()                                  hides it (the round started, or was cancelled)
   Shows while 3 < secsLeft <= 18, so the last 3 seconds are left for the big 3-2-1-GO. */
var EXPLAIN=(function(){
  var W=256,H=144,SHOW_MAX=18,SHOW_MIN=3;
  var root=null,cv=null,g=null,raf=0,on=false,t0=0,curMode="",curKey="",dismissed={},left=0;
  var COL={bg:"#0E0B1A",pink:"#D354A0",cyan:"#3DF2FF",yel:"#F5C518",pur:"#7F77DD",grn:"#4CC38A",red:"#FF4D6D",blu:"#5FB4F0",wht:"#fff"};
  var LCOL=["#D354A0","#5FB4F0","#F5C518","#3CCB8A"];
  var looks={};
  function look(i){if(!looks[i]){try{looks[i]=ART.looks.fromColor(["#D354A0","#3DF2FF","#F5C518","#4CC38A","#FF4D6D","#7F77DD"][i%6],i*7+3);}catch(e){looks[i]=null;}}return looks[i];}
  var touch="ontouchstart" in window||(navigator.maxTouchPoints|0)>0;

  /* ---------- what each game says: short, symbols over words ---------- */
  var INFO={
    step:{n:"Step dance",i:"⬆",goal:"Hit the arrows on the beat.",
      how:[["Tap the pad as each arrow hits the top","Arrow keys as each arrow hits the top"],"Long arrow: hold it"],
      rules:["PERFECT › GREAT › GOOD","Combo = more points"]},
    aim:{n:"Target dance",i:"🎯",goal:"Tap each target as its ring closes.",
      how:[["Tap the target when the ring closes","Click the target when the ring closes"],"Early or late: fewer points"],
      rules:["Combo = more points","Top score wins"]},
    keys:{n:"Note highway",i:"🎹",goal:"Play each note as it lands.",
      how:[["Tap the key as its note lands","A S D F G H J as notes land"],"Long note: hold it"],
      rules:["Combo fills HYPE","Top score wins"]},
    keys4:{n:"Highway · 4 keys",i:"🥁",goal:"Play each note as it lands.",
      how:[["Tap the pad as its note lands","D F J K as notes land"],"Long note: hold it"],
      rules:["Combo fills HYPE","Top score wins"]},
    free:{n:"Free dance",i:"🕺",goal:"Dance however you like.",
      how:[["Drag hands & feet · tap floor to walk","Drag hands & feet · click floor to walk"],"Pick moves from the side menu"],
      rules:["No points: the room votes 🗳","Everyone gets a spotlight turn"]},
    mosh:{n:"Mosh pit",i:"🤘",goal:"Swing on the beat. Rule the pit.",
      how:[["Hold the right stick at someone: you swing each beat","Hold the mouse at someone: you swing each beat"],["Headbang: tap as the block hits the line","Headbang: Space as the block hits the line"],"Wall of death: pick a side, charge on the drop"],
      rules:["Dead centre = SMASH 💥","Winning side gets a bonus"]},
    skate:{n:"Roller rink",i:"🛼",goal:"Skate fast, jump, land tricks.",
      how:[["Stick to skate · tap JUMP","Arrows to skate · Space to jump"],"In the air: hold a direction = trick"],
      rules:["Let go before you land or you bail","Bail = speed lost"]},
    ice:{n:"Ice rink",i:"⛸",goal:"A figure skating routine, all together.",
      how:[["Flick the stick the way the arrow points, on the beat","Press the arrow it shows, on the beat"],["Spin: circle the stick, then hold","Spin: circle the arrows, then hold"],["Jump: mash, pull back, push forward","Jump: mash Space, ↓ then ↑"]],
      rules:["On the beat = PERFECT","Highest jump gets a bonus"]},
    keepy:{n:"Keepy uppy",i:"🎈",goal:"Keep 🎈 ⚽ 🪶 off the floor.",
      how:[["Stick to move · tap JUMP to head it","Arrows to move · Space to head it"],"Jump again in the air = double jump"],
      rules:["Hits in a row = multiplier","🪶 and double jumps score most"]},
    fish:{n:"Fishing",i:"🎣",goal:"Biggest catch wins. 🐟",
      how:[["Drag the water to aim · swoop up fast to cast","Point to aim · swoop the mouse up fast to cast"],"A fish under the float bites · ← → nudge it, ⟳ pulls it in","❗ jerk ↓","Spin ⟳ to the beat ♩ · 🥅 net it"],
      rules:["Too fast ⚡ up · slower ⚡ down","⚡ full = 💥 SNAP","⚠ LINE OUT: reel!"]},
    dungeon:{n:"Dungeon",i:"🗡",goal:"Clear the rooms. Most spiders wins. 🕷",
      how:[["Stick: move · tap SWORD to swing","Arrows / WASD move · Space swings"],["Keep holding SWORD: it charges ✨","Keep holding Space: it charges ✨"],"Let go when it sparkles: SPIN ATTACK","Room clear → the door opens →"],
      rules:["Spiders hop on the beat ♩","Touch one = −1 ♥ (3)","Spin hits twice as hard"]},
    pond:{n:"Pool fishing",i:"🎣",goal:"Biggest catch wins. 🐟",
      how:[["Tap CAST · the stick walks you round the pool","Space to cast · ← → walk round the pool"],["Hold REEL: the glow rises · let go: it sinks","Hold Space / ↑ / the mouse: the glow rises · let go: it sinks"],["Stick ← → slides the glow · keep it on the 🐟","← → or the mouse slide the glow · keep it on the 🐟"],"Meter full · 🥅 NET when it's over the fish"],
      rules:["Off the fish = the meter drains","Empty = it got away","Big fish bite in the loud parts"]},
    boats:{n:"Bumper boats",i:"🚤",goal:"Knock everyone off the pool.",
      how:[["Steer with the stick · BOOST to ram","Arrows to steer · Space to BOOST"],"Hit them near the edge"],
      rules:["Over the edge = out","Knock-offs earn a 🛟 save"]},
    kart:{n:"Mars Rally",i:"🚀",goal:"Race round the Mars track.",
      how:[["Stick = direction & speed","WASD = direction & speed"],"Push on the 2 = rocket start",["Hold DRIFT through turns = boost","Hold Space through turns = boost"]],
      rules:["Laps, boosts & overtakes score","Top score wins"]},
    walk:{n:"Dance walk race",i:"🚶",goal:"Dance-walk to the finish.",
      how:[["Keep your circle in the moving circle","Keep the cursor in the moving circle"],"Fall out = you stop"],
      rules:["First to the finish wins"]},
    pipe:{n:"Half pipe",i:"🛹",goal:"Ride the pipe, flick dance tricks.",
      how:[["Left stick steers","WASD steers"],["Press the right stick at the line · flick at the lip","Hold the mouse at the line · flick at the lip"],"Lit pad = BOOST"],
      rules:["Land straight or bail","Clean landings fill SUPER ⭐"]},
    ski:{n:"Ski",i:"⛷",goal:"Race down: flags, then jumps.",
      how:[["Stick steers · tap HOP","Point to steer · click to hop"],"Pass flags on their arrow side","Jump zone: hop at the ramp end"],
      rules:["Hop + cut = speed boost","Jump zone tricks ×1.5"]},
    ctf:{n:"Capture the flag",i:"🚩",goal:"Grab their flag, bring it home.",
      how:[["Stick to run · hold SPRINT","Arrows to run · hold Space to sprint"],"Tag their carrier: flag goes home","⚡ refills sprint"],
      rules:["Capture = +500","Most captures wins"]},
    kflag:{n:"Kart flag",i:"🏎",goal:"Capture the flag in karts.",
      how:[["Steer with the stick (gas is auto)","Point or WASD to steer (gas is auto)"],["LAUNCH: hold, aim, let go","LAUNCH: hold left click, aim, let go"],["IMPACT: blast round you","IMPACT: right click or Space"]],
      rules:["IMPACT the carrier: flag home","Capture = +500"]},
    swim:{n:"Coin dive",i:"🐠",goal:"Swim to the beat, grab the coins.",
      how:[["Left stick swims","Arrows swim"],["Tap DASH on the beat = PERFECT","Click to dash · on the beat = PERFECT"]],
      rules:["Fresh coins score most","On the beat = double"]},
    ball:{n:"Ball run",i:"⚪",goal:"Don't get squashed by the ball.",
      how:[["Stick to run","Arrows to run"],"The performer steers the ball"],
      rules:["Squashed = out this round","3 rounds · last standing scores"]},
    dragon:{n:"Dragon riders",i:"🐉",goal:"Fly dragons. Beat the demon organ.",
      how:[["Stick to fly · tap 🔥 FIRE","Arrows to fly · Space = fire"],"Fuller 🔥 bar = bigger fireball",["Eat fire notes · SUPER = flamethrower","Eat fire notes · E = SUPER flamethrower"]],
      rules:["Last 90 s: the boss ☠","Boss down = you win · all down = performer wins"]}
  };
  function pick(a){return Array.isArray(a)?(touch?a[0]:a[1]):a;}

  /* ---------- the demos ---------- */
  function R(c,x,y,w,h){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function TX(s,x,y,p,c,al){try{ART.pixText(g,s,x,y,p,c,al||"left",0.7);}catch(e){}}
  function av(i,x,y,p,st){var L=look(i);if(!L)return;try{ART.drawChar(g,Math.round(x),Math.round(y),p,L,st||{});}catch(e){}}
  /* everything is drawn in whole pixels (no smooth paths): discs, ellipses, rings and lines are built from rects */
  function ell(c,x,y,rx,ry){x=Math.round(x);y=Math.round(y);g.fillStyle=c;var n=Math.max(1,Math.round(ry));for(var d=-n;d<=n;d++){var w=Math.round(rx*Math.sqrt(Math.max(0,1-(d*d)/(n*n))));g.fillRect(x-w,y+d,w*2+1,1);}}
  function circ(c,x,y,r){ell(c,x,y,r,r);}
  function eRing(c,x,y,rx,ry,w){w=Math.max(1,Math.round(w||1));g.fillStyle=c;var n=Math.max(8,Math.ceil(6.283*Math.max(rx,ry)/1.2)),seen={};for(var i=0;i<n;i++){var a=i/n*6.283,px=Math.round(x+Math.cos(a)*rx-w/2),py=Math.round(y+Math.sin(a)*ry-w/2),k=px+","+py;if(seen[k])continue;seen[k]=1;g.fillRect(px,py,w,w);}}
  function ring(c,x,y,r,w){eRing(c,x,y,Math.max(0.5,r),Math.max(0.5,r),w);}
  function line(c,x0,y0,x1,y1,w){w=w||1;g.fillStyle=c;var n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(var i=0;i<=n;i++)g.fillRect(Math.round(x0+(x1-x0)*i/n-w/2),Math.round(y0+(y1-y0)*i/n-w/2),w,w);}
  /* a pixel arrow pointing right / down / left / up (rot is rounded to the nearest quarter turn) */
  function arrow(c,x,y,s,rot){var q=((Math.round(rot/(Math.PI/2))%4)+4)%4;s=Math.max(2,Math.round(s));x=Math.round(x);y=Math.round(y);g.fillStyle=c;
    for(var u=-s;u<=s;u++){var hw=u<-Math.round(s*0.2)?Math.round(s*0.4):Math.round(s*(s-u)/(s*1.2));if(hw<0)continue;
      if(q===0)g.fillRect(x+u,y-hw,1,hw*2+1);else if(q===2)g.fillRect(x-u,y-hw,1,hw*2+1);else if(q===1)g.fillRect(x-hw,y+u,hw*2+1,1);else g.fillRect(x-hw,y-u,hw*2+1,1);}}
  function heart(c,x,y){x=Math.round(x);y=Math.round(y);R(c,x+1,y,2,1);R(c,x+4,y,2,1);R(c,x,y+1,7,2);R(c,x+1,y+3,5,1);R(c,x+2,y+4,3,1);R(c,x+3,y+5,1,1);}
  /* a finger (touch) or a pointer: shows what to do with your hands */
  function finger(x,y,press){x=Math.round(x);y=Math.round(y);if(press)ring("rgba(255,255,255,.7)",x,y,7,1);R("#000",x-2,y-1,5,9);R("#fde3c8",x-1,y,3,7);R("#000",x-3,y+6,7,6);R("#fde3c8",x-2,y+6,5,5);}
  function pop(txt,x,y,age,c,p){if(age<0||age>0.8)return;g.globalAlpha=1-age/0.8;TX(txt,x,y-age*14,p||1,c,"center");g.globalAlpha=1;}
  function badge(txt,c){var w=txt.length*6+8;R("rgba(0,0,0,.55)",6,6,w,12);TX(txt,10,9,1,c||COL.yel);}
  function score(v){TX("SCORE "+v,250,8,1,COL.yel,"right");}
  function floor(c1,c2){R(c1,0,0,W,H);for(var y=0;y<H;y+=12)for(var x=(y/12%2)*12;x<W;x+=24)R(c2,x,y,12,12);}

  /* a stream of notes rising (step) or falling (keys) into targets: returns the score so far */
  function lanesDemo(t,n,up,cols,labels,x0,lw){
    var ty=up?24:112,speed=64,seq=[0,2,1,3,2,0,3,1,1,2,0,3,2,3,0,1],gap=0.7,sc=0,hits=[];
    R("rgba(255,255,255,.05)",x0,0,n*lw,H);
    for(var i=0;i<n;i++){R("rgba(255,255,255,.08)",x0+i*lw,0,1,H);}
    var tt=t%(seq.length*gap+2);
    for(var k=0;k<seq.length;k++){
      var lane=seq[k]%n,at=k*gap+1.7,age=tt-at;                /* at = the moment it reaches the target */
      var y=up?ty+(-age)*speed:ty-(-age)*speed;
      if(age>=0&&age<0.5){hits.push([lane,age,k]);}
      if(age>=0)sc+=[100,60,100,30,100,100,60,100][k%8];
      if(age<0&&y>-10&&y<H+10){var cx=x0+lane*lw+lw/2;
        if(up)arrow(cols[lane],cx,y,lw*0.32,[Math.PI,Math.PI/2,-Math.PI/2,0][lane%4]);
        else R(cols[lane],cx-lw*0.34,y-5,lw*0.68,10);}
    }
    for(i=0;i<n;i++){var cx2=x0+i*lw+lw/2,glow=0;hits.forEach(function(h){if(h[0]===i)glow=1-h[1]/0.5;});
      if(up){arrow("rgba(255,255,255,"+(0.25+0.6*glow)+")",cx2,ty,lw*0.34,[Math.PI,Math.PI/2,-Math.PI/2,0][i%4]);}
      else{R(glow>0?cols[i]:"#2a2540",x0+i*lw+1,ty+8,lw-2,22);if(labels)TX(labels[i],cx2,ty+15,2,glow>0?"#000":"#8a85a8","center");}
      if(glow>0)ring(cols[i],cx2,ty+(up?0:4),6+glow*10,2);}
    hits.forEach(function(h){var j=["PERFECT","GREAT","PERFECT","GOOD"][h[2]%4];pop(j,x0+n*lw/2,up?58:78,h[1],[COL.yel,COL.grn,COL.yel,COL.blu][h[2]%4],1);});
    return sc;
  }
  function d_step(t){floor("#1a1530","#201a3a");var sc=lanesDemo(t,4,true,LCOL,null,14,34);
    var tt=t%12.2,ph=Math.floor((tt-1.7)/0.7);var pose=[[2.1,0.35,0.85,0],[1.2,-1.2,0.75,-0.75],[2.55,-2.55,0.1,-0.1],[-0.35,-2.1,0,-0.85]][((ph%4)+4)%4]||[0.15,-0.15,0,0];
    av(0,200,78,2,{armL:pose[0],armR:pose[1],legL:pose[2],legR:pose[3],bob:Math.abs(Math.sin(t*6))*2});score(sc);}
  function d_aim(t){floor("#1a1530","#201a3a");var seq=[[60,50],[120,90],[180,45],[90,100],[200,95],[140,40]],per=1.3,tt=t%(seq.length*per+1),sc=0,hits=[];
    for(var k=0;k<seq.length;k++){var s0=k*per+0.5,age=tt-s0;if(age>=0)sc+=100;
      if(age>-0.1&&age<1.2){var r=26-(age/1.2)*18;ring(COL.pink,seq[k][0],seq[k][1],r,2);circ("rgba(61,242,255,.25)",seq[k][0],seq[k][1],8);ring(COL.cyan,seq[k][0],seq[k][1],8,1);}
      if(age>=1.2&&age<1.6){var a2=(age-1.2)/0.4;ring(COL.yel,seq[k][0],seq[k][1],8+a2*14,2);pop("PERFECT",seq[k][0],seq[k][1]-10,age-1.2,COL.yel,1);}}
    var cur=Math.max(0,Math.min(seq.length-1,Math.floor((tt-0.5)/per+0.2))),nx=seq[cur];finger(nx[0]+4,nx[1]+4,false);
    score(sc);}
  function d_keys(t){R("#120e24",0,0,W,H);var sc=lanesDemo(t,7,false,["#D354A0","#E8873A","#F5C518","#3CCB8A","#5FB4F0","#7F77DD","#cfcfe8"],["A","S","D","F","G","H","J"],28,28);
    TX("HYPE",8,8,1,"#aaa");R("#2a2540",38,7,60,6);R(COL.pur,38,7,20+Math.min(40,t%12*4),6);score(sc);}
  function d_keys4(t){R("#120e24",0,0,W,H);var sc=lanesDemo(t,4,false,LCOL,["D","F","J","K"],48,40);
    TX("HYPE",8,8,1,"#aaa");R("#2a2540",38,7,60,6);R(COL.pur,38,7,20+Math.min(40,t%12*4),6);score(sc);}
  function d_free(t){floor("#1a1530","#201a3a");
    var s=Math.sin(t*3.2),c=Math.cos(t*3.2);
    av(0,98,80,2.5,{armL:1.4+s*1.2,armR:-1.4+s*1.2,legL:c*0.5,legR:-c*0.5,bob:Math.abs(s)*3});
    av(1,170,78,2,{armL:2.5+c*0.4,armR:-2.5-c*0.4,legL:s*0.3,legR:-s*0.3,bob:Math.abs(c)*2});
    /* a finger dragging a hand */
    var fx=70+Math.sin(t*3.2)*18,fy=52+Math.cos(t*3.2)*10;circ("rgba(255,255,255,.35)",fx,fy,6);ring("#fff",fx,fy,6,1);
    R("rgba(0,0,0,.5)",168,100,82,36);TX("ROOM VOTE",172,104,1,"#aaa");R("#2a2540",172,116,74,6);R(COL.pink,172,116,30+((t*8)%40),6);R("#2a2540",172,126,74,6);R(COL.cyan,172,126,20+((t*5)%30),6);
    var bt=Math.floor(t/2)%3;badge(["DRAG TO DANCE","PICK A DANCE","VOTE AT THE END"][bt]);}
  function d_skate(t,ice){R(ice?"#bfe3f2":"#c98b4a",0,0,W,H);for(var x=0;x<W;x+=16)R(ice?"#a8d4e8":"#b87a3c",x,0,2,H);
    ring(ice?"#ffffff":"#fff2",128,84,86,2);var a=t*1.3,x1=128+Math.cos(a)*86,y1=86+Math.sin(a)*38,jp=Math.max(0,Math.sin(t*2.2));jp=jp>0.7?(jp-0.7)/0.3:0;
    R("rgba(0,0,0,.25)",x1-8,y1+14,16,4);av(2,x1,y1-jp*24,1.5,{skates:ice?"ice":true,dir:Math.cos(a)>0?3:1,armL:1+jp*2,armR:-1-jp*2,legL:Math.sin(t*12)*0.4,legR:-Math.sin(t*12)*0.4});
    if(jp>0.3)pop(["KICKFLIP","SPIN","HEELFLIP"][Math.floor(t/2.9)%3],x1,y1-40,0.1+(1-jp),COL.pink,1);
    badge(ice?"ICE RINK":"ROLLER RINK",COL.cyan);TX("SPEED",150,134,1,"#fff");R("#0006",180,133,60,6);R(COL.grn,180,133,20+((t*14)%40),6);score(Math.floor(t*40));}
  function d_keepy(t){floor("#161233","#1c1840");var objs=[["#FF4D6D",0,1.7],["#F5C518",1.1,1.3],["#fff",2.1,1.0]],ax=128+Math.sin(t*0.9)*70;
    objs.forEach(function(o,i){var ph=((t*0.6+o[1])%1);var y=100-Math.sin(ph*3.1416)*80;var x=ax+Math.sin(t*0.9+i*2)*(10+i*18)-(i-1)*20;
      if(i===0){circ(o[0],x,y,7);R("#fff8",x-3,y-4,2,2);R("#999",x,y+7,1,10);}else if(i===1){circ(o[0],x,y,5);}else{R("#fff",x-5,y,10,2);R("#ddd",x-3,y-2,6,2);}
      if(ph<0.08){ring("#fff",x,100,10+ph*120,1);pop("+"+[100,60,200][i],x,88,ph,COL.yel,1);}});
    var jmp=Math.abs(Math.sin(t*3));av(0,ax,104-jmp*8,1.5,{armL:2.3,armR:-2.3,legL:jmp,legR:-jmp,dir:0});
    R("#0006",0,128,W,16);TX("COMBO ×"+(2+Math.floor(t)%5),8,134,1,COL.yel);score(Math.floor(t*50));}
  /* fishing: swoop to cast (the power bar is the fish), wait, ❗ jerk, spin the reel to the beat, watch the tension, net it */
  function fishPx(x,y,len,col){x=Math.round(x);y=Math.round(y);ell(col,x,y,len,Math.max(2,len*0.32));R("#fff",x+len-4,y-1,1,1);R(col,x-len-5,y-4,3,3);R(col,x-len-5,y+2,3,3);R(col,x-len-3,y-2,3,5);R("#cfe8ff",x+len,y,6,1);}
  /* pool fishing: cast from the edge of the pool, then the reel box: hold to rise, the stick slides, stay on the fish, net it */
  /* the dungeon: walk up to a spider, swing (a swoosh), then hold, sparkle, and spin */
  function d_dungeon(t){var T=t%8,cap="";R("#2a2438",0,0,W,H);for(var y=24;y<H;y+=16)for(var x=0;x<W;x+=16)R(((x+y)/16)%2?"#322b44":"#2d2640",x+1,y+1,14,14);R("#4a3f63",0,0,W,24);R("#1a1426",0,24,W,3);
    var px=40+Math.min(1,T/1.5)*70,py=96;av(0,px,py,1.5,{dir:1,armL:0.3,armR:T>1.6&&T<2.1?-2.6:-0.4});
    var sx=170,sy=94-(Math.sin(t*6)>0.6?6:0),alive=T<2.2||T>3.4;
    if(alive&&T<6){ell("rgba(0,0,0,.4)",sx,100,8,3);ell(T>1.8&&T<2.2?"#fff":"#2b1838",sx,sy,7,6);R("#ff2a3a",sx-3,sy-4,2,2);R("#ff2a3a",sx+1,sy-4,2,2);for(var l=0;l<4;l++){R("#1a1020",sx-13,sy-3+l*3,6,1);R("#1a1020",sx+7,sy-3+l*3,6,1);}}
    if(T<1.6)cap="1  WALK UP";
    else if(T<2.2){cap="2  TAP: SWING";for(var i=0;i<6;i++){var a=-1+i*0.35;R("rgba(200,240,255,.6)",px+12+Math.cos(a)*22,py-14+Math.sin(a)*18,4,3);}R(COL.yel,226,104,18,18);finger(235,113,true);}
    else if(T<4.6){cap=T<3.6?"3  HOLD: CHARGE":"3  …IT SPARKLES";R("#dfe8f5",px+6,py-16,22,3);if(T>3.6&&Math.floor(t*10)%2){R("#fff",px+26,py-19,6,2);R("#fff",px+28,py-21,2,6);}R(COL.yel,226,104,18,18);finger(235,113,true);
      if(T>3.4&&T<6){ell("rgba(0,0,0,.4)",150,100,8,3);ell("#2b1838",150,94,7,6);R("#ff2a3a",147,90,2,2);}}
    else if(T<5.4){cap="4  LET GO: SPIN!";var k=(T-4.6)/0.8;for(var j=0;j<12;j++){var a2=k*6.28-j*0.3;R("rgba(150,220,255,"+(0.7-j*0.05)+")",px+Math.cos(a2)*30,py-14+Math.sin(a2)*24,4,4);}pop("+25",150,80,T-4.6,COL.yel,1);}
    else cap="5  ROOM CLEAR →";
    if(cap)badge(cap,COL.cyan);}
  function d_pond(t){var T=t%10,cap="";floor("#161233","#1c1840");
    ell("#2b2540",86,96,62,22);ell("#5a5277",86,94,58,19);ell("#1a6f9e",86,94,50,15);ell("rgba(5,30,50,.5)",70+Math.sin(t)*14,96,7,2);
    av(0,40,84,1.4,{dir:4,armL:T<1?2.2:-0.6,armR:0.6});var tipX=58,tipY=62;
    if(T<1.2){cap="1  CAST";R(COL.yel,226,104,18,18);if(T<0.6)finger(235,113,true);}
    else{var bx=96,by=94;R("rgba(255,255,255,.7)",tipX,tipY,1,1);for(var i=0;i<12;i++)R("rgba(255,255,255,.7)",tipX+(bx-tipX)*i/12,tipY+(by-tipY)*i/12,1,1);R("#fff",bx-1,by-3,3,2);R("#ff3b5c",bx-1,by-1,3,2);
      if(T<2.2){cap="2  BITE!";R(COL.yel,bx-1,by-12,2,5);R(COL.yel,bx-1,by-6,2,1);}}
    if(T>=2.2){var B={x:168,y:10,w:44,h:110};R("#8a531d",B.x-4,B.y-4,B.w+16,B.h+8);R("#3a96c8",B.x,B.y,B.w,B.h);R("#fbf6ea",B.x+B.w,B.y,2,B.h);R("#3a2a18",B.x+B.w+3,B.y,6,B.h);
      var k=T-2.2,fy=0.5+Math.sin(k*1.6)*0.3,fxp=0.5+Math.sin(k*2.3)*0.25,hold=Math.sin(k*1.6+0.4)<0,py=0.5+Math.sin(k*1.6-0.15)*0.28,pxp=fxp-0.04,net=T>8.2;
      if(!net){ell("rgba(90,255,80,.55)",B.x+pxp*B.w,B.y+py*B.h,9,9);fishPx(B.x+fxp*B.w,B.y+fy*B.h,7,"#5bd17a");
        var mh=Math.min(1,k/6)*B.h;R("#5bd13a",B.x+B.w+3,B.y+B.h-mh,6,mh);
        R(hold?"#2fa0d6":"#1f6fa0",226,104,18,18);if(hold)finger(235,113,true);
        ring("#fff",26,116,10,2);R("#fff",26+(pxp-0.5)*24-2,114,5,5);finger(26+(pxp-0.5)*24,116,false);
        cap=k<3?"3  HOLD REEL: RISE":"4  STICK SLIDES · STAY ON IT";}
      else{cap="5  NET IT!";R("#3a2a18",B.x+B.w+3,B.y,6,B.h);R("#9cff4a",B.x+B.w+3,B.y,6,B.h);var nx=60+Math.sin((T-8.2)*5)*40;fishPx(80,40,9,"#5bd17a");ring("#fff",nx,40,10,2);if(Math.abs(nx-80)<8){finger(235,113,true);pop("BASS +220",80,22,(T-8.2),COL.yel,1);}}}
    if(cap)badge(cap,COL.cyan);}
  function d_fish(t){var T=t%11,bpm=120,bt=T*bpm/60,onB=(bt%1)<0.18;
    R("#2a1f4a",0,0,W,30);R("#1a6f9e",0,30,W,72);for(var i=0;i<14;i++)R("#3a96c8",(i*41+t*10)%W,34+(i*13)%62,10,1);
    R("#5a3a22",0,100,W,44);for(var x=0;x<W;x+=24)R("#4a2e1a",x,100,1,44);R("#8a5a32",0,100,W,3);
    var px=44,py=104;av(0,px,py,1.6,{dir:3,armL:T<1.6?1.2+T*0.9:2.2,armR:-1.1});
    var tipX=px+14,tipY=py-34,bob=null,cap="",bobDy=0;
    /* 1: swoop up (the readout fills, the tiers are the fish) */
    var pw=T<1.6?Math.min(0.97,T/1.4):0.97;
    if(T<2.6){cap="1  SWOOP UP FAST";var fx=60+Math.min(1,T/1.4)*70,fy=128-Math.sin(Math.min(1,T/1.4)*1.5)*86;if(T<1.6)finger(fx,fy,true);
      var bx0=150,bw=96;R("#000",bx0-1,8,bw+2,10);var TC=["#e2dcb4","#c9d3d8","#b5a46a","#c6d0d6","#f2c230","#3a7bd5"],TS=[0,0.25,0.45,0.65,0.85,0.95,1];
      for(var k=0;k<6;k++)R(TC[k],bx0+TS[k]*bw,9,Math.ceil((TS[k+1]-TS[k])*bw)-1,8);R("#fff",bx0+pw*bw-1,5,2,16);
      if(T>1.5){pop("PERFECT! MARLIN",196,26,(T-1.5)*0.5,COL.yel,1);}}
    if(T>=1.6&&T<2.6){var k2=(T-1.6),bxp=tipX+(200-tipX)*k2,byp=tipY-Math.sin(k2*Math.PI)*24+(56-tipY)*k2;bob=[bxp,byp];}
    if(T>=2.6&&T<3.9){bob=[200,56];bobDy=Math.round(Math.sin(t*6));cap="2  FISH UNDER THE FLOAT";ell("rgba(5,22,45,.6)",120+Math.min(1,(T-2.6)/0.6)*80,60,10,3);if(T>3.1){cap="3  JERK!";R(COL.red,198,40,4,8);R(COL.red,198,50,4,3);if(T>3.4){finger(120,92+Math.min(1,(T-3.4)*6)*20,true);}if(T>3.6)pop("HOOKED",200,30,T-3.6,COL.grn,1);}}
    /* 4: reel: spin to the beat, tension on the right */
    var reel=T>=3.9&&T<8.6,tens=0;
    if(reel){var rk=(T-3.9)/4.7,run=Math.sin((T-3.9)*1.3);bob=[200-rk*130+run*14,58+Math.round(Math.sin(t*9))];cap="4  SPIN ON THE BEAT";
      fishPx(bob[0]+10,bob[1]+10,9,"#2a5a9a");
      var ra=bt*Math.PI*2,rcx=212,rcy=118;ring("#fff",rcx,rcy,13,2);R("#000",rcx-3,rcy-3,6,6);finger(rcx+Math.cos(ra)*13,rcy+Math.sin(ra)*13,false);
      TX(bpm+" BPM",rcx,96,1,onB?COL.grn:"#bbb","center");
      tens=0.45+Math.sin((T-3.9)*2.1)*0.2;if(T>6.2&&T<6.9){tens=0.82;pop("TOO FAST",150,40,(T-6.2),"#ff8a5a",1);}
      TX(Math.round(40-rk*36)+"M",248,20,1,"#fff","right");}
    if(T>=8.6&&T<10){cap="5  NET IT!";var lk=Math.min(1,(T-8.6)/0.6);fishPx(80,70-lk*30,13,"#3a7bd5");R("#7a4a22",64,30,2,40);eRing("#ddd",80,72-lk*30,16,8,1);
      if(T<9.1){R("#D354A0",150,60,60,18);R("#000",150,78,60,2);TX("NET!",180,65,1,"#fff","center");finger(180,74,true);}
      if(T>9.1)pop("MARLIN +1500",128,30,(T-9.1)*0.6,COL.yel,2);}
    if(bob){line("#fff",tipX,tipY,bob[0],bob[1]+bobDy,1);R(COL.yel,bob[0]-1,bob[1]-1+bobDy,3,3);R(COL.red,bob[0]-1,bob[1]-3+bobDy,3,2);}
    else if(T<1.6)line("#fff",tipX,tipY,tipX+4,tipY+10,1);
    R("#7a4a22",px+4,py-20,2,1);line("#9a6a3a",px+6,py-18,tipX,tipY,1);
    /* the tension bar (right) and the beat pulse round the edge */
    if(reel){R("#000",244,30,8,56);R("#2a6a3a",245,31,6,33);R("#7a6a1a",245,64,6,11);R("#7a2a2a",245,75,6,10);var th=Math.round(tens*54);R(tens>0.8?"#ff3b5c":tens>0.65?"#ffb02e":"#5bd13a",245,85-th,6,th);}
    if(onB){var pc=reel?COL.grn:COL.yel;R(pc,0,0,W,2);R(pc,0,H-2,W,2);R(pc,0,0,2,H);R(pc,W-2,0,2,H);}
    if(cap)badge(cap,COL.cyan);}
  /* mosh: swing on the beat, headbang on the line, wall of death */
  function d_mosh(t){floor("#20121f","#2a1830");var ph=Math.floor(t/4)%3,u=(t%4)/4,bt=t*2,onB=(bt%1)<0.25,cx=128,cy=84;
    if(ph===0){for(var i=0;i<6;i++){var x=cx+Math.cos(i*1.05+t*0.4)*60,y=cy+Math.sin(i*1.05+t*0.4)*30,sw=onB&&i%2===0;av(i,x,y,1.5,{armL:sw?0.3:2.4,armR:sw?-0.3:-2.4,bob:onB?2:0,dir:Math.cos(i*1.05+t*0.4)>0?1:3});}
      var hx=cx+Math.cos(t*0.4)*60,hy=cy+Math.sin(t*0.4)*30;if(onB){pop(Math.floor(bt)%3===0?"SMASH!":"HIT +20",hx,hy-24,(bt%1)*2,Math.floor(bt)%3===0?COL.red:COL.yel,1);}
      finger(200,120,true);line("rgba(255,255,255,.5)",200,120,hx,hy,1);badge("SWING ON THE BEAT",COL.red);}
    else if(ph===1){R("#0008",40,108,176,20);R("#fff",128,106,2,24);for(var k=0;k<6;k++){var bx=128+((k-bt)%6+6)%6*16;if(bx<212)R(COL.pink,bx-5,111,10,14);}
      for(i=0;i<5;i++)av(i,60+i*34,80,1.5,{bob:onB?4:0,armL:1,armR:-1,dir:0});if(onB)pop("PERFECT",128,96,(bt%1)*2,COL.yel,1);badge("HEADBANG ON THE LINE",COL.pink);}
    else{for(var y2=20;y2<130;y2+=8)R("rgba(255,255,255,.35)",127,y2,2,4);
      for(i=0;i<8;i++){var side=i<4?-1:1,kk=Math.min(1,u*1.3),rowY=28+(i%4)*26,x3=cx+side*(100-100*kk*0.9)+(kk>0.8?Math.sin(t*20+i)*3:0);av(i%6,x3,rowY,1.5,{dir:side<0?1:3,legL:Math.sin(t*16+i)*0.5,legR:-Math.sin(t*16+i)*0.5,armL:2,armR:-2});}
      badge(u<0.3?"PICK A SIDE":"CHARGE ON THE DROP!",COL.red);}
    score(Math.floor(t*60)%1000);}
  /* ice: the figure skating routine: copy the arrows on the beat, the spin, the big jump */
  function d_ice(t){R("#bfe3f2",0,0,W,H);for(var x=0;x<W;x+=16)R("#a8d4e8",x,0,2,H);for(var i=0;i<16;i++)R("#fff",(i*47+t*6)%W,(i*29+t*20)%H,1,1);
    var ph=Math.floor(t/4)%3,u=(t%4)/4,bt=t*2,onB=(bt%1)<0.25;
    for(i=0;i<4;i++){var a=t*0.8+i*0.5,sx=128+Math.cos(a)*90,sy=96+Math.sin(a)*26;if(i===0&&ph>0)continue;av(i+1,sx,sy,1.2,{skates:"ice",dir:Math.sin(a)<0?3:1,armL:1.2,armR:-1.2});}
    if(ph===0){var dirs=[3,0,1,2],q=dirs[Math.floor(bt)%4];R("#14102a",112,16,32,32);ring("#fff",128,32,Math.max(9,22-(bt%1)*14),1);arrow(COL.pink,128,32,9,q*Math.PI/2);if(onB)pop("PERFECT",128,58,(bt%1)*2,COL.yel,1);badge("COPY THE ARROWS",COL.pink);}
    else if(ph===1){var R8=[0,4,1,5,2,6,3,7];av(0,128,90,2,{skates:"ice",dir:R8[Math.floor(t*12)%8]%4,armL:2.6,armR:-2.6,legL:u>0.5?1.4:0});var fa=t*8;finger(200+Math.cos(fa)*12,100+Math.sin(fa)*12,false);ring("rgba(20,16,42,.6)",200,100,12,1);badge(u<0.5?"SPIN: CIRCLE":"SPIN: HOLD IT",COL.cyan);}
    else{var jp=u<0.45?0:Math.sin(Math.min(1,(u-0.45)/0.45)*Math.PI);R("#0003",120,96,16,4);av(0,128,90-jp*40,2,{skates:"ice",dir:jp>0?Math.floor(t*14)%4:3,armL:jp>0?0.3:1.2,armR:jp>0?-0.3:-1.2,legL:jp?0.2:0});
      R("#14102a",60,124,136,8);R(COL.yel,61,125,Math.min(134,u*2.6*134),6);TX(u<0.45?"MASH!":"JUMP!",56,125,1,"#14102a","right");if(jp>0.9)pop("TRIPLE!",128,30,0.1,COL.pink,2);badge("BIG JUMP",COL.yel);}
    score(Math.floor(t*55));}
  /* coin dive: swim, dash on the beat, grab coins */
  function d_swim(t){R("#0b3a63",0,0,W,H);for(var i=0;i<20;i++)R("#1b5a8a",(i*61)%W,((i*37-t*14)%H+H)%H,2,2);R("#8a7a4a",0,128,W,16);
    var bt=t*2,onB=(bt%1)<0.25,a=t*0.9,sx=128+Math.cos(a)*80,sy=70+Math.sin(a*1.6)*36;
    for(var c=0;c<10;c++){var ca=c/10*6.283,cxp=128+Math.cos(ca)*80,cyp=70+Math.sin(ca*1.6)*36,ang=((a-ca)%6.283+6.283)%6.283;if(ang<4.5&&ang>0.12)continue;if(ang<=0.12&&ang>0)pop(onB?"+40 x2":"+20",cxp,cyp-8,ang*6,COL.yel,1);else{circ("#000",cxp,cyp,4);circ(COL.yel,cxp,cyp,3);R("#fff6",cxp-1,cyp-2,1,1);}}
    var dash=onB;if(dash)for(var k=1;k<5;k++)R("rgba(255,255,255,"+(0.5-k*0.1)+")",sx-Math.cos(a)*k*6,sy-Math.sin(a*1.6)*k*4,3,3);
    av(2,sx,sy,1.4,{dir:-Math.sin(a)>0?3:1,armL:2.8,armR:-2.8,legL:Math.sin(t*12)*0.4,legR:-Math.sin(t*12)*0.4});
    ring(onB?COL.yel:"#ffffff55",230,20,onB?9:6,2);TX("BEAT",230,32,1,"#fff","center");if(onB)pop("PERFECT DASH",sx,sy-26,(bt%1)*2,COL.yel,1);
    badge("DASH ON THE BEAT",COL.cyan);score(Math.floor(t*40));}
  /* ball run: the performer rolls a giant ball round the floor: keep away from it */
  function d_ball(t){R("#120e24",0,0,W,H);ell("#2a2250",128,80,110,52);ell("#3a3070",128,78,106,49);
    var rk=Math.floor(t/4)%3,u=(t%4)/4,ba=t*1.2,bx=128+Math.cos(ba)*70,by=80+Math.sin(ba*1.3)*30;
    var ppl=[[0,1.2],[1,2.6],[3,4],[4,5.3]];ppl.forEach(function(p,i){var pa=p[1]+t*0.5,px=128+Math.cos(pa)*84,py=80+Math.sin(pa)*38,dx=px-bx,dy=py-by,dd=Math.hypot(dx,dy)||1;if(dd<40){px+=dx/dd*(40-dd);py+=dy/dd*(40-dd)*0.6;}
      var squash=i===1&&u>0.6&&u<0.85;if(squash){R("#000",px-8,py+2,16,3);R(["#D354A0","#3DF2FF","#F5C518","#4CC38A"][i],px-7,py+2,14,2);pop("SQUASHED!",px,py-14,(u-0.6)*3,COL.red,1);}else av(p[0],px,py,1.3,{dir:dx>0?3:1,legL:Math.sin(t*14+i)*0.6,legR:-Math.sin(t*14+i)*0.6,armL:1.5,armR:-1.5});});
    R("#0004",bx-20,by+16,40,6);circ("#000",bx,by,21);circ("#e8e8f4",bx,by,20);for(var s=0;s<3;s++){var sa=t*4+s*2.1;R("#9a96b8",bx+Math.cos(sa)*12-2,by+Math.sin(sa)*12-2,5,5);}R("#fff",bx-9,by-12,5,3);
    R("#0008",8,118,46,20);arrow("#fff",20,128,5,Math.PI);arrow("#fff",42,128,5,0);TX("PERFORMER",31,108,1,"#aaa","center");
    badge("ROUND "+(rk+1)+"/3  RUN!",COL.yel);}
  /* dragon riders: fly, breathe fireballs (fuller bar = bigger), eat fire notes for SUPER, then the boss organ */
  function dragonPx(x,y,c,t){x=Math.round(x);y=Math.round(y);var f=Math.floor(t*6)%2;R(c,x-10,y-2,18,6);R(c,x+6,y-5,7,5);R("#fff",x+10,y-4,1,1);R(c,x-16,y,7,2);R(c,x-19,y-2,3,3);
    if(f)R(c,x-6,y-11,10,9);else R(c,x-6,y+3,10,7);R("#5a2a1a",x-4,y-5,6,3);}
  function d_dragon(t){var T=t%12,boss=T>6;R(boss?"#2a0a12":"#1a0a24",0,0,W,H);for(var i=0;i<20;i++)R("#fff3",((i*53)-t*30%W+W*2)%W,(i*37)%H,1,1);
    var dy=72+Math.sin(t*1.7)*28,dx=56;dragonPx(dx,dy,"#4CC38A",t);av(1,dx-2,dy-10,0.9,{dir:3,armL:1,armR:-1});dragonPx(40,40+Math.sin(t*1.3)*14,"#D354A0",t+0.3);
    var fill=(T%2)/2,shot=(T%2)<0.12;R("#000",8,130,62,8);R("#ff8a2a",9,131,fill*60,6);TX("FIRE",39,121,1,"#ffb02e","center");
    for(var b=0;b<3;b++){var age=((T-b*2)%2+2)%2;if(age<1.8){var fx=dx+14+age*120;circ("#ff8a2a",fx,dy-2,3+b);circ("#ffe14d",fx,dy-2,1+b*0.5);}}
    for(var h=0;h<5;h++)heart(h<4?"#ff3b5c":"#4a2030",8+h*9,8);
    if(!boss){for(var e=0;e<3;e++){var ex=W-((T*40+e*70)%220),ey=40+e*30;R("#7a2a6a",ex-5,ey-5,10,10);R("#ff3b5c",ex-3,ey-2,2,2);R("#ff3b5c",ex+1,ey-2,2,2);}
      var nx=W-((T*50)%200),ny=dy;if(nx>dx+20){R("#ff8a2a",nx-3,ny-3,6,6);R("#ffe14d",nx-1,ny-1,2,2);}else pop("SUPER +1",dx,dy-24,0.2,COL.yel,1);
      R("#000",186,130,62,8);R(COL.yel,187,131,Math.min(60,(T/6)*60),6);TX("SUPER",217,121,1,COL.yel,"center");badge("FIRE + EAT THE NOTES",COL.yel);}
    else{R("#3a2030",200,50,56,80);for(var p=0;p<5;p++)R("#c9b48a",204+p*10,30,6,24);var dm=Math.floor(t*4)%2;R("#c03030",216,64,16,16);R("#ffe14d",219,69,3,2);R("#ffe14d",226,69,3,2);R("#c03030",214,60,3,6);R("#c03030",231,60,3,6);
      var hp=Math.max(0.05,1-(T-6)/6);R("#000",150,4,100,7);R(COL.red,151,5,98*hp,5);
      if(T>8.5&&T<10){for(var f2=0;f2<10;f2++)R(f2%2?"#ffe14d":"#ff8a2a",dx+14+f2*14,dy-4+Math.sin(t*30+f2)*3,12,7);pop("SUPER FLAMETHROWER",128,30,0.1,COL.yel,1);}
      for(var n=0;n<2;n++){var nx2=200-((T*60+n*80)%160);R("#ff4d2a",nx2-3,60+n*30,6,6);}
      badge("BOSS: DEMON ORGAN",COL.red);}
    if(dm&&boss)R("#ffe14d",219,69,3,2);}
  function d_boats(t){R("#0b0618",0,0,W,H);for(var i=0;i<30;i++)R("#fff4",(i*53)%W,(i*37+t*8)%H,1,1);ell("#2a1f3d",128,86,84,40);
    ell("#6c6390",128,70,90,32);ell("#1b76a8",128,70,86,29);for(var wv=0;wv<6;wv++)R("#3a96c8",70+((wv*37+t*12)%110),56+wv*5,8,1);
    var k=(t%3)/3,ax=70+k*60,bx=150+(k>0.6?(k-0.6)*120:0),by=70-(k>0.6?(k-0.6)*30:0);
    [[ax,74,"#FF4D6D",0],[bx,by,"#3DF2FF",1]].forEach(function(b){eRing(b[2],b[0],b[1],14,6,3);av(b[3],b[0],b[1]+2,1.2,{armL:1.1,armR:-1.1,dir:0});});
    if(k>0.55&&k<0.75)pop("RAM! +90",bx,50,(k-0.55)*4,COL.yel,1);score(Math.floor(t*30));}
  function d_kart(t){R("#0b0820",0,0,W,H);for(var i=0;i<40;i++)R("#fff4",(i*53)%W,(i*37)%H,1,1);
    var cx=128,cy=84,rx=88,ry=44;for(var tk=0;tk<120;tk++){var ta=tk/120*6.283;R("#3a3070",cx+Math.cos(ta)*rx-11,cy+Math.sin(ta)*ry-11,22,22);}for(tk=0;tk<60;tk+=2){var tb=tk/60*6.283;R("#6a5ad0",cx+Math.cos(tb)*rx,cy+Math.sin(tb)*ry,2,1);}
    var a=t*1.1,kx=cx+Math.cos(a)*rx,ky=cy+Math.sin(a)*ry,dr=Math.sin(a*2)>0.6;
    for(var k=1;k<8;k++){var aa=a-k*0.07;circ(dr?"rgba(255,170,40,"+(0.6-k*0.07)+")":"rgba(61,242,255,"+(0.4-k*0.05)+")",cx+Math.cos(aa)*rx,cy+Math.sin(aa)*ry,4-k*0.4);}
    R(COL.pink,kx-5,ky-4,10,8);R("#fff",kx-2,ky-2,4,3);
    var ka=a+3.14,k2x=cx+Math.cos(ka)*rx,k2y=cy+Math.sin(ka)*ry;R(COL.cyan,k2x-5,k2y-4,10,8);
    if(dr)pop("DRIFT BOOST!",kx,ky-14,0.1,COL.yel,1);
    badge("LAP "+(1+Math.floor(t/5.7)%3)+" / 3",COL.yel);TX("SPEED",150,134,1,"#fff");R("#0006",180,133,60,6);R(dr?COL.yel:COL.grn,180,133,dr?58:30+Math.abs(Math.sin(t))*20,6);
    R("#8e84d8",112,4,32,8);R("#cfc8ff",118,1,20,5);}
  function d_walk(t){floor("#161233","#1c1840");var cx=66,cy=76,per=4;
    ring("#fff3",cx,cy,40,2);var a=t/per*6.283,tx=cx+Math.cos(a)*40,ty=cy+Math.sin(a)*40,px=cx+Math.cos(a-0.25)*40,py=cy+Math.sin(a-0.25)*40;
    circ("rgba(245,197,24,.35)",tx,ty,13);ring(COL.yel,tx,ty,13,2);circ("rgba(255,140,40,.55)",px,py,9);ring("#ff8c28",px,py,9,2);
    var inn=Math.floor(t)%7<5;TX(inn?"IN THE CIRCLE":"KEEP UP",cx,cy-2,1,inn?COL.grn:COL.red,"center");
    for(var i=0;i<4;i++){var y=32+i*24,prog=Math.min(1,(t%12)/12*(i===0?1:0.9-i*0.12)),x=150+prog*84;R("#0004",148,y+10,92,2);av(i,x,y,1,{legL:Math.sin(t*10+i)*0.5,legR:-Math.sin(t*10+i)*0.5,armL:1+Math.sin(t*10+i)*0.5,armR:-1+Math.sin(t*10+i)*0.5,dir:1});}
    for(var q=0;q<8;q++)R(q%2?"#fff":"#000",244,24+q*10,5,5),R(q%2?"#000":"#fff",249,24+q*10,5,5);
    badge("DANCE WALK RACE",COL.pink);}
  function d_pipe(t){R("#14102a",0,0,W,H);
    var cx=128,wl=52,fy=106,ph=t*1.35,A=Math.min(1.3,0.6+t%12*0.1),s=Math.sin(ph),u=Math.max(-1,Math.min(1,A*s)),air=Math.abs(A*s)>1;
    function prof(a){a=Math.abs(a);return a<0.42?0:(1-Math.sqrt(Math.max(0,1-Math.pow((a-0.42)/0.58,2))));}
    for(var col=8;col<248;col++){var kk=(col-cx)/112,yy=Math.round(fy-prof(kk)*wl*1.2);R("#2a2250",col,yy,1,H-yy);R("#D354A0",col,yy,1,2);}
    var beat=Math.floor(t*2)%2;for(var p=0;p<2;p++){var lit=p===beat;R(lit?COL.yel:"#2a2540",cx-22+p*28,fy+16+p*6,18,5);if(lit)R("rgba(245,197,24,.25)",cx-26+p*28,fy+12+p*6,26,12);}
    var ux=Math.max(-1,Math.min(1,u)),px=cx+ux*112,py=fy-prof(ux)*wl*1.2-(air?Math.min(60,(Math.abs(A*s)-1)*60):0),spin=air?t*14:0;
    var slope=(prof(ux+0.01)-prof(ux-0.01))/0.02*wl*1.2/112;var ang=air?spin:-Math.atan(slope)*0.35;
    if(air&&Math.floor(t*8)%2)R("#3DF2FF",px-1,py-6,3,20);else R("#3DF2FF",px-10,py+4,20,3);av(1,px,py-12,1.5,{dir:0,armL:air?2.4:1,armR:air?-2.4:-1,legL:0.2,legR:-0.2});
    if(air&&Math.abs(Math.sin(ph))>0.5)pop(["HEADSPIN +150","THRILLER +200","ROBOT +200"][Math.floor(t/2.3)%3],px,py-30,0.1,COL.pink,1);
    if(Math.abs(u)<0.2&&beat===0&&Math.sin(t*1.35)!==0)pop("BOOST!",cx,fy+4,((t*2)%1)*0.6,COL.yel,1);
    badge("HALF PIPE",COL.cyan);score(Math.floor(t*45));}
  function d_ski(t){R("#e8f4ff",0,0,W,H);var sc=t*70;
    for(var i=0;i<7;i++){var y=((i*38-sc)%266+266)%266-20,x=(i*97)%W;R("#2d6a3f",x-5,y,10,14);R("#8b5a2b",x-1,y+14,3,5);}
    /* gates and a ramp */
    for(var gk=0;gk<5;gk++){var gy=((gk*54-sc*0.9)%270+270)%270-10,side=gk%2?1:-1,gx=128+side*34;R(gk%2?COL.red:COL.blu,gx-18,gy,3,12);R(gk%2?COL.red:COL.blu,gx+18,gy,3,12);}
    var jp=Math.max(0,Math.sin(t*1.0-1.6));var air=jp>0.75?(jp-0.75)/0.25:0;
    var sx=128+Math.sin(t*1.7)*40,sy=92-air*22;R("rgba(0,0,0,.2)",sx-8,98,16,4);
    R("#c0392b",sx-7,sy+12,3,12);R("#c0392b",sx+4,sy+12,3,12);av(3,sx,sy-2,1.5,{dir:0,armL:2.2,armR:-2.2,legL:0.1,legR:-0.1});
    if(air>0.2)pop(["YMCA","SINKING SWIM","DISCO POINT"][Math.floor(t/6)%3],sx,sy-30,0.15,COL.pink,1);
    var zone=Math.floor(t/6)%2;badge(zone?"JUMP ZONE  x1.5":"FLAG ZONE",zone?COL.pink:COL.blu);R("#0006",150,134,92,6);TX("SPEED",120,134,1,"#555");R(COL.blu,152,135,30+((t*9)%50),4);}
  function d_ctf(t){R("#0e0b1a",0,0,W,H);for(var y=0;y<H;y+=12)for(var x=(y/12%2)*12;x<W;x+=24)R("#17122c",x,y,12,12);
    R("rgba(255,77,109,.12)",0,0,128,H);R("rgba(95,180,240,.12)",128,0,128,H);R("#fff3",127,0,2,H);
    R("rgba(255,77,109,.35)",8,56,22,32);R("rgba(95,180,240,.35)",226,56,22,32);
    var u=(t%9)/9,carry=u>0.35&&u<0.8,rx;var x1=u<0.35?18+(u/0.35)*210:u<0.8?228-((u-0.35)/0.45)*210:18;rx=x1;var ry=72+Math.sin(t*3)*3;
    /* flags */
    function flag(c,x,y){R("#ddd",x,y-12,1,16);R(c,x+1,y-12,8,5);}
    flag(COL.red,u>=0.8?18:18,72);if(!carry)flag(COL.blu,236,72);else flag(COL.blu,rx+4,ry);
    for(var i=0;i<2;i++){av(i+4,50+i*30+Math.sin(t*2+i)*8,40+i*60,1,{dir:1,legL:Math.sin(t*10)*0.4,legR:-Math.sin(t*10)*0.4});}
    for(i=0;i<2;i++){av(1+i*0,200-i*30+Math.sin(t*2+i)*8,36+i*68,1,{dir:3,legL:Math.sin(t*10+i)*0.4,legR:-Math.sin(t*10+i)*0.4});}
    av(4,rx,ry,1.2,{dir:rx===18?0:carry?3:1,legL:Math.sin(t*14)*0.5,legR:-Math.sin(t*14)*0.5,armL:1,armR:-1});
    if(u>0.35&&u<0.42)pop("FLAG! +100",rx,ry-18,(u-0.35)/0.07*0.6,COL.yel,1);if(u>0.8&&u<0.9)pop("CAPTURE! +500",110,50,(u-0.8)/0.1*0.7,COL.grn,1);
    TX("RED",90,6,2,COL.red,"center");TX(String(u>0.8?1:0),128,6,2,"#fff","center");TX("BLUE",166,6,2,COL.blu,"center");TX("0",128,22,1,"#888","center");}
  function d_kflag(t){R("#0e0b1a",0,0,W,H);for(var y=0;y<H;y+=16)for(var x=(y/16%2)*16;x<W;x+=32)R("#16122a",x,y,16,16);
    R("#2a2244",0,0,W,4);R("#2a2244",0,H-4,W,4);R("#3a3070",60,30,8,8);R("#3a3070",188,98,8,8);R("#3a3070",124,64,8,8);   /* an open arena, a few pillars */
    R("rgba(255,77,109,.3)",6,52,20,40);R("rgba(95,180,240,.3)",230,52,20,40);
    function kart(x,y,a,c){g.save();g.translate(Math.round(x),Math.round(y));g.rotate(Math.round(a/(Math.PI/2))*Math.PI/2);R("#000",-9,-6,18,12);R(c,-8,-5,16,10);R("#fff8",-8,-5,16,2);R("#111",-7,-7,4,2);R("#111",3,-7,4,2);R("#111",-7,5,4,2);R("#111",3,5,4,2);R("#f1c27d",-2,-3,5,5);g.restore();}
    function flag(c,x,y){R("#ddd",x,y-12,1,16);R(c,x+1,y-12,8,5);}
    var u=(t%8)/8;
    /* blue kart: hop, aim (arrow grows), launch across to red's flag */
    var bx,by,ba=Math.PI,aim=0,fly=0;
    if(u<0.25){bx=200;by=72;aim=u/0.25;}else if(u<0.45){fly=(u-0.25)/0.2;bx=200-fly*170;by=72;}else{bx=30+Math.sin(t*3)*2;by=72;}
    var carry=u>=0.45&&u<0.7;
    if(u<0.25){var al=12+aim*36;for(var d=10;d<al;d+=5)R(aim>=0.95?COL.yel:"#3DF2FF",bx-d,by-1,2,2);R("rgba(0,0,0,.4)",bx-8,by+8,16,3);}
    if(fly>0){for(var k=1;k<5;k++)R("rgba(255,154,46,"+(0.6-k*0.12)+")",bx+k*7,by-1,3,3);}
    /* red kart chases; at 0.6 it IMPACTs and the flag flies home */
    var rx=60+Math.max(0,u-0.45)*120,ry=60+Math.sin(t*2)*6;
    if(u>=0.6&&u<0.75){var rr=(u-0.6)/0.15;g.globalAlpha=1-rr;ring(COL.red,rx,ry,8+rr*40,2);g.globalAlpha=1;}
    var spin=u>=0.6&&u<0.8?Math.floor(t*10)*Math.PI/2:0;
    kart(rx,ry,0,COL.red);kart(bx,by+(u<0.25?-3:0),ba+spin,COL.blu);
    flag(COL.blu,236,72);if(carry&&u<0.6)flag(COL.red,bx+6,by-4);else if(u>=0.6&&u<0.75){var fp=(u-0.6)/0.15;flag(COL.red,bx+(16-bx)*fp,by-4-Math.sin(fp*Math.PI)*20);}else flag(COL.red,16,72);
    R("rgba(255,255,255,.08)",120,110,16,16);g.fillStyle=["#FF4D6D","#F5C518","#4CC38A","#3DF2FF","#D354A0"][Math.floor(t*4)%5];g.fillRect(122,112,12,12);TX("?",128,113,1,"#fff","center");
    if(u<0.25)pop("LAUNCH: hold, aim…",150,40,0.2,"#3DF2FF",1);else if(u<0.45)pop("…let go!",120,40,0.2,COL.yel,1);else if(u>=0.6&&u<0.75)pop("IMPACT! FLAG HOME",110,30,(u-0.6)/0.15*0.6,COL.red,1);
    TX("RED",90,6,2,COL.red,"center");TX("0",128,6,2,"#fff","center");TX("BLUE",166,6,2,COL.blu,"center");}
  var DEMOS={step:d_step,aim:d_aim,keys:d_keys,keys4:d_keys4,free:d_free,mosh:d_mosh,skate:function(t){d_skate(t,false);},ice:d_ice,keepy:d_keepy,kart:d_kart,walk:d_walk,pipe:d_pipe,ski:d_ski,ctf:d_ctf,kflag:d_kflag,fish:d_fish,pond:d_pond,dungeon:d_dungeon,boats:d_boats,swim:d_swim,ball:d_ball,dragon:d_dragon};

  /* ---------- the card ---------- */
  var CSS="#explain{display:none;position:fixed;left:0;right:0;bottom:0;top:0;z-index:60;background:none;pointer-events:none;align-items:flex-start;justify-content:center;padding:4px 10px 10px;box-sizing:border-box;-webkit-tap-highlight-color:transparent}"+
    "#explain.on{display:flex}body.explain-on #roundBox{visibility:hidden}"+
    "#explain .xc{pointer-events:auto;width:min(560px,100%);max-height:100%;overflow:auto;background:#14102a;border:3px solid #D354A0;box-shadow:0 0 0 3px #000;padding:10px 12px;box-sizing:border-box;color:#fff;font:400 11px/1.6 'Silkscreen',ui-monospace,monospace;letter-spacing:.5px}"+
    "#explain .xh{display:flex;align-items:center;gap:8px;margin-bottom:8px}"+
    "#explain .xt{font:700 15px 'Silkscreen',ui-monospace,monospace;color:#F5C518;flex:1;line-height:1.2}"+
    "#explain .xs{background:#000;border:2px solid #fff6;color:#fff;font:700 11px 'Silkscreen',ui-monospace,monospace;padding:5px 9px;cursor:pointer}"+
    "#explain canvas{display:block;width:100%;aspect-ratio:16/9;image-rendering:pixelated;border:3px solid #3a3070;background:#0e0b1a;box-sizing:border-box}"+
    "#explain .xg{margin:8px 0 6px;font:700 13px/1.4 'Silkscreen',ui-monospace,monospace;color:#fff}"+
    "#explain .xcols{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}"+
    "#explain .xcols h4{margin:0 0 2px;font:700 10px 'Silkscreen',ui-monospace,monospace;color:#3DF2FF;letter-spacing:1px}"+
    "#explain ul{margin:0;padding:0;list-style:none}#explain li{margin:0 0 3px;padding-left:12px;position:relative;color:rgba(255,255,255,.92)}#explain li:before{content:'';position:absolute;left:0;top:6px;width:5px;height:5px;background:#D354A0}#explain .xrules li:before{background:#3DF2FF}"+
    "#explain .xb{margin-top:6px;color:#F5C518}"+
    "#explain .xp{margin-top:8px;display:flex;align-items:center;gap:10px}"+
    "#explain .xbar{flex:1;height:8px;background:#2a2540;border:2px solid #000}#explain .xbar i{display:block;height:100%;background:#D354A0;width:0}"+
    "#explain .xn{font:700 11px 'Silkscreen',ui-monospace,monospace;color:#fff;min-width:70px;text-align:right}"+
    "@media (min-width:760px) and (orientation:landscape){#explain .xc{width:min(860px,100%);display:grid;grid-template-columns:52% 1fr;column-gap:14px;align-content:start}#explain .xh,#explain .xp{grid-column:1/-1}#explain canvas{grid-column:1;grid-row:2/4;align-self:start}#explain .xg{grid-column:2;grid-row:2;margin-top:0}#explain .xcols{grid-column:2;grid-row:3;grid-template-columns:1fr}}"+
    "@media (max-width:560px){#explain{padding:4px 8px 8px}#explain .xt{font-size:13px}#explain .xc{font-size:10px;padding:9px 10px}#explain .xg{font-size:11px}}";
  function build(){
    if(root)return;
    var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
    root=document.createElement("div");root.id="explain";
    root.innerHTML="<div class='xc'><div class='xh'><div class='xt'></div><button class='xs' type='button'>SKIP ✖</button></div><canvas width='"+W+"' height='"+H+"'></canvas><div class='xg'></div><div class='xcols'><div><h4>HOW</h4><ul class='xhow'></ul></div><div><h4>RULES</h4><ul class='xrules'></ul><div class='xb'></div></div></div><div class='xp'><div class='xbar'><i></i></div><div class='xn'></div></div></div>";
    document.body.appendChild(root);
    cv=root.querySelector("canvas");g=cv.getContext("2d");g.imageSmoothingEnabled=false;
    root.querySelector(".xs").onclick=function(){dismissed[curKey]=true;hide();};
  }
  function fill(sel,items){var ul=root.querySelector(sel);ul.textContent="";items.forEach(function(x){var li=document.createElement("li");li.textContent=pick(x);ul.appendChild(li);});}
  function frame(){
    if(!on)return;
    var t=(performance.now()-t0)/1000;
    g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.restore();
    try{(DEMOS[curMode]||function(){})(t);}catch(e){}
    raf=requestAnimationFrame(frame);
  }
  function show(mode,key,opts){
    build();opts=opts||{};
    var m=mode==="skate"&&opts.ice?"ice":mode==="ctf"&&opts.kflag?"kflag":mode,inf=INFO[m]||INFO.step;
    if(!on||curMode!==m||curKey!==key){
      curMode=m;curKey=key;t0=performance.now();
      root.querySelector(".xt").textContent=inf.i+" "+inf.n;
      root.querySelector(".xg").textContent=inf.goal;
      fill(".xhow",inf.how);
      var rules=inf.rules.slice();root.querySelector(".xb").textContent=opts.battle?"⚔ Battle: free dance, then 1v1s on stage · "+(m==="free"?"room votes":"top score goes through"):"";
      fill(".xrules",rules);
    }
    /* sit below the stage so the performer stays in view while the card is up */
    var sb=typeof STAGE_BOTTOM!=="undefined"?STAGE_BOTTOM:0.3;root.style.top=Math.round(sb*innerHeight+6)+"px";
    if(!on){on=true;root.classList.add("on");document.body.classList.add("explain-on");raf=requestAnimationFrame(frame);}
  }
  function hide(){on=false;if(raf)cancelAnimationFrame(raf);raf=0;if(root)root.classList.remove("on");document.body.classList.remove("explain-on");}
  function tick(mode,secs,key,opts){
    left=secs;
    if(!(secs>SHOW_MIN&&secs<=SHOW_MAX)||dismissed[key]||!INFO[mode==="skate"&&opts&&opts.ice?"ice":mode]){if(on)hide();return;}
    show(mode,key,opts);
    var n=Math.ceil(secs-SHOW_MIN+0.001);
    root.querySelector(".xbar i").style.width=Math.max(0,Math.min(100,(1-(secs-SHOW_MIN)/(SHOW_MAX-SHOW_MIN))*100))+"%";
    root.querySelector(".xn").textContent="⏱ "+Math.ceil(secs);
  }
  return{tick:tick,hide:hide,show:function(m,o){dismissed={};curKey="demo";show(m,"demo"+Date.now(),o);},get on(){return on;},INFO:INFO,DEMOS:DEMOS,draw:function(m,t){build();curMode=m;DEMOS[m](t);}};
})();
