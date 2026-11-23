/* Unholy Keys: voice between songs.
   As soon as one person turns their mic on, voice opens for the whole room: everyone joins in listening, mics off, and each
   player gets a big button to turn their own mic on. Up to 8 talkers at once (the server's limit); anyone can listen.
   WebRTC straight between people, and only where someone on the line has their mic on (listeners don't call each other).
   The relay server only passes the setup messages along (voice-join / voice-peers / voice-on / voice-off / voice-mic /
   voice-open / voice-full / voice-sig / voice-talk).

   VOICE.init({send:fn(obj), myId:fn()->id, songOn:fn()->bool, onChange:fn(state), listener:bool})
   VOICE.toggle()          mic on / off (call from a tap: browsers need a gesture for the mic and for playback)
   VOICE.listen()          join just to hear (no mic asked for)
   VOICE.onMsg(msg)        feed it every message whose type starts with "voice-"
   VOICE.tick()            call a few times a second: opens / closes the mic as songs start and stop
   VOICE.reset()           the connection dropped: forget everything (you're out of voice)
   VOICE.talking(id)       is that player talking right now (for a little indicator over them)
   VOICE.state             "off" | "listen" (in voice, hearing, mic off) | "on" | "song" (mic on, muted for the song) | "full" (no talker slot: listening) | "denied" */
