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
    var armCols=sleeve?[[sleeve,armTop],[9,skin]]:[[9,skin]];
    limb(-6.5,-4.5,aL,9,armCols);limb(6.5,-4.5,aR,9,armCols);
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
    var s={armL:st.armL!==undefined?st.armL:0.15,armR:st.armR!==undefined?st.armR:-0.15,legL:st.legL||0,legR:st.legR||0,mouth:!!st.mouth};
    var c=drawSprite(L,s),q=Math.max(1,p),bob=Math.round((st.bob||0)/q)*q;
    var was=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;
    g.drawImage(c,Math.round(x-OX*q),Math.round(y-OY*q+bob),CWD*q,CHT*q);
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
    /* lights hanging from the truss, swinging their beams */
    var lights=[0.2,0.36,0.64,0.8],cols=["#F5D03C","#E8505B","#D354A0","#4A9BE8"];
    for(i=0;i<lights.length;i++){
      var lx=Math.round(w*lights[i]),sw2=Math.sin(now*0.0007+i*1.7)*0.45,len=fb-6,al=0.05+0.06*beat*on+0.04*lv;
      f.globalAlpha=al;f.fillStyle=cols[i];
      f.beginPath();f.moveTo(lx-1,6);f.lineTo(lx+2,6);f.lineTo(lx+Math.sin(sw2)*len+14,6+len);f.lineTo(lx+Math.sin(sw2)*len-14,6+len);f.closePath();f.fill();
      f.globalAlpha=1;r(lx-1,5,3,2,"#1d1730");r(lx,7,1,1,cols[i]);
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
      var a=(0.03+0.13*beat*on*(n>0.6?1:0.25))*(0.4+0.6*wave)*(0.6+0.6*lv);
      if(a<0.035)continue;
      f.globalAlpha=Math.min(0.2,a);r(i,j+1,T-1,T-2,TILECOL[(gx+gy+Math.floor(t*0.5))%cols2]);
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

  return{maker:maker,drawChar:drawChar,joints:joints,LIMB:LIMB,pixText:pixText,scene:scene,sceneP:sceneP,keyboard:keyboard,micStand:micStand,
    looks:{OPTS:OPTS,KEYS:KEYS,count:count,pack:pack,unpack:unpack,random:random,fromColor:fromColor,topColor:topColor,SKIN:SKIN,HAIRCOL:HAIRCOL,CLOTH:CLOTH},shade:shade};
})();
