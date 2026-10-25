/* Ken's Chess Academy — background search worker for Rook Ken and Peak Ken.
   Runs the same search as the main thread, off the UI thread, so the page
   stays responsive while the strongest versions of Ken think. */
importScripts('chess-engine.js');
const C = self.ChessRules;

function evalBoard(s,side){const val={p:100,n:320,b:335,r:510,q:920,k:0};let score=0;for(let i=0;i<128;i++){if(!C.on(i))continue;const p=s.b[i];if(p==='.')continue;const v=val[p.toLowerCase()],c=C.side(p),r=i>>4,f=i&7,central=3.5-Math.abs(f-3.5)+3.5-Math.abs(r-3.5),advance=c===1?(6-r):(r-1);let bonus=0;
 if(p.toLowerCase()==='p')bonus=advance*7+central*3;
 if(['n','b'].includes(p.toLowerCase()))bonus=central*11;
 if(p.toLowerCase()==='q')bonus=central*2;
 if(p.toLowerCase()==='r')bonus=(c===1?7-r:r)*2;
 score+=(v+bonus)*c;
 }return score*side;}

function aiSearch(s,depth,alpha,beta,bot,color,ply){const moves=C.legal(s);if(!moves.length)return C.checked(s)?-100000+ply:0;if(depth<=0)return evalBoard(s,color);
 let best=-Infinity;const ordered=moves.map(m=>({m,cap:s.b[m.to]!=='.'||m.flag==='ep',prom:!!m.promo})).sort((a,b)=>(b.cap*2+b.prom*3)-(a.cap*2+a.prom*3));
 for(const item of ordered){const sc=-aiSearch(C.apply(s,item.m),depth-1,-beta,-alpha,bot,-color,ply+1);best=Math.max(best,sc);alpha=Math.max(alpha,sc);if(alpha>=beta)break;}return best;}

self.onmessage=function(e){
  const msg=e.data||{};const fen=msg.fen,depth=msg.depth||3,noise=msg.noise||0;
  let state;try{state=C.fromFen(fen);}catch(err){self.postMessage(null);return;}
  if(!state){self.postMessage(null);return;}
  const possible=C.legal(state);
  if(!possible.length){self.postMessage(null);return;}
  const ordered=possible.slice().sort((a,b)=>(state.b[b.to]!=='.'?1:0)-(state.b[a.to]!=='.'?1:0));
  let scored=[];let rootAlpha=-Infinity;
  for(const m of ordered){const next=C.apply(state,m);let score;
    if(noise){score=-aiSearch(next,depth-1,-Infinity,Infinity,0,-state.t,1);score+=Math.random()*noise;}
    else{score=-aiSearch(next,depth-1,-Infinity,-rootAlpha,0,-state.t,1);if(score>rootAlpha)rootAlpha=score;}
    scored.push({m:m,score:score});}
  scored.sort((a,b)=>b.score-a.score);
  self.postMessage(scored[0]?C.uci(scored[0].m):null);
};
