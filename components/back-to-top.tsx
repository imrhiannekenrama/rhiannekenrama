'use client';
import {useEffect,useState} from 'react';
import {ArrowUp} from 'lucide-react';
export function BackToTop(){const [show,setShow]=useState(false);useEffect(()=>{let raf=0;const onScroll=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>setShow(window.scrollY>600));};window.addEventListener('scroll',onScroll,{passive:true});onScroll();return ()=>{window.removeEventListener('scroll',onScroll);cancelAnimationFrame(raf);};},[]);
return <button className={`back-to-top${show?' is-visible':''}`} type="button" aria-label="Back to top" onClick={()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}>{show&&<ArrowUp size={19} aria-hidden/>}</button>;}
