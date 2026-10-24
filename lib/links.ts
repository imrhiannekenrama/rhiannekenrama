import {supabaseServer} from '@/lib/supabase/server';
import type {Entry} from '@/lib/types';
export async function publicRelated(entryId:string):Promise<{label:string;entry:Entry}[]>{
 try{const db=await supabaseServer();const {data:links}=await db.from('entry_links').select('target_id,label').eq('source_id',entryId).limit(15);if(!links?.length)return [];
 const {data:entries}=await db.from('entries').select('*').in('id',links.map(l=>l.target_id)).eq('visibility','public').is('deleted_at',null).in('status',['published','scheduled']).lte('published_at',new Date().toISOString());return links.map(l=>({label:l.label,entry:(entries||[]).find(e=>e.id===l.target_id)})).filter((x):x is {label:string;entry:Entry}=>!!x.entry);
 }catch{return []}
}
