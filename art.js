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
  function G(k,d){return typeof GFX!=="undefined"?GFX.v(k):d;}   /* graphics lab values (gfx.js) */
  /* ---------------- the character maker's options ---------------- */
  var SKIN=["#F6D3B3","#E8B48A","#C98B5E","#A0663E","#7A4A2A","#4E2F1B"];
  var HAIRCOL=["#1E1A24","#5A3A22","#9A6034","#E0B850","#D8D8E0","#E8505B","#4A9BE8","#9B7FE0","#4CC38A","#F28AC0","#3FC8B8"];
  var CLOTH=["#E8505B","#F0A040","#F5D03C","#4CC38A","#2F8F6A","#4A9BE8","#2D4E9B","#9B7FE0","#D354A0","#EDEDF5","#5A5670","#26222F"];
  var OPTS={
    skin:{label:"Skin",n:SKIN.length,col:SKIN},
    hair:{label:"Hair",names:["Bald","Short","Spiky","Long","Mohawk","Afro","Ponytail","Beanie","Bob","Bangs","Bun","Pigtails","Braid","Curly","Side swoop","Long waves","Pixie","Buzz","Bowl cut","Quiff","Messy","Shoulder length","High ponytail","Flame spikes","Widow's peak","Long locks","Bob & headband","Side tail","Fluffy mop","Wild crop"]},
    hairCol:{label:"Hair colour",n:HAIRCOL.length,col:HAIRCOL},
    top:{label:"Top",names:["T-shirt","Tank top","Hoodie","Jacket","Striped tee","Suit","Waistcoat","Hi-vis vest","Jersey","Chef coat","Lab coat","Leather jacket","Tuxedo","Polo","Doublet","Robe","Turtleneck","Flannel","Band tee","Uniform","Crop top"]},
    topCol:{label:"Top colour",n:CLOTH.length,col:CLOTH},
    bottom:{label:"Bottoms",names:["Jeans","Shorts","Skirt","Track pants","Overalls","Long dress","Hose","Cargo pants","Kilt","Bell-bottoms","Ripped jeans","Shorts & leggings","Mini skirt"]},
    botCol:{label:"Bottoms colour",n:CLOTH.length,col:CLOTH},
    extra:{label:"Extra",names:["Nothing","Shades","Headphones","Cap","Bandana"]},
    shoes:{label:"Shoes",names:["Sneakers","White sneakers","Red sneakers","Boots","High-tops","Dress shoes","Sandals","Pointy shoes","Rain boots","Platforms"]},
    hat:{label:"Hat",names:["No hat","Hard hat","Chef hat","Fire helmet","Police cap","Top hat","Cowboy hat","Wizard hat","Crown","Beret","Feathered cap","Hood","Racing helmet","Goggles"]},
    face:{label:"Face",names:["Plain","Moustache","Beard","Goatee","Glasses","Round glasses","Eye patch","Freckles","Blush","Stubble"]}
  };
  var KEYS=["skin","hair","hairCol","top","topCol","bottom","botCol","extra","shoes","hat","face"];
  function count(k){var o=OPTS[k];return o.names?o.names.length:o.n;}
  var B36="0123456789abcdefghijklmnopqrstuvwxyz";
  /* a look packs into one character per option (11 now; older 8-character looks still read, the newer options plain) */
  /* any colour: skin, hair, top or bottoms can be picked freely; those ride after a "~" as a letter and 6 hex digits each */
  var HEXK={s:"skinHex",h:"hairHex",t:"topHex",b:"botHex"};
  function hex6(v){return typeof v==="string"&&/^#[0-9a-f]{6}$/i.test(v)?v.toLowerCase():"";}
  function pack(L){var base=KEYS.map(function(k){return B36.charAt(Math.max(0,Math.min(count(k)-1,L[k]|0)));}).join(""),ex="";
    for(var c in HEXK){var h=hex6(L[HEXK[c]]);if(h)ex+=c+h.slice(1);}return base+(ex?"~"+ex:"");}
  function unpack(s){
    if(typeof s!=="string"||!/^[0-9a-z]{8,12}(~([shtb][0-9a-f]{6}){1,4})?$/.test(s))return null;
    var parts=s.split("~"),b=parts[0],L={};KEYS.forEach(function(k,i){L[k]=i<b.length?Math.min(count(k)-1,B36.indexOf(b.charAt(i))):0;});
    if(parts[1])parts[1].replace(/([shtb])([0-9a-f]{6})/g,function(_,c,h){L[HEXK[c]]="#"+h;});return L;
  }
  function rnd(n,r){return Math.floor(r()*n);}
  function rng(seed){var a=(seed>>>0)||1;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
  function random(seed){
    var r=seed===undefined?Math.random:rng(seed),L={};
    KEYS.forEach(function(k){L[k]=rnd(count(k),r);});
    if(r()<0.6)L.extra=0;if(r()<0.65)L.hat=0;if(r()<0.55)L.face=0;
    if(L.botCol===L.topCol)L.botCol=(L.botCol+5)%CLOTH.length;
    return L;
  }
  /* someone with no look yet (an older page, a practice dancer): dress them in their colour */
  function fromColor(hex,seed){
    var L=random(seed||1),best=0,bd=1e9,c=rgb(hex||"#888888");
    for(var i=0;i<CLOTH.length;i++){var d=rgb(CLOTH[i]),e=(d[0]-c[0])*(d[0]-c[0])+(d[1]-c[1])*(d[1]-c[1])+(d[2]-c[2])*(d[2]-c[2]);if(e<bd){bd=e;best=i;}}
    L.topCol=best;if(L.botCol===best)L.botCol=(best+5)%CLOTH.length;return L;
  }
  function topColor(L){return hex6(L.topHex)||CLOTH[L.topCol]||"#888888";}
  function colOf(L,part){return part==="skin"?hex6(L.skinHex)||SKIN[L.skin]||SKIN[1]:part==="hair"?hex6(L.hairHex)||HAIRCOL[L.hairCol]||HAIRCOL[0]:part==="top"?topColor(L):hex6(L.botHex)||CLOTH[L.botCol]||CLOTH[6];}
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
  /* painted pixels and erased pixels are kept on two masks, so the automatic outline leaves them alone */
  var pmk=null,pmg=null,hmk=null,hmg=null,tmk=null,tmg=null,MUSED=false;
  function masks(){if(!pmk){pmk=canv(CWD,CHT);pmg=pmk.getContext("2d");hmk=canv(CWD,CHT);hmg=hmk.getContext("2d");tmk=canv(CWD,CHT);tmg=tmk.getContext("2d");}}
  var SEC="",ISO=null,HIDECHAR=false;   /* ISO: draw only one part of a character (the pixel editor); SEC: the part being drawn */
  function px(x,y,w,h,c){if(ISO&&SEC!==ISO)return;sg.fillStyle=c;sg.fillRect(OX+x,OY+y,w,h);}
  /* a limb: a 3-pixel-wide strip from the joint along the angle, coloured in bands (cols = [[upTo, colour],...]) */
  function limb(jx,jy,a,len,cols,stripes){
    if(ISO&&SEC!==ISO)return;
    var s=Math.sin(a),c=Math.cos(a),step=0.5;
    for(var t=0;t<len;t+=step){
      var col=cols[cols.length-1][1];for(var q=0;q<cols.length;q++)if(t<cols[q][0]){col=cols[q][1];break;}
      var cx=jx-s*(t+0.5),cy=jy+c*(t+0.5);
      sg.fillStyle=col;sg.fillRect(Math.round(OX+cx-1.5),Math.round(OY+cy-0.5),3,1);
      if(Math.abs(s)>0.5)sg.fillRect(Math.round(OX+cx-0.5),Math.round(OY+cy-1.5),1,3);   /* keep sideways limbs 3 thick */
      /* stripes down a leg: [colour, from, to, side (-1 left edge, 0 middle, 1 right edge, 2 both, 3 wider: a flare)] */
      if(stripes)for(var sp=0;sp<stripes.length;sp++){var S2=stripes[sp];if(t<S2[1]||t>=S2[2])continue;sg.fillStyle=S2[0];
        if(S2[3]===3){sg.fillRect(Math.round(OX+cx-2.5),Math.round(OY+cy-0.5),5,1);continue;}
        var sides=S2[3]===2?[-1,1]:[S2[3]];sides.forEach(function(sd){sg.fillRect(Math.round(OX+cx-0.5+sd),Math.round(OY+cy-0.5),1,1);});}
    }
  }
  /* an 80s quad roller skate on a foot: white high-top boot with a hot pink stripe, a stopper, neon wheels */
  function skate(jx,jy,a,len,ice){
    if(ISO&&SEC!==ISO)return;
    var fx=Math.round(OX+jx-Math.sin(a)*len),fy=Math.round(OY+jy+Math.cos(a)*len);
    if(ice){   /* figure skates: a white boot on a silver blade */
      sg.fillStyle="#F4F1FF";sg.fillRect(fx-2,fy-3,4,4);sg.fillStyle="#C9CEE0";sg.fillRect(fx-2,fy,4,1);
      sg.fillStyle="#9AA3B8";sg.fillRect(fx-1,fy+1,1,1);sg.fillRect(fx+1,fy+1,1,1);sg.fillStyle="#E8F6FF";sg.fillRect(fx-3,fy+2,7,1);sg.fillRect(fx+4,fy+1,1,1);return;}
    sg.fillStyle="#F4F1FF";sg.fillRect(fx-2,fy-2,5,3);sg.fillStyle="#FF3DA8";sg.fillRect(fx-2,fy-1,5,1);
    sg.fillStyle="#2a2440";sg.fillRect(fx-2,fy+1,6,1);sg.fillStyle="#FF3DA8";sg.fillRect(fx-3,fy,1,1);
    sg.fillStyle="#3DF2FF";sg.fillRect(fx-2,fy+2,2,1);sg.fillStyle="#F5F23D";sg.fillRect(fx+2,fy+2,2,1);
  }
  function drawSprite(L,st){
    init();
    sg.clearRect(0,0,CWD,CHT);if(MUSED){pmg.clearRect(0,0,CWD,CHT);hmg.clearRect(0,0,CWD,CHT);MUSED=false;}
    var skin=colOf(L,"skin"),hc=colOf(L,"hair"),tc=colOf(L,"top"),bc=colOf(L,"bot");
    var tcD=shade(tc,-0.25),tcL=shade(tc,0.25),bcD=shade(bc,-0.25),skD=shade(skin,-0.18),hcD=shade(hc,-0.3),shoe="#2A2238";
    var aL=st.armL,aR=st.armR,lL=st.legL,lR=st.legR,hd=st.head||0,hy=Math.round(Math.max(0,hd)*3);   /* head: bowed forward (1) or flung back (-1) */
    SEC="hair";
    /* behind the head: afro, long hair, the hood */
    if(L.hair===5){px(-7,-19,14,9,hc);px(-6,-20,12,1,hc);px(-8,-17,1,6,hc);px(7,-17,1,6,hc);}
    if(L.hair===3){px(-6,-14,2,11,hc);px(4,-14,2,11,hc);}
    var H=L.hair,hcL=shade(hc,0.25),hb=Math.round(Math.max(0,hd)*3);
    if(H===9){px(-6,-14+hb,2,11,hc);px(4,-14+hb,2,11,hc);px(-6,-4+hb,2,1,hcD);px(4,-4+hb,2,1,hcD);}              /* bangs: long and straight behind */
    if(H===13){px(-8,-17+hb,16,11,hc);px(-9,-15+hb,1,7,hc);px(8,-15+hb,1,7,hc);px(-7,-6+hb,14,2,hc);           /* curly: a big cloud of curls */
      for(var cu=-8;cu<8;cu+=3){px(cu,-5+hb,2,1,hcD);px(cu+1,-18+hb,2,1,hc);}px(-9,-9+hb,1,2,hcD);px(8,-11+hb,1,2,hcD);}
    if(H===14){px(-7,-13+hb,2,11,hc);px(-7,-3+hb,2,1,hcD);}                                                       /* side swoop: long on one side */
    if(H===15){for(var wv=0;wv<14;wv++){var wo=(wv>>1)%2;px(-7+wo,-13+wv+hb,2,1,hc);px(5-wo,-13+wv+hb,2,1,hc);}px(-6,-13+hb,1,12,hcD);px(5,-13+hb,1,12,hcD);}   /* long waves */
    if(H===21){px(-7,-12+hb,2,9,hc);px(5,-12+hb,2,9,hc);px(-7,-4+hb,2,1,hcD);px(5,-4+hb,2,1,hcD);}              /* shoulder length */
    if(H===22){px(1,-19+hb,3,2,hc);px(3,-18+hb,3,3,hc);px(5,-16+hb,2,6,hc);px(5,-10+hb,2,3,hcD);px(6,-8+hb,1,2,hc);}   /* high ponytail, swinging out behind */
    if(H===25){px(-7,-13+hb,2,14,hc);px(5,-13+hb,2,14,hc);px(-7,1+hb,2,1,hcD);px(5,1+hb,2,1,hcD);}   /* long locks: long behind */
    if(H===28){px(-7,-14+hb,14,6,hc);}   /* fluffy mop: volume behind the head */
    if(H===11){px(-9,-13+hb,3,7,hc);px(6,-13+hb,3,7,hc);px(-9,-6+hb,2,2,hcD);px(7,-6+hb,2,2,hcD);}             /* pigtails */
    if(L.top===2){px(-6,-14,12,2,tcD);px(-7,-12,2,7,tcD);px(5,-12,2,7,tcD);}
    /* legs */
    /* shoes: the colour, and how far up the leg they come (boots higher) */
    var SH=[["#2A2238",5],["#EDEDF5",5],["#E8505B",5],["#5A3A22",3.8],["#EDEDF5",4.2],["#111018",5.3],[skin,5.6],["#7A2A3A",5],["#F5D03C",3.8],["#111018",4.8]][L.shoes|0]||["#2A2238",5];
    shoe=SH[0];var sf=SH[1],B=L.bottom|0,bc2=CLOTH[((L.botCol|0)+4)%CLOTH.length],den=shade(bc,-0.35);
    function legsFor(side){   /* the colours down one leg, top to bottom */
      var top=side<0||B!==6?bc:bc2;
      if(B===1)return [[2.5,bc],[sf,skin],[7,shoe]];
      if(B===2||B===5||B===12)return [[sf,skin],[7,shoe]];
      if(B===8)return [[2.6,skin],[sf,"#EDEDF5"],[7,shoe]];
      if(B===10)return [[2,bc],[2.8,skin],[sf,bc],[7,shoe]];
      if(B===11)return [[2.5,bc],[sf,"#26222F"],[7,shoe]];
      return [[sf,top],[7,shoe]];
    }
    var legStripes={3:[["#EDEDF5",0,sf,1]],7:[[den,1.5,3,1]],9:[[bc,sf-1.2,sf,3]]}[B]||null;
    if(L.shoes===6)legStripes=(legStripes||[]).concat([["#8a5a2a",sf,sf+0.6,3]]);   /* sandal straps */
    if(L.shoes===4)legStripes=(legStripes||[]).concat([[CLOTH[L.topCol|0]||"#E8505B",sf,sf+0.6,3]]);   /* high-tops: a coloured band */
    var legColsL=legsFor(-1),legColsR=legsFor(1);
    /* a leg can be drawn shorter: the knee coming up, the foot lifting off the floor mid-step */
    function legC(cols,n){return cols.map(function(c){return [c[0]*n/7,c[1]];});}
    function strC(n){return legStripes?legStripes.map(function(q){return [q[0],q[1]*n/7,q[2]*n/7,q[3]];}):null;}
    var gL=Math.max(3,Math.min(7,st.legLenL||7)),gR=Math.max(3,Math.min(7,st.legLenR||7));
    SEC="legL";limb(-2.5,4,lL,gL,legC(legColsL,gL),strC(gL));SEC="legR";limb(2.5,4,lR,gR,legC(legColsR,gR),strC(gR));
    if(st.skates){var ic=st.skates==="ice";SEC="legL";skate(-2.5,4,lL,gL,ic);SEC="legR";skate(2.5,4,lR,gR,ic);}
    SEC="top";
    /* torso */
    px(-5,-5,10,10,tc);
    if(L.top===4){for(var r=-4;r<5;r+=3)px(-5,r,10,1,tcL);}
    if(L.top===3){px(-1,-5,2,10,"#EDEDF5");px(-2,-5,1,10,tcD);px(1,-5,1,10,tcD);}
    if(L.top===2){px(-3,1,6,2,tcD);}
    if(L.top===1){px(-5,-5,2,1,skin);px(3,-5,2,1,skin);px(-2,-5,4,1,skin);}
    px(4,-5,1,10,tcD);px(-5,4,10,1,tcD);                                   /* shading */
    if(L.top===0||L.top===4)px(-5,-5,10,1,tcL);
    var T=L.top|0,WH="#EDEDF5",BLK="#15121F",GOLD="#E0B850",dark=rgb(tc)[0]+rgb(tc)[1]+rgb(tc)[2]<250;
    if(T===5){px(-2,-5,4,6,WH);px(0,-4,1,5,dark?"#E8505B":BLK);px(-2,-5,1,5,tcD);px(1,-5,1,5,tcD);px(-1,2,1,1,tcD);px(-1,0,1,1,tcD);}   /* suit: shirt, tie, lapels */
    if(T===6){px(-5,-5,10,10,WH);px(-5,-3,4,8,tc);px(1,-3,4,8,tc);px(-1,-5,2,2,WH);px(-2,-1,1,1,GOLD);px(-2,1,1,1,GOLD);px(4,-3,1,8,tcD);}   /* waistcoat over a shirt */
    if(T===7){px(-5,-1,10,1,"#E8E8F0");px(-5,2,10,1,"#E8E8F0");px(-3,-5,1,4,"#E8E8F0");px(2,-5,1,4,"#E8E8F0");}   /* hi-vis: reflective stripes */
    if(T===8){px(0,-5,1,10,tcL);for(var jb=-4;jb<4;jb+=2)px(0,jb,1,1,WH);px(-5,-5,10,1,WH);px(-3,-2,2,3,WH);px(2,-2,2,3,WH);}   /* baseball jersey: buttons, number */
    if(T===9){px(-5,-5,10,10,WH);px(-3,-5,6,1,"#D8D8E4");for(var cb=-3;cb<3;cb+=2){px(-2,cb,1,1,BLK);px(1,cb,1,1,BLK);}px(4,-5,1,10,"#C8C8D8");}   /* chef coat */
    if(T===10){px(-5,-5,10,10,WH);px(-1,-5,2,10,tc);px(-2,-5,1,10,"#C8C8D8");px(1,-5,1,10,"#C8C8D8");px(-4,0,2,1,"#C8C8D8");px(-6,4,4,4,WH);px(2,4,4,4,WH);px(-6,7,4,1,"#C8C8D8");px(2,7,4,1,"#C8C8D8");}   /* lab coat, long */
    if(T===11){px(-5,-5,3,2,tcD);px(2,-5,3,2,tcD);for(var zz=0;zz<9;zz++)px(-1+Math.round(zz*0.25),-4+zz,1,1,"#C8C8D8");px(-4,1,2,1,tcL);}   /* leather jacket: collar, zip */
    if(T===12){px(-2,-5,4,9,WH);px(-2,-4,4,1,BLK);px(-1,-5,2,2,BLK);px(-3,-5,1,7,tcD);px(2,-5,1,7,tcD);px(-1,0,1,1,BLK);px(-1,2,1,1,BLK);}   /* tuxedo: bow tie */
    if(T===13){px(-3,-5,2,1,tcL);px(1,-5,2,1,tcL);px(0,-4,1,2,tcD);}   /* polo collar */
    if(T===14){px(-1,-5,2,9,tcD);for(var lc=-4;lc<4;lc+=2)px(-1,lc,2,1,GOLD);px(-5,3,10,1,"#5A3A22");px(-1,3,2,1,GOLD);}   /* doublet: laced, belted */
    if(T===15){for(var rw=0;rw<9;rw++)px(-5+Math.round(rw*0.6),-5+rw,2,1,tcL);px(-5,0,10,2,CLOTH[((L.topCol|0)+6)%CLOTH.length]);}   /* robe: wrapped, a sash */
    if(T===16){px(-3,-5,6,1,tcD);px(-3,-5,6,1,tcL);}   /* turtleneck */
    if(T===17){for(var fl=-5;fl<5;fl+=3)px(fl,-5,1,10,tcD);for(var fr2=-4;fr2<5;fr2+=3)px(-5,fr2,10,1,tcD);px(-1,-5,2,10,WH);}   /* flannel, open over a tee */
    if(T===18){px(-2,-3,4,3,WH);px(-1,0,2,1,WH);px(-2,-2,1,1,BLK);px(1,-2,1,1,BLK);}   /* band tee: a skull */
    if(T===19){px(-3,-3,2,2,GOLD);px(1,-3,3,1,tcD);px(-5,-5,2,1,tcL);px(3,-5,2,1,tcL);px(-5,3,10,1,BLK);px(-1,3,2,1,GOLD);}   /* uniform: badge, epaulettes, belt */
    if(T===20){px(-5,1,10,4,skin);px(4,1,1,4,skD);px(-1,2,1,1,skD);}   /* crop top: the midriff */
    SEC="bottom";
    /* bottoms: the waistband, or a skirt */
    if(L.bottom===2){px(-6,4,12,3,bc);px(-6,6,12,1,bcD);}
    else if(L.bottom===5){px(-6,4,12,4,bc);px(-7,7,14,3,bc);px(-7,9,14,1,bcD);px(4,4,2,6,bcD);}   /* long dress, down past the knees */
    else if(L.bottom===8){px(-6,4,12,3,bc);for(var kt=-5;kt<6;kt+=3)px(kt,4,1,3,bcD);px(-6,5,12,1,bcD);}   /* kilt: plaid */
    else if(L.bottom===12){px(-6,4,12,2,bc);px(-6,5,12,1,bcD);}   /* mini skirt */
    else px(-5,4,10,1,bcD);
    if(L.bottom===4){px(-3,-2,6,6,bc);px(-4,-5,1,4,bc);px(3,-5,1,4,bc);px(-3,-1,1,1,GOLD);px(2,-1,1,1,GOLD);px(-1,0,2,2,bcD);}   /* overalls: the bib and straps */
    /* arms */
    var SHORT={0:1,4:1,7:1,8:1,13:1,18:1,20:1};
    var sleeve=L.top===1?0:SHORT[T]?3:7.5,armTop=L.top===3?tcD:T===6||T===9||T===10?WH:T===7?"#5A5670":T===12?tc:tc;
    /* an arm can be drawn shorter: reaching toward you (holding an instrument up to the mouth) */
    function armC(n){return sleeve?[[Math.min(sleeve,n-2)*n/9+0.01,armTop],[n,skin]]:[[n,skin]];}
    var nL=Math.max(3,Math.min(9,st.lenL||9)),nR=Math.max(3,Math.min(9,st.lenR||9));
    SEC="armL";limb(-6.5,-4.5,aL,nL,armC(nL));SEC="armR";limb(6.5,-4.5,aR,nR,armC(nR));
    SEC="head";
    /* head */
    px(-5,-14+hy,10,9,skin);px(4,-14+hy,1,9,skD);px(-5,-6+hy,10,1,skD);
    /* face: eyes, and an open mouth when singing or hitting a step */
    px(-3,-11+hy,1,2,"#15121F");px(2,-11+hy,1,2,"#15121F");
    if(st.mouth)px(-1,-8+hy,2,2,"#5A2A2A");else px(-1,-8+hy,2,1,skD);
    SEC="hair";
    /* hair */
    var hair=L.hair;
    if(hair===1||hair===2||hair===3||hair===6){px(-5,-15+hy,10,3,hc);px(-5,-12+hy,1,2,hc);px(4,-12+hy,1,2,hc);px(-5,-15+hy,10,1,hcD);}
    if(hair===2){for(var sx=-5;sx<5;sx+=2)px(sx,-17+hy,1,2,hc);px(-4,-16+hy,8,1,hc);}
    if(hair===4){px(-1,-19+hy,2,5,hc);px(-1,-19+hy,1,5,hcD);}
    if(hair===5){px(-6,-16+hy,12,3,hc);}
    if(hair===6){px(5,-13+hy,2,6,hc);px(5,-7+hy,2,1,hcD);}
    if(hair===7){px(-6,-17+hy,12,4,hc);px(-6,-14+hy,12,1,shade(hc,0.35));px(-5,-18+hy,10,1,hc);px(-1,-19+hy,2,1,shade(hc,0.35));}
    /* the newer styles: the top of the head (and anything over the face) */
    function cap(){px(-5,-15+hy,10,3,hc);px(-5,-12+hy,1,2,hc);px(4,-12+hy,1,2,hc);px(-5,-15+hy,10,1,hcD);}
    var RIB="#E8505B";
    if(hair===8){px(-4,-17+hy,8,1,hc);px(-5,-16+hy,10,3,hc);px(-6,-15+hy,2,9,hc);px(4,-15+hy,2,9,hc);px(-4,-13+hy,4,1,hc);px(-6,-7+hy,2,1,hcD);px(4,-7+hy,2,1,hcD);px(-3,-16+hy,4,1,hcL);}   /* bob */
    if(hair===9){cap();px(-5,-13+hy,10,2,hc);px(-6,-14+hy,1,9,hc);px(5,-14+hy,1,9,hc);px(-5,-12+hy,10,1,hcD);px(-3,-15+hy,3,1,hcL);}   /* bangs: a straight fringe */
    if(hair===10){px(-5,-15+hy,10,2,hc);px(-5,-15+hy,10,1,hcD);px(-5,-13+hy,1,1,hc);px(4,-13+hy,1,1,hc);px(-3,-18+hy,6,3,hc);px(-2,-19+hy,4,1,hc);px(-1,-19+hy,2,1,hcL);px(-3,-16+hy,6,1,hcD);}   /* bun on top */
    if(hair===11){cap();px(-4,-13+hy,8,1,hc);px(-7,-13+hy,1,1,RIB);px(6,-13+hy,1,1,RIB);}   /* pigtails: the ties */
    if(hair===12){cap();px(-5,-13+hy,5,1,hc);px(4,-13+hy,2,3,hc);for(var bk=0;bk<6;bk++)px(4+(bk%2),-10+bk*2+hy,2,2,bk%2?hcD:hc);px(4,2+hy,2,1,RIB);px(4,3+hy,2,1,hc);}   /* a braid over the shoulder */
    if(hair===13){px(-6,-17+hy,12,3,hc);px(-6,-14+hy,2,3,hc);px(4,-14+hy,2,3,hc);px(-4,-14+hy,2,1,hc);px(1,-14+hy,3,1,hc);for(var ck=-5;ck<6;ck+=3)px(ck,-16+hy,1,1,hcD);}   /* curly: curls over the forehead */
    if(hair===14){cap();px(-5,-14+hy,6,2,hc);px(-5,-12+hy,4,2,hc);px(-6,-14+hy,1,9,hc);px(1,-15+hy,3,1,hcL);px(-5,-11+hy,3,1,hcD);}   /* side swoop over one eye */
    if(hair===15){cap();px(-1,-15+hy,1,1,shade(hc,-0.45));px(-6,-13+hy,1,6,hc);px(5,-13+hy,1,6,hc);px(-4,-15+hy,2,1,hcL);}   /* long waves: parted */
    if(hair===16){px(-5,-15+hy,10,2,hc);px(-5,-15+hy,10,1,hcD);px(-5,-13+hy,6,1,hc);px(-5,-12+hy,3,1,hc);px(4,-13+hy,1,2,hc);px(1,-16+hy,3,1,hc);}   /* pixie */
    if(hair===17){var bz=shade(hc,-0.1);px(-5,-15+hy,10,2,bz);for(var bx2=-5;bx2<5;bx2+=2)px(bx2,-14+hy,1,1,hcL);px(-5,-13+hy,1,1,bz);px(4,-13+hy,1,1,bz);}   /* buzz cut */
    if(hair===18){px(-5,-17+hy,10,1,hc);px(-6,-16+hy,12,4,hc);px(-6,-12+hy,1,3,hc);px(5,-12+hy,1,3,hc);px(-6,-13+hy,12,1,hcD);px(-3,-16+hy,4,1,hcL);}   /* bowl cut */
    if(hair===19){cap();px(-4,-17+hy,7,2,hc);px(-2,-18+hy,5,1,hc);px(2,-17+hy,3,1,hcL);px(-1,-18+hy,2,1,hcL);}   /* quiff, swept up and back */
    if(hair===20){cap();px(-5,-17+hy,1,2,hc);px(-3,-18+hy,2,3,hc);px(0,-17+hy,2,2,hc);px(3,-18+hy,1,3,hc);px(-4,-13+hy,1,2,hc);px(-1,-13+hy,2,2,hc);px(2,-13+hy,1,1,hc);px(-6,-13+hy,1,4,hc);px(5,-13+hy,1,4,hc);}   /* messy */
    if(hair===21){cap();px(-1,-15+hy,1,2,shade(hc,-0.45));px(-6,-13+hy,2,8,hc);px(4,-13+hy,2,8,hc);}   /* shoulder length, centre part */
    if(hair===22){px(-5,-15+hy,10,2,hc);px(-5,-15+hy,10,1,hcD);px(-5,-13+hy,1,1,hc);px(4,-13+hy,1,1,hc);px(1,-17+hy,2,2,hc);px(1,-17+hy,2,1,RIB);}   /* high ponytail: pulled back, tied at the crown */
    if(hair===23){   /* flame spikes: swept straight up in a tall flame, a sharp widow's peak */
      px(-5,-15+hy,10,2,hc);px(-5,-13+hy,1,2,hc);px(4,-13+hy,1,2,hc);px(-1,-13+hy,2,1,hc);px(-6,-18+hy,2,4,hc);px(-4,-21+hy,2,7,hc);px(-2,-23+hy,2,9,hc);px(0,-23+hy,2,9,hc);px(2,-21+hy,2,7,hc);px(4,-18+hy,2,4,hc);
      px(-7,-17+hy,1,2,hc);px(6,-17+hy,1,2,hc);px(-3,-20+hy,1,5,hcD);px(1,-22+hy,1,7,hcD);px(3,-19+hy,1,4,hcD);px(-1,-22+hy,1,3,hcL);px(-5,-15+hy,10,1,hcD);}
    if(hair===24){   /* widow's peak: shorter spikes swept back */
      px(-5,-17+hy,10,4,hc);px(-5,-13+hy,1,2,hc);px(4,-13+hy,1,2,hc);px(-1,-13+hy,2,1,hc);px(-2,-12+hy,1,0,hc);
      for(var wp=-5;wp<5;wp+=2)px(wp,-19+hy+((wp+5)%4?1:0),1,2,hc);px(-6,-16+hy,1,2,hc);px(5,-16+hy,1,2,hc);px(-3,-17+hy,6,1,hcL);px(-5,-14+hy,10,1,hcD);}
    if(hair===25){   /* long locks: a full fringe, locks down each side of the face, long behind */
      cap();px(-5,-13+hy,10,2,hc);px(-3,-12+hy,1,1,skin);px(1,-12+hy,1,1,skin);px(-6,-13+hy,1,11,hc);px(5,-13+hy,1,11,hc);px(-6,-3+hy,1,1,hcD);px(5,-3+hy,1,1,hcD);px(-2,-15+hy,3,1,hcL);}
    if(hair===26){px(-4,-17+hy,8,1,hc);px(-5,-16+hy,10,3,hc);px(-6,-15+hy,2,9,hc);px(4,-15+hy,2,9,hc);px(-5,-13+hy,10,1,hc);px(-6,-7+hy,2,1,hcD);px(4,-7+hy,2,1,hcD);px(-5,-15+hy,10,1,"#E8505B");px(-6,-14+hy,1,1,"#E8505B");px(5,-14+hy,1,1,"#E8505B");}   /* bob with a headband */
    if(hair===27){cap();px(-4,-17+hy,2,2,hc);px(0,-17+hy,2,2,hc);px(3,-16+hy,2,1,hc);px(-4,-13+hy,3,1,hc);px(1,-13+hy,2,1,hc);px(-9,-15+hy,4,4,hc);px(-10,-12+hy,2,5,hc);px(-9,-8+hy,1,2,hcD);px(-6,-14+hy,1,1,"#E8505B");}   /* messy side tail */
    if(hair===28){   /* fluffy mop: big messy volume, strands falling over the eyes */
      px(-7,-18+hy,14,5,hc);px(-6,-19+hy,4,1,hc);px(1,-19+hy,4,1,hc);px(-8,-17+hy,1,3,hc);px(7,-16+hy,1,3,hc);px(-9,-15+hy,1,1,hc);px(8,-14+hy,1,1,hc);
      px(-7,-13+hy,2,5,hc);px(5,-13+hy,2,5,hc);px(-4,-13+hy,2,2,hc);px(-4,-11+hy,1,1,hc);px(-1,-13+hy,2,2,hc);px(2,-13+hy,2,1,hc);px(3,-12+hy,1,2,hc);
      px(-5,-17+hy,1,2,hcD);px(0,-18+hy,1,3,hcD);px(4,-17+hy,1,2,hcD);px(-3,-18+hy,2,1,hcL);}
    if(hair===29){px(-5,-16+hy,10,3,hc);px(-6,-17+hy,2,2,hc);px(-3,-18+hy,2,2,hc);px(1,-18+hy,2,2,hc);px(4,-17+hy,2,2,hc);px(-6,-14+hy,1,3,hc);px(5,-14+hy,1,3,hc);px(-4,-13+hy,2,1,hc);px(1,-13+hy,1,1,hc);px(3,-13+hy,1,2,hc);px(-2,-16+hy,1,1,hcD);px(2,-16+hy,1,1,hcD);}   /* wild crop: short and sticking out every way */
    /* headbanging: bowed right down, the hair hangs over the face; flung back up, it flies */
    if(hd>0.55&&hair!==0&&hair!==4&&hair!==17){px(-5,-13+hy,10,6,hc);px(-6,-12+hy,1,6,hc);px(5,-12+hy,1,6,hc);px(-5,-7+hy,10,1,hcD);}
    if(hd<-0.3&&hair!==0){px(-5,-19,2,3,hc);px(-1,-20,2,4,hc);px(3,-19,2,3,hc);px(-7,-17,2,2,hc);px(5,-17,2,2,hc);}
    SEC="extra";
    /* extras */
    var ex=L.extra;
    if(ex===1){px(-4,-11+hy,8,2,"#111018");px(-4,-11+hy,3,1,"#3a3650");}
    if(ex===2){px(-6,-16+hy,12,1,"#2A2238");px(-7,-12+hy,2,4,"#2A2238");px(5,-12+hy,2,4,"#2A2238");px(-7,-11+hy,1,2,"#E8505B");px(6,-11+hy,1,2,"#E8505B");}
    if(ex===3){px(-5,-17+hy,10,3,"#E8505B");px(-5,-14+hy,10,1,"#B83A44");px(-8,-14+hy,4,1,"#B83A44");}
    if(ex===4){px(-5,-14+hy,10,2,"#D354A0");px(-6,-13+hy,1,3,"#D354A0");}
    SEC="face";
    /* face */
    var fc=L.face|0,whisk=hair===0?"#3a2a22":hcD;
    if(fc===1||fc===2||fc===3)px(-2,-9+hy,4,1,whisk);                                           /* moustache */
    if(fc===2){px(-5,-10+hy,1,4,whisk);px(4,-10+hy,1,4,whisk);px(-4,-7+hy,8,2,whisk);px(-1,-8+hy,2,1,st.mouth?"#5A2A2A":skD);}   /* beard */
    if(fc===3)px(-1,-7+hy,2,2,whisk);                                                          /* goatee */
    if(fc===4||fc===5){var gc=fc===5?GOLD:"#26222F",lens="rgba(190,230,255,.55)";   /* glasses: two frames with the eyes showing through (round: the corners off) */
      [[-5,-3],[0,2]].forEach(function(gg){var gx=gg[0];px(gx+1,-11+hy,3,2,lens);px(gx,-12+hy,5,1,gc);px(gx,-9+hy,5,1,gc);px(gx,-12+hy,1,4,gc);px(gx+4,-12+hy,1,4,gc);px(gg[1],-11+hy,1,2,"#15121F");
        px(gx,-12+hy,1,1,skin);px(gx+4,-12+hy,1,1,skin);px(gx,-9+hy,1,1,skin);px(gx+4,-9+hy,1,1,skin);
        if(fc===4){px(gx+1,-9+hy,3,1,skin);px(gx,-11+hy,1,2,gc);px(gx+4,-11+hy,1,2,gc);}});}   /* plain glasses: the frame just round the top and sides */
    if(fc===6){px(1,-12+hy,3,3,"#111018");px(-5,-13+hy,10,1,"#111018");}                     /* eye patch */
    if(fc===7){px(-4,-9+hy,1,1,"#B06A40");px(-3,-8+hy,1,1,"#B06A40");px(2,-9+hy,1,1,"#B06A40");px(3,-8+hy,1,1,"#B06A40");}   /* freckles */
    if(fc===8){px(-4,-9+hy,2,1,"#F08AA0");px(2,-9+hy,2,1,"#F08AA0");}                         /* blush */
    if(fc===9){var sb2=shade(skin,-0.3);for(var sx2=-4;sx2<4;sx2+=2){px(sx2,-7+hy,1,1,sb2);px(sx2+1,-6+hy,1,1,sb2);}px(-5,-9+hy,1,1,sb2);px(4,-9+hy,1,1,sb2);}   /* stubble */
    SEC="hat";
    /* hats */
    var ht=L.hat|0;
    if(ht===1){px(-6,-17+hy,12,3,"#F5D03C");px(-7,-14+hy,14,1,"#D8B020");px(-1,-18+hy,2,1,"#F5D03C");px(-4,-17+hy,2,1,"#FFF2A0");}   /* hard hat */
    if(ht===2){px(-5,-15+hy,10,2,WH);px(-6,-21+hy,12,6,WH);px(-6,-21+hy,1,6,"#D8D8E4");px(-3,-20+hy,1,5,"#D8D8E4");px(1,-20+hy,1,5,"#D8D8E4");}   /* chef hat */
    if(ht===3){px(-6,-18+hy,12,4,"#D8303A");px(-8,-14+hy,16,1,"#A0202A");px(-2,-17+hy,4,2,GOLD);px(-1,-19+hy,2,1,"#D8303A");}   /* fire helmet */
    if(ht===4){px(-6,-17+hy,12,3,"#22304A");px(-6,-15+hy,12,1,WH);for(var ch2=-6;ch2<6;ch2+=2)px(ch2,-15+hy,1,1,BLK);px(-6,-14+hy,10,1,BLK);px(-1,-17+hy,2,1,GOLD);}   /* police cap */
    if(ht===5){px(-4,-21+hy,8,7,BLK);px(-7,-14+hy,14,1,BLK);px(-4,-16+hy,8,1,"#8A2030");px(-3,-21+hy,1,5,"#33303f");}   /* top hat */
    if(ht===6){px(-4,-18+hy,8,4,"#8A5A2A");px(-9,-14+hy,18,1,"#6A4018");px(-8,-15+hy,2,1,"#6A4018");px(6,-15+hy,2,1,"#6A4018");px(-4,-15+hy,8,1,"#5A3A22");px(-1,-18+hy,2,1,"#6A4018");}   /* cowboy hat */
    if(ht===7){px(-7,-14+hy,14,1,"#5B3FA0");px(-5,-16+hy,10,2,"#6B4FB0");px(-4,-18+hy,7,2,"#6B4FB0");px(-2,-20+hy,4,2,"#6B4FB0");px(0,-22+hy,2,2,"#6B4FB0");px(-3,-17+hy,1,1,GOLD);px(1,-19+hy,1,1,GOLD);}   /* wizard hat */
    if(ht===8){px(-5,-16+hy,10,2,GOLD);px(-5,-18+hy,1,2,GOLD);px(-2,-18+hy,1,2,GOLD);px(1,-18+hy,1,2,GOLD);px(4,-18+hy,1,2,GOLD);px(-1,-16+hy,2,1,"#E8505B");px(-4,-16+hy,1,1,"#4A9BE8");px(3,-16+hy,1,1,"#4CC38A");}   /* crown */
    if(ht===9){px(-6,-17+hy,11,3,"#C83040");px(-4,-18+hy,7,1,"#C83040");px(3,-18+hy,1,1,"#C83040");px(-6,-15+hy,11,1,"#A02030");}   /* beret */
    if(ht===10){px(-6,-17+hy,12,3,"#3A7A3A");px(-7,-14+hy,14,1,"#2A5A2A");px(3,-21+hy,1,5,"#E8505B");px(4,-22+hy,1,3,"#F08080");px(2,-20+hy,1,2,"#E8505B");}   /* feathered cap */
    if(ht===11){var hd2="#6A4A30";px(-6,-16+hy,12,2,hd2);px(-7,-14+hy,2,9,hd2);px(5,-14+hy,2,9,hd2);px(-6,-15+hy,12,1,shade(hd2,0.2));px(-5,-5+hy,10,1,hd2);}   /* hood */
    if(ht===13){px(-6,-15+hy,12,1,"#3a3650");px(-5,-17+hy,4,3,"#C8C8D8");px(1,-17+hy,4,3,"#C8C8D8");px(-4,-16+hy,2,1,"#6FE0C0");px(2,-16+hy,2,1,"#6FE0C0");px(-1,-16+hy,2,1,"#3a3650");}   /* goggles pushed up on the head */
    if(ht===12){px(-6,-17+hy,12,9,"#D8303A");px(-6,-12+hy,12,1,BLK);px(-5,-12+hy,10,3,"#3a3a5a");px(-4,-12+hy,3,1,"#8AC8FF");px(-6,-17+hy,12,1,WH);px(-1,-17+hy,2,5,WH);}   /* racing helmet: the visor down */
    /* pixels painted in the Graphics lab, by part, before the outline goes round them */
    paintLayer("hair:"+(L.hair|0),OX,OY+hy);paintLayer("hat:"+(L.hat|0),OX,OY+hy);paintLayer("face:"+(L.face|0),OX,OY+hy);paintLayer("extra:"+(L.extra|0),OX,OY+hy);
    paintLayer("top:"+(L.top|0),OX,OY);paintLayer("bottom:"+(L.bottom|0),OX,OY);
    paintLayer("armL",Math.round(OX-6.5),Math.round(OY-4.5),aL);paintLayer("armR",Math.round(OX+6.5),Math.round(OY-4.5),aR);
    paintLayer("legL",Math.round(OX-2.5),OY+4,lL);paintLayer("legR",Math.round(OX+2.5),OY+4,lR);
    /* outline: a dark silhouette one pixel out all round, under the colours */
    og.globalCompositeOperation="source-over";og.clearRect(0,0,CWD,CHT);
    var osrc=spr;if(MUSED){tmg.globalCompositeOperation="source-over";tmg.clearRect(0,0,CWD,CHT);tmg.drawImage(spr,0,0);tmg.globalCompositeOperation="destination-out";tmg.drawImage(pmk,0,0);tmg.globalCompositeOperation="source-over";osrc=tmk;}   /* painted pixels get no automatic outline */
    og.drawImage(osrc,-1,0);og.drawImage(osrc,1,0);og.drawImage(osrc,0,-1);og.drawImage(osrc,0,1);
    og.globalCompositeOperation="source-in";og.fillStyle="#120D1E";og.fillRect(0,0,CWD,CHT);
    if(MUSED){og.globalCompositeOperation="destination-out";og.drawImage(hmk,0,0);}   /* and erased pixels stay erased, even where the outline would go */
    og.globalCompositeOperation="source-over";og.drawImage(spr,0,0);
    if(NEON){   /* neon: just the edges, in a bright tube colour, the body a faint glow inside */
      og.clearRect(0,0,CWD,CHT);og.globalCompositeOperation="source-over";
      og.drawImage(spr,-1,0);og.drawImage(spr,1,0);og.drawImage(spr,0,-1);og.drawImage(spr,0,1);
      og.globalCompositeOperation="destination-out";og.drawImage(spr,0,0);
      og.globalCompositeOperation="source-in";og.fillStyle=neonCol(L);og.fillRect(0,0,CWD,CHT);
      og.globalCompositeOperation="destination-over";og.globalAlpha=0.16;og.drawImage(spr,0,0);og.globalAlpha=1;
      og.globalCompositeOperation="source-over";
      var nh=Math.round(Math.max(0,st.head||0)*3);og.fillStyle="#FFFFFF";og.fillRect(OX-3,OY-11+nh,1,2);og.fillRect(OX+2,OY-11+nh,1,2);   /* the eyes still show */
    }
    return out;
  }
  function neonCol(L){return shade(topColor(L),0.45);}
  /* draw a character with its body centre at (x,y), each art pixel p screen pixels big.
     st: {armL, armR, legL, legR, bob (screen px, negative is up), mouth} */
  function drawChar(g,x,y,p,L,st){
    if(HIDECHAR)return;st=st||{};if(!L)L=random(7);
    var s={armL:st.armL!==undefined?st.armL:0.15,armR:st.armR!==undefined?st.armR:-0.15,legL:st.legL||0,legR:st.legR||0,mouth:!!st.mouth,lenL:st.lenL,lenR:st.lenR,legLenL:st.legLenL,legLenR:st.legLenR,head:st.head||0,skates:st.skates==="ice"?"ice":!!st.skates};
    var c=drawSprite(L,s),q=Math.max(1,p),bob=Math.round((st.bob||0)/q)*q,dx=Math.round((st.dx||0)/q)*q;
    var was=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;
    if(NEON){g.save();g.shadowColor=neonCol(L);g.shadowBlur=6*q;}
    if(st.rot){
      /* the whole body turned (the worm: lying on the floor), resting on the floor rather than floating */
      g.save();g.translate(Math.round(x+dx),Math.round(y+8*q*Math.abs(Math.sin(st.rot))+bob));g.rotate(st.rot);
      g.drawImage(c,-OX*q,-OY*q,CWD*q,CHT*q);g.restore();
    }else if(st.sx!==undefined&&st.sx!==1){   /* turning round on the spot: squeezed sideways about the body centre */
      g.save();g.translate(Math.round(x+dx),0);g.scale(st.sx,1);g.drawImage(c,Math.round(-OX*q),Math.round(y-OY*q+bob),CWD*q,CHT*q);g.restore();
    }else g.drawImage(c,Math.round(x+dx-OX*q),Math.round(y-OY*q+bob),CWD*q,CHT*q);
    if(NEON)g.restore();
    g.imageSmoothingEnabled=was;
    if(st.prop)handProp(g,x,y,q,dx,bob,s,st);
  }
  /* something held up in the right hand: a lit lighter or a phone torch, with a warm (or white) glow round it */
  function handProp(g,x,y,q,dx,bob,s,st){
    var nR=Math.max(3,Math.min(9,s.lenR||9)),hx=6.5-Math.sin(s.armR)*nR,hy=-4.5+Math.cos(s.armR)*nR,t=(st.now||Date.now())/1000;
    g.save();
    if(st.rot){g.translate(Math.round(x+dx),Math.round(y+8*q*Math.abs(Math.sin(st.rot))+bob));g.rotate(st.rot);}else g.translate(Math.round(x+dx),Math.round(y+bob));
    var X=hx*q,Y=hy*q,fl=0.75+0.25*Math.sin(t*23+x)*Math.sin(t*9.7);
    if(st.prop==="glowstick"){
      var gc2=st.propCol||["#3DF2FF","#FF3DA8","#F5F23D","#4CFF8A"][Math.abs(Math.round(x))%4],ga=s.armR+Math.PI;
      g.save();g.translate(X,Y);g.rotate(-ga*0.2);g.shadowColor=gc2;g.shadowBlur=q*6;g.fillStyle=gc2;g.fillRect(Math.round(-q),Math.round(-q*7),q*2,q*7);
      g.shadowBlur=0;g.fillStyle="rgba(255,255,255,.75)";g.fillRect(Math.round(-q*0.5),Math.round(-q*6.5),q,q*6);g.restore();
      g.globalCompositeOperation="lighter";var gg=g.createRadialGradient(X,Y-q*4,0,X,Y-q*4,q*12);gg.addColorStop(0,gc2+"55");gg.addColorStop(1,gc2+"00");g.fillStyle=gg;g.fillRect(X-q*12,Y-q*16,q*24,q*24);
    }else if(st.prop==="phone"){
      g.globalCompositeOperation="lighter";var gr=g.createRadialGradient(X,Y-q*3,0,X,Y-q*3,q*16);gr.addColorStop(0,"rgba(230,240,255,.55)");gr.addColorStop(1,"rgba(230,240,255,0)");g.fillStyle=gr;g.fillRect(X-q*16,Y-q*19,q*32,q*32);
      g.globalCompositeOperation="source-over";g.fillStyle="#15121F";g.fillRect(Math.round(X-q*1.5),Math.round(Y-q*5),q*3,q*5);g.fillStyle="#EEF4FF";g.fillRect(Math.round(X-q),Math.round(Y-q*4.5),q*2,q*3.5);
    }else{
      g.fillStyle="#C9CEE0";g.fillRect(Math.round(X-q),Math.round(Y-q*2),q*2,q);g.fillStyle="#E8505B";g.fillRect(Math.round(X-q),Math.round(Y-q),q*2,q*2);
      var fh=Math.max(2,Math.round(3*fl));g.fillStyle="#FF8A1E";g.fillRect(Math.round(X-q),Math.round(Y-q*(2+fh)),q*2,q*fh);g.fillStyle="#FFE45C";g.fillRect(Math.round(X-q*0.5),Math.round(Y-q*(1.5+fh*0.6)),q,Math.max(q,q*fh*0.5));
      g.globalCompositeOperation="lighter";var gw=g.createRadialGradient(X,Y-q*4,0,X,Y-q*4,q*(10+fl*3));gw.addColorStop(0,"rgba(255,170,60,"+(0.45*fl)+")");gw.addColorStop(1,"rgba(255,140,40,0)");g.fillStyle=gw;g.fillRect(X-q*14,Y-q*18,q*28,q*28);
    }
    g.restore();
  }


  /* ---------------- the roller rink (the skate round) ----------------
     An 80s rink laid over the floor: a glossy maple oval with neon pink and cyan rails, a carpeted island in the
     middle where the performer plays, a mirror ball's spots sliding across it all.
     G = {cx, cy, rx, ry, ix, iy}: the oval's centre and radii and the island's radii, in screen pixels. */
  function rink(g,G,now,k,ice){
    if(!G)return;k=k===undefined?1:k;if(k<=0.01)return;
    if(ice)return iceRink(g,G,now,k);
    g.save();g.globalAlpha=k;
    /* carpet outside the rail: dark, with an 80s squiggle and triangle pattern */
    g.save();g.beginPath();g.rect(G.cx-G.rx-60,G.cy-G.ry-30,G.rx*2+120,G.ry*2+60);g.ellipse(G.cx,G.cy,G.rx,G.ry,0,0,6.2832,true);g.clip("evenodd");
    g.fillStyle="#140a28";g.fillRect(G.cx-G.rx-60,G.cy-G.ry-30,G.rx*2+120,G.ry*2+60);
    for(var i=0;i<46;i++){var px=G.cx-G.rx-50+((i*97)%Math.max(40,(G.rx*2+100))),py=G.cy-G.ry-20+((i*53)%Math.max(30,(G.ry*2+40)));
      g.strokeStyle=["#FF3DA8","#3DF2FF","#F5F23D","#8A5CFF"][i%4];g.globalAlpha=k*0.45;g.lineWidth=2;
      if(i%2){g.beginPath();g.moveTo(px,py);g.lineTo(px+8,py-6);g.lineTo(px+16,py);g.lineTo(px+24,py-6);g.stroke();}
      else{g.beginPath();g.moveTo(px,py);g.lineTo(px+7,py-10);g.lineTo(px+14,py);g.closePath();g.stroke();}}
    g.restore();g.globalAlpha=k;
    /* the maple track */
    g.save();g.beginPath();g.ellipse(G.cx,G.cy,G.rx,G.ry,0,0,6.2832);g.ellipse(G.cx,G.cy,G.ix,G.iy,0,0,6.2832,true);g.clip("evenodd");
    var wg=g.createLinearGradient(0,G.cy-G.ry,0,G.cy+G.ry);wg.addColorStop(0,"#b9773e");wg.addColorStop(0.5,"#d89a5a");wg.addColorStop(1,"#a8652f");
    g.fillStyle=wg;g.fillRect(G.cx-G.rx,G.cy-G.ry,G.rx*2,G.ry*2);
    g.strokeStyle="rgba(90,45,15,.35)";g.lineWidth=1;for(var py2=G.cy-G.ry;py2<G.cy+G.ry;py2+=Math.max(6,G.ry/9)){g.beginPath();g.moveTo(G.cx-G.rx,py2);g.lineTo(G.cx+G.rx,py2);g.stroke();}
    /* a shine across the polish, and the mirror ball's spots */
    var sh=g.createLinearGradient(G.cx-G.rx,0,G.cx+G.rx,0),so=((now/6000)%1);sh.addColorStop(Math.max(0,so-0.08),"rgba(255,255,255,0)");sh.addColorStop(so,"rgba(255,255,255,.18)");sh.addColorStop(Math.min(1,so+0.08),"rgba(255,255,255,0)");
    g.fillStyle=sh;g.fillRect(G.cx-G.rx,G.cy-G.ry,G.rx*2,G.ry*2);
    for(var d=0;d<26;d++){var an=d*0.9+now/2600,rr=0.25+((d*37)%70)/100,sx=G.cx+Math.cos(an)*G.rx*rr*0.95,sy=G.cy+Math.sin(an*1.3)*G.ry*rr*0.9;
      g.fillStyle=["rgba(255,255,255,.55)","rgba(255,61,168,.5)","rgba(61,242,255,.5)"][d%3];g.beginPath();g.ellipse(sx,sy,3,2,0,0,6.2832);g.fill();}
    g.restore();
    /* lane stripes (a dashed neon line round the middle of the track) */
    g.setLineDash([14,12]);g.lineDashOffset=-now/40;g.strokeStyle="rgba(255,255,255,.35)";g.lineWidth=2;
    g.beginPath();g.ellipse(G.cx,G.cy,(G.rx+G.ix)/2,(G.ry+G.iy)/2,0,0,6.2832);g.stroke();g.setLineDash([]);
    /* neon rails: outer and island, glowing */
    function rail(rx,ry,c1,c2){g.shadowColor=c1;g.shadowBlur=14;g.strokeStyle=c1;g.lineWidth=4;g.beginPath();g.ellipse(G.cx,G.cy,rx,ry,0,0,6.2832);g.stroke();g.shadowBlur=0;g.strokeStyle=c2;g.lineWidth=1.5;g.beginPath();g.ellipse(G.cx,G.cy,rx,ry,0,0,6.2832);g.stroke();}
    rail(G.rx,G.ry,"#FF3DA8","#ffd0ec");
    /* the island: purple carpet, a cyan rail, a little riser for the performer */
    g.fillStyle="#2a1650";g.beginPath();g.ellipse(G.cx,G.cy,G.ix,G.iy,0,0,6.2832);g.fill();
    g.strokeStyle="rgba(245,242,61,.35)";g.lineWidth=2;for(var z=0;z<5;z++){g.beginPath();g.ellipse(G.cx,G.cy,G.ix*(0.25+z*0.15),G.iy*(0.25+z*0.15),0,0,6.2832);g.stroke();}
    rail(G.ix,G.iy,"#3DF2FF","#d8fdff");
    g.restore();
  }
  /* the ice rink: the same oval, frozen. Snowbanks round the outside, scuffed blue-white ice, a frosty rail */
  function iceRink(g,G,now,k){
    g.save();g.globalAlpha=k;
    g.save();g.beginPath();g.rect(G.cx-G.rx-60,G.cy-G.ry-30,G.rx*2+120,G.ry*2+60);g.ellipse(G.cx,G.cy,G.rx,G.ry,0,0,6.2832,true);g.clip("evenodd");
    g.fillStyle="#1b2a48";g.fillRect(G.cx-G.rx-60,G.cy-G.ry-30,G.rx*2+120,G.ry*2+60);
    g.fillStyle="rgba(235,244,255,.85)";for(var i=0;i<60;i++){var a=i/60*6.2832,bx=G.cx+Math.cos(a)*(G.rx+10),by=G.cy+Math.sin(a)*(G.ry+6);g.beginPath();g.ellipse(bx,by,14+(i*7)%10,6+(i*3)%4,0,0,6.2832);g.fill();}
    g.restore();g.globalAlpha=k;
    g.save();g.beginPath();g.ellipse(G.cx,G.cy,G.rx,G.ry,0,0,6.2832);g.ellipse(G.cx,G.cy,G.ix,G.iy,0,0,6.2832,true);g.clip("evenodd");
    var ig=g.createLinearGradient(0,G.cy-G.ry,0,G.cy+G.ry);ig.addColorStop(0,"#bfe3f7");ig.addColorStop(0.5,"#e6f6ff");ig.addColorStop(1,"#a9d3ee");
    g.fillStyle=ig;g.fillRect(G.cx-G.rx,G.cy-G.ry,G.rx*2,G.ry*2);
    /* blade scuffs: long thin arcs round the oval */
    g.strokeStyle="rgba(120,160,200,.28)";g.lineWidth=1;
    for(var j=0;j<22;j++){var r=0.42+((j*37)%55)/100,a0=(j*1.7)%6.28;g.beginPath();g.ellipse(G.cx,G.cy,G.rx*r,G.ry*r,0,a0,a0+0.6+((j*13)%10)/10);g.stroke();}
    var sh=g.createLinearGradient(G.cx-G.rx,0,G.cx+G.rx,0),so=((now/5000)%1);sh.addColorStop(Math.max(0,so-0.1),"rgba(255,255,255,0)");sh.addColorStop(so,"rgba(255,255,255,.45)");sh.addColorStop(Math.min(1,so+0.1),"rgba(255,255,255,0)");
    g.fillStyle=sh;g.fillRect(G.cx-G.rx,G.cy-G.ry,G.rx*2,G.ry*2);
    for(var d=0;d<26;d++){var an=d*0.9+now/2600,rr=0.25+((d*37)%70)/100,sx=G.cx+Math.cos(an)*G.rx*rr*0.95,sy=G.cy+Math.sin(an*1.3)*G.ry*rr*0.9;
      g.fillStyle=["rgba(255,255,255,.8)","rgba(255,120,200,.45)","rgba(80,200,255,.5)"][d%3];g.beginPath();g.ellipse(sx,sy,3,2,0,0,6.2832);g.fill();}
    g.restore();
    function rail(rx,ry,c1,c2){g.shadowColor=c1;g.shadowBlur=12;g.strokeStyle=c1;g.lineWidth=5;g.beginPath();g.ellipse(G.cx,G.cy,rx,ry,0,0,6.2832);g.stroke();g.shadowBlur=0;g.strokeStyle=c2;g.lineWidth=1.5;g.beginPath();g.ellipse(G.cx,G.cy,rx,ry,0,0,6.2832);g.stroke();}
    rail(G.rx,G.ry,"#8fd8ff","#ffffff");
    g.fillStyle="#24365e";g.beginPath();g.ellipse(G.cx,G.cy,G.ix,G.iy,0,0,6.2832);g.fill();
    g.fillStyle="rgba(240,248,255,.9)";for(var z=0;z<14;z++){var za=z/14*6.2832;g.beginPath();g.ellipse(G.cx+Math.cos(za)*G.ix*0.82,G.cy+Math.sin(za)*G.iy*0.8,G.ix*0.14,G.iy*0.22,0,0,6.2832);g.fill();}
    rail(G.ix,G.iy,"#8fd8ff","#ffffff");
    g.restore();
  }
  /* where an oval rink sits on a floor running from y=top to y=bot (pixels), on a screen W wide */
  function rinkGeom(W,top,bot){
    var cy=(top+bot)/2,ry=Math.max(30,(bot-top)/2),rx=Math.min(W*0.47,Math.max(ry*1.8,W*0.4));
    return{cx:W/2,cy:cy,rx:rx,ry:ry,ix:Math.max(46,rx*0.26),iy:Math.max(18,ry*0.34)};
  }

  /* ---------------- keepy uppy (the keepy round) ----------------
     A balloon (light, drifts down), a ball (heavy, drops fast and bounces) and a feather (floats high and
     takes forever to come down) to keep off the floor. Shared between the pages: every screen runs the same
     simple physics from the same starting point, and each hit carries the object's full new state, so
     everyone agrees where things are. Positions: x, y on the floor (0-1 of the screen), z height in art
     pixels; velocities per second; t = song time (ms) of the state. */
  var KTYPES={
    balloon:{g:22,drag:1.1,kick:62,push:0.22,spawn:62,pts:10,col:"#FF4D6D",r:5},
    ball:{g:150,drag:0.15,kick:120,push:0.32,spawn:70,pts:15,col:"#F5F23D",r:3.5,bounce:0.62},
    feather:{g:9,drag:1.4,kick:32,push:0.12,spawn:88,pts:30,col:"#F4F1FF",r:4,sway:1}
  };
  var KORDER=["balloon","ball","feather","balloon"];
  function kRand(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);}
  function kSpawn(o,t,B){var T=KTYPES[o.type],n=o.k*7+(o.drops||0)*13+1;
    o.s={x:B.x0+(B.x1-B.x0)*(0.15+0.7*kRand(n)),y:B.y0+(B.y1-B.y0)*(0.2+0.6*kRand(n+3)),z:T.spawn,vx:(kRand(n+5)-0.5)*0.04,vy:0,vz:0,t:t};o.streak=0;o.bounces=0;o.down=0;}
  function keepyMake(t,B){return KORDER.map(function(type,k){var o={k:k,type:type,drops:0};kSpawn(o,t-k*1500,B);return o;});}
  /* move one object on to song time t (fixed 20 ms steps, so every screen gets the same answer) */
  function keepyAdvance(o,t,B){
    var T=KTYPES[o.type],s=o.s,DT=20;
    if(o.down){if(t>=o.down){o.drops++;kSpawn(o,o.down,B);}else return;}
    var guard=0;
    while(s.t+DT<=t&&guard++<3000){
      var dt=DT/1000,dr=Math.exp(-T.drag*dt);
      s.vz-=T.g*dt;s.vz*=T.drag>1?dr:1;if(T.drag>1&&s.vz<-T.g/T.drag)s.vz=-T.g/T.drag;   /* light things reach a slow fall and stay there */
      s.vx*=Math.exp(-0.25*dt);s.vy*=Math.exp(-0.25*dt);
      var sw=T.sway?Math.sin(s.t/600+o.k)*0.035:0;
      s.x+=(s.vx+sw)*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;s.t+=DT;
      if(s.x<B.x0){s.x=B.x0;s.vx=Math.abs(s.vx);}if(s.x>B.x1){s.x=B.x1;s.vx=-Math.abs(s.vx);}
      if(s.y<B.y0){s.y=B.y0;s.vy=Math.abs(s.vy);}if(s.y>B.y1){s.y=B.y1;s.vy=-Math.abs(s.vy);}
      if(s.z<=0){
        s.z=0;o.streak=0;
        if(T.bounce&&o.bounces<3&&s.vz<-25){s.vz=-s.vz*T.bounce;o.bounces++;}       /* the ball bounces a few times */
        else{o.down=s.t+1200;o.lastDrop=s.t;return;}                                   /* on the floor: back from the top in a moment */
      }
    }
  }
  /* a hit: the object's new state from now (also what goes over the wire) */
  function keepyHit(o,st){o.s={x:st.x,y:st.y,z:st.z,vx:st.vx,vy:st.vy,vz:st.vz,t:st.t};o.down=0;o.bounces=0;o.streak=(o.streak||0)+1;}
  /* draw: P(x,y,z) gives the screen point; s the character scale */
  function keepyDraw(g,objs,P,sc,now){
    objs.forEach(function(o){
      if(o.down)return;var T=KTYPES[o.type],s=o.s,f=P(s.x,s.y,0),p=P(s.x,s.y,s.z),r=T.r*sc;
      /* the shadow on the floor: smaller and fainter the higher it is */
      var sh=Math.max(0.35,1-s.z/120);g.fillStyle="rgba(0,0,0,"+(0.35*sh).toFixed(3)+")";g.beginPath();g.ellipse(f[0],f[1],r*1.3*sh,r*0.45*sh,0,0,6.2832);g.fill();
      g.save();g.translate(Math.round(p[0]),Math.round(p[1]));
      if(o.type==="balloon"){
        g.strokeStyle="rgba(255,255,255,.6)";g.lineWidth=Math.max(1,sc*0.4);g.beginPath();g.moveTo(0,r);g.quadraticCurveTo(r*0.6,r*2,0,r*3.2);g.stroke();
        g.fillStyle=T.col;g.beginPath();g.ellipse(0,0,r,r*1.2,0,0,6.2832);g.fill();g.fillStyle="#c02848";g.fillRect(-sc*0.5,r*1.1,sc,sc*0.8);
        g.fillStyle="rgba(255,255,255,.55)";g.beginPath();g.ellipse(-r*0.35,-r*0.45,r*0.25,r*0.35,-0.5,0,6.2832);g.fill();
      }else if(o.type==="ball"){
        g.rotate(s.x*40);g.fillStyle=T.col;g.beginPath();g.arc(0,0,r,0,6.2832);g.fill();
        g.fillStyle="#FF3DA8";g.beginPath();g.moveTo(0,0);g.arc(0,0,r,0,2.1);g.fill();g.fillStyle="#3DF2FF";g.beginPath();g.moveTo(0,0);g.arc(0,0,r,2.1,4.2);g.fill();
        g.fillStyle="#fff";g.beginPath();g.arc(0,0,r*0.25,0,6.2832);g.fill();
      }else{
        g.rotate(Math.sin(now/500+o.k)*0.6);g.strokeStyle="#cfc8e8";g.lineWidth=Math.max(1,sc*0.35);g.beginPath();g.moveTo(-r*1.4,r*0.4);g.lineTo(r*1.4,-r*0.4);g.stroke();
        g.fillStyle=T.col;g.beginPath();g.moveTo(-r*1.2,r*0.35);g.quadraticCurveTo(0,-r*1.1,r*1.3,-r*0.4);g.quadraticCurveTo(0,r*0.2,-r*1.2,r*0.35);g.fill();
      }
      g.restore();
      if(o.streak>=2){g.font="800 "+Math.round(10+Math.min(8,o.streak))+"px system-ui";g.textAlign="center";g.lineWidth=3;g.strokeStyle="rgba(0,0,0,.7)";g.strokeText("×"+o.streak,p[0],p[1]-r*1.6);g.fillStyle=T.col;g.fillText("×"+o.streak,p[0],p[1]-r*1.6);}
    });
  }
  /* ---------------- walking ----------------
     A walk that stays on the ground: the stride advances with the distance actually covered (so the feet keep
     pace with the body instead of paddling in the air), one foot stays planted while the other lifts and swings
     through, the body rises a pixel as the legs pass and settles on each footfall, and when you stop the feet
     come down together instead of freezing mid-stride.
     w = a state object kept on each person; x, y = where they're drawn this frame (screen px); s = their scale. */
  function walkStep(w,x,y,now,s){
    if(w.t===undefined){w.t=now;w.px=x;w.py=y;w.ph=0;w.k=0;w.dx=1;w.dy=0;w.sp=0;}
    var dt=Math.max(1,Math.min(100,now-w.t)),mx=x-w.px,my=y-w.py,md=Math.hypot(mx,my);w.t=now;w.px=x;w.py=y;
    if(md>40*s){md=0;}                                   /* a jump across the room (joining, a snap): not a walk */
    var moving=md>0.25*Math.max(1,s*0.5);
    if(moving){
      /* a step every ~18 art pixels of ground, but never slower than a stroll or faster than a run */
      var stride=18*s,cad=md/stride;cad=Math.max(cad,dt/280);w.ph+=Math.min(cad,dt/115);
      var nd=Math.hypot(mx,my)||1;w.dx+=(mx/nd-w.dx)*0.35;w.dy+=(my/nd-w.dy)*0.35;
      w.k=Math.min(1,w.k+dt/70);w.still=0;
    }else{
      /* stopping: finish the footfall (to the nearest step), then ease back to standing */
      w.still=(w.still||0)+dt;
      if(w.still>60){var tgt=Math.round(w.ph);w.ph+=(tgt-w.ph)*Math.min(1,dt/80);w.k=Math.max(0,w.k-dt/160);}
    }
    w.sp+=((moving?md/dt:0)-w.sp)*0.2;
    return w.k>0.01?w:null;
  }
  /* the pose for a walk state (from walkStep): limb angles, leg lengths, and the body bob in art pixels */
  function walkPose(w){
    var k=w.k,ph=w.ph,step=Math.floor(ph),u=ph-step,leftPlanted=(((step%2)+2)%2)===0;
    var hx=Math.max(-1,Math.min(1,w.dx||0)),side=Math.abs(hx);
    var run=Math.min(1,(w.sp||0)/0.5);                 /* px per ms: faster walking lifts the knees more */
    /* the planted foot stays put as the body passes over it (it sweeps from ahead to behind); the lifted foot
       swings the other way. Walking toward or away from you the feet mostly lift rather than swing */
    var A=0.08+0.30*side,dir=hx>=0?1:-1;
    var aPlant=-dir*A*(1-2*u),aSwing=-aPlant;
    var lift=(1.4+1.6*(1-side)+run*0.8)*Math.sin(Math.PI*u);
    var legL=leftPlanted?aPlant:aSwing,legR=leftPlanted?aSwing:aPlant;
    var lenL=leftPlanted?7:7-lift,lenR=leftPlanted?7-lift:7;
    /* the planted leg is angled, so the body drops a touch to keep that foot on the floor; up as the legs pass */
    var bob=7*(1-Math.cos(aPlant))-Math.sin(Math.PI*u)*(1+run*0.6);
    /* the arms swing against the legs: seen side-on (walking left or right) they swing a little across; walking
       toward or away from you the arm coming forward looks shorter instead */
    var sw=(leftPlanted?1:-1)*Math.sin(Math.PI*u),ang=-dir*sw*(0.12+0.18*run)*side,fore=Math.abs(sw)*(1.5+run)*(1-side);
    var armLenL=9-(sw<0?fore:0),armLenR=9-(sw>0?fore:0);
    return{legL:legL*k,legR:legR*k,legLenL:7-(7-lenL)*k,legLenR:7-(7-lenR)*k,armL:0.15+ang*k,armR:-0.15+ang*k,lenL:9-(9-armLenL)*k,lenR:9-(9-armLenR)*k,bob:bob*k};
  }
  /* a soft shadow on the floor under someone's feet; it stays on the floor while they bob or jump */
  function footShadow(g,x,y,s,lift){
    var a=Math.max(0.12,0.32-Math.abs(lift||0)/(30*s));g.fillStyle="rgba(0,0,0,"+a.toFixed(3)+")";
    var rw=Math.max(3,(6.5-Math.min(3,Math.abs(lift||0)/(4*s)))*s),rh=Math.max(1,1.6*s);
    g.beginPath();g.ellipse(Math.round(x),Math.round(y+11*s),rw,rh,0,0,Math.PI*2);g.fill();
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
    var glow=(0.55+0.35*beat*on)*G("l.sign",1);
    f.globalAlpha=glow*0.35;r(sxx-2,syy-2,sw+4,11,"#D354A0");f.globalAlpha=1;
    var half=sign.indexOf(" ");
    pixText(f,sign.slice(0,half<0?sign.length:half),sxx,syy,sp,"#F5D03C","left","#3a1a10");
    if(half>0)pixText(f,sign.slice(half+1),sxx+(half+1)*6,syy,sp,"#E8505B","left","#3a1018");
    }
    /* lights hanging from the truss, swinging their beams. Modes (the performer picks): auto, party (fast,
       colour-cycling), warm, cool, spot (one white beam on the performer), strobe (beams off; flashes in front),
       off. Fog makes the beams show up more. */
    var mode=st.lights||"auto",haze=1+(st.fog||0)*G("l.haze",1.6),lights=[0.2,0.36,0.64,0.8],cols=[G("l.c1","#F5D03C"),G("l.c2","#E8505B"),G("l.c3","#D354A0"),G("l.c4","#4A9BE8")];
    if(mode==="warm")cols=["#F0A040","#E8505B","#F5D03C","#E86A30"];
    if(mode==="cool")cols=["#4A9BE8","#4CC38A","#9B7FE0","#7FD8F0"];
    var edmB=Math.floor(now/(60000/128))%2;if(mode==="edm")cols=edmB?["#3DF2FF","#FF3DA8","#3DF2FF","#FF3DA8"]:["#FF3DA8","#3DF2FF","#FF3DA8","#3DF2FF"];   /* EDM: cyan and magenta, swapping on the beat */
    var spd=mode==="party"||mode==="edm"?0.0021:mode==="warm"||mode==="cool"?0.00045:0.0007;spd*=G("l.speed",1);var LB=G("l.bright",1),LW=G("l.width",14);
    if(mode==="spot"){
      var tx2=Math.round((st.spotX||W/2)/P),len2=sb-2;
      f.globalAlpha=Math.min(0.5,(0.16+0.05*beat)*haze);f.fillStyle="#FFF6D8";
      f.beginPath();f.moveTo(tx2-2,6);f.lineTo(tx2+2,6);f.lineTo(tx2+12,len2);f.lineTo(tx2-12,len2);f.closePath();f.fill();f.globalAlpha=1;
    }else if(mode!=="off"&&mode!=="strobe")for(i=0;i<lights.length;i++){
      var lx=Math.round(w*lights[i]),sw2=Math.sin(now*spd+i*1.7)*(mode==="party"?0.7:0.45),len=fb-6,al=Math.min(0.45*Math.max(1,LB),(0.05+0.06*beat*on+0.04*lv+(mode==="party"?0.04:0))*haze*LB);
      if(mode==="edm")al=Math.min(0.6,al*1.6+0.05);
      f.globalAlpha=al;f.fillStyle=mode==="party"?TILECOL[(i+Math.floor(now/400))%TILECOL.length]:cols[i];
      f.beginPath();f.moveTo(lx-1,6);f.lineTo(lx+2,6);f.lineTo(lx+Math.sin(sw2)*len+LW,6+len);f.lineTo(lx+Math.sin(sw2)*len-LW,6+len);f.closePath();f.fill();
      f.globalAlpha=1;r(lx-1,5,3,2,"#1d1730");r(lx,7,1,1,f.fillStyle);
    }
    /* lights following the performer's playing (st.follow = {h: 0 low .. 1 high in their range, hue, a: how
       recently a note sounded}): a wash climbs the back wall to the height of the note, the beams take its colour,
       and a band of floor tiles lights up nearer the stage the higher the note */
    var fo=st.follow;
    if(fo&&fo.a>0.02){
      var wallTop=6,wallBot=sb-5,hh2=Math.max(2,Math.round((wallBot-wallTop)*(0.12+0.88*fo.h))),fc="hsl("+Math.round(fo.hue)+",85%,60%)";
      f.globalAlpha=Math.min(1,G("l.followWash",0.32)*fo.a);f.fillStyle=fc;f.fillRect(0,wallBot-hh2,w,hh2);
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
      var a=(0.03+0.13*beat*on*(n>0.6?1:0.25))*(0.4+0.6*wave)*(0.6+0.6*lv)*G("l.tiles",1),tc2=TILECOL[(gx+gy+Math.floor(t*0.5))%cols2];
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
  /* the performer's key panel, mounted on the back wall: SPACE D E 3 on top, the arrow cross below, lit live as
     they press. st = {mods:{space,d,e,three}, dir:"up"|"down"|"left"|"right"|null, col: the arrow's colour,
     modCols:{space,d,e,three}, age: ms since the arrow went down}. 27 x 25 art pixels at p screen pixels each. */
  var KP_W=27,KP_H=25;
  function keyPad(g,x,y,p,st){
    st=st||{};var mods=st.mods||{},mc=st.modCols||{};
    var was=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;
    function r(ax,ay,ww,hh,c){g.fillStyle=c;g.fillRect(Math.round(x+ax*p),Math.round(y+ay*p),Math.round(ww*p),Math.round(hh*p));}
    /* the panel and its two wall bolts */
    r(0,0,KP_W,KP_H,"#0d0918");r(0,0,KP_W,1,"#4d4170");r(0,KP_H-1,KP_W,1,"#120d1e");r(0,0,1,KP_H,"#3a3058");r(KP_W-1,0,1,KP_H,"#120d1e");
    r(1,1,1,1,"#6a5c8a");r(KP_W-2,1,1,1,"#6a5c8a");
    function key(kx,ky,kw,kh,on,c){
      r(kx,ky,kw,kh,on?c:"#1f1933");r(kx,ky,kw,1,on?"rgba(255,255,255,.45)":"#2e2648");r(kx,ky+kh-1,kw,1,on?"rgba(0,0,0,.3)":"#151024");
      if(on){g.globalAlpha=0.25;r(kx-1,ky-1,kw+2,kh+2,c);g.globalAlpha=1;r(kx,ky,kw,kh,c);r(kx,ky,kw,1,"rgba(255,255,255,.45)");}
    }
    function label(t,cx,cy,on){if(p<3)return;g.fillStyle=on?"#fff":"rgba(255,255,255,.4)";g.font="700 "+Math.max(7,Math.round(p*2.6))+"px system-ui,sans-serif";
      g.textAlign="center";g.textBaseline="middle";g.fillText(t,Math.round(x+cx*p),Math.round(y+cy*p)+1);}
    var row=[["SPACE",2,9,"space"],["D",12,4,"d"],["E",17,4,"e"],["3",22,3,"three"]];
    row.forEach(function(k){var on=!!mods[k[3]];key(k[1],2,k[2],5,on,mc[k[3]]||"#7F77DD");label(k[0],k[1]+k[2]/2,4.5,on);});
    /* the arrows: a 7x7 key each, with a pixel triangle */
    var ar={up:[10,9],left:[2,17],down:[10,17],right:[18,17]},col=st.col||"#7F77DD";
    for(var d in ar){var on=st.dir===d,ax=ar[d][0],ay=ar[d][1];
      if(on&&st.age!==undefined&&st.age<450){g.globalAlpha=0.6*(1-st.age/450);var gr=1+st.age/90;r(ax-gr,ay-gr,7+gr*2,7+gr*2,col);g.globalAlpha=1;}
      key(ax,ay,7,7,on,col);
      var tc=on?"#fff":"#4a4068",cx=ax+3,cy=ay+3;
      for(var i=0;i<3;i++){
        if(d==="up")r(cx-i,cy-1+i,1+2*i,1,tc);
        else if(d==="down")r(cx-i,cy+1-i,1+2*i,1,tc);
        else if(d==="left")r(cx-1+i,cy-i,1,1+2*i,tc);
        else r(cx+1-i,cy-i,1,1+2*i,tc);}
    }
    g.imageSmoothingEnabled=was;
  }
  /* where the key panel hangs: top-left of the back wall, inside the left truss pillar, clear of a Jumbotron
     (jt = its screen rect, or null) and of anything in the corner down to avoidY. Returns {x,y,p} or null. */
  function keyPadSpot(W,H,lay,jt,avoidY){
    var P=sceneP(W,H),wallTop=6*P,wallBot=Math.round(lay.stageBottom*H)-5*P;
    var x0=Math.round(W*0.12)+3*P,xmax=jt?jt.x-2*P:W*0.4,y0=Math.max(wallTop+2*P,avoidY||0);
    if(xmax-x0<KP_W*2){x0=8;y0=Math.max(y0,avoidY||0);}
    var p=Math.min(P,Math.floor((xmax-x0)/KP_W),Math.floor((wallBot-y0)/KP_H));
    if(p<2)return null;
    return{x:Math.round(x0),y:Math.round(y0),p:p};
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
      ".ukm-prev{flex:0 0 auto;width:176px;height:220px;border-radius:10px;background:linear-gradient(#2a1f42,#161128);border:1px solid rgba(255,255,255,.12);image-rendering:pixelated;cursor:pointer}"+
      ".ukm-rows{flex:1 1 200px;min-width:0;display:flex;flex-direction:column;gap:7px}"+
      ".ukm-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}"+
      ".ukm-lbl{font-size:11px;color:#a59cc4;text-transform:uppercase;letter-spacing:.5px;width:100%;margin-bottom:-2px}"+
      ".ukm-step{display:flex;align-items:center;gap:4px}"+
      ".ukm-step button{width:26px;height:26px;border-radius:6px;border:1px solid rgba(255,255,255,.15);background:#2a2440;color:#fff;cursor:pointer;font:700 13px system-ui;padding:0}"+
      ".ukm-step span{min-width:84px;text-align:center;font:600 13px system-ui;color:#fff}"+
      ".ukm-sw{width:20px;height:20px;border-radius:5px;border:2px solid transparent;cursor:pointer;padding:0;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35)}"+
      ".ukm-sw.sel{border-color:#fff;transform:scale(1.12)}"+
      "@media (max-width:520px){.ukm{gap:12px;flex-direction:column;align-items:center}.ukm-prev{width:min(250px,66vw);height:min(312px,82vw)}.ukm-rows{flex-basis:auto;width:100%}.ukm-step span{min-width:70px;font-size:12px}.ukm-sw{width:18px;height:18px}}"+
      ".ukm-col{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,.85);cursor:pointer;padding:0;margin-left:4px;box-shadow:0 0 0 2px rgba(0,0,0,.35),inset 0 0 0 1px rgba(0,0,0,.3)}"+
      ".ukm-pop{position:fixed;inset:0;z-index:200000;background:rgba(6,3,14,.7);display:flex;align-items:center;justify-content:center;padding:14px}"+
      ".ukm-pbox{background:#1b1630;border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:14px;width:min(360px,100%);color:#fff;font:600 13px system-ui;box-shadow:0 18px 50px rgba(0,0,0,.6)}"+
      ".ukm-pbox h4{margin:0 0 10px;font:800 15px system-ui}"+
      ".ukm-zoom{width:100%;height:170px;border-radius:10px;background:linear-gradient(#2a1f42,#161128);image-rendering:pixelated;display:block;margin-bottom:10px}"+
      ".ukm-grid{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.ukm-grid .ukm-sw{width:30px;height:30px;border-radius:7px}"+
      ".ukm-any{display:flex;align-items:center;gap:8px;margin-bottom:12px}.ukm-any input[type=color]{width:46px;height:34px;border:0;padding:0;background:none;cursor:pointer}"+
      ".ukm-any input[type=text]{flex:1;min-width:0;background:#120e22;border:1px solid rgba(255,255,255,.15);border-radius:7px;color:#fff;font:600 13px ui-monospace,monospace;padding:7px 9px}"+
      ".ukm-hue{width:100%;height:120px;border-radius:9px;cursor:crosshair;display:block;margin-bottom:8px;touch-action:none}"+
      ".ukm-done{width:100%;padding:9px;border-radius:9px;border:0;background:linear-gradient(135deg,#D354A0,#7F77DD);color:#fff;font:800 14px system-ui;cursor:pointer}"+
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
      if(ck){var cb=document.createElement("button");cb.type="button";cb.className="ukm-col";cb.title=O[ck].label+": pick any colour";cb.setAttribute("aria-label",O[ck].label);
        cb.onclick=function(){picker(ck);};row.appendChild(cb);ctl[ck+"_btn"]=cb;}
      rows.appendChild(row);
    }
    /* the colour window for one part: zoomed in on it, the standard colours, and any colour (a hue/shade square, the
       browser's picker and a hex box) */
    var PART={skin:["skin","skinHex","Skin colour"],hairCol:["hair","hairHex","Hair colour"],topCol:["top","topHex","Top colour"],botCol:["bot","botHex","Bottoms colour"]};
    function picker(ck){
      var P=PART[ck],pop=document.createElement("div");pop.className="ukm-pop";
      var bx=document.createElement("div");bx.className="ukm-pbox";pop.appendChild(bx);
      var h=document.createElement("h4");h.textContent=P[2];bx.appendChild(h);
      var zc=document.createElement("canvas");zc.className="ukm-zoom";zc.width=320;zc.height=170;bx.appendChild(zc);
      var grid=document.createElement("div");grid.className="ukm-grid";bx.appendChild(grid);
      var sws=O[ck].col.map(function(c,i){var b=document.createElement("button");b.type="button";b.className="ukm-sw";b.style.background=c;b.onclick=function(){L[ck]=i;delete L[P[1]];sync();};grid.appendChild(b);return b;});
      var hue=document.createElement("canvas");hue.className="ukm-hue";hue.width=320;hue.height=120;bx.appendChild(hue);
      var any=document.createElement("div");any.className="ukm-any";bx.appendChild(any);
      var ci=document.createElement("input");ci.type="color";any.appendChild(ci);
      var hx=document.createElement("input");hx.type="text";hx.maxLength=7;hx.placeholder="#rrggbb";hx.spellcheck=false;any.appendChild(hx);
      var dn=document.createElement("button");dn.type="button";dn.className="ukm-done";dn.textContent="Done";bx.appendChild(dn);
      function setHex(v){v=hex6(v);if(!v)return;L[P[1]]=v;sync();}
      ci.oninput=function(){setHex(ci.value);};
      hx.onchange=function(){var v=hx.value.trim();if(v[0]!=="#")v="#"+v;setHex(v);};
      /* the hue (across) and shade (down: light at the top, dark at the bottom) square */
      var hg=hue.getContext("2d");for(var xx=0;xx<320;xx++){var gr=hg.createLinearGradient(0,0,0,120),hh=xx/320*360;gr.addColorStop(0,"hsl("+hh+",90%,92%)");gr.addColorStop(0.5,"hsl("+hh+",85%,50%)");gr.addColorStop(1,"hsl("+hh+",70%,8%)");hg.fillStyle=gr;hg.fillRect(xx,0,1,120);}
      function pickAt(e){var r=hue.getBoundingClientRect(),x=Math.max(0,Math.min(319,(e.clientX-r.left)/r.width*320)),y=Math.max(0,Math.min(119,(e.clientY-r.top)/r.height*120));var d=hg.getImageData(x|0,y|0,1,1).data;
        setHex("#"+((1<<24)+(d[0]<<16)+(d[1]<<8)+d[2]).toString(16).slice(1));}
      var down=false;hue.onpointerdown=function(e){down=true;try{hue.setPointerCapture(e.pointerId);}catch(x){}pickAt(e);};hue.onpointermove=function(e){if(down)pickAt(e);};hue.onpointerup=function(){down=false;};
      function sync(){var cur=colOf(L,P[0]);ci.value=cur;if(document.activeElement!==hx)hx.value=cur;sws.forEach(function(b,i){b.classList.toggle("sel",!hex6(L[P[1]])&&i===L[ck]);});changed();zoom();}
      /* zoomed in on that part of the body */
      var zg=zc.getContext("2d");function zoom(){zg.clearRect(0,0,320,170);var sc=ck==="botCol"?9:ck==="topCol"?10:11,fy=ck==="botCol"?8:ck==="topCol"?0:-13;drawChar(zg,160,85-fy*sc,sc,L,{armL:0.15,armR:-0.15,legL:0.08,legR:-0.08});}
      function close(){pop.remove();document.removeEventListener("keydown",esc,true);}
      function esc(e){if(e.key==="Escape"){e.stopPropagation();close();}}
      dn.onclick=close;pop.onclick=function(e){if(e.target===pop)close();};document.addEventListener("keydown",esc,true);
      document.body.appendChild(pop);sync();
    }
    var skr=stepper("skin","Skin");stepper("hair","Hair","hairCol");stepper("top","Top","topCol");stepper("bottom","Bottoms","botCol");stepper("shoes","Shoes");stepper("hat","Hat");stepper("face","Face");stepper("extra","Extra");
    var rb=document.createElement("button");rb.type="button";rb.className="ukm-rand";rb.textContent="\uD83C\uDFB2 Surprise me";rb.onclick=function(){L=random();changed();};rows.appendChild(rb);
    function paint(){
      KEYS.forEach(function(k){if(ctl[k])ctl[k].textContent=O[k].names[L[k]];if(ctl[k+"_btn"])ctl[k+"_btn"].style.background=colOf(L,PART[k][0]);});
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
    {name:"Skank",icon:"\uD83C\uDFBA",subs:["Classic","Windmill","Pogo","Elbows","Kicks"],help:"Left dot: knee height and travel. Right dot: punches."},
    {name:"Robot",icon:"\uD83E\uDD16",subs:["Arms","Wave","Pop","Freeze"],help:"Each dot points an arm; it snaps like a robot."},
    {name:"The worm",icon:"\uD83D\uDC1B",subs:["Forward","Back","Flop","Dive in"],help:"Slide your thumbs up and down: left lifts the chest, right lifts the hips."},
    {name:"Silly",icon:"\uD83E\uDD2A",subs:["Chicken","Sprinkler","YMCA","Floss","Macarena"],help:"Left dot: size and speed. Right dot: bounce."},
    {name:"Shuffle",icon:"\uD83D\uDC5F",subs:["Running man","T-step","Spin","Mix it up"],help:"Left dot: how far you travel and how low. Right dot: knee lift and arms."},
    {name:"Thriller",icon:"\uD83E\uDDDF",subs:["Zombie arms","Claw walk","Shoulder pop","Mix it up"],help:"Left dot: how low and how wide. Right dot: lean and arm reach."},
    {name:"Street jam",icon:"\uD83D\uDCA5",subs:["High knees","Strike a pose","Hop step","Floor spin","Mix it up"],help:"Left dot: how low and how far you travel. Right dot: knee height and arms."},
    {name:"Cyber goth",icon:"\uD83E\uDD16",subs:["Stomp & punch","Arm sweep","Hands up","Windmill","Arm roll","Chop","Mix it up"],help:"Left dot: stomp width and how low. Right dot: arm size and speed."},
    {name:"Headbang",icon:"\uD83E\uDD18",subs:["Headbang","Hair windmill","Air guitar","Rock on","Mix it up"],help:"Left dot: stance width and how low. Right dot: how hard and how fast."},
    {name:"Lighters up",icon:"\uD83D\uDD25",subs:["Lighter sway","Phone light","Wave it","Both hands","Glow sticks"],help:"Left dot: how far you sway. Right dot: how high you hold it."},
    {name:"Techno march",icon:"\uD83E\uDD7E",subs:["March","Point","Arm swing","Flex","Mix it up"],help:"Left dot: stride and how low. Right dot: arm power."},
    {name:"Puppet",icon:"\uD83C\uDFAD",subs:["Arms","Legs","Arms + legs","Cross"],help:"Nothing moves on its own. Left dot is your body: slide it to shift and lean, up to rise, down to crouch. Right dot is your limbs: up raises them, left and right swing them. Hit Spin or Twirl to turn on the spot."}
  ];
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function danceBase(style,sub,c,bp){
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
      /* (from a clip:) the knee comes right up on each beat while the standing foot slides back, hands together at the chest
         pumping down as the knee rises, the body bouncing; the knees take turns */
      var lift=0.5+Math.max(0,-by)*0.7+(sub===1?0.25:0),fast=sub===1?2:1,q=Math.sin(bp*Math.PI*fast),up=Math.abs(q),kn=Math.min(4.2,2.6+lift*1.6);
      if(q>0){o.legL=up*0.35;o.lgL=7-up*kn;o.legR=-0.12-up*0.15;}else{o.legR=-up*0.35;o.lgR=7-up*kn;o.legL=0.12+up*0.15;}
      o.bob=ay*5-up*2.5;o.dx=ax*8;
      if(sub===2){   /* moonwalk (from a clip): a smooth glide backwards, one heel up with the knee bent, the flat foot sliding back,
                        swapping every beat; arms hanging, head down, a little lean the way you face. 4 beats one way, 4 back */
        var cyc=((bp%8)+8)%8,dir=cyc<4?-1:1,gl=cyc<4?cyc/4:(cyc-4)/4,ft=((bp%1)+1)%1,ease=ft*ft*(3-2*ft),onL=Math.floor(bp)%2===0;
        o.dx=(dir<0?(1-2*gl):(-1+2*gl))*(6+(ax+1)*4);o.bob=ay*3;o.rot=-dir*0.08;
        var bend=2.6*(1-Math.abs(ease-0.5)*0.6);
        if(onL){o.legL=0.06+ease*0.08;o.lgL=7-bend;o.legR=-0.08-(1-ease)*0.12;o.lgR=7;}else{o.legR=-0.06-ease*0.08;o.lgR=7-bend;o.legL=0.08+(1-ease)*0.12;o.lgL=7;}
        o.armL=0.18+Math.sin(bp*Math.PI)*0.05;o.armR=-0.18+Math.sin(bp*Math.PI)*0.05;o.alL=o.alR=undefined;
        break;}
      if(sub===3){var pump=0.5+(bx+1)*0.4+0.6;o.armL=0.4-q*pump;o.armR=-0.4-q*pump;}         /* arms pumping like running */
      else{var hs=0.25+(bx+1)*0.2;o.armL=-0.95+up*hs;o.armR=0.95-up*hs;o.alL=o.alR=6;}      /* hands together at the chest, pumping */
      break;}
    case 5:{ /* skank: knees up high in turn, punching forward with the opposite arm */
      /* (from a clip:) hunched over, knees up high in turn with the foot kicking across in front, elbows bent and pumping
         opposite the knees, bouncing side to side down the floor */
      var kh=0.7+Math.max(0,-ay)*0.6,qq=Math.sin(bp*Math.PI),uq=Math.abs(qq);
      if(qq>0){o.legL=-uq*0.3*kh;o.lgL=7-uq*3.2*kh;o.legR=-0.15;}else{o.legR=uq*0.3*kh;o.lgR=7-uq*3.2*kh;o.legL=0.15;}   /* the foot crosses in front */
      o.bob=1.5-uq*3;o.dx=ax*4*s1+qq*2;o.rot=qq*0.07;
      var pu=1.2+Math.max(0,-by)*0.8+(bx+1)*0.2;o.armL=qq<0?pu:0.5;o.armR=qq>0?-pu:-0.5;o.alL=qq<0?6:8;o.alR=qq>0?6:8;
      if(sub===4){var kk=(Math.floor(bp)%2===0);if(ph>0.35&&ph<0.85){if(kk){o.legL=1.05;o.lgL=7;o.legR=-0.1;o.lgR=7;}else{o.legR=-1.05;o.lgR=7;o.legL=0.1;o.lgL=7;}o.bob=0.5;}}   /* kick out to the side */
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
    case 7:{ /* the worm (from a clip): flat on the floor, the wave runs through you once a beat: hands planted, the hips and
                legs kick up behind while the chest stays down, then the chest pushes up as the legs come down. "Dive in" jumps
                up arms out and dives into it. The thumbs add chest (left) and hip (right) lift on top */
      var dir=sub===1?-1:1,cl=Math.max(0,-ay)*0.5,hl=Math.max(0,-by)*0.5,wp=((bp%1)+1)%1,leg=0,chest=0,mode=sub;
      if(sub===3){var c4=((bp%4)+4)%4;
        if(c4<1){var jj=c4;o.rot=0;o.bob=-Math.sin(jj*Math.PI)*7;o.armL=2.5;o.armR=-2.5;o.legL=0.25;o.legR=-0.25;o.mouth=true;break;}   /* jump up, arms out */
        if(c4<1.5){var dv=(c4-1)*2;o.rot=dir*(Math.PI/2)*dv;o.bob=-(1-dv)*5;o.armL=dir*(2.5-dv*3.9);o.armR=-2.5+dv*1.1;o.legL=dir*dv*0.9;o.legR=dir*dv*0.7;break;}   /* the dive */
        mode=0;}
      if(mode===2){chest=hop*0.9;leg=hop*0.9;}                                                          /* flop */
      else{var k1=Math.sin(Math.min(1,wp*2)*Math.PI),k2=Math.sin(Math.max(0,wp*2-1)*Math.PI);leg=wp<0.5?k1:0;chest=wp>=0.5?k2:0;}
      leg=Math.min(1.2,leg+hl);chest=Math.min(1,chest+cl);
      o.rot=dir*(Math.PI/2-chest*0.55);o.bob=-chest*3-leg*1.5;
      o.legL=dir*(0.05+leg*1.35);o.legR=dir*(0.05+leg*1.2);                                   /* legs kick up off the floor */
      o.armL=dir*(-2.55+chest*0.45);o.armR=dir*(-2.1+chest*0.5);o.alL=o.alR=8-chest*2;             /* hands planted out in front */
      o.dx=dir*((bp%4+4)%4)*1.2-dir*2.4;
      break;}
    case 15:{ /* techno march (from a street-parade clip): a heavy stomping march on every beat, body upright, arms
                 swinging in big arcs, punching a pointing finger out at the crowd, flexing */
      var str6=0.3+(ax+1)*0.15,lo6=Math.max(0,ay)*2,pw=0.8+(bx+1)*0.3+Math.max(0,-by)*0.4,m6=sub;
      if(sub===4)m6=Math.floor(bp/4)%4;
      var sd6=Math.floor(bp)%2?1:-1,st6=Math.pow(1-ph,3);
      if(sd6<0){o.legL=str6+st6*0.1;o.legR=-0.1;if(ph>0.5)o.lgR=7-(ph-0.5)*3;}else{o.legR=-str6-st6*0.1;o.legL=0.1;if(ph>0.5)o.lgL=7-(ph-0.5)*3;}
      o.bob=lo6+st6*1.5;o.dx=sd6*1.5;o.rot=sd6*0.03;
      if(m6===0){   /* march: arms swinging low and wide, opposite the stomping foot */
        var ms=Math.sin(bp*Math.PI);o.armL=0.35+ms*0.6*pw;o.armR=-0.35+ms*0.6*pw;
      }else if(m6===1){   /* point: an arm thrust straight out at the crowd on the beat, pulled back between */
        var pt=Math.pow(1-ph,2),pl=Math.floor(bp/2)%2;if(pl){o.armL=0.5+pt*1.1*pw;o.alL=9;o.armR=-0.5;o.alR=6;}else{o.armR=-0.5-pt*1.1*pw;o.alR=9;o.armL=0.5;o.alL=6;}
      }else if(m6===2){   /* arm swing: big arcs across the chest, one arm then the other, like clearing the way */
        var as6=Math.sin(bp*Math.PI*0.5);o.armL=-0.6+Math.max(0,as6)*2.4*pw;o.armR=0.6-Math.max(0,-as6)*2.4*pw;o.alL=o.alR=8;o.rot=as6*0.08;
      }else{   /* flex: both arms bent, fists by the shoulders, sweeping down and out on the beat */
        var fx6=Math.pow(1-ph,2);o.armL=1.9-fx6*1.2*pw;o.armR=-1.9+fx6*1.2*pw;o.alL=o.alR=5;o.mouth=fx6>0.6;
      }
      break;}
    case 14:{ /* lighters up (from a crowd clip): for the slow one. An arm held straight up with a lighter (or a phone torch),
                 swaying with the whole crowd, once every two beats */
      var sa=0.6+(ax+1)*0.5,hi=2.75+Math.max(0,-by)*0.25-Math.max(0,by)*0.6,sw5=Math.sin(bp*Math.PI*0.5);
      o.dx=sw5*3*sa;o.rot=sw5*0.07*sa;o.bob=0.5-Math.abs(Math.cos(bp*Math.PI*0.5))*0.8;o.legL=0.18+Math.max(0,sw5)*0.08;o.legR=-0.18+Math.min(0,sw5)*0.08;
      o.armR=-hi+sw5*0.08;o.alR=9;o.armL=0.2+sw5*0.05;o.prop=sub===1?"phone":sub===4?"glowstick":"lighter";
      if(sub===4){var gs=Math.sin(bp*Math.PI*2);o.armR=-2.3+gs*0.7;o.alR=8;o.armL=2.3+gs*0.7;o.alL=8;o.bob=-Math.abs(gs)*1.5;}   /* glow sticks: waving fast, both arms */
      if(sub===2){o.armR=-hi+Math.sin(bp*Math.PI)*0.45;o.dx=sw5*2*sa;}                                /* waving it overhead */
      if(sub===3){o.armL=hi-0.15+sw5*0.06;o.alL=9;}                                                    /* both arms up */
      break;}
    case 13:{ /* headbanging (from a clip of a metal band): feet planted wide, knees bent, the whole top half whipping down
                 on every beat and snapping back up, arms hanging loose and swinging with it */
      var wd4=0.4+(ax+1)*0.2,lo4=1.5+Math.max(0,ay)*3,hard=1+Math.max(0,-by)*0.6,f4=bx>0.4?2:1,m4=sub;
      if(sub===4)m4=Math.floor(bp/4)%4;
      var hp4=((bp*f4)%1+1)%1,down=hp4<0.35?Math.sin(hp4/0.35*Math.PI/2):Math.cos((hp4-0.35)/0.65*Math.PI/2);   /* fast whip down, slower lift */
      o.legL=wd4;o.legR=-wd4;o.lgL=o.lgR=7-lo4*0.3;o.bob=lo4+down*3*hard;
      o.armL=0.25+down*0.5;o.armR=-0.25-down*0.5;o.mouth=down>0.7;o.head=hp4>0.55&&hp4<0.8?-0.6:down;   /* head whips down, the hair flies on the way back */
      if(m4===1){   /* hair windmill: the head circling round, the body swinging with it */
        var ca=bp*Math.PI*f4;o.dx=Math.cos(ca)*3*hard;o.rot=Math.sin(ca)*0.16*hard;o.bob=lo4+(Math.sin(ca)*0.5+0.5)*3*hard;o.head=Math.sin(ca)>0.3?Math.sin(ca):Math.sin(ca)<-0.5?-0.6:0;o.armL=0.3+Math.max(0,Math.sin(ca))*0.4;o.armR=-0.3-Math.max(0,-Math.sin(ca))*0.4;
      }else if(m4===2){   /* air guitar: left hand out on the neck, the right hand strumming hard on the eighths, still banging */
        o.armL=1.15;o.alL=8;o.armR=-0.55+Math.sin(bp*Math.PI*4)*0.35;o.alR=5;o.rot=-0.05;
      }else if(m4===3){   /* rock on (from a clip): one arm straight up throwing the horns, still banging, the other hand by the hip */
        var pm4=Math.pow(1-ph,2);o.armR=-2.85-pm4*0.15;o.alR=9-pm4*1.5;o.armL=0.15+down*0.25;o.alL=8;o.bob=lo4+down*2*hard;
      }
      break;}
    case 12:{ /* cyber goth (from a clip of an industrial dance crew): heavy stomping steps out wide, fists punching
                 forward in turn, big arm sweeps across the body side to side, hands up over the head, arms windmilling */
      var sw3=0.4+(ax+1)*0.2,lo3=Math.max(0,ay)*2.5,sz=0.8+(bx+1)*0.35,fast3=by<-0.4?2:1,m3=sub;
      if(sub===6)m3=Math.floor(bp/4)%6;
      var st3=Math.floor(bp)%2?1:-1,sp3=Math.pow(1-ph,3);
      /* the stomp under everything: step out wide on each beat, knee lifting on the off-beat */
      o.legL=st3<0?sw3+0.2*sp3:0.15;o.legR=st3>0?-sw3-0.2*sp3:-0.15;if(ph>0.5){if(st3<0)o.lgR=7-(ph-0.5)*4;else o.lgL=7-(ph-0.5)*4;}
      o.bob=lo3+sp3*1.5;o.dx=st3*2;
      if(m3===0){   /* stomp & punch: a straight punch forward with the stomping side's fist, the other pulled back */
        var pn=Math.sin(bp*Math.PI*fast3);if(pn>0){o.armL=1.5*sz;o.alL=9;o.armR=-0.6;o.alR=5;}else{o.armR=-1.5*sz;o.alR=9;o.armL=0.6;o.alL=5;}o.rot=pn*0.08;
      }else if(m3===1){   /* arm sweep: both arms swing across the body together in a big arc, one side then the other */
        var as=Math.sin(bp*Math.PI*fast3);o.armL=0.4+as*1.4*sz;o.armR=-0.4+as*1.4*sz;o.rot=as*0.1;o.dx=as*3;
      }else if(m3===2){   /* hands up: both hands over the head, swaying, elbows bent */
        var hw=Math.sin(bp*Math.PI*fast3);o.armL=2.6+hw*0.25;o.armR=-2.6+hw*0.25;o.alL=o.alR=6;o.rot=hw*0.07;
      }else if(m3===3){   /* windmill: arms circling, one after the other */
        var wa=bp*Math.PI*fast3*1.5;o.armL=((wa%(Math.PI*2))+Math.PI*2)%(Math.PI*2);o.armR=-((wa+Math.PI)%(Math.PI*2));o.alL=o.alR=9;
      }else if(m3===4){   /* arm roll (second clip): forearms rolling over each other in front of the chest, head down, hair swinging */
        var ra=bp*Math.PI*2*fast3;o.armL=-0.9+Math.sin(ra)*0.45*sz;o.armR=0.9+Math.sin(ra+Math.PI)*0.45*sz;o.alL=5+Math.cos(ra)*1.5;o.alR=5-Math.cos(ra)*1.5;o.rot=Math.sin(ra*0.5)*0.06;
      }else{   /* chop: lunging, a straight arm chopping down across the body on each beat, the other arm cocked back */
        var cp=Math.pow(1-ph,2);if(st3<0){o.armL=-0.5+cp*2.2*sz;o.alL=9;o.armR=-1.6;o.alR=5;}else{o.armR=0.5-cp*2.2*sz;o.alR=9;o.armL=1.6;o.alL=5;}
        o.rot=st3*0.1;o.bob=lo3+2+sp3;
      }
      break;}
    case 11:{ /* street jam (from a clip of a guy dancing his way through town): prancing high knees with the fists pumping,
                 a squat with one arm cocked up and a leg kicked out, hopping side to side on one leg, and a crouched floor spin */
      var lo=Math.max(0,ay)*2.5,trv=0.6+(ax+1)*0.5,kh2=0.8+Math.max(0,-by)*0.5,am=0.6+(bx+1)*0.3,mv2=sub;
      if(sub===4)mv2=Math.floor(bp/4)%4;
      if(mv2===0){   /* high knees: knees right up in turn on the eighths, fists pumping, jogging on the spot */
        var hq=Math.sin(bp*Math.PI*2),hu=Math.abs(hq);
        if(hq>0){o.lgL=7-hu*3.8*kh2;o.legL=0.15;o.legR=-0.1;}else{o.lgR=7-hu*3.8*kh2;o.legR=-0.15;o.legL=0.1;}
        o.bob=lo-hu*3;o.dx=Math.sin(bp*Math.PI*0.5)*3*trv;o.armL=0.6+hq*am;o.armR=-0.6+hq*am;o.alL=o.alR=6;o.mouth=hu>0.8;
      }else if(mv2===1){   /* strike a pose: low wide squat, one arm cocked up by the head, the other bent at the hip; a leg kicks up on the 4 */
        var sd2=Math.floor(bp/2)%2?1:-1,kick=((bp%2)+2)%2>1.4;
        o.legL=0.55;o.legR=-0.55;o.bob=lo+3;
        if(sd2<0){o.armL=2.5;o.alL=6;o.armR=-0.9;o.alR=5;}else{o.armR=-2.5;o.alR=6;o.armL=0.9;o.alL=5;}
        if(kick){if(sd2<0){o.legR=-1.1;o.lgR=5;o.bob=lo+1;}else{o.legL=1.1;o.lgL=5;o.bob=lo+1;}}
        o.rot=sd2*0.08;
      }else if(mv2===2){   /* hop step: hopping on one foot with the other knee tucked, travelling side to side, arms bent out */
        var hs2=Math.floor(bp)%2?1:-1,hp2=Math.pow(1-ph,2);
        if(hs2>0){o.lgL=7-3.2*kh2;o.legL=0.3;o.legR=-0.05;}else{o.lgR=7-3.2*kh2;o.legR=-0.3;o.legL=0.05;}
        o.bob=lo-hp2*5;o.dx=hs2*4*trv;o.armL=1.2;o.armR=-1.2;o.alL=o.alR=5;o.rot=hs2*0.06;
      }else{   /* floor spin: crouched right down, hands on the floor, the legs sweeping round under you */
        var fs2=bp*Math.PI*2,sw2=Math.sin(fs2),cw2=Math.cos(fs2);
        o.bob=7+lo*0.5-Math.abs(cw2)*1.5;o.legL=0.9+sw2*0.6;o.legR=-0.9+sw2*0.6;o.lgL=6-Math.max(0,cw2)*2;o.lgR=6-Math.max(0,-cw2)*2;
        o.armL=-0.4+sw2*0.3;o.armR=0.4+sw2*0.3;o.alL=o.alR=6;o.dx=sw2*3;o.rot=sw2*0.15;
      }
      break;}
    case 10:{ /* Thriller (from a clip of the zombie dance): low wide stance, both arms flung out to one side then the other,
                 a clawed side-step with the knees pumping and the head bobbing, a shoulder pop */
      var lw=1+Math.max(0,ay)*1.2,wd=0.45+(ax+1)*0.15,reach=1.35+Math.max(0,-by)*0.4,ln=0.1+bx*0.08,tm=sub;
      if(sub===3){var br=Math.floor(bp/4)%3;tm=br;}
      var sd=Math.floor(bp/2)%2?1:-1,pp2=((bp/2%1)+1)%1,snap=Math.min(1,pp2*4);
      if(tm===0){   /* zombie arms: lunge to a side, both arms swinging out that way at shoulder height, then swap */
        o.legL=wd;o.legR=-wd;o.bob=lw*2+(1-snap)*1.5;o.dx=sd*4*snap;o.rot=sd*(ln+0.12)*snap;
        if(sd<0){o.armL=reach;o.armR=reach-0.35;}else{o.armR=-reach;o.armL=-(reach-0.35);}
        o.alL=o.alR=9;
      }else if(tm===1){   /* claw walk: side steps, knees up in turn, hands up like claws by the chest, head bobbing */
        var cq=Math.sin(bp*Math.PI),cu=Math.abs(cq);
        if(cq>0){o.lgL=7-cu*3;o.legL=0.25+cu*0.2;o.legR=-0.3;}else{o.lgR=7-cu*3;o.legR=-0.25-cu*0.2;o.legL=0.3;}
        o.dx=Math.sin(bp*Math.PI*0.25)*8;o.bob=lw*1.5-cu*2;o.armL=1.9+cq*0.15;o.armR=-1.9+cq*0.15;o.alL=o.alR=5;o.rot=cq*0.05;
      }else{   /* shoulder pop: feet wide and planted, one shoulder hitches up on each beat, arms hanging stiff */
        var pop=Math.pow(1-ph,3);o.legL=wd*0.9;o.legR=-wd*0.9;o.bob=lw*1.5;o.rot=alt*0.1*pop;
        o.armL=0.25+(alt>0?pop*0.5:0);o.armR=-0.25-(alt<0?pop*0.5:0);o.dx=alt*pop*1.5;
      }
      break;}
    case 9:{ /* the shuffle (Melbourne shuffle / cutting shapes): quick footwork on the eighth notes, arms loose and low */
      var trav=0.5+(ax+1)*0.6,low=Math.max(0,ay)*3,kl=0.55+Math.max(0,-by)*0.5+(bx+1)*0.05,arm=0.25+(bx+1)*0.25,mv=sub;
      if(sub===3){var bar=Math.floor(bp/4)%4;mv=bar===0?0:bar===1?1:bar===2?1:(((bp%4)+4)%4>=2?2:0);if(bar===2)trav=-trav;}   /* running man, T-step right, T-step left, running man into a spin */
      var e=bp*2,ep=((e%1)+1)%1,side=Math.floor(e)%2?1:-1;
      if(mv===0){   /* running man: knee up on the "and", stomp down on the beat while the other foot slides back */
        var up=Math.sin(ep*Math.PI);
        if(side>0){o.legL=up*kl*0.6;o.lgL=7-up*3.5;o.legR=-0.18-(1-up)*0.25;}else{o.legR=-up*kl*0.6;o.lgR=7-up*3.5;o.legL=0.18+(1-up)*0.25;}   /* the knee comes up: a shorter leg */
        o.bob=low-up*2.5+(1-up)*1;o.dx=Math.sin(bp*Math.PI*0.5)*2*trav;
        o.armL=0.3+Math.max(0,side)*arm*0.8;o.armR=-0.3-Math.max(0,-side)*arm*0.8;
      }else if(mv===1){   /* T-step: one foot taps, the other swivels heel-out then toe-out, gliding you sideways */
        var sw=Math.sin(e*Math.PI);o.legL=0.15+Math.abs(sw)*0.45;o.legR=-0.15-Math.max(0,-sw)*0.2;
        if(trav<0){var t3=o.legL;o.legL=-o.legR;o.legR=-t3;}
        o.dx=((bp%4+4)%4/4-0.5)*14*trav;o.bob=low-Math.abs(sw)*1.5;o.rot=-0.06*Math.sign(trav);
        o.armL=0.5+sw*arm*0.5;o.armR=-0.5+sw*arm*0.5;
      }else{   /* spin: arms tuck in, feet together, a quick turn (shown as a blur of a twist) then pop back out */
        var u=((bp%2)+2)%2/2,tw=Math.sin(u*Math.PI*4);
        o.armL=0.45+tw*0.3;o.armR=-0.45+tw*0.3;o.legL=0.05;o.legR=-0.05;o.dx=tw*3;o.rot=tw*0.06;o.bob=low-Math.sin(u*Math.PI)*2;
        if(u>0.8){o.armL=1.6;o.armR=-1.6;o.legL=0.35;o.legR=-0.35;o.mouth=true;}
      }
      break;}
    case 16:{ /* puppet: all manual. Left dot = the body, right dot = the limbs. No beat animation at all. */
      var up=-by,sd=bx,pu=Math.max(0,up),dn=Math.max(0,-up);
      o.dx=ax*11;o.rot=ax*0.22;o.bob=ay>0?ay*6:ay*5;                                     /* body: shift and lean into it, rise (up) or crouch (down) */
      if(ay>0.2){o.legL=0.15+ay*0.45;o.legR=-0.15-ay*0.45;}                                /* a crouch opens the knees */
      if(sub===0){o.armL=0.15+pu*2.6+sd*0.9;o.armR=-0.15-pu*2.6+sd*0.9;}
      else if(sub===1){o.armL=0.35;o.armR=-0.35;o.legL+=0.1+pu*0.9*(sd<0?1:0.3)+Math.max(0,-sd)*0.5;o.legR+=-0.1-pu*0.9*(sd>0?1:0.3)-Math.max(0,sd)*0.5;}
      else if(sub===2){o.armL=0.15+pu*2.6+sd*0.9;o.armR=-0.15-pu*2.6+sd*0.9;o.legL+=0.1+sd*0.4+pu*0.3;o.legR+=-0.1+sd*0.4-pu*0.3;}
      else{o.armL=0.15+pu*2.7+sd*0.6;o.armR=-0.15-dn*2.7+sd*0.6;o.legL+=0.1+dn*0.6;o.legR+=-0.1-pu*0.6;}   /* one arm up, the other down */
      o.mouth=pu>0.85;
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
  /* Frame tweaks from the graphics lab: nudges to a dance's pose at chosen points in its 4-beat loop, blended in
     smoothly either side. DT["style.sub"] = [{q: beat 0-4, w: how wide (beats), armL, armR, legL, legR, bob, dx, rot}] */
  /* Looks saved in the graphics lab for an asset (brightness, contrast, saturation, hue), applied as a canvas filter
     where the browser supports it (Chrome, Edge, Firefox; Safari ignores it). */
  var ADJ={};function adjLoad(){try{ADJ=JSON.parse(localStorage.getItem("uk_assetadj")||"{}")||{};}catch(e){ADJ={};}}adjLoad();
  function adjCss(key){var a=ADJ[key];if(!a)return "";var o=[];if(a.bright&&a.bright!==1)o.push("brightness("+a.bright+")");if(a.contrast&&a.contrast!==1)o.push("contrast("+a.contrast+")");if(a.sat!==undefined&&a.sat!==1)o.push("saturate("+a.sat+")");if(a.hue)o.push("hue-rotate("+a.hue+"deg)");return o.join(" ");}
  var NOADJ=false;function withAdj(key,g,fn){var f=NOADJ?"":adjCss(key);if(!f||!("filter" in g)){return fn();}var was=g.filter;g.filter=f;try{return fn();}finally{g.filter=was;}}
  /* pixel edits painted in the Graphics lab (uk_paint): {layerKey:{"x,y":"#rrggbb" | "0" (a hole)}}, coordinates local to the part */
  var PT={},PC={},POFF=false;try{var pts=JSON.parse(localStorage.getItem("uk_paint")||"{}");if(pts&&typeof pts==="object")PT=pts;}catch(e){}
  function ptSave(){try{localStorage.setItem("uk_paint",JSON.stringify(PT));}catch(e){}}
  function ptBuild(key){var m=PT[key];if(!m)return null;var P=[],x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,k;
    for(k in m){if(!/^-?\d+,-?\d+$/.test(k))continue;var v=m[k];if(v!=="0"&&!/^#[0-9a-fA-F]{6}$/.test(v))continue;var q=k.split(","),x=+q[0],y=+q[1];if(Math.abs(x)>400||Math.abs(y)>400)continue;P.push([x,y,v]);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    if(!P.length)return null;var w=x1-x0+1,h=y1-y0+1,c=document.createElement("canvas"),hc=null,cg,hg,any=false;c.width=w;c.height=h;cg=c.getContext("2d");
    P.forEach(function(e){if(e[2]==="0"){if(!hc){hc=document.createElement("canvas");hc.width=w;hc.height=h;hg=hc.getContext("2d");hg.fillStyle="#000";}hg.fillRect(e[0]-x0,e[1]-y0,1,1);}else{cg.fillStyle=e[2];cg.fillRect(e[0]-x0,e[1]-y0,1,1);any=true;}});
    return{c:any?c:null,h:hc,x0:x0,y0:y0};}
  var DUMMYG=null,HOLEC=null;
  function ptGet(key){if(POFF)return null;if(!(key in PC))PC[key]=ptBuild(key);return PC[key];}
  var PAINT={get:function(k){return PT[k];},set:function(k,m,nosave){if(m&&Object.keys(m).length)PT[k]=m;else delete PT[k];delete PC[k];if(!nosave)ptSave();},save:ptSave,all:function(){return PT;},
    load:function(o){PT=o&&typeof o==="object"?o:{};PC={};ptSave();},clear:function(){PT={};PC={};ptSave();},off:function(b){POFF=!!b;},
    count:function(){return Object.keys(PT).length;},
    replaced:function(k){return !POFF&&!!(PT[k]&&PT[k]["!"]);},   /* redrawn from scratch: the original art is skipped, only the paint shows */
    dummy:function(){if(!DUMMYG){var dc=document.createElement("canvas");dc.width=dc.height=1;DUMMYG=dc.getContext("2d");}return DUMMYG;},
    /* instruments, keyboard, mic: erased pixels. The prop is drawn on a spare canvas, the holes cut out, then copied across */
    holes:function(key,g,x,y,p,fn){var e=POFF?null:ptGet(key);if(!e||!e.h||!g.canvas||!g.getTransform)return fn(g);
      var cvs=g.canvas,oc=HOLEC||(HOLEC=document.createElement("canvas"));if(oc.width!==cvs.width||oc.height!==cvs.height){oc.width=cvs.width;oc.height=cvs.height;}
      var o=oc.getContext("2d");o.setTransform(1,0,0,1,0,0);o.globalCompositeOperation="source-over";o.clearRect(0,0,oc.width,oc.height);o.setTransform(g.getTransform());o.imageSmoothingEnabled=false;
      var r=fn(o);o.globalCompositeOperation="destination-out";o.drawImage(e.h,Math.round(x+e.x0*p),Math.round(y+e.y0*p),e.h.width*p,e.h.height*p);o.globalCompositeOperation="source-over";
      g.save();g.setTransform(1,0,0,1,0,0);var was=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;g.drawImage(oc,0,0);g.imageSmoothingEnabled=was;g.restore();return r;},
    at:function(g,key,x,y,p){var e=ptGet(key);if(!e||!e.c)return;var was=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;g.drawImage(e.c,Math.round(x+e.x0*p),Math.round(y+e.y0*p),e.c.width*p,e.c.height*p);g.imageSmoothingEnabled=was;}};
  function paintLayer(key,tx,ty,rot){if(ISO&&ISO!==key.split(":")[0])return;var e=ptGet(key);if(!e)return;sg.save();sg.imageSmoothingEnabled=false;sg.translate(tx,ty);if(rot)sg.rotate(rot);
    if(e.h){sg.globalCompositeOperation="destination-out";sg.drawImage(e.h,e.x0,e.y0);sg.globalCompositeOperation="source-over";}
    if(e.c)sg.drawImage(e.c,e.x0,e.y0);sg.restore();
    masks();MUSED=true;[[pmg,e.c],[hmg,e.h]].forEach(function(m){if(!m[1])return;m[0].save();m[0].imageSmoothingEnabled=false;m[0].translate(tx,ty);if(rot)m[0].rotate(rot);m[0].drawImage(m[1],e.x0,e.y0);m[0].restore();});
    if(e.c){hmg.save();hmg.translate(tx,ty);if(rot)hmg.rotate(rot);hmg.globalCompositeOperation="destination-out";hmg.drawImage(e.c,e.x0,e.y0);hmg.restore();}}
  var DT={},DT_F=["armL","armR","legL","legR","bob","dx","rot"];
  try{var dts=JSON.parse(localStorage.getItem("uk_dtweak")||"{}");if(dts&&typeof dts==="object")DT=dts;}catch(e){}
  function dtSave(){try{localStorage.setItem("uk_dtweak",JSON.stringify(DT));}catch(e){}}
  function dance(style,sub,c,bp){
    var o=danceBase(style,sub,c,bp),kf=DT[style+"."+(sub|0)];
    if(kf&&kf.length){
      var q=((bp%4)+4)%4,k,f,d,w,wt;
      for(k=0;k<kf.length;k++){
        d=Math.abs(q-kf[k].q);d=Math.min(d,4-d);w=kf[k].w||0.35;if(d>=w)continue;wt=smooth(1-d/w);
        for(f=0;f<DT_F.length;f++){var nm=DT_F[f];if(kf[k][nm])o[nm]+=kf[k][nm]*wt;}
      }
      o.armL=clamp(o.armL,-3.3,3.3);o.armR=clamp(o.armR,-3.3,3.3);o.legL=clamp(o.legL,-1.2,1.2);o.legR=clamp(o.legR,-1.2,1.2);
    }
    return o;
  }
  var DTWEAK={
    all:function(){return JSON.parse(JSON.stringify(DT));},
    get:function(style,sub){return DT[style+"."+(sub|0)]||[];},
    set:function(style,sub,q,vals,w){var key=style+"."+(sub|0),list=DT[key]||(DT[key]=[]),i,hit=null;q=Math.round(q*100)/100;
      for(i=0;i<list.length;i++)if(Math.abs(list[i].q-q)<0.001)hit=list[i];
      if(!hit){hit={q:q};list.push(hit);list.sort(function(a,b){return a.q-b.q;});}
      DT_F.forEach(function(f){var n=+vals[f];if(isFinite(n)&&Math.abs(n)>0.001)hit[f]=Math.round(n*100)/100;else delete hit[f];});
      if(w)hit.w=+w;
      var empty=!DT_F.some(function(f){return hit[f];});if(empty){list.splice(list.indexOf(hit),1);if(!list.length)delete DT[key];}
      dtSave();},
    clear:function(style,sub){if(style===undefined)DT={};else delete DT[style+"."+(sub|0)];dtSave();},
    load:function(o){DT={};if(o&&typeof o==="object")for(var k in o)if(/^\d+\.\d+$/.test(k)&&Array.isArray(o[k]))DT[k]=o[k].filter(function(e){return e&&isFinite(+e.q);}).map(function(e){var r={q:+e.q};DT_F.forEach(function(f){if(isFinite(+e[f])&&+e[f])r[f]=+e[f];});if(+e.w)r.w=+e.w;return r;});dtSave();},
    count:function(){var n=0;for(var k in DT)n+=DT[k].length;return n;},
    fields:DT_F
  };

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
    var R=Math.max(P*7,Math.min(W,H)*G("f.discoSize",0.045)),cx=W/2,cy=-R*2+(sb+R*1.3+R*2)*k,t=now/1000,i;      /* hangs over the front of the dance floor */
    g.fillStyle="#6a5c8a";g.fillRect(Math.round(cx-P/4),0,Math.max(1,Math.round(P/2)),Math.max(0,cy-R));
    /* lit: a glow round it, and beams of light hitting it */
    g.save();g.globalCompositeOperation="lighter";var hal=g.createRadialGradient(cx,cy,R*0.6,cx,cy,R*3.2);hal.addColorStop(0,"rgba(255,240,255,"+(G("f.discoGlow",0.45)*k)+")");hal.addColorStop(1,"rgba(255,240,255,0)");
    g.fillStyle=hal;g.fillRect(cx-R*3.2,cy-R*3.2,R*6.4,R*6.4);g.restore();
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
      for(i=0;i<G("f.discoSpots",46);i++){var an=i*2.399+t*0.6,el=((i*0.618)%1),sx=W/2+Math.cos(an)*W*(0.15+0.55*el),sy=sb*0.2+(fb-sb*0.2)*((Math.sin(an*0.7+i)*0.5+0.5)*0.9+0.05),sz=Math.max(P,Math.round(P*(1+el)));
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
    var b=Math.max(3,Math.round(P*G("f.jumboFrame",2)));
    g.fillStyle="#3a3058";g.fillRect(Math.round(rc.x+rc.w*0.18),0,Math.max(2,Math.round(P/1.5)),Math.max(0,rc.y));g.fillRect(Math.round(rc.x+rc.w*0.82),0,Math.max(2,Math.round(P/1.5)),Math.max(0,rc.y));
    g.fillStyle="#15121F";g.fillRect(rc.x-b,rc.y-b,rc.w+b*2,rc.h+b*2+P*3);
    g.fillStyle="#2a2440";g.fillRect(rc.x-b,rc.y+rc.h+b,rc.w+b*2,P*3);
    for(var i=0;i<12;i++){g.fillStyle=TILECOL[(i+Math.floor(Date.now()/G("f.jumboLeds",250)))%TILECOL.length];g.fillRect(Math.round(rc.x-b+(rc.w+b*2)*(i+0.5)/12-P/2),Math.round(rc.y+rc.h+b+P),Math.max(1,P),Math.max(1,P));}
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
  var REACTS=["jump","hearts","bigheart","clap","whistle","spin","twirl"],REACT_MS={jump:1000,hearts:2400,bigheart:2600,clap:1900,whistle:1700,spin:800,twirl:1500};
  var HEART=[".XX.XX.","XXXXXXX","XXXXXXX",".XXXXX.","..XXX..","...X..."],NOTE=["..XX","..XX","..X.","..X.","XXX.","XXX."];
  function pixArt(g,rows,x,y,q,col,hi){for(var r=0;r<rows.length;r++)for(var c=0;c<rows[r].length;c++)if(rows[r][c]==="X"){g.fillStyle=hi&&r===1&&c===1?hi:col;g.fillRect(Math.round(x+c*q),Math.round(y+r*q),q,q);}}
  function reactLive(list,now){var out=[];if(!list)return out;for(var i=0;i<list.length;i++){var a=now-list[i].t;if(a>=0&&a<REACT_MS[list[i].k])out.push({k:list[i].k,a:a});}return out;}
  function reactPose(list,now,p){
    var L=reactLive(list,now);if(!L.length)return null;var r=L[L.length-1],a=r.a,o={lift:0};
    if(r.k==="jump"){var hop=(a%500)/500;o.lift=-Math.sin(hop*Math.PI)*p*11;o.armL=2.6;o.armR=-2.6;o.legL=-0.35*Math.sin(hop*Math.PI);o.legR=-o.legL;o.mouth=true;}
    else if(r.k==="spin"||r.k==="twirl"){   /* turn right round on the spot: the body squeezes thin as it turns side-on */
      var tw=r.k==="twirl",u=Math.min(1,a/(tw?1500:800)),ang=u*Math.PI*2*(tw?2:1),cs=Math.cos(ang);
      o.sx=Math.abs(cs)<0.14?(cs<0?-0.14:0.14):cs;o.lift=-Math.sin(Math.min(1,u*(tw?1.4:1.2))*Math.PI)*p*(tw?7:3);
      o.armL=tw?2.5:1.7;o.armR=tw?-2.5:-1.7;o.legL=0.25*Math.sin(ang*2);o.legR=-o.legL;o.mouth=tw;}
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
  /* a game can force show effects on for itself (the rink's disco ball, snow on the ice) over the performer's */
  var FORCE=null;
  function forced(fx){return FORCE?Object.assign({},FX_DEFAULT,fx||{},FORCE):fx;}
  var NEON=0;   /* neon night: set each frame by fxBack; characters are drawn as glowing outlines while it's on */
  function fxBack(g,W,H,lay,fx,st){
    fx=forced(fx);NEON=fx&&fx.neon?1:0;if(!fx)return;
    easeDrops(fx,(st&&st.now)||Date.now());
    banner(g,W,H,lay.stageBottom*H,sceneP(W,H),fx.bannerText,st&&st.jumbo);
    var P=sceneP(W,H),sb=lay.stageBottom*H,now=st.now||Date.now(),i,x,y;
    easeEnv(fx,now);drawSpace(g,W,H,sb,lay.floorBottom*H,P,now);
    if(fx.sunset&&env.space<0.99){
      /* the back wall opens to a sunset sky: a low sun behind the stage */
      var gr=g.createLinearGradient(0,0,0,sb);gr.addColorStop(0,"rgba(60,30,90,.85)");gr.addColorStop(0.45,"rgba(220,90,90,.75)");gr.addColorStop(0.8,"rgba(250,170,70,.8)");gr.addColorStop(1,"rgba(120,50,60,.85)");
      g.globalAlpha=Math.min(1,G("f.sunSky",1));g.fillStyle=gr;g.fillRect(0,P*6,W,sb-P*10);g.globalAlpha=1;
      var sx=W*0.5,sy=sb-P*12,sr=Math.min(W,H)*G("f.sunSize",0.09);
      g.fillStyle="rgba(255,210,90,.95)";for(y=-sr;y<=sr;y+=P)for(x=-sr;x<=sr;x+=P)if(x*x+y*y<=sr*sr&&sy+y<sb-P*6)g.fillRect(Math.round(sx+x),Math.round(sy+y),P,P);
      g.fillStyle="rgba(255,240,180,.35)";for(i=0;i<5;i++)g.fillRect(sx-sr*1.4,sy-sr*0.6+i*P*3,sr*2.8,P);
      /* a city skyline in silhouette */
      g.fillStyle="rgba(30,15,40,.9)";var bx=0,bi=0;while(bx<W){var bw2=P*(8+((bi*37)%9)),bh2=P*(6+((bi*53)%14));g.fillRect(bx,sb-P*6-bh2,bw2-P,bh2);bx+=bw2;bi++;}
    }
    if(fx.fire){
      /* a building ablaze behind the right side of the stage: windows glowing, flames on the roof, smoke */
      var fw=Math.max(P*22,W*0.16),fx0=W*0.68,fh=Math.min(sb*0.62,P*44),fy=sb-P*5-fh;
      g.fillStyle="#2a1a24";g.fillRect(fx0,fy,fw,fh);g.fillStyle="#1a0f16";g.fillRect(fx0+fw-P*2,fy,P*2,fh);
      for(y=fy+P*3;y<fy+fh-P*4;y+=P*6)for(x=fx0+P*3;x<fx0+fw-P*4;x+=P*6){var fl=0.5+0.5*Math.sin(now*0.01+x*0.7+y*1.3);g.fillStyle=fl>0.55?"#F5A030":"#C8501E";g.globalAlpha=Math.min(1,G("f.fireGlow",1));g.fillRect(x,y,P*3,P*3);g.globalAlpha=1;}
      for(i=0;i<Math.ceil(fw/P);i++){var hh=(3+5*Math.abs(Math.sin(now*0.008+i*1.9))+3*Math.abs(Math.sin(now*0.013+i*0.7)))*P*G("f.fireHeight",1);
        g.fillStyle="#E8505B";g.fillRect(fx0+i*P,fy-hh,P,hh);g.fillStyle="#F5D03C";g.fillRect(fx0+i*P,fy-hh*0.55,P,hh*0.55);}
      g.fillStyle="rgba(40,30,40,.45)";for(i=0;i<6;i++){var ph=((now/3000)+i/6)%1;g.fillRect(fx0+fw*0.3+Math.sin(ph*6+i)*P*6-ph*P*14,fy-P*10-ph*sb*0.5,P*(6+ph*10),P*(4+ph*6));}
    }
    /* neon night: the room goes black and the stage is traced in glowing tube lights */
    if(NEON){
      var nsb=lay.stageBottom*H,nfb=lay.floorBottom*H,nP=sceneP(W,H),nt=((st&&st.now)||Date.now())/1000;
      g.save();g.fillStyle="rgba(3,0,12,"+G("f.neonDark",0.86)+")";g.fillRect(0,0,W,H);
      function tube(pts,col,wd){g.shadowColor=col;g.shadowBlur=nP*G("f.neonGlow",4);g.strokeStyle=col;g.lineWidth=Math.max(2,nP*G("f.neonWidth",0.9)*(wd||1));g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(var k=1;k<pts.length;k++)g.lineTo(pts[k][0],pts[k][1]);g.stroke();
        g.shadowBlur=0;g.strokeStyle="rgba(255,255,255,.7)";g.lineWidth=Math.max(1,nP*0.3);g.stroke();}
      var pul=0.75+0.25*Math.sin(nt*2);
      g.globalAlpha=pul;
      tube([[0,nP*7],[W,nP*7]],"#3DF2FF");                                              /* the truss */
      tube([[W*0.1,nP*7],[W*0.1,nsb]],"#3DF2FF");tube([[W*0.9,nP*7],[W*0.9,nsb]],"#3DF2FF");
      tube([[0,nsb],[W,nsb]],"#FF3DA8",1.4);                                              /* the lip of the stage */
      g.globalAlpha=0.5*pul;
      for(var gx=-6;gx<=6;gx++)tube([[W/2+gx*W*0.06,nsb],[W/2+gx*W*0.16,nfb]],"#8A5CFF",0.6);   /* the floor grid running away from you */
      for(var gy=1;gy<6;gy++){var yy=nsb+(nfb-nsb)*Math.pow(gy/6,1.6);tube([[0,yy],[W,yy]],"#8A5CFF",0.6);}
      g.globalAlpha=1;g.restore();
    }
  }
  function px2(g,x,y,P,c){g.fillStyle=c;g.fillRect(Math.round(x/P)*P,Math.round(y/P)*P,P,P);}
  function fxFront(g,W,H,lay,fx,st){
    fx=forced(fx);if(!fx)return;
    var P=sceneP(W,H),sb=lay.stageBottom*H,fb=lay.floorBottom*H,now=st.now||Date.now(),t=now/1000,i,x,y,ph=st.phase||0,beat=Math.pow(1-ph,2);
    /* fog rolling across the floor */
    if(fx.fog>0){
      g.save();
      for(i=0;i<14;i++){var fxp=((t*0.03*(1+i%3)+i*0.137)%1.4-0.2)*W,fyp=sb+(fb-sb)*(0.25+0.7*((i*0.61)%1)),rr=W*0.12+(i%4)*W*0.03;
        var gg=g.createRadialGradient(fxp,fyp,0,fxp,fyp,rr);gg.addColorStop(0,"rgba(200,195,230,"+(G("f.fog",0.16)*fx.fog)+")");gg.addColorStop(1,"rgba(200,195,230,0)");
        g.fillStyle=gg;g.fillRect(fxp-rr,fyp-rr,rr*2,rr*2);}
      g.restore();
    }
    /* rain or a storm: streaks falling at a slant, splashes on the floor */
    if(fx.weather==="rain"||fx.weather==="storm"){
      /* wx: how heavy the weather is (0-1, 0.6 = the usual) */
      var wxk=wxAmt(fx),n=Math.round((fx.weather==="storm"?260:150)*wxk*G("f.rain",1)),sl=(fx.weather==="storm"?0.35:0.15)*(0.6+wxk*0.6);
      g.fillStyle=fx.weather==="storm"?"rgba(170,190,230,.55)":"rgba(170,190,230,.45)";
      for(i=0;i<n;i++){var sp=0.9+((i*7919)%100)/120,yy=((t*H*sp*1.1+i*(H/n)*7.3)%(H*1.1))-H*0.05,xx=((i*263.7)%W)+yy*sl;xx%=W;
        g.fillRect(Math.round(xx),Math.round(yy),Math.max(1,P/2),P*3);}
      g.fillStyle="rgba(200,215,255,.5)";
      for(i=0;i<20;i++){var sp2=((t*2+i*0.37)%1),spx=((i*331.3)%W),spy=sb+(fb-sb)*((i*0.73)%1);if(sp2<0.3){var r2=sp2*12*P/3;g.fillRect(spx-r2,spy,r2*2,Math.max(1,P/2));}}
    }
    if(fx.weather==="snow"){
      g.fillStyle="rgba(240,245,255,.9)";
      for(i=0;i<Math.round(140*wxAmt(fx)*G("f.snow",1));i++){var sp3=0.3+((i*37)%10)/25,yy2=((t*H*sp3*0.18+i*(H/140)*9.1)%(H*1.05)),xx2=((i*197.3)%W)+Math.sin(t*0.8+i)*P*4;
        var sz=i%5===0?P:Math.max(1,Math.round(P/2));g.fillRect(Math.round(xx2),Math.round(yy2),sz,sz);}
    }
    /* lasers fanning out from the stage over the crowd, sweeping with the music */
    if(fx.lasers){
      g.save();g.globalCompositeOperation="lighter";
      var srcs=[[W*0.15,sb*0.25],[W*0.85,sb*0.25]],lc=["#E8505B","#4CC38A","#4A9BE8","#D354A0"];
      srcs.forEach(function(sp4,si){
        for(var k=0;k<G("f.laserN",5);k++){var a=Math.PI/2+Math.sin(t*0.9*G("f.laserSpeed",1)+k*0.6+si*2)*0.9+(si?0.25:-0.25),len=Math.max(W,H)*1.2;
          g.strokeStyle=lc[(k+si+Math.floor(t*2))%lc.length];g.globalAlpha=Math.min(1,(0.35+0.4*beat)*G("f.laser",1));g.lineWidth=Math.max(1,P/2*G("f.laserW",1));
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
      dg.globalCompositeOperation="source-over";dg.clearRect(0,0,W,H);dg.fillStyle="rgba(4,3,10,"+(dark*G("f.dark",0.88))+")";dg.fillRect(0,0,W,H);
      dg.globalCompositeOperation="destination-out";
      var holes=(st.holes||[]).slice();
      if(fx.fire)holes.push({x:W*0.68+Math.max(P*22,W*0.16)/2,y:sb*0.5,r:Math.max(W,H)*0.2});
      holes.forEach(function(h0){var h={x:h0.x,y:h0.y,r:h0.r*G("f.pool",1)};var rg=dg.createRadialGradient(h.x,h.y,0,h.x,h.y,h.r);rg.addColorStop(0,"rgba(0,0,0,.9)");rg.addColorStop(1,"rgba(0,0,0,0)");dg.fillStyle=rg;dg.fillRect(h.x-h.r,h.y-h.r,h.r*2,h.r*2);});
      g.drawImage(dc,0,0);
    }
    /* embers off the fire, drifting over everything */
    if(fx.fire){for(i=0;i<G("f.embers",26);i++){var ep=((t*0.25+i*0.071)%1),ex=W*0.7+Math.sin(t+i*1.7)*W*0.18-ep*W*0.1,ey=sb*0.4-ep*sb*0.5+((i*13)%7)*P;
      g.globalAlpha=1-ep;px2(g,ex,ey+ep*H*0.6,P,i%3?"#F5A030":"#F5D03C");}g.globalAlpha=1;}
    /* fireworks: rockets climb from behind the stage and burst over it */
    if(fx.burst&&fx.burst!==lastBurst){lastBurst=fx.burst;for(i=0;i<5;i++)rocks.push({x:W*(0.15+0.7*Math.random()),t0:now+i*220,top:sb*(0.08+Math.random()*0.35),c:TILECOL[Math.floor(Math.random()*TILECOL.length)]});}
    if(fx.fireworks&&now>nextAuto){nextAuto=now+(900+Math.random()*2200)/G("f.fwRate",1);rocks.push({x:W*(0.12+0.76*Math.random()),t0:now,top:sb*(0.08+Math.random()*0.4),c:TILECOL[Math.floor(Math.random()*TILECOL.length)]});}
    var keep=[];
    rocks.forEach(function(r){var a=(now-r.t0)/700;if(a<0){keep.push(r);return;}
      if(a<1){var ry=sb-(sb-r.top)*Math.sin(a*Math.PI/2);px2(g,r.x,ry,P,"#FFF6D0");g.globalAlpha=0.5;px2(g,r.x,ry+P*2,P,r.c);g.globalAlpha=1;keep.push(r);}
      else{for(var k=0;k<34;k++){var an=k/34*Math.PI*2,v=0.06+(k%3)*0.025;sparks.push({x:r.x,y:r.top,vx:Math.cos(an)*v,vy:Math.sin(an)*v,t0:now,c:k%4?r.c:"#FFF6D0"});}}});
    rocks=keep;
    var ks=[];
    sparks.forEach(function(s2){var a2=now-s2.t0;var SL=G("f.sparkLife",1300);if(a2>SL)return;var k2=1-a2/SL;
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
    /* EDM: the whole room washed in cyan or magenta, flipping on the beat, a hit of light on each one, haze lit from behind the stage */
    if(fx.lights==="edm"){
      var eb=Math.floor(now/(60000/128))%2,ec=eb?"61,242,255":"255,61,168";
      g.save();g.fillStyle="rgba(8,2,26,"+G("f.edmNight",0.5)+")";g.fillRect(0,0,W,H);                        /* night first, then the colour */
      g.globalCompositeOperation="overlay";g.fillStyle="rgba("+ec+","+G("f.edmTint",0.55)+")";g.fillRect(0,0,W,H);
      g.globalCompositeOperation="lighter";g.fillStyle="rgba("+ec+","+(0.04+0.08*beat)+")";g.fillRect(0,0,W,H);
      var hz=g.createRadialGradient(W/2,sb*0.6,0,W/2,sb*0.6,Math.max(W,H)*0.7);hz.addColorStop(0,"rgba("+ec+",.2)");hz.addColorStop(1,"rgba("+ec+",0)");g.fillStyle=hz;g.fillRect(0,0,W,H);
      for(var eb2=0;eb2<6;eb2++){var ang=Math.PI/2+Math.sin(t*1.3+eb2*1.1)*0.75,bl=Math.max(W,H)*1.1,bx0=W*(0.2+eb2*0.12),by0=sb*0.35;
        g.fillStyle="rgba("+(eb2%2?"61,242,255":"255,61,168")+","+(0.07+0.07*beat)+")";g.beginPath();g.moveTo(bx0,by0);g.lineTo(bx0+Math.cos(ang-0.05)*bl,by0+Math.sin(ang-0.05)*bl);g.lineTo(bx0+Math.cos(ang+0.05)*bl,by0+Math.sin(ang+0.05)*bl);g.closePath();g.fill();}
      g.restore();
    }
    if(fx.lights==="strobe"&&ph<G("f.strobeLen",0.08)){g.fillStyle="rgba(255,255,255,"+(G("f.strobe",0.5)*(1-ph/G("f.strobeLen",0.08)))+")";g.fillRect(0,0,W,H);}
  }
  var dkc=null;function darkCanvas(W,H){if(!dkc)dkc=canv(W,H);if(dkc.width!==W||dkc.height!==H){dkc.width=W;dkc.height=H;}return dkc;}
  /* the show's controls, with their defaults (also what the server accepts) */
  /* how heavy the weather is: the slider's 0-1 as a multiplier (0.6, the default, is the usual amount) */
  function wxAmt(fx){var w=fx&&fx.wx!==undefined?+fx.wx:0.6;if(!isFinite(w))w=0.6;return 0.15+Math.max(0,Math.min(1,w))*1.42;}
  var FX_DEFAULT={wx:0.6,neon:0,lights:"auto",fog:0,lasers:0,dark:0,weather:"none",sunset:0,fire:0,fireworks:0,burst:0,
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
  return{get neon(){return !!NEON;},setForce:function(f){FORCE=f||null;},get forcing(){return !!FORCE;},KEEPY:{TYPES:KTYPES,make:keepyMake,advance:keepyAdvance,hit:keepyHit,draw:function(g,objs,P,sc,now){objs.forEach(function(o){withAdj("prop:"+o.type,g,function(){keepyDraw(g,[o],P,sc,now);});});}},rink:function(g,G0,now,k,ice){return withAdj(ice?"prop:ice":"prop:rink",g,function(){return rink(g,G0,now,k,ice);});},rinkGeom:rinkGeom,walkStep:walkStep,walkPose:walkPose,footShadow:footShadow,keyPad:keyPad,keyPadSpot:keyPadSpot,VERSION:"1.55.2",REACTS:REACTS,REACT_MS:REACT_MS,reactPose:reactPose,reactFx:reactFx,envPose:envPose,envFx:envFx,waterY:waterY,crowdPose:crowdPose,follower:follower,primeFx:primeFx,jumboFrame:jumboFrame,crowdFx:crowdFx,crowdLift:crowdLift,CROWD_MS:CROWD_MS,CROWD_KINDS:CROWD_KINDS,fxBack:fxBack,fxFront:fxFront,FX_DEFAULT:FX_DEFAULT,DANCES:DANCES,dance:dance,base:danceBase,DTWEAK:DTWEAK,maker:maker,drawChar:drawChar,joints:joints,LIMB:LIMB,pixText:pixText,scene:scene,sceneP:sceneP,keyboard:function(g,x,y,p,l,c){return withAdj("prop:keyboard",g,function(){var r=PAINT.holes("keyboard",g,x,y,p,function(gg){return keyboard(PAINT.replaced("keyboard")?PAINT.dummy():gg,x,y,p,l,c);});PAINT.at(g,"keyboard",x,y,p);return r;});},micStand:function(g,x,y,p){return withAdj("prop:mic",g,function(){var r=PAINT.holes("mic",g,x,y,p,function(gg){return micStand(PAINT.replaced("mic")?PAINT.dummy():gg,x,y,p);});PAINT.at(g,"mic",x,y,p);return r;});},reloadAdj:adjLoad,paint:PAINT,isolate:function(p){ISO=p||null;},hideChars:function(b){HIDECHAR=!!b;},noAdj:function(b){NOADJ=!!b;},withAdj:withAdj,
    looks:{OPTS:OPTS,KEYS:KEYS,count:count,pack:pack,unpack:unpack,random:random,fromColor:fromColor,topColor:topColor,colOf:colOf,SKIN:SKIN,HAIRCOL:HAIRCOL,CLOTH:CLOTH},shade:shade};
})();
