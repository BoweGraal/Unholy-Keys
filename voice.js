/* Unholy Keys: voice between songs.
   Talk with your mic between songs; it switches itself off while a song plays.
   WebRTC straight between players (everyone to everyone, so a room caps talkers at 8 on the server);
   the relay server only passes the setup messages along (voice-join / voice-peers / voice-on / voice-off / voice-sig / voice-talk).

   VOICE.init({send:fn(obj), myId:fn()->id, songOn:fn()->bool, onChange:fn(state)})
   VOICE.toggle()          join or leave voice (call from a tap: browsers need a gesture for the mic and for playback)
   VOICE.onMsg(msg)        feed it every message whose type starts with "voice-"
   VOICE.tick()            call a few times a second: opens / closes the mic as songs start and stop
   VOICE.reset()           the connection dropped: forget everything (you're out of voice)
   VOICE.talking(id)       is that player talking right now (for a little indicator over them)
   VOICE.state             "off" | "on" | "song" (in voice, muted for the song) | "full" | "denied" */
var VOICE=(function(){
  var cfg=null,state="off",peers={},mic=null,micOn=false,talk={},ac=null,an=null,anBuf=null,amTalking=false,lastTalkT=0,fullT=0;
  var ICE=[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"}];
  function setState(s){if(s===state)return;state=s;if(cfg&&cfg.onChange)try{cfg.onChange(s);}catch(e){}}
  function send(o){if(cfg)cfg.send(o);}
  /* one connection per other talker; the one who joins later makes the offers */
  function peer(id,offer){
    if(peers[id])return peers[id];
    var pc=new RTCPeerConnection({iceServers:ICE}),p={pc:pc,id:id,tx:null,el:null};peers[id]=p;
    /* the offerer adds the audio line; the answerer uses the one the offer brings (see voice-sig) */
    if(offer){p.tx=pc.addTransceiver("audio",{direction:"sendrecv"});if(mic&&micOn)try{p.tx.sender.replaceTrack(mic.getAudioTracks()[0]);}catch(e){}}
    pc.onicecandidate=function(e){if(e.candidate)send({type:"voice-sig",to:id,d:{c:e.candidate}});};
    pc.ontrack=function(e){
      if(!p.el){p.el=document.createElement("audio");p.el.autoplay=true;p.el.setAttribute("playsinline","");p.el.style.display="none";document.body.appendChild(p.el);}
      p.el.srcObject=e.streams&&e.streams[0]?e.streams[0]:new MediaStream([e.track]);var pr=p.el.play();if(pr&&pr.catch)pr.catch(function(){});};
    pc.onconnectionstatechange=function(){if(pc.connectionState==="failed")drop(id);};
    if(offer)pc.createOffer().then(function(o){return pc.setLocalDescription(o);}).then(function(){send({type:"voice-sig",to:id,d:{sdp:pc.localDescription}});}).catch(function(){});
    return p;
  }
  function drop(id){var p=peers[id];if(!p)return;try{p.pc.close();}catch(e){}if(p.el){p.el.srcObject=null;p.el.remove();}delete peers[id];delete talk[id];}
  function dropAll(){Object.keys(peers).forEach(drop);talk={};}
  /* the mic: asked for between songs, released completely while a song plays (so the phone's audio stays in music mode) */
  function openMic(){
    if(mic||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return;
    var want=true;mic="pending";
    navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}).then(function(st){
      if(state!=="on"||!want){st.getTracks().forEach(function(t){t.stop();});mic=null;return;}
      mic=st;micOn=true;var tr=st.getAudioTracks()[0];
      Object.keys(peers).forEach(function(k){if(peers[k].tx)try{peers[k].tx.sender.replaceTrack(tr);}catch(e){}});
      try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();var src=ac.createMediaStreamSource(st);an=ac.createAnalyser();an.fftSize=512;anBuf=new Uint8Array(an.fftSize);src.connect(an);}catch(e){an=null;}
    }).catch(function(){mic=null;setState("denied");send({type:"voice-leave"});dropAll();});
  }
  function closeMic(){
    if(mic&&mic!=="pending")mic.getTracks().forEach(function(t){t.stop();});
    mic=null;micOn=false;an=null;
    Object.keys(peers).forEach(function(k){if(peers[k].tx)try{peers[k].tx.sender.replaceTrack(null);}catch(e){}});
    if(amTalking){amTalking=false;send({type:"voice-talk",on:0});}
  }
  function join(){if(!window.RTCPeerConnection){setState("denied");return;}setState("on");send({type:"voice-join"});}
  function leave(){send({type:"voice-leave"});closeMic();dropAll();setState("off");}
  return{
    init:function(c){cfg=c;},
    get state(){return state;},
    toggle:function(){if(state==="on"||state==="song")leave();else join();},
    reset:function(){closeMic();dropAll();if(state!=="off")setState("off");},
    talking:function(id){if(id===(cfg&&cfg.myId()))return amTalking;return !!talk[id];},
    onMsg:function(m){
      if(!cfg)return;
      if(m.type==="voice-full"){setState("full");fullT=performance.now();return;}
      if(state==="off"||state==="full"||state==="denied")return;
      if(m.type==="voice-peers"){(m.ids||[]).forEach(function(id){peer(String(id),true);});return;}
      if(m.type==="voice-on"){return;}   /* they'll send us an offer */
      if(m.type==="voice-off"){drop(String(m.id));return;}
      if(m.type==="voice-talk"){if(m.on)talk[m.id]=1;else delete talk[m.id];return;}
      if(m.type==="voice-sig"){var id=String(m.from),d=m.d||{},p=peers[id]||peer(id,false),pc=p.pc;
        if(d.sdp){pc.setRemoteDescription(d.sdp).then(function(){if(d.sdp.type==="offer"){if(!p.tx){p.tx=pc.getTransceivers()[0];if(p.tx){p.tx.direction="sendrecv";if(mic&&micOn&&mic!=="pending")try{p.tx.sender.replaceTrack(mic.getAudioTracks()[0]);}catch(e){}}}}if(d.sdp.type==="offer")return pc.createAnswer().then(function(a){return pc.setLocalDescription(a);}).then(function(){send({type:"voice-sig",to:id,d:{sdp:pc.localDescription}});});}).catch(function(){});}
        else if(d.c){pc.addIceCandidate(d.c).catch(function(){});}
      }
    },
    tick:function(){
      if(state==="full"&&performance.now()-fullT>4000)setState("off");
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
