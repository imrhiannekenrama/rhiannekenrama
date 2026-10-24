'use client';
import {useEffect,useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
/** Accessible image carousel: prev/next, dots, auto-advance with pause on hover/focus. */
export function Gallery({mediaIds,caption,share,interval=5}:{mediaIds:string[];caption?:string;share?:string;interval?:number}){
 const [i,setI]=useState(0),[paused,setPaused]=useState(false);
 const n=mediaIds.length,src=(id:string)=>`/api/media/${id}${share?`?share=${share}`:''}`;
 const seconds=Math.max(1,Math.min(30,interval||5));
 const auto=typeof window==='undefined'||!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 useEffect(()=>{if(paused||!auto||n<2)return;const t=setInterval(()=>setI(v=>(v+1)%n),seconds*1000);return()=>clearInterval(t)},[paused,auto,n,seconds]);
 if(!n)return null;
 return <figure className="gallery" style={{margin:'24px 0'}}>
  <div className="gallery-stage" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={()=>setPaused(false)}>
    <img key={mediaIds[i]} src={src(mediaIds[i])} alt={caption||`Photo ${i+1} of ${n}`} fetchPriority="high"/>
    {n>1&&<><button type="button" className="gallery-nav prev" aria-label="Previous photo" onClick={()=>setI(v=>(v+n-1)%n)}><ChevronLeft size={20}/></button>
    <button type="button" className="gallery-nav next" aria-label="Next photo" onClick={()=>setI(v=>(v+1)%n)}><ChevronRight size={20}/></button></>}
  </div>
  {n>1&&<div className="gallery-dots" role="tablist" aria-label="Gallery photos">{mediaIds.map((id,j)=><button type="button" key={id} role="tab" aria-label={`Photo ${j+1}`} aria-selected={j===i} className={j===i?'on':''} onClick={()=>setI(j)}/>)}</div>}
  <div className="gallery-count small muted">{n>1?`${i+1} / ${n}`:''}</div>
  {caption&&<figcaption className="small muted" style={{textAlign:'center'}}>{caption}</figcaption>}
 </figure>;
}