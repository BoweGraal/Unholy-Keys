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

  /* ---------- what each game says ---------- */
  var INFO={
    step:{n:"Step dance",i:"⬆️",goal:"Hit every arrow as it reaches the top.",
      how:[["Tap the arrow pads at the bottom of the screen","Press the arrow keys"],"Hit it right on the beat: PERFECT scores the most, then GREAT, then GOOD","If an arrow stretches out, hold it and let go when it ends"],
      rules:["Everyone gets the same steps","Hits in a row build your combo","Highest score wins the round"]},
    aim:{n:"Target dance",i:"🎯",goal:"Hit each target as its ring closes on it.",
      how:[["Tap each target","Click each target"],"Hit it just as the ring closes on it","Early or late still counts, but scores less"],
      rules:["Everyone gets the same targets","Hits in a row build your combo","Highest score wins the round"]},
    keys:{n:"Note highway",i:"🎹",goal:"Play each note as it lands on its key.",
      how:[["Tap the key as its note lands","Press A S D F G H J as notes land"],"Hit it right on the beat for the best score","Long notes: hold, then let go when they end"],
      rules:["Everyone gets the same notes","Hits in a row build your combo and your HYPE","Highest score wins the round"]},
    keys4:{n:"Note highway · 4 keys",i:"🥁",goal:"Play each note as it lands on its pad.",
      how:[["Tap the pad as its note lands","Press D F J K as notes land"],"Hit it right on the beat for the best score","Long notes: hold, then let go when they end"],
      rules:["Everyone gets the same notes","Hits in a row build your combo and your HYPE","Highest score wins the round"]},
    free:{n:"Free dance",i:"🕺",goal:"Dance however you like.",
      how:[["Drag your hands and feet, or tap the floor to walk","Drag your hands and feet, or click the floor or use the arrow keys to walk"],"Pick a dance from the menu at the sides","Line up moves for your turn in the spotlight"],
      rules:["There are no points: the room votes","Everyone gets a turn in the spotlight later in the song","Vote for your favourite when the song ends"]},
    mosh:{n:"Mosh pit",i:"🤘",goal:"Get stuck in and score off the whole pit.",
      how:[["Drag circles on the floor to swing your arms. Bump into people","Move with the arrows or WASD. Bump into people"],"The pit changes: plain mosh, circle pit, wall of death, push war","Watch the top left for what's on and what's next"],
      rules:["Bumps and shoves score","Run laps in the circle pit","In the wall of death and push war, the winning side gets a bonus"]},
    skate:{n:"Roller rink",i:"🛼",goal:"Skate fast, jump, and land tricks.",
      how:[["Steer with the stick. Tap JUMP","Steer with the arrows or WASD. Press Space to jump"],"Hold a direction in the air for a trick","Let go before you land or you bail"],
      rules:["Speed and clean tricks score","A bail costs you your speed","Highest score wins the round"]},
    ice:{n:"Ice rink",i:"🧊",goal:"Skate fast, jump, and land tricks. It's slippery!",
      how:[["Steer with the stick. Tap JUMP","Steer with the arrows or WASD. Press Space to jump"],"Hold a direction in the air for a trick","Let go before you land or you bail"],
      rules:["Speed and clean tricks score","The ice keeps you sliding, so plan your turns","Highest score wins the round"]},
    keepy:{n:"Keepy uppy",i:"🎈",goal:"Keep the balloon, the ball and the feather off the floor.",
      how:[["Move with the stick. Tap JUMP to head them up, tap again in the air to double jump","Move with the arrows or WASD. Space to jump, Space again in the air to double jump"],"Get under them and head them back up","Don't let anything touch the floor"],
      rules:["Every hit scores; hits in a row build a multiplier","The feather and double-jump hits score the most","Highest score wins the round"]},
    kart:{n:"Mars Rally",i:"🚀",goal:"Race round the track. The stick is your speed and direction.",
      how:[["Push the stick the way you want to go. Further is faster, pull back to reverse","Push the stick (or WASD) the way you want to go. Further is faster, pull back to reverse"],"Push when the 2 lights up for a rocket start","Tap DRIFT to hop, swing into the turn and hold it for a boost"],
      rules:["Distance, laps, boosts and overtakes all score","Highest score wins the round"]},
    walk:{n:"Dance walk race",i:"🚶",goal:"Dance-walk to the finish line first.",
      how:[["Drag to keep your circle inside the moving circle","Move the mouse to keep your circle inside the moving circle"],"When it says GO, keep it there to walk forward","Stay on it through the dance style changes"],
      rules:["Staying in the circle moves you forward","Falling out stops you","First to the finish wins"]},
    pipe:{n:"Half pipe",i:"🛹",goal:"Swing from wall to wall, boost on the beat, and land dance tricks.",
      how:[["Left stick steers. Press the right stick at the line on the ramp to crouch, then flick it at the lip: the flick is your trick, a faster flick goes higher","WASD steers. Hold the mouse button at the line to crouch, then drag and flick up at the lip: the flick is your trick, a faster flick goes higher"],"Roll over the lit pad in the middle for a BOOST","A harder flick goes higher"],
      rules:["Tricks score: bigger tricks and combos score more","Land straight, or you bail","Highest score wins the round"]},
    ski:{n:"Ski",i:"⛷️",goal:"Race down the mountain through flag zones and jump zones.",
      how:[["Point the stick the way you want to go. Tap HOP","Steer with the arrows or WASD. Space hops"],"Flag zones: carve through the gates","Jump zones: hit the ramps and do tricks"],
      rules:["Gates, speed and tricks score (tricks are worth more in jump zones)","Hop and land on a new line for a CUT boost","Highest score wins the round"]},
    ctf:{n:"Capture the flag",i:"🚩",goal:"Steal their flag and bring it home.",
      how:[["Run with the stick. Hold SPRINT for a burst","Run with the arrows or WASD. Hold Space or Shift to sprint"],"Grab the other team's flag, then run it back to your base","Collect ⚡ to refill your sprint"],
      rules:["Capture while your own flag is at home: +500 and a point for your team","Tag their flag carrier and the flag flies home","Everyone else is solid: block for your teammates","Most team points wins"]},
    kflag:{n:"Kart flag",i:"🏎️",goal:"Capture the flag in karts: launch across the arena, blast your flag back.",
      how:[["Steer with the stick, the gas is automatic","Steer with the arrows or WASD, the gas is automatic"],["LAUNCH: hold it, aim with the stick, let go to shoot off (longer hold, harder launch)","LAUNCH (Shift or X): hold, aim, let go to shoot off (longer hold, harder launch)"],["IMPACT: a blast round you, then a short cooldown","IMPACT (Space): a blast round you, then a short cooldown"]],
      rules:["Grab their flag and drive it home: +500 and a point for your team","IMPACT a carrier and your flag flies home; anyone else spins out","Most team points wins"]}
  };
  function pick(a){return Array.isArray(a)?(touch?a[0]:a[1]):a;}

  /* ---------- the demos ---------- */
  function R(c,x,y,w,h){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function TX(s,x,y,p,c,al){try{ART.pixText(g,s,x,y,p,c,al||"left",0.7);}catch(e){}}
  function av(i,x,y,p,st){var L=look(i);if(!L)return;try{ART.drawChar(g,Math.round(x),Math.round(y),p,L,st||{});}catch(e){}}
  function circ(c,x,y,r){g.fillStyle=c;g.beginPath();g.arc(Math.round(x),Math.round(y),r,0,6.283);g.fill();}
  function ring(c,x,y,r,w){g.strokeStyle=c;g.lineWidth=w||1;g.beginPath();g.arc(Math.round(x),Math.round(y),Math.max(0.5,r),0,6.283);g.stroke();}
  function arrow(c,x,y,s,rot){g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=c;g.beginPath();g.moveTo(s,0);g.lineTo(-s*0.2,-s);g.lineTo(-s*0.2,-s*0.4);g.lineTo(-s,-s*0.4);g.lineTo(-s,s*0.4);g.lineTo(-s*0.2,s*0.4);g.lineTo(-s*0.2,s);g.closePath();g.fill();g.restore();}
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
    var cur=Math.max(0,Math.min(seq.length-1,Math.floor((tt-0.5)/per+0.2))),nx=seq[cur];g.fillStyle="#fff";g.fillRect(nx[0]+3,nx[1]+3,6,8);g.fillRect(nx[0]+3,nx[1]+3,3,3);
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
  function d_mosh(t){floor("#20121f","#2a1830");var ph=Math.floor(t/3.5)%3,u=(t%3.5)/3.5,cx=128,cy=84,label=["MOSH PIT","CIRCLE PIT","WALL OF DEATH"][ph];
    if(ph===1){ring("rgba(255,77,109,.5)",cx,cy,40,2);ring("rgba(255,77,109,.5)",cx,cy,22,2);}
    if(ph===2){for(var y=20;y<130;y+=8)R("rgba(255,255,255,.35)",127,y,2,4);}
    for(var i=0;i<8;i++){var x,y2,dir=0,st;
      if(ph===0){x=cx+Math.sin(t*3+i*2.1)*(30+(i%3)*10);y2=cy+Math.cos(t*2.6+i*1.7)*(20+(i%2)*10);st={armL:2.4+Math.sin(t*9+i),armR:-2.4+Math.sin(t*9+i),bob:Math.abs(Math.sin(t*8+i))*2};}
      else if(ph===1){var a=t*2.4+i*0.78,rr=i%2?40:22;x=cx+Math.cos(a)*rr*1.5;y2=cy+Math.sin(a)*rr*0.8;dir=Math.cos(a)>0?3:1;st={legL:Math.sin(t*14+i)*0.5,legR:-Math.sin(t*14+i)*0.5,armL:1.2,armR:-1.2};}
      else{var side=i<4?-1:1,k=Math.min(1,u*1.3),rowY=28+(i%4)*26;x=cx+side*(100-100*k*0.9)+(k>0.8?Math.sin(t*20+i)*3:0);y2=rowY;dir=side<0?1:3;st={legL:Math.sin(t*16+i)*0.5,legR:-Math.sin(t*16+i)*0.5,armL:2,armR:-2};}
      st.dir=dir;av(i%6,x,y2,1.5,st);}
    badge(label,COL.red);score(Math.floor(t*60)%1000);}
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
  function d_kart(t){R("#0b0820",0,0,W,H);for(var i=0;i<40;i++)R("#fff4",(i*53)%W,(i*37)%H,1,1);
    var cx=128,cy=84,rx=88,ry=44;g.strokeStyle="#3a3070";g.lineWidth=22;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,6.283);g.stroke();g.strokeStyle="#6a5ad0";g.lineWidth=1;g.setLineDash([4,4]);g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,6.283);g.stroke();g.setLineDash([]);
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
    g.fillStyle="#2a2250";g.beginPath();g.moveTo(8,20);for(var k=-1;k<=1.001;k+=0.05){g.lineTo(cx+k*112,fy-prof(k)*wl*1.2);}g.lineTo(248,20);g.lineTo(248,H);g.lineTo(8,H);g.closePath();g.fill();
    g.strokeStyle="#D354A0";g.lineWidth=2;g.beginPath();for(k=-1;k<=1.001;k+=0.05){var yy=fy-prof(k)*wl*1.2;if(k<-0.999)g.moveTo(cx+k*112,yy);else g.lineTo(cx+k*112,yy);}g.stroke();
    var beat=Math.floor(t*2)%2;for(var p=0;p<2;p++){var lit=p===beat;R(lit?COL.yel:"#2a2540",cx-22+p*28,fy+16+p*6,18,5);if(lit)R("rgba(245,197,24,.25)",cx-26+p*28,fy+12+p*6,26,12);}
    var ux=Math.max(-1,Math.min(1,u)),px=cx+ux*112,py=fy-prof(ux)*wl*1.2-(air?(Math.abs(A*s)-1)*60:0),spin=air?t*14:0;
    var slope=(prof(ux+0.01)-prof(ux-0.01))/0.02*wl*1.2/112;var ang=air?spin:-Math.atan(slope)*0.35;
    g.save();g.translate(px,py+4);g.rotate(ang);R("#3DF2FF",-10,0,20,3);g.restore();av(1,px,py-12,1.5,{dir:0,armL:air?2.4:1,armR:air?-2.4:-1,legL:0.2,legR:-0.2});
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
    function kart(x,y,a,c){g.save();g.translate(Math.round(x),Math.round(y));g.rotate(a);R("#000",-9,-6,18,12);R(c,-8,-5,16,10);R("#fff8",-8,-5,16,2);R("#111",-7,-7,4,2);R("#111",3,-7,4,2);R("#111",-7,5,4,2);R("#111",3,5,4,2);R("#f1c27d",-2,-3,5,5);g.restore();}
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
    if(u>=0.6&&u<0.75){var rr=(u-0.6)/0.15;g.strokeStyle=COL.red;g.globalAlpha=1-rr;g.lineWidth=2;g.beginPath();g.arc(rx,ry,8+rr*40,0,6.3);g.stroke();g.globalAlpha=1;}
    var spin=u>=0.6&&u<0.8?t*14:0;
    kart(rx,ry,0,COL.red);kart(bx,by+(u<0.25?-3:0),ba+spin,COL.blu);
    flag(COL.blu,236,72);if(carry&&u<0.6)flag(COL.red,bx+6,by-4);else if(u>=0.6&&u<0.75){var fp=(u-0.6)/0.15;flag(COL.red,bx+(16-bx)*fp,by-4-Math.sin(fp*Math.PI)*20);}else flag(COL.red,16,72);
    R("rgba(255,255,255,.08)",120,110,16,16);var hue=(t*80)%360;g.fillStyle="hsl("+hue+",90%,60%)";g.fillRect(122,112,12,12);TX("?",128,113,1,"#fff","center");
    if(u<0.25)pop("LAUNCH: hold, aim…",150,40,0.2,"#3DF2FF",1);else if(u<0.45)pop("…let go!",120,40,0.2,COL.yel,1);else if(u>=0.6&&u<0.75)pop("IMPACT! FLAG HOME",110,30,(u-0.6)/0.15*0.6,COL.red,1);
    TX("RED",90,6,2,COL.red,"center");TX("0",128,6,2,"#fff","center");TX("BLUE",166,6,2,COL.blu,"center");}
  var DEMOS={step:d_step,aim:d_aim,keys:d_keys,keys4:d_keys4,free:d_free,mosh:d_mosh,skate:function(t){d_skate(t,false);},ice:function(t){d_skate(t,true);},keepy:d_keepy,kart:d_kart,walk:d_walk,pipe:d_pipe,ski:d_ski,ctf:d_ctf,kflag:d_kflag};

  /* ---------- the card ---------- */
  var CSS="#explain{display:none;position:fixed;left:0;right:0;bottom:0;top:0;z-index:60;background:none;pointer-events:none;align-items:flex-start;justify-content:center;padding:4px 10px 10px;box-sizing:border-box;-webkit-tap-highlight-color:transparent}"+
    "#explain.on{display:flex}body.explain-on #roundBox{visibility:hidden}"+
    "#explain .xc{pointer-events:auto;width:min(560px,100%);max-height:100%;overflow:auto;background:#14102a;border:2px solid #D354A0;box-shadow:0 0 0 2px #0008,0 0 28px rgba(211,84,160,.35);padding:12px 14px 12px;box-sizing:border-box;color:#fff;font:500 13px/1.45 system-ui,sans-serif}"+
    "#explain .xh{display:flex;align-items:center;gap:8px;margin-bottom:8px}"+
    "#explain .xt{font:700 16px 'Silkscreen',system-ui,sans-serif;letter-spacing:.5px;color:#F5C518;flex:1;line-height:1.2}"+
    "#explain .xs{background:#0006;border:1px solid #fff4;color:#fff;font:600 12px system-ui,sans-serif;padding:6px 10px;border-radius:6px;cursor:pointer}"+
    "#explain canvas{display:block;width:100%;aspect-ratio:16/9;image-rendering:pixelated;border:2px solid #3a3070;background:#0e0b1a;box-sizing:border-box}"+
    "#explain .xg{margin:8px 0 6px;font:700 14px system-ui,sans-serif;color:#fff}"+
    "#explain .xcols{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}"+
    "#explain .xcols h4{margin:0 0 3px;font:700 11px 'Silkscreen',system-ui,sans-serif;color:#3DF2FF;letter-spacing:.5px}"+
    "#explain ul{margin:0;padding:0 0 0 16px}#explain li{margin:0 0 3px;color:rgba(255,255,255,.9)}"+
    "#explain .xb{margin-top:6px;font:600 12px system-ui,sans-serif;color:#F5C518}"+
    "#explain .xp{margin-top:10px;display:flex;align-items:center;gap:10px}"+
    "#explain .xbar{flex:1;height:8px;background:#2a2540;border:1px solid #0008}#explain .xbar i{display:block;height:100%;background:#D354A0;width:0}"+
    "#explain .xn{font:700 12px 'Silkscreen',system-ui,sans-serif;color:#fff;min-width:78px;text-align:right}"+
    "@media (min-width:760px) and (orientation:landscape){#explain .xc{width:min(860px,100%);display:grid;grid-template-columns:46% 1fr;column-gap:14px;align-content:start}#explain .xh,#explain .xp{grid-column:1/-1}#explain canvas{grid-column:1;grid-row:2/4;align-self:start}#explain .xg{grid-column:2;grid-row:2;margin-top:0}#explain .xcols{grid-column:2;grid-row:3;grid-template-columns:1fr}}"+
    "@media (max-width:560px){#explain{padding:4px 8px 8px}#explain .xcols{grid-template-columns:1fr}#explain .xt{font-size:14px}#explain .xc{font-size:12.5px;padding:10px 12px}}";
  function build(){
    if(root)return;
    var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
    root=document.createElement("div");root.id="explain";
    root.innerHTML="<div class='xc'><div class='xh'><div class='xt'></div><button class='xs' type='button'>Skip ✕</button></div><canvas width='"+W+"' height='"+H+"'></canvas><div class='xg'></div><div class='xcols'><div><h4>HOW TO PLAY</h4><ul class='xhow'></ul></div><div><h4>RULES</h4><ul class='xrules'></ul><div class='xb'></div></div></div><div class='xp'><div class='xbar'><i></i></div><div class='xn'></div></div></div>";
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
      var rules=inf.rules.slice();root.querySelector(".xb").textContent=opts.battle?"⚔ Battle round: everyone free dances, then 1 v 1s on the stage. "+(m==="free"?"The room votes each match.":"The higher score goes through."):"";
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
    root.querySelector(".xn").textContent="Starts in "+Math.ceil(secs)+" s";
  }
  return{tick:tick,hide:hide,show:function(m,o){dismissed={};curKey="demo";show(m,"demo"+Date.now(),o);},get on(){return on;},INFO:INFO,DEMOS:DEMOS,draw:function(m,t){build();curMode=m;DEMOS[m](t);}};
})();
