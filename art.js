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
PIXFONT["+"]=[0,4,4,31,4,4,0];PIXFONT[":"]=[0,12,12,0,12,12,0];PIXFONT[","]=[0,0,0,0,12,4,8];PIXFONT["/"]=[1,1,2,4,8,16,16];PIXFONT["<"]=[2,4,8,16,8,4,2];PIXFONT[">"]=[8,4,2,1,2,4,8];


var ART=(function(){
  function G(k,d){return typeof GFX!=="undefined"?GFX.v(k):d;}   /* graphics lab values (gfx.js) */
  /* ---------------- the character maker's options ---------------- */
  var SKIN=["#F6D3B3","#E8B48A","#C98B5E","#A0663E","#7A4A2A","#4E2F1B"];
  var HAIRCOL=["#1E1A24","#5A3A22","#9A6034","#E0B850","#D8D8E0","#E8505B","#4A9BE8","#9B7FE0","#4CC38A","#F28AC0","#3FC8B8"];
  var CLOTH=["#E8505B","#F0A040","#F5D03C","#4CC38A","#2F8F6A","#4A9BE8","#2D4E9B","#9B7FE0","#D354A0","#EDEDF5","#5A5670","#26222F"];
  var OPTS={
    skin:{label:"Skin",n:SKIN.length,col:SKIN},
    hair:{label:"Hair",names:["Bald","Short","Spiky","Long","Mohawk","Afro","Ponytail","Beanie","Bob","Bangs","Bun","Pigtails","Braid","Curly","Side swoop","Long waves","Pixie","Buzz","Bowl cut","Quiff","Messy","Shoulder length","High ponytail","Flame spikes","Widow's peak","Long locks","Bob & headband","Side tail","Fluffy mop","Wild crop","Swept mop","Crew cut"]},
    hairCol:{label:"Hair colour",n:HAIRCOL.length,col:HAIRCOL},
    top:{label:"Top",names:["T-shirt","Tank top","Hoodie","Jacket","Striped tee","Suit","Waistcoat","Hi-vis vest","Jersey","Chef coat","Lab coat","Leather jacket","Tuxedo","Polo","Doublet","Robe","Turtleneck","Flannel","Band tee","Uniform","Crop top","Open coat"]},
    topCol:{label:"Top colour",n:CLOTH.length,col:CLOTH},
    bottom:{label:"Bottoms",names:["Jeans","Shorts","Skirt","Track pants","Overalls","Long dress","Hose","Cargo pants","Kilt","Bell-bottoms","Ripped jeans","Shorts & leggings","Mini skirt"]},
    botCol:{label:"Bottoms colour",n:CLOTH.length,col:CLOTH},
    extra:{label:"Extra",names:["Nothing","Shades","Headphones","Cap","Bandana","Mask"]},
    shoes:{label:"Shoes",names:["Sneakers","White sneakers","Red sneakers","Boots","High-tops","Dress shoes","Sandals","Pointy shoes","Rain boots","Platforms"]},
    hat:{label:"Hat",names:["No hat","Hard hat","Chef hat","Fire helmet","Police cap","Top hat","Cowboy hat","Wizard hat","Crown","Beret","Feathered cap","Hood","Racing helmet","Goggles","Witch hat"]},
    face:{label:"Face",names:["Plain","Moustache","Beard","Goatee","Glasses","Round glasses","Eye patch","Freckles","Blush","Stubble"]},
    held:{label:"Holding",names:["Nothing","Violin","Electric guitar"]}
  };
  /* which options the character maker's Male / Female / Both switch shows: one letter per option, m or f (u = anyone) */
  OPTS.hair.g="muufuufufffffuuffmmmuffumuffuu";   /* Bald, Buzz, Bowl cut, Quiff, Widow's peak: m. Long, Ponytail, Bob, Bangs, Bun, Pigtails, Braid, Long waves, Pixie, Shoulder length, High ponytail, Bob & headband, Side tail: f */
  OPTS.face.g="ummmuuuuum";                        /* moustache, beard, goatee, stubble */
  OPTS.bottom.g="uufuuuuuuuuuf";                   /* skirt, mini skirt */
  function gOk(key,i,gd){var t=OPTS[key].g;if(!t||!gd||gd==="b")return true;var c=t[i]||"u";return c==="u"||c===gd;}
  var KEYS=["skin","hair","hairCol","top","topCol","bottom","botCol","extra","shoes","hat","face","held"];
  function count(k){var o=OPTS[k];return o.names?o.names.length:o.n;}
  var B36="0123456789abcdefghijklmnopqrstuvwxyz";
  /* a look packs into one character per option (12 now; older 8-character looks still read, the newer options plain) */
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
  var TOFF=null;   /* three-quarter views: some parts (face, hair, hat) slide a pixel toward the way they're turned */
  var SHF=null;   /* per-part shifts made with Shift all in the pixel editor: {hair:[dx,dy],...} */
  function px(x,y,w,h,c){if(ISO&&SEC!==ISO)return;var sh=SHF&&SHF[SEC];sg.fillStyle=c;sg.fillRect(OX+x+(TOFF&&TOFF[SEC]||0)+(sh?sh[0]:0),OY+y+(sh?sh[1]:0),w,h);}
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
    /* 8 ways to face: 0 front, 1 right side, 2 back, 4 front three-quarter (turned to the right), 5 back three-quarter (turned right).
       The left-hand ones are these mirrored (drawChar does that). FT / BT: drawing a front / back three-quarter view */
    SHF=null;if(!POFF)["hair","hat","face","extra","top","bottom"].forEach(function(p){var m0=PT[p+":"+(L[p]|0)];if(m0&&m0["@"]){var q0=m0["@"].split(","),d0=st.dir|0;if(!SHF)SHF={};SHF[p]=[(d0===0||d0===4)?+q0[0]||0:0,+q0[1]||0];}});
    var FT=(st.dir|0)===4?1:0,BT=(st.dir|0)===5?1:0;TOFF=FT?{head:1,face:2,extra:2,hair:1,hat:1}:BT?{head:1}:null;
    function dimF(cols){return cols.map(function(c){return [c[0],shade(c[1],-0.25)];});}
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
    if(H===28){px(-7,-14+hb,14,6,hc);}
    if(H===30){px(-7,-15+hb,14,7,hc);px(-6,-8+hb,12,1,hcD);}   /* swept mop: rounded volume behind the head */   /* fluffy mop: volume behind the head */
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
    var D=st.dir|0;if(D===4)D=0;if(D===5)D=2;
    if(D===1||D===2){
    /* ======== turned round: the side view (facing right; facing left is this flipped) and the back view ========
       Same parts and colours as the front, drawn as they look from the side or from behind. Pixel-editor paint is front-only. */
    sg.clearRect(0,0,CWD,CHT);
    var T=L.top|0,WH="#EDEDF5",BLK="#15121F",GOLD="#E0B850",HR=L.hair|0,EX=L.extra|0,FC=L.face|0,HT=L.hat|0,RIB="#E8505B";
    var SHORT={0:1,4:1,7:1,8:1,13:1,18:1,20:1},sleeve=L.top===1?0:SHORT[T]?3:7.5,armTop=L.top===3?tcD:T===6||T===9||T===10?WH:T===7?"#5A5670":tc;
    function armC(n){return sleeve?[[Math.min(sleeve,n-2)*n/9+0.01,armTop],[n,skin]]:[[n,skin]];}
    function dim(cols){return cols.map(function(c){return [c[0],shade(c[1],-0.25)];});}
    var nL=Math.max(3,Math.min(9,st.lenL||9)),nR=Math.max(3,Math.min(9,st.lenR||9)),base=(T===6||T===9||T===10)?WH:tc;
    var hcL2=shade(hc,0.25);
    var dark=rgb(tc)[0]+rgb(tc)[1]+rgb(tc)[2]<250;
    /* side-view hair (facing right: the face is at +x, the back of the head at -x) */
    var capS=function(){px(-4,-15+hy,8,1,hcD);px(-4,-14+hy,8,1,hc);px(-5,-14+hy,2,6,hc);px(-3,-13+hy,2,3,hc);px(2,-13+hy,1,1,hc);};
    var longS=function(to){px(-6,-13+hb,3,to+13,hc);px(-6,to-1+hb,3,1,hcD);};
    var sideHair=function(){var H=HR;
      if(H===0)return;
      if(H===17){var bz=shade(hc,-0.1);px(-4,-15+hy,8,2,bz);px(-5,-14+hy,1,4,bz);px(-3,-14+hy,1,1,hcL2);px(0,-14+hy,1,1,hcL2);return;}
      if(H===4){px(-4,-15+hy,8,1,hcD);px(-4,-18+hy,7,3,hc);px(-3,-19+hy,5,1,hc);px(-2,-18+hy,4,1,hcL2);return;}
      if(H===5){px(-7,-20+hy,11,6,hc);px(-6,-21+hy,8,1,hc);px(-8,-18+hy,1,6,hc);px(-7,-14+hy,5,6,hc);px(-6,-9+hy,3,1,hcD);return;}
      if(H===8||H===26){px(-4,-17+hy,7,1,hc);px(-5,-16+hy,9,3,hc);px(-6,-14+hy,4,8,hc);px(-3,-13+hy,1,3,hc);px(2,-13+hy,2,1,hc);px(-6,-7+hy,4,1,hcD);px(-3,-16+hy,4,1,hcL2);
        if(H===26){px(-4,-15+hy,8,1,RIB);px(-5,-14+hy,1,1,RIB);}return;}
      if(H===13){px(-8,-18+hy,11,5,hc);px(-8,-13+hy,5,8,hc);px(-9,-16+hy,1,7,hc);px(1,-14+hy,2,1,hc);for(var c2=-8;c2<3;c2+=3)px(c2,-17+hy,1,1,hcD);px(-7,-6+hy,4,1,hcD);return;}
      if(H===18){px(-4,-17+hy,8,1,hc);px(-5,-16+hy,9,4,hc);px(-5,-12+hy,3,3,hc);px(1,-13+hy,3,1,hc);px(-5,-13+hy,9,1,hcD);px(-2,-16+hy,4,1,hcL2);return;}
      if(H===28){px(-6,-18+hy,10,5,hc);px(-5,-19+hy,6,1,hc);px(-7,-17+hy,1,3,hc);px(-6,-13+hy,3,5,hc);px(1,-13+hy,3,2,hc);px(2,-11+hy,1,1,hc);px(-3,-18+hy,1,3,hcD);px(0,-19+hy,2,1,hcL2);return;}
      if(H===30){px(-7,-20+hy,10,7,hc);px(-5,-21+hy,7,1,hc);px(-8,-18+hy,1,6,hc);px(-7,-13+hy,4,6,hc);px(-6,-7+hy,3,1,hcD);px(2,-19+hy,3,3,hc);px(3,-16+hy,2,2,hc);px(4,-14+hy,1,1,hc);px(-6,-17+hy,6,1,hcD);px(-4,-18+hy,1,1,hcD);px(-3,-21+hy,4,1,hcL2);px(0,-20+hy,3,1,hcL2);return;}   /* swept mop: big swoop up and back */
      if(H===31){px(-4,-18+hy,8,1,hc);px(-5,-17+hy,9,3,hc);px(-5,-14+hy,3,4,hc);px(3,-18+hy,2,1,hc);px(4,-17+hy,1,2,hc);px(2,-14+hy,2,1,hc);px(-5,-11+hy,3,1,hcD);px(-5,-15+hy,9,1,hcD);px(-2,-18+hy,4,1,hcL2);return;}   /* crew cut: short, a little lift at the front */
      if(H===16){px(-4,-15+hy,8,2,hc);px(-4,-15+hy,8,1,hcD);px(-5,-14+hy,2,4,hc);px(2,-13+hy,2,1,hc);px(0,-16+hy,3,1,hc);return;}
      if(H===22){px(-4,-15+hy,8,2,hc);px(-4,-15+hy,8,1,hcD);px(-5,-14+hy,2,5,hc);px(-3,-17+hy,2,2,hc);px(-3,-17+hy,2,1,RIB);px(-6,-18+hy,3,2,hc);px(-7,-16+hy,2,6,hc);px(-7,-10+hy,2,3,hcD);return;}
      if(H===23){capS();px(-5,-17+hy,2,3,hc);px(-4,-20+hy,2,4,hc);px(-3,-23+hy,2,8,hc);px(-1,-21+hy,2,6,hc);px(1,-18+hy,2,3,hc);px(-6,-16+hy,1,2,hc);px(-3,-22+hy,1,3,hcL2);px(-1,-20+hy,1,4,hcD);return;}
      if(H===24){capS();px(-4,-17+hy,7,2,hc);for(var w2=0;w2<4;w2++)px(-5+w2*2,-19+(w2%2)+hy,1,3,hc);px(-2,-17+hy,4,1,hcL2);return;}
      capS();
      if(H===2){for(var s2=-4;s2<4;s2+=2)px(s2,-17+hy,1,2,hc);px(-3,-16+hy,6,1,hc);}
      if(H===3)longS(-3);
      if(H===6){px(-6,-12+hy,2,6,hc);px(-6,-7+hy,2,1,hcD);}
      if(H===7){px(-5,-17+hy,9,3,hc);px(1,-18+hy,4,1,hcL2);px(-4,-14+hy,8,1,shade(hc,0.35));}
      if(H===9){px(1,-13+hy,3,2,hc);longS(-4);}
      if(H===10){px(-3,-19+hy,4,4,hc);px(-2,-19+hy,2,1,hcL2);px(-3,-16+hy,4,1,hcD);}
      if(H===11){px(-8,-13+hy,3,7,hc);px(-8,-6+hy,2,1,hcD);px(-6,-13+hy,1,1,RIB);}
      if(H===12){for(var k2=0;k2<6;k2++)px(-6+(k2%2),-10+k2*2+hb,2,2,k2%2?hcD:hc);px(-6,2+hb,2,1,RIB);}
      if(H===14){px(0,-14+hy,4,2,hc);px(1,-15+hy,3,1,hcL2);longS(-3);}
      if(H===15){for(var v2=0;v2<14;v2++)px(-6+((v2>>1)%2),-13+v2+hb,3,1,hc);px(-4,-13+hb,1,12,hcD);}
      if(H===19){px(-2,-17+hy,6,2,hc);px(0,-18+hy,5,1,hcL2);px(3,-17+hy,2,1,hcL2);}
      if(H===20){px(-4,-17+hy,1,2,hc);px(-2,-18+hy,2,3,hc);px(1,-17+hy,2,2,hc);px(-6,-13+hy,1,4,hc);px(2,-13+hy,2,2,hc);}
      if(H===21)longS(-5);
      if(H===25){px(1,-13+hy,3,2,hc);longS(1);}
      if(H===27){px(-8,-15+hy,4,4,hc);px(-9,-12+hy,2,5,hc);px(-9,-8+hy,1,2,hcD);px(-5,-14+hy,1,1,RIB);}
      if(H===29){px(-5,-17+hy,2,2,hc);px(-2,-18+hy,2,2,hc);px(1,-17+hy,2,2,hc);px(-6,-14+hy,1,3,hc);px(3,-14+hy,1,1,hc);}
    };
    /* back-view hair: the whole back of the head, longer styles hanging down over the shoulders */
    var coverB=function(){px(-5,-15+hy,10,8,hc);px(-5,-15+hy,10,1,hcD);px(-5,-8+hy,10,1,hcD);px(-2,-14+hy,4,1,hcL2);};
    var longB=function(to){px(-6,-14+hb,12,to+14,hc);px(-6,to-1+hb,12,1,hcD);px(-2,-14+hb,4,1,hcL2);};
    var backHair=function(){var H=HR;
      if(H===0)return;
      if(H===17){var bz=shade(hc,-0.1);px(-5,-15+hy,10,6,bz);for(var b3=-4;b3<5;b3+=2)px(b3,-14+hy,1,1,hcL2);return;}
      if(H===4){px(-1,-19+hy,2,10,hc);px(-1,-19+hy,1,10,hcD);return;}
      if(H===5){px(-7,-20+hy,14,13,hc);px(-6,-21+hy,12,1,hc);px(-8,-17+hy,1,8,hc);px(7,-17+hy,1,8,hc);px(-6,-8+hy,12,1,hcD);return;}
      if(H===8||H===26){px(-6,-16+hy,12,10,hc);px(-5,-17+hy,10,1,hc);px(-6,-7+hy,12,1,hcD);if(H===26)px(-6,-15+hy,12,1,RIB);return;}
      if(H===13){px(-8,-18+hy,16,13,hc);px(-9,-15+hy,1,7,hc);px(8,-15+hy,1,7,hc);for(var c3=-8;c3<8;c3+=3){px(c3,-6+hy,2,1,hcD);px(c3+1,-17+hy,1,1,hcD);}return;}
      if(H===18){px(-6,-17+hy,12,6,hc);px(-5,-18+hy,10,1,hc);px(-6,-12+hy,12,1,hcD);return;}
      if(H===28){px(-7,-18+hy,14,11,hc);px(-8,-16+hy,1,4,hc);px(7,-15+hy,1,4,hc);px(-5,-8+hy,10,1,hcD);return;}
      if(H===31){px(-6,-17+hy,12,6,hc);px(-5,-18+hy,10,1,hc);px(-6,-11+hy,12,1,hcD);px(-3,-17+hy,6,1,hcL2);return;}
      if(H===30){px(-7,-19+hy,14,11,hc);px(-6,-20+hy,12,1,hc);px(-8,-17+hy,1,6,hc);px(7,-17+hy,1,6,hc);px(-6,-9+hy,12,1,hcD);px(-4,-17+hy,3,1,hcD);px(1,-18+hy,3,1,hcD);return;}
      if(H===3)longB(-3);else if(H===9)longB(-4);else if(H===21)longB(-5);else if(H===25)longB(1);
      else if(H===15){longB(-1);for(var v3=0;v3<14;v3+=2){px(-7,-12+v3+hb,1,1,hc);px(6,-11+v3+hb,1,1,hc);}}
      else coverB();
      if(H===2){for(var s3=-5;s3<5;s3+=2)px(s3,-17+hy,1,2,hc);px(-4,-16+hy,8,1,hc);}
      if(H===6){px(-7,-13+hy,2,6,hc);px(-7,-7+hy,2,1,hcD);}
      if(H===7){px(-6,-17+hy,12,3,hc);px(-5,-18+hy,10,1,hc);}
      if(H===10){px(-3,-19+hy,6,4,hc);px(-2,-19+hy,4,1,hcL2);px(-3,-16+hy,6,1,hcD);}
      if(H===11){px(-9,-13+hy,3,7,hc);px(6,-13+hy,3,7,hc);px(-6,-13+hy,1,1,RIB);px(5,-13+hy,1,1,RIB);}
      if(H===12){for(var k3=0;k3<6;k3++)px(-1+(k3%2)-1,-8+k3*2+hb,2,2,k3%2?hcD:hc);px(-2,4+hb,2,1,RIB);}
      if(H===14){px(5,-13+hy,2,11,hc);px(5,-3+hy,2,1,hcD);}
      if(H===16){px(-5,-16+hy,4,1,hc);}
      if(H===19){px(-4,-17+hy,8,2,hc);px(-2,-18+hy,4,1,hcL2);}
      if(H===20){px(-5,-17+hy,1,2,hc);px(-3,-18+hy,2,3,hc);px(0,-17+hy,2,2,hc);px(3,-18+hy,1,3,hc);px(-6,-13+hy,1,4,hc);px(5,-13+hy,1,4,hc);}
      if(H===22){px(-1,-17+hy,2,1,RIB);px(-1,-16+hy,2,10,hc);px(-1,-7+hy,2,2,hcD);}
      if(H===23){px(-6,-18+hy,2,4,hc);px(-4,-21+hy,2,7,hc);px(-2,-23+hy,2,9,hc);px(0,-23+hy,2,9,hc);px(2,-21+hy,2,7,hc);px(4,-18+hy,2,4,hc);px(-1,-22+hy,1,3,hcL2);px(1,-22+hy,1,7,hcD);}
      if(H===24){for(var w3=-5;w3<5;w3+=2)px(w3,-19+hy+((w3+5)%4?1:0),1,2,hc);px(-5,-17+hy,10,2,hc);}
      if(H===27){px(5,-15+hy,4,4,hc);px(7,-12+hy,2,5,hc);px(8,-8+hy,1,2,hcD);px(5,-14+hy,1,1,RIB);}
      if(H===29){px(-6,-17+hy,2,2,hc);px(-3,-18+hy,2,2,hc);px(1,-18+hy,2,2,hc);px(4,-17+hy,2,2,hc);px(-6,-14+hy,1,3,hc);px(5,-14+hy,1,3,hc);}
    };
    var sideHat=function(){var ht=HT;
      if(ht===1){px(-5,-17+hy,9,3,"#F5D03C");px(-5,-14+hy,11,1,"#D8B020");px(-3,-17+hy,2,1,"#FFF2A0");}
      if(ht===2){px(-4,-15+hy,8,2,WH);px(-5,-21+hy,9,6,WH);px(-5,-21+hy,1,6,"#D8D8E4");px(-1,-20+hy,1,5,"#D8D8E4");}
      if(ht===3){px(-5,-18+hy,9,4,"#D8303A");px(-8,-14+hy,13,1,"#A0202A");px(-9,-13+hy,3,1,"#A0202A");px(3,-17+hy,1,2,GOLD);}
      if(ht===4){px(-5,-17+hy,9,3,"#22304A");px(-5,-15+hy,9,1,WH);px(2,-14+hy,4,1,BLK);px(3,-17+hy,1,1,GOLD);}
      if(ht===5){px(-3,-21+hy,6,7,BLK);px(-6,-14+hy,12,1,BLK);px(-3,-16+hy,6,1,"#8A2030");}
      if(ht===6){px(-4,-18+hy,8,4,"#8A5A2A");px(-9,-14+hy,18,1,"#6A4018");px(-9,-15+hy,1,1,"#6A4018");px(8,-15+hy,1,1,"#6A4018");px(-4,-15+hy,8,1,"#5A3A22");}
      if(ht===7){px(-6,-14+hy,12,1,"#5B3FA0");px(-4,-16+hy,8,2,"#6B4FB0");px(-4,-18+hy,6,2,"#6B4FB0");px(-4,-20+hy,4,2,"#6B4FB0");px(-5,-22+hy,2,2,"#6B4FB0");px(-1,-17+hy,1,1,GOLD);}
      if(ht===8){px(-4,-16+hy,8,2,GOLD);px(-4,-18+hy,1,2,GOLD);px(-1,-18+hy,1,2,GOLD);px(2,-18+hy,1,2,GOLD);px(0,-16+hy,1,1,"#E8505B");}
      if(ht===9){px(-5,-17+hy,9,3,"#C83040");px(-6,-16+hy,1,2,"#C83040");px(-3,-18+hy,5,1,"#C83040");px(-5,-15+hy,9,1,"#A02030");}
      if(ht===10){px(-5,-17+hy,9,3,"#3A7A3A");px(1,-14+hy,5,1,"#2A5A2A");px(-5,-21+hy,1,5,"#E8505B");px(-6,-22+hy,1,3,"#F08080");}
      if(ht===11){var hd3="#6A4A30";px(-5,-16+hy,9,2,hd3);px(-7,-14+hy,4,10,hd3);px(-5,-5+hy,7,1,hd3);px(3,-15+hy,1,2,hd3);}
      if(ht===12){px(-5,-17+hy,10,10,"#D8303A");px(1,-13+hy,4,3,"#3a3a5a");px(2,-13+hy,2,1,"#8AC8FF");px(-5,-17+hy,10,1,WH);px(-5,-12+hy,1,5,WH);}
      if(ht===13){px(-4,-15+hy,8,1,"#3a3650");px(1,-17+hy,3,3,"#C8C8D8");px(2,-16+hy,1,1,"#6FE0C0");}
      if(ht===14){var WH1="#4A4A5A",WH2="#666678",WH3="#2C2C38",WB="#F09A2E",WB2="#F5C518",WX="#F5E04A";px(-8,-13+hy,16,1,WH3);px(-6,-14+hy,13,1,WH1);px(-5,-16+hy,10,2,WB);px(-5,-16+hy,10,1,WB2);px(-5,-18+hy,9,2,WH1);px(-5,-20+hy,7,2,WH1);px(-6,-21+hy,5,1,WH1);px(-8,-22+hy,5,1,WH1);px(-10,-23+hy,3,1,WH1);px(-10,-22+hy,1,1,WH3);px(-1,-19+hy,1,1,WX);px(0,-18+hy,1,1,WX);px(1,-19+hy,1,1,WX);px(5,-14+hy,1,1,WX);}
    };
    var backHat=function(){var ht=HT;
      if(ht===1){px(-6,-17+hy,12,3,"#F5D03C");px(-7,-14+hy,14,1,"#D8B020");px(-4,-17+hy,2,1,"#FFF2A0");}
      if(ht===2){px(-5,-15+hy,10,2,WH);px(-6,-21+hy,12,6,WH);px(-6,-21+hy,1,6,"#D8D8E4");px(-3,-20+hy,1,5,"#D8D8E4");px(1,-20+hy,1,5,"#D8D8E4");}
      if(ht===3){px(-6,-18+hy,12,4,"#D8303A");px(-8,-14+hy,16,1,"#A0202A");px(-7,-13+hy,14,1,"#A0202A");}
      if(ht===4){px(-6,-17+hy,12,3,"#22304A");px(-6,-15+hy,12,1,WH);}
      if(ht===5){px(-4,-21+hy,8,7,BLK);px(-7,-14+hy,14,1,BLK);px(-4,-16+hy,8,1,"#8A2030");}
      if(ht===6){px(-4,-18+hy,8,4,"#8A5A2A");px(-9,-14+hy,18,1,"#6A4018");px(-8,-15+hy,2,1,"#6A4018");px(6,-15+hy,2,1,"#6A4018");px(-4,-15+hy,8,1,"#5A3A22");}
      if(ht===7){px(-7,-14+hy,14,1,"#5B3FA0");px(-5,-16+hy,10,2,"#6B4FB0");px(-4,-18+hy,7,2,"#6B4FB0");px(-2,-20+hy,4,2,"#6B4FB0");px(-1,-22+hy,2,2,"#6B4FB0");}
      if(ht===8){px(-5,-16+hy,10,2,GOLD);px(-5,-18+hy,1,2,GOLD);px(-2,-18+hy,1,2,GOLD);px(1,-18+hy,1,2,GOLD);px(4,-18+hy,1,2,GOLD);}
      if(ht===9){px(-5,-17+hy,11,3,"#C83040");px(-3,-18+hy,7,1,"#C83040");px(-5,-15+hy,11,1,"#A02030");}
      if(ht===10){px(-6,-17+hy,12,3,"#3A7A3A");px(-6,-14+hy,12,1,"#2A5A2A");px(-4,-21+hy,1,5,"#E8505B");px(-5,-22+hy,1,3,"#F08080");}
      if(ht===11){var hd4="#6A4A30";px(-6,-16+hy,12,12,hd4);px(-5,-17+hy,10,1,hd4);px(-1,-6+hy,2,2,shade(hd4,-0.2));}
      if(ht===12){px(-6,-17+hy,12,9,"#D8303A");px(-6,-17+hy,12,1,WH);px(-1,-17+hy,2,9,WH);}
      if(ht===14){var WH1="#4A4A5A",WH2="#666678",WH3="#2C2C38",WB="#F09A2E",WB2="#F5C518",WX="#F5E04A";px(-9,-13+hy,18,1,WH3);px(-8,-14+hy,16,1,WH1);px(-6,-16+hy,12,2,WB);px(-5,-18+hy,10,2,WH1);px(-4,-20+hy,8,2,WH1);px(-3,-21+hy,5,1,WH1);px(-5,-22+hy,5,1,WH1);px(-7,-23+hy,3,1,WH1);px(-7,-22+hy,1,1,WH3);}
      if(ht===13){px(-6,-15+hy,12,1,"#3a3650");}
    };
    if(D===1){
      /* ---- side: facing right, so the right arm and leg are nearest; the far ones are a shade darker, behind ---- */
      SEC="armL";limb(0,-4.5,aL,nL,dim(armC(nL)));
      SEC="legL";limb(-0.5,4,lL,gL,dim(legC(legColsL,gL)),null);
      SEC="legR";limb(0.5,4,lR,gR,legC(legColsR,gR),strC(gR));
      if(st.skates){var ic1=st.skates==="ice";SEC="legL";skate(-0.5,4,lL,gL,ic1);SEC="legR";skate(0.5,4,lR,gR,ic1);}
      SEC="top";
      px(-3,-5,6,10,base);px(-3,-5,1,10,shade(base,-0.25));px(-3,4,6,1,shade(base,-0.25));
      if(T===0||T===4)px(-2,-5,5,1,shade(base,0.25));
      if(T===1)px(-1,-5,3,1,skin);
      if(T===2){px(-5,-7,3,4,tcD);px(-4,-8,2,1,tcD);px(1,1,2,2,tcD);}                 /* hoodie: the hood hanging at the back, the pocket */
      if(T===3)px(2,-5,1,10,WH);
      if(T===4){for(var r4=-4;r4<5;r4+=3)px(-3,r4,6,1,tcL);}
      if(T===5){px(2,-5,1,6,WH);px(2,-4,1,4,dark?"#E8505B":BLK);}
      if(T===6){px(-2,-3,5,8,tc);px(2,-1,1,1,GOLD);px(2,1,1,1,GOLD);}
      if(T===7){px(-3,-1,6,1,"#E8E8F0");px(-3,2,6,1,"#E8E8F0");}
      if(T===8){px(-3,-5,6,1,WH);px(2,-3,1,1,WH);px(2,-1,1,1,WH);}
      if(T===9){px(1,-3,1,1,BLK);px(1,-1,1,1,BLK);px(1,1,1,1,BLK);}
      if(T===10){px(-4,4,4,4,WH);px(0,4,3,3,WH);px(-4,7,4,1,"#C8C8D8");}
      if(T===11){px(-2,-5,3,2,tcD);px(2,-4,1,8,"#C8C8D8");}
      if(T===12){px(2,-5,1,9,WH);px(3,-4,1,1,BLK);}
      if(T===13)px(0,-5,3,1,tcL);
      if(T===14){px(-3,3,6,1,"#5A3A22");px(2,-4,1,1,GOLD);px(2,-2,1,1,GOLD);px(2,0,1,1,GOLD);}
      if(T===15)px(-3,0,6,2,CLOTH[((L.topCol|0)+6)%CLOTH.length]);
      if(T===16)px(-1,-5,4,1,tcL);
      if(T===17){px(-1,-5,1,10,tcD);px(-3,-2,6,1,tcD);px(-3,1,6,1,tcD);px(2,-5,1,10,WH);}
      if(T===19){px(-3,3,6,1,BLK);px(-1,-5,2,1,tcL);px(2,-3,1,1,GOLD);}
      if(T===20)px(-3,1,6,4,skin);
      SEC="bottom";
      if(B===2){px(-4,4,8,3,bc);px(-4,6,8,1,bcD);}
      else if(B===5){px(-4,4,8,4,bc);px(-5,7,10,3,bc);px(-5,9,10,1,bcD);}
      else if(B===8){px(-4,4,8,3,bc);px(-3,4,1,3,bcD);px(0,4,1,3,bcD);px(-4,5,8,1,bcD);}
      else if(B===12){px(-4,4,8,2,bc);px(-4,5,8,1,bcD);}
      else px(-3,4,6,1,bcD);
      if(B===4){px(0,-2,3,6,bc);px(-2,-5,1,4,bc);px(-1,-5,2,1,bc);px(1,-1,1,1,GOLD);}
      SEC="armR";limb(0,-4.5,aR,nR,armC(nR));
      SEC="head";
      px(-4,-14+hy,8,9,skin);px(4,-11+hy,1,2,skin);px(-4,-6+hy,8,1,skD);px(-2,-11+hy,1,2,skD);
      px(2,-11+hy,1,2,"#15121F");
      if(st.mouth)px(3,-8+hy,1,2,"#5A2A2A");else px(3,-8+hy,1,1,skD);
      SEC="hair";sideHair();
      SEC="extra";
      if(EX===1){px(2,-11+hy,3,2,"#111018");px(-1,-11+hy,3,1,"#111018");}
      if(EX===2){px(-4,-16+hy,8,1,"#2A2238");px(-2,-12+hy,3,4,"#2A2238");px(-1,-11+hy,1,2,"#E8505B");}
      if(EX===3){px(-4,-17+hy,8,3,"#E8505B");px(-4,-14+hy,8,1,"#B83A44");px(-6,-14+hy,2,1,"#B83A44");px(-7,-13+hy,2,2,"#B83A44");}
      if(EX===4){px(-4,-14+hy,8,2,"#D354A0");}
      if(EX===5){px(-1,-9+hy,6,4,"#15121F");px(4,-9+hy,1,1,"#2E2A3C");px(-4,-10+hy,3,1,"#15121F");}   /* mask */
      SEC="face";
      var wk=HR===0?"#3a2a22":hcD;
      if(FC===1||FC===2||FC===3)px(3,-9+hy,2,1,wk);
      if(FC===2){px(-1,-10+hy,1,4,wk);px(0,-7+hy,5,2,wk);px(3,-8+hy,1,1,st.mouth?"#5A2A2A":skD);}
      if(FC===3)px(3,-7+hy,1,2,wk);
      if(FC===4||FC===5){var gc1=FC===5?GOLD:"#26222F";px(2,-11+hy,2,2,"rgba(190,230,255,.55)");px(1,-12+hy,4,1,gc1);px(-1,-11+hy,3,1,gc1);px(4,-11+hy,1,2,gc1);px(2,-11+hy,1,2,"#15121F");}
      if(FC===6)px(-4,-13+hy,8,1,"#111018");
      if(FC===7){px(2,-9+hy,1,1,"#B06A40");px(3,-8+hy,1,1,"#B06A40");}
      if(FC===8)px(1,-9+hy,2,1,"#F08AA0");
      if(FC===9){var sb3=shade(skin,-0.3);px(0,-7+hy,1,1,sb3);px(2,-7+hy,1,1,sb3);px(1,-6+hy,1,1,sb3);px(3,-6+hy,1,1,sb3);}
      SEC="hat";sideHat();
      PAINT.view("hair:"+HR,1,OX,OY+hy);if(HT===14){SEC="hat";sideHat();}PAINT.view("hat:"+HT,1,OX,OY+hy);PAINT.view("extra:"+EX,1,OX,OY+hy);
    }else{
      /* ---- back: the arms and legs swap sides, no face, the hair covers the back of the head ---- */
      SEC="legL";limb(2.5,4,-lL,gL,legC(legColsL,gL),strC(gL));SEC="legR";limb(BT?-2:-2.5,4,-lR,gR,BT?dimF(legC(legColsR,gR)):legC(legColsR,gR),strC(gR));
      if(st.skates){var ic2=st.skates==="ice";SEC="legL";skate(2.5,4,-lL,gL,ic2);SEC="legR";skate(-2.5,4,-lR,gR,ic2);}
      /* from behind, the arms are on the far side of the body: drawn first, so the back covers them where they cross it */
      SEC="armL";limb(6.5,-4.5,-aL,nL,armC(nL));SEC="armR";limb(BT?-5.5:-6.5,-4.5,-aR,nR,BT?dimF(armC(nR)):armC(nR));
      SEC="top";
      px(-5,-5,10,10,base);px(-5,-5,1,10,shade(base,-0.25));px(-5,4,10,1,shade(base,-0.25));
      if(T===0||T===4)px(-5,-5,10,1,shade(base,0.25));
      if(T===1){px(-5,-5,2,1,skin);px(3,-5,2,1,skin);px(-2,-5,4,1,skin);}
      if(T===2){px(-4,-6,8,4,tcD);px(-3,-2,6,1,shade(tc,-0.4));}                   /* the hood lying on the back */
      if(T===4){for(var r5=-4;r5<5;r5+=3)px(-5,r5,10,1,tcL);}
      if(T===6)px(-1,-1,2,4,shade(tc,-0.2));
      if(T===7){px(-5,-1,10,1,"#E8E8F0");px(-5,2,10,1,"#E8E8F0");px(-3,-5,1,4,"#E8E8F0");px(2,-5,1,4,"#E8E8F0");}
      if(T===8){px(-5,-5,10,1,WH);px(-3,-3,2,4,WH);px(1,-3,2,4,WH);}                /* the number on the back */
      if(T===10){px(-6,4,12,4,WH);px(-6,7,12,1,"#C8C8D8");px(0,4,1,4,"#C8C8D8");}
      if(T===11)px(-5,-5,10,2,tcD);
      if(T===13)px(-3,-5,6,1,tcL);
      if(T===14)px(-5,3,10,1,"#5A3A22");
      if(T===15){px(-5,0,10,2,CLOTH[((L.topCol|0)+6)%CLOTH.length]);px(-1,2,2,3,CLOTH[((L.topCol|0)+6)%CLOTH.length]);}
      if(T===16)px(-3,-5,6,1,tcL);
      if(T===17){for(var fl2=-5;fl2<5;fl2+=3)px(fl2,-5,1,10,tcD);for(var fr3=-4;fr3<5;fr3+=3)px(-5,fr3,10,1,tcD);}
      if(T===18){px(-3,-3,6,1,WH);px(-2,-1,4,1,WH);}                                /* tour dates */
      if(T===19){px(-5,3,10,1,BLK);px(-5,-5,2,1,tcL);px(3,-5,2,1,tcL);}
      if(T===20)px(-5,1,10,4,skin);
      SEC="bottom";
      if(B===2){px(-6,4,12,3,bc);px(-6,6,12,1,bcD);}
      else if(B===5){px(-6,4,12,4,bc);px(-7,7,14,3,bc);px(-7,9,14,1,bcD);}
      else if(B===8){px(-6,4,12,3,bc);for(var kt2=-5;kt2<6;kt2+=3)px(kt2,4,1,3,bcD);px(-6,5,12,1,bcD);}
      else if(B===12){px(-6,4,12,2,bc);px(-6,5,12,1,bcD);}
      else px(-5,4,10,1,bcD);
      if(B===4){px(-4,-5,1,2,bc);px(3,-5,1,2,bc);px(-3,-3,1,1,bc);px(2,-3,1,1,bc);px(-2,-2,4,2,bc);px(-3,0,6,4,bc);}   /* overall straps crossing */
      SEC="head";
      px(-5,-14+hy,10,9,skin);px(-5,-14+hy,1,9,skD);px(-5,-6+hy,10,1,skD);
      px(-6,-11+hy,1,2,skin);px(5,-11+hy,1,2,skin);                                 /* ears */
      SEC="hair";backHair();if(BT){SEC="head";px(3,-12+hy,1,5,skin);px(4,-11+hy,1,3,skD);SEC="top";px(-5,-5,2,10,tcD);}
      SEC="extra";
      if(EX===1){px(-6,-11+hy,1,1,"#111018");px(5,-11+hy,1,1,"#111018");}
      if(EX===2){px(-6,-16+hy,12,1,"#2A2238");px(-7,-12+hy,2,4,"#2A2238");px(5,-12+hy,2,4,"#2A2238");}
      if(EX===3){px(-5,-17+hy,10,3,"#E8505B");px(-5,-14+hy,10,1,"#B83A44");px(-1,-14+hy,2,2,"#B83A44");px(-2,-12+hy,1,2,"#B83A44");px(1,-12+hy,1,2,"#B83A44");}
      if(EX===4)px(-5,-14+hy,10,2,"#D354A0");
      if(EX===5){px(-6,-10+hy,12,1,"#15121F");px(-1,-10+hy,2,3,"#15121F");}   /* mask: the knot at the back */
      SEC="hat";backHat();
      PAINT.view("hair:"+HR,2,OX,OY+hy);if(HT===14){SEC="hat";backHat();}PAINT.view("hat:"+HT,2,OX,OY+hy);
    }
    }else{
    SEC="legL";limb(-2.5,4,lL,gL,legC(legColsL,gL),strC(gL));SEC="legR";limb(FT?2:2.5,4,lR,gR,FT?dimF(legC(legColsR,gR)):legC(legColsR,gR),strC(gR));
    if(st.skates){var ic=st.skates==="ice";SEC="legL";skate(-2.5,4,lL,gL,ic);SEC="legR";skate(2.5,4,lR,gR,ic);}
    SEC="top";
    /* torso */
    px(-5,-5,10,10,tc);
    if(L.top===4){for(var r=-4;r<5;r+=3)px(-5,r,10,1,tcL);}
    if(L.top===3){px(-1,-5,2,10,"#EDEDF5");px(-2,-5,1,10,tcD);px(1,-5,1,10,tcD);}
    if(L.top===21){px(-2,-5,4,10,"#9FD4F2");px(0,-4,1,8,"#3A62B8");px(-3,-5,1,10,tcD);px(2,-5,1,10,tcD);px(-4,-6,2,2,tcL);px(2,-6,2,2,tcL);px(-2,-5,4,1,"#C8E8FA");}   /* open coat over a light blue shirt */
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
    if(FT){SEC="top";px(3,-5,2,10,tcD);}   /* three-quarter: the far side of the body in shadow */
    SEC="armL";limb(-6.5,-4.5,aL,nL,armC(nL));SEC="armR";limb(FT?5.5:6.5,-4.5,aR,nR,FT?dimF(armC(nR)):armC(nR));
    SEC="head";
    /* head */
    px(-5,-14+hy,10,9,skin);px(4,-14+hy,1,9,skD);px(-5,-6+hy,10,1,skD);
    if(FT){px(-6,-11+hy,1,3,skD);px(-5,-14+hy,1,8,skD);}   /* turned: the ear, and the side of the head */
    /* face: eyes, and an open mouth when singing or hitting a step (turned: the face sits a pixel to the side, an ear shows) */
    px(-3+FT,-11+hy,1,2,"#15121F");px(2+FT,-11+hy,1,2,"#15121F");
    if(st.mouth)px(-1+FT,-8+hy,2,2,"#5A2A2A");else px(-1+FT,-8+hy,2,1,skD);

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
    if(hair===30){   /* swept mop: a big rounded mop, the fringe swept across the brow */
      px(-7,-19+hy,14,6,hc);px(-6,-20+hy,12,1,hc);px(-4,-21+hy,7,1,hc);px(-8,-17+hy,1,5,hc);px(7,-17+hy,1,5,hc);
      px(-7,-13+hy,2,5,hc);px(5,-13+hy,2,5,hc);px(-5,-13+hy,8,1,hc);px(-5,-12+hy,4,1,hc);px(3,-13+hy,2,2,hc);
      px(-7,-9+hy,2,1,hcD);px(5,-9+hy,2,1,hcD);px(-2,-17+hy,6,1,hcD);px(2,-16+hy,3,1,hcD);px(-4,-20+hy,5,1,hcL);px(-6,-18+hy,2,1,hcL);}
    if(hair===31){   /* crew cut: close to the head, a short fringe swept across */
      px(-5,-18+hy,10,1,hc);px(-6,-17+hy,12,3,hc);px(-6,-14+hy,1,3,hc);px(5,-14+hy,1,3,hc);px(-5,-14+hy,8,1,hc);px(-4,-13+hy,3,1,hc);
      px(-1,-16+hy,4,1,hcD);px(-6,-12+hy,1,1,hcD);px(5,-12+hy,1,1,hcD);px(-3,-18+hy,4,1,hcL);}
    if(hair===29){px(-5,-16+hy,10,3,hc);px(-6,-17+hy,2,2,hc);px(-3,-18+hy,2,2,hc);px(1,-18+hy,2,2,hc);px(4,-17+hy,2,2,hc);px(-6,-14+hy,1,3,hc);px(5,-14+hy,1,3,hc);px(-4,-13+hy,2,1,hc);px(1,-13+hy,1,1,hc);px(3,-13+hy,1,2,hc);px(-2,-16+hy,1,1,hcD);px(2,-16+hy,1,1,hcD);}   /* wild crop: short and sticking out every way */
    /* headbanging: bowed right down, the hair hangs over the face; flung back up, it flies */
    if(hd>0.55&&hair!==0&&hair!==4&&hair!==17){px(-5,-13+hy,10,6,hc);px(-6,-12+hy,1,6,hc);px(5,-12+hy,1,6,hc);px(-5,-7+hy,10,1,hcD);}
    if(hd<-0.3&&hair!==0){px(-5,-19,2,3,hc);px(-1,-20,2,4,hc);px(3,-19,2,3,hc);px(-7,-17,2,2,hc);px(5,-17,2,2,hc);}
    SEC="extra";
    /* extras */
    var ex=L.extra;
    if(ex===1){px(-4,-11+hy,8,2,"#111018");}
    if(ex===2){px(-6,-16+hy,12,1,"#2A2238");px(-7,-12+hy,2,4,"#2A2238");px(5,-12+hy,2,4,"#2A2238");px(-7,-11+hy,1,2,"#E8505B");px(6,-11+hy,1,2,"#E8505B");}
    if(ex===3){px(-5,-17+hy,10,3,"#E8505B");px(-5,-14+hy,10,1,"#B83A44");px(-8,-14+hy,4,1,"#B83A44");}
    if(ex===4){px(-5,-14+hy,10,2,"#D354A0");px(-6,-13+hy,1,3,"#D354A0");}
    if(ex===5){px(-5,-9+hy,10,4,"#15121F");px(-5,-9+hy,10,1,"#2E2A3C");px(-6,-10+hy,1,2,"#15121F");px(5,-10+hy,1,2,"#15121F");}   /* mask over the nose and mouth */
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
    var witchF=function(){var WH1="#4A4A5A",WH2="#666678",WH3="#2C2C38",WB="#F09A2E",WB2="#F5C518",WX="#F5E04A";px(-9,-13+hy,18,1,WH3);px(-8,-14+hy,16,1,WH1);px(-6,-16+hy,12,2,WB);px(-6,-16+hy,12,1,WB2);px(-5,-18+hy,10,2,WH1);px(-4,-20+hy,8,2,WH1);px(-2,-21+hy,5,1,WH1);px(0,-22+hy,5,1,WH1);px(4,-23+hy,3,1,WH1);px(6,-22+hy,1,1,WH3);px(-5,-18+hy,1,2,WH2);px(-4,-20+hy,1,2,WH2);px(-7,-14+hy,3,1,WH2);px(-3,-20+hy,1,1,WX);px(-1,-20+hy,1,1,WX);px(-2,-19+hy,1,1,WX);px(-3,-18+hy,1,1,WX);px(-1,-18+hy,1,1,WX);px(-6,-14+hy,1,1,WX);px(5,-14+hy,1,1,WX);};   /* witch hat (Bowe's): floppy brim, orange band, a cone curling over, its sigils */
    if(ht===14)witchF();
    /* pixels painted in the Graphics lab, by part, before the outline goes round them */
    var TO=TOFF||{};paintLayer("hair:"+(L.hair|0),OX+(TO.hair||0),OY+hy);if(ht===14){SEC="hat";witchF();}paintLayer("hat:"+(L.hat|0),OX+(TO.hat||0),OY+hy);   /* the witch hat sits over any painted hair */paintLayer("face:"+(L.face|0),OX+(TO.face||0),OY+hy);paintLayer("extra:"+(L.extra|0),OX+(TO.extra||0),OY+hy);
    paintLayer("top:"+(L.top|0),OX,OY);paintLayer("bottom:"+(L.bottom|0),OX,OY);
    paintLayer("armL",Math.round(OX-6.5),Math.round(OY-4.5),aL);paintLayer("armR",Math.round(OX+6.5),Math.round(OY-4.5),aR);
    paintLayer("legL",Math.round(OX-2.5),OY+4,lL);paintLayer("legR",Math.round(OX+2.5),OY+4,lR);
    if(ht===14){SEC="hat";witchF();}   /* the witch hat goes on last, over any hair */
    }   /* end of the front view */
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
    /* which way they face: 0 front, 1 facing right, 2 back, 3 facing left (the right-facing side view, mirrored) */
    /* 0 front, 1 right, 2 back, 3 left, 4 front-right, 5 back-right, 6 back-left, 7 front-left; the left ones are the right ones mirrored */
    var DIR=(((st.dir|0)%8)+8)%8,SX=st.sx!==undefined?st.sx:1,MIR=DIR===3?1:DIR===6?5:DIR===7?4:0;
    if(MIR){var t1=s.armL;s.armL=-s.armR;s.armR=-t1;t1=s.legL;s.legL=-s.legR;s.legR=-t1;t1=s.lenL;s.lenL=s.lenR;s.lenR=t1;t1=s.legLenL;s.legLenL=s.legLenR;s.legLenR=t1;SX=-SX;s.dir=MIR;}else s.dir=DIR;
    var c=drawSprite(L,s);TOFF=null;var q=Math.max(1,p),bob=Math.round((st.bob||0)/q)*q,dx=Math.round((st.dx||0)/q)*q;
    var was=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;
    if(NEON){g.save();g.shadowColor=neonCol(L);g.shadowBlur=6*q;}
    if(st.rot){
      /* the whole body turned (the worm: lying on the floor), resting on the floor rather than floating */
      g.save();g.translate(Math.round(x+dx),Math.round(y+8*q*Math.abs(Math.sin(st.rot))+bob));g.rotate(st.rot);
      g.drawImage(c,-OX*q,-OY*q,CWD*q,CHT*q);g.restore();
    }else if(SX!==1){   /* turning round on the spot: squeezed sideways about the body centre (and -1: facing left) */
      g.save();g.translate(Math.round(x+dx),0);g.scale(SX,1);g.drawImage(c,Math.round(-OX*q),Math.round(y-OY*q+bob),CWD*q,CHT*q);g.restore();
    }else g.drawImage(c,Math.round(x+dx-OX*q),Math.round(y-OY*q+bob),CWD*q,CHT*q);
    if(NEON)g.restore();
    g.imageSmoothingEnabled=was;
    if(st.prop)handProp(g,x,y,q,dx,bob,s,st);
    else if(L.held&&!st.rot&&!st.skates)heldInst(g,x,y,q,dx,bob,L.held|0,s.dir,SX);
  }
  /* an instrument you carry (Holding in the character maker): a violin tucked under the chin with its bow, or a black
     sparkly electric guitar slung across the body. Drawn on the body, so it stays put while the arms dance. */
  function heldInst(g,x,y,q,dx,bob,k,dir,SX){
    var back=dir===2||dir===5;if(back&&k===1)return;
    g.save();g.translate(Math.round(x+dx),Math.round(y+bob));g.scale(SX<0?-1:1,1);
    function P(a,b,w,h,c){g.fillStyle=c;g.fillRect(Math.round(a*q),Math.round(b*q),Math.round(w*q),Math.round(h*q));}
    if(k===2){   /* electric guitar: black body with sparkles at the hip, the neck up across the chest to the left shoulder */
      P(0,0,7,5,"#0E0C16");P(1,-1,5,1,"#0E0C16");P(1,5,5,1,"#0E0C16");P(1,1,4,3,"#1C1A2A");
      P(2,1,1,1,"#E8E4FF");P(5,3,1,1,"#B8B0FF");P(1,4,1,1,"#E8E4FF");P(5,0,1,1,"#9A90E0");P(3,3,1,1,"#9A90E0");
      P(2,2,3,1,"#C9CEE0");   /* pickups */
      for(var i=0;i<8;i++)P(0-i,-1-i,2,1,"#5A3A22");P(-9,-11,3,3,"#0E0C16");P(-8,-10,1,1,"#C9CEE0");}
    else if(k===1){   /* violin: under the chin on the left shoulder, the bow across it */
      P(-8,-7,5,6,"#8B3A1A");P(-7,-8,3,1,"#8B3A1A");P(-7,-1,3,1,"#8B3A1A");P(-7,-6,3,4,"#B5562A");P(-6,-5,1,2,"#2A1408");
      P(-9,-9,1,1,"#2A1408");P(-10,-10,1,1,"#2A1408");P(-11,-11,2,1,"#4A2410");
      for(var j=0;j<12;j++)P(-9+j,0-Math.round(j*0.6),1,1,"#EDE6D0");P(3,-7,1,1,"#4A2410");}
    g.restore();
  }
  /* something held up in the right hand: a lit lighter or a phone torch, with a warm (or white) glow round it */
  function handProp(g,x,y,q,dx,bob,s,st){
    var nR=Math.max(3,Math.min(9,s.lenR||9)),bk=[2,5,6].indexOf(((st.dir|0)%8+8)%8)>=0,hx=(bk?-1:1)*(6.5-Math.sin(s.armR)*nR),hy=-4.5+Math.cos(s.armR)*nR,t=(st.now||Date.now())/1000;
    g.save();
    if(st.rot){g.translate(Math.round(x+dx),Math.round(y+8*q*Math.abs(Math.sin(st.rot))+bob));g.rotate(st.rot);}else g.translate(Math.round(x+dx),Math.round(y+bob));
    var X=hx*q,Y=hy*q,fl=0.75+0.25*Math.sin(t*23+x)*Math.sin(t*9.7);
    if(st.prop==="glowstick"){
      var gc2=st.propCol||["#3DF2FF","#FF3DA8","#F5F23D","#4CFF8A"][Math.abs(Math.round(x))%4],ga=s.armR+Math.PI;
      g.save();g.translate(X,Y);g.rotate(-ga*0.2);g.fillStyle=gc2;g.fillRect(Math.round(-q),Math.round(-q*7),q*2,q*7);
      g.shadowBlur=0;g.fillStyle="rgba(255,255,255,.75)";g.fillRect(Math.round(-q*0.5),Math.round(-q*6.5),q,q*6);g.restore();
      g.globalCompositeOperation="lighter";var gg=PX.rg(g,X,Y-q*4,0,X,Y-q*4,q*12);gg.addColorStop(0,gc2+"55");gg.addColorStop(1,gc2+"00");g.fillStyle=gg;g.fillRect(X-q*12,Y-q*16,q*24,q*24);
    }else if(st.prop==="phone"){
      g.globalCompositeOperation="lighter";var gr=PX.rg(g,X,Y-q*3,0,X,Y-q*3,q*16);gr.addColorStop(0,"rgba(230,240,255,.55)");gr.addColorStop(1,"rgba(230,240,255,0)");g.fillStyle=gr;g.fillRect(X-q*16,Y-q*19,q*32,q*32);
      g.globalCompositeOperation="source-over";g.fillStyle="#15121F";g.fillRect(Math.round(X-q*1.5),Math.round(Y-q*5),q*3,q*5);g.fillStyle="#EEF4FF";g.fillRect(Math.round(X-q),Math.round(Y-q*4.5),q*2,q*3.5);
    }else{
      g.fillStyle="#C9CEE0";g.fillRect(Math.round(X-q),Math.round(Y-q*2),q*2,q);g.fillStyle="#E8505B";g.fillRect(Math.round(X-q),Math.round(Y-q),q*2,q*2);
      var fh=Math.max(2,Math.round(3*fl));g.fillStyle="#FF8A1E";g.fillRect(Math.round(X-q),Math.round(Y-q*(2+fh)),q*2,q*fh);g.fillStyle="#FFE45C";g.fillRect(Math.round(X-q*0.5),Math.round(Y-q*(1.5+fh*0.6)),q,Math.max(q,q*fh*0.5));
      g.globalCompositeOperation="lighter";var gw=PX.rg(g,X,Y-q*4,0,X,Y-q*4,q*(10+fl*3));gw.addColorStop(0,"rgba(255,170,60,"+(0.45*fl)+")");gw.addColorStop(1,"rgba(255,140,40,0)");g.fillStyle=gw;g.fillRect(X-q*14,Y-q*18,q*28,q*28);
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
    var wg=PX.lg(g,0,G.cy-G.ry,0,G.cy+G.ry);wg.addColorStop(0,"#b9773e");wg.addColorStop(0.5,"#d89a5a");wg.addColorStop(1,"#a8652f");
    g.fillStyle=wg;g.fillRect(G.cx-G.rx,G.cy-G.ry,G.rx*2,G.ry*2);
    g.strokeStyle="rgba(90,45,15,.35)";g.lineWidth=1;for(var py2=G.cy-G.ry;py2<G.cy+G.ry;py2+=Math.max(6,G.ry/9)){g.beginPath();g.moveTo(G.cx-G.rx,py2);g.lineTo(G.cx+G.rx,py2);g.stroke();}
    /* a shine across the polish, and the mirror ball's spots */
    var sh=PX.lg(g,G.cx-G.rx,0,G.cx+G.rx,0),so=((now/6000)%1);sh.addColorStop(Math.max(0,so-0.08),"rgba(255,255,255,0)");sh.addColorStop(so,"rgba(255,255,255,.18)");sh.addColorStop(Math.min(1,so+0.08),"rgba(255,255,255,0)");
    g.fillStyle=sh;g.fillRect(G.cx-G.rx,G.cy-G.ry,G.rx*2,G.ry*2);
    for(var d=0;d<26;d++){var an=d*0.9+now/2600,rr=0.25+((d*37)%70)/100,sx=G.cx+Math.cos(an)*G.rx*rr*0.95,sy=G.cy+Math.sin(an*1.3)*G.ry*rr*0.9;
      g.fillStyle=["rgba(255,255,255,.55)","rgba(255,61,168,.5)","rgba(61,242,255,.5)"][d%3];PX.oval(g,sx,sy,3,2,0);}
    g.restore();
    /* lane stripes (a dashed neon line round the middle of the track) */
    /* the dashed centre line, as moving pixel dashes */
    g.fillStyle="rgba(255,255,255,.35)";var dP=PX.unit(g),dRx=(G.rx+G.ix)/2,dRy=(G.ry+G.iy)/2,dOff=(now/4000)%1;
    for(var dk=0;dk<56;dk++){if(dk%2)continue;for(var dj=0;dj<3;dj++){var da=(dk+dj/3+dOff*2)/56*6.2832;g.fillRect(Math.round((G.cx+Math.cos(da)*dRx)/dP)*dP,Math.round((G.cy+Math.sin(da)*dRy)/dP)*dP,dP,dP);}}
    /* neon rails: outer and island, glowing */
    function rail(rx,ry,c1,c2){g.strokeStyle=c1;g.save();g.globalAlpha*=0.3;PX.ringO(g,G.cx,G.cy,rx,ry,0,12);g.restore();g.lineWidth=4;PX.ringO(g,G.cx,G.cy,rx,ry,0);g.shadowBlur=0;g.strokeStyle=c2;g.lineWidth=1.5;PX.ringO(g,G.cx,G.cy,rx,ry,0);}
    rail(G.rx,G.ry,"#FF3DA8","#ffd0ec");
    /* the island: purple carpet, a cyan rail, a little riser for the performer */
    g.fillStyle="#2a1650";PX.oval(g,G.cx,G.cy,G.ix,G.iy,0);
    g.strokeStyle="rgba(245,242,61,.35)";g.lineWidth=2;for(var z=0;z<5;z++){PX.ringO(g,G.cx,G.cy,G.ix*(0.25+z*0.15),G.iy*(0.25+z*0.15),0);}
    rail(G.ix,G.iy,"#3DF2FF","#d8fdff");
    g.restore();
  }
  /* the ice rink: the same oval, frozen. Snowbanks round the outside, scuffed blue-white ice, a frosty rail */
  function iceRink(g,G,now,k){
    g.save();g.globalAlpha=k;
    g.save();g.beginPath();g.rect(G.cx-G.rx-60,G.cy-G.ry-30,G.rx*2+120,G.ry*2+60);g.ellipse(G.cx,G.cy,G.rx,G.ry,0,0,6.2832,true);g.clip("evenodd");
    g.fillStyle="#1b2a48";g.fillRect(G.cx-G.rx-60,G.cy-G.ry-30,G.rx*2+120,G.ry*2+60);
    g.fillStyle="rgba(235,244,255,.85)";for(var i=0;i<60;i++){var a=i/60*6.2832,bx=G.cx+Math.cos(a)*(G.rx+10),by=G.cy+Math.sin(a)*(G.ry+6);PX.oval(g,bx,by,14+(i*7)%10,6+(i*3)%4,0);}
    g.restore();g.globalAlpha=k;
    g.save();g.beginPath();g.ellipse(G.cx,G.cy,G.rx,G.ry,0,0,6.2832);g.ellipse(G.cx,G.cy,G.ix,G.iy,0,0,6.2832,true);g.clip("evenodd");
    var ig=PX.lg(g,0,G.cy-G.ry,0,G.cy+G.ry);ig.addColorStop(0,"#bfe3f7");ig.addColorStop(0.5,"#e6f6ff");ig.addColorStop(1,"#a9d3ee");
    g.fillStyle=ig;g.fillRect(G.cx-G.rx,G.cy-G.ry,G.rx*2,G.ry*2);
    /* blade scuffs: long thin arcs round the oval */
    g.strokeStyle="rgba(120,160,200,.28)";g.lineWidth=1;
    for(var j=0;j<22;j++){var r=0.42+((j*37)%55)/100,a0=(j*1.7)%6.28;g.beginPath();g.ellipse(G.cx,G.cy,G.rx*r,G.ry*r,0,a0,a0+0.6+((j*13)%10)/10);g.stroke();}
    var sh=PX.lg(g,G.cx-G.rx,0,G.cx+G.rx,0),so=((now/5000)%1);sh.addColorStop(Math.max(0,so-0.1),"rgba(255,255,255,0)");sh.addColorStop(so,"rgba(255,255,255,.45)");sh.addColorStop(Math.min(1,so+0.1),"rgba(255,255,255,0)");
    g.fillStyle=sh;g.fillRect(G.cx-G.rx,G.cy-G.ry,G.rx*2,G.ry*2);
    for(var d=0;d<26;d++){var an=d*0.9+now/2600,rr=0.25+((d*37)%70)/100,sx=G.cx+Math.cos(an)*G.rx*rr*0.95,sy=G.cy+Math.sin(an*1.3)*G.ry*rr*0.9;
      g.fillStyle=["rgba(255,255,255,.8)","rgba(255,120,200,.45)","rgba(80,200,255,.5)"][d%3];PX.oval(g,sx,sy,3,2,0);}
    g.restore();
    function rail(rx,ry,c1,c2){g.strokeStyle=c1;g.save();g.globalAlpha*=0.3;PX.ringO(g,G.cx,G.cy,rx,ry,0,15);g.restore();g.lineWidth=5;PX.ringO(g,G.cx,G.cy,rx,ry,0);g.shadowBlur=0;g.strokeStyle=c2;g.lineWidth=1.5;PX.ringO(g,G.cx,G.cy,rx,ry,0);}
    rail(G.rx,G.ry,"#8fd8ff","#ffffff");
    g.fillStyle="#24365e";PX.oval(g,G.cx,G.cy,G.ix,G.iy,0);
    g.fillStyle="rgba(240,248,255,.9)";for(var z=0;z<14;z++){var za=z/14*6.2832;PX.oval(g,G.cx+Math.cos(za)*G.ix*0.82,G.cy+Math.sin(za)*G.iy*0.8,G.ix*0.14,G.iy*0.22,0);}
    rail(G.ix,G.iy,"#8fd8ff","#ffffff");
    g.restore();
  }
  /* where an oval rink sits on a floor running from y=top to y=bot (pixels), on a screen W wide */
  function rinkGeom(W,top,bot){
    var cy=(top+bot)/2,ry=Math.max(30,(bot-top)/2),rx=Math.min(W*0.47,Math.max(ry*1.8,W*0.4));
    return{cx:W/2,cy:cy,rx:rx,ry:ry,ix:Math.max(46,rx*0.26),iy:Math.max(18,ry*0.34)};
  }

  /* ---------------- ski (the ski round): the mountain, shared by the venue and the performer's follow view ----------------
     World units: x across (0 = the middle of the run), y down the mountain (0 = the start line). The course comes from a seed
     (the round number), so every screen builds the same gates, trees, rocks and ramps. */
  var SK={CH:320,GATE_DY:170,GATE_W:40};
  SK.seedFor=function(n){return 1+((n|0)*37)%997;};

  /* ---------- capture the flag: the arena, the rules and the bots' brains, shared by the venue, the performer's view, the
     server (which referees) and the Capture the flag designer (ctf.html) ----------
     A map is a grid of tiles {name, w, h, t}: t is w*h characters, row by row:
       .  floor      #  wall      > < ^ v  boost pad (shoves you that way)
       R  red base (red's flag sits in the middle of these)     B  blue base
       r  red spawn  b  blue spawn          s  sprint refill (fills your sprint meter; back after a while)
     Sprint: hold the sprint button to run faster. It drains a meter that charges back up slowly, and you need some
     charge to start. The refill pick-ups fill it at once.
     Positions are in tiles (x across, y down); on the wire they're fractions of the map (0..1). */
  var CTF={CH:".#><^vRBrbsp",TEAM:["#E8505B","#3B7BE8"],TNAME:["RED","BLUE"],SPEED:6.2,CARRY:0.85,PAD:2.4,TAG_R:1.0,TAKE_R:0.9,CAP_R:1.2,
    SPRINT:1.6,STAM:1.2,CHARGE:4.5,BODY_R:0.8,SPRINT_MIN:0.3,REFILL_MS:10000,REFILL_R:0.8,
    /* Kart Flag (st.kart): the same arenas, driven in karts. No tagging; the PULSE (a shockwave round you, with a cooldown)
       knocks your flag out of a carrier's hands and home, and spins other enemies out. Power-up boxes (map tile p) give one item. */
    K_SPEED:9.5,K_PULSE_R:3,K_PULSE_MS:8000,K_SPIN_MS:1300,K_BOX_MS:8000,K_BOX_R:0.85,K_OIL_R:0.75,K_OIL_MS:20000,K_SHIELD_MS:4000,K_NITRO_MS:2200,K_AIM_MS:700,K_LAUNCH_CD:4000,K_ITEMS:false,K_TAKE_R:1.25,K_TILE:44,K_Z:1.68,
    ITEMS:["nitro","oil","shield","mega"],ITEM_ICON:{nitro:"\u26A1",oil:"\uD83D\uDEE2",shield:"\uD83D\uDEE1",mega:"\uD83D\uDCA5"}};
  /* the built-in arena before sprint refills (a copy saved on this device that still matches is upgraded to the new one) */
  CTF.OLD_TWIN="#########################################......................................##............#............#............##.rr.........#.>>>....<<<.#.........bb.##.rr.........#.....##.....#.........bb.##.....>......#.....##.....#......<.....##......####..#.....##.....#..####......##............#...>....<...#............##......#........................#......##......#........................#......##.RRR............##..##............BBB.##.RRR............##..##............BBB.##.RRR.....>>>....##..##....<<<.....BBB.##.RRR............##..##............BBB.##......#........................#......##......#.........>....<.........#......##......#.....#............#.....#......##......####..#.....##.....#..####......##.....>......#.....##.....#......<.....##.rr.........#.....##.....#.........bb.##.rr.........#.>>>....<<<.#.........bb.##............#............#............##......................................#########################################";
  CTF.upgrade=function(m){if(m&&m.w===40&&m.h===24&&m.t===CTF.OLD_TWIN)return CTF.defaultMap();return m;};
  /* the built-in arena: Brian's Twin Forts, from the designer */
  CTF.defaultMap=function(){return{name:"Twin Forts",w:40,h:24,t:[
    "########################################",
    "#......................................#",
    "#............#............#............#",
    "#.rr.........#............#.........bb.#",
    "#.rr.........#.....##.....#.........bb.#",
    "#.....>......#.....##.....#......<.....#",
    "#......####..#.....##.....#..####......#",
    "#............#...>....<...#............#",
    "#......#.......s........s.......#......#",
    "#......#........................#......#",
    "#.RRR............##..##............BBB.#",
    "#.RRR............##..##.........s..BBB.#",
    "#.RRR..s..>>>....##..##....<<<.....BBB.#",
    "#.RRR............##..##............BBB.#",
    "#......#........................#......#",
    "#......#.........>....<.........#......#",
    "#......#.....#............#.....#......#",
    "#......####..#.....##.....#..####......#",
    "#.....>......#.....##.....#......<.....#",
    "#.rr.........#.....##.....#.........bb.#",
    "#.rr.........#............#.........bb.#",
    "#............#............#............#",
    "#......................................#",
    "########################################"].join("")};};
  /* the built-in Kart flag arena: wide and open (64 x 30), a few pillars to drift round, boost lanes down both sides and boxes at the crossings */
  CTF.kartDefault=function(){var w=64,h=30,G=[],x,y,mid=15;for(y=0;y<h;y++){G[y]=[];for(x=0;x<w;x++)G[y][x]=(x===0||y===0||x===w-1||y===h-1)?"#":".";}
    function set(x,y,c){if(x<=0||y<=0||x>=w-1||y>=h-1)return;G[y][x]=c;var mx=w-1-x,mc=c==="R"?"B":c==="r"?"b":c===">"?"<":c==="<"?">":c;G[y][mx]=mc;}
    function rect(x0,y0,x1,y1,c){for(var yy=y0;yy<=y1;yy++)for(var xx=x0;xx<=x1;xx++)set(xx,yy,c);}
    rect(3,mid-2,6,mid+1,"R");set(3,3,"r");set(3,h-4,"r");set(5,3,"r");set(5,h-4,"r");   /* base and spawns */
    rect(10,6,11,7,"#");rect(10,h-8,11,h-7,"#");rect(13,mid-1,13,mid,"#");   /* pillars near home */
    rect(20,3,21,5,"#");rect(20,h-6,21,h-4,"#");rect(19,mid-4,20,mid-4,"#");rect(19,mid+3,20,mid+3,"#");
    rect(27,9,28,10,"#");rect(27,h-11,28,h-10,"#");rect(30,mid-1,30,mid,"#");   /* the middle */
    for(x=9;x<=17;x+=4){set(x,2,">");set(x,h-3,">");}   /* boost lanes along the top and bottom, towards the middle */
    set(24,mid-6,">");set(24,mid+5,">");
    set(16,mid-3,"p");set(16,mid+2,"p");set(25,mid,"p");set(28,4,"p");set(28,h-5,"p");   /* power-up boxes */
    return{name:"Open Circuit",w:w,h:h,t:G.map(function(r){return r.join("");}).join("")};};
  CTF.clean=function(m){
    if(!m||typeof m!=="object")return null;var w=m.w|0,h=m.h|0,t=String(m.t||"");
    if(w<16||w>80||h<10||h>50||t.length!==w*h)return null;var out="",i,hasR=false,hasB=false;
    for(i=0;i<t.length;i++){var c=t[i],x=i%w,y=(i/w)|0;if(CTF.CH.indexOf(c)<0)c=".";if(x===0||y===0||x===w-1||y===h-1)c="#";if(c==="R")hasR=true;if(c==="B")hasB=true;out+=c;}
    if(!hasR||!hasB)return null;return{name:String(m.name||"My arena").slice(0,40),w:w,h:h,t:out};};
  var CTFI=[];
  /* what a map works out to: where each flag sits, the spawn spots, and quick tile lookups (cached) */
  CTF.info=function(m){
    for(var k=0;k<CTFI.length;k++)if(CTFI[k].m===m)return CTFI[k].i;
    var w=m.w,h=m.h,base=[[0,0,0],[0,0,0]],sp=[[],[]],rf=[],bx=[],i;
    for(i=0;i<m.t.length;i++){var c=m.t[i],x=i%w+0.5,y=((i/w)|0)+0.5;if(c==="R"){base[0][0]+=x;base[0][1]+=y;base[0][2]++;}if(c==="B"){base[1][0]+=x;base[1][1]+=y;base[1][2]++;}if(c==="r")sp[0].push([x,y]);if(c==="b")sp[1].push([x,y]);if(c==="s")rf.push([x,y]);if(c==="p")bx.push([x,y]);}
    var bs=base.map(function(b){return b[2]?[b[0]/b[2],b[1]/b[2]]:[w/2,h/2];});
    [0,1].forEach(function(t){if(!sp[t].length)sp[t].push(bs[t].slice());});
    var I={w:w,h:h,base:bs,spawn:sp,refills:rf,boxes:bx,
      at:function(x,y){x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=w||y>=h)return "#";return m.t[y*w+x];},
      solid:function(x,y){return I.at(x,y)==="#";},
      pad:function(x,y){var c=I.at(x,y);return c===">"?[1,0]:c==="<"?[-1,0]:c==="^"?[0,-1]:c==="v"?[0,1]:null;},
      side:function(x,y){var d0=Math.hypot(x-bs[0][0],y-bs[0][1]),d1=Math.hypot(x-bs[1][0],y-bs[1][1]);return d0<=d1?0:1;}};
    CTFI.push({m:m,i:I});if(CTFI.length>6)CTFI.shift();return I;};
  /* moving a player (radius 0.32 tiles) by dx, dy with walls in the way: each axis on its own, so you slide along walls */
  CTF.move=function(I,p,dx,dy){var r=0.32;
    function hit(x,y){return I.solid(x-r,y-r)||I.solid(x+r,y-r)||I.solid(x-r,y+r)||I.solid(x+r,y+r);}
    var n=Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/0.25)||1;for(var s=0;s<n;s++){if(!hit(p.x+dx/n,p.y))p.x+=dx/n;if(!hit(p.x,p.y+dy/n))p.y+=dy/n;}return p;};
  /* the game state; the server keeps the real one and everyone else mirrors it */
  CTF.newState=function(I,ids,kart){var st={kart:!!kart,held:{},cd:{},shield:{},mega:{},spin:{},oil:[],box:I.boxes.map(function(){return 0;}),teams:{},flags:[{t:0,x:I.base[0][0],y:I.base[0][1],at:null},{t:1,x:I.base[1][0],y:I.base[1][1],at:null}],caps:[0,0],score:{},pos:{},cool:{},tagged:{},refill:I.refills.map(function(){return 0;})};
    (ids||[]).slice().sort().forEach(function(id,k){st.teams[id]=k%2;});return st;};
  CTF.teamOf=function(st,id){if(st.teams[id]===undefined){var n=[0,0];for(var k in st.teams)n[st.teams[k]]++;st.teams[id]=n[0]<=n[1]?0:1;}return st.teams[id];};
  CTF.spawnOf=function(I,st,id){var t=CTF.teamOf(st,id),ids=Object.keys(st.teams).filter(function(k){return st.teams[k]===t;}).sort(),s=I.spawn[t];return s[Math.max(0,ids.indexOf(id))%s.length].slice();};
  CTF.carrying=function(st,id){for(var f=0;f<2;f++)if(st.flags[f].at===id)return f;return -1;};
  /* someone is at x, y (tiles): flags picked up, captures and tags. Returns what happened, for banners and points */
  CTF.step=function(st,I,id,x,y,now){
    var t=CTF.teamOf(st,id),ev=[],mine=st.flags[t],theirs=st.flags[1-t],add=function(n,who){st.score[who]=(st.score[who]||0)+n;};
    if(st.tagged[id]&&now-st.tagged[id]<1500)return ev;        /* just tagged: on the way back to spawn */
    var pp=st.pos[id],px=x,py=y;if(pp&&now-pp[2]<600&&Math.hypot(pp[0]-x,pp[1]-y)<4){px=pp[0];py=pp[1];}   /* where they were a moment ago, for the swept touch test below */
    st.pos[id]=[x,y,now,px,py];
    /* sprint refills: run over one that's there and it's yours (it comes back after REFILL_MS) */
    if(!st.refill)st.refill=I.refills.map(function(){return 0;});
    if(!st.kart)for(var ri=0;ri<I.refills.length;ri++){var rp=I.refills[ri];if(now-(st.refill[ri]||0)>=CTF.REFILL_MS&&Math.hypot(x-rp[0],y-rp[1])<CTF.REFILL_R){st.refill[ri]=now;ev.push({k:"refill",id:id,i:ri});}}
    if(st.kart&&CTF.K_ITEMS){
      if(!st.box)st.box=I.boxes.map(function(){return 0;});
      for(var bi=0;bi<I.boxes.length;bi++){var bp=I.boxes[bi];if(!st.held[id]&&now-(st.box[bi]||0)>=CTF.K_BOX_MS&&Math.hypot(x-bp[0],y-bp[1])<CTF.K_BOX_R){st.box[bi]=now;st.held[id]=CTF.ITEMS[Math.floor((st.rnd?st.rnd():Math.random())*CTF.ITEMS.length)];ev.push({k:"box",id:id,i:bi,it:st.held[id]});}}
      for(var oi=st.oil.length-1;oi>=0;oi--){var ol=st.oil[oi];if(now-ol.t>CTF.K_OIL_MS){st.oil.splice(oi,1);continue;}if(ol.team===t||(st.shield[id]||0)>now)continue;
        if(Math.hypot(x-ol.x,y-ol.y)<CTF.K_OIL_R){st.oil.splice(oi,1);st.spin[id]=now+CTF.K_SPIN_MS;add(80,ol.by);ev.push({k:"spin",id:id,by:ol.by,oil:1});}}
    }
    var cf=CTF.carrying(st,id);
    if(cf>=0){st.flags[cf].x=x;st.flags[cf].y=y;
      if(mine.at===null&&Math.hypot(x-I.base[t][0],y-I.base[t][1])<CTF.CAP_R){st.caps[t]++;add(500,id);var fl=st.flags[cf];fl.at=null;fl.x=I.base[fl.t][0];fl.y=I.base[fl.t][1];ev.push({k:"cap",id:id,t:t});}}
    else if(theirs.at===null&&(function(){var R=st.kart?CTF.K_TAKE_R:CTF.TAKE_R;for(var k5=0;k5<=4;k5++){var u5=k5/4;if(Math.hypot(px+(x-px)*u5-theirs.x,py+(y-py)*u5-theirs.y)<R)return true;}return false;})()){   /* tested along the path since the last update, so a fast kart can't skip over it; karts get a bigger reach */
theirs.at=id;add(100,id);ev.push({k:"take",id:id,t:t});}
    /* tags: two players from different teams meet; whoever is on the other team's half goes back to spawn (not in Kart Flag: there the pulse does it) */
    if(!st.kart)for(var o in st.pos){if(o===id||st.teams[o]===undefined||st.teams[o]===t)continue;var q=st.pos[o];if(now-q[2]>1500||(st.tagged[o]&&now-st.tagged[o]<1500))continue;
      var qx=q[3]===undefined?q[0]:q[3],qy=q[4]===undefined?q[1]:q[4],near=1e9;   /* fast players can pass through each other between two updates: test along both paths */
      for(var k4=0;k4<=4;k4++){var u=k4/4;near=Math.min(near,Math.hypot(qx+(q[0]-qx)*u-(px+(x-px)*u),qy+(q[1]-qy)*u-(py+(y-py)*u)));}
      if(near>CTF.TAG_R)continue;var key=id<o?id+"|"+o:o+"|"+id;if(st.cool[key]&&now-st.cool[key]<1200)continue;st.cool[key]=now;
      var cMe=CTF.carrying(st,id)>=0,cO=CTF.carrying(st,o)>=0;if(cMe===cO)continue;   /* only a flag carrier can be tagged; everyone else just bumps (CTF.bump) */
      var victim=cMe?id:o,tagger=victim===o?id:o,vf=CTF.carrying(st,victim);
      if(vf>=0){var f2=st.flags[vf];f2.at=null;f2.x=I.base[f2.t][0];f2.y=I.base[f2.t][1];}
      st.tagged[victim]=now;add(vf>=0?250:150,tagger);ev.push({k:"tag",id:victim,by:tagger,carrier:vf>=0});if(victim===id)break;}
    return ev;};
  /* Kart Flag: the pulse. Returns events (empty if it isn't ready). Enemies inside the ring: a carrier drops the flag and it
     flies home; anyone else spins out. A shield stops it. */
  CTF.pulse=function(st,I,id,now){var t=CTF.teamOf(st,id),ev=[],p=st.pos[id];if(!st.kart||!p)return ev;
    if(now-(st.cd[id]||-1e9)<CTF.K_PULSE_MS||(st.spin[id]||0)>now)return ev;st.cd[id]=now;
    var R=st.mega[id]?CTF.K_PULSE_R*2:CTF.K_PULSE_R;st.mega[id]=0;ev.push({k:"pulse",id:id,x:p[0],y:p[1],r:R,t:t});
    for(var o in st.pos){if(o===id||st.teams[o]===undefined||st.teams[o]===t)continue;var q=st.pos[o];if(now-q[2]>1500)continue;
      if(Math.hypot(q[0]-p[0],q[1]-p[1])>R)continue;if((st.shield[o]||0)>now){ev.push({k:"block",id:o,by:id});continue;}
      var vf=CTF.carrying(st,o);st.spin[o]=now+CTF.K_SPIN_MS;
      if(vf>=0){var f=st.flags[vf];f.at=null;f.x=I.base[f.t][0];f.y=I.base[f.t][1];st.score[id]=(st.score[id]||0)+250;ev.push({k:"save",id:o,by:id,t:t});}
      else{st.score[id]=(st.score[id]||0)+60;ev.push({k:"spin",id:o,by:id});}}
    return ev;};
  /* Kart Flag: use the item you hold */
  CTF.use=function(st,I,id,now){var it=st.kart&&st.held[id],p=st.pos[id],ev=[];if(!it||!p||(st.spin[id]||0)>now)return ev;st.held[id]=null;var t=CTF.teamOf(st,id);
    if(it==="oil"){var a=p[3]!==undefined?Math.atan2(p[1]-p[4],p[0]-p[3]):0,ox=p[0]-Math.cos(a)*0.9,oy=p[1]-Math.sin(a)*0.9;if(I.solid(ox,oy)){ox=p[0];oy=p[1];}st.oil.push({x:ox,y:oy,t:now,by:id,team:t});if(st.oil.length>12)st.oil.shift();}
    else if(it==="shield")st.shield[id]=now+CTF.K_SHIELD_MS;
    else if(it==="mega")st.mega[id]=1;
    ev.push({k:"use",id:id,it:it,x:p[0],y:p[1]});return ev;};
  /* Kart Flag on a map with no power-up boxes: the sprint refills become boxes */
  CTF.kartMap=function(m){if(!m||m.t.indexOf("p")>=0)return m;return{name:m.name,w:m.w,h:m.h,t:m.t.replace(/s/g,"p")};};
  CTF.cdLeft=function(st,id,now){return Math.max(0,CTF.K_PULSE_MS-(now-(st.cd[id]||-1e9)));};
  CTF.boxLeft=function(st,i,now){var t=st.box&&st.box[i]||0;return t?Math.max(0,CTF.K_BOX_MS-(now-t)):0;};
  /* the sprint meter s = {e: 0..1, on}: holding sprint with enough charge runs you faster and drains it; otherwise it charges.
     Returns the speed multiplier for this step. */
  /* bodies: you can't walk through the other team, so you can block for a teammate. b is {x,y}; pushes it out of any enemy nearby (on foot only) */
  CTF.bump=function(I,st,id,b,now){if(st.kart)return;var t=st.teams[id];if(t===undefined)return;for(var o in st.pos){if(o===id||st.teams[o]===undefined||st.teams[o]===t)continue;var q=st.pos[o];if(now-q[2]>600||(st.tagged[o]&&now-st.tagged[o]<1500))continue;
    var dx=b.x-q[0],dy=b.y-q[1],d=Math.hypot(dx,dy);if(d>=CTF.BODY_R)continue;if(d<1e-3){dx=t?1:-1;dy=0;d=1;}var k=(CTF.BODY_R-d)*0.5;CTF.move(I,b,dx/d*k,dy/d*k);}};
  CTF.sprint=function(s,want,dt){if(want&&s.e>0&&(s.on||s.e>=CTF.SPRINT_MIN)){s.on=true;s.e=Math.max(0,s.e-dt/CTF.STAM);if(s.e<=0)s.on=false;}
    else{s.on=false;s.e=Math.min(1,s.e+dt/CTF.CHARGE);}return s.on?CTF.SPRINT:1;};
  /* how long until refill i is back (ms, 0 = it's there) */
  CTF.refillLeft=function(st,i,now){var t=st.refill&&st.refill[i]||0;return t?Math.max(0,CTF.REFILL_MS-(now-t)):0;};
  /* a bot's sprint: when it has the flag, is chasing a thief or a carrier is near, or has a long run ahead on a full meter */
  CTF.botSprint=function(st,I,id,x,y,goal,s){var t=CTF.teamOf(st,id);if(CTF.carrying(st,id)>=0)return true;if(st.flags[t].at)return true;
    return s.e>0.95&&Math.hypot(goal[0]-x,goal[1]-y)>9;};
  /* a shortest path step through the grid (for the bots): the next tile centre to head for on the way from a to b */
  CTF.path=function(I,ax,ay,bx,by){
    var w=I.w,h=I.h,sx=Math.floor(ax),sy=Math.floor(ay),tx=Math.floor(bx),ty=Math.floor(by);if(sx===tx&&sy===ty)return[bx,by];
    var prev=new Int32Array(w*h).fill(-1),q=[sy*w+sx],head=0;prev[sy*w+sx]=sy*w+sx;
    while(head<q.length){var c=q[head++],cx=c%w,cy=(c/w)|0;if(cx===tx&&cy===ty)break;
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nx=cx+d[0],ny=cy+d[1];if(nx<0||ny<0||nx>=w||ny>=h)return;var ni=ny*w+nx;if(prev[ni]>=0||m_solid(nx,ny))return;prev[ni]=c;q.push(ni);});}
    function m_solid(x,y){return I.solid(x+0.5,y+0.5);}
    var e=ty*w+tx;if(prev[e]<0)return[bx,by];var steps=[];while(e!==sy*w+sx){steps.push(e);e=prev[e];}
    /* look two tiles ahead so they cut corners a little, but only when the straight line there is clear of walls */
    var one=steps[steps.length-1],two=steps.length>1?steps[steps.length-2]:one,tx2=(two%w)+0.5,ty2=((two/w)|0)+0.5,clear=true;
    for(var k=1;k<=6&&clear;k++){var px=ax+(tx2-ax)*k/6,py=ay+(ty2-ay)*k/6;if(I.solid(px-0.34,py-0.34)||I.solid(px+0.34,py-0.34)||I.solid(px-0.34,py+0.34)||I.solid(px+0.34,py+0.34))clear=false;}
    var nxt=clear?two:one;return[(nxt%w)+0.5,((nxt/w)|0)+0.5];};
  /* a bot's plan: carrying a flag, run it home; a carrier from the other team about, chase them on your half; otherwise
     some go for the flag and some stay back near home */
  CTF.botGoal=function(st,I,id,x,y,role,e){
    var t=CTF.teamOf(st,id),cf=CTF.carrying(st,id);
    if(cf>=0)return I.base[t];
    var thief=st.flags[t].at;if(thief&&st.pos[thief]){var tp=st.pos[thief];return[tp[0],tp[1]];}
    /* low on sprint with a refill close by that's there: grab it on the way */
    if(e!==undefined&&e<0.35){var now=Date.now(),bi=-1,bd2=7;for(var ri=0;ri<I.refills.length;ri++){if(CTF.refillLeft(st,ri,now))continue;var dd=Math.hypot(I.refills[ri][0]-x,I.refills[ri][1]-y);if(dd<bd2){bd2=dd;bi=ri;}}
      if(bi>=0)return I.refills[bi];}
    if(role==="d"){var best=null,bd=1e9;for(var o in st.pos){if(st.teams[o]===t)continue;var q=st.pos[o];if(I.side(q[0],q[1])!==t)continue;var d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;best=[q[0],q[1]];}}
      if(best)return best;return[I.base[t][0]+(t?-4:4),I.base[t][1]+Math.sin(Date.now()/1500)*3];}
    var f=st.flags[1-t];return[f.x,f.y];};
  /* a bot on the other team's half steers away from anyone who could tag it (a push to add to its running) */
  CTF.botAvoid=function(st,I,id,x,y){var t=CTF.teamOf(st,id),ax=0,ay=0;if(I.side(x,y)===t)return[0,0];
    for(var o in st.pos){if(st.teams[o]===t||st.teams[o]===undefined)continue;var q=st.pos[o],dx=x-q[0],dy=y-q[1],d=Math.hypot(dx,dy);if(d<3&&d>0.01){ax+=dx/d*(3-d)/3;ay+=dy/d*(3-d)/3;}}
    var m=Math.hypot(ax,ay);return m>1?[ax/m,ay/m]:[ax,ay];};
  /* ---- drawing: the floor in dance-floor tiles, walls as raised pixel blocks, boost pads with running chevrons, bases ---- */
  CTF.fit=function(I,W,H,top,bot){var s=Math.max(4,Math.floor(Math.min(W/I.w,(H-top-bot)/I.h))),ox=Math.round((W-s*I.w)/2),oy=Math.round(top+(H-top-bot-s*I.h)/2);return{s:s,ox:ox,oy:oy,X:function(x){return ox+x*s;},Y:function(y){return oy+y*s;}};};
  /* a camera that follows you: about 15 tiles across on a phone, clamped to the arena. v.vw/v.vh/v.vt are the window it draws in. */
  CTF.cam=function(I,W,H,top,bot,me,kart){var f=CTF.fit(I,W,H,top,bot),vh=H-top-bot,s=kart?CTF.K_TILE:Math.max(f.s,Math.round(W/(W<641?15:20))),ox,oy;   /* Kart flag: the same fixed zoom as Mars Rally, on any screen */
    var mw=I.w*s,mh=I.h*s;ox=mw<=W?Math.round((W-mw)/2):Math.round(Math.min(0,Math.max(W-mw,W/2-me.x*s)));oy=mh<=vh?Math.round(top+(vh-mh)/2):Math.round(Math.min(top,Math.max(top+vh-mh,top+vh/2-me.y*s)));
    return{s:s,ox:ox,oy:oy,vw:W,vh:vh,vt:top,X:function(x){return ox+x*s;},Y:function(y){return oy+y*s;}};};
  CTF.draw=function(g,m,I,v,now,st){
    var s=v.s,P=Math.max(1,Math.round(s/8)),x,y,ph=(now/90)%8;
    var cx0=Math.max(0,Math.floor(-v.ox/s)-1),cx1=Math.min(I.w,Math.ceil(((v.vw||1e5)-v.ox)/s)+1),cy0=Math.max(0,Math.floor((( v.vt||-1e5)-v.oy)/s)-2),cy1=Math.min(I.h,Math.ceil(((v.vt||0)+(v.vh||1e5)-v.oy)/s)+2);
    for(y=cy0;y<cy1;y++)for(x=cx0;x<cx1;x++){var c=m.t[y*I.w+x],X=v.ox+x*s,Y=v.oy+y*s;
      if(c==="#"){continue;}
      var hs=Math.sin(x*12.9898+y*78.233)*43758.5453;hs-=Math.floor(hs);
      g.fillStyle=(x+y)%2?"#1a1430":"#120e1e";if(c==="R"||c==="r")g.fillStyle=(x+y)%2?"#3a1420":"#2c0f18";if(c==="B"||c==="b")g.fillStyle=(x+y)%2?"#14243e":"#0f1a30";
      g.fillRect(X,Y,s,s);
      if((c==="."||c==="R"||c==="B")&&hs<0.08){g.globalAlpha=0.35+0.25*Math.sin(now/300+x+y);g.fillStyle=["#D354A0","#7F77DD","#3DF2FF","#F5C518"][(hs*50|0)%4];g.fillRect(X+P,Y+P,s-2*P,s-2*P);g.globalAlpha=1;}
      g.fillStyle="#0a0714";g.fillRect(X,Y,s,P);g.fillRect(X,Y,P,s);
      var pd=I.pad(x,y);if(pd){g.fillStyle="#2b2050";g.fillRect(X+P,Y+P,s-2*P,s-2*P);g.fillStyle="#F5F23D";
        for(var k=0;k<2;k++){var o=((ph/8+k*0.5)%1)*s-s*0.25,cx=X+s/2+pd[0]*(o-s*0.25),cy=Y+s/2+pd[1]*(o-s*0.25);
          for(var q=-2;q<=2;q++){var ax=cx-pd[0]*Math.abs(q)*P+pd[1]*q*P,ay=cy-pd[1]*Math.abs(q)*P+pd[0]*q*P;if(ax>X&&ax<X+s-P&&ay>Y&&ay<Y+s-P)g.fillRect(Math.round(ax),Math.round(ay),P,P);}}}
      if(c==="r"||c==="b"){g.fillStyle=c==="r"?"rgba(232,80,91,.35)":"rgba(59,123,232,.35)";g.fillRect(X+2*P,Y+2*P,s-4*P,s-4*P);}
      if(c==="s"&&!(st&&st.kart)){var ri2=-1;for(var qq=0;qq<I.refills.length;qq++)if(Math.floor(I.refills[qq][0])===x&&Math.floor(I.refills[qq][1])===y){ri2=qq;break;}
        CTF.refillIcon(g,X+s/2,Y+s/2,s,now,st?CTF.refillLeft(st,ri2,Date.now()):0);}
      if(c==="p"&&st&&st.kart&&CTF.K_ITEMS){var bi2=-1;for(var qb=0;qb<I.boxes.length;qb++)if(Math.floor(I.boxes[qb][0])===x&&Math.floor(I.boxes[qb][1])===y){bi2=qb;break;}
        CTF.boxIcon(g,X+s/2,Y+s/2,s,now,st&&st.kart?CTF.boxLeft(st,bi2,Date.now()):0);}}
    /* walls on top: raised blocks with a lit top edge and a shadow below */
    for(y=cy0;y<cy1;y++)for(x=cx0;x<cx1;x++){if(m.t[y*I.w+x]!=="#")continue;var X2=v.ox+x*s,Y2=v.oy+y*s;
      g.fillStyle="#3a3058";g.fillRect(X2,Y2-P*2,s,s);g.fillStyle="#5a4a88";g.fillRect(X2,Y2-P*2,s,P);g.fillStyle="#241c3a";g.fillRect(X2,Y2+s-P*2,s,P*2);
      if(I.at(x+0.5,y+1.5)!=="#"){g.fillStyle="rgba(0,0,0,.35)";g.fillRect(X2,Y2+s,s,P*2);}}
    /* the bases: a ring round where each flag lives */
    [0,1].forEach(function(t){var b=I.base[t];g.strokeStyle=CTF.TEAM[t];g.lineWidth=P;g.globalAlpha=0.6+0.3*Math.sin(now/250);PX.ring(g,v.X(b[0]),v.Y(b[1]),CTF.CAP_R*s,P,P);g.globalAlpha=1;});
    if(st&&st.oil)st.oil.forEach(function(o){var X3=v.X(o.x),Y3=v.Y(o.y);g.fillStyle="#0b0b10";PX.oval(g,X3,Y3,s*0.5,s*0.3,0,P);g.fillStyle="rgba(120,90,220,.55)";PX.oval(g,X3-P,Y3-P,s*0.22,s*0.1,0,P);});
    if(st)st.flags.forEach(function(f){if(f.at===null)CTF.flag(g,v.X(f.x),v.Y(f.y),f.t,s,now);});
  };
  /* a power-up box: a rainbow ? block bobbing over its pad; once taken, a dim pad with a ring filling back up */
  CTF.boxIcon=function(g,x,y,s,now,left){var P=Math.max(1,Math.round(s/8));x=Math.round(x);y=Math.round(y);
    if(left>0){g.fillStyle="#2a2244";g.fillRect(x-3*P,y-3*P,6*P,6*P);g.strokeStyle="#7F77DD";g.lineWidth=P;g.beginPath();g.arc(x,y,3.5*P,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-left/CTF.K_BOX_MS));g.stroke();return;}
    var bob=Math.round(Math.sin(now/220)*P),hue=(now/8)%360,z=3*P;y+=bob;
    g.fillStyle="#000";g.fillRect(x-z-P,y-z-P,2*z+2*P,2*z+2*P);g.fillStyle="hsl("+hue+",90%,60%)";g.fillRect(x-z,y-z,2*z,2*z);g.fillStyle="hsl("+((hue+60)%360)+",90%,75%)";g.fillRect(x-z,y-z,2*z,P);
    g.fillStyle="#fff";g.fillRect(x-P,y-2*P,2*P,P);g.fillRect(x+P,y-P,P,P);g.fillRect(x,y,P,P);g.fillRect(x,y+2*P,P,P);};
  /* a sprint refill: a cyan lightning bolt bobbing over a glowing pad; once taken, a dim pad with a clock ring filling back up */
  CTF.refillIcon=function(g,x,y,s,now,left){var P=Math.max(1,Math.round(s/8));x=Math.round(x);y=Math.round(y);
    g.fillStyle="#0e2a36";g.fillRect(x-3*P,y-3*P,6*P,6*P);
    if(left>0){var k=1-left/CTF.REFILL_MS;g.fillStyle="rgba(61,242,255,.35)";var n=Math.round(k*16);for(var i=0;i<n;i++){var a=-Math.PI/2+i/16*Math.PI*2;g.fillRect(Math.round(x+Math.cos(a)*3.4*P-P/2),Math.round(y+Math.sin(a)*3.4*P-P/2),P,P);}return;}
    var gl=0.35+0.25*Math.sin(now/200);g.globalAlpha=gl;g.fillStyle="#3DF2FF";g.fillRect(x-4*P,y-4*P,8*P,8*P);g.globalAlpha=1;
    var by=Math.round(Math.sin(now/260)*P),B=[[1,-4],[0,-3],[1,-3],[-1,-2],[0,-2],[-1,-1],[0,-1],[1,-1],[2,-1],[0,0],[1,0],[-1,1],[0,1],[-1,2],[-2,3]];
    g.fillStyle="#0b0818";B.forEach(function(q){g.fillRect(x+q[0]*P+P,y+q[1]*P+by+P,P,P);});
    g.fillStyle="#3DF2FF";B.forEach(function(q){g.fillRect(x+q[0]*P,y+q[1]*P+by,P,P);});g.fillStyle="#fff";g.fillRect(x+P,y-4*P+by,P,P);};
  /* a flag on a pole, waving */
  CTF.flag=function(g,x,y,t,s,now){var P=Math.max(1,Math.round(s/8)),h=s*1.4,col=CTF.TEAM[t],dk=t?"#24509c":"#a8323b";x=Math.round(x);y=Math.round(y);
    g.fillStyle="rgba(0,0,0,.35)";g.fillRect(x-P*2,y,P*5,P);g.fillStyle="#d8d8e4";g.fillRect(x,y-h,P,h);
    var wv=Math.sin(now/160)*P;for(var r=0;r<4;r++){g.fillStyle=r%2?dk:col;g.fillRect(x+P,y-h+r*P*1.5+(r===1||r===2?wv*0.5:0),P*(6-r),P*1.5);}};
  /* ---------- the mosh pit's plan, shared by the venue, the performer's view and the server's bots ----------
     From the song's chart: the wall of death at the drop (split, count in, charge, a 10 s push war, the result), and circle pits
     in the loud stretches. window() fits a chart to a game that only runs for part of the song (two games per song). */
  var MOSHX={TUG_AT:800,TUG_MS:10000,TOP:0.35,BOT:0.74};
  MOSHX.plan=function(chart){
    var dur=chart&&chart.dur||0,D=chart&&chart.drop||0,out={wall:null,circles:[]},TA=MOSHX.TUG_AT,TM=MOSHX.TUG_MS;
    if(D>12000&&(!dur||D<dur-14000)){var split=Math.max(D-9000,4000);out.wall={split:split,count:D-3000,go:D,t0:D+TA,t1:D+TA+TM,end:D+TA+TM+3500};}
    /* every song is five parts: mosh pit, circle pit, mosh pit, circle pit, and the wall of death at the drop (the song's
       biggest quiet-to-loud moment), wherever that falls. The time the wall leaves is cut into four equal blocks in that order;
       a block the wall lands in carries on after it. */
    var w=out.wall,endT=dur||300000,zones=w?[[0,w.split],[w.end,endT]]:[[0,endT]],F=0;zones.forEach(function(z){F+=Math.max(0,z[1]-z[0]);});
    function at(f){var r=f;for(var q=0;q<zones.length;q++){var L=zones[q][1]-zones[q][0];if(r<=L)return zones[q][0]+r;r-=L;}return endT;}
    function span(f0,f1){var a0=at(f0),a1=at(f1);if(w&&a0<w.split&&a1>w.end)return[[a0,w.split],[w.end,a1]];if(w&&a0<w.split&&a1>w.split)return[[a0,w.split]];return[[a0,a1]];}
    [[F/4,F/2],[F*3/4,F]].forEach(function(bk){span(bk[0],bk[1]).forEach(function(iv){if(iv[1]-iv[0]>500)out.circles.push([Math.round(iv[0]),Math.round(iv[1])]);});});
    return out;
  };
  MOSHX.phaseAt=function(P,pos){
    if(!P)return "pit";var w=P.wall;
    if(w&&pos>=w.split&&pos<w.end){if(pos<w.count)return "split";if(pos<w.go)return "count";if(pos<w.t0)return "charge";if(pos<w.t1)return "tug";return "result";}
    for(var i=0;i<P.circles.length;i++)if(pos>=P.circles[i][0]&&pos<P.circles[i][1])return "circle";
    return "pit";
  };
  /* the circle pit: centred on the floor (top..bot as fractions of the room) */
  MOSHX.circle=function(top,bot){return{x:0.5,y:(top+bot)/2,ry:Math.max(0.06,(bot-top)/2-0.03)};};
  /* a game that runs from start to end (ms of song): keep the drop and loud stretches inside it, or make some that fit */
  MOSHX.window=function(chart,start,end){
    if(!chart)return chart;var c={},k;for(k in chart)c[k]=chart[k];var len=end-start,D=chart.drop||0;
    /* one wall of death per song: only the game that holds the song's drop gets it (moved in from the edges if it has to be);
       a song with no drop at all gets one in its first game */
    if(D>0){if(D>=start&&D<=end&&len>=40000)D=Math.max(start+20000,Math.min(end-17000,D));else D=0;}
    else D=start<=2000&&len>=62000?Math.round(start+len*0.6):0;
    c.drop=D;var wl=D?[D-12000,D+17300]:null,pk=[];
    (chart.peaks||[]).forEach(function(p){var a1=Math.max(p[0],start+4000),b1=Math.min(p[1],end-3000);if(b1-a1>=8000)pk.push([a1,b1]);});
    var clear=function(p){return !wl||p[1]<wl[0]||p[0]>wl[1];};
    if(!pk.some(clear)){var opts=[[start+6000,start+24000],[end-22000,end-4000]];for(var i=0;i<opts.length;i++)if(opts[i][1]-opts[i][0]>=8000&&opts[i][0]>=start&&clear(opts[i])){pk.unshift(opts[i]);break;}}
    c.peaks=pk;c.dur=Math.max(chart.dur||0,end+14001);return c;
  };
  /* the made-up mountain comes in layers: a flag zone (slalom gates) then a jump zone (a line of ramps and moguls), over and over */
  SK.Z0=300;SK.ZFLAG=1600;SK.ZJUMP=1400;
  /* each flag zone runs along a dead straight line; its first SK.NB flags are a plain left-right slalom, SK.SPB apart */
  SK.NB=5;SK.SPB=210;SK.BOREND=SK.ZFLAG-200;
  SK.zoneAt=function(yy){if(yy<SK.Z0)return{k:"start",y0:-1e9,y1:SK.Z0,i:-1};var per=SK.ZFLAG+SK.ZJUMP,i=Math.floor((yy-SK.Z0)/per),b=SK.Z0+i*per,m=yy-b;
    return m<SK.ZFLAG?{k:"flag",y0:b,y1:b+SK.ZFLAG,i:i}:{k:"jump",y0:b+SK.ZFLAG,y1:b+per,i:i};};
  SK.halfW=function(yy){return 110+Math.min(1,Math.max(0,yy)/650)*560;};
  function skBase(yy,sd){return Math.sin(yy/620+sd)*SK.halfW(yy)*0.42+Math.sin(yy/233+sd*2)*40*Math.min(1,yy/650);}
  /* the line down the mountain: wavy, except it runs straight through the opening slalom of every flag zone, then eases back into the wave */
  SK.lineX=function(yy,sd){
    if(yy<SK.Z0)return skBase(yy,sd);var per=SK.ZFLAG+SK.ZJUMP,b=SK.Z0+Math.floor((yy-SK.Z0)/per)*per,t=yy-b;
    if(t>SK.BOREND+300)return skBase(yy,sd);var hv=skBase(b,sd);if(t<=SK.BOREND)return hv;var w=(t-SK.BOREND)/300;w=w*w*(3-2*w);return hv+(skBase(yy,sd)-hv)*w;};
  function skRng(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646;};}
  /* a course from the Ski designer: {name, len, objs:[[kind, x, y, size]...]}; it repeats every len down the mountain */
  SK.KINDS={gate:1,tree:1,rock:1,ramp:1,mogul:1};
  SK.clean=function(c){
    if(!c||typeof c!=="object"||!Array.isArray(c.objs))return null;var len=Math.max(1000,Math.min(20000,Math.round(+c.len||3000))),out=[];
    for(var i=0;i<c.objs.length&&out.length<800;i++){var o=c.objs[i];if(!Array.isArray(o)||!SK.KINDS[o[0]])continue;var x=+o[1],y=+o[2],s=+o[3]||1;if(!isFinite(x)||!isFinite(y))continue;
      out.push([o[0],Math.round(Math.max(-700,Math.min(700,x))),Math.round(Math.max(60,Math.min(len-1,y))),Math.round(Math.max(0.7,Math.min(1.5,s))*100)/100]);}
    out.sort(function(p,q){return p[2]-q[2];});
    return{name:String(c.name||"My mountain").slice(0,40),len:len,objs:out};};
  SK.chunk=function(seed,ci,cache,course){
    if(cache[ci])return cache[ci];var r=skRng((seed*7919+ci*104729)%2147483646+1),o=[],y0=ci*SK.CH;
    if(course){var L=course.len,gi0=0;for(var rp=Math.floor(y0/L);rp*L<y0+SK.CH;rp++){gi0=0;course.objs.forEach(function(q,qi){var yy=rp*L+q[2];
        if(q[0]==="gate"){gi0++;if(yy>=y0&&yy<y0+SK.CH)o.push({k:"gate",x:q[1],y:yy,id:rp*1000+qi,col:gi0%2?"#E8505B":"#3B7BE8"});return;}
        if(yy>=y0&&yy<y0+SK.CH)o.push({k:q[0],x:q[1],y:yy,s:q[3]||1});});}}
    else if(y0>=60){
      /* zone markers across the run where each zone starts */
      var per=SK.ZFLAG+SK.ZJUMP;for(var zb=SK.Z0+Math.max(0,Math.floor((y0-SK.Z0)/per))*per;zb<y0+SK.CH;zb+=per){[zb,zb+SK.ZFLAG].forEach(function(zy,zk){if(zy>=y0&&zy<y0+SK.CH)o.push({k:"zone",x:0,y:zy,z:zk?"jump":"flag"});});}
      /* flag zones: gates down the line, a little tighter than before */
      /* single slalom flags. A swoop fires you out toward the flag's own side, so the next flag sits out that way: each flag is
         set so the run from the swoop to the next one is a 45-65 degree line (random for each; a fixed 50 in the opening
         slalom). Red flags are passed on their left, blue on their right, and the flags sit on the side they're passed.
         Each flag zone opens with SK.NB plain left-right flags on a straight line, then the rest follow the wavy line. */
      for(var zi=Math.max(0,Math.floor((y0-SK.Z0-SK.ZFLAG)/per));SK.Z0+zi*per<y0+SK.CH;zi++){var zb2=SK.Z0+zi*per,q2;
        var SP=SK.SPB,GAPY=SP-(SK.DIV.R*2-5);                      /* flag to flag, minus the swoop's start and end */
        for(q2=0;q2<SK.ZFLAG-60-120+1;q2+=SP){var n=q2/SP,gy=zb2+120+q2;if(gy<y0||gy>=y0+SK.CH)continue;
          var rr=skRng((seed*131+zi*977+n*57)%2147483646+1),th=n<SK.NB?50:45+rr()*20,A=Math.tan(th*Math.PI/180)*GAPY-31;
          var pass=n%2?1:-1;
          o.push({k:"flag",x:SK.lineX(gy,seed)+pass*A/2,y:gy,id:Math.round(gy),pass:pass,col:pass<0?"#E8505B":"#3B7BE8"});}}
      /* jump zones: a run of ramps along the line, swapping sides, with moguls between */
      for(var ry2=Math.ceil(y0/420)*420;ry2<y0+SK.CH;ry2+=420){var zr=SK.zoneAt(ry2);if(zr.k!=="jump"||ry2<zr.y0+120||ry2>zr.y1-80)continue;var side2=Math.round(ry2/420)%2?-1:1;o.push({k:"ramp",x:SK.lineX(ry2,seed)+side2*26,y:ry2});
        if(r()<0.8){var my2=ry2+90+r()*60;o.push({k:"mogul",x:SK.lineX(my2,seed)+(r()*2-1)*70,y:my2});}}
      var nt=5+Math.floor(r()*6);for(var i=0;i<nt;i++){var ty=y0+r()*SK.CH,hw=SK.halfW(ty),tx=(r()*2-1)*hw;if(Math.abs(tx-SK.lineX(ty,seed))<95)continue;o.push({k:r()<0.8?"tree":"rock",x:tx,y:ty,s:0.8+r()*0.5});}
      if(r()<0.4){var my=y0+r()*SK.CH;if(SK.zoneAt(my).k==="flag")o.push({k:"mogul",x:(r()*2-1)*SK.halfW(my)*0.8,y:my});}
    }
    for(var e=0;e<14;e++){var ey=y0+r()*SK.CH,side=r()<0.5?-1:1,ex=side*(SK.halfW(ey)+20+r()*220);o.push({k:"tree",x:ex,y:ey,s:0.9+r()*0.6,edge:1});}
    o.sort(function(p,q){return p.y-q.y;});return cache[ci]=o;
  };
  /* the line through the gates (bots and the test skier follow it) */
  SK.lineAt=function(course,yy,seed){
    if(!course)return SK.lineX(yy,seed);var gs=course.objs.filter(function(q){return q[0]==="gate";});if(!gs.length)return 0;
    var L=course.len,m=((yy%L)+L)%L,prev=gs[gs.length-1],pY=prev[2]-L,next=gs[0],nY=next[2];
    for(var i=0;i<gs.length;i++){if(gs[i][2]>m){next=gs[i];nY=gs[i][2];prev=i?gs[i-1]:gs[gs.length-1];pY=i?gs[i-1][2]:gs[gs.length-1][2]-L;break;}if(i===gs.length-1){prev=gs[i];pY=gs[i][2];next=gs[0];nY=gs[0][2]+L;}}
    var t=(m-pY)/Math.max(1,nY-pY);t=t*t*(3-2*t);return prev[1]+(next[1]-prev[1])*t;};
  /* the default course for the designer: the first stretch of the made-up mountain */
  SK.defaultCourse=function(){var cache={},objs=[];for(var ci=0;ci*SK.CH<3000;ci++)SK.chunk(1,ci,cache).forEach(function(o){if(o.edge||o.y>=3000)return;objs.push([o.k,Math.round(o.x),Math.round(o.y),o.s||1]);});return{name:"First run",len:3000,objs:objs};};
  SK.near=function(seed,cache,y0,y1,course){var out=[];for(var ci=Math.floor(y0/SK.CH);ci<=Math.floor(y1/SK.CH);ci++)if(ci>=0)out=out.concat(SK.chunk(seed,ci,cache,course));return out.filter(function(o){return o.y>=y0&&o.y<=y1;});};
  /* someone's position from what they send: x and the last 1000 of y in pos, the thousands in sk.h (picks the y nearest last time) */
  SK.decode=function(px,py,hh,prevY){var best=null;for(var d=-1;d<=1;d++){var yy=(hh+d)*1000+py*1000;if(best===null||Math.abs(yy-prevY)<Math.abs(best-prevY))best=yy;}if(prevY===null||prevY===undefined)best=hh*1000+py*1000;return[px*1600-800,best];};
  /* ---- ski sprites: hand-drawn pixel art (one character per pixel), built once into little canvases and scaled up crisp ---- */
  var SKPAL={o:"#0f2416",d:"#1f5a2c",g:"#2f7a3e",l:"#4a9a52",L:"#6cbf6a",s:"#f4f8ff",S:"#c9d6ea",t:"#6b4a2b",T:"#4a321c",
    r:"#2c3140",R:"#5a6172",m:"#7d8597",n:"#a9b0c0",h:"#d6dbe6",p:"#2a2a33",P:"#8a8a99",w:"#ffffff",b:"#b9d6f2",B:"#7fb0e0",k:"#3b5a80",a:"#3B7BE8",x:"#94a8c8"};
  var SKART={
    tree:["......oo......",".....osso.....","....osssSo....","....oglLdo....","...ogglLgdo...","..ossglgdSSo..","..oSsggggdSo..",".oggglLgggddo.",".ogglgggLgddo.","ossgglggggdSSo","oSssgLgggdSSSo","oggglgggLggddo","ogglgggggLgddo",".oooggggggdoo.","...oddddddo...","......tT......","......tT......",".....otTo.....","......oo......"],
    tree2:[".....oo.....","....osso....","...osssSo...","...ogLgdo...","..oggLgddo..","..osgggdSo..",".oggLgggddo.",".osSggggSSo.","oggggLggggdo","ooggggggddoo","..oddddddo..",".....tT.....",".....tT.....","....otTo...."],
    rock:["....rrrrrr....","..rrnnnnnnrr..",".rnnhhnnnnmmr.","rnnhhhnnnnmmmr","rmnnnnnnnmmmRr","rRmmmmmmmmmRRr",".rRRRRRRRRRRr.","..rrrrrrrrrr.."],
    rocks:["....ssss....","..rsssssSr..",".rnnhnnnmmr.","rnnhhnnnmmmr","rmnnnnnmmmRr","rRRmmmmmRRRr",".rrrrrrrrrr."],
    ramp:["......kkkkkkkkkk......",".....kwwwwwwwwwwk.....","....kbbbbbbbbbbbbk....","...kbbbbbbaabbbbbbk...","..kbbbbbbaaaabbbbbbk..",".kbbbbbbbbaabbbbbbbbk.","kBBBBBBBBBBBBBBBBBBBBk","kkkkkkkkkkkkkkkkkkkkkk"],
    mogul:["....ssssss......","..ssswwwwsss....",".sswwwwwwwwssss.","SSssssssssssssSS",".SSSSSSSSSSSSSS."],
    flag:["pccccc...","pcccccc..","pccccccc.","pcccccCC.","pccccCC..","pcccC....","pC.......","p........","p........","p........","p........","p........","p........","p........","p........","p........","pP.......","PP......."],
    shadow:["..xxxxxxxxxx..","xxxxxxxxxxxxxx","..xxxxxxxxxx.."],
    bank:[".ss.","swws","SSSS"]};
  var SKC={};
  SK.sprite=function(name,c1,c2){var key=name+(c1||"");if(SKC[key])return SKC[key];if(typeof document==="undefined")return null;
    var rows=SKART[name],h=rows.length,w=rows[0].length,cv=document.createElement("canvas");cv.width=w;cv.height=h;var g=cv.getContext("2d");
    for(var y=0;y<h;y++)for(var x=0;x<w;x++){var ch=rows[y][x];if(ch===".")continue;var col=ch==="c"?(c1||"#E8505B"):ch==="C"?(c2||"#a8323b"):SKPAL[ch];if(!col)continue;g.fillStyle=col;g.fillRect(x,y,1,1);}
    return SKC[key]=cv;};
  /* draw a sprite standing on (cx, cy) at a whole-number pixel size k, so it stays crisp */
  SK.blit=function(g,name,cx,cy,k,c1,c2,flip){var s=SK.sprite(name,c1,c2);if(!s)return;var w=s.width*k,h=s.height*k;g.save();g.imageSmoothingEnabled=false;
    if(flip){g.translate(Math.round(cx),0);g.scale(-1,1);g.drawImage(s,Math.round(-w/2),Math.round(cy-h),w,h);}else g.drawImage(s,Math.round(cx-w/2),Math.round(cy-h),w,h);g.restore();};
  /* the ski lift down the side of the run: two cables overhead (with their shadows on the snow), a pylon every so often
     down the mountain, and empty chairs going back up. o = {cx: screen x of the lift, H, sy: world y -> screen y,
     y0, y1: the world rows on screen, s: art pixel size, now}. The performer's chair is drawn by liftChair. */
  SK.LIFT_GAP=520;
  SK.lift=function(g,o){var s=o.s,cx=Math.round(o.cx),H=o.H,up=cx-7*s,dn=cx+7*s,P=Math.max(2,Math.round(s));
    g.save();g.imageSmoothingEnabled=false;
    /* shadows on the snow, down and to the right */
    g.fillStyle="rgba(120,140,175,.28)";g.fillRect(up+9*s,0,P,H);g.fillRect(dn+9*s,0,P,H);
    /* pylons */
    var t0=Math.floor(o.y0/SK.LIFT_GAP)*SK.LIFT_GAP;
    for(var ty=t0;ty<o.y1+SK.LIFT_GAP;ty+=SK.LIFT_GAP){var Y=Math.round(o.sy(ty));if(Y<-60||Y>H+60)continue;
      g.fillStyle="rgba(120,140,175,.35)";g.fillRect(cx+4*s,Y+2*s,3*s,22*s);                       /* its shadow */
      g.fillStyle="#3a4256";g.fillRect(cx-2*s,Y,4*s,26*s);g.fillStyle="#59637d";g.fillRect(cx-2*s,Y,1*s,26*s);   /* the pole, down to the snow */
      g.fillStyle="#2a3044";g.fillRect(cx-10*s,Y-2*s,20*s,4*s);g.fillStyle="#7d88a6";g.fillRect(cx-10*s,Y-2*s,20*s,1*s);   /* the crossbar */
      g.fillStyle="#cfd8e8";g.fillRect(cx-6*s,Y+24*s,12*s,3*s);}                                   /* snow piled at the foot */
    /* empty chairs riding back up */
    var per=210,off=(o.now*0.09)%per;
    for(var cy=-per+off;cy<H+per;cy+=per){var Y2=Math.round(H-cy);SK.liftChair(g,up,Y2,s*0.8,false,true);}
    /* the cables */
    g.fillStyle="#1d2333";g.fillRect(up-Math.floor(P/2),0,P,H);g.fillRect(dn-Math.floor(P/2),0,P,H);
    g.restore();};
  /* a chair hanging from the cable at x; y is where a rider's hips sit. back: the hanger, frame and bench (draw the rider after);
     front: the safety bar across their lap (draw it after the rider). empty: no rider, so draw it all at once. */
  SK.liftChair=function(g,x,y,s,front,empty){x=Math.round(x);y=Math.round(y);
    if(!front||empty){g.fillStyle="#1d2333";g.fillRect(x-s,y-30*s,2*s,26*s);                       /* the hanger */
      g.fillStyle="#2a3044";g.fillRect(x-11*s,y-5*s,22*s,2*s);                                         /* the back rest */
      g.fillStyle="#E8505B";g.fillRect(x-11*s,y-3*s,22*s,5*s);g.fillStyle="#b8323d";g.fillRect(x-11*s,y+s,22*s,s);   /* the bench */
      g.fillStyle="#1d2333";g.fillRect(x-12*s,y-5*s,s,8*s);g.fillRect(x+11*s,y-5*s,s,8*s);}            /* the side rails */
    if(front||empty){g.fillStyle="#1d2333";g.fillRect(x-10*s,y+3*s,20*s,s);g.fillRect(x-10*s,y-2*s,s,5*s);g.fillRect(x+9*s,y-2*s,s,5*s);}};
  SK.px=function(z,s){return Math.max(2,Math.round(z*(s||1)*1.6));};
  /* skis in pixel art: they snap between set angles (every 30 degrees), drawn cell by cell on the pixel grid, the way a
     sprite swaps frames, and the character's facing follows the same frame (dirFor) */
  SK.frameOf=function(ang){return Math.max(-3,Math.min(3,Math.round(ang/(Math.PI/6))));};
  SK.dirFor=function(ang){var q=SK.frameOf(ang);return q===0?0:q>=3?1:q<=-3?3:q>0?4:7;};
  SK.skis=function(g,cx,cy,ang,z,col,slide){var k=SK.px(z),q=Math.round(ang/(Math.PI/6))*(Math.PI/6),fx=Math.sin(q),fy=Math.cos(q),px2=Math.cos(q),py2=-Math.sin(q),L=6,off=2,tip=PX&&shadeHex(col,0.35);
    cx=Math.round(cx/k)*k;cy=Math.round(cy/k)*k;
    [-1,1].forEach(function(sd){var ox=sd*(off*k+(slide||0));
      for(var t=-L;t<=L+1;t+=0.5){var x=cx+fx*t*k+px2*ox,y=cy+fy*t*k+py2*ox;g.fillStyle=t>L?tip:col;g.fillRect(Math.round(x/k)*k,Math.round(y/k)*k,k,k);}});};   /* half steps, so diagonals join up as pixel stairs */
  function shadeHex(c,amt){var r=parseInt(c.substr(1,2),16),gg=parseInt(c.substr(3,2),16),b=parseInt(c.substr(5,2),16),f=function(v){return Math.round(Math.min(255,v+(255-v)*amt));};return "rgb("+f(r)+","+f(gg)+","+f(b)+")";}
  /* the things on the slope, at screen x, y (the ground point) and zoom z */
  SK.tree=function(g,cx,cy,s,z,alt){var k=SK.px(z,s);SK.blit(g,"shadow",cx+3*k,cy+2*k,k);SK.blit(g,alt?"tree2":"tree",cx,cy+k,k);};
  SK.rock=function(g,cx,cy,s,z,alt){var k=SK.px(z,s);SK.blit(g,"shadow",cx+2*k,cy+2*k,k);SK.blit(g,alt?"rocks":"rock",cx,cy+k,k);};
  SK.ramp=function(g,cx,cy,z){var k=Math.round(SK.px(z)*2.4);SK.blit(g,"ramp",cx,cy+4*k,k);};   /* big ramps */
  SK.mogul=function(g,cx,cy,z){var k=SK.px(z);SK.blit(g,"mogul",cx,cy+2*k,k);};
  SK.gate=function(g,o,z,sx,sy,passedIt){var k=SK.px(z),dark=o.col==="#E8505B"?"#a8323b":"#24509c";
    [-1,1].forEach(function(sd){SK.blit(g,"flag",sx(o.x+sd*SK.GATE_W),sy(o.y),k,o.col,dark,sd>0);});
    if(passedIt){g.globalAlpha=0.3;g.fillStyle=o.col;for(var q=sx(o.x-SK.GATE_W);q<sx(o.x+SK.GATE_W);q+=k*3)g.fillRect(Math.round(q),Math.round(sy(o.y)),k*2,k);g.globalAlpha=1;}};
  /* where a zone starts: a dashed line of colour across the run and the zone's name on the snow */
  SK.zone=function(g,o,z,sx,sy){var k=SK.px(z),col=o.z==="jump"?"#22a6c8":"#d8404c",hw=SK.halfW(o.y),yy=Math.round(sy(o.y));
    g.fillStyle=col;for(var q=-hw;q<hw;q+=18)g.fillRect(Math.round(sx(q)),yy,Math.round(10*z),k);
    pixText(g,o.z==="jump"?"JUMP ZONE":"FLAG ZONE",sx(0),yy+k*3,Math.max(2,Math.round(k*0.9)),col,"center");};
  /* the divot: a carved bowl in the snow on the side you pass, with chevrons pointing the way through */
  /* the divot: a carved, banked groove that curves round the flag on the side you pass, like a "(" (or ")"). Land in it
     from a jump and it sweeps you round the flag and fires you out the bottom, fast. arc(o,t): a point on it, t 0..1 */
  SK.DIV={R:50,t0:0.12,t1:0.92,w:13};
  SK.arc=function(o,t){var an=(SK.DIV.t0+(SK.DIV.t1-SK.DIV.t0)*t)*Math.PI;return[o.x+o.pass*SK.DIV.R*Math.sin(an),o.y-SK.DIV.R*Math.cos(an)];};
  SK.arcNear=function(o,x,y){var best=null;for(var i=0;i<=24;i++){var p=SK.arc(o,i/24),d=Math.hypot(x-p[0],y-p[1]);if(!best||d<best.d)best={t:i/24,d:d};}return best;};
  SK.divot=function(g,o,z,sx,sy,passedIt){var k=SK.px(z),w=SK.DIV.w*z,i,p,c,N=34;
    /* the bank: a wide band, its outer lip in shadow and the inner edge bright, so it reads as a groove */
    for(i=0;i<=N;i++){p=SK.arc(o,i/N);c=[sx(p[0]),sy(p[1])];g.fillStyle="#a8bedf";PX.disc(g,c[0],c[1],w,k);}
    for(i=0;i<=N;i++){p=SK.arc(o,i/N);var q=SK.arc(o,i/N),nx=(q[0]-o.x)/SK.DIV.R,ny=(q[1]-o.y)/SK.DIV.R;c=[sx(p[0]-nx*3),sy(p[1]-ny*3)];g.fillStyle="#d5e2f4";PX.disc(g,c[0],c[1],w*0.62,k);}
    for(i=0;i<=N;i++){p=SK.arc(o,i/N);var nx2=(p[0]-o.x)/SK.DIV.R,ny2=(p[1]-o.y)/SK.DIV.R;g.fillStyle="#7f9cc8";g.fillRect(Math.round(sx(p[0]+nx2*SK.DIV.w*0.95)/k)*k,Math.round(sy(p[1]+ny2*SK.DIV.w*0.95)/k)*k,k,k);}
    /* chevrons running along it, the way you go round */
    g.fillStyle=passedIt?"#9db8d8":o.col;for(var ch=0;ch<4;ch++){var t=0.18+ch*0.21,a1=SK.arc(o,t),a2=SK.arc(o,t+0.04),dx=a2[0]-a1[0],dy=a2[1]-a1[1],dl=Math.hypot(dx,dy)||1;dx/=dl;dy/=dl;
      for(var qq=-2;qq<=2;qq++){var bx=a1[0]-dx*Math.abs(qq)*1.6-dy*qq*1.6,by=a1[1]-dy*Math.abs(qq)*1.6+dx*qq*1.6;g.fillRect(Math.round(sx(bx)/k)*k,Math.round(sy(by)/k)*k,k,k);}}};
  /* a slalom flag with an arrow on it pointing the side to pass */
  SK.sflag=function(g,o,z,sx,sy,passedIt){var k=SK.px(z),fx=sx(o.x),fy=sy(o.y),dark=o.col==="#E8505B"?"#a8323b":"#24509c";
    SK.blit(g,"flag",fx,fy,k,passedIt?"#c9cfdb":o.col,passedIt?"#a7afbf":dark,false);
    var ox=Math.round(fx-SK.sprite("flag").width*k/2)+k*2,oy=Math.round(fy-SK.sprite("flag").height*k)+k;   /* the arrow, in white on the cloth */
    g.fillStyle="#fff";var rows=o.pass<0?["..#..",".##..","#####",".##..","..#.."]:["..#..","..##.","#####","..##.","..#.."];
    for(var r=0;r<5;r++)for(var c=0;c<5;c++)if(rows[r][c]==="#")g.fillRect(ox+c*k*0.8,oy+r*k*0.8,Math.ceil(k*0.8),Math.ceil(k*0.8));};
  SK.obj=function(g,o,z,sx,sy,passedIt){var ox=sx(o.x),oy=sy(o.y),alt=((Math.round(o.x*7+o.y*3)%3)+3)%3===0;if(o.k==="tree")SK.tree(g,ox,oy,o.s,z,alt);else if(o.k==="rock")SK.rock(g,ox,oy,o.s,z,alt);else if(o.k==="ramp")SK.ramp(g,ox,oy,z);else if(o.k==="mogul")SK.mogul(g,ox,oy,z);else if(o.k==="zone")SK.zone(g,o,z,sx,sy);else if(o.k==="flag"){SK.divot(g,o,z,sx,sy,passedIt);SK.sflag(g,o,z,sx,sy,passedIt);}else if(o.k==="gate")SK.gate(g,o,z,sx,sy,passedIt);};
  /* snow with a faint grain, the start strip of dance floor, and the edges of the run, for the view from y0 to y1 */
  SK.ground=function(g,W,H,z,sx,sy,camX,y0,y1){
    g.fillStyle="#eef3fb";g.fillRect(0,0,W,H);
    g.fillStyle="rgba(150,175,210,.18)";for(var gy=Math.floor(y0/24)*24;gy<y1;gy+=24)for(var gx=Math.floor((camX-W/2/z)/37)*37;gx<camX+W/2/z;gx+=37){var hsh=Math.sin(gx*12.9898+gy*78.233)*43758.5453;hsh-=Math.floor(hsh);if(hsh<0.35)g.fillRect(sx(gx+hsh*20),sy(gy),2,1);}
    if(y0<10){for(var ty=-160;ty<0;ty+=16)for(var tx=-112;tx<112;tx+=16){g.fillStyle=((tx+ty)/16)%2?"#1a1430":"#120e1e";g.fillRect(sx(tx),sy(ty),16*z+1,16*z+1);}
      for(var s2=-112;s2<112;s2+=8){g.fillStyle=(s2/8)%2?"#fff":"#111";g.fillRect(sx(s2),sy(0)-2,8*z,4);}}
    var kb=SK.px(z);[-1,1].forEach(function(sd){for(var ey=Math.max(0,Math.floor(y0/14)*14);ey<y1;ey+=14)SK.blit(g,"bank",sx(sd*SK.halfW(ey)),sy(ey),kb);});   /* snowbanks along the edge of the run */
  };
  /* ---------------- the half pipe (the pipe round): shape, motion and drawing, shared by the venue and the performer's stage view ----------------
     Positions are fractions of the venue (x across, y = depth lane). A skater with swing A (0.3..1.85) crosses the pipe once every BPC beats;
     past the lip (|u| > 1) they're in the air. Every screen works this out from the beat, so everyone sees the same thing, smoothly. */

  /* ---------- pixel helpers: round shapes and gradients drawn the pixel-art way ----------
     disc/oval/ring fill whole square pixels on a grid (P = the scene's pixel size), so circles come out as chunky
     stepped shapes instead of smooth ones. lg/rg are gradients that step through flat bands instead of blending. */
  var PX=(function(){
    function unit(g){var c=g.canvas;if(!c)return 2;var w=c.clientWidth||c.width,h=c.clientHeight||c.height;if(c._pxW!==w||c._pxH!==h){c._pxW=w;c._pxH=h;c._pxP=sceneP(w,h);}return c._pxP;}
    /* rows of an ellipse (optionally rotated) as [y, x0, x1] in pixel cells */
    function rows(x,y,rx,ry,rot,P,cb){
      rx=Math.max(P*0.5,Math.abs(rx));ry=Math.max(P*0.5,Math.abs(ry));
      var cs=Math.cos(rot||0),sn=Math.sin(rot||0),A=cs*cs/(rx*rx)+sn*sn/(ry*ry),B=2*sn*cs*(1/(rx*rx)-1/(ry*ry)),C=sn*sn/(rx*rx)+cs*cs/(ry*ry);
      var ext=Math.sqrt(A/(A*C-B*B/4)),j0=Math.floor((y-ext)/P),j1=Math.floor((y+ext)/P);
      for(var j=j0;j<=j1;j++){var dy=(j+0.5)*P-y,b=B*dy,c=C*dy*dy-1,D=b*b-4*A*c;if(D<0)continue;var sq=Math.sqrt(D),xa=x+(-b-sq)/(2*A),xb=x+(-b+sq)/(2*A),i0=Math.round(xa/P),i1=Math.round(xb/P);if(i1<=i0){if(xb-xa<P*0.2)continue;i1=i0+1;}cb(j,i0,i1);}
    }
    function oval(g,x,y,rx,ry,rot,P){P=P||unit(g);rows(x,y,rx,ry,rot,P,function(j,i0,i1){g.fillRect(i0*P,j*P,(i1-i0)*P,P);});}
    function disc(g,x,y,r,P){oval(g,x,y,r,r,0,P);}
    /* an outline: uses the current strokeStyle and lineWidth, never thinner than one pixel */
    function ringO(g,x,y,rx,ry,rot,w,P){
      P=P||unit(g);w=Math.max(P,w===undefined?g.lineWidth:w);var fs=g.fillStyle;g.fillStyle=g.strokeStyle;
      var inner={};if(rx-w/2>P*0.5&&ry-w/2>P*0.5)rows(x,y,rx-w/2,ry-w/2,rot,P,function(j,i0,i1){inner[j]=[i0,i1];});
      rows(x,y,rx+w/2,ry+w/2,rot,P,function(j,i0,i1){var n=inner[j];if(!n){g.fillRect(i0*P,j*P,(i1-i0)*P,P);return;}
        var l1=Math.min(i1,Math.max(i0,n[0])),r0=Math.max(l1,Math.min(i1,n[1]));if(l1>i0)g.fillRect(i0*P,j*P,(l1-i0)*P,P);if(i1>r0)g.fillRect(r0*P,j*P,(i1-r0)*P,P);});
      g.fillStyle=fs;
    }
    function ring(g,x,y,r,w,P){ringO(g,x,y,r,r,0,w,P);}
    /* gradients that step: each stretch between two colour stops is cut into flat bands */
    var pc=null,cache={};
    function rgba(c){if(cache[c])return cache[c];if(!pc){var cv=document.createElement("canvas");cv.width=cv.height=1;pc=cv.getContext("2d");}
      pc.fillStyle="#000";pc.fillStyle=c;var s=pc.fillStyle,o;if(s.charAt(0)==="#")o=[parseInt(s.substr(1,2),16),parseInt(s.substr(3,2),16),parseInt(s.substr(5,2),16),1];else{var m=s.match(/[\d.]+/g)||[0,0,0,1];o=[+m[0],+m[1],+m[2],m[3]===undefined?1:+m[3]];}
      return cache[c]=o;}
    function mix(a,b,k){return "rgba("+Math.round(a[0]+(b[0]-a[0])*k)+","+Math.round(a[1]+(b[1]-a[1])*k)+","+Math.round(a[2]+(b[2]-a[2])*k)+","+(a[3]+(b[3]-a[3])*k).toFixed(3)+")";}
    function band(gr,n){var add=gr.addColorStop.bind(gr),last=null;n=n||4;
      gr.addColorStop=function(o,c){o=Math.max(0,Math.min(1,+o||0));var cur=rgba(c);
        if(last&&o>last.o){var d=o-last.o;for(var i=1;i<n;i++){var oo=last.o+d*i/n;add(oo,mix(last.c,cur,(i-1)/(n-1)));add(oo,mix(last.c,cur,i/(n-1)));}add(o,mix(last.c,cur,1));}
        else add(o,c);
        last={o:o,c:cur};};
      return gr;}
    function lg(g,x0,y0,x1,y1,n){return band(g.createLinearGradient(x0,y0,x1,y1),n);}
    function rg(g,x0,y0,r0,x1,y1,r1,n){return band(g.createRadialGradient(x0,y0,Math.max(0,r0),x1,y1,Math.max(0,r1)),n||5);}
    return{unit:unit,disc:disc,oval:oval,ring:ring,ringO:ringO,lg:lg,rg:rg};
  })();
  var PP={XL:0.04,XR:0.96,Y0:0.42,Y1:0.84,FLAT:0.42,BPC:2,AMAX:1.85,
    TR:[null,{k:"kick",name:"Kickflip",pts:150,dur:0.3,col:"#3DF2FF"},{k:"heel",name:"Heelflip",pts:150,dur:0.3,col:"#4CC38A"},{k:"grab",name:"Indy grab",pts:200,dur:0.35,col:"#F5C518"},{k:"spin",name:"360",pts:300,dur:0.42,col:"#D04DFF"}]};
  PP.prof=function(au){if(au<=PP.FLAT)return 0;var t=Math.min(1,(au-PP.FLAT)/(1-PP.FLAT));return 1-Math.sqrt(Math.max(0,1-t*t));};
  PP.slope=function(u){var au=Math.abs(u);if(au<=PP.FLAT)return 0;var t=Math.min(0.999,(au-PP.FLAT)/(1-PP.FLAT));return (u<0?-1:1)*t/Math.sqrt(1-t*t)/(1-PP.FLAT);};
  PP.xOf=function(u){return 0.5+u*(PP.XR-PP.XL)/2;};
  /* the song's beat at a position (ms), from the chart's beat times when there are some */
  PP.beatAt=function(c,pos){var bs=c&&c.beats,per=c&&c.bpm?60000/c.bpm:500;
    if(!(pos>-1e8))return performance.now()/per;
    if(!bs||bs.length<2)return pos/per;
    if(pos<=bs[0])return (pos-bs[0])/per;
    var n=bs.length;if(pos>=bs[n-1])return n-1+(pos-bs[n-1])/per;
    var lo=0,hi=n-1;while(hi-lo>1){var m=(lo+hi)>>1;if(bs[m]<=pos)lo=m;else hi=m;}
    return lo+(pos-bs[lo])/Math.max(1,bs[hi]-bs[lo]);};
  /* lanes: everyone sorted the same way on every screen; neighbours start on opposite walls */
  PP.lane=function(ids,id){ids=ids.slice().sort();var i=Math.max(0,ids.indexOf(id)),n=Math.max(4,Math.min(8,ids.length));return{y:PP.Y0+((i%n)+0.5)/n*(PP.Y1-PP.Y0),s:i%2?-1:1};};
  /* where a skater is: wallPx = how tall the walls are on this screen, halfW = half the pipe's width in pixels (for the tilt) */
  PP.state=function(A,sg,b,wallPx,halfW){
    var s=sg*Math.sin(Math.PI*b/PP.BPC),u=A*s,air=Math.abs(u)>1,z=air?(Math.abs(u)-1)/(PP.AMAX-1):0,uu=air?(u<0?-1:1):u,vel=sg*Math.cos(Math.PI*b/PP.BPC);
    return{u:uu,x:PP.xOf(uu),air:air,z:z,h:PP.prof(Math.abs(uu)),ang:air?0:Math.atan(PP.slope(uu)*wallPx/Math.max(1,halfW)),dir:vel>=0?1:3};};
  /* the pipe itself, built from dance-floor tiles bent round the curve: o = {W, X(x frac) -> px, Yd(y frac) -> px, wall px, beat}.
     Tiles keep the same size along the surface, so on the walls they stand up like the floor folded upward. */
  var PPGLOW=["#D354A0","#7F77DD","#3DF2FF","#F5C518"];
  function ppHash(a,b){var h=Math.sin(a*12.9898+b*78.233)*43758.5453;return h-Math.floor(h);}
  PP.draw=function(g,o){
    var WP=o.wall,rows=9,yb=Math.round(o.Yd(PP.Y0-0.04)),yf=Math.round(o.Yd(PP.Y1+0.03)),W=o.W,glow=Math.pow(1-((o.beat%1)+1)%1,3),bt=Math.floor(o.beat);
    /* the curve in screen pixels, and the distance along it */
    var N=160,us=[],xs=[],hs=[],ss=[0];
    for(var i=0;i<=N;i++){var u=-1+2*i/N;us.push(u);xs.push(o.X(PP.xOf(u)));hs.push(PP.prof(Math.abs(u))*WP);if(i)ss.push(ss[i-1]+Math.hypot(xs[i]-xs[i-1],hs[i]-hs[i-1]));}
    var S=ss[N],T=Math.max(10,(yf-yb)/rows),nT=Math.max(8,Math.round(S/T)),k=0;
    function at(sv){while(k<N&&ss[k+1]<sv)k++;while(k>0&&ss[k]>sv)k--;var f=(sv-ss[k])/Math.max(0.001,ss[k+1]-ss[k]);return[xs[k]+(xs[k+1]-xs[k])*f,hs[k]+(hs[k+1]-hs[k])*f];}
    /* the front face first (under the riding surface): dark panel with pixel stripes */
    g.fillStyle="#1c1630";g.beginPath();g.moveTo(xs[0],yf);for(var q=0;q<=N;q++)g.lineTo(xs[q],yf-hs[q]);g.lineTo(xs[N],yf);g.closePath();g.fill();
    g.fillStyle="#241d3d";for(var sy2=yf-4;sy2>yf-WP;sy2-=6)for(var q2=0;q2<N;q2++)if(yf-hs[q2]<sy2)g.fillRect(Math.round(xs[q2]),sy2,Math.ceil(xs[q2+1]-xs[q2])+1,2);
    /* the tiles */
    for(var t=0;t<nT;t++){
      var A=at(S*t/nT),B=at(S*(t+1)/nT),sl=Math.min(1,Math.abs(B[1]-A[1])/Math.max(1,Math.abs(B[0]-A[0]))/3);
      for(var j=0;j<rows;j++){
        var ya=yb+(yf-yb)*j/rows,yz=yb+(yf-yb)*(j+1)/rows;
        g.beginPath();g.moveTo(Math.round(A[0]),Math.round(ya-A[1]));g.lineTo(Math.round(B[0]),Math.round(ya-B[1]));g.lineTo(Math.round(B[0]),Math.round(yz-B[1]));g.lineTo(Math.round(A[0]),Math.round(yz-A[1]));g.closePath();
        var hsh=ppHash(t,j);g.fillStyle=(t+j)%2?"#1a1430":"#120e1e";g.fill();
        if(hsh<0.24){g.globalAlpha=(0.12+0.75*glow)*(((bt+t+j)%3===0)?1:0.45);g.fillStyle=PPGLOW[Math.floor(hsh*25)%4];g.fill();g.globalAlpha=1;}
        if(sl>0.05){g.globalAlpha=0.3*sl;g.fillStyle="#000";g.fill();g.globalAlpha=1;}
        g.strokeStyle="#0a0714";g.lineWidth=1;g.stroke();
      }
    }
    /* the decks beyond the lips: flat dance floor, up at the top of the walls */
    [-1,1].forEach(function(sd){var xc=Math.round(o.X(PP.xOf(sd))),x0=sd<0?0:xc,x1=sd<0?xc:W,tw=T;
      for(var j2=0;j2<rows;j2++){var ya2=Math.round(yb+(yf-yb)*j2/rows-WP),yh=Math.round((yf-yb)/rows);
        for(var xx=x0,c2=0;xx<x1;xx+=tw,c2++){g.fillStyle=(c2+j2)%2?"#1a1430":"#120e1e";g.fillRect(Math.round(xx),ya2,Math.ceil(Math.min(tw,x1-xx)),yh);g.strokeStyle="#0a0714";g.strokeRect(Math.round(xx)+0.5,ya2+0.5,Math.ceil(Math.min(tw,x1-xx))-1,yh-1);}}
      g.fillStyle="#2a2240";g.fillRect(x0,yf-WP,x1-x0,WP);g.fillStyle="#352b52";for(var sy3=yf-WP+3;sy3<yf;sy3+=6)g.fillRect(x0,sy3,x1-x0,2);
      /* the coping: a metal rail along the lip */
      g.fillStyle="#d8d8e8";g.fillRect(xc-2,yb-WP,4,yf-yb);g.fillStyle="#8a8aa0";g.fillRect(xc+1,yb-WP,1,yf-yb);});
    g.strokeStyle="#9B7FE0";g.lineWidth=2;g.beginPath();for(var q3=0;q3<=N;q3+=2){if(q3)g.lineTo(Math.round(xs[q3]),Math.round(yf-hs[q3]));else g.moveTo(Math.round(xs[q3]),Math.round(yf-hs[q3]));}g.stroke();
  };
  /* groups of 4 or 5 share a pipe: everyone sorted the same way, dealt round the groups; your lane is your place in your group */
  /* the two boost pads on the flat in the middle of the pipe, one near the back and one near the front. They take turns:
     on even beats the back one is live, on odd beats the front one. Roll over the live one as you cross the middle for a
     burst of speed (and a bigger jump at the lip) */
  PP.PAD_Y=[0.2,0.8];PP.PAD_W=0.07;PP.PAD_H=0.13;
  PP.padY=function(k){return PP.Y0+(PP.Y1-PP.Y0)*PP.PAD_Y[k];};
  PP.livePad=function(beat){return ((Math.floor(beat)%2)+2)%2;};
  PP.pads=function(g,X,Yd,beat,P){
    var live=PP.livePad(beat),pulse=Math.pow(1-(((beat%1)+1)%1),2);P=P||4;
    [0,1].forEach(function(k){var cx=X(0.5),cy=Yd(PP.padY(k)),w=Math.round((X(0.5+PP.PAD_W)-cx)/P)*P,h=Math.round(Math.abs(Yd(PP.padY(k)+PP.PAD_H/2*(PP.Y1-PP.Y0))-cy)/P)*P,on=k===live,x0=Math.round(cx/P)*P-w,y0=Math.round(cy/P)*P-h;
      g.fillStyle=on?"#3a2a08":"#151020";g.fillRect(x0,y0,w*2,h*2);
      g.fillStyle=on?"#F5C518":"#3a3355";g.fillRect(x0,y0,w*2,P);g.fillRect(x0,y0+h*2-P,w*2,P);g.fillRect(x0,y0,P,h*2);g.fillRect(x0+w*2-P,y0,P,h*2);
      if(on){g.globalAlpha=0.25+0.6*pulse;g.fillStyle="#F5C518";g.fillRect(x0-P*2,y0-P*2,w*2+P*4,P);g.fillRect(x0-P*2,y0+h*2+P,w*2+P*4,P);g.fillRect(x0-P*2,y0-P*2,P,h*2+P*4);g.fillRect(x0+w*2+P,y0-P*2,P,h*2+P*4);g.globalAlpha=1;}
      /* chevrons pointing out both ways, toward the walls */
      g.fillStyle=on?(pulse>0.5?"#fff":"#F5C518"):"#4a4266";var ph=on?Math.floor(beat*4)%3:0;
      for(var sd=-1;sd<=1;sd+=2)for(var c=0;c<3;c++){var ax=cx+sd*(P*2+c*P*3+(c===ph?P:0));for(var q=-2;q<=2;q++)g.fillRect(Math.round((ax-sd*Math.abs(q)*P)/P)*P,Math.round((cy+q*P)/P)*P,P,P);}});
  };
  PP.group=function(ids,id){ids=ids.slice().sort();var n=ids.length,G=Math.max(1,Math.ceil(n/5)),i=Math.max(0,ids.indexOf(id)),gi=i%G,mem=ids.filter(function(x,k){return k%G===gi;}),li=mem.indexOf(id),m=Math.max(3,mem.length);
    return{g:gi,G:G,members:mem,y:PP.Y0+((li<0?0:li)+0.5)/m*(PP.Y1-PP.Y0)};};
  /* a skateboard: flips over on a kickflip or heelflip */
  PP.board=function(g,x,y,ang,sc,tk,p,col){
    g.save();g.translate(x,y);g.rotate(ang);
    var L=8.5*sc,Hh=1.6*sc,fl=tk===1||tk===2?Math.cos(p*Math.PI*2):1;
    g.scale(1,fl||0.05);
    g.fillStyle=col||"#E8505B";g.fillRect(-L,-Hh,L*2,Hh*1.6);g.fillStyle="#222";g.fillRect(-L*0.75,Hh*0.6,3*sc,2*sc);g.fillRect(L*0.75-3*sc,Hh*0.6,3*sc,2*sc);
    g.restore();
  };
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
      var sh=Math.max(0.35,1-s.z/120);g.fillStyle="rgba(0,0,0,"+(0.35*sh).toFixed(3)+")";PX.oval(g,f[0],f[1],r*1.3*sh,r*0.45*sh,0);
      g.save();g.translate(Math.round(p[0]),Math.round(p[1]));
      if(o.type==="balloon"){
        g.strokeStyle="rgba(255,255,255,.6)";g.lineWidth=Math.max(1,sc*0.4);g.beginPath();g.moveTo(0,r);g.quadraticCurveTo(r*0.6,r*2,0,r*3.2);g.stroke();
        g.fillStyle=T.col;PX.oval(g,0,0,r,r*1.2,0);g.fillStyle="#c02848";g.fillRect(-sc*0.5,r*1.1,sc,sc*0.8);
        g.fillStyle="rgba(255,255,255,.55)";PX.oval(g,-r*0.35,-r*0.45,r*0.25,r*0.35,-0.5);
      }else if(o.type==="ball"){
        g.rotate(s.x*40);g.fillStyle=T.col;PX.disc(g,0,0,r);
        g.fillStyle="#FF3DA8";g.beginPath();g.moveTo(0,0);g.arc(0,0,r,0,2.1);g.fill();g.fillStyle="#3DF2FF";g.beginPath();g.moveTo(0,0);g.arc(0,0,r,2.1,4.2);g.fill();
        g.fillStyle="#fff";PX.disc(g,0,0,r*0.25);
      }else{
        g.rotate(Math.sin(now/500+o.k)*0.6);g.strokeStyle="#cfc8e8";g.lineWidth=Math.max(1,sc*0.35);g.beginPath();g.moveTo(-r*1.4,r*0.4);g.lineTo(r*1.4,-r*0.4);g.stroke();
        g.fillStyle=T.col;g.beginPath();g.moveTo(-r*1.2,r*0.35);g.quadraticCurveTo(0,-r*1.1,r*1.3,-r*0.4);g.quadraticCurveTo(0,r*0.2,-r*1.2,r*0.35);g.fill();
      }
      g.restore();
      if(o.streak>=2){g.font="800 "+Math.round(10+Math.min(8,o.streak))+"px 'Silkscreen',ui-monospace,monospace";g.textAlign="center";g.lineWidth=3;g.strokeStyle="rgba(0,0,0,.7)";g.strokeText("×"+o.streak,p[0],p[1]-r*1.6);g.fillStyle=T.col;g.fillText("×"+o.streak,p[0],p[1]-r*1.6);}
    });
  }
  /* ---------------- walking ----------------
     A walk that stays on the ground: the stride advances with the distance actually covered (so the feet keep
     pace with the body instead of paddling in the air), one foot stays planted while the other lifts and swings
     through, the body rises a pixel as the legs pass and settles on each footfall, and when you stop the feet
     come down together instead of freezing mid-stride.
     w = a state object kept on each person; x, y = where they're drawn this frame (screen px); s = their scale. */
  /* which of 8 ways a direction faces (screen x right, y down): a little stickiness so a heading between two doesn't flicker */
  var F8=[1,4,0,7,3,6,2,5],F8A={1:0,4:1,0:2,7:3,3:4,6:5,2:6,5:7};
  function face8(dx,dy,cur){var a=Math.atan2(dy,dx)/(Math.PI/4),sec=((Math.round(a)%8)+8)%8,ca=F8A[cur];
    if(ca!==undefined){var d=((a-ca)%8+8)%8;d=Math.min(d,8-d);if(d<0.62)return cur;}return F8[sec];}
  function walkStep(w,x,y,now,s){
    if(w.t===undefined){w.t=now;w.px=x;w.py=y;w.ph=0;w.k=0;w.dx=1;w.dy=0;w.sp=0;}
    var dt=Math.max(1,Math.min(100,now-w.t)),mx=x-w.px,my=y-w.py,md=Math.hypot(mx,my);w.t=now;w.px=x;w.py=y;
    if(md>40*s){md=0;}                                   /* a jump across the room (joining, a snap): not a walk */
    var moving=md>0.25*Math.max(1,s*0.5);
    if(moving){
      /* a step every ~18 art pixels of ground, but never slower than a stroll or faster than a run */
      var stride=18*s,cad=md/stride;cad=Math.max(cad,dt/280);w.ph+=Math.min(cad,dt/115);
      var nd=Math.hypot(mx,my)||1;w.dx+=(mx/nd-w.dx)*0.35;w.dy+=(my/nd-w.dy)*0.35;
      /* which way they face (0 front, 1 right, 2 back, 3 left): the way they're walking; kept when they stop.
         A little bias toward the current way so a diagonal doesn't flicker between two. */
      if(Math.abs(w.dx)+Math.abs(w.dy)>0.3)w.face=face8(w.dx,w.dy,w.face|0);
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
    PX.oval(g,Math.round(x),Math.round(y+11*s),rw,rh,0);
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
    function label(t,cx,cy,on){if(p<3)return;g.fillStyle=on?"#fff":"rgba(255,255,255,.4)";g.font="700 "+Math.max(7,Math.round(p*2.6))+"px 'Silkscreen',ui-monospace,monospace";
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
    if(jt){   /* with the Jumbotron down: tucked in just left of it, level with its bottom edge, clear of the sign above */
      var pj=Math.min(P,Math.max(2,Math.floor(jt.h*0.55/KP_H))),xj=Math.round(jt.x-3*P-KP_W*pj),yj=Math.round(jt.y+jt.h-KP_H*pj);
      if(xj>8&&yj>=Math.max(wallTop,avoidY||0))return{x:xj,y:yj,p:pj};
    }
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
      ".ukm-pw{position:relative;flex:0 0 auto;line-height:0}.ukm-turn{position:absolute;bottom:8px;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(42,36,64,.9);color:#fff;font:700 19px 'Silkscreen',ui-monospace,monospace;cursor:pointer;line-height:1;padding:0}.ukm-turn.l{left:8px}.ukm-turn.r{right:8px}"+
      ".ukm-prev{flex:0 0 auto;width:176px;height:220px;border-radius:10px;background:linear-gradient(#2a1f42,#161128);border:1px solid rgba(255,255,255,.12);image-rendering:pixelated;cursor:pointer}"+
      ".ukm-rows{flex:1 1 200px;min-width:0;display:flex;flex-direction:column;gap:7px}"+
      ".ukm-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}"+
      ".ukm-lbl{font-size:11px;color:#a59cc4;text-transform:uppercase;letter-spacing:.5px;width:100%;margin-bottom:-2px}"+
      ".ukm-step{display:flex;align-items:center;gap:4px}"+
      ".ukm-step button{width:26px;height:26px;border-radius:6px;border:1px solid rgba(255,255,255,.15);background:#2a2440;color:#fff;cursor:pointer;font:700 13px 'Silkscreen',ui-monospace,monospace;padding:0}"+
      ".ukm-step span{min-width:84px;text-align:center;font:600 13px 'Silkscreen',ui-monospace,monospace;color:#fff}"+
      ".ukm-sw{width:20px;height:20px;border-radius:5px;border:2px solid transparent;cursor:pointer;padding:0;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35)}"+
      ".ukm-sw.sel{border-color:#fff;transform:scale(1.12)}"+
      "@media (max-width:520px){.ukm{gap:12px;flex-direction:column;align-items:center}.ukm-prev{width:min(250px,66vw);height:min(312px,82vw)}.ukm-rows{flex-basis:auto;width:100%}.ukm-step span{min-width:70px;font-size:12px}.ukm-sw{width:18px;height:18px}}"+
      ".ukm-col{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,.85);cursor:pointer;padding:0;margin-left:4px;box-shadow:0 0 0 2px rgba(0,0,0,.35),inset 0 0 0 1px rgba(0,0,0,.3)}"+
      ".ukm-pop{position:fixed;inset:0;z-index:200000;background:rgba(6,3,14,.7);display:flex;align-items:center;justify-content:center;padding:14px}"+
      ".ukm-pbox{background:#1b1630;border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:14px;width:min(360px,100%);color:#fff;font:600 13px 'Silkscreen',ui-monospace,monospace;box-shadow:0 18px 50px rgba(0,0,0,.6)}"+
      ".ukm-pbox h4{margin:0 0 10px;font:800 15px 'Silkscreen',ui-monospace,monospace}"+
      ".ukm-zoom{width:100%;height:170px;border-radius:10px;background:linear-gradient(#2a1f42,#161128);image-rendering:pixelated;display:block;margin-bottom:10px}"+
      ".ukm-grid{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.ukm-grid .ukm-sw{width:30px;height:30px;border-radius:7px}"+
      ".ukm-any{display:flex;align-items:center;gap:8px;margin-bottom:12px}.ukm-any input[type=color]{width:46px;height:34px;border:0;padding:0;background:none;cursor:pointer}"+
      ".ukm-any input[type=text]{flex:1;min-width:0;background:#120e22;border:1px solid rgba(255,255,255,.15);border-radius:7px;color:#fff;font:600 13px ui-monospace,monospace;padding:7px 9px}"+
      ".ukm-hue{width:100%;height:120px;border-radius:9px;cursor:crosshair;display:block;margin-bottom:8px;touch-action:none}"+
      ".ukm-done{width:100%;padding:9px;border-radius:9px;border:0;background:linear-gradient(135deg,#D354A0,#7F77DD);color:#fff;font:800 14px 'Silkscreen',ui-monospace,monospace;cursor:pointer}"+
      ".ukm-gender{display:flex;gap:4px}.ukm-gender button{padding:6px 10px;border:1px solid rgba(255,255,255,.18);background:#2a2440;color:#fff;font:700 12px 'Silkscreen',ui-monospace,monospace;cursor:pointer}.ukm-gender button.on{background:#c8407e;border-color:#ff8ac8}"+
      ".ukm-rand{align-self:flex-start;margin-top:2px;padding:6px 12px;border-radius:7px;border:1px solid rgba(255,255,255,.18);background:#2a2440;color:#fff;font:600 12px 'Silkscreen',ui-monospace,monospace;cursor:pointer}";
      document.head.appendChild(st);}
    var L=look?JSON.parse(JSON.stringify(look)):random(),O=OPTS;
    el.innerHTML="";var box=document.createElement("div");box.className="ukm";el.appendChild(box);
    var pw=document.createElement("div");pw.className="ukm-pw";box.appendChild(pw);
    var cv=document.createElement("canvas");cv.className="ukm-prev";cv.width=120;cv.height=150;cv.title="Tap to see a dance move, drag sideways to turn round";pw.appendChild(cv);
    /* turn the character round: front, side, back, other side */
    var DIRV=0,tl=document.createElement("button"),tr2=document.createElement("button");tl.type=tr2.type="button";tl.className="ukm-turn l";tr2.className="ukm-turn r";tl.textContent="\u27F2";tr2.textContent="\u27F3";tl.title="Turn left";tr2.title="Turn right";tl.setAttribute("aria-label","Turn left");tr2.setAttribute("aria-label","Turn right");
    tl.onclick=function(e){e.stopPropagation();DIRV=(DIRV+7)%8;};tr2.onclick=function(e){e.stopPropagation();DIRV=(DIRV+1)%8;};pw.appendChild(tl);pw.appendChild(tr2);
    var rows=document.createElement("div");rows.className="ukm-rows";box.appendChild(rows);
    var ctl={};
    /* Male / Female / Both: narrows the hair, face and bottoms to match (remembered on this device) */
    var GD="b";try{GD=localStorage.getItem("uk_gender")||"b";}catch(e){}
    function nextOk(key,from,dir){var n=count(key),i=from;for(var k=0;k<n;k++){i=(i+dir+n)%n;if(gOk(key,i,GD))return i;}return from;}
    function fitGender(){["hair","face","bottom"].forEach(function(k){if(!gOk(k,L[k],GD))L[k]=nextOk(k,L[k],1);});}
    var grow=document.createElement("div");grow.className="ukm-row";var glb=document.createElement("div");glb.className="ukm-lbl";glb.textContent="Style";grow.appendChild(glb);
    var gsw=document.createElement("div");gsw.className="ukm-gender";grow.appendChild(gsw);
    var gbs=[["m","\u2642 Male"],["f","\u2640 Female"],["b","Both"]].map(function(o){var b=document.createElement("button");b.type="button";b.textContent=o[1];b.setAttribute("aria-pressed",String(GD===o[0]));
      b.onclick=function(){GD=o[0];try{localStorage.setItem("uk_gender",GD);}catch(e){}gbs.forEach(function(x,j){x.classList.toggle("on",gbs[j]===b);x.setAttribute("aria-pressed",String(gbs[j]===b));});fitGender();changed();};
      b.classList.toggle("on",GD===o[0]);gsw.appendChild(b);return b;});
    rows.appendChild(grow);
    function changed(){paint();if(onChange)onChange(JSON.parse(JSON.stringify(L)));}
    function stepper(key,label,colKey){
      var row=document.createElement("div");row.className="ukm-row";
      var lb=document.createElement("div");lb.className="ukm-lbl";lb.textContent=label;row.appendChild(lb);
      if(O[key].names){
        var sp=document.createElement("div");sp.className="ukm-step";
        var b1=document.createElement("button");b1.type="button";b1.textContent="\u25C0";b1.setAttribute("aria-label","Previous "+label);
        var nm=document.createElement("span");
        var b2=document.createElement("button");b2.type="button";b2.textContent="\u25B6";b2.setAttribute("aria-label","Next "+label);
        b1.onclick=function(){L[key]=nextOk(key,L[key],-1);changed();};
        b2.onclick=function(){L[key]=nextOk(key,L[key],1);changed();};
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
    var skr=stepper("skin","Skin");stepper("hair","Hair","hairCol");stepper("top","Top","topCol");stepper("bottom","Bottoms","botCol");stepper("shoes","Shoes");stepper("hat","Hat");stepper("face","Face");stepper("extra","Extra");stepper("held","Holding");
    var rb=document.createElement("button");rb.type="button";rb.className="ukm-rand";rb.textContent="\uD83C\uDFB2 Surprise me";rb.onclick=function(){L=random();fitGender();changed();};rows.appendChild(rb);
    function paint(){
      KEYS.forEach(function(k){if(ctl[k])ctl[k].textContent=O[k].names[L[k]];if(ctl[k+"_btn"])ctl[k+"_btn"].style.background=colOf(L,PART[k][0]);});
    }
    /* the preview idles, waves now and then, and shows a dance move when tapped */
    var g=cv.getContext("2d"),moveT=-1e9,raf=0;
    var dragX=null,dragged=false;
    cv.onpointerdown=function(e){dragX=e.clientX;dragged=false;try{cv.setPointerCapture(e.pointerId);}catch(x){}};
    cv.onpointermove=function(e){if(dragX===null)return;var d=e.clientX-dragX;if(Math.abs(d)>34){DIRV=(DIRV+(d>0?1:7))%8;dragX=e.clientX;dragged=true;}};
    cv.onpointerup=cv.onpointercancel=function(){dragX=null;};
    cv.style.touchAction="pan-y";
    cv.onclick=function(){if(dragged){dragged=false;return;}moveT=performance.now();};
    function frame(){
      if(!cv.isConnected){raf=0;return;}
      var t=performance.now(),k=(t-moveT)/900,st;
      g.clearRect(0,0,120,150);
      g.fillStyle="rgba(0,0,0,.35)";g.fillRect(36,128,48,6);
      if(k>=0&&k<1){var up=Math.sin(k*Math.PI);st={armL:0.15+up*2.6,armR:-0.15-up*2.6,legL:up*0.5,legR:-up*0.5,bob:-up*12,mouth:true};}
      else{var w=Math.sin(t*0.003);st={armL:0.15,armR:-0.15+(Math.floor(t/4000)%2?Math.max(0,w)*2.2:0),bob:-Math.abs(Math.sin(t*0.004))*3};}
      st.dir=[0,4,1,5,2,6,3,7][DIRV];drawChar(g,60,92,3,L,st);   /* 8 turns: front, front-right, right, back-right, back, back-left, left, front-left */
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
    {name:"Two-step",icon:"\uD83D\uDC63",subs:["Basic","Clap","Point","Shimmy"],help:"Left stick: walk around, wider steps the further you push. Right stick: up raises your arms, left and right swing them."},
    {name:"Hands on knees",icon:"\uD83E\uDDB5",subs:["Knock knees","Bounce","Low","Lean back"],help:"Left stick: shuffle around in the squat, down sinks lower. Right stick: left and right lean."},
    {name:"Shake it",icon:"\uD83C\uDF51",subs:["Wiggle","Drop it","Hands up","Fast"],help:"Left stick: sway your way around the floor. Right stick: lean and throw your arms."},
    {name:"Running man",icon:"\uD83C\uDFC3",subs:["Classic","Fast","Moonwalk","Arms pump"],help:"Left stick: run around the floor. Right stick: up lifts the knees higher, left and right pump the arms."},
    {name:"Skank",icon:"\uD83C\uDFBA",subs:["Classic","Windmill","Pogo","Elbows","Kicks"],help:"Left stick: skank around the floor, up kicks the knees higher. Right stick: up throws bigger punches."},
    {name:"Robot",icon:"\uD83E\uDD16",subs:["Arms","Wave","Pop","Freeze"],help:"Left stick: walk like a robot, and your left arm points the way you go. Right stick: point your right arm."},
    {name:"The worm",icon:"\uD83D\uDC1B",subs:["Forward","Back","Flop","Dive in"],help:"Left stick: wriggle across the floor, up lifts your chest. Right stick: up kicks your hips up."},
    {name:"Silly",icon:"\uD83E\uDD2A",subs:["Chicken","Sprinkler","YMCA","Floss","Macarena"],help:"Left stick: wander around doing it. Right stick: up and down for the bounce."},
    {name:"Shuffle",icon:"\uD83D\uDC5F",subs:["Running man","T-step","Spin","Mix it up"],help:"Left stick: slide around as you step (flip it to slide back). Right stick: UP = step up on your toes, DOWN = low stomp, sideways = arms."},
    {name:"Thriller",icon:"\uD83E\uDDDF",subs:["Zombie arms","Claw walk","Shoulder pop","Mix it up"],help:"Left stick: lurch around the floor. Right stick: lean and reach your arms."},
    {name:"Street jam",icon:"\uD83D\uDCA5",subs:["High knees","Strike a pose","Hop step","Floor spin","Mix it up"],help:"Left stick: travel around the floor. Right stick: up for higher knees, sideways for the arms."},
    {name:"Cyber goth",icon:"\uD83E\uDD16",subs:["Stomp & punch","Arm sweep","Hands up","Windmill","Arm roll","Chop","Mix it up"],help:"Left stick: stomp around the floor. Right stick: arm size and speed."},
    {name:"Headbang",icon:"\uD83E\uDD18",subs:["Headbang","Hair windmill","Air guitar","Rock on","Mix it up"],help:"Left stick: move around while you bang. Right stick: how hard and how fast."},
    {name:"Lighters up",icon:"\uD83D\uDD25",subs:["Lighter sway","Phone light","Wave it","Both hands","Glow sticks"],help:"Left stick: sway your way around the floor. Right stick: how high you hold it."},
    {name:"Techno march",icon:"\uD83E\uDD7E",subs:["March","Point","Arm swing","Flex","Mix it up"],help:"Left stick: march around the floor. Right stick: arm power."},
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
      var trav=(0.6+Math.abs(ax)*0.9)*(ax<-0.25?-1:1),low=Math.max(0,ay)*2+Math.max(0,by)*4,kl=0.55+Math.max(0,-by)*0.8,arm=0.25+(bx+1)*0.25,mv=sub,toe=Math.max(0,-by)*2.5;   /* left stick: slide direction and speed; right stick up/down: step up on the toes / step down low */
      if(sub===3){var bar=Math.floor(bp/4)%4;mv=bar===0?0:bar===1?1:bar===2?1:(((bp%4)+4)%4>=2?2:0);if(bar===2)trav=-trav;}   /* running man, T-step right, T-step left, running man into a spin */
      var e=bp*2,ep=((e%1)+1)%1,side=Math.floor(e)%2?1:-1;
      if(mv===0){   /* running man: knee up on the "and", stomp down on the beat while the other foot slides back */
        var up=Math.sin(ep*Math.PI);
        if(side>0){o.legL=up*kl*0.6;o.lgL=7-up*3.5;o.legR=-0.18-(1-up)*0.25;}else{o.legR=-up*kl*0.6;o.lgR=7-up*3.5;o.legL=0.18+(1-up)*0.25;}   /* the knee comes up: a shorter leg */
        o.bob=low-toe-up*2.5+(1-up)*1;o.dx=Math.sin(bp*Math.PI*0.5)*2*trav;
        o.armL=0.3+Math.max(0,side)*arm*0.8;o.armR=-0.3-Math.max(0,-side)*arm*0.8;
      }else if(mv===1){   /* T-step: one foot taps, the other swivels heel-out then toe-out, gliding you sideways */
        var sw=Math.sin(e*Math.PI);o.legL=0.15+Math.abs(sw)*0.45;o.legR=-0.15-Math.max(0,-sw)*0.2;
        if(trav<0){var t3=o.legL;o.legL=-o.legR;o.legR=-t3;}
        o.dx=((bp%4+4)%4/4-0.5)*14*trav;o.bob=low-toe-Math.abs(sw)*1.5;o.rot=-0.06*Math.sign(trav);
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
  var PT={},PC={},POFF=false;/* shipped pixel edits: what this device has saved on top wins */
  PT=JSON.parse("{\"hair:12\":{\"-2,-15\":\"#7f77dd\",\"-1,-15\":\"#7f77dd\",\"0,-15\":\"#7f77dd\",\"1,-15\":\"#7f77dd\",\"2,-15\":\"#7f77dd\",\"-3,-11\":\"#7f77dd\",\"-3,-10\":\"#7f77dd\",\"-3,-9\":\"#7f77dd\",\"-3,-12\":\"#7f77dd\",\"-2,-12\":\"#7f77dd\",\"-1,-12\":\"#7f77dd\",\"0,-12\":\"#7f77dd\",\"-2,-11\":\"#7f77dd\",\"-1,-11\":\"#7f77dd\",\"0,-11\":\"#7f77dd\",\"1,-11\":\"#7f77dd\",\"2,-11\":\"#7f77dd\",\"-7,-14\":\"#7f77dd\",\"-7,-13\":\"#7f77dd\",\"-7,-12\":\"#7f77dd\",\"-7,-11\":\"#7f77dd\",\"-7,-10\":\"#7f77dd\",\"-7,-9\":\"#7f77dd\",\"-7,-8\":\"#7f77dd\",\"-7,-7\":\"#7f77dd\",\"-7,-6\":\"#7f77dd\",\"-6,-6\":\"#7f77dd\",\"-6,-7\":\"#7f77dd\",\"-6,-8\":\"#7f77dd\",\"-6,-9\":\"#7f77dd\",\"-6,-10\":\"#7f77dd\",\"-6,-11\":\"#7f77dd\",\"-6,-12\":\"#7f77dd\",\"-6,-13\":\"#7f77dd\",\"-6,-14\":\"#7f77dd\",\"-5,-13\":\"#7f77dd\",\"-5,-14\":\"#7f77dd\",\"-5,-12\":\"#7f77dd\",\"-5,-11\":\"#7f77dd\",\"-5,-10\":\"#7f77dd\",\"-5,-9\":\"#7f77dd\",\"-5,-8\":\"#7f77dd\",\"-5,-7\":\"#7f77dd\",\"-5,-6\":\"#7f77dd\",\"-4,-6\":\"#7f77dd\",\"-3,-5\":\"#7f77dd\",\"-3,-6\":\"#7f77dd\",\"-4,-7\":\"#7f77dd\",\"-4,-8\":\"#7f77dd\",\"-4,-9\":\"#7f77dd\",\"-4,-10\":\"#7f77dd\",\"-4,-11\":\"#7f77dd\",\"-4,-12\":\"#7f77dd\",\"-4,-13\":\"#7f77dd\",\"-3,-13\":\"#7f77dd\",\"-2,-10\":\"#7f77dd\",\"-2,-9\":\"#7f77dd\",\"-3,-8\":\"#7f77dd\",\"-3,-7\":\"#7f77dd\",\"-2,-8\":\"#7f77dd\",\"-2,-7\":\"#7f77dd\",\"-2,-6\":\"#7f77dd\",\"-1,-10\":\"#7f77dd\",\"-1,-9\":\"#7f77dd\",\"-1,-8\":\"#7f77dd\",\"-1,-7\":\"#7f77dd\",\"-1,-6\":\"#7f77dd\",\"0,-10\":\"#7f77dd\",\"0,-9\":\"#7f77dd\",\"0,-8\":\"#7f77dd\"},\"hair:3\":{\"4,-7\":\"#1f8fbf\"},\"hair:5\":{\"-8,-12\":\"0\",\"-7,-11\":\"0\",\"-6,-11\":\"0\",\"-5,-11\":\"0\",\"-4,-11\":\"0\",\"-3,-11\":\"0\",\"-2,-11\":\"0\",\"-1,-11\":\"0\",\"0,-11\":\"0\",\"1,-11\":\"0\",\"2,-11\":\"0\",\"3,-11\":\"0\",\"4,-11\":\"0\",\"5,-11\":\"0\",\"6,-11\":\"0\",\"6,-12\":\"#120d1e\",\"7,-12\":\"0\",\"-8,-13\":\"#120d1e\",\"-7,-12\":\"#120d1e\",\"7,-13\":\"#120d1e\",\"5,-12\":\"#120d1e\",\"-6,-12\":\"#120d1e\",\"-5,-12\":\"#120d1e\",\"-4,-12\":\"#120d1e\",\"-3,-12\":\"#120d1e\",\"-2,-12\":\"#120d1e\",\"-1,-12\":\"#120d1e\",\"0,-12\":\"#120d1e\",\"1,-12\":\"#120d1e\",\"2,-12\":\"#120d1e\",\"3,-12\":\"#120d1e\",\"4,-12\":\"#120d1e\",\"-8,-11\":\"0\",\"-6,-22\":\"#120d1e\",\"-5,-22\":\"#120d1e\",\"-4,-22\":\"#120d1e\",\"-3,-22\":\"#120d1e\",\"-2,-22\":\"#120d1e\",\"-1,-22\":\"#120d1e\",\"0,-22\":\"#120d1e\",\"1,-22\":\"#120d1e\",\"2,-22\":\"#120d1e\",\"3,-22\":\"#120d1e\",\"4,-22\":\"#120d1e\",\"5,-22\":\"#120d1e\",\"-7,-21\":\"#120d1e\",\"-8,-20\":\"#120d1e\",\"6,-21\":\"#120d1e\",\"7,-20\":\"#120d1e\",\"-5,-21\":\"#4a9be8\",\"-4,-21\":\"#4a9be8\",\"-3,-21\":\"#4a9be8\",\"-2,-21\":\"#4a9be8\",\"-1,-21\":\"#4a9be8\",\"0,-21\":\"#4a9be8\",\"1,-21\":\"#4a9be8\",\"2,-21\":\"#4a9be8\",\"3,-21\":\"#4a9be8\",\"4,-21\":\"#4a9be8\",\"5,-21\":\"#4a9be8\",\"-6,-21\":\"#4a9be8\"},\"hair:6\":{\"-4,-11\":\"0\",\"-5,-11\":\"0\",\"-6,-11\":\"0\",\"-5,-10\":\"0\",\"-6,-12\":\"0\",\"6,-14\":\"0\",\"6,-13\":\"#120d1e\",\"6,-12\":\"#120d1e\",\"6,-11\":\"#120d1e\",\"7,-11\":\"0\",\"7,-12\":\"0\",\"7,-13\":\"0\",\"7,-10\":\"0\",\"7,-9\":\"0\",\"7,-8\":\"0\",\"7,-7\":\"0\",\"6,-7\":\"0\",\"6,-8\":\"0\",\"6,-9\":\"#120d1e\",\"6,-10\":\"#120d1e\",\"-5,-12\":\"0\",\"-2,-13\":\"#120d1e\",\"1,-13\":\"#120d1e\",\"-1,-13\":\"#120d1e\",\"0,-13\":\"#120d1e\",\"2,-12\":\"0\",\"3,-11\":\"0\",\"2,-13\":\"#120d1e\",\"4,-11\":\"#120d1e\",\"5,-7\":\"0\",\"-3,-13\":\"#120d1e\",\"-4,-13\":\"#120d1e\",\"-5,-13\":\"#120d1e\",\"1,-15\":\"#4a9be8\",\"2,-15\":\"#4a9be8\",\"4,-15\":\"#120d1e\",\"3,-15\":\"#4a9be8\",\"5,-9\":\"#120d1e\",\"5,-8\":\"0\",\"1,-16\":\"#120d1e\",\"2,-16\":\"#120d1e\",\"3,-16\":\"#120d1e\",\"4,-16\":\"0\"}}");
  try{var pts=JSON.parse(localStorage.getItem("uk_paint")||"{}");if(pts&&typeof pts==="object")for(var pk in pts)PT[pk]=pts[pk];}catch(e){}
  function ptSave(){try{localStorage.setItem("uk_paint",JSON.stringify(PT));}catch(e){}}
  function ptBuild(key){return ptBuildM(PT[key]);}
  function ptBuildM(m){if(!m)return null;var P=[],x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,k;
    for(k in m){if(!/^-?\d+,-?\d+$/.test(k))continue;var v=m[k];if(v!=="0"&&!/^#[0-9a-fA-F]{6}$/.test(v))continue;var q=k.split(","),x=+q[0],y=+q[1];if(Math.abs(x)>400||Math.abs(y)>400)continue;P.push([x,y,v]);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    if(!P.length)return null;var w=x1-x0+1,h=y1-y0+1,c=document.createElement("canvas"),hc=null,cg,hg,any=false;c.width=w;c.height=h;cg=c.getContext("2d");
    P.forEach(function(e){if(e[2]==="0"){if(!hc){hc=document.createElement("canvas");hc.width=w;hc.height=h;hg=hc.getContext("2d");hg.fillStyle="#000";}hg.fillRect(e[0]-x0,e[1]-y0,1,1);}else{cg.fillStyle=e[2];cg.fillRect(e[0]-x0,e[1]-y0,1,1);any=true;}});
    return{c:any?c:null,h:hc,x0:x0,y0:y0};}
  var DUMMYG=null,HOLEC=null;
  function ptGet(key){if(POFF)return null;if(!(key in PC))PC[key]=ptBuild(key);return PC[key];}
  var PAINT={view:paintView,get:function(k){return PT[k];},set:function(k,m,nosave){if(m&&Object.keys(m).length)PT[k]=m;else delete PT[k];delete PC[k];if(!nosave)ptSave();},save:ptSave,all:function(){return PT;},
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
  /* Pixel paint is drawn on the front view. The side and back views are drawn separately, so the same paint is carried across to them here:
     hair and hat paint (the crown, from the forehead up) goes onto the back as it is and onto the side squeezed to the side head's width;
     glasses/extras go on the side view's front half. Faces, clothes and limbs are front-only. The result is cached per part and view. */
  var TAILS={"hair:6":[5,1],"hair:3":[4,0]};   /* [first x of the hanging part on the front view, 1 = it swaps sides seen from behind] */
  function paintView(key,D,tx,ty){if(POFF||(ISO&&ISO!==key.split(":")[0]))return;var m=PT[key];if(!m)return;var part=key.split(":")[0];
    if(part!=="hair"&&part!=="hat"&&part!=="extra")return;
    var ck="v"+D+"|"+key;if(!(ck in PC)){var o={},k,q,x,y,nx;
      for(k in m){if(!/^-?\d+,-?\d+$/.test(k))continue;q=k.split(",");x=+q[0];y=+q[1];
        if(part==="extra"){if(D===2)continue;if(x<0)continue;nx=Math.round(x*0.5);}
        else if(y>-14){var tl=TAILS[key];if(!tl||x<tl[0])continue;nx=D===2?(tl[1]?-x-1:x):-x;}   /* the hanging part (a ponytail, long locks): it hangs behind the head */
        else nx=D===2?x:Math.round(-8+(x+8)*11/15);
        var nk=nx+","+y;if(m[k]==="0"){if(o[nk]===undefined)o[nk]="0";}else o[nk]=m[k];}
      PC[ck]=ptBuildM(o);}
    var e=PC[ck];if(!e)return;sg.save();sg.imageSmoothingEnabled=false;sg.translate(tx,ty);
    if(e.h){sg.globalCompositeOperation="destination-out";sg.drawImage(e.h,e.x0,e.y0);sg.globalCompositeOperation="source-over";}
    if(e.c)sg.drawImage(e.c,e.x0,e.y0);sg.restore();}
  var DT={},DT_F=["armL","armR","legL","legR","bob","dx","rot"];
  DT=JSON.parse("{\"1.0\":[{\"q\":0,\"bob\":0.69,\"dx\":-0.28},{\"q\":0.25,\"armR\":-0.1,\"bob\":-0.86,\"dx\":0.4}]}");   /* shipped dance tweaks; this device's own win */
  try{var dts=JSON.parse(localStorage.getItem("uk_dtweak")||"{}");if(dts&&typeof dts==="object")for(var dk in dts)DT[dk]=dts[dk];}catch(e){}
  function dtSave(){try{localStorage.setItem("uk_dtweak",JSON.stringify(DT));}catch(e){}}
  /* ---- the right stick, eight ways: once it's pushed out, its direction picks one of eight moves that are part of the dance
     (up, up-right, right, down-right, down, down-left, left, up-left), laid over the dance loop. A light push still works
     as the dance's own sliding control. Robot, worm and puppet already read the stick directly. ---- */
  var DIRNAMES={
    1:["Hands up","Point right","Slide right","Dip right","Squat bounce","Dip left","Slide left","Point left"],
    2:["Stand tall","Right knee knock","Lean right","Right low","Deep squat","Left low","Lean left","Left knee knock"],
    3:["Hands up shake","Right hip pop","Sway right","Drop right","Drop it","Drop left","Sway left","Left hip pop"],
    4:["High knees","Right punch run","Run right","Right dip run","Low run","Left dip run","Run left","Left punch run"],
    5:["Big knees","Right punch","Skank right","Right elbow","Crouch skank","Left elbow","Skank left","Left punch"],
    8:["Chicken wings","Right sprinkler","Floss right","Right wave","Waddle low","Left wave","Floss left","Left sprinkler"],
    9:["Toe steps","Right cut","T-step right","Right low glide","Low stomp","Left low glide","T-step left","Left cut"],
    10:["Claw up","Right claw","Lurch right","Right shoulder pop","Hunch","Left shoulder pop","Lurch left","Left claw"],
    11:["Knees high","Right pose","Hop right","Sweep right","Drop pose","Sweep left","Hop left","Left pose"],
    12:["Hands up","Right chop","Stomp right","Right sweep","Low stomp","Left sweep","Stomp left","Left chop"],
    13:["Head up","Right air guitar","Bang right","Right windmill","Full bang","Left windmill","Bang left","Left air guitar"],
    14:["Both high","Right high","Sway right","Right low","Lower both","Left low","Sway left","Left high"],
    15:["High march","Right point","March right","Right flex","Low march","Left flex","March left","Left point"]
  };
  function octant(c){
    if(!c)return null;var bx=c[2]||0,by=c[3]||0,mg=Math.hypot(bx,by);if(mg<0.55)return null;
    var a=Math.atan2(bx,-by),i=((Math.round(a/(Math.PI/4))%8)+8)%8;return{i:i,m:clamp((mg-0.45)/0.4,0,1)};
  }
  function danceMove(style,c){var oc=DIRNAMES[style]?octant(c):null;return oc?DIRNAMES[style][oc.i]:"";}
  /* the shape of each of the eight, from the dancer's point of view on screen (right = the screen's right) */
  function dirApply(o,style,oc,bp){
    var i=oc.i,m=oc.m,mir=i>4?-1:1,k=i>4?8-i:i,ph=((bp%1)+1)%1,pulse=Math.pow(1-ph,2),sw=Math.sin(bp*Math.PI),
      aR=0.3,aL=0.3,lR=0,lL=0,bob=0,dx=0,rot=0;   /* aR/aL: the arm on the screen's right / left; lR/lL the legs; mirrored for the left half */
    if(k===0){aR=aL=2.5-pulse*0.4;lR=0.22*Math.max(0,sw);lL=0.22*Math.max(0,-sw);bob=-1-pulse*2.5;}
    else if(k===1){aR=2.5-pulse*0.5;aL=0.35;rot=0.12;dx=2;lR=0.3;bob=-pulse*2;}
    else if(k===2){aR=aL=1.25+sw*0.25;dx=7+sw*2;rot=0.14;lR=0.38;lL=-0.1;bob=-pulse*1.5;}
    else if(k===3){aR=1.0;aL=0.15;rot=0.2;dx=4;bob=3-pulse*1.5;lR=0.45;lL=-0.2;}
    else if(k===4){aR=aL=0.5+pulse*0.5;bob=5.5-pulse*2.5;lR=0.5;lL=-0.5;}
    /* (armL is the arm on the screen's left) */
    var tgt={armL:mir>0?aL:aR,armR:-(mir>0?aR:aL),legL:mir>0?lL:-lR,legR:mir>0?lR:-lL};
    if(k===4){tgt.armL=aL;tgt.armR=-aR;tgt.legL=lR;tgt.legR=lL;}
    if(k>=3){   /* bending down: keep doing your dance (arms and feet as the style has them), just lower, knees bent and a little wider */
      o.lgL=(o.lgL===undefined?7:o.lgL)-(k===4?2.6:1.4)*m;o.lgR=(o.lgR===undefined?7:o.lgR)-(k===4?2.6:1.4)*m;
      o.legL+=(k===4?0.18:0.08)*m;o.legR-=(k===4?0.18:0.08)*m;
    }else["armL","armR","legL","legR"].forEach(function(f){o[f]+=(tgt[f]-o[f])*m;});
    o.bob+=bob*m;o.dx+=dx*mir*m;o.rot+=rot*mir*m;
  }
  function dance(style,sub,c,bp){
    var oc=DIRNAMES[style]?octant(c):null,o=danceBase(style,sub,oc?[c[0],c[1],0,0]:c,bp),kf=DT[style+"."+(sub|0)];
    if(oc)dirApply(o,style,oc,bp);
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
    g.save();g.globalCompositeOperation="lighter";var hal=PX.rg(g,cx,cy,R*0.6,cx,cy,R*3.2);hal.addColorStop(0,"rgba(255,240,255,"+(G("f.discoGlow",0.45)*k)+")");hal.addColorStop(1,"rgba(255,240,255,0)");
    g.fillStyle=hal;g.fillRect(cx-R*3.2,cy-R*3.2,R*6.4,R*6.4);g.restore();
    var was=g.imageSmoothingEnabled;g.save();g.beginPath();g.arc(cx,cy,R,0,6.3);g.clip();
    g.fillStyle="#5d5670";g.fillRect(cx-R,cy-R,R*2,R*2);
    var cell=Math.max(P,Math.round(R/4));
    for(var yy=cy-R;yy<cy+R;yy+=cell)for(var xx=cx-R-cell;xx<cx+R+cell;xx+=cell){
      var row=Math.round((yy-cy)/cell),col=Math.round((xx-cx)/cell+t*3),lit=(row*7+col*13)%9;
      var shade2=1-Math.hypot((xx+cell/2-cx)/R,(yy+cell/2-cy)/R)*0.6;
      g.fillStyle=lit===0?"#FFFFFF":lit<3?"rgba(220,225,255,"+(0.55*shade2+0.3)+")":"rgba(150,150,190,"+(0.5*shade2+0.25)+")";
      g.fillRect(Math.round(xx+((t*3*cell)%cell)),Math.round(yy),cell-1,cell-1);}
    g.restore();g.strokeStyle="#2a2440";g.lineWidth=Math.max(1,P/2);PX.ring(g,cx,cy,R);
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
      g.fillStyle=b.c;PX.oval(g,x,y,bs*0.8,bs,0);g.fillStyle="rgba(255,255,255,.55)";g.fillRect(Math.round(x-bs*0.4),Math.round(y-bs*0.55),Math.max(1,P),Math.max(1,P));
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
      g.globalAlpha=k*0.35;g.fillStyle="#000";var lift=-crowdLift(kind,age,p);PX.oval(g,x,y+p*12+lift,p*6*(1-Math.min(0.6,lift/(p*40))),p*1.6,0);
    }
    g.restore();
  }


  /* ---------------- reactions ----------------
     Quick reactions anyone can send: "jump", "hearts", "bigheart", "clap" (applause), "whistle".
     A dancer keeps a short list [{k, t}] (t = when, ms); reactPose changes the pose for the latest one,
     reactFx draws them all over the dancer at feet (x, y), art pixel p. */
  var REACTS=["jump","hearts","bigheart","clap","whistle","spin","twirl","turn180","turn90","spinmove"],REACT_MS={jump:1000,hearts:2400,bigheart:2600,clap:1900,whistle:1700,spin:800,twirl:1500,turn180:700,turn90:600,spinmove:900};
  var HEART=[".XX.XX.","XXXXXXX","XXXXXXX",".XXXXX.","..XXX..","...X..."],NOTE=["..XX","..XX","..X.","..X.","XXX.","XXX."];
  function pixArt(g,rows,x,y,q,col,hi){for(var r=0;r<rows.length;r++)for(var c=0;c<rows[r].length;c++)if(rows[r][c]==="X"){g.fillStyle=hi&&r===1&&c===1?hi:col;g.fillRect(Math.round(x+c*q),Math.round(y+r*q),q,q);}}
  function reactLive(list,now){var out=[];if(!list)return out;for(var i=0;i<list.length;i++){var a=now-list[i].t;if(a>=0&&a<REACT_MS[list[i].k])out.push({k:list[i].k,a:a});}return out;}
  function reactPose(list,now,p){
    var L=reactLive(list,now);if(!L.length)return null;var r=L[L.length-1],a=r.a,o={lift:0};
    if(r.k==="jump"){var hop=(a%500)/500;o.lift=-Math.sin(hop*Math.PI)*p*11;o.armL=2.6;o.armR=-2.6;o.legL=-0.35*Math.sin(hop*Math.PI);o.legR=-o.legL;o.mouth=true;}
    else if(r.k==="spin"||r.k==="twirl"){   /* turn right round on the spot: the body squeezes thin as it turns side-on */
      var tw=r.k==="twirl",u=Math.min(1,a/(tw?1500:800)),ang=u*Math.PI*2*(tw?2:1);
      o.dir=face8(Math.sin(ang),Math.cos(ang),-1);o.lift=-Math.sin(Math.min(1,u*(tw?1.4:1.2))*Math.PI)*p*(tw?7:3);
      o.armL=tw?2.5:1.7;o.armR=tw?-2.5:-1.7;o.legL=0.25*Math.sin(ang*2);o.legR=-o.legL;o.mouth=tw;}
    else if(r.k==="turn180"){   /* a quick half turn, and you stay facing that way (the page flips your facing when it ends) */
      var u1=Math.min(1,a/650),an=u1*u1*(3-2*u1)*Math.PI;o.dir=face8(Math.sin(an),Math.cos(an),-1);o.armL=0.9;o.armR=-0.9;o.legL=0.2*Math.sin(an);o.legR=-o.legL;}
    else if(r.k==="turn90"){   /* a quick quarter turn, and you stay facing that way (the page turns your facing when it ends) */
      var u2=Math.min(1,a/600),an2=u2*u2*(3-2*u2)*Math.PI/2;o.dir=face8(Math.sin(an2),Math.cos(an2),-1);o.armL=0.9;o.armR=-0.9;o.legL=0.2*Math.sin(an2);o.legR=-o.legL;}
    else if(r.k==="spinmove"){   /* a low spin on the spot, arms out, feet kicking round */
      var u3=Math.min(1,a/900),an3=u3*Math.PI*3;o.dir=face8(Math.sin(an3),Math.cos(an3),-1);o.armL=1.57;o.armR=-1.57;o.legL=0.55;o.legR=-0.55;o.mouth=true;}
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
    for(var i=0;i<3;i++){var ph=((t*0.6+i/3+(seed||0)*0.13)%1),by=y-p*18-ph*p*30;if(by<wy)continue;g.globalAlpha=1-ph;var r=Math.max(1,p*(0.6+ph*0.7));PX.ring(g,x+Math.sin(ph*8+i)*p*2,by,r);}
    g.restore();
  }
  function drawSpace(g,W,H,sb,fb,P,now){
    var k=smooth(env.space);if(k<=0.002)return;var t=now/1000,i;g.save();
    var gr=PX.lg(g,0,0,0,sb);gr.addColorStop(0,"#05030f");gr.addColorStop(1,"#120a2a");g.globalAlpha=k*0.96;g.fillStyle=gr;g.fillRect(0,0,W,sb);
    /* nebula clouds */
    [[0.22,0.35,"rgba(150,60,200,.35)"],[0.7,0.25,"rgba(40,120,220,.3)"],[0.5,0.6,"rgba(211,84,160,.22)"]].forEach(function(n){var cx=W*n[0],cy=sb*n[1],rr=Math.max(W,sb)*0.28;var rg=PX.rg(g,cx,cy,0,cx,cy,rr);rg.addColorStop(0,n[2]);rg.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=rg;g.fillRect(cx-rr,cy-rr,rr*2,rr*2);});
    for(i=0;i<160;i++){var sx=((i*397.13)%1)*W,sy=((i*0.6180339*7.1)%1)*sb,tw=0.4+0.6*Math.abs(Math.sin(t*(0.8+(i%5)*0.3)+i));g.globalAlpha=k*tw;g.fillStyle=i%9===0?"#FFE9A0":i%7===0?"#A0D0FF":"#fff";var sz=i%11===0?P:Math.max(1,Math.round(P/2));g.fillRect(Math.round(sx),Math.round(sy),sz,sz);}
    /* a ringed planet and a small blue one */
    g.globalAlpha=k;var px=W*0.82,py=sb*0.32,pr=Math.max(P*6,Math.min(W,H)*0.06);
    var pg=PX.rg(g,px-pr*0.4,py-pr*0.4,pr*0.1,px,py,pr);pg.addColorStop(0,"#F5C08A");pg.addColorStop(1,"#9a4a3a");g.fillStyle=pg;PX.disc(g,px,py,pr);
    g.strokeStyle="rgba(240,220,170,.8)";g.lineWidth=Math.max(1,P*0.8);PX.ringO(g,px,py,pr*1.8,pr*0.45,-0.3);
    var qx=W*0.14,qy=sb*0.22,qr=pr*0.45,qg=PX.rg(g,qx-qr*0.3,qy-qr*0.3,1,qx,qy,qr);qg.addColorStop(0,"#9fe0ff");qg.addColorStop(1,"#2a5aa0");g.fillStyle=qg;PX.disc(g,qx,qy,qr);
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
    var gr=PX.lg(g,0,wy,0,H);gr.addColorStop(0,"rgba(60,150,220,.38)");gr.addColorStop(1,"rgba(10,40,110,.6)");g.globalAlpha=1;g.fillStyle=gr;g.fillRect(0,wy,W,H-wy);
    /* light rays through the water */
    g.globalCompositeOperation="lighter";for(i=0;i<6;i++){var rx=((i*0.19+t*0.02)%1.2-0.1)*W;g.globalAlpha=0.06+0.04*Math.sin(t+i);g.fillStyle="#8fd0ff";g.beginPath();g.moveTo(rx,wy);g.lineTo(rx+W*0.05,wy);g.lineTo(rx+W*0.12,H);g.lineTo(rx+W*0.02,H);g.closePath();g.fill();}
    g.globalCompositeOperation="source-over";
    /* the surface: a wavy bright line */
    g.globalAlpha=0.9;for(var x=0;x<W;x+=P){var wv=Math.round(Math.sin(x*0.02+t*2.2)*P*0.8+Math.sin(x*0.051-t*1.3)*P*0.6);g.fillStyle="rgba(200,235,255,.85)";g.fillRect(x,Math.round(wy+wv),P,Math.max(1,P/2));if((x/P+Math.floor(t*4))%9===0){g.fillStyle="#fff";g.fillRect(x,Math.round(wy+wv-P/2),P,Math.max(1,P/2));}}
    /* bubbles from the floor, and fish once it's deep */
    g.strokeStyle="rgba(220,240,255,.6)";g.lineWidth=Math.max(1,P/3);for(i=0;i<26;i++){var ph=((t*0.18+i*0.137)%1),by=H-(H-wy)*ph,bx=((i*173.3)%W)+Math.sin(ph*10+i)*P*2;if(by<wy+P)continue;g.globalAlpha=0.7*(1-ph*0.5);PX.ring(g,bx,by,Math.max(1,P*(0.4+(i%3)*0.3)));}
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
      var gr=PX.lg(g,0,0,0,sb);gr.addColorStop(0,"rgba(60,30,90,.85)");gr.addColorStop(0.45,"rgba(220,90,90,.75)");gr.addColorStop(0.8,"rgba(250,170,70,.8)");gr.addColorStop(1,"rgba(120,50,60,.85)");
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
        var gg=PX.rg(g,fxp,fyp,0,fxp,fyp,rr);gg.addColorStop(0,"rgba(200,195,230,"+(G("f.fog",0.16)*fx.fog)+")");gg.addColorStop(1,"rgba(200,195,230,0)");
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
      holes.forEach(function(h0){var h={x:h0.x,y:h0.y,r:h0.r*G("f.pool",1)};var rg=PX.rg(dg,h.x,h.y,0,h.x,h.y,h.r);rg.addColorStop(0,"rgba(0,0,0,.9)");rg.addColorStop(1,"rgba(0,0,0,0)");dg.fillStyle=rg;dg.fillRect(h.x-h.r,h.y-h.r,h.r*2,h.r*2);});
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
      var hz=PX.rg(g,W/2,sb*0.6,0,W/2,sb*0.6,Math.max(W,H)*0.7);hz.addColorStop(0,"rgba("+ec+",.2)");hz.addColorStop(1,"rgba("+ec+",0)");g.fillStyle=hz;g.fillRect(0,0,W,H);
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
  /* ---------- pixel art on-screen controls: the joystick base and knob are drawn small, pixel by pixel, and shown scaled up
     with crisp pixels (image-rendering: pixelated), so they match the game art. Each returns a data URL (browser only). ---------- */
  var UI=(function(){
    var cache={};
    function grid(n,fn){if(typeof document==="undefined")return "";var c=document.createElement("canvas");c.width=c.height=n;var g=c.getContext("2d");
      for(var y=0;y<n;y++)for(var x=0;x<n;x++){var col=fn(x,y);if(col){g.fillStyle=col;g.fillRect(x,y,1,1);}}return c.toDataURL();}
    /* a round stick base: dark outline, a coloured rim, a dark well, a faint inner ring and four arrow notches */
    function stick(rim){rim=rim||"#7F77DD";var k="s"+rim;if(cache[k])return cache[k];var n=31,c=(n-1)/2,R=c+0.5;
      return cache[k]=grid(n,function(x,y){var dx=x-c,dy=y-c,d=Math.sqrt(dx*dx+dy*dy);if(d>R)return null;if(d>R-1.2)return "#0b0818";
        if(d>R-3.2)return (dx+dy<-4)?shade(rim,30):(dx+dy>4)?shade(rim,-35):rim;
        var ax=Math.abs(dx),ay=Math.abs(dy);
        /* arrow notches pointing out */
        if((ay<=c-4-ax&&ax>=c-6&&ax<=c-4)||(ax<=c-4-ay&&ay>=c-6&&ay<=c-4))return "rgba(255,255,255,.55)";
        if(Math.abs(d-6.5)<0.6)return "rgba(255,255,255,.10)";
        return d<7?"rgba(34,28,58,.92)":"rgba(18,14,34,.88)";});}
    /* a round knob: outline, flat colour, a light pixel band top left and a dark one bottom right */
    function knob(col){col=col||"#E85AA8";var k="k"+col;if(cache[k])return cache[k];var n=13,c=(n-1)/2,R=c+0.5;
      return cache[k]=grid(n,function(x,y){var dx=x-c,dy=y-c,d=Math.sqrt(dx*dx+dy*dy);if(d>R)return null;if(d>R-1.1)return "#1a0b18";
        if(dx+dy<-5&&d>R-2.6)return shade(col,55);if(dx+dy>4&&d>R-2.6)return shade(col,-45);if(dx<-1&&dy<-1&&d<2.2)return "#ffffff";return col;});}
    /* a little fist (knuckles towards you, thumb across the fingers) in a skin colour, for the walking stick's knob */
    var FIST=[".............",
              ".##.##.##.##.",
              "#ll#ll#ll#ll#",
              "#oo#oo#oo#oo#",
              "#ooooooooooo#",
              "#ooooooooooo#",
              "#oo##ooooooo#",
              "#o#llo#ooooo#",
              "#o#oooo#oood#",
              ".#o#####ood#.",
              "..#ooooooodd#",
              "...#ddddddd#.",
              "....#######.."];
    function fist(col){col=col||"#E8B48A";var k="f"+col;if(cache[k])return cache[k];
      return cache[k]=grid(13,function(x,y){var c=FIST[y]&&FIST[y][x];if(!c||c===".")return null;if(c==="#")return "#1a0b18";if(c==="l")return shade(col,45);if(c==="d")return shade(col,-40);return col;});}
    function shade(h,amt){var v=parseInt(h.slice(1),16),r=(v>>16)+amt,g=((v>>8)&255)+amt,b=(v&255)+amt;function cl(q){return Math.max(0,Math.min(255,q));}return "rgb("+cl(r)+","+cl(g)+","+cl(b)+")";}
    /* little pixel icons for buttons (replacing emoji): 1 = the colour, drawn with a hard dark shadow one pixel down and right */
    var ICONS={
      play:["..........","##........","####......","######....","########..","##########","########..","######....","####......","##........"],
      back:["..........","........##","......####","....######","..########","##########","..########","....######","......####","........##"],
      check:[".........##","........##.",".......##..","##....##...",".##..##....","..####.....","...##......"],
      dance:[".....##....",".....##..#.",".....##.#..","..#..###...","...######..",".....##....",".....##....","....#..#...","...#....#..","..##....##."],
      palette:["...#####...",".#########.","###..###.##","##..#######","###..##..##",".#########.","..#######.."],
      keys:["###########","#####.#####","#####.#####","#####.#####","#.#.#.#.#.#","#.#.#.#.#.#","###########"],
      cross:["#.....#",".#...#.","..#.#..","...#...","..#.#..",".#...#.","#.....#"],
      talk:["###########","#.........#","#.........#","#.........#","###########","...###.....","....#......"],
      game:[".#########.","###########","##.#####.##","#..#####..#","##.#####.##","###########",".#########."]
    };
    function icon(name,col){var k="i"+name+col;if(cache[k])return cache[k];var rows=ICONS[name]||ICONS.play,w=rows[0].length,h=rows.length;
      return cache[k]=grid(Math.max(w,h)+1,function(x,y){function on(a,b){return rows[b]&&rows[b][a]==="#";}
        if(on(x,y))return col||"#ffffff";if(on(x-1,y-1))return "rgba(0,0,0,.65)";return null;});}
    function iconSize(name){var r=ICONS[name]||ICONS.play;return [Math.max(r[0].length,r.length)+1,Math.max(r[0].length,r.length)+1];}
    return{stick:stick,knob:knob,fist:fist,icon:icon,iconSize:iconSize};
  })();
  return{UI:UI,PX:PX,MOSH:MOSHX,CTF:CTF,face8:face8,get neon(){return !!NEON;},setForce:function(f){FORCE=f||null;},get forcing(){return !!FORCE;},SKI:SK,PIPE:PP,KEEPY:{TYPES:KTYPES,make:keepyMake,advance:keepyAdvance,hit:keepyHit,draw:function(g,objs,P,sc,now){objs.forEach(function(o){withAdj("prop:"+o.type,g,function(){keepyDraw(g,[o],P,sc,now);});});}},rink:function(g,G0,now,k,ice){return withAdj(ice?"prop:ice":"prop:rink",g,function(){return rink(g,G0,now,k,ice);});},rinkGeom:rinkGeom,walkStep:walkStep,walkPose:walkPose,footShadow:footShadow,keyPad:keyPad,keyPadSpot:keyPadSpot,VERSION:"1.81.17",REACTS:REACTS,REACT_MS:REACT_MS,reactPose:reactPose,reactFx:reactFx,envPose:envPose,envFx:envFx,waterY:waterY,crowdPose:crowdPose,follower:follower,primeFx:primeFx,jumboFrame:jumboFrame,crowdFx:crowdFx,crowdLift:crowdLift,CROWD_MS:CROWD_MS,CROWD_KINDS:CROWD_KINDS,fxBack:fxBack,fxFront:fxFront,FX_DEFAULT:FX_DEFAULT,DANCES:DANCES,dance:dance,danceMove:danceMove,base:danceBase,DTWEAK:DTWEAK,maker:maker,drawChar:drawChar,joints:joints,LIMB:LIMB,pixText:pixText,scene:scene,sceneP:sceneP,keyboard:function(g,x,y,p,l,c){return withAdj("prop:keyboard",g,function(){var r=PAINT.holes("keyboard",g,x,y,p,function(gg){return keyboard(PAINT.replaced("keyboard")?PAINT.dummy():gg,x,y,p,l,c);});PAINT.at(g,"keyboard",x,y,p);return r;});},micStand:function(g,x,y,p){return withAdj("prop:mic",g,function(){var r=PAINT.holes("mic",g,x,y,p,function(gg){return micStand(PAINT.replaced("mic")?PAINT.dummy():gg,x,y,p);});PAINT.at(g,"mic",x,y,p);return r;});},reloadAdj:adjLoad,paint:PAINT,isolate:function(p){ISO=p||null;},hideChars:function(b){HIDECHAR=!!b;},noAdj:function(b){NOADJ=!!b;},withAdj:withAdj,
    looks:{OPTS:OPTS,KEYS:KEYS,count:count,pack:pack,unpack:unpack,random:random,fromColor:fromColor,topColor:topColor,colOf:colOf,SKIN:SKIN,HAIRCOL:HAIRCOL,CLOTH:CLOTH},shade:shade};
})();
