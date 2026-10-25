/* Castle Chess Academy: standalone chess rules engine (original implementation).
   0x88 board; legal moves, promotion, castling, en passant, checks and draws. */
(function (root) {
  'use strict';
  const START='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const D={n:[-33,-31,-18,-14,14,18,31,33],b:[-17,-15,15,17],r:[-16,-1,1,16],k:[-17,-16,-15,-1,1,15,16,17]};
  const SYMBOLS={K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
  const PIECE_NAMES={k:'king',q:'queen',r:'rook',b:'bishop',n:'knight',p:'pawn'};
  const on=i=>i>=0&&i<128&&!(i&0x88);
  const side=p=>!p||p==='.'?0:p===p.toUpperCase()?1:-1;
  const name=i=>'abcdefgh'[i&7]+(8-(i>>4));
  const idx=t=>(8-Number(t[1]))*16+'abcdefgh'.indexOf(t[0]);
  const uci=m=>name(m.from)+name(m.to)+(m.promo||'');
  const clone=s=>({b:s.b.slice(),t:s.t,c:s.c,ep:s.ep,half:s.half,full:s.full});
  function fromFen(fen) {
    const f=fen.trim().split(/\s+/),rows=(f[0]||'').split('/'),b=Array(128).fill('.');
    if(rows.length!==8||!['w','b'].includes(f[1])||! /^(?:-|K?Q?k?q?)$/.test(f[2])||! /^(?:-|[a-h][36])$/.test(f[3]))throw Error('Invalid FEN');
    rows.forEach((row,r)=>{let c=0;for(const p of row){if(/[1-8]/.test(p))c+=Number(p);else{if(!/[prnbqkPRNBQK]/.test(p)||c>=8)throw Error('Invalid FEN rank');b[r*16+c++]=p;}}if(c!==8)throw Error('Invalid FEN rank');});
    if(b.filter(x=>x==='K').length!==1||b.filter(x=>x==='k').length!==1)throw Error('FEN must contain both kings');
    const c=(f[2].includes('K')?1:0)|(f[2].includes('Q')?2:0)|(f[2].includes('k')?4:0)|(f[2].includes('q')?8:0);
    const half=Number(f[4]||0),full=Number(f[5]||1);
    if(!Number.isInteger(half)||half<0||!Number.isInteger(full)||full<1)throw Error('Invalid move counters');
    return {b,t:f[1]==='w'?1:-1,c,ep:f[3]==='-'?-1:idx(f[3]),half,full};
  }
  function fen(s){let r=[];for(let rank=0;rank<8;rank++){let row='',empties=0;for(let file=0;file<8;file++){let p=s.b[rank*16+file];if(p==='.')empties++;else{if(empties)row+=empties;empties=0;row+=p;}}if(empties)row+=empties;r.push(row);}const castles=(s.c&1?'K':'')+(s.c&2?'Q':'')+(s.c&4?'k':'')+(s.c&8?'q':'')||'-';return r.join('/')+' '+(s.t===1?'w':'b')+' '+castles+' '+(s.ep<0?'-':name(s.ep))+' '+s.half+' '+s.full;}
  function attacked(s,target,by){
    for(let f=0;f<128;f++){if(!on(f)||side(s.b[f])!==by)continue;
      const p=s.b[f].toLowerCase();if(p==='p'){if(target===f-16*by-1||target===f-16*by+1)return true;continue;}
      const ds=p==='q'?D.b.concat(D.r):D[p];
      for(const d of ds){for(let to=f+d;on(to);to+=d){if(to===target)return true;if(s.b[to]!=='.'||p==='n'||p==='k')break;}}
    }return false;
  }
  const checked=(s,color=s.t)=>attacked(s,s.b.indexOf(color===1?'K':'k'),-color);
  function apply(s,m){const b=s.b.slice(),p=b[m.from],taken=b[m.to];let c=s.c;b[m.from]='.';b[m.to]=m.promo?(s.t===1?m.promo.toUpperCase():m.promo):p;
    if(m.flag==='ep')b[m.to+16*s.t]='.';
    if(m.flag==='castle'){const rf=m.to>m.from?m.from+3:m.from-4,rt=m.to>m.from?m.from+1:m.from-1;b[rt]=b[rf];b[rf]='.';}
    if(p==='K')c&=~3;if(p==='k')c&=~12;
    const rbits={119:1,112:2,7:4,0:8};if(p.toLowerCase()==='r')c&=~(rbits[m.from]||0);if(taken.toLowerCase()==='r')c&=~(rbits[m.to]||0);
    return {b,t:-s.t,c,ep:p.toLowerCase()==='p'&&Math.abs(m.to-m.from)===32?(m.to+m.from)/2:-1,half:p.toLowerCase()==='p'||taken!=='.'||m.flag==='ep'?0:s.half+1,full:s.full+(s.t===-1?1:0)};
  }
  function pseudo(s){const out=[];for(let f=0;f<128;f++){
    if(!on(f)||side(s.b[f])!==s.t)continue;const p=s.b[f].toLowerCase();
    const add=(to,flag='')=>{if(s.b[to].toLowerCase()==='k')return;if(p==='p'&&((to>>4)===0||(to>>4)===7)){for(const q of ['q','r','b','n'])out.push({from:f,to,promo:q,flag});}else out.push({from:f,to,promo:'',flag});};
    if(p==='p'){
      const to=f-16*s.t;
      if(on(to)&&s.b[to]==='.'){add(to);const two=to-16*s.t;if((f>>4)===(s.t===1?6:1)&&s.b[two]==='.')add(two);}
      for(const d of [-1,1]){const t=to+d;if(!on(t))continue;if(side(s.b[t])===-s.t)add(t);else if(t===s.ep&&s.b[t]==='.'&&s.b[t+16*s.t]===(s.t===1?'p':'P'))add(t,'ep');}
    } else {
      const ds=p==='q'?D.b.concat(D.r):D[p];
      for(const d of ds){for(let t=f+d;on(t);t+=d){if(side(s.b[t])===s.t)break;add(t);if(s.b[t]!=='.'||p==='n'||p==='k')break;}}
      const home=s.t===1?116:4,rook=s.t===1?'R':'r',bits=s.t===1?[1,2]:[4,8];
      if(p==='k'&&f===home&&!checked(s)){
        if((s.c&bits[0])&&s.b[f+3]===rook&&s.b[f+1]==='.'&&s.b[f+2]==='.'&&!attacked(s,f+1,-s.t)&&!attacked(s,f+2,-s.t))add(f+2,'castle');
        if((s.c&bits[1])&&s.b[f-4]===rook&&s.b[f-1]==='.'&&s.b[f-2]==='.'&&s.b[f-3]==='.'&&!attacked(s,f-1,-s.t)&&!attacked(s,f-2,-s.t))add(f-2,'castle');
      }
    }
  }return out;}
  const legal=s=>pseudo(s).filter(m=>!checked(apply(s,m),s.t));
  function san(s,m){const p=s.b[m.from].toUpperCase(),capture=s.b[m.to]!=='.'||m.flag==='ep';let txt='';
    if(m.flag==='castle')txt=m.to>m.from?'O-O':'O-O-O';
    else{if(p!=='P'){txt=p;const others=legal(s).filter(x=>x.from!==m.from&&x.to===m.to&&s.b[x.from]===s.b[m.from]);if(others.length){const file=m.from&7,rank=m.from>>4;txt+=!others.some(x=>(x.from&7)===file)?name(m.from)[0]:!others.some(x=>(x.from>>4)===rank)?name(m.from)[1]:name(m.from);}}
      else if(capture)txt=name(m.from)[0];txt+=(capture?'x':'')+name(m.to)+(m.promo?'='+m.promo.toUpperCase():'');}
    const next=apply(s,m);return txt+(checked(next)?legal(next).length?'+':'#':'');
  }
  const key=s=>s.b.join('')+':'+s.t+':'+s.c+':'+(s.ep>=0&&legal(s).some(m=>m.flag==='ep')?s.ep:-1);
  function insufficient(s){const material=[];for(let i=0;i<128;i++){if(!on(i))continue;const p=s.b[i].toLowerCase();if(p!=='.'&&p!=='k')material.push({p,color:((i>>4)+(i&7))%2});}
    return !material.length||(material.length===1&&['b','n'].includes(material[0].p))||(material.every(x=>x.p==='b')&&new Set(material.map(x=>x.color)).size===1);
  }
  function result(history){const s=history[history.length-1],moves=legal(s),check=checked(s);if(!moves.length)return {over:true,label:check?'Checkmate · '+(s.t===1?'Black':'White')+' wins':'Draw · stalemate',check,claim:''};
    if(insufficient(s))return {over:true,label:'Draw · insufficient material',check,claim:''};
    const count=history.reduce((n,x)=>n+(key(x)===key(s)?1:0),0);
    if(s.half>=150||count>=5)return {over:true,label:s.half>=150?'Draw · 75-move rule':'Draw · fivefold repetition',check,claim:''};
    return {over:false,label:(s.t===1?'White':'Black')+' to move'+(check?' · Check!':''),check,claim:count>=3?'threefold repetition':s.half>=100?'50-move rule':''};
  }
  function find(s,str){return legal(s).find(m=>uci(m)===str.toLowerCase());}
  function getSquares(s){const data={};for(let i=0;i<128;i++)if(on(i))data[name(i)]=s.b[i];return data;}
  class Game{
    constructor(initial=START){this.reset(initial);}
    reset(initial=START){this.positions=[fromFen(initial)];this.moves=[];this.claimed='';return this;}
    get state(){return this.positions[this.positions.length-1];}
    get fen(){return fen(this.state);}
    get turn(){return this.state.t===1?'w':'b';}
    legal(from){const all=legal(this.state);return from?all.filter(m=>name(m.from)===from):all;}
    play(str){if(this.status().over||this.claimed)return null;const m=find(this.state,str);if(!m)return null;const before=this.state,entry={uci:uci(m),san:san(before,m),color:before.t===1?'w':'b',full:before.full,from:name(m.from),to:name(m.to),piece:before.b[m.from].toLowerCase(),capture:before.b[m.to]!=='.'||m.flag==='ep',promotion:m.promo||null};this.positions.push(apply(before,m));this.moves.push(entry);return entry;}
    undo(){if(this.positions.length<2)return null;this.positions.pop();this.claimed='';return this.moves.pop();}
    status(){return this.claimed?{over:true,label:'Draw · '+this.claimed,claim:'',check:false}:result(this.positions);}
    claimDraw(){const s=this.status();if(s.claim){this.claimed=s.claim;return true;}return false;}
    movesSAN(){return this.moves.map((m,i)=>`${m.color==='w'?m.full+'.':m.full+'...'} ${m.san}`);}
    pgn(){let out='';for(const move of this.moves){if(move.color==='w')out+=(out?' ':'')+move.full+'. '+move.san;else out+=(out?' ':'')+(this.moves[0]===move?move.full+'... ':'')+move.san;}const status=this.status();const result=!status.over?'*':status.label.startsWith('Checkmate')?(status.label.includes('White')?'1-0':'0-1'):'1/2-1/2';return (out?out+' ':'')+result;}
  }
  root.ChessRules={START,D,SYMBOLS,PIECE_NAMES,on,side,name,idx,uci,fromFen,fen,attacked,checked,apply,pseudo,legal,san,key,insufficient,result,find,getSquares,Game};
})(typeof window!=='undefined'?window:globalThis);
