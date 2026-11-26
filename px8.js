/* px8.js: 8-bit everywhere, shared by the phone page (and the TV) and the host page.
   - PXEMO: every symbol drawn as pixel art (page text swapped automatically, canvas text too), one pixel font
   - the canvas: crisp pixel upscaling, no smoothing, no soft glows, gradients in hard colour bands
   - the styles: blurred shadows and glows turned into hard pixel ones */
function pxEsc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
var PXEMO=(function(){
  var PAL={K:"#111",W:"#fff",R:"#FF3D5A",O:"#FF8A1F",Y:"#FFE14D",G:"#9aa0b4",C:"#7FE6FF",M:"#FF5FD2",S:"#F2B48A",B:"#3D7BFF",L:"#9cff4a",D:"#2e8b3a",A:"#6a7090",N:"#8a5a2e",P:"#7a4cc4"};
  var I={
    "💥":["K...K...K",".KR.R.RK.","..RORYR..",".RROYYRR.","KROYWYORK",".RRYYORR.","..RYROR..",".KR.R.RK.","K...K...K"],
    "🏁":["GKWKWKW","GWKWKWK","GKWKWKW","GWKWKWK","G......","G......","G......","G......"],
    "🚩":["GRRRRR.","GRRRRRR","GRRRRR.","GRRRR..","G......","G......","G......","G......"],
    "⛷":["....C....","..C.C.C..","...CCC...",".C..C..C.","CCCCCCCCC",".C..C..C.","...CCC...","..C.C.C..","....C...."],
    "🏎":[".........","...RRR...","..RRCRR..",".RRRRRRR.","RRRRRRRRR",".KK...KK.",".KK...KK."],
    "💃":["...MMMM","...M..M","...M..M","...M..M",".MMM.MM","MMMMMMM",".MM.MM."],
    "🎈":["..RRR..",".RRWRR.",".RRRRR.",".RRRRR.","..RRR..","...R...","...W...","..W....","...W..."],
    "☠":[".WWWWW.","WWWWWWW","WKKWKKW","WKKWKKW","WWWKWWW",".WWWWW.",".W.W.W."],
    "🌀":[".CCCCC.","C.....C","C.CCC.C","C.C.C.C","C.C...C","C.CCCCC","C......"],
    "🤘":["S....S","S....S","SSSSSS","SSSSSS","SSSSSS",".SSSS.",".SSSS."],
    /* fishing's symbols */
    "⭐":["...Y...","...Y...","YYYYYYY",".YYYYY.","..YYY..",".YY.YY.","Y.....Y"],
    "✔":["......L",".....LL","L...LL.","LL.LL..",".LLL...","..L...."],
    "✖":["RR...RR",".RR.RR.","..RRR..","..RRR..",".RR.RR.","RR...RR"],
    "⚠":["...Y...","..YKY..","..YKY..",".YYKYY.",".YYYYY.","YYYKYYY","YYYYYYY"],
    "❗":["RR","RR","RR","RR","..","RR"],
    "⏳":["WWWWWWW",".WYYYW.","..WYW..","...W...","..W.W..",".WYYYW.","WWWWWWW"],
    "👆":["..S...","..S...","..SSS.",".SSSSS","SSSSSS",".SSSS.",".SSSS."],
    "🖱":[".WWW.","WW.WW","WW.WW","WWWWW","WWWWW",".WWW."],
    "🥅":["WWWWWWW","W.W.W.W","WWWWWWW","W.W.W.W","WWWWWWW"],
    "👀":["WWW.WWW","WKW.WKW","WWW.WWW"],
    "👋":["S.S.S..","S.S.S.S","SSSSS.S","SSSSSSS",".SSSSS.","..SSS.."],
    "🐟":["...C...",".CCCC.C","CKCCCCC",".CCCC.C","...C..."],
    "🐢":["..LLL...",".LDLDL.S","LLLLLLSS",".S...S.."],
    "⚡":["...YY","..YY.",".YYYY","..YY.",".YY..","YY..."],
    "⟳":[".CCCC.","C....C","C...CCC","C....C.","C......",".CCCC."],
    "↺":[".CCCC.","C....C","CCC...C",".C....C","......C",".CCCC."],
    "⇗":["..WWWW","...WWW","..WW.W",".WW...","WW....","W....."],
    "↔":["..W...W..",".WW...WW.","WWWWWWWWW",".WW...WW.","..W...W.."],
    "♩":["..W","..W","..W","..W","WWW","WW."],
    "⬅":["..W....",".WW....","WWWWWWW",".WW....","..W...."],
    "➡":["....W..","....WW.","WWWWWWW","....WW.","....W.."],
    "↓":["..W..","..W..","..W..","WWWWW",".WWW.","..W.."],
    "🎣":["......W","....WW.","...W..W","..W...W",".W....C","W.....C"],
    "💥":["K...K...K",".KR.R.RK.","..RORYR..",".RROYYRR.","KROYWYORK",".RRYYORR.","..RYROR..",".KR.R.RK.","K...K...K"],
    "↑":["..W..",".WWW.","WWWWW","..W..","..W..","..W.."],
    "⏩":["W..W...","WW.WW..","WWWWWW.","WWWWWWW","WWWWWW.","WW.WW..","W..W..."],
    "⏱":["..WWW..","...W...",".WWWWW.","W..W..W","W..WW.W","W.....W",".WWWWW."],
    "▲":["...W...","..WWW..",".WWWWW.","WWWWWWW"],"▼":["WWWWWWW",".WWWWW.","..WWW..","...W..."],
    "▶":["W...","WW..","WWW.","WWWW","WWW.","WW..","W..."],"◀":["...W","..WW",".WWW","WWWW",".WWW","..WW","...W"],
    "▸":["W..","WW.","WWW","WW.","W.."],"▾":["WWWWW",".WWW.","..W.."],
    "☀":["Y..Y..Y",".Y...Y.","..YYY..","YYYYYYY","..YYY..",".Y...Y.","Y..Y..Y"],
    "♀":[".MMM.","M...M","M...M",".MMM.","..M..","MMMMM","..M.."],"♂":["...BBB","....BB","BBB.B.","B..B..","B..B..","BBB..."],
    "♪":["..WW","..W.","..W.","..W.","WWW.","WW.."],"♫":[".WWWWW",".W...W",".W...W",".W...W","WW..WW","WW..WW"],
    "⚑":["WRRRR","WRRRR","WRRR.","W....","W....","W...."],
    "⚔":["W.....W",".W...W.","..W.W..","...W...","..W.W..",".N...N.","N.....N"],
    "⚪":[".WWW.","WWWWW","WWWWW","WWWWW",".WWW."],"⚽":[".WWW.","WKWKW","WWKWW","WKWKW",".WWW."],
    "⛶":["WW...WW","W.....W",".......",".......",".......","W.....W","WW...WW"],
    "⛸":["..W....","..W....","..WWWW.","..WWWWW","CCCCCCC"],
    "✨":["...Y...","...Y...","YYYYYYY","...Y...","...Y...",".....Y.","....YYY"],
    "❤":[".RR.RR.","RRRRRRR","RRRRRRR",".RRRRR.","..RRR..","...R..."],
    "➿":["..CC..",".C..C.","C....C","CC..CC","..CC.."],
    "🌅":["...Y...","..YYY..",".OOOOO.","BBBBBBB","CBCBCBC"],"🌉":["R.....R","RRRRRRR","R.R.R.R","R.....R","BBBBBBB"],
    "🌊":["..CCC..",".CWWC..","CC..CC.","C.....C","BBBBBBB"],"🌑":[".AAA.","AAAAA","AAAAA","AAAAA",".AAA."],
    "🌙":["..YYY","YYY..","YY...","YYY..","..YYY"],"🌟":["...Y...","...Y...","YYYWYYY",".YYWYY.","..YYY..",".YY.YY.","Y.....Y"],
    "🍑":[".L...","OOOO.","OOOOO","OOOOO",".OOO."],
    "🎆":["M..Y..M",".M.Y.M.","..MYM..","YYYWYYY","..MYM..",".M.Y.M.","M..Y..M"],
    "🎙":["..AAA..","..AWA..","..AAA..",".A.A.A.","..AAA..","...A...","..AAA.."],
    "🎛":["AAAAAAA","AWAAAWA","AWAWAWA","AWAWAAA","AAAWAAA"],"🎤":["..AA","..AA",".N..","N..."],
    "🎧":[".AAAAA.","A.....A","A.....A","MM...MM","MM...MM"],"🎭":["WWW.YYY","WKW.YKY","WWW.YYY",".W...Y."],
    "🎮":[".AAAAA.","AWAAARA","WWWAARA","AWAAAAA","AA...AA"],
    "🎯":[".RRRRR.","RWWWWWR","RWRRRWR","RWRWRWR","RWRRRWR","RWWWWWR",".RRRRR."],
    "🎲":["WWWWW","WKWWW","WWKWW","WWWKW","WWWWW"],"🎸":["....NN","...N..","..N...",".OO...","OOOO..",".OO..."],
    "🎹":["WKWKWKW","WKWKWKW","WWWWWWW","WWWWWWW"],"🎺":["Y......","YYYYYYY","Y..Y.YY","....YYY"],
    "🏃":["...SS.","..MMM.",".M.M..","..M...",".M.M..","M...M."],
    "🏆":["YYYYYYY","Y.YYY.Y",".YYYYY.","..YYY..","...Y...","..YYY.."],
    "🏍":["...RR..","RRRRRR.",".KK.KK.","KWK.KWK",".K...K."],"🐉":["...LL..","..LKL.L",".LLLLLL","LLLLL..","L.L.L.."],
    "🐛":[".LLLLL.","LKLLLLL",".L.L.L."],"🐠":["...O...",".OYOO.O","OKYOYOO",".OYOO.O","...O..."],
    "👟":["...BB..","..BBB..","BBBBBBB","WWWWWWW"],"👣":["SS...","SS...","S..SS","...SS","...S."],
    "💦":["..C...C","..C..CC",".CC..CC",".CC....","CCCC...","CCCC..."],
    "💫":["..YYY..",".Y...Y.","Y..Y..Y","Y.Y.Y.Y","Y..YY.Y",".Y.....","..YYY.."],
    "💬":["WWWWWWW","W.....W","WWWWWWW",".WW....","W......"],"📁":["YYY....","YYYYYYY","YYYYYYY","YYYYYYY"],
    "📡":["..A....",".A.A...","A...A..",".A...A.","..AAA..","...A...","..AAA.."],
    "🔇":["..A....",".AA.R.R","AAA..R.","AAA.R.R",".AA....","..A...."],
    "🔥":["...R...","..RR...",".RORR..",".ROYOR.","ROYYYOR","ROYWYOR",".RRRRR."],"🔦":["AAAAYYY","AAAAYYY"],
    "🕺":["...SS..","...MM.S","..MMMM.","S.MM...","..M.M..",".M...M."],
    "🖐":["S.S.S..","S.S.S..","SSSSS.S","SSSSSSS",".SSSSS.","..SSS.."],
    "🗳":["..WWW..","..W.W..","AAAAAAA","A.....A","AAAAAAA"],"🙌":["S.S.S.S","SSS.SSS","SSS.SSS",".S...S."],
    "🚀":["...W...","..WWW..","..WCW..","..WWW..",".RWWWR.","R.O.O.R","..O.O.."],
    "🚤":["...W...","...WW..","WWWWWWW",".BBBBB.","CCCCCCC"],"🛟":[".RWWR.","R....R","W....W","W....W","R....R",".RWWR."],
    "🛡":["BBBBBBB","BWBBBWB","BBWBWBB",".BBWBB.","..BBB..","...B..."],
    "🛢":[".AAAAA.","AGGGGGA","AAAAAAA","AGGGGGA","AAAAAAA","AGGGGGA",".AAAAA."],
    "🛹":["YYYYYYY",".K...K."],"🛼":["..WW...","..WW...","..WWWW.","MMMMMMM",".K...K."],
    "🤖":["...R...","AAAAAAA","ACAAACA","AAAAAAA","AAKKKAA","AAAAAAA"],
    "🤪":[".YYYYY.","YWKYWWY","YYYYKYY","YRRRRRY",".YYRYY."],"🤸":["S.....S",".M...M.","..MMM..","...S...","..S.S.."],
    "🥁":["W.....W",".W...W.","RRRRRRR","RWRWRWR","RRRRRRR"],"🥾":["..NN...","..NN...","..NN...","..NNNNN","KKKKKKK"],
    "🦵":["SS..","SS..",".SS.",".SS.","..SS","..SSS"],"🧟":["..LLL..",".LKLKL.","..LLL..",".PPPPLL","..PPP..",".P...P."],
    "🪶":["......W",".....WW","....WCW","...WCW.","..WCW..",".WW....","W......"],
    "🎵":[".WWWWW",".W...W",".W...W",".W...W","WW..WW","WW..WW"],
    "⏸":["WW.WW","WW.WW","WW.WW","WW.WW","WW.WW","WW.WW"],
    "↝":["......",".W.W.W","W.W.W.","......"],"↩":["...WWW","..W...W","WWW...W",".W...W.","..WWW.."],"⇄":["....W..","WWWWWWW","....W..","..W....","WWWWWWW","..W...."],
    "−":["WWWWW"],"≈":[".W...W","W.W.W.",".....","W.W.W.",".W...W"],"⏭":["W..W..W","WW.WW.W","WWWWWWW","WW.WW.W","W..W..W"],"⏺":[".RRR.","RRRRR","RRRRR","RRRRR",".RRR."],
    "─":["WWWWWWW"],"═":["WWWWWWW",".......","WWWWWWW"],"■":["WWWW","WWWW","WWWW","WWWW"],"◄":["...W","..WW",".WWW","WWWW",".WWW","..WW","...W"],
    "○":[".WWW.","W...W","W...W","W...W",".WWW."],"●":[".WWW.","WWWWW","WWWWW","WWWWW",".WWW."],"☁":["..WW...",".WWWWW.","WWWWWWW",".WWWWW."],
    "☆":["...Y...","..Y.Y..","YY...YY",".Y...Y.","..Y.Y..",".Y.Y.Y.","Y.....Y"],"☰":["WWWWW",".....","WWWWW",".....","WWWWW"],
    "♭":["W...","W...","WWW.","W..W","W.W.","WW.."],"♯":[".W.W.","WWWWW",".W.W.","WWWWW",".W.W."],
    "⛈":["..AA...",".AAAAA.","AAAAAAA",".AYAAA.","..Y.C..",".Y..C.."],"✎":[".....WW","....WWW","...WWW.","..WWW..",".WWW...","YWW....","YY....."],
    "❄":["..W.W..","W..W..W",".W.W.W.","WWWWWWW",".W.W.W.","W..W..W","..W.W.."],"❚":["WW","WW","WW","WW","WW"],"➜":["....W..","....WW.","WWWWWWW","....WW.","....W.."],
    "⠿":["W.W","...","W.W","...","W.W"],"⤒":["WWWWW","..W..",".WWW.","W.W.W","..W..","..W.."],"⤢":["...WWW","....WW","...W.W","W.W...","WW....","WWW..."],
    "⧉":["WWWW..","W..W..","W.WWWW","WWW..W","..W..W","..WWWW"],"⬇":["..W..","..W..","..W..","WWWWW",".WWW.","..W.."],
    "🌃":["BBBBBBB","BYBBBYB","BBAABBB","BAWAABB","AAWAAWA","AWAAWAA"],"🌧":["..AA...",".AAAAA.","AAAAAAA","..C.C..",".C.C.C."],
    "🎇":["Y..W..Y",".Y.W.Y.","..YWY..","WWWYWWW","..YWY..",".Y.W.Y.","Y..W..Y"],"🎊":["M.Y.C..",".C.M.Y.","Y.M.C.M",".Y...C.","..OOO..",".OOOOO."],
    "🎥":["AAAA...","AWWAA.A","AAAAAAA","AAAAA.A","AAAA..."],"🎨":[".OOOOO.","ORO.BO.","OOOOOOO","OYO.LOO",".OOOOO."],
    "🎪":["...R...","..RWR..",".RWRWR.","RWRWRWR","W.W.W.W","W.W.W.W"],"🎬":["KWKWKWK","WKWKWKW","KKKKKKK","KWWWWWK","KKKKKKK"],
    "🎻":["..N....","..N....",".NNN...","NNONN..","NOOON..",".NNN..."],"🎼":["WWWWWWW",".......","WWWWWWW","..W..W.","WWW.WWW"],
    "🏟":["..AAA..",".AWWWA.","AWLLLWA","AWLLLWA",".AAAAA."],"🏠":["...R...","..RRR..",".RRRRR.","RRRRRRR",".WWNWW.",".WWNWW."],
    "🏳":["WWWWW","WWWWW","WWWW.","W....","W....","W...."],"👏":["S.S.S..",".SSSSS.","S.SSSS.",".SSSS..","..SS..."],
    "👕":["BB.BB","BBBBB",".BBB.",".BBB.",".BBB."],"💖":[".MM.MM.","MWMMMMM","MMMMMMM",".MMMMM.","..MMM..","...M..."],
    "💾":["BBBBBB.","BWWWWBB","BWWWWBB","BBBBBBB","BAAAABB","BAAAABB"],"📋":[".NNNN.","NWWWWN","NWAAWN","NWWWWN","NWAAWN","NNNNNN"],
    "📜":[".WWWWW","W.W.WW","W.....","W.W.W.","WW.WW.","WWWWW."],"📤":["...W...","..WWW..",".W.W.W.","...W...","A.....A","AAAAAAA"],
    "📱":[".AAAA.","AWWWWA","AWWWWA","AWWWWA","AAKKAA",".AAAA."],"📺":[".W...W.","..W.W..","AAAAAAA","ACCCCAA","ACCCCAA","AAAAAAA"],
    "🔄":[".CCCC.","C....C","C...CC","CC...C","C....C",".CCCC."],"🔊":["..A..W.",".AA.W.W","AAA.W.W","AAA.W.W",".AA.W.W","..A..W."],
    "🔑":[".YYY...","Y...Y..","Y...YYYY","Y...Y.YY",".YYY...."],"🔗":["AA.....","A.A....",".A.A...","..A.A..","...A.A.","....A.A",".....AA"],
    "🔧":["A....A",".A..AA","..AAA.","..AA..",".AA...","AA...."],"🔮":[".PPP.","PWPPP","PPPPP",".PPP.","NNNNN"],
    "🖥":["AAAAAAA","ACCCCCA","ACCCCCA","AAAAAAA","...A...","..AAA.."],"🗑":["AAAAAAA",".A.A.A.",".A.A.A.",".A.A.A.",".AAAAA."],
    "😈":["P.....P","PPPPPPP","PYPPPYP","PPPPPPP","PKKKKKP",".PPPPP."],"😊":[".YYYYY.","YKYYYKY","YYYYYYY","YKYYYKY","YYKKKYY",".YYYYY."],
    "😕":[".YYYYY.","YKYYYKY","YYYYYYY","YYKKYYY","YYYYKKY",".YYYYY."],"😙":[".YYYYY.","YKYYYKY","YYYYYYY","YYYYYYY","YYYKRYY",".YYYYY."],
    "😮":[".YYYYY.","YKYYYKY","YYYYYYY","YYYKYYY","YYKYKYY",".YYKYY."],"😱":[".YYYYY.","YWYYYWY","YKYYYKY","YYYKYYY","YYKKKYY",".YYKYY."],
    "😲":[".YYYYY.","YWYYYWY","YYYYYYY","YYYKYYY","YYKYKYY",".YYYYY."],"🚶":["..SS.","..MM.",".MMM.","..M..",".M.M.",".M..M"],
    "🛰":["BB.A.BB","BB.A.BB","..AAA..","BB.A.BB","BB.A.BB"],"🟦":["BBBBB","BBBBB","BBBBB","BBBBB","BBBBB"],
    "🤟":["S..S.S","S..S.S","SSSSSS","SSSSSS",".SSSS."],"🤩":[".YYYYY.","YYYYYYY","Y.YYY.Y","YYYYYYY","YYKKKYY",".YYYYY."],
    "🪐":["......Y","..OOOY.",".OOOOO.","YOOOOOY",".OOOOO.","YOOOO..","Y......"],"🪩":[".WAWA.","WAWAWA","AWAWAW","WAWAWA",".WAWA."]
  },cache={},ccache={};
  /* the same picture under other characters */
  [["←","⬅"],["→","➡"],["⬆","↑"],["↶","↺"],["⟲","↺"],["↻","⟳"],["★","⭐"],["✓","✔"],["✕","✖"]].forEach(function(a){if(I[a[1]]&&!I[a[0]])I[a[0]]=I[a[1]];});
  function url(k){if(cache[k])return cache[k];var g=I[k],h=g.length,w=0,i,j;for(i=0;i<h;i++)w=Math.max(w,g[i].length);
    var c=document.createElement("canvas");c.width=w;c.height=h;var x=c.getContext("2d");
    for(i=0;i<h;i++)for(j=0;j<g[i].length;j++){var p=PAL[g[i][j]];if(p){x.fillStyle=p;x.fillRect(j,i,1,1);}}
    return cache[k]=c.toDataURL();}
  var KEYS=Object.keys(I).sort(function(a,b){return b.length-a.length;}).map(function(k){return k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}).join("|");
  var RX;try{RX=new RegExp("("+KEYS+"|\\p{Extended_Pictographic})\\uFE0F?","gu");}catch(e){RX=new RegExp("("+KEYS+"|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[☀-➿])️?","g");}
  function cv(k){if(ccache[k])return ccache[k];var g=I[k],h=g.length,w=0,i,j;for(i=0;i<h;i++)w=Math.max(w,g[i].length);var c=document.createElement("canvas");c.width=w;c.height=h;var x=c.getContext("2d");
    for(i=0;i<h;i++)for(j=0;j<g[i].length;j++){var p=PAL[g[i][j]];if(p){x.fillStyle=p;x.fillRect(j,i,1,1);}}return ccache[k]=c;}
  /* text with pixel icons on a canvas: icons drawn as crisp pixel blocks sized to the font, text as text, centred/left/right */
  function draw(g,t,x,y,px,al,fill,stroke,lw){t=String(t==null?"":t);var parts=[],last=0,m;RX.lastIndex=0;while((m=RX.exec(t))){if(m.index>last)parts.push(t.slice(last,m.index));if(I[m[1]])parts.push({k:m[1]});else(window.__pxMissing=window.__pxMissing||{})[m[1]]=1;last=RX.lastIndex;}if(last<t.length)parts.push(t.slice(last));
    var sc=Math.max(1,Math.round(px/8)),wd=parts.map(function(q){return typeof q==="string"?g.measureText(q).width:cv(q.k).width*sc+sc;}),tot=wd.reduce(function(a,b){return a+b;},0),cx=al==="left"?x:al==="right"?x-tot:x-tot/2,oa=g.textAlign;g.textAlign="left";
    parts.forEach(function(q,i){if(typeof q==="string"){if(stroke){g.lineWidth=lw||3;g.strokeStyle=stroke;g.strokeText(q,cx,y);}g.fillStyle=fill;g.fillText(q,cx,y);}else{var c=cv(q.k);g.save();g.imageSmoothingEnabled=false;g.drawImage(c,Math.round(cx),Math.round(y-c.height*sc*0.85),c.width*sc,c.height*sc);g.restore();}cx+=wd[i];});g.textAlign=oa;}
  function html(t){var out="",last=0,m;t=String(t==null?"":t);RX.lastIndex=0;
    while((m=RX.exec(t))){out+=pxEsc(t.slice(last,m.index));if(I[m[1]])out+='<img class="pxe" alt="" src="'+url(m[1])+'">';else(window.__pxMissing=window.__pxMissing||{})[m[1]]=1;last=RX.lastIndex;}
    return (out+pxEsc(t.slice(last))).replace(/^\s+|\s+$/g,"");}
  /* everywhere, 8-bit: canvas text with a symbol in it draws the pixel icon; any canvas font becomes the pixel font */
  (function(){var P=CanvasRenderingContext2D.prototype,f0=P.fillText,s0=P.strokeText,fd=Object.getOwnPropertyDescriptor(P,"font");
    var TEST=new RegExp(RX.source,RX.flags.replace("g",""));
    function pxOf(g){var m=/(\d+(?:\.\d+)?)px/.exec(g.font);return m?+m[1]:12;}
    P.fillText=function(t,x,y,mw){if(typeof t==="string"&&TEST.test(t)&&!this.__px){this.__px=1;try{draw(this,t,x,y,pxOf(this),this.textAlign,this.fillStyle,null);}finally{this.__px=0;}return;}return f0.apply(this,arguments);};
    P.strokeText=function(t,x,y,mw){if(typeof t==="string"&&TEST.test(t)&&!this.__px){var tt=t.replace(new RegExp(RX.source,RX.flags),function(m0,k){return I[k]?"\u2002\u2002":"";});return s0.call(this,tt,x,y);}return s0.apply(this,arguments);};
    if(fd&&fd.set)Object.defineProperty(P,"font",{get:fd.get,set:function(v){if(typeof v==="string"&&v.indexOf("Silkscreen")<0)v=v.replace(/(\d+(?:\.\d+)?px)(\/[^ ]+)?\s+.*$/,"$1 'Silkscreen',ui-monospace,monospace");fd.set.call(this,v);},configurable:true});})();
  /* the few symbols set in CSS (::before / ::after) get their pixel icon as a crisp background */
  (function(){var st=document.createElement("style"),u=function(k){return 'url("'+url(k)+'")';};
    st.textContent="#skiScore::before,#ppScore::before{content:\"\"!important;display:inline-block;width:18px;height:18px;margin-right:8px;vertical-align:-2px;background:"+u("⛷")+" center/contain no-repeat;image-rendering:pixelated}"+
      "#ppScore::before{background-image:"+u("🛹")+"}"+
      "body.rd-paused::after{content:\"Paused\"!important;padding-left:40px!important;background-image:"+u("⏸")+"!important;background-repeat:no-repeat!important;background-position:16px center!important;background-size:14px 16px!important;image-rendering:pixelated}";
    (document.head||document.documentElement).appendChild(st);})();
  /* and page text: a symbol anywhere on screen becomes its pixel icon (typed text in boxes is left alone) */
  (function(){var TEST=new RegExp(RX.source,RX.flags.replace("g",""));
    function fix(node){if(node.nodeType===3){var t=node.nodeValue;if(!t||!TEST.test(t))return;var p=node.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|TITLE)$/.test(p.nodeName)||p.isContentEditable||(p.closest&&p.closest(".no-px")))return;
        var sp=document.createElement("span");sp.className="pxw";sp.innerHTML=html(t);if(node.nodeValue===t&&node.parentNode)p.replaceChild(sp,node);return;}
      if(node.nodeType===1&&!/^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|svg|CANVAS)$/i.test(node.nodeName)){for(var c=node.firstChild;c;){var n=c.nextSibling;fix(c);c=n;}}}
    function go(){if(!document.body)return setTimeout(go,50);fix(document.body);new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==="characterData")fix(m.target);else for(var i=0;i<m.addedNodes.length;i++)fix(m.addedNodes[i]);});}).observe(document.body,{childList:true,subtree:true,characterData:true});}
    go();})();
  (function(){function f(){Array.prototype.forEach.call(document.querySelectorAll(".pxi[data-px]"),function(e){e.innerHTML=html(e.getAttribute("data-px"));});}
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",f);else setTimeout(f,0);})();   /* HTML icons drawn in pixels */
  return{html:html,draw:draw,set:function(el,t){if(el)el.innerHTML=html(t);},has:function(k){return !!I[k];}};
})();

