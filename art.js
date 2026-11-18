/* ============================================================
   UNHOLY KEYS: SHELL ART
   Placeholder pixel art drawn in code, used by both the venue (venue.html) and the performer page
   (index.html) until real art arrives. Everything is drawn on small low-resolution canvases and
   scaled up with no smoothing, so it stays crisp and blocky at any size.

   ART.drawChar   a character with a "look" (skin, hair, outfit, extra) and a pose
   ART.looks      the options for the character maker, and helpers to pack a look into 8 characters
   ART.scene      the stage (back wall, truss and lights, speaker stacks, amps, sign) and the dance floor
   ART.keyboard   the performer's keyboard on its stand, with keys that light up
   ART.micStand   a mic stand
   ART.pixText    blocky 5x7 lettering
   ============================================================ */
var PIXFONT={"0":[14,17,19,21,25,17,14],"1":[4,12,4,4,4,4,14],"2":[14,17,1,2,4,8,31],"3":[31,2,4,2,1,17,14],"4":[2,6,10,18,31,2,2],"5":[31,16,30,1,1,17,14],"6":[6,8,16,30,17,17,14],"7":[31,1,2,4,8,8,8],"8":[14,17,17,14,17,17,14],"9":[14,17,17,15,1,2,12],
  A:[14,17,17,31,17,17,17],B:[30,17,17,30,17,17,30],C:[14,17,16,16,16,17,14],D:[28,18,17,17,17,18,28],E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],G:[14,17,16,23,17,17,15],H:[17,17,17,31,17,17,17],I:[14,4,4,4,4,4,14],J:[7,2,2,2,2,18,12],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],M:[17,27,21,21,17,17,17],
  N:[17,17,25,21,19,17,17],O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],Q:[14,17,17,17,21,18,13],R:[30,17,17,30,20,18,17],S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],U:[17,17,17,17,17,17,14],V:[17,17,17,17,17,10,4],W:[17,17,17,21,21,21,10],X:[17,17,10,4,10,17,17],Y:[17,17,17,10,4,4,4],Z:[31,1,2,4,8,16,31],
  "!":[4,4,4,4,4,0,4],".":[0,0,0,0,0,12,12],"-":[0,0,0,31,0,0,0]," ":[0,0,0,0,0,0,0],"'":[4,4,8,0,0,0,0],"?":[14,17,1,2,4,0,4],"*":[0,21,14,31,14,21,0],"#":[10,31,10,10,31,10,0]};

