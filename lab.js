/* Tuning lab (venue.html?practice&lab): sliders for every movement, timing and scoring number in each minigame,
   with a short explainer, a Play button, and a share box to copy your settings or paste someone else's. */
(function(){
  /* only for the creator: opened from the performer's Setup menu (?practice&lab) or a Track builder test drive; plain Dance practice doesn't get it */
  if(typeof TUNE==="undefined"||!/[?&]practice\b/.test(location.search)||!/[?&](lab|kartTest|skiTest|ctfTest)\b/.test(location.search))return;
  var css=document.createElement("style");css.textContent=
  "#labBtn{position:fixed;top:8px;right:8px;z-index:9000;background:#2a1f4d;color:#fff;border:1px solid #7F77DD;border-radius:8px;padding:6px 10px;font:700 13px system-ui;cursor:pointer}"+
  "#gfxBtn{position:fixed;top:46px;right:8px;z-index:9000;background:#2a1f4d;color:#fff;border:1px solid #D354A0;border-radius:8px;padding:6px 10px;font:700 13px system-ui;text-decoration:none}"+
  "#trkBtn{position:fixed;top:84px;right:8px;z-index:9000;background:#2a1f4d;color:#fff;border:1px solid #D354A0;border-radius:8px;padding:6px 10px;font:700 13px system-ui;text-decoration:none}"+
  "#labBtn b{background:#D354A0;border-radius:9px;padding:0 6px;margin-left:5px;font-size:11px}"+
  "#lab{position:fixed;top:0;right:0;bottom:0;width:340px;max-width:100vw;z-index:9001;background:rgba(14,10,30,.97);color:#e8e4f8;font:13px system-ui;display:none;flex-direction:column;border-left:1px solid #4a3d8a}"+
  "#lab.on{display:flex}#lab *{box-sizing:border-box}"+
  "#lab .hd{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid #3a2f6a}#lab .hd b{flex:1;font-size:15px}"+
  "#lab button{background:#2d2360;color:#fff;border:1px solid #5a4cb0;border-radius:6px;padding:5px 9px;font:600 12px system-ui;cursor:pointer}"+
  "#lab button.go{background:linear-gradient(135deg,#D354A0,#7F77DD);border-color:transparent}"+
  "#labTabs{display:flex;flex-wrap:wrap;gap:4px;padding:8px 10px}#labTabs button.on{background:#7F77DD;border-color:#fff}"+
  "#labBody{flex:1;overflow:auto;padding:0 10px 10px}#labBody .about{background:#1d1640;border-radius:8px;padding:8px;margin:2px 0 8px;line-height:1.4;color:#cfc8f0}"+
  "#labBody .row{border-top:1px solid #2c2358;padding:7px 0}#labBody .row .t{display:flex;align-items:center;gap:6px}#labBody .row .t span{flex:1;font-weight:700}"+
  "#labBody .row.ch .t span{color:#F5C518}#labBody .row small{display:block;color:#9d95c8;margin:2px 0 4px;line-height:1.3}"+
  "#labBody .row .c{display:flex;align-items:center;gap:6px}#labBody input[type=range]{flex:1;min-width:0}#labBody input[type=number]{width:74px;background:#120d28;color:#fff;border:1px solid #4a3d8a;border-radius:5px;padding:3px}"+
  "#labBody .row .d{font-size:11px;color:#7f77a8;white-space:nowrap}"+
  "#labFoot{border-top:1px solid #3a2f6a;padding:8px 10px}#labFoot textarea{width:100%;height:84px;background:#120d28;color:#cfc8f0;border:1px solid #4a3d8a;border-radius:6px;font:11px ui-monospace,monospace;padding:5px}"+
  "#labFoot .r{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}"+
  "#labFoot textarea{display:none}#labFoot.open textarea{display:block}#labTabs{max-height:30vh;overflow:auto}"+
  "#labSearch{flex:1;min-width:0;background:#120d28;color:#fff;border:1px solid #5a4cb0;border-radius:6px;padding:5px 8px;font:600 13px system-ui}"+
  "#labTools{display:flex;flex-wrap:wrap;gap:4px;padding:6px 10px 0}#labTools a{background:#2a1f4d;color:#fff;border:1px solid #D354A0;border-radius:6px;padding:4px 8px;font:600 12px system-ui;text-decoration:none}"+
  "#labTabs .cat{width:100%;font:800 10px system-ui;letter-spacing:.8px;text-transform:uppercase;color:#F5C518;margin:4px 0 0}"+
  "#labBody.tbl .row{display:grid;grid-template-columns:minmax(90px,1.1fr) 2fr 70px 26px;align-items:center;gap:6px;padding:4px 0}#labBody.tbl .row small{display:none}#labBody.tbl .row .t,#labBody.tbl .row .c{display:contents}#labBody.tbl .row .d{display:none}#labBody.tbl .row .t span{font-size:12px}"+
  "#labBody .grp{font:800 11px system-ui;color:#F5C518;margin:10px 0 2px}"+
  "@media(max-width:700px){#lab{top:auto;height:60vh;width:100vw;border-left:0;border-top:1px solid #4a3d8a}#labTabs{flex-wrap:nowrap;overflow-x:auto;padding:6px 8px}#labTabs button{flex:none}#labBody .about{font-size:12px;padding:6px}#labFoot{padding:6px 8px}#labFoot>div:first-child{display:none}#labFoot textarea{display:none}#labFoot.open textarea{display:block}#labTxt{display:inline-block}}";
  document.head.appendChild(css);
  function mk(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
  var btn=mk("button","","🔧 Lab");btn.id="labBtn";document.body.appendChild(btn);
    var cnt=mk("b","",""),box=mk("div");box.id="lab";document.body.appendChild(box);btn.appendChild(cnt);
  var srch=null,cur=TUNE.groups[0].id,ta,body,tabs,q="",tbl=false;try{tbl=localStorage.getItem("uk_lab_tbl")==="1";}catch(e){}
  function group(){return TUNE.groups.filter(function(g){return g.id===cur;})[0]||TUNE.groups[0];}
  function fmt(n){return String(Math.round(n*100000)/100000);}
  function shareText(){if(ta&&document.activeElement!==ta)ta.value=TUNE.exportText();cnt.textContent=TUNE.changed()||"";cnt.style.display=TUNE.changed()?"inline":"none";}
  function rowFor(x){
    var row=mk("div","row"+(TUNE.has(x.k)?" ch":"")),t=mk("div","t"),sl=document.createElement("input"),nu=document.createElement("input");
    var lb=mk("span","",x.label);lb.title=x.help+" ("+x.k+")";t.appendChild(lb);var rs=mk("button","","↺");rs.title="back to "+x.def;rs.onclick=function(){TUNE.reset(x.k);render();};
    row.appendChild(t);row.appendChild(mk("small","",x.help));
    var c=mk("div","c");sl.type="range";sl.min=x.min;sl.max=x.max;sl.step=x.step;sl.value=TUNE.v(x.k);
    nu.type="number";nu.min=x.min;nu.max=x.max;nu.step=x.step;nu.value=fmt(TUNE.v(x.k));
    sl.oninput=function(){TUNE.set(x.k,+sl.value);nu.value=fmt(TUNE.v(x.k));row.className="row"+(TUNE.has(x.k)?" ch":"");};
    nu.onchange=function(){TUNE.set(x.k,+nu.value);sl.value=TUNE.v(x.k);nu.value=fmt(TUNE.v(x.k));row.className="row"+(TUNE.has(x.k)?" ch":"");};
    c.appendChild(sl);c.appendChild(nu);c.appendChild(mk("span","d","default "+fmt(x.def)+(x.unit?" "+x.unit:"")));row.appendChild(c);
    if(tbl)row.appendChild(rs);else t.appendChild(rs);return row;}
  function render(){
    var g=group();tabs.textContent="";body.className=tbl?"tbl":"";
    /* pick a game: grouped by kind, like the practice menu */
    ["Rhythm","Dance","Ride & race","Team"].forEach(function(cat){var gs=TUNE.groups.filter(function(x){return (x.cat||"Dance")===cat;});if(!gs.length)return;tabs.appendChild(mk("div","cat",cat));
      gs.forEach(function(x){var b=mk("button",x.id===cur&&!q?"on":"",x.icon+" "+x.name);b.onclick=function(){cur=x.id;q="";srch.value="";render();};tabs.appendChild(b);});});
    body.textContent="";
    if(q){   /* search: every variable whose name, help or key matches, under its game */
      var n=0,ql=q.toLowerCase();TUNE.groups.forEach(function(x){var vs=x.vars.filter(function(y){return (y.label+" "+y.help+" "+y.k+" "+x.name).toLowerCase().indexOf(ql)>=0;});if(!vs.length)return;
        var gh=mk("div","grp",x.icon+" "+x.name+"  ");var pb=mk("button","","▶ Play");pb.onclick=function(){play(x);};gh.appendChild(pb);body.appendChild(gh);vs.forEach(function(y){n++;body.appendChild(rowFor(y));});});
      if(!n)body.appendChild(mk("div","about","Nothing matches “"+q+"”."));shareText();return;}
    var ab=mk("div","about");ab.appendChild(mk("div","",g.about));
    var pl=mk("button","go","▶ Play "+g.name+" now");pl.style.marginTop="8px";pl.onclick=function(){play(g);};ab.appendChild(pl);
    if(g.id==="skate"){var ic=mk("button","","⛸ Ice instead");ic.style.cssText="margin:8px 0 0 6px";ic.onclick=function(){play(g,"ice");};ab.appendChild(ic);}
    var rg=mk("button","","Reset this game");rg.style.cssText="margin:8px 0 0 6px";rg.onclick=function(){TUNE.resetGroup(g.id);render();};ab.appendChild(rg);
    body.appendChild(ab);
    g.vars.forEach(function(x){body.appendChild(rowFor(x));});
    shareText();
  }
  function $(id){return document.getElementById(id);}
  /* start the game in practice with the first song if none is picked yet */
  function play(g,asMode){
    var m=asMode||g.mode,b=document.querySelector('#prGames button[data-m="'+m+'"]');
    if(g.id==="walk"){box.classList.remove("on");return;}
    if(b)b.click();var kd=$("prKind");if(kd){kd.value=g.id==="battle"?"battle":"";kd.dispatchEvent(new Event("change"));}
    var sel=$("prList");if(sel&&!sel.value){for(var i=0;i<sel.options.length;i++)if(sel.options[i].value){sel.value=sel.options[i].value;sel.dispatchEvent(new Event("change"));break;}}
    var tries=0,iv=setInterval(function(){tries++;var go=$("prGo");if(go&&!go.disabled){clearInterval(iv);go.click();if(window.innerWidth<=700)box.classList.remove("on");}else if(tries>60){clearInterval(iv);document.body.classList.add("pr-open");alert("Pick a song in the practice bar first, then press Start round.");}},250);
  }
  function build(){
    var hd=mk("div","hd"),h=mk("b","","🔧 Tuning lab"),x=mk("button","","Hide"),tv=mk("button","",tbl?"☰ Cards":"▦ Table");x.onclick=function(){box.classList.remove("on");};
    srch=document.createElement("input");srch.id="labSearch";srch.placeholder="Search every setting…";srch.oninput=function(){q=srch.value.trim();render();};
    tv.title="Switch between the roomy cards and a compact table";tv.onclick=function(){tbl=!tbl;tv.textContent=tbl?"☰ Cards":"▦ Table";try{localStorage.setItem("uk_lab_tbl",tbl?"1":"0");}catch(e){}render();};
    h.style.flex="none";hd.appendChild(h);hd.appendChild(srch);hd.appendChild(tv);hd.appendChild(x);box.appendChild(hd);
    /* every editor, one tap away */
    var tools=mk("div");tools.id="labTools";[["🎼 Notes","charts.html"],["🚩 Arenas","ctf.html"],["🏁 Tracks","track.html"],["⛷ Ski","ski.html"],["🎨 Graphics","gfx.html"]].forEach(function(e){var a=mk("a","",e[0]);a.href=e[1];a.target="_blank";tools.appendChild(a);});box.appendChild(tools);
    tabs=mk("div");tabs.id="labTabs";box.appendChild(tabs);body=mk("div");body.id="labBody";box.appendChild(body);
    var f=mk("div");f.id="labFoot";f.appendChild(mk("div","","Share box: copy this to send me your settings, or paste settings here and press Apply."));
    ta=document.createElement("textarea");ta.spellcheck=false;f.appendChild(ta);
    var r=mk("div","r"),cp=mk("button","go","Copy settings"),tx=mk("button","","✎ Text"),ap=mk("button","","Apply pasted"),ra=mk("button","","Reset everything");
    cp.onclick=function(){ta.value=TUNE.exportText();ta.select();var ok=false;try{ok=document.execCommand("copy");}catch(e){}
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(ta.value).then(function(){cp.textContent="Copied ✓";setTimeout(function(){cp.textContent="Copy settings";},1500);},function(){if(ok){cp.textContent="Copied ✓";setTimeout(function(){cp.textContent="Copy settings";},1500);}});
      else if(ok){cp.textContent="Copied ✓";setTimeout(function(){cp.textContent="Copy settings";},1500);}};
    ap.onclick=function(){var n=TUNE.importText(ta.value);ap.textContent="Loaded "+n;setTimeout(function(){ap.textContent="Apply pasted";},1500);render();};
    ra.onclick=function(){if(confirm("Put every value back to its default?")){TUNE.resetAll();render();}};
    tx.id="labTxt";tx.onclick=function(){f.classList.toggle("open");};r.appendChild(cp);r.appendChild(tx);r.appendChild(ap);r.appendChild(ra);f.appendChild(r);box.appendChild(f);
    render();
  }
  build();
  btn.onclick=function(){box.classList.toggle("on");};
  TUNE.onChange(function(){shareText();});
  window.ukLab=function(){return{open:box.classList.contains("on"),group:cur,changed:TUNE.changed()};};
  if(/[?&]lab\b/.test(location.search))box.classList.add("on");
})();
