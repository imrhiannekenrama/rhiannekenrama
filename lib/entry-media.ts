import type {Block} from '@/lib/types';
import type {SupabaseClient} from '@supabase/supabase-js';
/** Index media references for access-controlled public serving. */
export async function syncMedia(db:SupabaseClient,entryId:string,cover:string|null,blocks:Block[]){
 const ids=[...new Set([...(cover?[cover]:[]),...blocks.filter(b=>['image','file','video'].includes(b.type)&&b.media_id).map(b=>b.media_id!),...blocks.filter(b=>b.type==='gallery').flatMap(b=>b.media_ids||[])])];
 const {error:dropError}=await db.from('entry_media').delete().eq('entry_id',entryId);
 if(dropError)throw dropError;
 if(ids.length){const {error}=await db.from('entry_media').insert(ids.map(media_id=>({entry_id:entryId,media_id})));if(error)throw error;}
}