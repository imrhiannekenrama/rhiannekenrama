import {supabaseServer} from '@/lib/supabase/server';
import type {Entry,Settings} from '@/lib/types';
export const fallbackSettings:Settings={id:1,site_name:'Rhianne Ken S. Rama',tagline:'Writer, researcher, lifelong learner — and everything in between.',intro:'Welcome to my personal space. Explore my books, research, learning journey, photographs, projects, and the stories that shape who I am.',about:'',contact_email:'',portrait_media_id:null,accent:'lavender',show_contact:true,home_sections:['worlds','latest','timeline']};
export async function settings():Promise<Settings>{try{const db=await supabaseServer();const {data}=await db.from('site_settings').select('*').eq('id',1).single();return data||fallbackSettings;}catch{return fallbackSettings;}}
export async function publicEntries(type?:string,search?:string):Promise<Entry[]>{
 try{const db=await supabaseServer();let q=db.from('entries').select('*').is('deleted_at',null).eq('visibility','public').in('status',['published','scheduled']).lte('published_at',new Date().toISOString()).order('published_at',{ascending:false}).limit(120);
 if(type)q=q.eq('type',type);if(search)q=q.or(`title.ilike.%${search.replace(/[,()%]/g,'').slice(0,100)}%,summary.ilike.%${search.replace(/[,()%]/g,'').slice(0,100)}%`);
 const {data,error}=await q;if(error)throw error;return data||[];
 }catch{return [];}
}
export async function publicEntry(slug:string,type?:string):Promise<Entry|null>{
 try{const db=await supabaseServer();let q=db.from('entries').select('*').eq('slug',slug).eq('visibility','public').is('deleted_at',null).in('status',['published','scheduled']).lte('published_at',new Date().toISOString());if(type)q=q.eq('type',type);const {data}=await q.maybeSingle();return data||null;}catch{return null;}
}
