/* INSTRUMENTS: the performer holding and playing whatever instrument they've picked.
   Loaded after art.js; adds ART.INST.

   ART.INST.kindOf(id, label)  which kind of instrument art fits an instrument in the arsenal (by its id and name)
   ART.INST.draw(g, x, y, p, look, kind, st)
     The performer at body centre (x, y), art pixel p, holding the instrument and playing it.
     st: {midi, on (a note is sounding), t0 (ms the note started), off (ms it stopped), now (ms), n (notes so far)}
     Hands follow the note: fret and string on guitars and bowed strings, the key on keyboards, the bar on mallets,
     the valves on brass (real trumpet fingering), the slide on a trombone, holes on woodwinds. An attack moves
     (a strum, a strike, a key going down); a held note keeps moving (the bow, the bellows, vibrato).
   ART.INST.KINDS  every kind, for testing. */
(function(){
  if(typeof ART==="undefined")return;
  var KINDS=["grand","upright","organ","pipeorgan","synth","keytar","epiano","harpsichord","chip","accordion",
    "acoustic","electric","metal","jazzguitar","bass","banjo","sitar","shamisen","violin","cello","contrabass","harp",
    "trumpet","trombone","horn","tuba","sax","flute","clarinet","bassoon","panflute","ocarina","harmonica","bagpipe",
    "mallets","glock","steeldrum","kalimba","musicbox","drum","timpani","zither","voice","choir","whistle","bottle","bells","glasses","djdeck"];

  /* ---- which art for which instrument ---- */
  var RULES=[
    [/wine.?glass|glass.?chime/,"glasses"],[/tubular|tinkle|agogo/,"bells"],
    [/choir|voice|vocal|aahs|oohs/,"voice"],
    [/music.?box|celesta|lofi-bell/,"musicbox"],[/kalimba|mbira/,"kalimba"],
    [/steel.?drum/,"steeldrum"],[/glock/,"glock"],[/xylo|marimba|vibraphone|balafon|vibes|mallet|fm.?bell|edm-bell/,"mallets"],
    [/\bedm-|supersaw|acid.?303|daft.?punk|deadmau5|trance.?lead|\bstrobe\b/,"djdeck"],   /* the EDM synths: a DJ booth */
    [/church|pipe.?organ|renaissance.?organ|calliope/,"pipeorgan"],[/organ/,"organ"],
    [/bass.?di\b/,"bass"],[/synth.?bass|sub.?bass/,"synth"],[/pad\b|\bpad:/,"synth"],
    [/timpani/,"timpani"],[/taiko|tom\b|melodic.?tom|synth.?drum|woodblock|orchestra.?hit|perc/,"drum"],
    [/koto|dan.?tranh|dulcimer|psaltery|zither/,"zither"],[/shamisen|sanshin/,"shamisen"],[/sitar/,"sitar"],[/banjo|strumstick|\blute\b(?!.*harpsichord)/,"banjo"],
    [/harpsichord|clavinet|clav\b/,"harpsichord"],[/harp/,"harp"],
    [/bassoon/,"bassoon"],[/contrabass|double.?bass|acoustic.?bass/,"contrabass"],[/cello/,"cello"],[/violin|viola|fiddle|tremolo|pizzicato|ensemble|strings/,"violin"],
    [/trombone/,"trombone"],[/tuba/,"tuba"],[/english.?horn|oboe|clarinet|recorder|shanai|shakuhachi/,"clarinet"],[/horn|french/,"horn"],
    [/bassoon/,"bassoon"],[/sax/,"sax"],[/trumpet|cornet|brass/,"trumpet"],
    [/blown.?bottle|bottle/,"bottle"],[/pan.?flute/,"panflute"],[/ocarina/,"ocarina"],[/whistl/,"whistle"],[/flute|piccolo|chiff/,"flute"],
    [/harmonica/,"harmonica"],[/bagpipe/,"bagpipe"],[/accordion|harmonium|bandoneon/,"accordion"],
    [/slap|finger.?bass|pick.?bass|fretless|bass.?guitar|bass-electric|bass.?di|mellow.?bass|mk-bass|\bbass\b(?!.*(synth|sub|lead))/,"bass"],
    [/metal|distortion|hard.?rock|pinch|charang/,"metal"],[/jazz/,"jazzguitar"],
    [/overdrive|electric(?!.*(piano|grand))|clean|crunch|muted|harmonics|ambient.?guitar|rock|mkii.?guitar|fb-ambient/,"electric"],
    [/guitar|nylon|steel|spanish|bossa|fingerpick|acoustic/,"acoustic"],
    [/chip|\bnes\b|pulse|8-?bit|square|graal/,"chip"],
    [/lead|saw|acid|303|trance|daft|mau5|strobe|keytar|fifths/,"keytar"],
    [/wurl|rhodes|epiano|ep\d|ep-|electric.?piano|dusty|lofi-keys|cp80|electric.?grand|tx81z/,"epiano"],
    [/honky|upright|casio/,"upright"],[/piano|grand|salamander|steinway|keys\b|core/,"grand"]
  ];
  function kindOf(id,label){
    var s=(String(id||"")+" "+String(label||"")).toLowerCase();
    for(var i=0;i<RULES.length;i++)if(RULES[i][0].test(s))return RULES[i][1];
    return "synth";                                                         /* synths, pads, FX and anything new */
  }

  /* ---- drawing helpers ----
     Each instrument is drawn on a small canvas at one canvas pixel per art pixel, outlined like the characters,
     then put on screen scaled by p (crisp pixels, turned if need be). */
  var cache={};
  function cv(w,h){var c=document.createElement("canvas");c.width=w;c.height=h;return c;}
  function piece(key,w,h,fn){
    var e=cache[key];if(!e||e.a.width!==w+2||e.a.height!==h+2){e=cache[key]={a:cv(w+2,h+2),b:cv(w+2,h+2)};}
    var a=e.a,ag=a.getContext("2d"),b=e.b,bg=b.getContext("2d");ag.clearRect(0,0,w+2,h+2);
    function r(x,y,ww,hh,c){if(ww<=0||hh<=0)return;ag.fillStyle=c;ag.fillRect(Math.round(x)+1,Math.round(y)+1,Math.round(ww),Math.round(hh));}
    function ln(x0,y0,x1,y1,c){var n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2+1;ag.fillStyle=c;for(var i=0;i<=n;i++){ag.fillRect(Math.round(x0+(x1-x0)*i/n)+1,Math.round(y0+(y1-y0)*i/n)+1,1,1);}}
    function disc(cx,cy,rad,c){for(var yy=-rad;yy<=rad;yy++)for(var xx=-rad;xx<=rad;xx++)if(xx*xx+yy*yy<=rad*rad+rad*0.8)r(cx+xx,cy+yy,1,1,c);}
    fn(r,ln,disc,ag);
    bg.globalCompositeOperation="source-over";bg.clearRect(0,0,w+2,h+2);
    bg.drawImage(a,-1,0);bg.drawImage(a,1,0);bg.drawImage(a,0,-1);bg.drawImage(a,0,1);
    bg.globalCompositeOperation="source-in";bg.fillStyle="#120D1E";bg.fillRect(0,0,w+2,h+2);
    bg.globalCompositeOperation="source-over";bg.drawImage(a,0,0);
    return b;
  }
  /* put canvas c on screen so its pixel (ax, ay) lands at (x, y), scaled p, turned rot */
  function blit(g,c,x,y,p,ax,ay,rot){
    var was=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;
    if(rot){g.save();g.translate(Math.round(x),Math.round(y));g.rotate(rot);g.drawImage(c,-(ax+1)*p,-(ay+1)*p,c.width*p,c.height*p);g.restore();}
    else g.drawImage(c,Math.round(x-(ax+1)*p),Math.round(y-(ay+1)*p),c.width*p,c.height*p);
    g.imageSmoothingEnabled=was;
  }
  /* a point on a turned piece: piece pixel (px, py), placed with its (ax, ay) at (x, y) turned rot */
  function at(x,y,p,ax,ay,rot,px,py){var dx=(px-ax)*p,dy=(py-ay)*p,c=Math.cos(rot||0),s=Math.sin(rot||0);return [x+dx*c-dy*s,y+dx*s+dy*c];}
  /* arm angle so the hand points at target t from shoulder j; and where the hand ends up */
  function aim(j,t){return Math.atan2(-(t[0]-j[0]),t[1]-j[1]);}
  function handAt(j,a,p,n){return [j[0]-Math.sin(a)*((n||9)-1)*p,j[1]+Math.cos(a)*((n||9)-1)*p];}
  function hand(g,h,p,skin){var q=Math.max(1,p),s=Math.round(3*q);g.fillStyle="#120D1E";g.fillRect(Math.round(h[0]-s/2-q),Math.round(h[1]-s/2-q),s+2*q,s+2*q);g.fillStyle=skin;g.fillRect(Math.round(h[0]-s/2),Math.round(h[1]-s/2),s,s);}
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function nrm(m,lo,hi){return clamp((m-lo)/(hi-lo),0,1);}
  /* sound coming off the instrument: little arcs at (x, y) heading along angle dir */
  function waves(g,x,y,p,dir,k,col){if(k<=0)return;g.save();g.strokeStyle=col||"rgba(255,255,255,.75)";g.lineWidth=Math.max(1,p*0.6);
    for(var i=0;i<3;i++){var ph=((Date.now()/400)+i/3)%1,r=p*(3+ph*9);g.globalAlpha=k*(1-ph);g.beginPath();g.arc(x,y,r,dir-0.5,dir+0.5);g.stroke();}g.restore();}
  var WHITE=[0,2,4,5,7,9,11];
  function whiteIdx(m){var o=Math.floor(m/12),pc=((m%12)+12)%12,w=0;for(var i=0;i<7;i++)if(WHITE[i]<=pc)w=i;return {w:o*7+w,black:WHITE.indexOf(pc)<0};}
  /* the string and fret for a note on strings tuned to `tune` (lowest first): the highest string it fits on, up to 12 frets */
  function fretFor(m,tune){var s=0;for(var i=0;i<tune.length;i++)if(m>=tune[i])s=i;var f=clamp(m-tune[s],0,14);return {s:s,f:f,pos:1-Math.pow(2,-f/12)};}
  var TRUMPET=[0,7,5,6,3,1,2,0,6,3,1,2];                                      /* valves down for each note of the octave (bits: 1st, 2nd, 3rd) */
  var CLOSED=[6,6,5,5,4,4,3,3,2,2,1,1];                                       /* holes covered: low notes cover more */

  /* ---- the performer with an instrument ---- */
  function draw(g,x,y,p,look,kind,st){
    st=st||{};var now=st.now||Date.now(),on=!!st.on,m=st.midi||60,age=on?now-(st.t0||now):1e9,rel=on?0:now-(st.off||0);
    var atk=on?Math.max(0,1-age/140):0;                                       /* the hit: 1 at the note's start, gone after 140 ms */
    var held=on?1:Math.max(0,1-rel/250),t=now/1000,flip=(st.n||0)%2?1:-1;
    var L=look||ART.looks.random(3),skin=ART.looks.SKIN[L.skin]||ART.looks.SKIN[1];
    var bob=-atk*1.5*p+(on?-Math.abs(Math.sin(t*4))*0.6*p:0);
    var J=ART.joints(x,y,p,bob),pose={armL:0.15,armR:-0.15,legL:0,legR:0,bob:bob,mouth:false},back=null,front=null,hands=[],fx=null,iy=y+bob,behind=false,after=null;
    /* point the arms at the two hand spots; an arm that doesn't need its full length is drawn shorter (reaching toward you), so the hand lands on the spot */
    function reach(j,t){return Math.max(4,Math.min(9,Math.hypot(t[0]-j[0],t[1]-j[1])/p+1));}
    function arms(tl,tr){pose.armL=aim(J[0],tl);pose.armR=aim(J[1],tr);pose.lenL=reach(J[0],tl);pose.lenR=reach(J[1],tr);hands=[handAt(J[0],pose.armL,p,pose.lenL),handAt(J[1],pose.armR,p,pose.lenR)];}
    var c,k2;
    switch(kind){

    /* ---------- keyboards: you stand behind them; the hand goes to the key, which lights ---------- */
    case "grand":case "upright":case "organ":case "pipeorgan":case "synth":case "epiano":case "harpsichord":{
      var lo=48,nW=21,wi=whiteIdx(m),w0=whiteIdx(lo).w,ki=wi.w-w0;while(ki<0)ki+=7;while(ki>=nW)ki-=7;
      var KW=nW*2+2,ky=y+5*p,kx0=x-(KW/2)*p;
      var body={grand:["#15121F","#2a2440"],upright:["#5a3220","#7a4a30"],organ:["#6a3a1e","#8a5a34"],pipeorgan:["#4a2a1a","#6a4028"],synth:["#2d2546","#4a3f6a"],epiano:["#1a1820","#B83A44"],harpsichord:["#8a5a2a","#C8963C"]}[kind];
      /* behind you: a grand piano's lid, an upright's back, organ pipes, a drawbar organ's speaker */
      if(kind==="grand")back=function(){c=piece("grandlid",46,22,function(r,ln){for(var i=0;i<22;i++)r(2+i*0.6,i,44-i*1.6,1,i<3?"#2a2440":"#15121F");ln(8,21,22,0,"#4a3f6a");r(4,20,40,2,"#0a0810");});blit(g,c,x,ky-2*p,p,23,22,0);};
      if(kind==="upright")back=function(){c=piece("upright",KW,20,function(r){r(0,0,KW,20,body[0]);r(1,1,KW-2,2,body[1]);r(3,5,KW-6,12,"#4a2818");for(var i=0;i<3;i++)r(6+i*(KW-12)/3,7,(KW-12)/3-2,8,"#5a3220");});blit(g,c,x,ky-p,p,KW/2,20,0);};
      if(kind==="pipeorgan")back=function(){c=piece("pipes",60,36,function(r){for(var i=0;i<15;i++){var h=14+Math.round(18*Math.sin((i+0.5)/15*Math.PI)),px=i*4;r(px,36-h,3,h,i%2?"#C8C8D8":"#A8A8C0");r(px,36-h,1,h,"#E8E8F5");r(px,36-h+3,3,1,"#15121F");}});blit(g,c,x,ky-6*p,p,30,36,0);};
      if(kind==="organ")back=function(){c=piece("leslie",12,24,function(r){r(0,0,12,24,"#6a3a1e");r(1,2,10,8,"#2a1810");r(1,13,10,9,"#2a1810");var sp=Math.floor(Date.now()/(on?60:200))%4;for(var i=0;i<4;i++)r(2+i*2.5,4,1,4,i===sp?"#C8963C":"#4a2818");});blit(g,c,x+(KW/2+6)*p,ky+10*p,p,6,24,0);};
      front=function(){
        c=piece("kb-"+kind+(on?"1":"0")+ki+(wi.black?"b":""),KW,kind==="grand"||kind==="upright"?6:7,function(r){
          r(0,0,KW,7,body[0]);r(0,0,KW,2,body[1]);
          if(kind==="synth"){for(var kn=0;kn<5;kn++)r(3+kn*4,0,2,2,on&&kn===(st.n||0)%5?"#4CC38A":"#8a80b0");r(KW-12,0,9,2,"#0d2a1a");r(KW-11,0,Math.round(7*nrm(m,36,96))+1,1,"#4CC38A");}
          if(kind==="organ"){for(var db=0;db<9;db++)r(3+db*2,0,1,1+((db*7+3)%3),["#5a3220","#15121F","#EDEDF5"][db%3]);}
          for(var k=0;k<nW;k++){var lit=on&&k===ki&&!wi.black;r(1+k*2,2,2,5,lit?"#F5D03C":k%2?"#EDEDF5":"#DCDCEA");r(2+k*2,2,1,5,"#9a96b0");}
          for(k=0;k<nW-1;k++){var pc=k%7;if(pc===2||pc===6)continue;var litb=on&&wi.black&&k===ki;r(2+k*2,2,1,3,litb?"#F5D03C":"#15121F");}
        });
        blit(g,c,x,ky,p,KW/2,0,0);
        /* legs: an X stand, wooden legs, or a cabinet */
        var legC=kind==="synth"||kind==="epiano"?"#4d4170":body[0];
        if(kind==="synth"||kind==="epiano"){for(var i=0;i<8;i++){g.fillStyle=legC;g.fillRect(Math.round(x+(-9+i*2)*p),Math.round(ky+(9+i)*p),2*p,p);g.fillRect(Math.round(x+(7-i*2)*p),Math.round(ky+(9+i)*p),2*p,p);}}
        else{g.fillStyle=body[0];g.fillRect(Math.round(kx0+2*p),Math.round(ky+8*p),2*p,9*p);g.fillRect(Math.round(kx0+(KW-4)*p),Math.round(ky+8*p),2*p,9*p);}
      };
      /* hands: the playing hand on the key (it dips on the hit); the other rests on a chord lower down */
      var kxp=kx0+(2+ki*2)*p,press=atk*1.2*p,highHand=ki>=nW/2;
      var tPlay=[kxp,ky+(3+(wi.black?-0.5:0.5))*p+press],tRest=[highHand?kx0+(5+Math.sin(t*2)*0.5)*p:kx0+(KW-6)*p,ky+3.5*p];
      if(!on){tPlay=[x+(highHand?6:-6)*p,ky+2*p];}
      if(highHand)arms(tRest,tPlay);else arms(tPlay,tRest);
      pose.mouth=on&&age<500;
      fx=function(){if(on&&age<600)waves(g,x,ky-4*p,p,-Math.PI/2,1-age/600,"rgba(245,208,60,.7)");};
      break;}

    /* ---------- the EDM synths: a DJ booth with two decks and a mixer, its front lit up. A note: a hand on a deck (scratching)
       and the other on the mixer's faders. Nothing playing for a moment: both hands up to the crowd, like a DJ at the drop ---------- */
    case "djdeck":{
      var fr=Math.floor(now/90)%8,led=Math.floor(now/(60000/128))%2,DW=52,dy=y+4*p;
      c=piece("dj"+fr+led,DW,16,function(r,ln,disc){
        r(0,0,DW,5,"#1b1730");r(0,0,DW,1,"#3a3256");                                     /* the top */
        [9,DW-10].forEach(function(cx,di){r(cx-7,0,14,5,"#2a2440");for(var yy=0;yy<3;yy++)r(cx-5+(yy===1?-1:0),1+yy,10+(yy===1?2:0),1,"#0d0b16");
          var a=(fr/8)*Math.PI*2*(di?1:-1);r(Math.round(cx+Math.cos(a)*4),Math.round(2+Math.sin(a)*1),1,1,"#EDEDF5");r(cx,2,1,1,"#8a80b0");});
        r(DW/2-7,0,14,5,"#2d2546");for(var f=0;f<4;f++){r(DW/2-5+f*3,1,1,3,"#0d0b16");r(DW/2-5+f*3,1+((fr+f*3)%3),1,1,"#F5D03C");}   /* the mixer */
        r(0,5,DW,11,"#100c1c");                                                           /* the front, an LED strip along it */
        r(1,6,DW-2,2,led?"#3DF2FF":"#FF3DA8");r(1,6,DW-2,1,led?"#B8FBFF":"#FFB0DD");
        for(var k=0;k<6;k++)r(4+k*8,10,5,4,"#1d1730");
      });
      front=function(){blit(g,c,x,dy,p,DW/2,0,0);};
      var quiet=!on&&rel>1800;
      if(quiet){pose.armL=2.75+Math.sin(t*3)*0.12;pose.armR=-2.75+Math.sin(t*3)*0.12;pose.mouth=true;}   /* hands up! */
      else{var left=(st.n||0)%2===0,scr=Math.sin(t*(on?22:4))*1.6*p,fad=(nrm(m,36,96)-0.5)*8*p,deckT=[x+(left?-17:17)*p+scr,dy+2*p],mixT=[x+fad,dy+2*p];
        if(left)arms(deckT,mixT);else arms(mixT,deckT);}
      fx=function(){g.save();g.globalCompositeOperation="lighter";var gc=led?"61,242,255":"255,61,168",gw=g.createLinearGradient(0,dy+6*p,0,dy-10*p);gw.addColorStop(0,"rgba("+gc+",.35)");gw.addColorStop(1,"rgba("+gc+",0)");
        g.fillStyle=gw;g.fillRect(x-(DW/2)*p,dy-10*p,DW*p,10*p);g.restore();if(on&&age<500)waves(g,x,dy-6*p,p,-Math.PI/2,1-age/500,"rgba("+gc+",.8)");};
      break;}
    /* ---------- a keytar on a strap: left hand on the neck, right hand along the keys ---------- */
    case "keytar":{
      var ktk=whiteIdx(m),kti=((ktk.w%14)+14)%14,kr=-0.35;
      c=piece("keytar"+(on?kti:"x"),40,9,function(r){r(0,1,30,7,"#D354A0");r(0,1,30,2,"#F07ac0");for(var k=0;k<14;k++)r(2+k*2,4,2,4,on&&k===kti?"#F5D03C":"#EDEDF5");for(k=0;k<13;k++){if(k%7===2||k%7===6)continue;r(3+k*2,4,1,2,"#15121F");}r(30,3,10,3,"#2d2546");r(36,2,3,5,"#4a3f6a");});
      var kAnch=[x+1*p,y+3*p+bob];
      front=function(){blit(g,c,kAnch[0],kAnch[1],p,20,4,kr);};
      var keyAt=at(kAnch[0],kAnch[1],p,20,4,kr,3+kti*2,4-atk),neck=at(kAnch[0],kAnch[1],p,20,4,kr,36,3);
      arms(keyAt,[neck[0],neck[1]+Math.sin(t*6)*on*0.6*p]);if(!on)hands[0]=handAt(J[0],pose.armL=aim(J[0],at(kAnch[0],kAnch[1],p,20,4,kr,12,2)),p);
      pose.mouth=on&&age<400;fx=function(){if(on)waves(g,neck[0]+6*p,neck[1]-2*p,p,-0.6,Math.max(0.3,1-age/800),"rgba(211,84,160,.8)");};
      break;}

    /* ---------- a handheld chip console: thumbs on the buttons, the note on the little screen ---------- */
    case "chip":{
      var bt=on?(st.n||0)%4:-1;
      c=piece("chip"+bt+(on?Math.round(nrm(m,36,96)*8):"x"),16,20,function(r){r(0,0,16,20,"#C8C4D8");r(0,0,16,1,"#E8E6F2");r(2,2,12,8,"#3a3650");r(3,3,10,6,on?"#9BBC0F":"#4a6a1a");
        if(on){var lv=Math.round(nrm(m,36,96)*5);r(4,8-lv,8,1,"#0f380f");r(4+((st.n||0)%8),8-lv-1,2,1,"#306230");}
        r(2,12,5,2,"#2A2238");r(3.5,11,2,4,"#2A2238");r(10,12,2,2,bt===0?"#E8505B":"#8a1e3c");r(12,11,2,2,bt===1?"#E8505B":"#8a1e3c");r(6,17,2,1,"#6a6680");r(9,17,2,1,"#6a6680");});
      var cy=y-1*p+bob;front=function(){blit(g,c,x,cy,p,8,10,0);};
      arms([x-4*p,cy+3*p+(bt===2?atk*p:0)],[x+4*p,cy+2*p+(bt>=0&&bt<2?atk*p:0)]);
      fx=function(){if(on&&age<300)waves(g,x,cy-11*p,p,-Math.PI/2,1-age/300,"rgba(155,188,15,.9)");};
      break;}

    /* ---------- accordion: the bellows breathe while notes hold; right hand on the keys ---------- */
    case "accordion":{
      var spread=on?4+Math.sin(t*2.2)*3:3;
      c=piece("acc"+Math.round(spread)+(on?Math.round(nrm(m,48,84)*8):"x"),26+Math.round(spread)*2,16,function(r){var bw=Math.round(spread)*2;
        r(0,0,7,16,"#B83A44");r(1,1,5,14,"#EDEDF5");for(var i=0;i<9;i++)r(1,1+i*1.6,5,1,on&&i===Math.round(nrm(m,48,84)*8)?"#F5D03C":"#15121F");
        for(var b=0;b<bw+12;b+=2)r(7+b,0,1,16,b%4?"#2a2440":"#8a1e3c");r(19+bw,0,7,16,"#B83A44");for(var j=0;j<4;j++)for(var q=0;q<3;q++)r(21+bw+q*2,2+j*3,1,1,"#EDEDF5");});
      var aw=26+Math.round(spread)*2;front=function(){blit(g,c,x,y+bob,p,aw/2,8,0);};
      var keyY=y+bob+(-7+nrm(m,48,84)*14)*p;arms([x+(aw/2-4)*p,y+bob+3*p],[x-(aw/2-3)*p,keyY+atk*p]);
      pose.mouth=on&&age<300;fx=function(){if(on)waves(g,x,y+bob-10*p,p,-Math.PI/2,0.6,"rgba(232,80,91,.7)");};
      break;}

    /* ---------- guitars, bass, banjo, sitar: strumming hand over the body, the other hand at the fret ---------- */
    case "acoustic":case "electric":case "metal":case "jazzguitar":case "bass":case "banjo":case "sitar":case "shamisen":{
      var isBass=kind==="bass",sham=kind==="shamisen",tune=isBass?[28,33,38,43]:kind==="banjo"?[50,55,59,62]:kind==="sitar"?[48,53,60,65]:sham?[48,53,60]:[40,45,50,55,59,64];
      var ff=fretFor(m,tune),nS=tune.length,neckL=isBass?19:kind==="sitar"?21:sham?21:16,bodyW=kind==="sitar"?13:isBass?12:sham?10:13,gr=sham?-0.9:-0.62;
      var vib=on?Math.sin(now*0.09)*(1-Math.min(1,age/1500)):0;
      c=piece("gtr-"+kind+(on?ff.s+"_"+Math.round(vib*2):"x"),neckL+bodyW+4,bodyW+2,function(r,ln,disc){
        var bh=bodyW,cy2=Math.floor(bh/2)+1;
        if(kind==="acoustic"||kind==="jazzguitar"){disc(6,cy2-2,5,kind==="jazzguitar"?"#C8501E":"#D8A050");disc(8,cy2+1,6,kind==="jazzguitar"?"#E87a30":"#E8B868");if(kind==="acoustic")disc(9,cy2,2,"#2a1810");else{r(6,cy2-3,1,3,"#2a1810");r(11,cy2+1,1,3,"#2a1810");}}
        else if(kind==="electric"){r(1,2,12,bh-3,"#E8505B");r(0,4,4,bh-7,"#E8505B");r(3,1,6,2,"#E8505B");r(7,cy2-2,2,4,"#15121F");r(3,cy2-1,2,3,"#EDEDF5");}
        else if(kind==="metal"){ln(0,1,12,cy2,"#15121F");ln(0,bh,12,cy2,"#15121F");for(var yy=0;yy<bh;yy++)r(Math.abs(yy-cy2)*1.1,yy,13-Math.abs(yy-cy2)*1.1,1,"#2A2238");r(6,cy2-1,3,2,"#C8C8D8");}
        else if(isBass){r(1,2,12,bh-3,"#4A9BE8");r(0,3,3,bh-5,"#4A9BE8");r(4,1,5,2,"#4A9BE8");r(7,cy2-1,2,3,"#15121F");}
        else if(kind==="banjo"){disc(7,cy2,6,"#8a5a2a");disc(7,cy2,5,"#EDEDF5");}
        else if(kind==="sitar"){disc(6,cy2,6,"#C8963C");disc(6,cy2,4,"#E8B868");}
        else if(sham){r(0,1,bh,bh,"#4a2414");r(1,2,bh-2,bh-2,"#F2E8D0");r(1,2,bh-2,1,"#FFF8E8");r(2,bh-1,bh-4,1,"#D8CCB0");r(3,cy2,3,1,"#2a1810");r(bh-3,3,1,bh-4,"#E8505B");}   /* the drum: a wood frame, cream skin, the bridge, a red cord */
        /* the neck, frets, the headstock, and strings (the one sounding wobbles and glows) */
        if(sham){r(bodyW-1,cy2-1,neckL,3,"#1a1210");r(bodyW-1,cy2-1,neckL,1,"#3a2a20");                                     /* a thin fretless neck */
          r(bodyW-1+neckL,cy2-2,4,4,"#1a1210");r(bodyW+neckL,cy2-4,1,2,"#F2E8D0");r(bodyW+neckL+2,cy2+2,1,2,"#F2E8D0");r(bodyW+neckL+1,cy2-4,1,2,"#F2E8D0");}   /* the peg box, three ivory pegs */
        else{r(bodyW-1,cy2-2,neckL,4,"#5a3220");for(var f=1;f<13;f+=1){var fp=(1-Math.pow(2,-f/12))/0.5;if(f%2&&f>4)continue;r(bodyW-1+neckL-Math.round(neckL*fp*0.95),cy2-2,1,4,"#B8B0C8");}
        r(bodyW-1+neckL,cy2-3,4,6,kind==="metal"?"#15121F":"#3a2010");}
        if(sham){for(var s3=0;s3<3;s3++){var hot3=on&&ff.s===s3;if(s3!==1&&!hot3)continue;r(3,cy2-1+s3+(hot3?Math.round(vib):0),bodyW+neckL-3,1,hot3?"#F5D03C":"#B8A888");}}   /* thin silk strings: the middle one, and the one sounding */
        else for(var s=0;s<Math.min(nS,4);s++){var sy=cy2-1.5+s*(3/Math.max(1,Math.min(nS,4)-1)),hot=on&&Math.round(ff.s*Math.min(nS,4)/nS)===s;
          r(5,sy+(hot?Math.round(vib):0),bodyW+neckL-4,1,hot?"#F5D03C":"#E0DCE8");}
      });
      var gAnch=[x-1*p,y+3*p+bob],gW=neckL+bodyW+4,cy3=Math.floor(bodyW/2)+1;
      front=function(){blit(g,c,gAnch[0],gAnch[1],p,8,cy3,gr);};
      /* strum: the hand sweeps across the strings on each note, alternating down and up */
      var sweep=on?clamp(age/110,0,1):1,sOff=(flip>0?-3+6*sweep:3-6*sweep)*(on?1:0.2);
      var strum=at(gAnch[0],gAnch[1],p,8,cy3,gr,isBass?11:sham?6:9,cy3+sOff*0.6),fret=at(gAnch[0],gAnch[1],p,8,cy3,gr,bodyW-1+neckL-Math.min(1,ff.pos/0.5)*neckL*0.95+1,cy3+(on?0:-1));
      arms(strum,fret);
      pose.mouth=on&&age<350&&(kind==="metal");
      if(sham){behind=true;after=function(){
        /* the bachi: a fan-shaped plectrum, its wide blade striking the skin */
        var h=hands[0],ba=gr-0.35,dx=Math.cos(ba),dy=Math.sin(ba),nx=-dy,ny=dx;          /* the blade points up along the neck, over the skin */
        function P(a,b){return [h[0]+dx*a*p+nx*b*p,h[1]+dy*a*p+ny*b*p];}
        var pts=[P(-2,-0.6),P(2,-0.8),P(6,-3),P(6.6,0),P(6,3),P(2,0.8),P(-2,0.6)];
        g.fillStyle="#120D1E";g.beginPath();pts.forEach(function(q,i){if(i)g.lineTo(q[0],q[1]);else g.moveTo(q[0],q[1]);});g.closePath();g.lineWidth=Math.max(2,p*0.8);g.strokeStyle="#120D1E";g.stroke();
        g.fillStyle="#F5E8C8";g.fill();g.fillStyle="#C8B890";var e1=P(5.4,-2.6),e2=P(5.4,2.6);g.beginPath();g.moveTo(e1[0],e1[1]);g.lineTo(P(6.6,0)[0],P(6.6,0)[1]);g.lineTo(e2[0],e2[1]);g.closePath();g.fill();
        hand(g,h,p,skin);hand(g,hands[1],p,skin);}}
      fx=function(){if(on){var sh=at(gAnch[0],gAnch[1],p,8,cy3,gr,8,cy3);waves(g,sh[0]-3*p,sh[1]+2*p,p,Math.PI*0.8,Math.max(0.25,1-age/900),kind==="metal"?"rgba(232,80,91,.8)":"rgba(245,208,60,.75)");}};
      break;}

    /* ---------- bowed strings: the bow moves while the note holds and turns round on each new note ---------- */
    case "violin":{
      var vf=fretFor(m,[55,62,69,76]),bowP=on?(flip>0?clamp(age/1400,0,1):1-clamp(age/1400,0,1)):0.5,pizz=false;
      c=piece("violin"+(on?vf.s:"x"),24,9,function(r,ln,disc){disc(4,4,3,"#C8501E");disc(9,4,3,"#C8501E");r(4,2,6,5,"#C8501E");r(5,3,1,1,"#2a1010");r(8,5,1,1,"#2a1010");r(12,3,9,3,"#2a1810");r(21,2,3,5,"#5a3220");
        for(var s=0;s<4;s++)r(2,2.5+s*1.2,20,1,on&&s===vf.s?"#F5D03C":"#D8D0C0");});
      var vA=[x+3*p,y-7*p+bob],vr=0.35;front=function(){blit(g,c,vA[0],vA[1],p,4,4,vr);
        var b0=at(vA[0],vA[1],p,4,4,vr,6,4),bx=b0[0]+(-9+18*bowP)*p,by=b0[1]+(4-2*bowP)*p;g.strokeStyle="#D8D0C0";g.lineWidth=Math.max(1,p*0.6);g.beginPath();g.moveTo(bx-9*p,by+5*p);g.lineTo(bx+9*p,by-5*p);g.stroke();g.fillStyle="#5a3220";g.fillRect(Math.round(bx-10*p),Math.round(by+4.5*p),2*p,p);};
      var b1=at(vA[0],vA[1],p,4,4,vr,6,4),bowHand=[b1[0]+(-9+18*bowP)*p-9*p,b1[1]+(4-2*bowP)*p+5*p],vfret=at(vA[0],vA[1],p,4,4,vr,20-vf.pos*14,4+(on?Math.sin(now*0.03)*0.4:0));
      arms(bowHand,vfret);
      fx=function(){if(on)waves(g,b1[0],b1[1]-4*p,p,-Math.PI/2,0.5,"rgba(200,80,30,.7)");};
      break;}
    case "cello":case "contrabass":{
      var big=kind==="contrabass",cf=fretFor(m,big?[28,33,38,43]:[36,43,50,57]),bw2=on?(flip>0?clamp(age/1600,0,1):1-clamp(age/1600,0,1)):0.5;
      var H2=big?44:36;
      c=piece(kind+(on?cf.s:"x"),14,H2,function(r,ln,disc){var by0=H2-16;disc(7,by0+3,5,"#B8501E");disc(7,by0+10,6,"#B8501E");r(2,by0+3,10,8,"#B8501E");r(4,by0+5,1,3,"#2a1010");r(9,by0+5,1,3,"#2a1010");
        r(6,4,2,by0,"#2a1810");r(5,0,4,5,"#5a3220");r(6.5,by0+15,1,1,"#888");for(var s=0;s<4;s++)r(5.2+s*0.9,4,1,by0+8,on&&s===cf.s?"#F5D03C":"#D8D0C0");});
      /* the cello stands between your knees, leaning back past your left shoulder, so you're seen behind it */
      var cA=[x+(big?9:1)*p,y+(big?17:15)*p],crot=big?0:0.2;
      front=function(){blit(g,c,cA[0],cA[1],p,7,H2,crot);
        if(big){var bx=cA[0]-(4-6*bw2)*p,by=cA[1]-13*p;if(on){g.strokeStyle="#D8D0C0";g.lineWidth=Math.max(1,p*0.6);g.beginPath();g.moveTo(bx-10*p,by+1*p);g.lineTo(bx+10*p,by-1*p);g.stroke();}}
        else{var bc=at(cA[0],cA[1],p,7,H2,crot,7,H2-12),bo=(-8+16*bw2)*p;g.strokeStyle="#D8D0C0";g.lineWidth=Math.max(1,p*0.6);g.beginPath();g.moveTo(bc[0]+bo-10*p,bc[1]+1*p);g.lineTo(bc[0]+bo+10*p,bc[1]-1*p);g.stroke();}};
      var fy=cA[1]-(H2-2-cf.pos*(H2-18)*1.4)*p,bowH=big?[cA[0]-(10-6*bw2)*p,cA[1]-12*p]:[cA[0]+(-8+16*bw2)*p-7*p,cA[1]-12*p+1*p];
      if(big){fy=y-11*p+bob+clamp(cf.pos/0.55,0,1)*10*p;arms(bowH,[cA[0]-1*p,fy+(on?Math.sin(now*0.03)*0.4*p:0)]);}   /* the bass is taller than you: the fretting hand stays between your shoulder and the body */
      else{var ny=clamp(2+cf.pos*(H2-18)*1.4,4,H2-17),fh=at(cA[0],cA[1],p,7,H2,crot,6,ny),bc2=at(cA[0],cA[1],p,7,H2,crot,7,H2-12);
        arms([bc2[0]+(-8+16*bw2)*p-6*p,bc2[1]+1*p],[fh[0],fh[1]+(on?Math.sin(now*0.03)*0.4*p:0)]);}
      fx=function(){if(on)waves(g,cA[0],cA[1]-10*p,p,big?0:Math.PI,0.55,"rgba(184,80,30,.7)");};
      break;}

    /* ---------- harp: both hands pluck the string for the note, which shimmers ---------- */
    case "harp":{
      var hs=Math.round(nrm(m,36,96)*13);
      c=piece("harp"+(on?hs:"x"),20,36,function(r,ln){ln(1,35,1,4,"#C8963C");ln(2,35,2,4,"#C8963C");ln(1,4,18,0,"#C8963C");ln(1,5,18,1,"#C8963C");ln(3,35,19,2,"#8a5a2a");ln(4,35,19,3,"#8a5a2a");r(0,34,8,2,"#8a5a2a");
        for(var s=0;s<14;s++){var sx=3+s*1.15,top=4-s*0.25,bot=35-s*2.3;r(sx,top+1,1,bot-top-1,on&&s===hs?"#F5D03C":s%7===0?"#E8505B":"#EDEDF5");}});
      var hA=[x-7*p,y+12*p];front=function(){blit(g,c,hA[0],hA[1],p,10,36,0);};
      var sx2=hA[0]+(-7+hs*1.15)*p,mid=hA[1]-(22-hs*0.9)*p,pl=on?Math.sin(clamp(age/160,0,1)*Math.PI)*2*p:0;
      arms([sx2-2*p+pl,mid],[sx2+3*p-pl,mid+5*p]);
      fx=function(){if(on)waves(g,sx2,mid-4*p,p,-Math.PI/2,Math.max(0.3,1-age/1200),"rgba(245,208,60,.8)");};
      break;}

    /* ---------- brass: lips on the mouthpiece, cheeks out, fingers on the valves, sound from the bell ---------- */
    case "trumpet":case "horn":case "tuba":case "trombone":{
      var vl=on?TRUMPET[((m%12)+12)%12]:0,mouth=[x,y-8*p+bob];pose.mouth=false;
      if(kind==="trumpet"){
        /* held level from the lips, bell out to the side: both hands under the valve casing, the left one wrapping it,
           the right one's fingertips on the valve tops (pressed ones sit lower) */
        c=piece("tpt"+vl,23,8,function(r){r(0,3,2,1,"#C8C8D8");r(2,3,6,1,"#F5C518");r(4,5,4,1,"#E0A810");r(3,4,1,2,"#E0A810");
          r(7,2,6,5,"#E0A810");r(7,2,6,1,"#F5D03C");
          for(var v=0;v<3;v++){var dn=vl&(1<<v);r(8+v*2,dn?1:0,1,dn?1:2,"#F5E8A0");r(8+v*2,2,1,5,"#C89810");}
          r(13,3,4,2,"#F5C518");r(13,5,3,1,"#E0A810");r(17,2,2,4,"#F5C518");r(19,0,4,8,"#F5D03C");r(21,1,2,6,"#C89810");});
        var mo2=[x,y-8.5*p+bob],tr=0.05-atk*0.05;front=function(){blit(g,c,mo2[0],mo2[1],p,0,3,tr);};
        var vt=at(mo2[0],mo2[1],p,0,3,tr,11,7.5),lp=at(mo2[0],mo2[1],p,0,3,tr,7,8);arms(lp,vt);behind=true;
        after=function(){for(var v=0;v<3;v++){var dn=vl&(1<<v),f=at(mo2[0],mo2[1],p,0,3,tr,8+v*2,dn?0:-1);g.fillStyle="#120D1E";g.fillRect(Math.round(f[0]-p*0.5)-1,Math.round(f[1])-1,Math.round(p)+2,Math.round(p)+2);g.fillStyle=skin;g.fillRect(Math.round(f[0]-p*0.5),Math.round(f[1]),Math.round(p),Math.round(p));}};
        fx=function(){var bl=at(mo2[0],mo2[1],p,0,3,tr,24,4);if(on)waves(g,bl[0],bl[1],p,tr,Math.max(0.4,1-age/900),"rgba(245,197,24,.85)");};
      }else if(kind==="trombone"){
        var slide=on?Math.round((6-((m-40)%7+7)%7)*2.2):2;
        c=piece("tbn"+slide,34+slide,9,function(r){r(0,3,3,1,"#C8C8D8");r(3,2,13,1,"#F5C518");r(3,5,13,1,"#F5C518");r(14,0,1,8,"#E0A810");r(14,2,3+slide,1,"#C89810");r(14,5,3+slide,1,"#C89810");r(16+slide,2,14,1,"#F5D03C");r(16+slide,5,14,1,"#F5D03C");r(29+slide,2,2,4,"#F5D03C");r(14,2,2,4,"#E0A810");
          r(4,0,4,1,"#F5C518");r(0,0,4,9,"rgba(0,0,0,0)");r(5,6,5,3,"#F5D03C");r(3,7,3,2,"#F5D03C");});
        var tbr=0.12;front=function(){blit(g,c,mouth[0],mouth[1],p,0,3,tbr);};
        var sl=at(mouth[0],mouth[1],p,0,3,tbr,29+slide,4),hold=at(mouth[0],mouth[1],p,0,3,tbr,8,4);arms(hold,sl);
        fx=function(){var bl=at(mouth[0],mouth[1],p,0,3,tbr,7,8);if(on)waves(g,bl[0],bl[1]+3*p,p,Math.PI*0.6,Math.max(0.4,1-age/900),"rgba(245,197,24,.85)");};
      }else if(kind==="horn"){
        c=piece("horn"+vl,20,18,function(r,ln,disc){disc(10,9,7,"#F5C518");disc(10,9,5,"rgba(0,0,0,0)");for(var yy=-5;yy<=5;yy++)for(var xx=-5;xx<=5;xx++)if(xx*xx+yy*yy<=20)r(10+xx,9+yy,1,1,"#2a2440");disc(10,9,3,"#E0A810");
          r(1,12,5,6,"#F5D03C");r(0,14,2,4,"#C89810");for(var v=0;v<3;v++)r(11+v*2,2,1,3,vl&(1<<v)?"#F5E8A0":"#C89810");r(10,0,1,3,"#C8C8D8");});
        var hA2=[x+0*p,y-1*p+bob];front=function(){blit(g,c,hA2[0],hA2[1],p,10,9,0);};
        arms([hA2[0]-6*p,hA2[1]+5*p],[hA2[0]+3*p,hA2[1]-6*p+(vl?p:0)]);
        fx=function(){if(on)waves(g,hA2[0]-10*p,hA2[1]+8*p,p,Math.PI*0.85,Math.max(0.4,1-age/900),"rgba(245,197,24,.85)");};
      }else{
        /* held on your left (stage right), resting on the hip: the bell rises past your shoulder, the lead pipe
           comes over to your lips, the right hand's fingers on the valves */
        c=piece("tuba"+vl,15,28,function(r,ln,disc){r(4,6,7,16,"#F5C518");r(4,6,1,16,"#F5D03C");r(10,6,1,16,"#C89810");disc(7.5,22,5,"#E0A810");r(3,21,9,4,"#F5C518");
          r(1,0,13,4,"#F5D03C");r(1,3,13,1,"#C89810");r(3,4,9,2,"#F5C518");r(5,1,5,2,"#8a6a10");
          r(0,10,4,8,"#E0A810");for(var v=0;v<3;v++)r(0,11+v*2,2,1,vl&(1<<v)?"#F5E8A0":"#8a6a10");});
        var tA=[x+9*p,y-1*p+bob],lead=at(tA[0],tA[1],p,7,14,0,1,9);
        front=function(){g.strokeStyle="#E0A810";g.lineWidth=Math.max(2,p*1.1);g.beginPath();g.moveTo(lead[0],lead[1]);g.quadraticCurveTo(x+4*p,y-12*p+bob,x+1.5*p,y-8*p+bob);g.stroke();
          g.fillStyle="#C8C8D8";g.fillRect(Math.round(x+0.5*p),Math.round(y-8.5*p+bob),Math.round(1.5*p),Math.round(p));blit(g,c,tA[0],tA[1],p,7,14,0);};
        arms([tA[0]-6*p,tA[1]+8*p],at(tA[0],tA[1],p,7,14,0,1,13+(vl?1:0)));
        fx=function(){if(on)waves(g,tA[0],tA[1]-16*p,p,-Math.PI/2,Math.max(0.4,1-age/900),"rgba(245,197,24,.85)");};
      }
      break;}

    /* ---------- woodwinds: fingers close holes (more for lower notes), breath puffs ---------- */
    case "sax":case "clarinet":case "bassoon":case "flute":case "panflute":case "ocarina":case "harmonica":case "bagpipe":case "bottle":{
      var cl=CLOSED[((m%12)+12)%12],oct=m>=72,mo=[x,y-8*p+bob];pose.mouth=false;
      if(kind==="flute"){
        c=piece("flute"+(on?cl:"x"),30,3,function(r){r(0,0,30,2,"#D8D8E8");r(0,0,30,1,"#F5F5FF");r(2,0,2,1,"#15121F");for(var hh=0;hh<6;hh++)r(10+hh*3,0,2,1,on&&hh<cl?"#5a5670":"#15121F");});
        var fr=-0.06;front=function(){blit(g,c,mo[0]-3*p,mo[1]+1*p,p,3,1,fr);};
        arms(at(mo[0]-3*p,mo[1]+1*p,p,3,1,fr,12,3),at(mo[0]-3*p,mo[1]+1*p,p,3,1,fr,22,3));behind=true;      /* hands under the flute, fingertips on the holes they cover */
        after=function(){for(var hh=0;hh<6;hh++){if(!(on&&hh<cl)&&hh!==0&&hh!==3)continue;var f=at(mo[0]-3*p,mo[1]+1*p,p,3,1,fr,10.5+hh*3,-1);g.fillStyle="#120D1E";g.fillRect(Math.round(f[0]-p*0.5)-1,Math.round(f[1])-1,Math.round(p)+2,Math.round(p)+2);g.fillStyle=skin;g.fillRect(Math.round(f[0]-p*0.5),Math.round(f[1]),Math.round(p),Math.round(p));}};
        fx=function(){if(on){g.fillStyle="rgba(255,255,255,.6)";for(var i=0;i<3;i++){var ph=((now/300)+i/3)%1;g.fillRect(Math.round(mo[0]-(5+ph*6)*p),Math.round(mo[1]-ph*4*p),p,p);}}};
      }else if(kind==="panflute"){
        var tube=Math.round(nrm(m,55,91)*8);
        c=piece("pan",20,12,function(r){for(var i=0;i<9;i++)r(i*2,0,2,12-i,i%2?"#C8963C":"#D8A850");r(0,5,18,1,"#8a5a2a");});
        var px2=mo[0]-(tube*2+1)*p;front=function(){blit(g,c,px2,mo[1]+1*p,p,0,0,0);};
        arms([px2-1*p,mo[1]+5*p],[px2+18*p,mo[1]+3*p]);
        fx=function(){if(on){g.fillStyle="rgba(255,255,255,.6)";var ph=(now/300)%1;g.fillRect(Math.round(mo[0]),Math.round(mo[1]-ph*5*p),p,p);}};
      }else if(kind==="ocarina"||kind==="harmonica"){
        var hx=kind==="harmonica"?(nrm(m,55,91)-0.5)*8*p:0;
        c=piece(kind+(on?cl:"x"),kind==="harmonica"?12:10,kind==="harmonica"?3:7,function(r,ln,disc){if(kind==="harmonica"){r(0,0,12,3,"#C8C8D8");r(0,1,12,1,"#5a5670");for(var i=0;i<6;i++)r(1+i*2,1,1,1,"#15121F");}else{disc(5,3,3,"#4A9BE8");r(1,2,8,3,"#4A9BE8");r(8,1,2,2,"#4A9BE8");for(var hh=0;hh<4;hh++)r(2+hh*1.5,2,1,1,on&&hh<cl*0.7?"#2a5aa0":"#15121F");}});
        var oy=mo[1]+(kind==="harmonica"?0:1)*p;front=function(){blit(g,c,mo[0]-hx,oy,p,kind==="harmonica"?6:5,1,0);};
        arms([mo[0]-hx-4*p,oy+2*p],[mo[0]-hx+4*p,oy+2*p]);
        fx=function(){if(on)waves(g,mo[0]-hx,oy-1*p,p,-Math.PI/2,0.5,"rgba(160,210,255,.7)");};
      }else if(kind==="bagpipe"){
        var sq=on?1+Math.sin(t*3)*0.12:0.94;
        c=piece("bag"+Math.round(sq*10),20,30,function(r,ln,disc){disc(8,16,Math.round(4.5*sq),"#6a2a6a");disc(9,16,Math.round(3*sq),"#8a3a8a");for(var d=0;d<3;d++)ln(6+d*3,12,2+d*4,0,"#3a2010");r(1+0*4,0,2,2,"#EDEDF5");r(5,0,2,2,"#EDEDF5");r(9,0,2,2,"#EDEDF5");ln(12,14,15,29,"#3a2010");ln(13,14,16,29,"#3a2010");});
        var bA=[x-2*p,y-2*p+bob];front=function(){blit(g,c,bA[0],bA[1],p,10,16,0);};
        arms([bA[0]-2*p,bA[1]+4*p],[bA[0]+5*p+cl*0.3*p,bA[1]+(6+cl)*p]);
        fx=function(){if(on)waves(g,bA[0]-10*p,bA[1]-17*p,p,-Math.PI/2,0.5,"rgba(200,160,255,.7)");};
      }else if(kind==="bassoon"){
        /* bassoon: the long body crosses you diagonally, boot at your right hip, bell up past your left shoulder;
           the thin silver bocal curves from the body to your lips; one hand low on the boot, the other high on the wing */
        var bH=46,BK="#15121F",BK2="#2e2a40",SV="#DCDCEA",SV2="#9a98b0";   /* black wood, silver keys, a white cap on the bell */
        c=piece("bsn2"+(on?cl+(oct?"o":""):"x"),6,bH,function(r){
          r(1,0,3,2,"#F4F1FF");r(1,1,3,1,"#C9CEE0");                                       /* the cap */
          r(1,2,3,bH-8,BK);r(1,2,1,bH-8,BK2);                                              /* the long joint, slim */
          r(3,10,2,bH-17,BK);r(4,10,1,bH-17,BK2);                                          /* the wing joint alongside */
          r(0,bH-7,5,7,BK);r(0,bH-7,1,7,BK2);r(0,bH-1,5,1,SV2);                            /* the boot */
          r(1,12,3,1,SV);r(1,24,3,1,SV);r(0,bH-8,5,1,SV);r(3,10,2,1,SV);                   /* silver rings */
          r(2,5,1,1,SV);r(4,14,1,6,SV2);r(4,22,1,5,SV2);r(1,bH-5,1,3,SV2);r(3,bH-4,2,1,SV);  /* rods and keys */
          for(var hh=0;hh<6;hh++)r(2,16+hh*3.5,1,1,on&&hh<cl?SV2:SV);if(oct)r(4,11,1,1,"#F5E8A0");});
        var bA=[x-4*p,y+10*p+bob],brot=0.42,boc=at(bA[0],bA[1],p,3,bH,brot,4,bH-24);
        front=function(){blit(g,c,bA[0],bA[1],p,3,bH,brot);
          g.strokeStyle=SV;g.lineWidth=Math.max(1,p*0.6);g.beginPath();g.moveTo(boc[0],boc[1]);g.quadraticCurveTo(x+6*p,y-12*p+bob,x+1*p,y-8*p+bob);g.stroke();
          g.fillStyle="#C8A060";g.fillRect(Math.round(x),Math.round(y-8.5*p+bob),Math.max(1,Math.round(p)),Math.max(1,Math.round(p)));};
        arms(at(bA[0],bA[1],p,3,bH,brot,2,bH-12+(on?cl*0.3:0)),at(bA[0],bA[1],p,3,bH,brot,2,bH-31));
        fx=function(){var bl=at(bA[0],bA[1],p,3,bH,brot,2,0);if(on)waves(g,bl[0],bl[1]-2*p,p,-Math.PI/2+brot,Math.max(0.35,1-age/900),"rgba(200,200,230,.7)");};
      }else if(kind==="bottle"){
        /* blown bottle: held under the lips, blowing across the top; the air in it shimmers with the note */
        var lvl=Math.round(nrm(m,55,91)*6);
        c=piece("bottle"+lvl,6,14,function(r){r(2,0,2,1,"#9fd8b0");r(2,1,2,4,"#5aa870");r(1,4,4,1,"#5aa870");r(0,5,6,9,"#4a9860");r(0,5,1,9,"#7ac890");r(5,5,1,9,"#2a6840");
          r(1,6+lvl,4,7-lvl,"rgba(160,220,255,.75)");r(1,13,4,1,"#2a6840");});
        var btA=[x+1*p,y-7*p+bob];front=function(){blit(g,c,btA[0],btA[1],p,3,0,0);};
        arms([btA[0]-1*p,btA[1]+12*p],[x+7*p,y+2*p+bob]);
        fx=function(){if(on){g.strokeStyle="rgba(255,255,255,.7)";g.lineWidth=Math.max(1,p*0.5);for(var w=0;w<2;w++){var ph=((now/260)+w/2)%1;g.globalAlpha=1-ph;g.beginPath();g.moveTo(btA[0]-(1+ph*5)*p,btA[1]-(1+w)*p);g.lineTo(btA[0]-(3+ph*5)*p,btA[1]-(1+w)*p);g.stroke();}g.globalAlpha=1;}};
      }else{
        /* sax, clarinet (oboe, recorder): a pipe down from the mouth, hands one above the other */
        var Lp=kind==="bassoon"?30:kind==="sax"?22:20,col=kind==="sax"?"#F5C518":kind==="bassoon"?"#15121F":"#2A2238",keyC=kind==="sax"?"#F5E8A0":"#C8C8D8";
        c=piece(kind+(on?cl+(oct?"o":""):"x"),kind==="sax"?12:5,Lp,function(r,ln,disc){
          if(kind==="sax"){r(1,0,2,4,"#2A2238");r(1,3,3,14,col);r(2,15,4,3,col);r(4,13,4,5,col);r(6,9,5,6,col);r(7,9,4,1,"#E0A810");for(var hh=0;hh<6;hh++)r(3,5+hh*1.7,2,1,on&&hh<cl?"#C89810":keyC);if(oct)r(0,3,1,1,"#F5E8A0");}
          else{r(1,0,2,Lp-3,col);r(0,Lp-4,4,4,col);if(kind==="bassoon"){r(1,0,3,Lp-2,col);r(3,2,2,1,"#C8C8D8");}for(var hh2=0;hh2<6;hh2++)r(1.5,4+hh2*(Lp-9)/6,1,1,on&&hh2<cl?"#5a5670":keyC);}
        });
        var wr=kind==="sax"?0.15:kind==="bassoon"?0.5:0.35,wA=kind==="bassoon"?[x+6*p,y-4*p+bob]:[mo[0],mo[1]+1*p],ax2=kind==="sax"?2:2,ay2=kind==="bassoon"?Lp*0.45:0;
        front=function(){blit(g,c,wA[0],wA[1],p,ax2,ay2,wr);};
        arms(at(wA[0],wA[1],p,ax2,ay2,wr,2,Lp*(kind==="sax"?0.3:0.35)+(on?cl*0.2:0)),at(wA[0],wA[1],p,ax2,ay2,wr,2,Lp*(kind==="sax"?0.55:0.7)));
        var tmp=pose.armL;pose.armL=pose.armR;pose.armR=tmp;var th=hands[0];hands[0]=hands[1];hands[1]=th;     /* upper hand from the far side */
        pose.armL=aim(J[0],hands[0]);pose.armR=aim(J[1],hands[1]);hands=[handAt(J[0],pose.armL,p),handAt(J[1],pose.armR,p)];
        fx=function(){var bl=at(wA[0],wA[1],p,ax2,ay2,wr,kind==="sax"?9:2,kind==="sax"?9:Lp);if(on)waves(g,bl[0],bl[1],p,kind==="sax"?-Math.PI/3:Math.PI/2,Math.max(0.35,1-age/900),kind==="sax"?"rgba(245,197,24,.8)":"rgba(200,200,230,.7)");};
      }
      break;}

    /* ---------- mallets: the mallet goes to the bar for the note and strikes it ---------- */
    case "mallets":case "glock":case "steeldrum":case "drum":case "timpani":case "bells":case "glasses":{
      var nb=kind==="glock"?12:14,bar=Math.round(nrm(m,48,96)*(nb-1)),hitK=on?Math.max(0,1-age/120):0,sideR=bar>=nb/2;
      var my=y+6*p,mw=nb*3+2;
      if(kind==="mallets"||kind==="glock"){
        var BAR=kind==="glock"?["#E8E8F5"]:["#C8501E","#D8602E","#B84A1E"];
        c=piece(kind+(on?bar:"x"),mw,10,function(r){for(var b=0;b<nb;b++){var hh=10-Math.round(b*4/nb);r(1+b*3,(10-hh)/2,2,hh,on&&b===bar?"#F5D03C":BAR[b%BAR.length]);}r(0,2,mw,1,"#3a2a50");r(0,7,mw,1,"#3a2a50");});
        front=function(){blit(g,c,x,my,p,mw/2,0,0);g.fillStyle="#4d4170";g.fillRect(Math.round(x-(mw/2-1)*p),Math.round(my+10*p),p,8*p);g.fillRect(Math.round(x+(mw/2-2)*p),Math.round(my+10*p),p,8*p);};
        var bx2=x+(-mw/2+2+bar*3)*p,strike=[bx2,my+(3-hitK*-1-(on?0:3))*p-(1-hitK)*(on?2:0)*p],rest=[x+(sideR?-8:8)*p,my-1*p];
        if(sideR)arms(rest,strike);else arms(strike,rest);
      }else if(kind==="steeldrum"){
        c=piece("steel"+(on?bar%8:"x"),24,8,function(r,ln,disc){r(1,0,22,8,"#C8C8D8");r(0,1,24,6,"#D8D8E8");for(var i=0;i<8;i++){var a=i/8*6.283;r(11+Math.cos(a)*7,3.5+Math.sin(a)*2.2,2,1,on&&i===bar%8?"#F5D03C":"#8a8aa0");}r(11,3,2,1,"#8a8aa0");});
        var sa=(bar%8)/8*6.283,sp2=[x+(Math.cos(sa)*7)*p,my+(3.5+Math.sin(sa)*2.2)*p-(1-hitK)*(on?2:0)*p];
        front=function(){blit(g,c,x,my,p,12,0,0);};arms(sp2[0]<x?sp2:[x-6*p,my-1*p],sp2[0]>=x?sp2:[x+6*p,my-1*p]);
      }else if(kind==="drum"||kind==="timpani"){
        var tim=kind==="timpani",hitL=(st.n||0)%2===0;
        c=piece(kind,tim?22:18,tim?14:16,function(r,ln,disc){if(tim){for(var yy=0;yy<12;yy++)r(1+yy*0.6,2+yy,20-yy*1.2,1,"#C87a30");r(0,0,22,3,"#E8E0D0");r(0,2,22,1,"#8a8aa0");}else{r(0,2,18,12,"#B83A44");r(0,0,18,3,"#E8E0D0");for(var i=0;i<4;i++)ln(i*5,3,i*5+3,13,"#E8C858");r(0,13,18,2,"#8a1e3c");}});
        var dW=tim?22:18;front=function(){blit(g,c,x,my,p,dW/2,0,0);};
        var up=on?(1-hitK):1,sL=[x-4*p,my+(1-(hitL?1-up:1)*3)*p-(hitL?0:3)*p],sR=[x+4*p,my+(1-(!hitL?1-up:1)*3)*p-(!hitL?0:3)*p];
        if(!on){sL=[x-5*p,my-3*p];sR=[x+5*p,my-3*p];}arms(sL,sR);
        fx=function(){if(on&&age<300){g.strokeStyle="rgba(255,240,200,"+(1-age/300)+")";g.lineWidth=Math.max(1,p/2);g.beginPath();g.ellipse(x,my+1*p,(4+age/30)*p,(1+age/120)*p,0,0,6.3);g.stroke();}};
      }else if(kind==="bells"){
        c=piece("tubes"+(on?bar%8:"x"),26,30,function(r){r(0,0,26,2,"#5a3220");r(1,0,2,30,"#5a3220");r(23,0,2,30,"#5a3220");for(var i=0;i<8;i++){var hh=26-i*2;r(4+i*2.4,2,2,hh,on&&i===bar%8?"#F5D03C":"#D8D8E8");}});
        var tA3=[x-14*p,y+12*p];front=function(){blit(g,c,tA3[0],tA3[1],p,13,30,0);};
        var tb=bar%8,tx=tA3[0]+(-9+tb*2.4)*p,ty=tA3[1]-(22-tb)*p;arms([tx+2*p-(on?hitK:0)*2*p,ty],[x+5*p,y+2*p]);
      }else{
        c=piece("glasses"+(on?bar%6:"x"),30,9,function(r){r(0,7,30,2,"#5a3220");for(var i=0;i<6;i++){var lv=2+i;r(1+i*5,1,3,6,"rgba(200,230,255,.55)");r(1+i*5,7-lv*0.7,3,lv*0.7,"rgba(120,180,255,.8)");r(2+i*5,6,1,1,"#C8C8D8");if(on&&i===bar%6)r(1+i*5,0,3,1,"#F5D03C");}});
        front=function(){blit(g,c,x,my,p,15,0,0);};
        var gi=bar%6,gx=x+(-13+gi*5)*p+Math.cos(t*8)*on*1.2*p;arms(gi<3?[gx,my]:[x-8*p,my+3*p],gi>=3?[gx,my]:[x+8*p,my+3*p]);
      }
      fx=fx||function(){if(on&&age<500)waves(g,x,my-2*p,p,-Math.PI/2,1-age/500,"rgba(245,208,60,.8)");};
      break;}

    /* ---------- kalimba and music box, held in both hands ---------- */
    case "kalimba":case "musicbox":{
      if(kind==="kalimba"){var tine=Math.round(nrm(m,48,96)*8);
        c=piece("kal"+(on?tine:"x"),14,12,function(r,ln,disc){r(0,2,14,10,"#C8963C");r(0,2,14,1,"#E8B868");disc(7,8,2,"#3a2010");for(var i=0;i<9;i++){var hh=6-Math.abs(i-4);r(1+i*1.4,0,1,hh,on&&i===tine?"#F5D03C":"#C8C8D8");}});
        var kA=[x,y-1*p+bob];front=function(){blit(g,c,kA[0],kA[1],p,7,6,0);};
        var th2=[kA[0]+(-6+tine*1.4)*p,kA[1]-4*p+(on?atk:0)*p];arms(tine<4?th2:[kA[0]-6*p,kA[1]+2*p],tine>=4?th2:[kA[0]+6*p,kA[1]+2*p]);
      }else{var crank=on?t*6:0;
        c=piece("mbox"+Math.round((crank%6.283)*2),14,10,function(r){r(0,1,14,9,"#8a3a5a");r(0,1,14,2,"#B85a7a");r(2,4,10,4,"#5a2a3a");r(3,5,8,1,"#F5D03C");var cx=13+Math.round(Math.cos(crank)*2),cy=4+Math.round(Math.sin(crank)*2);r(13,4,1,1,"#C8C8D8");r(cx,cy,1,1,"#C8C8D8");});
        var mA=[x,y-1*p+bob];front=function(){blit(g,c,mA[0],mA[1],p,7,5,0);};
        arms([mA[0]-6*p,mA[1]+3*p],[mA[0]+(7+Math.cos(crank)*2)*p,mA[1]+(-1+Math.sin(crank)*2)*p]);}
      fx=function(){if(on)waves(g,x,y-8*p+bob,p,-Math.PI/2,Math.max(0.3,1-age/800),"rgba(245,208,60,.8)");};
      break;}

    /* ---------- koto, dulcimer, psaltery: a long board in front, the hand plucks the string for the note ---------- */
    case "zither":{
      var zs=Math.round(nrm(m,48,96)*12);
      c=piece("zither"+(on?zs:"x"),40,8,function(r){r(0,1,40,6,"#8a5a2a");r(0,1,40,1,"#C8963C");for(var s=0;s<13;s++)r(2,1.5+s*0.4,36,1,"rgba(0,0,0,0)");for(s=0;s<13;s++)r(3+s*2.7,2,1,4,on&&s===zs?"#F5D03C":"#EDEDF5");});
      var zy=y+6*p;front=function(){blit(g,c,x,zy,p,20,0,0);g.fillStyle="#4d4170";g.fillRect(Math.round(x-18*p),Math.round(zy+8*p),p,9*p);g.fillRect(Math.round(x+17*p),Math.round(zy+8*p),p,9*p);};
      var zx=x+(-17+zs*2.7)*p,pk=on?Math.sin(clamp(age/150,0,1)*Math.PI)*1.5*p:0;arms(zs<6?[zx+pk,zy+2*p]:[x-8*p,zy+3*p],zs>=6?[zx-pk,zy+2*p]:[x+8*p,zy+3*p]);
      fx=function(){if(on)waves(g,zx,zy-2*p,p,-Math.PI/2,Math.max(0.3,1-age/900),"rgba(245,208,60,.8)");};
      break;}

    /* ---------- whistle: no instrument, just whistling: hands on the hips, lips puckered, a little head lift on high
       notes, and music notes drifting off from the lips ---------- */
    case "whistle":{
      var hiW=nrm(m,60,96),sway=Math.sin(t*2.2)*0.8*p,lift=on?-hiW*1.2*p:0;
      pose.bob=bob+lift;J=ART.joints(x,y,p,pose.bob);
      arms([x-8*p+sway,y+1*p+pose.bob],[x+8*p+sway,y+1*p+pose.bob]);
      var lip=[x,y-7.5*p+pose.bob];
      after=function(){
        /* puckered lips: a small pink ring with a dark centre (closed, relaxed lips between notes) */
        var r=function(ax,ay,ww,hh,cc){g.fillStyle=cc;g.fillRect(Math.round(lip[0]+ax*p),Math.round(lip[1]+ay*p),Math.ceil(ww*p),Math.ceil(hh*p));};
        if(on||now-st.off<250){r(-1.5,-1.5,3,3,"#C9566C");r(-0.5,-0.5,1,1,"#3a1418");}
      };
      fx=function(){
        if(!on&&now-st.off>900)return;
        g.save();g.textAlign="center";g.font="bold "+Math.round(6.5*p)+"px system-ui";
        /* a note pops off on each press, then one every 380 ms while held; higher notes fly higher */
        var held=on?now-st.t0:Math.max(0,st.off-st.t0),k=Math.floor(held/380)+1,since=on?0:now-st.off;
        for(var i=0;i<Math.min(k,4);i++){var a2=(now-st.t0-(k-1-i)*380)/900;if(a2<0||a2>1)continue;
          var nx=lip[0]+(4+a2*12)*p,ny=lip[1]-(1+a2*(5+hiW*10))*p+Math.sin(a2*6+i)*1.2*p;
          g.globalAlpha=Math.max(0,(1-a2))*(on?1:Math.max(0,1-since/900));
          g.fillStyle="hsl("+(((m%12)+12)%12)*30+",85%,72%)";g.fillText((st.n+i)%2?"\u266A":"\u266B",nx,ny);}
        /* a breath of air from the lips */
        if(on&&age<400){g.globalAlpha=1-age/400;g.strokeStyle="rgba(255,255,255,.7)";g.lineWidth=Math.max(1,p*0.5);
          for(var w=0;w<2;w++){g.beginPath();g.moveTo(lip[0]+(2+w*2)*p,lip[1]-w*p);g.lineTo(lip[0]+(4+w*2+age/80)*p,lip[1]-(w+0.5)*p);g.stroke();}}
        g.restore();
      };
      break;}
    /* ---------- choir: no mic, hands together in front, swaying, mouth open while singing ---------- */
    case "choir":{
      var sw3=Math.sin(t*1.6)*0.8*p,hiC=nrm(m,48,84);arms([x-1*p+sw3,y-(on?2+hiC*3:0)*p+bob],[x+1*p+sw3,y-(on?2+hiC*3:0)*p+bob]);
      pose.mouth=on;
      break;}
    /* ---------- voice: mic in hand, the free arm rises with the note, mouth open while singing ---------- */
    case "voice":{
      c=piece("mic",4,9,function(r){r(0,0,4,4,"#8a8aa0");r(1,1,1,1,"#C8C8D8");r(1,4,2,5,"#2A2238");});
      var micT=[x+1*p,y-7*p+bob];front=function(){blit(g,c,micT[0]+2*p,micT[1]-1*p,p,2,0,0.15);};
      var hiN=nrm(m,48,84);arms([x-(9+hiN*2)*p,y-(on?2+hiN*13:-3)*p+bob],[micT[0]+2*p,micT[1]+7*p]);
      pose.mouth=on;
      fx=function(){if(on){g.save();g.fillStyle="rgba(255,255,255,.8)";var ph=(now/700)%1;g.globalAlpha=1-ph;g.font="bold "+Math.round(5*p)+"px system-ui";g.textAlign="center";g.fillText(ph<0.5?"\u266A":"\u266B",x-4*p-ph*4*p,y-22*p-ph*10*p);g.restore();}};
      break;}
    default:return draw(g,x,y,p,look,"synth",st);
    }
    if(back)back();
    ART.drawChar(g,x,y,p,L,pose);
    if(behind)hands.forEach(function(h){hand(g,h,p,skin);});        /* hands under the instrument (a trumpet) */
    if(front)front();
    if(!behind)hands.forEach(function(h){hand(g,h,p,skin);});
    if(after)after();
    if(fx)fx();
    return {hands:hands,top:y-19*p+bob};
  }
  /* ---- sections: a choir, a string section, an orchestra, a brass section. The players who join you on stage,
     by what they play; null for a solo instrument ---- */
  var SECTIONS=[
    [/choir|aahs|oohs|vocal.?ensemble|voices/,["choir","choir","choir","choir"]],
    [/strings?.?\+.?brass/,["violin","trumpet","cello","trombone"]],
    [/orchestra(?!l.?harp)/,["violin","cello","trumpet","timpani"]],
    [/brass.?section|brass.?ensemble|synth.?brass|\bbrass\b/,["trumpet","trombone","horn","sax"]],
    [/string.?ensemble|string.?section|synth.?strings|\bstrings\b|violins\b|ensemble/,["violin","cello","violin","contrabass"]]
  ];
  function section(id,label){var s=(String(id||"")+" "+String(label||"")).toLowerCase();for(var i=0;i<SECTIONS.length;i++)if(SECTIONS[i][0].test(s))return SECTIONS[i][1];return null;}
  /* the section players, behind and either side of you; each plays along a moment apart, in their own look */
  /* half = how far either side of you there's room (screen px); the back row stands a little smaller, for depth */
  function drawBand(g,x,y,p,kinds,st,half){
    if(!kinds)return;st=st||{};half=half||60*p;
    var s1=Math.min(28*p,half*0.42),s2=Math.min(54*p,half*0.84),X=[-s1,s1,-s2,s2],Y=[-3*p,-3*p,-7*p,-7*p],S=[0.92,0.92,0.82,0.82];
    for(var i=kinds.length-1;i>=0;i--){var lag=(i+1)*30,s2t={midi:st.midi,on:st.on,t0:(st.t0||0)+lag,off:(st.off||0)+lag,now:st.now,n:st.n};
      if(s2t.on&&(st.now||Date.now())<s2t.t0)s2t.on=false;
      draw(g,x+X[i],y+Y[i],p*S[i],ART.looks.random(101+i*17),kinds[i],s2t);}
  }
  ART.INST={section:section,drawBand:drawBand,kindOf:kindOf,draw:function(g,x,y,p,look,kind,st){return ART.withAdj("inst:"+kind,g,function(){var r=draw(g,x,y,p,look,kind,st);ART.paint.at(g,"inst:"+kind,x,y,p);return r;});},KINDS:KINDS,VERSION:"1.54.3"};
})();