var VOICE=(function(){
  var cfg=null,state="off",peers={},mem={},mic=null,micOn=false,talk={},ac=null,an=null,anBuf=null,amTalking=false,lastTalkT=0,fullT=0,noMic=false,wantMic=false;
  /* STUN finds a direct route; when two networks block that (mobile data, strict routers), the TURN relays carry the sound instead */
  var ICE=[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"},
    {urls:["turn:openrelay.metered.ca:80","turn:openrelay.metered.ca:443","turn:openrelay.metered.ca:443?transport=tcp"],username:"openrelayproject",credential:"openrelayproject"}];
  var tries={},blocked=[];
  function setState(s){if(s===state)return;state=s;if(cfg&&cfg.onChange)try{cfg.onChange(s);}catch(e){}}
  function send(o){if(cfg)cfg.send(o);}
  function me(){return String(cfg&&cfg.myId?cfg.myId():"");}
  function inVoice(){return state==="on"||state==="song"||state==="listen"||state==="full";}
  function talker(){return wantMic&&(state==="on"||state==="song");}
  /* one connection per person, where at least one side talks; the one who calls adds the audio line */
  function peer(id,offer){
    if(peers[id])return peers[id];
    var pc=new RTCPeerConnection({iceServers:ICE}),p={pc:pc,id:id,tx:null,el:null,offer:!!offer};peers[id]=p;
    if(offer){p.tx=pc.addTransceiver("audio",{direction:"sendrecv"});if(mic&&micOn)try{p.tx.sender.replaceTrack(mic.getAudioTracks()[0]);}catch(e){}}
    pc.onicecandidate=function(e){if(e.candidate)send({type:"voice-sig",to:id,d:{c:e.candidate}});};
    pc.ontrack=function(e){
      if(!p.el){p.el=document.createElement("audio");p.el.autoplay=true;p.el.setAttribute("playsinline","");p.el.style.display="none";document.body.appendChild(p.el);}
      p.el.srcObject=e.streams&&e.streams[0]?e.streams[0]:new MediaStream([e.track]);var pr=p.el.play();
      if(pr&&pr.catch)pr.catch(function(){if(blocked.indexOf(p.el)<0)blocked.push(p.el);});};   /* the browser wants a tap first: played on the next tap or key */
    pc.onconnectionstatechange=function(){if(pc.connectionState==="connected")tries[id]=0;
      if(pc.connectionState==="failed"){var was=p.offer;drop(id);tries[id]=(tries[id]||0)+1;   /* try again (a few times) rather than going quiet for good */
        if(was&&tries[id]<=3&&inVoice())setTimeout(function(){if(!peers[id]&&inVoice())peer(id,true);},1500*tries[id]);}};
    if(offer)pc.createOffer().then(function(o){return pc.setLocalDescription(o);}).then(function(){send({type:"voice-sig",to:id,d:{sdp:pc.localDescription}});}).catch(function(){});
    return p;
  }
  function drop(id){var p=peers[id];if(!p)return;try{p.pc.close();}catch(e){}if(p.el){p.el.srcObject=null;p.el.remove();}delete peers[id];delete talk[id];}
  function dropAll(){Object.keys(peers).forEach(drop);talk={};mem={};}
  /* call everyone we should hear or be heard by and aren't connected to yet */
  function callAll(){var I=talker();Object.keys(mem).forEach(function(id){if(!peers[id]&&(I||mem[id].mic))peer(id,true);});}
  /* the mic: asked for between songs, released completely while a song plays (so the phone's audio stays in music mode) */
  function openMic(){
    if(mic||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){if(!navigator.mediaDevices)micFail();return;}
    mic="pending";
    navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}).then(function(st){
      if(state!=="on"){st.getTracks().forEach(function(t){t.stop();});mic=null;return;}
      mic=st;micOn=true;var tr=st.getAudioTracks()[0];
      Object.keys(peers).forEach(function(k){if(peers[k].tx)try{peers[k].tx.sender.replaceTrack(tr);}catch(e){}});
      try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();var src=ac.createMediaStreamSource(st);an=ac.createAnalyser();an.fftSize=512;anBuf=new Uint8Array(an.fftSize);src.connect(an);}catch(e){an=null;}
    }).catch(micFail);
  }
  function micFail(){mic=null;noMic=true;wantMic=false;send({type:"voice-mic",on:0});setState("listen");}   /* no mic (or no permission): stay in, listening */
  function closeMic(){
    if(mic&&mic!=="pending")mic.getTracks().forEach(function(t){t.stop();});
    mic=null;micOn=false;an=null;
    Object.keys(peers).forEach(function(k){if(peers[k].tx)try{peers[k].tx.sender.replaceTrack(null);}catch(e){}});
    if(amTalking){amTalking=false;send({type:"voice-talk",on:0});}
  }
  function listen(){if(!window.RTCPeerConnection){setState("denied");return;}if(inVoice())return;setState("listen");send({type:"voice-join"});}
  function micOnNow(){if(!window.RTCPeerConnection){setState("denied");return;}if(!inVoice())send({type:"voice-join"});noMic=false;wantMic=true;setState("on");send({type:"voice-mic",on:1});}
  function micOffNow(){wantMic=false;closeMic();send({type:"voice-mic",on:0});setState("listen");}
  function leave(){send({type:"voice-leave"});wantMic=false;closeMic();dropAll();setState("off");}
  function unblock(){if(!blocked.length)return;var b=blocked;blocked=[];b.forEach(function(el){var pr=el.play();if(pr&&pr.catch)pr.catch(function(){blocked.push(el);});});}
  ["pointerdown","keydown","touchstart"].forEach(function(ev){window.addEventListener(ev,unblock,true);});
  return{
    init:function(c){cfg=c;},
    /* how the calls are going: [{id, state, hearing}] (for the voice button's tooltip, and tests) */
    links:function(){return Object.keys(peers).map(function(k){var p=peers[k];return{id:k,state:p.pc.connectionState||p.pc.iceConnectionState,hearing:!!(p.el&&p.el.srcObject&&!p.el.paused)};});},
    get state(){return state;},
    get noMic(){return noMic;},
    get open(){return inVoice();},
    /* the button: mic on, or back to listening */
    toggle:function(){if(state==="on"||state==="song")micOffNow();else micOnNow();},
    listen:listen,
    leave:leave,
    reset:function(){wantMic=false;closeMic();dropAll();if(state!=="off")setState("off");},
    talking:function(id){if(id===me())return amTalking;return !!talk[id];},
    onMsg:function(m){
      if(!cfg)return;
      if(m.type==="voice-open"){listen();return;}   /* someone's talking: everyone joins in, listening */
      if(!inVoice())return;
      if(m.type==="voice-full"){wantMic=false;closeMic();setState("full");fullT=performance.now();return;}   /* no talker slot free: keep listening */
      if(m.type==="voice-peers"){mem={};(m.peers||[]).forEach(function(q){mem[String(q.id)]={mic:q.mic?1:0};});callAll();return;}
      if(m.type==="voice-on"){mem[String(m.id)]={mic:m.mic?1:0};return;}   /* the newcomer calls the talkers (it got the list) */
      if(m.type==="voice-mic"){var q=mem[String(m.id)]||(mem[String(m.id)]={mic:0});q.mic=m.on?1:0;if(!m.on)delete talk[m.id];return;}   /* a new talker calls us */
      if(m.type==="voice-off"){delete mem[String(m.id)];drop(String(m.id));return;}
      if(m.type==="voice-talk"){if(m.on)talk[m.id]=1;else delete talk[m.id];return;}
      if(m.type==="voice-sig"){var id=String(m.from),d=m.d||{},p=peers[id];
        /* both called at once: the one with the lower id keeps its call, the other answers it */
        if(d.sdp&&d.sdp.type==="offer"&&p&&p.offer&&p.pc.signalingState==="have-local-offer"){if(me()<id)return;drop(id);p=null;}
        p=p||peer(id,false);var pc=p.pc;
        if(d.sdp){pc.setRemoteDescription(d.sdp).then(function(){
          if(d.sdp.type!=="offer")return;
          if(!p.tx){p.tx=pc.getTransceivers()[0];if(p.tx){p.tx.direction="sendrecv";if(mic&&micOn&&mic!=="pending")try{p.tx.sender.replaceTrack(mic.getAudioTracks()[0]);}catch(e){}}}
          return pc.createAnswer().then(function(a){return pc.setLocalDescription(a);}).then(function(){send({type:"voice-sig",to:id,d:{sdp:pc.localDescription}});});}).catch(function(){});}
        else if(d.c){pc.addIceCandidate(d.c).catch(function(){});}
      }
    },
    tick:function(){
      if(state==="full"&&performance.now()-fullT>3500)setState("listen");
      if(state!=="on"&&state!=="song")return;
      var song=!!(cfg.songOn&&cfg.songOn());
      if(song&&state==="on"){setState("song");closeMic();}
      else if(!song&&state==="song"){setState("on");}
      if(state==="on"&&!mic)openMic();
      /* talking: a short burst over the noise floor lights you up for everyone */
      if(an&&micOn){an.getByteTimeDomainData(anBuf);var pk=0;for(var i=0;i<anBuf.length;i+=4){var v=Math.abs(anBuf[i]-128);if(v>pk)pk=v;}
        var now=performance.now();if(pk>14)lastTalkT=now;var t2=now-lastTalkT<500;if(t2!==amTalking){amTalking=t2;send({type:"voice-talk",on:t2?1:0});}}
    }
  };
})();
