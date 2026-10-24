'use client';
import {useState,useEffect} from 'react';
import Link from 'next/link';
import type {Entry} from '@/lib/types';
import {entryHref} from '@/lib/types';
import {supabaseBrowser} from '@/lib/supabase/browser';
export function SearchUI(){const [q,setQ]=useState('');const [items,setItems]=useState<Entry[]>([]);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{let cancelled=false;const timer=setTimeout(async()=>{if(!q.trim()){setItems([]);return;}setBusy(true);const db=supabaseBrowser();const term=q.trim().replace(/[%_,()]/g,'').slice(0,80);const {data,error}=await db.from('entries').select('*').eq('visibility','public').is('deleted_at',null).in('status',['published','scheduled']).lte('published_at',new Date().toISOString()).or(`title.ilike.%${term}%,summary.ilike.%${term}%`).limit(30);if(!cancelled){setItems(data||[]);setError(error?.message||'');setBusy(false)}},350);return()=>{cancelled=true;clearTimeout(timer)}},[q]);
 return <div className="stack"><div className="field"><label htmlFor="query">Search public content</label><input id="query" className="input" placeholder="Try a book, research topic or course..." value={q} onChange={e=>setQ(e.target.value)}/></div>{busy&&<p role="status">Searching...</p>}{error&&<p className="notice error">{error}</p>}{!busy&&q&&items.length===0&&!error&&<div className="empty"><h3>No matching public items</h3><p>Try different words or visit the Universe Explorer.</p></div>}<div className="stack">{items.map(e=><Link className="card" href={entryHref(e)} key={e.id}><span className="eyebrow">{e.type}</span><h3 style={{margin:'7px 0'}}>{e.title}</h3><p>{e.summary}</p></Link>)}</div></div>}
