'use client';
import {useEffect,useMemo,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {Search,Sparkles,ChevronLeft,ChevronRight,BookOpen,ArrowUpRight,X,Quote} from 'lucide-react';

/* The Word — Stories of Hope & Miracles.
   320 short Bible story retellings with encouragement notes.
   Original paraphrases, not a Bible translation; each links to the passage itself. */
type Story={id:string;title:string;book:string;section:string;kind:string;passage:string;summary:string;takeaway:string;themes:string[];retelling:string;reflection:string;attribution:string};
const BASE=(process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/storage/v1/object/public/site-assets/bible/stories.json';

export function StoryLibrary(){
 const params=useSearchParams();
 const [stories,setStories]=useState<Story[]|null>(null);
 const [err,setErr]=useState<string|null>(null);
 const [query,setQuery]=useState('');
 const [section,setSection]=useState<string>('All');
 const [shown,setShown]=useState(30);
 const [openId,setOpenId]=useState<string|null>(params.get('story'));
 const wantId=useMemo(()=>openId,[openId]);

 useEffect(()=>{let live=true;fetch(BASE).then(r=>{if(!r.ok)throw 0;return r.json()}).then(d=>{if(live)setStories(d.stories)}).catch(()=>{if(live)setErr('Could not load the stories right now.')});return()=>{live=false}},[]);

 const sections=useMemo(()=>['All',...Array.from(new Set((stories||[]).map(s=>s.section)))],[stories]);
 const open=useMemo(()=>stories?.find(s=>s.id===openId)||null,[stories,openId]);

 const filtered=useMemo(()=>{if(!stories)return[];const q=query.trim().toLowerCase();
   return stories.filter(s=>{
     if(section!=='All'&&s.section!==section)return false;
     if(!q)return true;
     return (s.title+' '+s.summary+' '+s.takeaway+' '+s.book+' '+s.passage+' '+s.themes.join(' ')).toLowerCase().includes(q);
   })},[stories,query,section]);

 /* Deep-linkable open story */
 useEffect(()=>{try{
   if(openId)window.history.replaceState(null,'',`/bible/stories?story=${openId}`);
   else window.history.replaceState(null,'','/bible/stories');
 }catch{}},[openId]);

 const move=(d:1|-1)=>{if(!stories||!openId)return;const i=stories.findIndex(s=>s.id===openId);const n=(i+d+stories.length)%stories.length;setOpenId(stories[n].id);window.scrollTo({top:0,behavior:'smooth'})};
 const surprise=()=>{if(!stories)return;setOpenId(stories[Math.floor(Math.random()*stories.length)].id)};

 if(err)return <div className="notice error">{err}</div>;

 /* ---- one story open: comfortable reading view ---- */
 if(open){
  return <article className="card story-detail" aria-live="polite">
   <div className="space wrap" style={{marginBottom:10}}>
     <button className="button-ghost" onClick={()=>setOpenId(null)}><ChevronLeft size={16}/> All stories</button>
     <div className="flex">
       <button className="icon-button" onClick={()=>move(-1)} aria-label="Previous story"><ChevronLeft size={16}/></button>
       <button className="icon-button" onClick={()=>move(1)} aria-label="Next story"><ChevronRight size={16}/></button>
       <button className="icon-button" onClick={()=>setOpenId(null)} aria-label="Close story"><X size={16}/></button>
     </div>
   </div>
   <div className="eyebrow">{open.book} · {open.kind}</div>
   <h2 style={{margin:'8px 0 4px'}}>{open.title}</h2>
   <p className="small muted" style={{margin:'0 0 18px'}}>{open.passage}{open.attribution?` · ${open.attribution}`:''}</p>
   <div className="prose" style={{fontSize:'1.06rem'}}>
     {open.retelling.split(/\n{2,}|\n/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}
   </div>
   {open.reflection&&<blockquote className="story-quote"><Quote size={15} aria-hidden/><div><strong>Encouragement.</strong> {open.reflection}</div></blockquote>}
   <div className="flex wrap" style={{marginTop:20,justifyContent:'space-between'}}>
     <Link className="button" href={passageHref(open)}><BookOpen size={16}/> Read the passage <ArrowUpRight size={14}/></Link>
     <span className="small muted">{open.takeaway}</span>
   </div>
   <p className="tiny muted" style={{marginTop:18}}>A short original paraphrase for encouragement — not a Bible translation. The full text is one click away.</p>
  </article>;
 }

 /* ---- library grid ---- */
 return <div className="stack">
  <div className="card word-toolbar">
    <div className="flex wrap" style={{gap:10,flex:1,minWidth:220}}>
      <Search size={16} className="muted"/>
      <input className="input" style={{border:'none',background:'transparent',padding:'6px 2px'}} placeholder="Search 320 stories, books, or themes…" value={query} onChange={e=>{setQuery(e.target.value);setShown(30)}} aria-label="Search stories"/>
    </div>
    <button className="button-outline" onClick={surprise}><Sparkles size={15}/> Surprise me</button>
  </div>
  <div className="tabs" style={{margin:'0 0 6px'}}>
    {sections.map(s=><button key={s} className={section===s?'selected':''} onClick={()=>{setSection(s);setShown(30)}}>{s.replace(/ Stories$/,'')||s}</button>)}
  </div>
  {!stories&&<div className="word-skeleton" aria-live="polite">Loading stories…</div>}
  {stories&&<>
   <p className="small muted" style={{margin:0}}>{filtered.length} {filtered.length===1?'story':'stories'}{section!=='All'?' · '+section:''}</p>
   <div className="grid three">
     {filtered.slice(0,shown).map((s,i)=><button key={s.id} className="card story-card word-storycard" onClick={()=>setOpenId(s.id)} style={{textAlign:'left',cursor:'pointer',display:'flex',flexDirection:'column',gap:9}}>
       <div><span className="eyebrow">{s.book}</span><h3 style={{margin:'6px 0 6px',fontSize:'1.06rem'}}>{s.title}</h3>
       <p style={{fontSize:'.88rem',margin:0}}>{s.summary}</p></div>
       <div className="story-take">{s.takeaway}</div>
       <div className="flex wrap" style={{gap:5}}>{s.themes.slice(0,3).map(t=><span key={t} className="tag">{t}</span>)}</div>
     </button>)}
   </div>
   {shown<filtered.length&&<div className="flex" style={{justifyContent:'center'}}><button className="button-outline" onClick={()=>setShown(shown+30)}>Show more stories</button></div>}
  </>}
 </div>;
}

/* "Genesis 12:1-9" -> /bible?v=web&b=Genesis&c=12 */
function passageHref(s:Story){
 const m=s.passage.match(/^((?:\d\s)?[A-Za-z ]+?)\s+(\d+)/);
 if(!m)return '/bible';
 return `/bible?v=web&b=${encodeURIComponent(m[1].trim())}&c=${parseInt(m[2])}`;
}
