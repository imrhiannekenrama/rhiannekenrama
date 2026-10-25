'use strict';
window.KenEngines = {};
window.K = {
  rand:n=>Math.floor(Math.random()*n),
  pick:a=>a[Math.floor(Math.random()*a.length)],
  shuffle:a=>{a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},
  make:(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;},
  escape:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  button:(txt,fn,cls='btn')=>{let b=K.make('button',cls,txt);b.type='button';b.addEventListener('click',fn);return b;},
  choice:(n=4,correct)=>{let set=new Set([correct]);while(set.size<n){let delta=K.rand(17)+1;set.add(correct+(Math.random()<.5?-delta:delta));}return K.shuffle([...set]);},
  deck:()=>K.shuffle(Array.from({length:52},(_,i)=>({suit:Math.floor(i/13),rank:i%13+1}))),
  cardText:c=>c?(['A','2','3','4','5','6','7','8','9','10','J','Q','K'][c.rank-1]+['♠','♥','♦','♣'][c.suit]):'?',
  cardHtml:c=>c?`<div class="playing-card ${[1,2].includes(c.suit)?'red':''}">${K.cardText(c)}</div>`:'<div class="playing-card back">KEN</div>',
  grid:(root,arr,cols,action,cls='cell')=>{const wrap=K.make('div','cell-grid');wrap.style.setProperty('--cols',cols);arr.forEach((x,i)=>{const b=K.make('button',cls,x);b.type='button';b.addEventListener('click',()=>action(i,b));wrap.append(b);});root.append(wrap);return wrap;},
  positions:(rows,cols,i)=>{let r=Math.floor(i/cols),c=i%cols,out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;let y=r+dr,x=c+dc;if(y>=0&&y<rows&&x>=0&&x<cols)out.push(y*cols+x);}return out;},
};
