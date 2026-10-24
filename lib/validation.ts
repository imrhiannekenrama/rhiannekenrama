import type {EntryType,EntryStatus,Visibility,Block} from '@/lib/types';
export const types=['book','research','album','course','journal','project','idea','achievement','page'];
export function slugify(text:string){return (text||'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,85)||'entry';}
export function normalizeEntry(raw:Record<string,unknown>){
 const title=String(raw.title||'').trim().slice(0,180);if(!title)throw new Error('A title is required.');
 const type=String(raw.type||'journal') as EntryType;if(!types.includes(type))throw new Error('Invalid content type.');
 const status=(['draft','scheduled','published','archived'].includes(String(raw.status))?raw.status:'draft') as EntryStatus;
 const visibility=(['public','unlisted','private'].includes(String(raw.visibility))?raw.visibility:'private') as Visibility;
 const date=raw.published_at?Date.parse(String(raw.published_at)):NaN;
 let published_at:string|null=null;
 if(status==='published')published_at=Number.isFinite(date)?new Date(date).toISOString():new Date().toISOString();
 if(status==='scheduled'){if(!Number.isFinite(date)||date<=Date.now())throw new Error('Choose a future date and time to schedule publication.');published_at=new Date(date).toISOString();}
 const blocks=Array.isArray(raw.body)?raw.body.slice(0,150):[];
 const body:Block[]=blocks.map((b:Record<string,unknown>,i:number)=>({id:String(b.id||i).slice(0,70),type:(['paragraph','heading','quote','list','image','file','divider','gallery','video'].includes(String(b.type))?b.type:'paragraph') as Block['type'],text:String(b.text||'').slice(0,30000),...(b.media_id?{media_id:String(b.media_id)}:{}),...(Array.isArray(b.media_ids)?{media_ids:b.media_ids.map(String).slice(0,60)}:{}),...(b.type==='gallery'&&Number(b.interval)?{interval:Math.min(30,Math.max(1,Math.round(Number(b.interval))))}:{})}));
 const meta=raw.metadata&&typeof raw.metadata==='object'&&!Array.isArray(raw.metadata)?raw.metadata as Record<string,unknown>:{};
 const metadata=Object.fromEntries(Object.entries(meta).slice(0,30).map(([k,v])=>[k.slice(0,50),String(v||'').slice(0,5000)]));
 const tags=Array.isArray(raw.tags)?raw.tags.slice(0,25).map(t=>String(t).trim().slice(0,40)).filter(Boolean):[];
 const cover_media_id=typeof raw.cover_media_id==='string'&&/^[a-f0-9-]{36}$/i.test(raw.cover_media_id)?raw.cover_media_id:null;
 return {type,title,summary:String(raw.summary||'').slice(0,1400),body,tags,metadata,cover_media_id,status,visibility,published_at};
}