/* ---- the canvas: hard pixels ---- */
(function(){
  var st=document.createElement("style");
  st.textContent="canvas{image-rendering:crisp-edges;image-rendering:pixelated}"+
    "body,body *{font-family:'Silkscreen',ui-monospace,monospace!important;font-synthesis:none}"+
    "*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}"+
    "*,*::before,*::after{border-radius:0!important}";   /* square pixel corners everywhere */
  (document.head||document.documentElement).appendChild(st);
  var GC=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(t){var c=GC.apply(this,arguments);if(c&&t==="2d"&&!c.__px8){c.__px8=1;try{c.imageSmoothingEnabled=false;}catch(e){}}return c;};
  var P=CanvasRenderingContext2D.prototype,sb=Object.getOwnPropertyDescriptor(P,"shadowBlur");
  if(sb&&sb.set)Object.defineProperty(P,"shadowBlur",{get:sb.get,set:function(v){sb.set.call(this,0);},configurable:true});   /* no soft glows */
  var sm=Object.getOwnPropertyDescriptor(P,"imageSmoothingEnabled");
  if(sm&&sm.set)Object.defineProperty(P,"imageSmoothingEnabled",{get:sm.get,set:function(v){sm.set.call(this,false);},configurable:true});
  /* gradients in 4 hard bands between each pair of colours, instead of a smooth blend */
  var AC=CanvasGradient.prototype.addColorStop,last=new WeakMap(),sc=document.createElement("canvas").getContext("2d");
  function rgba(c){try{sc.fillStyle="#000";sc.fillStyle=c;var v=sc.fillStyle;if(v[0]==="#")return[parseInt(v.substr(1,2),16),parseInt(v.substr(3,2),16),parseInt(v.substr(5,2),16),1];var m=v.match(/[\d.]+/g);return m?[+m[0],+m[1],+m[2],m[3]!==undefined?+m[3]:1]:null;}catch(e){return null;}}
  CanvasGradient.prototype.addColorStop=function(p,c){var pr=last.get(this),cur=rgba(c);
    if(!pr||!cur||!pr.c||p<=pr.p){AC.call(this,p,c);last.set(this,{p:p,c:cur});return;}
    var N=4;for(var i=0;i<N;i++){var a=pr.p+(p-pr.p)*i/N,b=pr.p+(p-pr.p)*(i+1)/N,k=i/(N-1),col="rgba("+Math.round(pr.c[0]+(cur[0]-pr.c[0])*k)+","+Math.round(pr.c[1]+(cur[1]-pr.c[1])*k)+","+Math.round(pr.c[2]+(cur[2]-pr.c[2])*k)+","+(pr.c[3]+(cur[3]-pr.c[3])*k).toFixed(3)+")";
      try{AC.call(this,Math.min(1,Math.max(0,a+1e-4)),col);AC.call(this,Math.min(1,Math.max(0,b-1e-4)),col);}catch(e){}}
    try{AC.call(this,p,c);}catch(e){}last.set(this,{p:p,c:cur});};
})();
/* ---- the styles: blurred box/text shadows and drop-shadows become hard pixel ones (a glow becomes a solid ring) ---- */
(function(){
  function splitTop(s){var out=[],d=0,cur="";for(var i=0;i<s.length;i++){var ch=s[i];if(ch==="(")d++;if(ch===")")d--;if(ch===","&&!d){out.push(cur);cur="";}else cur+=ch;}out.push(cur);return out;}
  function hardShadow(v,text){if(!v||v==="none")return v;return splitTop(v).map(function(sh){var t=sh.trim(),inset=/\binset\b/.test(t);t=t.replace(/\binset\b/,"").trim();
      var lens=[],rest=t.replace(/(-?[\d.]+)(px|em|rem)?(?=\s|$)/g,function(m){lens.push(m);return "";}).trim();if(lens.length<3)return sh;
      var px=function(x){var n=parseFloat(x);return /em/.test(x)?n*16:n;},x=px(lens[0]),y=px(lens[1]),bl=px(lens[2]),spr=lens[3]?px(lens[3]):0;if(!bl)return sh;
      if(text)return (x||y?x+"px "+y+"px":"2px 2px")+" 0 "+rest;
      if(!x&&!y)spr=Math.max(spr,Math.min(4,Math.max(1,Math.round(bl/4))));   /* a glow: a hard ring */
      return (inset?"inset ":"")+x+"px "+y+"px 0 "+spr+"px "+rest;}).join(",");}
  function hardFilter(v){if(!v||v==="none")return v;return v.replace(/drop-shadow\(([^()]*(?:\([^()]*\))?[^()]*)\)/g,function(m,inner){var parts=inner.trim().split(/\s+/);if(parts.length>=3&&/px$/.test(parts[2]))parts[2]="0";return"drop-shadow("+parts.join(" ")+")";}).replace(/blur\([^)]*\)/g,"blur(0)");}
  function fixRules(rules){for(var i=0;i<rules.length;i++){var r=rules[i];if(r.cssRules&&!r.style){try{fixRules(r.cssRules);}catch(e){}continue;}var s=r.style;if(!s)continue;
      if(s.boxShadow&&/\d+px[^,]*\d+px[^,]*[1-9][\d.]*px/.test(s.boxShadow))s.setProperty("box-shadow",hardShadow(s.boxShadow,false),s.getPropertyPriority("box-shadow"));
      if(s.textShadow&&/[1-9]/.test(s.textShadow))s.setProperty("text-shadow",hardShadow(s.textShadow,true),s.getPropertyPriority("text-shadow"));
      if(s.filter&&/drop-shadow|blur/.test(s.filter))s.setProperty("filter",hardFilter(s.filter),s.getPropertyPriority("filter"));}}
  function run(){for(var i=0;i<document.styleSheets.length;i++){try{fixRules(document.styleSheets[i].cssRules);}catch(e){}}}
  window.pxHardShadow=hardShadow;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();setTimeout(run,1500);
})();
