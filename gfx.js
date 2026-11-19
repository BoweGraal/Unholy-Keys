/* Unholy Keys graphics lab values: the numbers behind the stage lights and show effects, plus a colour grade.
   art.js reads them with GFX.v("key"). Changes are kept on this device (localStorage "uk_gfx") and shared as text. */
var GFX=(function(){
  function V(k,label,def,min,max,step,help,unit){return{k:k,label:label,def:def,min:min,max:max,step:step,help:help,unit:unit||""};}
  function C(k,label,def,help){return{k:k,label:label,def:def,type:"color",help:help};}
  var GROUPS=[
  {id:"lights",name:"Stage lights",icon:"💡",
   about:"The beams hanging from the truss, the speakers, the sign and the dance floor tiles. Beam brightness also grows with the beat and the music's loudness.",
   vars:[
    V("l.bright","Beam brightness",1,0,3,0.05,"Multiplies how bright the four hanging beams are.","×"),
    V("l.width","Beam width",14,2,40,1,"Half-width of each beam where it lands, in art pixels.","px"),
    V("l.speed","Beam sweep speed",1,0,4,0.05,"How fast the beams swing side to side.","×"),
    V("l.haze","Haze effect on beams",1.6,0,4,0.1,"How much the Fog setting makes beams show up.","×"),
    C("l.c1","Beam 1 colour","#F5D03C","Colour of the first beam in Auto mode."),
    C("l.c2","Beam 2 colour","#E8505B","Second beam, Auto mode."),
    C("l.c3","Beam 3 colour","#D354A0","Third beam, Auto mode."),
    C("l.c4","Beam 4 colour","#4A9BE8","Fourth beam, Auto mode."),
    V("l.followWash","Follow-the-notes wash",0.32,0,1,0.02,"Strength of the colour wash that climbs the back wall as the performer plays.",""),
    V("l.tiles","Dance floor glow",1,0,3,0.05,"Brightness of the floor tiles lighting up on the beat.","×"),
    V("l.sign","Sign glow",1,0,3,0.05,"Glow behind the UNHOLY KEYS sign.","×")]},
  {id:"fx",name:"Weather & air",icon:"🌫️",
   about:"Fog, rain, snow and darkness. Turn them on in the preview's effect row, then tune how strong they are.",
   vars:[
    V("f.fog","Fog density",0.16,0,0.6,0.01,"Opacity of each fog cloud at full Fog.",""),
    V("f.rain","Rain amount",1,0,3,0.1,"Number of raindrops.","×"),
    V("f.snow","Snow amount",1,0,3,0.1,"Number of snowflakes.","×"),
    V("f.dark","Darkness strength",0.88,0.2,1,0.02,"How black the room goes at full Darkness.",""),
    V("f.pool","Light pool size",1,0.3,3,0.05,"Size of the pools of light round the performer and dancers in darkness.","×")]},
  {id:"show",name:"Lasers, strobe & fireworks",icon:"🎆",
   about:"The big effects: lasers fanning over the crowd, strobe flashes, the EDM wash and fireworks.",
   vars:[
    V("f.laserN","Laser count",5,1,12,1,"Beams from each laser source.",""),
    V("f.laser","Laser brightness",1,0,2.5,0.05,"Multiplies laser opacity.","×"),
    V("f.laserW","Laser thickness",1,0.3,5,0.1,"Multiplies laser width.","×"),
    V("f.laserSpeed","Laser sweep speed",1,0,4,0.05,"How fast the lasers sweep.","×"),
    V("f.strobe","Strobe flash strength",0.5,0,1,0.02,"Brightness of each strobe flash.",""),
    V("f.strobeLen","Strobe flash length",0.08,0.02,0.5,0.01,"Share of the beat the flash lasts.","beat"),
    V("f.edmNight","EDM room darkness",0.5,0,0.95,0.02,"How dark the room goes under the EDM lights before the colour.",""),
    V("f.edmTint","EDM colour strength",0.55,0,1,0.02,"How strongly the cyan / magenta washes the room.",""),
    V("f.fwRate","Fireworks rate",1,0.2,5,0.1,"How often rockets launch in auto fireworks.","×"),
    V("f.sparkLife","Firework spark life",1300,400,3500,50,"How long sparks glow.","ms")]},
  {id:"neon",name:"Neon & disco ball",icon:"🪩",
   about:"Neon night traces the stage in glowing tubes. The disco ball hangs over the floor and throws sparkles round the room.",
   vars:[
    V("f.neonDark","Neon room darkness",0.86,0.3,1,0.02,"How black the room is in neon mode.",""),
    V("f.neonGlow","Neon glow",4,0,16,0.5,"Blur of the tube glow.","px"),
    V("f.neonWidth","Neon tube thickness",0.9,0.3,3,0.1,"Thickness of the tubes.","×"),
    V("f.discoSize","Disco ball size",0.045,0.02,0.12,0.002,"Radius as a fraction of the screen's shorter side.",""),
    V("f.discoGlow","Disco ball glow",0.45,0,1,0.02,"Halo round the ball.",""),
    V("f.discoSpots","Disco sparkle count",46,0,150,2,"Spots of light thrown round the room.","")]},
  {id:"grade",name:"Colour grade",icon:"🎨",
   about:"A filter over the whole picture, like a camera's colour controls. Brightness, contrast, saturation and hue shift the look of everything, including characters.",
   vars:[
    V("g.bright","Brightness",1,0.4,2,0.02,"1 is normal.","×"),
    V("g.contrast","Contrast",1,0.4,2,0.02,"1 is normal.","×"),
    V("g.sat","Saturation",1,0,2.5,0.02,"0 is black and white, 1 normal, 2 very vivid.","×"),
    V("g.hue","Hue shift",0,-180,180,1,"Rotates every colour round the wheel.","°"),
    V("g.sepia","Sepia",0,0,1,0.02,"Warm old-photo tint.",""),
    V("g.blur","Blur",0,0,4,0.1,"Softens the picture.","px")]}
  ];
  var DEF={},VALS={},BYK={},ls=[];
  GROUPS.forEach(function(g){g.vars.forEach(function(x){DEF[x.k]=x.def;BYK[x.k]=x;});});
  function ok(k,n){var d=BYK[k];if(!d)return null;if(d.type==="color")return /^#[0-9a-f]{6}$/i.test(n)?String(n).toLowerCase():null;n=+n;return isFinite(n)?Math.max(d.min,Math.min(d.max,n)):null;}
  try{var s=JSON.parse(localStorage.getItem("uk_gfx")||"{}");for(var k in s){var c=ok(k,s[k]);if(c!==null)VALS[k]=c;}}catch(e){}
  function save(){try{localStorage.setItem("uk_gfx",JSON.stringify(VALS));}catch(e){}}
  function fire(){ls.forEach(function(f){try{f();}catch(e){}});}
  function v(k){return VALS[k]!==undefined?VALS[k]:DEF[k];}
  function set(k,n){var c=ok(k,n);if(c===null)return;if(c===DEF[k])delete VALS[k];else VALS[k]=c;save();fire();}
  function reset(k){delete VALS[k];save();fire();}
  function resetGroup(id){GROUPS.forEach(function(g){if(g.id===id)g.vars.forEach(function(x){delete VALS[x.k];});});save();fire();}
  function resetAll(){VALS={};save();fire();}
  function changed(){var n=0;for(var k in VALS)n++;return n;}
  function exportText(extra){
    var out=["UNHOLY KEYS GRAPHICS"],n=0;
    GROUPS.forEach(function(g){var rows=g.vars.filter(function(x){return VALS[x.k]!==undefined;});if(!rows.length)return;
      out.push("","["+g.name+"]");rows.forEach(function(x){n++;out.push(x.k+" = "+VALS[x.k]+"   ("+x.label+"; default "+x.def+(x.unit?" "+x.unit:"")+")");});});
    if(extra)out.push("",extra);
    if(!n&&!extra)out.push("","(nothing changed)");
    out.push("","JSON: "+JSON.stringify(VALS));
    return out.join("\n");
  }
  function importText(t){
    var m=/JSON:\s*(\{[^\n]*\})/.exec(t||""),o=null,n=0;try{o=JSON.parse(m?m[1]:t);}catch(e){o=null;}
    if(!o){o={};String(t||"").split(/\n/).forEach(function(l){var q=/^\s*([a-z0-9.]+)\s*=\s*(#[0-9a-f]{6}|-?[0-9.]+)/i.exec(l);if(q)o[q[1]]=q[2];});}
    VALS={};for(var k in o){var c=ok(k,o[k]);if(c!==null&&c!==DEF[k]){VALS[k]=c;n++;}}
    save();fire();return n;
  }
  /* the CSS filter for the colour grade ("" when it's all normal) */
  function filter(){
    var b=v("g.bright"),c=v("g.contrast"),s=v("g.sat"),h=v("g.hue"),p=v("g.sepia"),bl=v("g.blur"),o=[];
    if(b!==1)o.push("brightness("+b+")");if(c!==1)o.push("contrast("+c+")");if(s!==1)o.push("saturate("+s+")");if(h)o.push("hue-rotate("+h+"deg)");if(p)o.push("sepia("+p+")");if(bl)o.push("blur("+bl+"px)");
    return o.join(" ");
  }
  return{v:v,set:set,reset:reset,resetGroup:resetGroup,resetAll:resetAll,groups:GROUPS,has:function(k){return VALS[k]!==undefined;},changed:changed,exportText:exportText,importText:importText,onChange:function(f){ls.push(f);},filter:filter,def:function(k){return DEF[k];}};
})();
