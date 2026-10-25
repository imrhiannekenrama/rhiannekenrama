'use client';
import {useEffect,useRef,useState,useMemo} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {ChevronLeft,ChevronRight,Minus,Plus,BookOpen,X,Search,ArrowUpRight,Sparkles} from 'lucide-react';

/* The Word — Scripture reader.
   Bible text (World English Bible & King James Version, public domain) is hosted
   in the site's public storage and fetched per book on demand. */
type BookMeta={osis:string;name:string;id:number;testament:string;chapters:number};
type Verse={number:number;text:string};
type Chapter={chapter:number;verses:Verse[]};
type BookJson={chapters:Chapter[]};
const BASE=(process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/storage/v1/object/public/site-assets/bible';
const VERSIONS=[{slug:'web',short:'WEB',label:'World English Bible'},{slug:'kjv',short:'KJV',label:'King James Version'}];
const FONT_KEY='rkr-word-font',LAST_KEY='rkr-word-last';
const DEFAULTS={v:'web',b:'John',c:1};

export function ScriptureReader(){
 const params=useSearchParams();
 const [version,setVersion]=useState<string>(params.get('v')||'');
 const [manifest,setManifest]=useState<BookMeta[]|null>(null);
 const [bookOsis,setBookOsis]=useState<string>(params.get('b')||'');
 const [chapter,setChapter]=useState<number>(Math.max(1,parseInt(params.get('c')||'')||0)||0);
 const [book,setBook]=useState<BookJson|null>(null);
 const [loading,setLoading]=useState(true);
 const [err,setErr]=useState<string|null>(null);
 const [fontSize,setFont]=useState<number>(18);
 const [picker,setPicker]=useState(false);
 const [query,setQuery]=useState('');
 const cache=useRef<Record<string,Promise<BookJson>>>({});

 /* Restore last-read position when no deep link is present */
 useEffect(()=>{try{
   if(!version)setVersion(localStorage.getItem(LAST_KEY)?.match(/"v":"([^"]+)"/)?.[1]||DEFAULTS.v);
   if(!bookOsis)setBookOsis(localStorage.getItem(LAST_KEY)?.match(/"b":"([^"]+)"/)?.[1]||DEFAULTS.b);
   if(!chapter)setChapter((parseInt(localStorage.getItem(LAST_KEY)?.match(/"c":(\d+)/)?.[1]||'')||DEFAULTS.c));
   setFont(clamp(parseInt(localStorage.getItem(FONT_KEY)||'18')));
 }catch{}},[]);
 const clamp=(n:number)=>Math.min(24,Math.max(15,n)||18);

 /* Manifest for the chosen version */
 useEffect(()=>{let live=true;fetch(`${BASE}/manifest-${version}.json`).then(r=>{if(!r.ok)throw 0;return r.json()}).then(m=>{if(live)setManifest(m)}).catch(()=>{if(live)setErr('Could not load the book list.')});return()=>{live=false}},[version]);

 const meta=useMemo(()=>manifest?.find(m=>m.osis===bookOsis),[manifest,bookOsis]);

 /* Book text */
 useEffect(()=>{if(!bookOsis||!meta)return;let live=true;setLoading(true);setErr(null);
   const key=version+'/'+bookOsis;
   const p=cache.current[key]||(cache.current[key]=fetch(`${BASE}/${version}/${bookOsis}.json`).then(r=>{if(!r.ok)throw 0;return r.json()}));
   p.then(d=>{if(live){setBook(d);setLoading(false)}}).catch(()=>{if(live){setErr('Could not load this book.');setLoading(false)}});
   return()=>{live=false};
 },[version,bookOsis,meta]);

 /* Keep URL + last position in sync so chapters can be shared */
 useEffect(()=>{if(!meta)return;const v=VERSIONS.find(x=>x.slug===version)!;
   try{window.history.replaceState(null,'',`/bible?v=${version}&b=${bookOsis}&c=${chapter}`);}catch{}
   try{localStorage.setItem(LAST_KEY,JSON.stringify({v:version,b:bookOsis,c:chapter}))}catch{}
 },[version,bookOsis,chapter,meta]);

 const go=(dir:1|-1)=>{if(!meta)return;
   if(dir>0&&chapter<meta.chapters)setChapter(chapter+1);
   else if(dir>0){const i=manifest!.findIndex(m=>m.osis===bookOsis);if(i>=0&&i<manifest!.length-1){setBookOsis(manifest![i+1].osis);setChapter(1);window.scrollTo({top:0})}else setChapter(meta.chapters)}
   else if(dir<0&&chapter>1)setChapter(chapter-1);
   else if(dir<0){const i=manifest!.findIndex(m=>m.osis===bookOsis);if(i>0){setBookOsis(manifest![i-1].osis);setChapter(manifest![i-1].chapters);window.scrollTo({top:0})}else setChapter(1)}
 };

 /* Keyboard chapter navigation */
 useEffect(()=>{const h=(e:KeyboardEvent)=>{const t=e.target as HTMLElement;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'))return;
   if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)});

 const chData=useMemo(()=>book?.chapters.find(c=>c.chapter===chapter)||null,[book,chapter]);
 const changeFont=(d:number)=>{const n=clamp(fontSize+d);setFont(n);try{localStorage.setItem(FONT_KEY,String(n))}catch{}};
 const vLabel=VERSIONS.find(x=>x.slug===version)?.short||'WEB';
 const filtered=useMemo(()=>{const q=query.trim().toLowerCase();if(!manifest)return[];
   return q?manifest.filter(m=>m.name.toLowerCase().includes(q)):manifest},[manifest,query]);

 const group=(t:string)=>filtered.filter(m=>m.testament===t);

 return <div className="stack word-shell">
  <div className="card word-toolbar">
    <div className="flex wrap" style={{gap:8}}>
      {VERSIONS.map(v=><button key={v.slug} className={version===v.slug?'word-vbtn selected':'word-vbtn'} onClick={()=>setVersion(v.slug)} aria-pressed={version===v.slug} title={v.label}>{v.short}</button>)}
    </div>
    <button className="button-outline" onClick={()=>{setPicker(!picker);setQuery('')}} aria-expanded={picker}>
      <BookOpen size={16}/> {meta?`${meta.name} ${chapter}`:'Choose a book'}
    </button>
    <div className="flex" style={{marginLeft:'auto'}}>
      <button className="icon-button" onClick={()=>changeFont(-1)} aria-label="Smaller text"><Minus size={16}/></button>
      <button className="icon-button" onClick={()=>changeFont(1)} aria-label="Larger text"><Plus size={16}/></button>
    </div>
  </div>

  {picker&&<div className="card word-picker" role="dialog" aria-label="Choose a book">
    <div className="space wrap" style={{marginBottom:14}}>
      <div className="flex" style={{flex:1,minWidth:200}}><Search size={16} className="muted"/><input className="input" style={{border:'none',background:'transparent',padding:'6px 2px'}} placeholder="Search books…" value={query} onChange={e=>setQuery(e.target.value)} autoFocus aria-label="Search books"/></div>
      <button className="icon-button" onClick={()=>setPicker(false)} aria-label="Close book picker"><X size={16}/></button>
    </div>
    {['OT','NT'].map(t=><div key={t} style={{marginBottom:12}}>
      <div className="eyebrow" style={{margin:'8px 0 7px'}}>{t==='OT'?'Old Testament':'New Testament'}</div>
      <div className="word-bookgrid">{group(t).map(m=><button key={m.osis} className={m.osis===bookOsis?'word-bbtn selected':'word-bbtn'} onClick={()=>{setBookOsis(m.osis);setChapter(1);setPicker(false)}}>{m.name}</button>)}</div>
    </div>)}
    {meta&&<div style={{marginTop:6}}>
      <div className="eyebrow" style={{margin:'8px 0 7px'}}>{meta.name} — chapters</div>
      <div className="word-chapgrid">{Array.from({length:meta.chapters},(_,i)=>i+1).map(n=><button key={n} className={n===chapter?'word-cbtn selected':'word-cbtn'} onClick={()=>{setChapter(n);setPicker(false)}}>{n}</button>)}</div>
    </div>}
  </div>}

  <div className="reading word-read" style={{fontSize, lineHeight:1.85}}>
    {loading&&!chData&&<div className="word-skeleton" aria-live="polite">Loading {meta?meta.name+' '+chapter:''}…</div>}
    {err&&<div className="notice error">{err} <button className="button-ghost" onClick={()=>{setBookOsis(bookOsis);setChapter(chapter)}}>Try again</button></div>}
    {chData&&!loading&&<>
      <header className="word-title">
        <div className="eyebrow">{vLabel} · {meta?.testament==='OT'?'Old Testament':'New Testament'}</div>
        <h2 style={{margin:'6px 0 18px'}}>{meta?.name} {chapter}</h2>
      </header>
      <div className="word-verses">
        {groupVerses(chData.verses).map((g,i)=><p key={i}>{g.map((v,j)=><span key={v.number}>{j>0&&' '}<span className="vnum">{v.number}</span> {v.text}</span>)}</p>)}
      </div>
      <div className="flex wrap" style={{marginTop:26,justifyContent:'space-between'}}>
        <button className="button-outline" onClick={()=>go(-1)}><ChevronLeft size={16}/> Previous</button>
        <span className="small muted">{chapter} of {meta?.chapters}</span>
        <button className="button-outline" onClick={()=>go(1)}>Next <ChevronRight size={16}/></button>
      </div>
    </>}
  </div>

  <div className="flex wrap" style={{justifyContent:'center'}}>
    <Link href="/bible/stories" className="button-ghost"><Sparkles size={15}/> Stories of hope &amp; miracles <ArrowUpRight size={14}/></Link>
  </div>
 </div>;
}

/* Group verses into readable paragraphs */
function groupVerses(verses:Verse[]):Verse[][]{
 const out:Verse[][]=[];let cur:Verse[]=[];
 for(const v of verses){
   cur.push(v);
   const endsSentence=/[.!?””]$/.test(v.text.trim());
   const psalmLike=verses.length>25&&verses.length<200&&cur.length===2;
   if((cur.length>=3&&endsSentence)||cur.length>=5||psalmLike){out.push(cur);cur=[]}
 }
 if(cur.length)out.push(cur);
 return out;
}
