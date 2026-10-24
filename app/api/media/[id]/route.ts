import {NextRequest,NextResponse} from 'next/server';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {getOwner} from '@/lib/auth';
import {reject} from '@/lib/api';
// A private bucket is used for ALL files. Anonymous files are signed only if used by live public content or a valid unlisted share token.
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){const {id}=await params;if(!/^[a-f0-9-]{36}$/i.test(id))return reject('Not found',404);try{
 const admin=supabaseAdmin();const {data:media}=await admin.from('media').select('*').eq('id',id).maybeSingle();if(!media)return reject('Not found',404);
 let allowed=Boolean(await getOwner());
 if(!allowed){
   const {data:publicPortrait}=await admin.from('site_settings').select('portrait_media_id').eq('id',1).maybeSingle();
   allowed=publicPortrait?.portrait_media_id===id;
   const share=req.nextUrl.searchParams.get('share');
   const {data:direct}=await admin.from('entries').select('id,share_token,status,visibility,published_at,deleted_at').eq('cover_media_id',id).limit(100);
   const {data:links}=await admin.from('entry_media').select('entry_id').eq('media_id',id).limit(100);
   let records=direct||[];
   if(links?.length){const {data:related}=await admin.from('entries').select('id,share_token,status,visibility,published_at,deleted_at').in('id',links.map(l=>l.entry_id));records=[...records,...(related||[])];}
   allowed=allowed||records.some(e=>!e.deleted_at&&['published','scheduled'].includes(e.status)&&e.published_at&&Date.parse(e.published_at)<=Date.now()&&(e.visibility==='public'||(e.visibility==='unlisted'&&!!share&&e.share_token===share)));
 }
 if(!allowed)return reject('Media not available',404);
 const {data,error}=await admin.storage.from('archive').createSignedUrl(media.path,120);if(error||!data?.signedUrl)return reject('Media unavailable',404);
 return NextResponse.redirect(data.signedUrl,{headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return reject('Media unavailable',404)}
}
