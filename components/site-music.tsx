'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {Music,VolumeX} from 'lucide-react';

/* Ambient background music — one track per section of the site.
   All tracks by Kevin MacLeod (incompetech.com), CC BY 4.0.
   Browsers block sound before the first user gesture, so we attempt
   autoplay and, if blocked, start on the visitor's first tap/keypress. */
const TRACKS={
  home:{file:'wholesome.mp3',label:'Wholesome'},
  about:{file:'carefree.mp3',label:'Carefree'},
  books:{file:'gymnopedie-no-1.mp3',label:'Gymnopedie No.1'},
  research:{file:'thinking-music.mp3',label:'Thinking Music'},
  memories:{file:'deliberate-thought.mp3',label:'Deliberate Thought'},
  journal:{file:'meditation-impromptu-01.mp3',label:'Meditation Impromptu 01'},
  explore:{file:'deep-haze.mp3',label:'Deep Haze'},
  fallback:{file:'floating-cities.mp3',label:'Floating Cities'},
} as const;
type TrackKey=keyof typeof TRACKS;
const BASE_VOLUME=0.32;
const STORE_KEY='rkr-music-off';

function trackFor(path:string):TrackKey|null{
  if(path.startsWith('/owner')||path.startsWith('/studio')||path.startsWith('/api')||path.startsWith('/view'))return null;
  if(path==='/')return 'home';
  if(path.startsWith('/about'))return 'about';
  if(path.startsWith('/books'))return 'books';
  if(path.startsWith('/research'))return 'research';
  if(path.startsWith('/memories'))return 'memories';
  if(path.startsWith('/journal'))return 'journal';
  if(path.startsWith('/explore'))return 'explore';
  return 'fallback';
}

export function SiteMusic(){
  const path=usePathname();
  const audioRef=useRef<HTMLAudioElement>(null);
  const currentKey=useRef<TrackKey|null>(null);
  const [playing,setPlaying]=useState(false);
  const [wantOn,setWantOn]=useState<boolean|null>(null); // null = follow autoplay default
  const [label,setLabel]=useState('');

  const fadeTo=(audio:HTMLAudioElement,to:number,ms:number,done?:()=>void)=>{
    const from=audio.volume;const start=performance.now();
    const step=(now:number)=>{const t=Math.min(1,(now-start)/ms);audio.volume=from+(to-from)*t;
      if(t<1)requestAnimationFrame(step);else done&&done();};
    requestAnimationFrame(step);
  };
  const startTrack=(key:TrackKey,audio:HTMLAudioElement)=>{
    const src=`/music/${TRACKS[key].file}`;
    if(currentKey.current!==null&&audio.src.endsWith(src)&&!audio.paused)return;
    const go=()=>{audio.src=src;audio.loop=true;audio.volume=0;
      audio.play().then(()=>{fadeTo(audio,BASE_VOLUME,900);setPlaying(true);setLabel(TRACKS[key].label);currentKey.current=key;})
      .catch(()=>setPlaying(false));};
    if(!audio.paused){fadeTo(audio,0,600,()=>{audio.pause();go();});}else go();
  };

  useEffect(()=>{
    const audio=audioRef.current;if(!audio)return;
    const key=trackFor(path);
    const userOff=typeof window!=='undefined'&&localStorage.getItem(STORE_KEY)==='1';
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldPlay=key!==null&&wantOn!==false&&!userOff&&!reduced;
    if(!key){if(!audio.paused){fadeTo(audio,0,600,()=>audio.pause());}setPlaying(false);return;}
    if(!shouldPlay){if(wantOn===false&&currentKey.current!==null){audio.pause();setPlaying(false);}return;}
    startTrack(key,audio);
    if(audio.paused&&audio.readyState===0&&wantOn!==true){
      // First visit: autoplay may be blocked until the visitor interacts.
      const unlock=()=>{window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock);startTrack(trackFor(window.location.pathname)??'fallback',audioRef.current!);};
      window.addEventListener('pointerdown',unlock,{once:true,passive:true});
      window.addEventListener('keydown',unlock,{once:true,passive:true});
    }
  },[path,wantOn]);

  const toggle=()=>{
    const audio=audioRef.current;if(!audio)return;
    if(playing||!audio.paused){localStorage.setItem(STORE_KEY,'1');setWantOn(false);audio.pause();setPlaying(false);}
    else{localStorage.removeItem(STORE_KEY);setWantOn(true);const key=trackFor(path)??'fallback';startTrack(key,audio);}
  };

  return <>
    <audio ref={audioRef} preload="none"/>
    <button type="button" className={`music-toggle${playing?' is-playing':''}`} aria-pressed={playing} aria-label={playing?`Pause background music (${label})`:'Play background music'} title={playing?`Now playing: ${label} — Kevin MacLeod`:'Play background music'} onClick={toggle}>
      {playing?<Music size={18} aria-hidden/>:<VolumeX size={18} aria-hidden/>}
    </button>
  </>;
}

