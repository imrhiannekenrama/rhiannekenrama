export const revalidate=60;
import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {routeTypes,sections} from '@/lib/types';
import {publicEntries} from '@/lib/data';
import {EntryGrid} from '@/components/public-ui';
import {ArrowLeft} from 'lucide-react';
export async function generateMetadata({params}:{params:Promise<{collection:string}>}):Promise<Metadata>{const {collection}=await params;return {title:sections.find(s=>s.href===`/${collection}`)?.label||'Pages'};}
export default async function Collection({params}:{params:Promise<{collection:string}>}){const {collection}=await params;const type=routeTypes[collection];if(!type)notFound();const section=sections.find(s=>s.type===type);const entries=await publicEntries(type);return <main id="main" className={type==='idea'?'mind-garden':''}><header data-reveal className="page-head"><div className="container"><Link className="small muted flex" href="/explore"><ArrowLeft size={14}/> Back to Universe</Link><div className="eyebrow" style={{marginTop:20}}>World / {section?.label||'Archive'}</div><h1>{section?.label||'My Pages'}</h1><p>{collection==='research'?'Questions, research papers, experiments and findings.':collection==='memories'?'A visual archive of moments worth remembering.':collection==='learning'?'Courses, credentials, new skills and the journey of learning.':collection==='books'?'Stories, books, manuscripts and written work.':collection==='journal'?'Updates, notes and reflections along the way.':collection==='projects'?'Experiments, projects and creative work.':collection==='ideas'?'A bioluminescent garden of thoughts — ideas still glowing in the dark, waiting to grow.':'A connected archive of discoveries and experiences.'}</p></div></header><div className="container section"><p className="eyebrow">{entries.length} published {entries.length===1?'entry':'entries'}</p><EntryGrid entries={entries}/></div></main>}