var ART=(function(){
  /* ---------------- the character maker's options ---------------- */
  var SKIN=["#F6D3B3","#E8B48A","#C98B5E","#A0663E","#7A4A2A","#4E2F1B"];
  var HAIRCOL=["#1E1A24","#5A3A22","#9A6034","#E0B850","#D8D8E0","#E8505B","#4A9BE8","#9B7FE0","#4CC38A","#F28AC0"];
  var CLOTH=["#E8505B","#F0A040","#F5D03C","#4CC38A","#2F8F6A","#4A9BE8","#2D4E9B","#9B7FE0","#D354A0","#EDEDF5","#5A5670","#26222F"];
  var OPTS={
    skin:{label:"Skin",n:SKIN.length,col:SKIN},
    hair:{label:"Hair",names:["Bald","Short","Spiky","Long","Mohawk","Afro","Ponytail","Beanie"]},
    hairCol:{label:"Hair colour",n:HAIRCOL.length,col:HAIRCOL},
    top:{label:"Top",names:["T-shirt","Tank top","Hoodie","Jacket","Striped tee"]},
    topCol:{label:"Top colour",n:CLOTH.length,col:CLOTH},
    bottom:{label:"Bottoms",names:["Jeans","Shorts","Skirt"]},
    botCol:{label:"Bottoms colour",n:CLOTH.length,col:CLOTH},
    extra:{label:"Extra",names:["Nothing","Shades","Headphones","Cap","Bandana"]}
  };
  var KEYS=["skin","hair","hairCol","top","topCol","bottom","botCol","extra"];
  function count(k){var o=OPTS[k];return o.names?o.names.length:o.n;}
  var B36="0123456789abcdefghijklmnopqrstuvwxyz";
  /* a look packs into 8 characters, one per option, so it travels in a message and fits localStorage */
  function pack(L){return KEYS.map(function(k){return B36.charAt(Math.max(0,Math.min(count(k)-1,L[k]|0)));}).join("");}
  function unpack(s){
    if(typeof s!=="string"||!/^[0-9a-z]{8}$/.test(s))return null;
    var L={};KEYS.forEach(function(k,i){L[k]=Math.min(count(k)-1,B36.indexOf(s.charAt(i)));});return L;
  }
  function rnd(n,r){return Math.floor(r()*n);}
  function rng(seed){var a=(seed>>>0)||1;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
  function random(seed){
    var r=seed===undefined?Math.random:rng(seed),L={};
    KEYS.forEach(function(k){L[k]=rnd(count(k),r);});
    if(r()<0.6)L.extra=0;
    if(L.botCol===L.topCol)L.botCol=(L.botCol+5)%CLOTH.length;
    return L;
  }
  /* someone with no look yet (an older page, a practice dancer): dress them in their colour */
  function fromColor(hex,seed){
    var L=random(seed||1),best=0,bd=1e9,c=rgb(hex||"#888888");
    for(var i=0;i<CLOTH.length;i++){var d=rgb(CLOTH[i]),e=(d[0]-c[0])*(d[0]-c[0])+(d[1]-c[1])*(d[1]-c[1])+(d[2]-c[2])*(d[2]-c[2]);if(e<bd){bd=e;best=i;}}
    L.topCol=best;if(L.botCol===best)L.botCol=(best+5)%CLOTH.length;return L;
  }
  function topColor(L){return CLOTH[L.topCol]||"#888888";}
  function rgb(h){var v=parseInt(String(h).replace("#","").slice(0,6),16)||0;return [v>>16,(v>>8)&255,v&255];}
  function shade(h,k){var c=rgb(h);function f(x){return Math.max(0,Math.min(255,Math.round(k<0?x*(1+k):x+(255-x)*k)));}return "#"+((1<<24)+(f(c[0])<<16)+(f(c[1])<<8)+f(c[2])).toString(16).slice(1);}

  /* ---------------- drawing a character ----------------
     Drawn on a 38x40 canvas, one canvas pixel per art pixel, the body's centre at (19,23); then
     outlined and scaled up. Body (art pixels, from the centre): torso 10 wide by 10 tall; head above it;
     arms 3 wide, 9 long, from the shoulders at (-6.5,-4.5) and (6.5,-4.5); legs 3 wide, 7 long, from the
     hips at (-2.5,4) and (2.5,4). Limb angles are radians from hanging straight down, same as the dance
     games: [left arm, right arm, left leg, right leg]. */
  var CWD=38,CHT=40,OX=19,OY=23;
  var spr=null,sg=null,out=null,og=null;
  function canv(w,h){var c=document.createElement("canvas");c.width=w;c.height=h;return c;}
  function init(){if(spr)return;spr=canv(CWD,CHT);sg=spr.getContext("2d");out=canv(CWD,CHT);og=out.getContext("2d");}
  function px(x,y,w,h,c){sg.fillStyle=c;sg.fillRect(OX+x,OY+y,w,h);}
  /* a limb: a 3-pixel-wide strip from the joint along the angle, coloured in bands (cols = [[upTo, colour],...]) */
  function limb(jx,jy,a,len,cols){
    var s=Math.sin(a),c=Math.cos(a),step=0.5;
    for(var t=0;t<len;t+=step){
      var col=cols[cols.length-1][1];for(var q=0;q<cols.length;q++)if(t<cols[q][0]){col=cols[q][1];break;}
      var cx=jx-s*(t+0.5),cy=jy+c*(t+0.5);
      sg.fillStyle=col;sg.fillRect(Math.round(OX+cx-1.5),Math.round(OY+cy-0.5),3,1);
      if(Math.abs(s)>0.5)sg.fillRect(Math.round(OX+cx-0.5),Math.round(OY+cy-1.5),1,3);   /* keep sideways limbs 3 thick */
    }
  }
  function drawSprite(L,st){
    init();
    sg.clearRect(0,0,CWD,CHT);
    var skin=SKIN[L.skin]||SKIN[1],hc=HAIRCOL[L.hairCol]||HAIRCOL[0],tc=CLOTH[L.topCol]||CLOTH[0],bc=CLOTH[L.botCol]||CLOTH[6];
    var tcD=shade(tc,-0.25),tcL=shade(tc,0.25),bcD=shade(bc,-0.25),skD=shade(skin,-0.18),hcD=shade(hc,-0.3),shoe="#2A2238";
    var aL=st.armL,aR=st.armR,lL=st.legL,lR=st.legR,hy=0;
    /* behind the head: afro, long hair, the hood */
    if(L.hair===5){px(-7,-19,14,9,hc);px(-6,-20,12,1,hc);px(-8,-17,1,6,hc);px(7,-17,1,6,hc);}
    if(L.hair===3){px(-6,-14,2,11,hc);px(4,-14,2,11,hc);}
    if(L.top===2){px(-6,-14,12,2,tcD);px(-7,-12,2,7,tcD);px(5,-12,2,7,tcD);}
    /* legs */
    var legCols=L.bottom===0?[[5,bc],[7,shoe]]:L.bottom===1?[[2.5,bc],[5,skin],[7,shoe]]:[[5,skin],[7,shoe]];
    limb(-2.5,4,lL,7,legCols);limb(2.5,4,lR,7,legCols);
    /* torso */
    px(-5,-5,10,10,tc);
    if(L.top===4){for(var r=-4;r<5;r+=3)px(-5,r,10,1,tcL);}
    if(L.top===3){px(-1,-5,2,10,"#EDEDF5");px(-2,-5,1,10,tcD);px(1,-5,1,10,tcD);}
    if(L.top===2){px(-3,1,6,2,tcD);}
    if(L.top===1){px(-5,-5,2,1,skin);px(3,-5,2,1,skin);px(-2,-5,4,1,skin);}
    px(4,-5,1,10,tcD);px(-5,4,10,1,tcD);                                   /* shading */
    if(L.top===0||L.top===4)px(-5,-5,10,1,tcL);
    /* bottoms: the waistband, or a skirt */
    if(L.bottom===2){px(-6,4,12,3,bc);px(-6,6,12,1,bcD);}
    else px(-5,4,10,1,bcD);
    /* arms */
    var sleeve=L.top===1?0:L.top===0||L.top===4?3:7.5,armTop=L.top===3?tcD:tc;
    /* an arm can be drawn shorter: reaching toward you (holding an instrument up to the mouth) */
    function armC(n){return sleeve?[[Math.min(sleeve,n-2)*n/9+0.01,armTop],[n,skin]]:[[n,skin]];}
    var nL=Math.max(3,Math.min(9,st.lenL||9)),nR=Math.max(3,Math.min(9,st.lenR||9));
    limb(-6.5,-4.5,aL,nL,armC(nL));limb(6.5,-4.5,aR,nR,armC(nR));
    /* head */
    px(-5,-14+hy,10,9,skin);px(4,-14+hy,1,9,skD);px(-5,-6+hy,10,1,skD);
    /* face: eyes, and an open mouth when singing or hitting a step */
    px(-3,-11+hy,1,2,"#15121F");px(2,-11+hy,1,2,"#15121F");
    if(st.mouth)px(-1,-8+hy,2,2,"#5A2A2A");else px(-1,-8+hy,2,1,skD);
    /* hair */
    var hair=L.hair;
    if(hair===1||hair===2||hair===3||hair===6){px(-5,-15+hy,10,3,hc);px(-5,-12+hy,1,2,hc);px(4,-12+hy,1,2,hc);px(-5,-15+hy,10,1,hcD);}
    if(hair===2){for(var sx=-5;sx<5;sx+=2)px(sx,-17+hy,1,2,hc);px(-4,-16+hy,8,1,hc);}
    if(hair===4){px(-1,-19+hy,2,5,hc);px(-1,-19+hy,1,5,hcD);}
    if(hair===5){px(-6,-16+hy,12,3,hc);}
    if(hair===6){px(5,-13+hy,2,6,hc);px(5,-7+hy,2,1,hcD);}
    if(hair===7){px(-6,-17+hy,12,4,hc);px(-6,-14+hy,12,1,shade(hc,0.35));px(-5,-18+hy,10,1,hc);px(-1,-19+hy,2,1,shade(hc,0.35));}
    /* extras */
    var ex=L.extra;
    if(ex===1){px(-4,-11+hy,8,2,"#111018");px(-4,-11+hy,3,1,"#3a3650");}
    if(ex===2){px(-6,-16+hy,12,1,"#2A2238");px(-7,-12+hy,2,4,"#2A2238");px(5,-12+hy,2,4,"#2A2238");px(-7,-11+hy,1,2,"#E8505B");px(6,-11+hy,1,2,"#E8505B");}
    if(ex===3){px(-5,-17+hy,10,3,"#E8505B");px(-5,-14+hy,10,1,"#B83A44");px(-8,-14+hy,4,1,"#B83A44");}
    if(ex===4){px(-5,-14+hy,10,2,"#D354A0");px(-6,-13+hy,1,3,"#D354A0");}
    /* outline: a dark silhouette one pixel out all round, under the colours */
    og.globalCompositeOperation="source-over";og.clearRect(0,0,CWD,CHT);
    og.drawImage(spr,-1,0);og.drawImage(spr,1,0);og.drawImage(spr,0,-1);og.drawImage(spr,0,1);
    og.globalCompositeOperation="source-in";og.fillStyle="#120D1E";og.fillRect(0,0,CWD,CHT);
    og.globalCompositeOperation="source-over";og.drawImage(spr,0,0);
    return out;
  }
  /* draw a character with its body centre at (x,y), each art pixel p screen pixels big.
     st: {armL, armR, legL, legR, bob (screen px, negative is up), mouth} */
  function drawChar(g,x,y,p,L,st){
    st=st||{};if(!L)L=random(7);
    var s={armL:st.armL!==undefined?st.armL:0.15,armR:st.armR!==undefined?st.armR:-0.15,legL:st.legL||0,legR:st.legR||0,mouth:!!st.mouth,lenL:st.lenL,lenR:st.lenR};
    var c=drawSprite(L,s),q=Math.max(1,p),bob=Math.round((st.bob||0)/q)*q,dx=Math.round((st.dx||0)/q)*q;
    var was=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;
    if(st.rot){
      /* the whole body turned (the worm: lying on the floor), resting on the floor rather than floating */
      g.save();g.translate(Math.round(x+dx),Math.round(y+8*q*Math.abs(Math.sin(st.rot))+bob));g.rotate(st.rot);
      g.drawImage(c,-OX*q,-OY*q,CWD*q,CHT*q);g.restore();
    }else g.drawImage(c,Math.round(x+dx-OX*q),Math.round(y-OY*q+bob),CWD*q,CHT*q);
    g.imageSmoothingEnabled=was;
  }
  /* where the shoulders and hips are on screen (for grabbing limbs), and limb lengths in art pixels */
  function joints(x,y,p,bob){return [[x-6.5*p,y-4.5*p+bob],[x+6.5*p,y-4.5*p+bob],[x-2.5*p,y+4*p+bob],[x+2.5*p,y+4*p+bob]];}
  var LIMB=[9,9,7,7];

  /* ---------------- lettering ---------------- */
  function pixText(g,str,x,y,p,col,align,shadow){
    str=String(str).toUpperCase();
    var w=str.length*6*p-p;x=Math.round(align==="center"?x-w/2:align==="right"?x-w:x);y=Math.round(y);
    for(var pass=shadow?0:1;pass<2;pass++){
      g.fillStyle=pass?col:(typeof shadow==="string"?shadow:"rgba(0,0,0,"+shadow+")");var o=pass?0:p;
      for(var c=0;c<str.length;c++){var gl=PIXFONT[str[c]];if(!gl)continue;
        for(var r=0;r<7;r++){var row=gl[r];if(!row)continue;for(var b=0;b<5;b++)if(row&(16>>b))g.fillRect(x+c*6*p+b*p+o,y+r*p+o,p,p);}}
    }
    return w;
  }

  /* ---------------- the stage and the dance floor ----------------
     Drawn at low resolution (one art pixel = P screen pixels) and scaled up. The parts that never
     move are drawn once per screen size; lights, the floor tiles and the speakers move with the music.
     lay: {W, H, stageBottom, floorBottom} (the last two as fractions of H). */
  var bg=null,bgg=null,bgKey="",fx=null,fxg=null;
  function sceneP(W,H){return Math.max(2,Math.round(Math.min(W/240,H/170)));}
  function buildStatic(W,H,lay){
    var P=sceneP(W,H),w=Math.ceil(W/P),h=Math.ceil(H/P),sb=Math.round(lay.stageBottom*H/P),fb=Math.round(lay.floorBottom*H/P);
    if(!bg){bg=canv(w,h);bgg=bg.getContext("2d");}
    bg.width=w;bg.height=h;var g=bgg,i,j;
    function r(x,y,ww,hh,c){g.fillStyle=c;g.fillRect(x,y,ww,hh);}
    /* back wall: dark purple bricks */
    r(0,0,w,sb,"#241a3a");
    var wallTop=6,wallBot=sb-5;
    for(j=wallTop;j<wallBot;j+=4){var off=((j/4)|0)%2?4:0;
      for(i=-off;i<w;i+=8){r(i,j,7,3,(i*7+j*13)%5===0?"#2e2348":"#2a1f42");}
      r(0,j+3,w,1,"#1b132c");}
    /* checker band along the top of the wall, like a curtain pelmet */
    for(i=0;i<w;i+=2)r(i,wallTop-2+((i/2)%2),2,1,"#3a2d58");
    r(0,0,w,wallTop-2,"#140e22");
    /* the truss across the top */
    var ty=2;r(0,ty,w,1,"#6a5c8a");r(0,ty+3,w,1,"#6a5c8a");
    for(i=0;i<w;i+=4){r(i,ty+1,1,2,"#4d4170");r(i+2,ty+1,1,1,"#4d4170");}
    /* side pillars of the truss */
    for(var sx2 of [Math.round(w*0.12),Math.round(w*0.88)-2]){r(sx2,ty,2,sb-ty-4,"#4d4170");for(j=ty;j<sb-4;j+=3)r(sx2,j,2,1,"#6a5c8a");}
    /* speaker stacks at both sides */
    function speaker(x,y,big){var sw=big?16:12,sh=big?14:10;r(x,y,sw,sh,"#1d1730");r(x,y,sw,1,"#3a3058");r(x+sw-1,y,1,sh,"#120d1e");
      var cx=x+sw/2-0.5,cy=y+sh/2-0.5,rr=big?5:3.5;for(var yy=-6;yy<=6;yy++)for(var xx=-6;xx<=6;xx++){var d=Math.hypot(xx,yy);if(d<=rr)r(Math.round(cx+xx),Math.round(cy+yy),1,1,d>rr-1.2?"#4a3f6a":d<1.5?"#5a5078":"#2a2240");}}
    var stackH=Math.min(sb-14,34),lx=2,rx=w-18;
    speaker(lx,sb-4-14,true);speaker(lx+2,sb-4-26,false);
    speaker(rx,sb-4-14,true);speaker(rx+2,sb-4-26,false);
    /* amps on the floor of the stage, with a grille */
    function amp(x,y){r(x,y,14,9,"#2d2546");r(x,y,14,1,"#4a3f6a");for(var yy=y+3;yy<y+8;yy++)for(var xx=x+1;xx<x+13;xx++)if((xx+yy)%2)r(xx,yy,1,1,"#4a3f6a");r(x+2,y+1,1,1,"#F5D03C");r(x+4,y+1,1,1,"#F5D03C");r(x+6,y+1,1,1,"#F5D03C");}
    amp(20,sb-13);amp(w-34,sb-13);
    /* the stage deck and its front edge */
    r(0,sb-4,w,4,"#3a2d58");r(0,sb-4,w,1,"#6a5c8a");for(i=0;i<w;i+=6)r(i,sb-2,1,2,"#2a1f42");
    r(0,sb,w,1,"#9B7FE0");r(0,sb+1,w,1,"#4d3d78");
    /* dance floor: dark tiles; their glow is added each frame */
    var T=10;r(0,sb+2,w,fb-sb-2,"#120e1e");
    for(j=sb+2;j<fb;j+=T)for(i=0;i<w;i+=T){r(i,j,T-1,T-1,((i/T+j/T)|0)%2?"#1a1430":"#161128");r(i,j,T-1,1,"#211a3a");}
    /* crowd barrier in front of the stage */
    var by=sb+3;r(0,by,w,1,"#5a5078");for(i=2;i<w;i+=8)r(i,by,1,4,"#5a5078");r(0,by+4,w,1,"#3a3058");
    /* the floor's front edge, then the dark below it */
    r(0,fb,w,1,"#3a3058");r(0,fb+1,w,h-fb-1,"#07060c");
    bgKey=W+"x"+H+"|"+lay.stageBottom+"|"+lay.floorBottom;
    return {P:P,w:w,h:h,sb:sb,fb:fb,T:T};
  }
  var geo=null;
  var TILECOL=["#E8505B","#F0A040","#F5D03C","#4CC38A","#4A9BE8","#9B7FE0","#D354A0"];
  /* st: {now, phase (0 at each beat), level (0-1 loudness), playing, hue (0-360 from the last note), sign} */
  function scene(g,W,H,lay,st){
    var key=W+"x"+H+"|"+lay.stageBottom+"|"+lay.floorBottom;
    if(key!==bgKey||!geo)geo=buildStatic(W,H,lay);
    var P=geo.P,w=geo.w,h=geo.h,sb=geo.sb,fb=geo.fb,T=geo.T,i,j;
    if(!fx){fx=canv(w,h);fxg=fx.getContext("2d");}
    if(fx.width!==w||fx.height!==h){fx.width=w;fx.height=h;}
    var f=fxg;f.clearRect(0,0,w,h);f.drawImage(bg,0,0);
    function r(x,y,ww,hh,c){f.fillStyle=c;f.fillRect(x,y,ww,hh);}
    var now=st.now||Date.now(),ph=st.phase||0,beat=Math.pow(1-ph,2),lv=st.level===undefined?0.4:st.level,on=st.playing?1:0.5;
    /* the sign on the back wall */
    if(st.sign!==false){
    var sign=st.sign||"UNHOLY KEYS",sp=1,sw=sign.length*6-1,sxx=Math.round(w/2-sw/2),syy=8;
    var glow=0.55+0.35*beat*on;
    f.globalAlpha=glow*0.35;r(sxx-2,syy-2,sw+4,11,"#D354A0");f.globalAlpha=1;
    var half=sign.indexOf(" ");
    pixText(f,sign.slice(0,half<0?sign.length:half),sxx,syy,sp,"#F5D03C","left","#3a1a10");
    if(half>0)pixText(f,sign.slice(half+1),sxx+(half+1)*6,syy,sp,"#E8505B","left","#3a1018");
    }
    /* lights hanging from the truss, swinging their beams. Modes (the performer picks): auto, party (fast,
       colour-cycling), warm, cool, spot (one white beam on the performer), strobe (beams off; flashes in front),
       off. Fog makes the beams show up more. */
    var mode=st.lights||"auto",haze=1+(st.fog||0)*1.6,lights=[0.2,0.36,0.64,0.8],cols=["#F5D03C","#E8505B","#D354A0","#4A9BE8"];
    if(mode==="warm")cols=["#F0A040","#E8505B","#F5D03C","#E86A30"];
    if(mode==="cool")cols=["#4A9BE8","#4CC38A","#9B7FE0","#7FD8F0"];
    var spd=mode==="party"?0.0021:mode==="warm"||mode==="cool"?0.00045:0.0007;
    if(mode==="spot"){
      var tx2=Math.round((st.spotX||W/2)/P),len2=sb-2;
      f.globalAlpha=Math.min(0.5,(0.16+0.05*beat)*haze);f.fillStyle="#FFF6D8";
      f.beginPath();f.moveTo(tx2-2,6);f.lineTo(tx2+2,6);f.lineTo(tx2+12,len2);f.lineTo(tx2-12,len2);f.closePath();f.fill();f.globalAlpha=1;
    }else if(mode!=="off"&&mode!=="strobe")for(i=0;i<lights.length;i++){
      var lx=Math.round(w*lights[i]),sw2=Math.sin(now*spd+i*1.7)*(mode==="party"?0.7:0.45),len=fb-6,al=Math.min(0.45,(0.05+0.06*beat*on+0.04*lv+(mode==="party"?0.04:0))*haze);
      f.globalAlpha=al;f.fillStyle=mode==="party"?TILECOL[(i+Math.floor(now/400))%TILECOL.length]:cols[i];
      f.beginPath();f.moveTo(lx-1,6);f.lineTo(lx+2,6);f.lineTo(lx+Math.sin(sw2)*len+14,6+len);f.lineTo(lx+Math.sin(sw2)*len-14,6+len);f.closePath();f.fill();
      f.globalAlpha=1;r(lx-1,5,3,2,"#1d1730");r(lx,7,1,1,f.fillStyle);
    }
    /* lights following the performer's playing (st.follow = {h: 0 low .. 1 high in their range, hue, a: how
       recently a note sounded}): a wash climbs the back wall to the height of the note, the beams take its colour,
       and a band of floor tiles lights up nearer the stage the higher the note */
    var fo=st.follow;
    if(fo&&fo.a>0.02){
      var wallTop=6,wallBot=sb-5,hh2=Math.max(2,Math.round((wallBot-wallTop)*(0.12+0.88*fo.h))),fc="hsl("+Math.round(fo.hue)+",85%,60%)";
      f.globalAlpha=0.32*fo.a;f.fillStyle=fc;f.fillRect(0,wallBot-hh2,w,hh2);
      f.globalAlpha=0.85*fo.a;f.fillRect(0,wallBot-hh2,w,1);
      for(i=0;i<lights.length;i++){var bx3=Math.round(w*lights[i]),tip=6+Math.round((fb-12)*(1-fo.h*0.75));
        f.globalAlpha=Math.min(0.5,0.22*fo.a*haze);f.fillStyle="hsl("+Math.round(fo.hue+i*25)+",85%,62%)";
        f.beginPath();f.moveTo(bx3-1,6);f.lineTo(bx3+2,6);f.lineTo(bx3+10+(i-1.5)*6,tip);f.lineTo(bx3-10+(i-1.5)*6,tip);f.closePath();f.fill();}
      f.globalAlpha=1;
    }
    /* the speakers thump on the beat */
    var k=beat*on*(0.5+lv);
    if(k>0.15){f.globalAlpha=Math.min(0.6,k*0.5);r(7,sb-4-10,6,6,"#9B7FE0");r(w-13,sb-4-10,6,6,"#9B7FE0");f.globalAlpha=1;}
    /* amp lights blink along */
    if(Math.floor(now/250)%2){r(28,sb-12,1,1,"#4CC38A");r(w-26,sb-12,1,1,"#4CC38A");}
    /* dance floor tiles light up in waves on the beat */
    var t=now*0.001,cols2=TILECOL.length;
    for(j=sb+2;j<fb;j+=T)for(i=0;i<w;i+=T){
      var gx=i/T|0,gy=(j-sb)/T|0,wave=Math.sin(gx*0.9+gy*0.6-t*2.2)*0.5+0.5,n=((gx*7+gy*13)%11)/11;
      var a=(0.03+0.13*beat*on*(n>0.6?1:0.25))*(0.4+0.6*wave)*(0.6+0.6*lv),tc2=TILECOL[(gx+gy+Math.floor(t*0.5))%cols2];
      if(fo&&fo.a>0.02){var rows=Math.max(1,Math.ceil((fb-sb)/T)),band=Math.round((1-fo.h)*(rows-1));if(Math.abs(gy-band)<=0){a=Math.max(a,0.3*fo.a);tc2="hsl("+Math.round(fo.hue)+",85%,60%)";}}
      if(a<0.035)continue;
      f.globalAlpha=Math.min(fo&&fo.a>0.02?0.32:0.2,a);r(i,j+1,T-1,T-2,tc2);
    }
    f.globalAlpha=1;
    /* a note's colour washes the back wall for a moment */
    if(st.hueA>0){f.globalAlpha=st.hueA;f.fillStyle="hsl("+(st.hue||0)+",70%,55%)";f.fillRect(0,6,w,sb-10);f.globalAlpha=1;}
    var was=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;
    g.drawImage(fx,0,0,w*P,h*P);
    g.imageSmoothingEnabled=was;
    return geo;
  }
  /* the performer's keyboard: a stand and a 7-white-key board; lit = which key index (0-6) is sounding, or -1 */
  function keyboard(g,x,y,p,lit,litCol){
    var was=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;
    function r(ax,ay,ww,hh,c){g.fillStyle=c;g.fillRect(Math.round(x+ax*p),Math.round(y+ay*p),Math.ceil(ww*p),Math.ceil(hh*p));}
    /* stand legs (an X) */
    for(var i=0;i<8;i++){r(-9+i*2,2+i,2,1,"#4d4170");r(7-i*2,2+i,2,1,"#4d4170");}
    /* body */
    r(-16,-6,32,8,"#120D1E");r(-15,-5,30,6,"#2d2546");r(-15,-5,30,1,"#4a3f6a");
    /* little lights and a screen */
    r(-13,-4,1,1,"#E8505B");r(-11,-4,1,1,"#F5D03C");r(-9,-4,1,1,"#4CC38A");r(-7,-4,1,1,"#4A9BE8");
    r(4,-4,9,1,"#0d2a1a");for(var d=0;d<4;d++)r(5+d*2,-4,1,1,"#4CC38A");
    /* keys */
    for(var k=0;k<7;k++){r(-14+k*4,-2,3,4,k===lit?(litCol||"#F5D03C"):"#EDEDF5");}
    for(var b=0;b<6;b++){if(b===2)continue;r(-11+b*4,-2,2,2,"#15121F");}
    g.imageSmoothingEnabled=was;
  }
  function micStand(g,x,y,p){
    var was=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;
    function r(ax,ay,ww,hh,c){g.fillStyle=c;g.fillRect(Math.round(x+ax*p),Math.round(y+ay*p),Math.ceil(ww*p),Math.ceil(hh*p));}
    r(-4,0,9,1,"#4d4170");r(-3,-1,7,1,"#4d4170");r(0,-22,1,22,"#6a5c8a");r(-1,-25,3,3,"#2A2238");r(0,-24,1,1,"#9B7FE0");
    g.imageSmoothingEnabled=was;
  }

  /* ---------------- the character maker ----------------
     maker(el, look, onChange): fills el with a live preview and a control for every option.
     Returns {get(), set(look)}. Used on the venue's login screen and the performer's setup. */
  var makerCss=false;
  function maker(el,look,onChange,opts){
    opts=opts||{};
    if(!makerCss){makerCss=true;var st=document.createElement("style");st.textContent=
      ".ukm{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}"+
      ".ukm-prev{flex:0 0 auto;width:120px;height:150px;border-radius:10px;background:linear-gradient(#2a1f42,#161128);border:1px solid rgba(255,255,255,.12);image-rendering:pixelated;cursor:pointer}"+
      ".ukm-rows{flex:1 1 200px;min-width:0;display:flex;flex-direction:column;gap:7px}"+
      ".ukm-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}"+
      ".ukm-lbl{font-size:11px;color:#a59cc4;text-transform:uppercase;letter-spacing:.5px;width:100%;margin-bottom:-2px}"+
      ".ukm-step{display:flex;align-items:center;gap:4px}"+
      ".ukm-step button{width:26px;height:26px;border-radius:6px;border:1px solid rgba(255,255,255,.15);background:#2a2440;color:#fff;cursor:pointer;font:700 13px system-ui;padding:0}"+
      ".ukm-step span{min-width:84px;text-align:center;font:600 13px system-ui;color:#fff}"+
      ".ukm-sw{width:20px;height:20px;border-radius:5px;border:2px solid transparent;cursor:pointer;padding:0;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35)}"+
      ".ukm-sw.sel{border-color:#fff;transform:scale(1.12)}"+
      "@media (max-width:520px){.ukm{gap:10px}.ukm-prev{width:92px;height:116px}.ukm-rows{flex-basis:150px}.ukm-step span{min-width:70px;font-size:12px}.ukm-sw{width:18px;height:18px}}"+
      ".ukm-rand{align-self:flex-start;margin-top:2px;padding:6px 12px;border-radius:7px;border:1px solid rgba(255,255,255,.18);background:#2a2440;color:#fff;font:600 12px system-ui;cursor:pointer}";
      document.head.appendChild(st);}
    var L=look?JSON.parse(JSON.stringify(look)):random(),O=OPTS;
    el.innerHTML="";var box=document.createElement("div");box.className="ukm";el.appendChild(box);
    var cv=document.createElement("canvas");cv.className="ukm-prev";cv.width=120;cv.height=150;cv.title="Tap to see a dance move";box.appendChild(cv);
    var rows=document.createElement("div");rows.className="ukm-rows";box.appendChild(rows);
    var ctl={};
    function changed(){paint();if(onChange)onChange(JSON.parse(JSON.stringify(L)));}
    function stepper(key,label,colKey){
      var row=document.createElement("div");row.className="ukm-row";
      var lb=document.createElement("div");lb.className="ukm-lbl";lb.textContent=label;row.appendChild(lb);
      if(O[key].names){
        var sp=document.createElement("div");sp.className="ukm-step";
        var b1=document.createElement("button");b1.type="button";b1.textContent="\u25C0";b1.setAttribute("aria-label","Previous "+label);
        var nm=document.createElement("span");
        var b2=document.createElement("button");b2.type="button";b2.textContent="\u25B6";b2.setAttribute("aria-label","Next "+label);
        b1.onclick=function(){L[key]=(L[key]+count(key)-1)%count(key);changed();};
        b2.onclick=function(){L[key]=(L[key]+1)%count(key);changed();};
        sp.appendChild(b1);sp.appendChild(nm);sp.appendChild(b2);row.appendChild(sp);ctl[key]=nm;
      }
      var ck=O[key].col?key:colKey;
      if(ck){var sws=[];O[ck].col.forEach(function(c,i){var b=document.createElement("button");b.type="button";b.className="ukm-sw";b.style.background=c;b.title=O[ck].label;
        b.onclick=function(){L[ck]=i;changed();};row.appendChild(b);sws.push(b);});ctl[ck+"_sw"]=sws;}
      rows.appendChild(row);
    }
    stepper("skin","Skin");stepper("hair","Hair","hairCol");stepper("top","Top","topCol");stepper("bottom","Bottoms","botCol");stepper("extra","Extra");
    var rb=document.createElement("button");rb.type="button";rb.className="ukm-rand";rb.textContent="\uD83C\uDFB2 Surprise me";rb.onclick=function(){L=random();changed();};rows.appendChild(rb);
    function paint(){
      KEYS.forEach(function(k){if(ctl[k])ctl[k].textContent=O[k].names[L[k]];if(ctl[k+"_sw"])ctl[k+"_sw"].forEach(function(b,i){b.classList.toggle("sel",i===L[k]);});});
    }
    /* the preview idles, waves now and then, and shows a dance move when tapped */
    var g=cv.getContext("2d"),moveT=-1e9,raf=0;
    cv.onclick=function(){moveT=performance.now();};
    function frame(){
      if(!cv.isConnected){raf=0;return;}
      var t=performance.now(),k=(t-moveT)/900,st;
      g.clearRect(0,0,120,150);
      g.fillStyle="rgba(0,0,0,.35)";g.fillRect(36,128,48,6);
      if(k>=0&&k<1){var up=Math.sin(k*Math.PI);st={armL:0.15+up*2.6,armR:-0.15-up*2.6,legL:up*0.5,legR:-up*0.5,bob:-up*12,mouth:true};}
      else{var w=Math.sin(t*0.003);st={armL:0.15,armR:-0.15+(Math.floor(t/4000)%2?Math.max(0,w)*2.2:0),bob:-Math.abs(Math.sin(t*0.004))*3};}
      drawChar(g,60,92,3,L,st);
      raf=requestAnimationFrame(frame);
    }
    paint();frame();
    return{get:function(){return JSON.parse(JSON.stringify(L));},set:function(nl){L=JSON.parse(JSON.stringify(nl));changed();}};
  }

  /* ---------------- free dance moves ----------------
     dance(style, sub, c, bp): the pose for a dance at beat position bp (beats since a beat, fractional).
     c = the two control dots [ax, ay, bx, by], each -1..1 (up is negative). Returns limb angles (radians,
     0 = hanging down), bob and dx (art pixels; negative bob is up), rot (whole body, radians), mouth. Every
     device works this out from the same style, sub-move and dots, so a dance looks the same to everyone. */
  var DANCES=[
    {name:"Freestyle",icon:"\uD83D\uDD7A",subs:[]},
    {name:"Two-step",icon:"\uD83D\uDC63",subs:["Basic","Clap","Point","Shimmy"],help:"Left dot: step width and bounce. Right dot: arm swing."},
    {name:"Hands on knees",icon:"\uD83E\uDDB5",subs:["Knock knees","Bounce","Low","Lean back"],help:"Left dot: how low and how wide. Right dot: lean."},
    {name:"Shake it",icon:"\uD83C\uDF51",subs:["Wiggle","Drop it","Hands up","Fast"],help:"Left dot: sway and height. Right dot: lean and arms."},
    {name:"Running man",icon:"\uD83C\uDFC3",subs:["Classic","Fast","Moonwalk","Arms pump"],help:"Left dot moves you: up and down, and slide. Right dot: knee lift and arms."},
    {name:"Skank",icon:"\uD83C\uDFBA",subs:["Classic","Windmill","Pogo","Elbows"],help:"Left dot: knee height and travel. Right dot: punches."},
    {name:"Robot",icon:"\uD83E\uDD16",subs:["Arms","Wave","Pop","Freeze"],help:"Each dot points an arm; it snaps like a robot."},
    {name:"The worm",icon:"\uD83D\uDC1B",subs:["Forward","Back","Flop","Hold"],help:"Slide your thumbs up and down: left lifts the chest, right lifts the hips."},
    {name:"Silly",icon:"\uD83E\uDD2A",subs:["Chicken","Sprinkler","YMCA","Floss","Macarena"],help:"Left dot: size and speed. Right dot: bounce."}
  ];
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function dance(style,sub,c,bp){
    c=c||[0,0,0,0];var ax=c[0],ay=c[1],bx=c[2],by=c[3],ph=((bp%1)+1)%1,b=Math.floor(bp),alt=b%2?1:-1,hop=Math.pow(1-ph,2),
      s1=Math.sin(bp*Math.PI),s2=Math.sin(bp*Math.PI*2),o={armL:0.15,armR:-0.15,legL:0,legR:0,bob:0,dx:0,rot:0,mouth:false};
    switch(style){
    case 1:{ /* two-step: step side to side on the beat, bounce, arms swinging low */
      var w=0.6+(ax+1)*0.5;o.dx=s1*5*w;o.bob=-hop*(1.5+Math.max(0,-ay)*3);
      o.legL=0.1+Math.max(0,s1)*0.35*w;o.legR=-0.1+Math.min(0,s1)*0.35*w;
      var sw=0.4+(bx+1)*0.4,up=Math.max(0,-by)*1.2;o.armL=0.3+up+s1*sw*0.5;o.armR=-0.3-up+s1*sw*0.5;
      if(sub===1){var cl=hop>0.5;o.armL=cl?-0.9:0.9;o.armR=cl?0.9:-0.9;o.mouth=cl;}          /* clap in front */
      if(sub===2){if(alt>0){o.armR=-2.2;o.armL=0.3;}else{o.armL=2.2;o.armR=-0.3;}}            /* point up, side to side */
      if(sub===3){o.armL=1.5+Math.sin(bp*Math.PI*8)*0.3;o.armR=-1.5+Math.sin(bp*Math.PI*8)*0.3;}  /* shimmy */
      break;}
    case 2:{ /* hands on knees: squat, hands down on the knees, knees knocking in and out */
      var low=1.5+(ay+1)*1.6,wide=0.5+(ax+1)*0.3,k=Math.abs(s2);
      o.bob=low*1.6-hop*1.2;o.legL=wide*(sub===0?k:0.7);o.legR=-wide*(sub===0?k:0.7);
      o.armL=-0.25+o.legL*0.3;o.armR=0.25+o.legR*0.3;o.rot=bx*0.18;
      if(sub===1)o.bob=low*1.4-Math.abs(Math.sin(bp*Math.PI*2))*3;                             /* bounce */
      if(sub===2){o.bob=low*2.6;o.legL=1.0;o.legR=-1.0;}                                         /* low */
      if(sub===3){o.rot=-0.22+bx*0.1;o.armL=1.2;o.armR=-1.2;}                                    /* lean back */
      break;}
    case 3:{ /* shake it: hips swinging fast, hands on hips, leaning */
      var amp=1+(ax+1)*1.2,sp=sub===3?4:2,sh=Math.sin(bp*Math.PI*sp);
      o.dx=sh*amp;o.rot=bx*0.15+sh*0.06;o.bob=Math.max(0,ay)*4-hop;
      o.armL=2.4;o.armR=-2.4;o.legL=0.15+sh*0.1;o.legR=-0.15+sh*0.1;
      if(sub===1){o.bob=5+Math.abs(sh)*2;o.legL=0.8;o.legR=-0.8;}                                /* drop it */
      if(sub===2){o.armL=2.8+sh*0.2;o.armR=-2.8+sh*0.2;}                                         /* hands up */
      if(by<-0.4&&sub!==2){o.armL=2.7;o.armR=-2.7;}
      break;}
    case 4:{ /* running man: one leg forward, the other sliding back, swapping each beat; the left dot moves you */
      var lift=0.5+Math.max(0,-by)*0.7+(sub===1?0.25:0),fast=sub===1?2:1,q=Math.sin(bp*Math.PI*fast);
      o.legL=q*lift;o.legR=-q*lift*0.7;o.bob=ay*5-Math.abs(q)*2;o.dx=ax*8+(sub===2?-q*3:0);
      var pump=0.5+(bx+1)*0.4+(sub===3?0.6:0);o.armL=0.4-q*pump;o.armR=-0.4-q*pump;
      break;}
    case 5:{ /* skank: knees up high in turn, punching forward with the opposite arm */
      var kh=0.7+Math.max(0,-ay)*0.6,qq=Math.sin(bp*Math.PI);
      o.legL=Math.max(0,qq)*kh;o.legR=Math.min(0,qq)*kh;o.bob=-Math.abs(qq)*3;o.dx=ax*4*s1;
      var pu=1.2+Math.max(0,-by)*0.8+(bx+1)*0.2;o.armL=qq<0?pu:0.6;o.armR=qq>0?-pu:-0.6;
      if(sub===1){o.armL=bp*Math.PI*2%(Math.PI*2);o.armR=-o.armL;}                               /* windmill */
      if(sub===2){o.bob=-hop*8;o.legL=0.1;o.legR=-0.1;o.armL=2.6;o.armR=-2.6;}                    /* pogo */
      if(sub===3){o.armL=1.6+qq*0.5;o.armR=-1.6+qq*0.5;}                                         /* elbows */
      break;}
    case 6:{ /* robot: each dot points an arm, snapped to 45 degree steps on the half beat */
      var snap=function(v){return Math.round(v/(Math.PI/4))*(Math.PI/4);};
      var aL=Math.hypot(ax,ay)>0.25?Math.atan2(-ax,ay):0.2,aR=Math.hypot(bx,by)>0.25?Math.atan2(-bx,by):-0.2;
      o.armL=snap(aL);o.armR=snap(aR);o.bob=(Math.floor(bp*2)%2)?-1:0;o.legL=0.12;o.legR=-0.12;
      if(sub===1){var st2=Math.floor(bp*2)%4;o.armL=[1.57,2.36,1.57,0.79][st2];o.armR=-[0.79,1.57,2.36,1.57][st2];}   /* wave */
      if(sub===2&&ph<0.15){o.bob=-2;o.mouth=true;}                                                /* pop on the beat */
      if(sub===3){o.bob=0;}
      break;}
    case 7:{ /* the worm: lying on the floor; the thumbs lift the chest (left) and the hips (right) */
      var dir=sub===1?-1:1,chest=-ay,hips=-by;
      if(sub===0||sub===1){var wv=Math.sin(bp*Math.PI*2);chest=chest*0.6+Math.max(0,wv)*0.6;hips=hips*0.6+Math.max(0,-wv)*0.6;o.dx=dir*Math.sin(bp*Math.PI)*3;}
      if(sub===2){chest=hop;hips=hop;}                                                             /* flop */
      o.rot=dir*(Math.PI/2)+dir*(hips-chest)*0.35;o.bob=-Math.max(chest,hips)*4;
      o.armL=0.05;o.armR=-0.05;o.legL=0.04;o.legR=-0.04;
      break;}
    case 8:{ /* silly: the classics, one move per beat */
      var size=0.7+(ax+1)*0.3,sp2=ay<-0.4?2:ay>0.4?0.5:1,bb=bp*sp2,bi=Math.floor(bb),pp=bb%1,bh=-Math.pow(1-pp,2)*(1+Math.max(0,-by)*4);
      o.bob=bh;
      if(sub===0){var flap=bi%4<2;o.armL=flap?1.2+Math.sin(bb*Math.PI*4)*0.6:0.4;o.armR=flap?-1.2-Math.sin(bb*Math.PI*4)*0.6:-0.4;o.legL=bi%4===2?0.5:0;o.legR=bi%4===3?-0.5:0;o.mouth=!flap;}   /* chicken */
      else if(sub===1){var a8=(bi%8)/8*1.6-0.3;o.armL=1.57*size;o.armR=-(0.6+a8);o.dx=Math.sin(bb*Math.PI/4)*2;}                                     /* sprinkler */
      else if(sub===2){var y=[[2.6,-2.6],[2.3,-2.9],[2.0,-0.6],[3.0,-3.0]][bi%4];o.armL=y[0];o.armR=y[1];o.mouth=pp<0.3;}                                 /* YMCA */
      else if(sub===3){var fl=Math.sin(bb*Math.PI*2);o.armL=0.4+fl*0.5*size;o.armR=-0.4+fl*0.5*size;o.dx=-fl*1.5;}                                      /* floss */
      else{var mc=bi%8;o.armL=mc<1?1.57:mc<2?1.57:mc<4?2.9:0.9;o.armR=mc<2?-1.57:mc<4?-2.9:-0.9;if(mc>=6){o.dx=Math.sin(bb*Math.PI*2)*2;}}               /* macarena */
      break;}
    }
    o.armL=clamp(o.armL,-3.3,3.3);o.armR=clamp(o.armR,-3.3,3.3);o.legL=clamp(o.legL,-1.2,1.2);o.legR=clamp(o.legR,-1.2,1.2);
    return o;
  }

  /* ---------------- things that lower in, drop or burst ----------------
     Each lowers or raises smoothly when switched (k goes 0 to 1 over a couple of seconds). */
  var drop={disco:0,banner:0},dropT=0,balloons=[],confetti=[],lastBalloon=0,lastConfetti=0;
  function easeDrops(fx,now){
    var dt=Math.min(100,Math.max(0,now-(dropT||now)));dropT=now;
    ["disco","banner"].forEach(function(k){var want=fx&&fx[k]?1:0;drop[k]+=Math.max(-dt/1800,Math.min(dt/2200,want-drop[k]));});
  }
  function easeOut(k){return 1-Math.pow(1-k,3);}
  /* the disco ball: lowers on its cable to above the dance floor, spins, and throws spots of light round the room */
  function discoBall(g,W,H,sb,fb,P,now){
    var k=easeOut(drop.disco);if(k<=0.001)return;
    var R=Math.max(P*7,Math.min(W,H)*0.045),cx=W/2,cy=-R*2+(sb+R*1.3+R*2)*k,t=now/1000,i;      /* hangs over the front of the dance floor */
    g.fillStyle="#6a5c8a";g.fillRect(Math.round(cx-P/4),0,Math.max(1,Math.round(P/2)),Math.max(0,cy-R));
    var was=g.imageSmoothingEnabled;g.save();g.beginPath();g.arc(cx,cy,R,0,6.3);g.clip();
    g.fillStyle="#5d5670";g.fillRect(cx-R,cy-R,R*2,R*2);
    var cell=Math.max(P,Math.round(R/4));
    for(var yy=cy-R;yy<cy+R;yy+=cell)for(var xx=cx-R-cell;xx<cx+R+cell;xx+=cell){
      var row=Math.round((yy-cy)/cell),col=Math.round((xx-cx)/cell+t*3),lit=(row*7+col*13)%9;
      var shade2=1-Math.hypot((xx+cell/2-cx)/R,(yy+cell/2-cy)/R)*0.6;
      g.fillStyle=lit===0?"#FFFFFF":lit<3?"rgba(220,225,255,"+(0.55*shade2+0.3)+")":"rgba(150,150,190,"+(0.5*shade2+0.25)+")";
      g.fillRect(Math.round(xx+((t*3*cell)%cell)),Math.round(yy),cell-1,cell-1);}
    g.restore();g.strokeStyle="#2a2440";g.lineWidth=Math.max(1,P/2);g.beginPath();g.arc(cx,cy,R,0,6.3);g.stroke();
    /* spots of light sweeping the walls and floor */
    if(k>0.85){g.save();g.globalCompositeOperation="lighter";
      for(i=0;i<46;i++){var an=i*2.399+t*0.6,el=((i*0.618)%1),sx=W/2+Math.cos(an)*W*(0.15+0.55*el),sy=sb*0.2+(fb-sb*0.2)*((Math.sin(an*0.7+i)*0.5+0.5)*0.9+0.05),sz=Math.max(P,Math.round(P*(1+el)));
        g.globalAlpha=0.35+0.35*Math.abs(Math.sin(t*3+i));g.fillStyle=i%5===0?TILECOL[i%TILECOL.length]:"#FFFFFF";g.fillRect(Math.round(sx),Math.round(sy),sz,sz);}
      g.restore();}
    g.imageSmoothingEnabled=was;
  }
  /* a banner unrolling down the back wall from the truss */
  function banner(g,W,H,sb,P,text,side){
    var k=easeOut(drop.banner);if(k<=0.001)return;
    text=String(text||"UNHOLY KEYS").toUpperCase().slice(0,20);
    var tp=Math.max(2,Math.round(P*1.2)),tw=text.length*6*tp,bw=Math.min(W*0.8,tw+tp*12),bh=Math.round((tp*7+tp*8)*k),x0=Math.round((side?W*0.2:W/2)-bw/2),y0=Math.round(Math.max(P*4,30));             /* the Jumbotron's down: hang it to one side */
    if(side){bw=Math.min(bw,W*0.3);x0=Math.round(W*0.2-bw/2);}
    g.fillStyle="#2a1440";g.fillRect(x0-P,y0-P,bw+P*2,P*2);                   /* the pole */
    g.fillStyle="#8a1e3c";g.fillRect(x0,y0,bw,bh);
    g.fillStyle="#F5D03C";g.fillRect(x0,y0,bw,Math.max(1,Math.round(P/2)));g.fillRect(x0,y0+bh-Math.max(1,Math.round(P/2)),bw,Math.max(1,Math.round(P/2)));
    for(var i=0;i<bw;i+=tp*4){g.fillStyle="#8a1e3c";g.beginPath();g.moveTo(x0+i,y0+bh);g.lineTo(x0+i+tp*4,y0+bh);g.lineTo(x0+i+tp*2,y0+bh+tp*2*k);g.closePath();g.fill();}
    if(k>0.6){g.save();g.globalAlpha=(k-0.6)/0.4;var tp2=Math.min(tp,Math.max(1,Math.floor((bw-tp*4)/(text.length*6))));pixText(g,text,x0+bw/2,y0+tp*4,tp2,"#F5D03C","center","#3a0a18");g.restore();}
  }
  /* balloons drifting down from the ceiling, then a confetti blast from both sides of the stage */
  var BCOL=["#E8505B","#F5D03C","#4CC38A","#4A9BE8","#9B7FE0","#D354A0","#F0A040"];
  function balloonsAndConfetti(g,W,H,sb,fb,P,fx,now){
    var i;
    /* kept in fractions of the screen (x of W, y of H), so every canvas they're drawn on gets them in place */
    if(fx.balloonT&&fx.balloonT!==lastBalloon){lastBalloon=fx.balloonT;for(i=0;i<70;i++)balloons.push({x:Math.random(),y:-Math.random()*0.6-0.03,c:BCOL[i%BCOL.length],v:0.00005+Math.random()*0.00005,t0:now,ph:Math.random()*6,land:0.2+Math.random()*0.8});}
    if(fx.confettiT&&fx.confettiT!==lastConfetti){lastConfetti=fx.confettiT;for(i=0;i<260;i++){var side=i%2,an=-Math.PI/2+(side?-0.55:0.55)+(Math.random()-0.5)*0.9,v=0.0007+Math.random()*0.001;
      confetti.push({x:side?0.92:0.08,y:-1,vx:Math.cos(an)*v,vy:Math.sin(an)*v,t0:now,c:BCOL[i%BCOL.length],ph:Math.random()*6});}}
    var bs=Math.max(P*3,Math.round(Math.min(W,H)*0.022)),kb=[];
    balloons.forEach(function(b){var a=now-b.t0;if(a>12000)return;
      var land=sb+(fb-sb)*b.land,y=Math.min(land,(b.y+a*b.v)*H),x=b.x*W+Math.sin(a*0.0015+b.ph)*P*3,fade=a>10500?1-(a-10500)/1500:1;
      g.globalAlpha=fade;g.strokeStyle="rgba(255,255,255,.5)";g.lineWidth=1;g.beginPath();g.moveTo(x,y+bs);g.lineTo(x+Math.sin(a*0.003)*P,y+bs*2.2);g.stroke();
      g.fillStyle=b.c;g.beginPath();g.ellipse(x,y,bs*0.8,bs,0,0,6.3);g.fill();g.fillStyle="rgba(255,255,255,.55)";g.fillRect(Math.round(x-bs*0.4),Math.round(y-bs*0.55),Math.max(1,P),Math.max(1,P));
      kb.push(b);});
    balloons=kb;
    var kc=[];
    confetti.forEach(function(c){var a=now-c.t0;if(a>6000)return;
      var x=(c.x+c.vx*a*0.9)*W+Math.sin(a*0.006+c.ph)*P*2,y=sb*0.85+c.vy*a*H+a*a*0.00000035*H;y=Math.min(y,fb-P);
      g.globalAlpha=a>4500?1-(a-4500)/1500:1;g.fillStyle=c.c;var fl=Math.abs(Math.sin(a*0.012+c.ph));g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(P*fl)),Math.max(1,P));kc.push(c);});
    confetti=kc.slice(-1200);g.globalAlpha=1;
  }
  /* the Jumbotron's frame, drawn round a screen rect {x,y,w,h} hanging on cables from the top; k = how far down */
  function jumboFrame(g,rc,P){
    var b=Math.max(3,Math.round(P*2));
    g.fillStyle="#3a3058";g.fillRect(Math.round(rc.x+rc.w*0.18),0,Math.max(2,Math.round(P/1.5)),Math.max(0,rc.y));g.fillRect(Math.round(rc.x+rc.w*0.82),0,Math.max(2,Math.round(P/1.5)),Math.max(0,rc.y));
    g.fillStyle="#15121F";g.fillRect(rc.x-b,rc.y-b,rc.w+b*2,rc.h+b*2+P*3);
    g.fillStyle="#2a2440";g.fillRect(rc.x-b,rc.y+rc.h+b,rc.w+b*2,P*3);
    for(var i=0;i<12;i++){g.fillStyle=TILECOL[(i+Math.floor(Date.now()/250))%TILECOL.length];g.fillRect(Math.round(rc.x-b+(rc.w+b*2)*(i+0.5)/12-P/2),Math.round(rc.y+rc.h+b+P),Math.max(1,P),Math.max(1,P));}
  }
  /* crowd surprises, drawn on each dancer for a few seconds: "sparkle", "fire", "lasers" (from the hands,
     aimed at target {x,y}), "float" (the dancer rises; see crowdLift). age = ms since it started. */
  var CROWD_MS=7000;
  function crowdK(age){return age<0||age>CROWD_MS?0:Math.min(1,age/500,(CROWD_MS-age)/800);}
  function crowdLift(kind,age,p){if(kind!=="float")return 0;var k=crowdK(age);return -Math.sin(Math.min(1,age/CROWD_MS)*Math.PI)*p*22*Math.min(1,k*2);}
  function crowdFx(g,kind,x,y,p,age,seed,hands,target){
    var k=crowdK(age);if(k<=0)return;var t=age/1000,i;seed=seed||0;
    g.save();
    if(kind==="sparkle"){
      for(i=0;i<14;i++){var a=i*0.45+seed+t*1.4,r=p*(9+5*Math.sin(t*2+i)),sx=x+Math.cos(a)*r,sy=y-p*4+Math.sin(a)*r*1.2,tw=Math.abs(Math.sin(t*6+i*1.3+seed));
        g.globalAlpha=k*tw;g.fillStyle=i%3?"#FFF6D0":TILECOL[(i+seed|0)%TILECOL.length];var q=Math.max(1,Math.round(p*(tw>0.7?1.5:0.9)));
        g.fillRect(Math.round(sx-q/2),Math.round(sy-q*1.5),q,q*3);g.fillRect(Math.round(sx-q*1.5),Math.round(sy-q/2),q*3,q);}
    }else if(kind==="fire"){
      g.globalCompositeOperation="lighter";
      for(i=0;i<24;i++){var ph=((t*1.6+i*0.11+seed*0.1)%1),fx2=x+(((i*37+seed*11)%15)-7)*p*0.9+Math.sin(t*5+i)*p,fy=y+p*11-ph*p*34,sz=Math.max(2,Math.round(p*(3.6-ph*2.6)));
        g.globalAlpha=k*(1-ph)*0.85;g.fillStyle=ph<0.3?"#FFF0A0":ph<0.6?"#F5A030":"#E8505B";g.fillRect(Math.round(fx2-sz/2),Math.round(fy),sz,sz*2);}
    }else if(kind==="lasers"&&hands&&target){
      g.globalCompositeOperation="lighter";
      hands.forEach(function(h,hi){g.globalAlpha=k*(0.55+0.3*Math.abs(Math.sin(t*8+hi+seed)));g.strokeStyle=TILECOL[(hi*3+(seed|0))%TILECOL.length];g.lineWidth=Math.max(1,p*0.6);
        g.beginPath();g.moveTo(h[0],h[1]);g.lineTo(target.x+Math.sin(t*2+hi)*p*6,target.y);g.stroke();g.globalAlpha=k;g.fillStyle="#fff";g.fillRect(Math.round(h[0]-p/2),Math.round(h[1]-p/2),Math.max(1,p),Math.max(1,p));});
    }else if(kind==="float"){
      g.globalAlpha=k*0.35;g.fillStyle="#000";var lift=-crowdLift(kind,age,p);g.beginPath();g.ellipse(x,y+p*12+lift,p*6*(1-Math.min(0.6,lift/(p*40))),p*1.6,0,0,6.3);g.fill();
    }
    g.restore();
  }


  /* ---------------- reactions ----------------
     Quick reactions anyone can send: "jump", "hearts", "bigheart", "clap" (applause), "whistle".
     A dancer keeps a short list [{k, t}] (t = when, ms); reactPose changes the pose for the latest one,
     reactFx draws them all over the dancer at feet (x, y), art pixel p. */
  var REACTS=["jump","hearts","bigheart","clap","whistle"],REACT_MS={jump:1000,hearts:2400,bigheart:2600,clap:1900,whistle:1700};
  var HEART=[".XX.XX.","XXXXXXX","XXXXXXX",".XXXXX.","..XXX..","...X..."],NOTE=["..XX","..XX","..X.","..X.","XXX.","XXX."];
  function pixArt(g,rows,x,y,q,col,hi){for(var r=0;r<rows.length;r++)for(var c=0;c<rows[r].length;c++)if(rows[r][c]==="X"){g.fillStyle=hi&&r===1&&c===1?hi:col;g.fillRect(Math.round(x+c*q),Math.round(y+r*q),q,q);}}
  function reactLive(list,now){var out=[];if(!list)return out;for(var i=0;i<list.length;i++){var a=now-list[i].t;if(a>=0&&a<REACT_MS[list[i].k])out.push({k:list[i].k,a:a});}return out;}
  function reactPose(list,now,p){
    var L=reactLive(list,now);if(!L.length)return null;var r=L[L.length-1],a=r.a,o={lift:0};
    if(r.k==="jump"){var hop=(a%500)/500;o.lift=-Math.sin(hop*Math.PI)*p*11;o.armL=2.6;o.armR=-2.6;o.legL=-0.35*Math.sin(hop*Math.PI);o.legR=-o.legL;o.mouth=true;}
    else if(r.k==="clap"){var cl=Math.abs(Math.sin(a*0.016));o.armL=-1.45+cl*0.45;o.armR=1.45-cl*0.45;o.mouth=true;}
    else if(r.k==="whistle"){o.armR=-2.6+Math.sin(a*0.02)*0.35;o.armL=-0.15;o.mouth=true;}    /* one arm up, waving */
    else if(r.k==="hearts"||r.k==="bigheart"){o.armL=-1.1;o.armR=1.1;}    /* hands on the heart */
    return o;
  }
  function reactFx(g,list,now,x,y,p,seed){
    var L=reactLive(list,now),i,head=y-p*21;if(!L.length)return;seed=seed||0;g.save();
    L.forEach(function(r,ri){var a=r.a,k=a/REACT_MS[r.k];
      if(r.k==="hearts"){for(i=0;i<5;i++){var hk=k*1.25-i*0.08;if(hk<0||hk>1)continue;var q=Math.max(1,Math.round(p*0.55));
        g.globalAlpha=Math.min(1,(1-hk)*1.6);pixArt(g,HEART,x-3.5*q+Math.sin(hk*9+i*2+seed)*p*4+(i-2)*p*2.2,head-hk*p*26-q*3,q,i%2?"#FF5A8A":"#E8304B","#FFC0D0");}}
      else if(r.k==="bigheart"){var pop=a<300?a/300*1.25:a<450?1.25-(a-300)/150*0.25:1,beat=a<1500?1+0.12*Math.max(0,Math.sin(a*0.012)):1,rise=a>1500?(a-1500)/1100:0;
        var q2=Math.max(2,Math.round(p*1.6*pop*beat));g.globalAlpha=1-Math.max(0,rise);
        pixArt(g,HEART,x-3.5*q2,head-q2*7-rise*p*30,q2,"#E8304B","#FFC0D0");
        if(a<500){g.globalAlpha=1-a/500;g.fillStyle="#FFE0EA";for(i=0;i<8;i++){var an=i/8*6.283,rr=p*(6+a/500*14);g.fillRect(Math.round(x+Math.cos(an)*rr),Math.round(head-q2*3.5+Math.sin(an)*rr),Math.max(1,p),Math.max(1,p));}}}
      else if(r.k==="clap"){var ph=(a*0.016/Math.PI)%1;if(ph<0.35){g.globalAlpha=1-ph/0.35;g.fillStyle="#FFF6D0";var cx=x,cy=y-p*13;
          for(i=0;i<6;i++){var an2=i/6*6.283+0.3,r2=p*(5+ph*8);g.fillRect(Math.round(cx+Math.cos(an2)*r2),Math.round(cy+Math.sin(an2)*r2),Math.max(1,p*0.8),Math.max(1,p*0.8));}}}
      else if(r.k==="whistle"){for(i=0;i<3;i++){var nk=k*1.2-i*0.18;if(nk<0||nk>1)continue;var q3=Math.max(1,Math.round(p*0.6));
          g.globalAlpha=1-nk;pixArt(g,NOTE,x+p*5+nk*p*14,head+p*4-nk*p*14+Math.sin(nk*12)*p*2,q3,i%2?"#7FE0FF":"#F5D03C");}
        if(a<700){g.globalAlpha=1-a/700;g.fillStyle="#fff";for(i=0;i<3;i++)g.fillRect(Math.round(x+p*4+i*p*1.5),Math.round(head+p*5-i*p),Math.max(1,p*0.7),Math.max(1,p*0.7));}}
      else if(r.k==="jump"){var hp=(a%500)/500;if(hp<0.2||hp>0.95){g.globalAlpha=0.6;g.fillStyle="#cfc8e8";var d=hp<0.2?hp/0.2:0;g.fillRect(Math.round(x-p*5-d*p*3),Math.round(y+p*11),Math.max(1,p),Math.max(1,p));g.fillRect(Math.round(x+p*4+d*p*3),Math.round(y+p*11),Math.max(1,p),Math.max(1,p));}}
    });
    g.restore();
  }

  /* ---------------- scenes: space and water ----------------
     env.space / env.water go 0..1 as they're switched on (water fills over ~9 s and drains over ~6 s). */
  var env={space:0,water:0},envT=0;
  function easeEnv(fx,now){var dt=Math.min(100,Math.max(0,now-(envT||now)));envT=now;
    env.space+=Math.max(-dt/2000,Math.min(dt/2500,(fx&&fx.space?1:0)-env.space));env.water+=Math.max(-dt/6000,Math.min(dt/9000,(fx&&fx.water?1:0)-env.water));}
  function smooth(k){return k*k*(3-2*k);}
  /* where the water's surface is (canvas y), or null when there's no water */
  function waterY(lay,H){if(env.water<=0.002)return null;var sb=lay.stageBottom*H,fb=lay.floorBottom*H,top=sb*0.18;return fb-(fb-top)*smooth(env.water);}
  /* how being in space or under water changes a dancer at feet (x, y), art pixel p: {k, lift, rot, limbs, bubbles} or null */
  function envPose(lay,H,x,y,p,now,seed){
    var t=now/1000,wy=waterY(lay,H);seed=seed||0;
    if(wy!==null){var dep=(y-p*8)-wy,k=Math.max(0,Math.min(1,dep/(p*8)));
      if(k>0){var dir=seed%2?1:-1,st=t*3.2+seed;return{k:k,lift:Math.sin(t*1.6+seed)*p*2*k-p*4*k,rot:dir*1.2*k,armL:2.2+Math.sin(st)*1.0,armR:-(2.2+Math.sin(st+Math.PI)*1.0),legL:Math.sin(t*9+seed)*0.4,legR:-Math.sin(t*9+seed)*0.4,bubbles:true};}}
    var ks=smooth(env.space);
    if(ks>0.001){var ft=t*0.7+seed*1.3;return{k:ks,lift:-(p*7+Math.sin(ft)*p*4)*ks,rot:Math.sin(t*0.35+seed)*0.6*ks,armL:1.3+Math.sin(ft*1.3)*0.4,armR:-1.3-Math.sin(ft*1.1)*0.4,legL:0.3+Math.sin(ft)*0.2,legR:-0.3-Math.sin(ft*0.9)*0.2};}
    return null;
  }
  /* bubbles rising from a swimmer's head */
  function envFx(g,lay,H,x,y,p,now,seed){
    var wy=waterY(lay,H);if(wy===null||y-p*14<wy)return;var t=now/1000;g.save();g.strokeStyle="rgba(220,240,255,.8)";g.lineWidth=Math.max(1,p/3);
    for(var i=0;i<3;i++){var ph=((t*0.6+i/3+(seed||0)*0.13)%1),by=y-p*18-ph*p*30;if(by<wy)continue;g.globalAlpha=1-ph;var r=Math.max(1,p*(0.6+ph*0.7));g.beginPath();g.arc(x+Math.sin(ph*8+i)*p*2,by,r,0,6.3);g.stroke();}
    g.restore();
  }
  function drawSpace(g,W,H,sb,fb,P,now){
    var k=smooth(env.space);if(k<=0.002)return;var t=now/1000,i;g.save();
    var gr=g.createLinearGradient(0,0,0,sb);gr.addColorStop(0,"#05030f");gr.addColorStop(1,"#120a2a");g.globalAlpha=k*0.96;g.fillStyle=gr;g.fillRect(0,0,W,sb);
    /* nebula clouds */
    [[0.22,0.35,"rgba(150,60,200,.35)"],[0.7,0.25,"rgba(40,120,220,.3)"],[0.5,0.6,"rgba(211,84,160,.22)"]].forEach(function(n){var cx=W*n[0],cy=sb*n[1],rr=Math.max(W,sb)*0.28;var rg=g.createRadialGradient(cx,cy,0,cx,cy,rr);rg.addColorStop(0,n[2]);rg.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=rg;g.fillRect(cx-rr,cy-rr,rr*2,rr*2);});
    for(i=0;i<160;i++){var sx=((i*397.13)%1)*W,sy=((i*0.6180339*7.1)%1)*sb,tw=0.4+0.6*Math.abs(Math.sin(t*(0.8+(i%5)*0.3)+i));g.globalAlpha=k*tw;g.fillStyle=i%9===0?"#FFE9A0":i%7===0?"#A0D0FF":"#fff";var sz=i%11===0?P:Math.max(1,Math.round(P/2));g.fillRect(Math.round(sx),Math.round(sy),sz,sz);}
    /* a ringed planet and a small blue one */
    g.globalAlpha=k;var px=W*0.82,py=sb*0.32,pr=Math.max(P*6,Math.min(W,H)*0.06);
    var pg=g.createRadialGradient(px-pr*0.4,py-pr*0.4,pr*0.1,px,py,pr);pg.addColorStop(0,"#F5C08A");pg.addColorStop(1,"#9a4a3a");g.fillStyle=pg;g.beginPath();g.arc(px,py,pr,0,6.3);g.fill();
    g.strokeStyle="rgba(240,220,170,.8)";g.lineWidth=Math.max(1,P*0.8);g.beginPath();g.ellipse(px,py,pr*1.8,pr*0.45,-0.3,0,6.3);g.stroke();
    var qx=W*0.14,qy=sb*0.22,qr=pr*0.45,qg=g.createRadialGradient(qx-qr*0.3,qy-qr*0.3,1,qx,qy,qr);qg.addColorStop(0,"#9fe0ff");qg.addColorStop(1,"#2a5aa0");g.fillStyle=qg;g.beginPath();g.arc(qx,qy,qr,0,6.3);g.fill();
    /* now and then a shooting star */
    var ss=(t/4)%1;if(ss<0.25){var a=ss/0.25,x0=W*(0.2+((Math.floor(t/4)*0.37)%0.6)),y0=sb*0.1;g.globalAlpha=k*(1-a);g.strokeStyle="#fff";g.lineWidth=Math.max(1,P/2);g.beginPath();g.moveTo(x0+a*W*0.3,y0+a*sb*0.3);g.lineTo(x0+a*W*0.3-P*12,y0+a*sb*0.3-P*12*sb/W);g.stroke();}
    /* the dance floor turns into a see-through platform over the stars */
    g.globalAlpha=k*0.45;g.fillStyle="#05030f";g.fillRect(0,sb,W,fb-sb);
    for(i=0;i<70;i++){var fx2=((i*211.7)%1)*W,fy=sb+((i*0.7548)%1)*(fb-sb);g.globalAlpha=k*0.5*(0.4+0.6*Math.abs(Math.sin(t+i)));g.fillStyle="#fff";g.fillRect(Math.round(fx2),Math.round(fy),Math.max(1,Math.round(P/2)),Math.max(1,Math.round(P/2)));}
    g.restore();
  }
  function drawWater(g,W,H,lay,P,now,want){
    var sb=lay.stageBottom*H,wy=waterY(lay,H),t=now/1000,i;g.save();
    /* while filling: water pouring in from both top corners */
    if(want&&env.water<0.999){g.globalAlpha=0.75;for(var sd=0;sd<2;sd++){var x0=sd?W-P*10:P*4;g.fillStyle="rgba(90,170,240,.8)";g.fillRect(x0,P*6,P*6,(wy===null?lay.floorBottom*H:wy)-P*6);
      g.fillStyle="rgba(220,240,255,.8)";for(i=0;i<8;i++){var yy=P*6+((t*H*0.8+i*H/8)%((wy===null?lay.floorBottom*H:wy)-P*6));g.fillRect(x0+P*(1+(i%3)*1.5),yy,P,P*3);}}}
    if(wy===null){g.restore();return;}
    var gr=g.createLinearGradient(0,wy,0,H);gr.addColorStop(0,"rgba(60,150,220,.38)");gr.addColorStop(1,"rgba(10,40,110,.6)");g.globalAlpha=1;g.fillStyle=gr;g.fillRect(0,wy,W,H-wy);
    /* light rays through the water */
    g.globalCompositeOperation="lighter";for(i=0;i<6;i++){var rx=((i*0.19+t*0.02)%1.2-0.1)*W;g.globalAlpha=0.06+0.04*Math.sin(t+i);g.fillStyle="#8fd0ff";g.beginPath();g.moveTo(rx,wy);g.lineTo(rx+W*0.05,wy);g.lineTo(rx+W*0.12,H);g.lineTo(rx+W*0.02,H);g.closePath();g.fill();}
    g.globalCompositeOperation="source-over";
    /* the surface: a wavy bright line */
    g.globalAlpha=0.9;for(var x=0;x<W;x+=P){var wv=Math.round(Math.sin(x*0.02+t*2.2)*P*0.8+Math.sin(x*0.051-t*1.3)*P*0.6);g.fillStyle="rgba(200,235,255,.85)";g.fillRect(x,Math.round(wy+wv),P,Math.max(1,P/2));if((x/P+Math.floor(t*4))%9===0){g.fillStyle="#fff";g.fillRect(x,Math.round(wy+wv-P/2),P,Math.max(1,P/2));}}
    /* bubbles from the floor, and fish once it's deep */
    g.strokeStyle="rgba(220,240,255,.6)";g.lineWidth=Math.max(1,P/3);for(i=0;i<26;i++){var ph=((t*0.18+i*0.137)%1),by=H-(H-wy)*ph,bx=((i*173.3)%W)+Math.sin(ph*10+i)*P*2;if(by<wy+P)continue;g.globalAlpha=0.7*(1-ph*0.5);g.beginPath();g.arc(bx,by,Math.max(1,P*(0.4+(i%3)*0.3)),0,6.3);g.stroke();}
    if(env.water>0.6){var FISH=["..XX..X","XXXXXXX","XXXX.XX","..XX..X"],FC=["#F5A030","#F5D03C","#E8505B","#4CC38A"];for(i=0;i<5;i++){var fp=((t*0.05*(1+i%3*0.4)+i*0.23)%1.3)-0.15,dir=i%2?1:-1,fxx=dir>0?fp*W:W-fp*W,fyy=wy+(H-wy)*(0.2+((i*0.37)%0.7));g.globalAlpha=Math.min(1,(env.water-0.6)/0.3)*0.9;
      g.save();g.translate(fxx,fyy+Math.sin(t*2+i)*P*2);if(dir<0)g.scale(-1,1);var fq=Math.max(2,Math.round(P*1.6));pixArt(g,FISH,-3.5*fq,-2*fq,fq,FC[i%4]);g.restore();}}
    g.restore();
  }
  /* ---------------- show effects ----------------
     The performer's show controls. fx = {lights, fog 0-1, lasers 0/1, dark 0-1, weather "none"|"rain"|"storm"|
     "snow", sunset 0/1, fire 0/1, fireworks 0/1 (auto), burst (time of the last fireworks button press)}.
     fxBack: behind the dancers (the sunset sky, the burning building). fxFront: in front of everything (fog,
     weather, lasers, darkness with pools of light at holes [{x,y,r}], fireworks, lightning, strobe). */
  var rocks=[],sparks=[],lastBurst=0,nextAuto=0,bolt=null,nextBolt=0;
  function fxBack(g,W,H,lay,fx,st){
    if(!fx)return;
    easeDrops(fx,(st&&st.now)||Date.now());
    banner(g,W,H,lay.stageBottom*H,sceneP(W,H),fx.bannerText,st&&st.jumbo);
    var P=sceneP(W,H),sb=lay.stageBottom*H,now=st.now||Date.now(),i,x,y;
    easeEnv(fx,now);drawSpace(g,W,H,sb,lay.floorBottom*H,P,now);
    if(fx.sunset&&env.space<0.99){
      /* the back wall opens to a sunset sky: a low sun behind the stage */
      var gr=g.createLinearGradient(0,0,0,sb);gr.addColorStop(0,"rgba(60,30,90,.85)");gr.addColorStop(0.45,"rgba(220,90,90,.75)");gr.addColorStop(0.8,"rgba(250,170,70,.8)");gr.addColorStop(1,"rgba(120,50,60,.85)");
      g.fillStyle=gr;g.fillRect(0,P*6,W,sb-P*10);
      var sx=W*0.5,sy=sb-P*12,sr=Math.min(W,H)*0.09;
      g.fillStyle="rgba(255,210,90,.95)";for(y=-sr;y<=sr;y+=P)for(x=-sr;x<=sr;x+=P)if(x*x+y*y<=sr*sr&&sy+y<sb-P*6)g.fillRect(Math.round(sx+x),Math.round(sy+y),P,P);
      g.fillStyle="rgba(255,240,180,.35)";for(i=0;i<5;i++)g.fillRect(sx-sr*1.4,sy-sr*0.6+i*P*3,sr*2.8,P);
      /* a city skyline in silhouette */
      g.fillStyle="rgba(30,15,40,.9)";var bx=0,bi=0;while(bx<W){var bw2=P*(8+((bi*37)%9)),bh2=P*(6+((bi*53)%14));g.fillRect(bx,sb-P*6-bh2,bw2-P,bh2);bx+=bw2;bi++;}
    }
    if(fx.fire){
      /* a building ablaze behind the right side of the stage: windows glowing, flames on the roof, smoke */
      var fw=Math.max(P*22,W*0.16),fx0=W*0.68,fh=Math.min(sb*0.62,P*44),fy=sb-P*5-fh;
      g.fillStyle="#2a1a24";g.fillRect(fx0,fy,fw,fh);g.fillStyle="#1a0f16";g.fillRect(fx0+fw-P*2,fy,P*2,fh);
      for(y=fy+P*3;y<fy+fh-P*4;y+=P*6)for(x=fx0+P*3;x<fx0+fw-P*4;x+=P*6){var fl=0.5+0.5*Math.sin(now*0.01+x*0.7+y*1.3);g.fillStyle=fl>0.55?"#F5A030":"#C8501E";g.fillRect(x,y,P*3,P*3);}
      for(i=0;i<Math.ceil(fw/P);i++){var hh=(3+5*Math.abs(Math.sin(now*0.008+i*1.9))+3*Math.abs(Math.sin(now*0.013+i*0.7)))*P;
        g.fillStyle="#E8505B";g.fillRect(fx0+i*P,fy-hh,P,hh);g.fillStyle="#F5D03C";g.fillRect(fx0+i*P,fy-hh*0.55,P,hh*0.55);}
      g.fillStyle="rgba(40,30,40,.45)";for(i=0;i<6;i++){var ph=((now/3000)+i/6)%1;g.fillRect(fx0+fw*0.3+Math.sin(ph*6+i)*P*6-ph*P*14,fy-P*10-ph*sb*0.5,P*(6+ph*10),P*(4+ph*6));}
    }
  }
  function px2(g,x,y,P,c){g.fillStyle=c;g.fillRect(Math.round(x/P)*P,Math.round(y/P)*P,P,P);}
  function fxFront(g,W,H,lay,fx,st){
    if(!fx)return;
    var P=sceneP(W,H),sb=lay.stageBottom*H,fb=lay.floorBottom*H,now=st.now||Date.now(),t=now/1000,i,x,y,ph=st.phase||0,beat=Math.pow(1-ph,2);
    /* fog rolling across the floor */
    if(fx.fog>0){
      g.save();
      for(i=0;i<14;i++){var fxp=((t*0.03*(1+i%3)+i*0.137)%1.4-0.2)*W,fyp=sb+(fb-sb)*(0.25+0.7*((i*0.61)%1)),rr=W*0.12+(i%4)*W*0.03;
        var gg=g.createRadialGradient(fxp,fyp,0,fxp,fyp,rr);gg.addColorStop(0,"rgba(200,195,230,"+(0.16*fx.fog)+")");gg.addColorStop(1,"rgba(200,195,230,0)");
        g.fillStyle=gg;g.fillRect(fxp-rr,fyp-rr,rr*2,rr*2);}
      g.restore();
    }
    /* rain or a storm: streaks falling at a slant, splashes on the floor */
    if(fx.weather==="rain"||fx.weather==="storm"){
      var n=fx.weather==="storm"?260:150,sl=fx.weather==="storm"?0.35:0.15;
      g.fillStyle=fx.weather==="storm"?"rgba(170,190,230,.55)":"rgba(170,190,230,.45)";
      for(i=0;i<n;i++){var sp=0.9+((i*7919)%100)/120,yy=((t*H*sp*1.1+i*(H/n)*7.3)%(H*1.1))-H*0.05,xx=((i*263.7)%W)+yy*sl;xx%=W;
        g.fillRect(Math.round(xx),Math.round(yy),Math.max(1,P/2),P*3);}
      g.fillStyle="rgba(200,215,255,.5)";
      for(i=0;i<20;i++){var sp2=((t*2+i*0.37)%1),spx=((i*331.3)%W),spy=sb+(fb-sb)*((i*0.73)%1);if(sp2<0.3){var r2=sp2*12*P/3;g.fillRect(spx-r2,spy,r2*2,Math.max(1,P/2));}}
    }
    if(fx.weather==="snow"){
      g.fillStyle="rgba(240,245,255,.9)";
      for(i=0;i<140;i++){var sp3=0.3+((i*37)%10)/25,yy2=((t*H*sp3*0.18+i*(H/140)*9.1)%(H*1.05)),xx2=((i*197.3)%W)+Math.sin(t*0.8+i)*P*4;
        var sz=i%5===0?P:Math.max(1,Math.round(P/2));g.fillRect(Math.round(xx2),Math.round(yy2),sz,sz);}
    }
    /* lasers fanning out from the stage over the crowd, sweeping with the music */
    if(fx.lasers){
      g.save();g.globalCompositeOperation="lighter";
      var srcs=[[W*0.15,sb*0.25],[W*0.85,sb*0.25]],lc=["#E8505B","#4CC38A","#4A9BE8","#D354A0"];
      srcs.forEach(function(sp4,si){
        for(var k=0;k<5;k++){var a=Math.PI/2+Math.sin(t*0.9+k*0.6+si*2)*0.9+(si?0.25:-0.25),len=Math.max(W,H)*1.2;
          g.strokeStyle=lc[(k+si+Math.floor(t*2))%lc.length];g.globalAlpha=0.35+0.4*beat;g.lineWidth=Math.max(1,P/2);
          g.beginPath();g.moveTo(sp4[0],sp4[1]);g.lineTo(sp4[0]+Math.cos(a)*len,sp4[1]+Math.sin(a)*len);g.stroke();}
        g.globalAlpha=1;g.fillStyle="#fff";g.fillRect(sp4[0]-P,sp4[1]-P,P*2,P*2);
      });
      g.restore();
    }
    /* the stage filling with water */
    drawWater(g,W,H,lay,P,now,!!fx.water);
    /* darkness, with pools of light where the light falls (the performer, the spotlights, the fire) */
    var dark=Math.max(fx.dark||0,fx.weather==="storm"?0.35:0);
    if(dark>0){
      var dc=darkCanvas(W,H),dg=dc.getContext("2d");
      dg.globalCompositeOperation="source-over";dg.clearRect(0,0,W,H);dg.fillStyle="rgba(4,3,10,"+(dark*0.88)+")";dg.fillRect(0,0,W,H);
      dg.globalCompositeOperation="destination-out";
      var holes=(st.holes||[]).slice();
      if(fx.fire)holes.push({x:W*0.68+Math.max(P*22,W*0.16)/2,y:sb*0.5,r:Math.max(W,H)*0.2});
      holes.forEach(function(h){var rg=dg.createRadialGradient(h.x,h.y,0,h.x,h.y,h.r);rg.addColorStop(0,"rgba(0,0,0,.9)");rg.addColorStop(1,"rgba(0,0,0,0)");dg.fillStyle=rg;dg.fillRect(h.x-h.r,h.y-h.r,h.r*2,h.r*2);});
      g.drawImage(dc,0,0);
    }
    /* embers off the fire, drifting over everything */
    if(fx.fire){for(i=0;i<26;i++){var ep=((t*0.25+i*0.071)%1),ex=W*0.7+Math.sin(t+i*1.7)*W*0.18-ep*W*0.1,ey=sb*0.4-ep*sb*0.5+((i*13)%7)*P;
      g.globalAlpha=1-ep;px2(g,ex,ey+ep*H*0.6,P,i%3?"#F5A030":"#F5D03C");}g.globalAlpha=1;}
    /* fireworks: rockets climb from behind the stage and burst over it */
    if(fx.burst&&fx.burst!==lastBurst){lastBurst=fx.burst;for(i=0;i<5;i++)rocks.push({x:W*(0.15+0.7*Math.random()),t0:now+i*220,top:sb*(0.08+Math.random()*0.35),c:TILECOL[Math.floor(Math.random()*TILECOL.length)]});}
    if(fx.fireworks&&now>nextAuto){nextAuto=now+900+Math.random()*2200;rocks.push({x:W*(0.12+0.76*Math.random()),t0:now,top:sb*(0.08+Math.random()*0.4),c:TILECOL[Math.floor(Math.random()*TILECOL.length)]});}
    var keep=[];
    rocks.forEach(function(r){var a=(now-r.t0)/700;if(a<0){keep.push(r);return;}
      if(a<1){var ry=sb-(sb-r.top)*Math.sin(a*Math.PI/2);px2(g,r.x,ry,P,"#FFF6D0");g.globalAlpha=0.5;px2(g,r.x,ry+P*2,P,r.c);g.globalAlpha=1;keep.push(r);}
      else{for(var k=0;k<34;k++){var an=k/34*Math.PI*2,v=0.06+(k%3)*0.025;sparks.push({x:r.x,y:r.top,vx:Math.cos(an)*v,vy:Math.sin(an)*v,t0:now,c:k%4?r.c:"#FFF6D0"});}}});
    rocks=keep;
    var ks=[];
    sparks.forEach(function(s2){var a2=now-s2.t0;if(a2>1300)return;var k2=1-a2/1300;
      g.globalAlpha=k2;px2(g,s2.x+s2.vx*a2,s2.y+s2.vy*a2+a2*a2*0.00006,P,s2.c);ks.push(s2);});
    g.globalAlpha=1;sparks=ks.slice(-900);
    /* storm: lightning now and then, a white flash and a bolt */
    if(fx.weather==="storm"){
      if(now>nextBolt){nextBolt=now+2500+Math.random()*6000;var pts=[],bx2=W*(0.15+Math.random()*0.7),by2=0;while(by2<sb*0.9){pts.push([bx2,by2]);bx2+=(Math.random()-0.5)*P*10;by2+=P*(3+Math.random()*5);}bolt={t0:now,pts:pts};}
      if(bolt){var ba=(now-bolt.t0)/350;if(ba<1){g.fillStyle="rgba(230,235,255,"+(0.35*(1-ba))+")";g.fillRect(0,0,W,H);
        g.strokeStyle="rgba(255,255,255,"+(1-ba)+")";g.lineWidth=P;g.beginPath();bolt.pts.forEach(function(q,qi){if(qi)g.lineTo(q[0],q[1]);else g.moveTo(q[0],q[1]);});g.stroke();}}
    }
    /* the disco ball, balloons and confetti come in over everything */
    discoBall(g,W,H,sb,fb,P,now);
    balloonsAndConfetti(g,W,H,sb,fb,P,fx,now);
    /* strobe: white flashes on the beat */
    if(fx.lights==="strobe"&&ph<0.08){g.fillStyle="rgba(255,255,255,"+(0.5*(1-ph/0.08))+")";g.fillRect(0,0,W,H);}
  }
  var dkc=null;function darkCanvas(W,H){if(!dkc)dkc=canv(W,H);if(dkc.width!==W||dkc.height!==H){dkc.width=W;dkc.height=H;}return dkc;}
  /* the show's controls, with their defaults (also what the server accepts) */
  var FX_DEFAULT={lights:"auto",fog:0,lasers:0,dark:0,weather:"none",sunset:0,fire:0,fireworks:0,burst:0,
    follow:0,jumbo:"auto",disco:0,banner:0,bannerText:"UNHOLY KEYS",balloonT:0,confettiT:0,crowd:"",crowdT:0,space:0,water:0};
  var CROWD_KINDS=["sparkle","fire","lasers","float"];

  /* someone arriving mid-show: the one-shot moments already set off are treated as seen, so they don't replay */
  function primeFx(fx){if(!fx)return;lastBurst=fx.burst||0;lastBalloon=fx.balloonT||0;lastConfetti=fx.confettiT||0;drop.disco=fx.disco?1:0;drop.banner=fx.banner?1:0;env.space=fx.space?1:0;env.water=fx.water?1:0;}
  /* lights following someone's playing: feed it notes (midi, and whether one is sounding); read() gives
     {h: 0 low .. 1 high within the range they've been playing, hue (from the note), a (how recently)} */
  function follower(){
    var lo=48,hi=72,h=0.5,hue=0,last=-1e9,midi=60,on=false;
    return{note:function(m,isOn){if(isOn){midi=m;last=Date.now();lo=Math.min(lo+0.02,m);hi=Math.max(hi-0.02,m);if(hi-lo<12){var md=(hi+lo)/2;lo=md-6;hi=md+6;}}on=!!isOn;},
      read:function(){var age=Date.now()-last,tg=Math.max(0,Math.min(1,(midi-lo)/(hi-lo)));h+=(tg-h)*0.18;hue=(((midi%12)+12)%12)*30;return{h:h,hue:hue,a:on||age<300?1:Math.max(0,1-(age-300)/1500)};}};
  }
  /* how a crowd surprise changes one dancer at (x,y), art pixel p: how far they float up, and for hand lasers
     where both arms point (at target) and where the hands are */
  function crowdPose(kind,age,x,y,p,target){
    var lift=crowdLift(kind,age,p);
    if(kind!=="lasers"||crowdK(age)<=0||!target)return{lift:lift};
    var J=joints(x,y+lift,p,0),aL=Math.atan2(-(target.x-J[0][0]),target.y-J[0][1]),aR=Math.atan2(-(target.x-J[1][0]),target.y-J[1][1]);
    return{lift:lift,armL:aL,armR:aR,hands:[[J[0][0]-Math.sin(aL)*9*p,J[0][1]+Math.cos(aL)*9*p],[J[1][0]-Math.sin(aR)*9*p,J[1][1]+Math.cos(aR)*9*p]]};
  }
  return{VERSION:"1.30.6",REACTS:REACTS,REACT_MS:REACT_MS,reactPose:reactPose,reactFx:reactFx,envPose:envPose,envFx:envFx,waterY:waterY,crowdPose:crowdPose,follower:follower,primeFx:primeFx,jumboFrame:jumboFrame,crowdFx:crowdFx,crowdLift:crowdLift,CROWD_MS:CROWD_MS,CROWD_KINDS:CROWD_KINDS,fxBack:fxBack,fxFront:fxFront,FX_DEFAULT:FX_DEFAULT,DANCES:DANCES,dance:dance,maker:maker,drawChar:drawChar,joints:joints,LIMB:LIMB,pixText:pixText,scene:scene,sceneP:sceneP,keyboard:keyboard,micStand:micStand,
    looks:{OPTS:OPTS,KEYS:KEYS,count:count,pack:pack,unpack:unpack,random:random,fromColor:fromColor,topColor:topColor,SKIN:SKIN,HAIRCOL:HAIRCOL,CLOTH:CLOTH},shade:shade};
})();
