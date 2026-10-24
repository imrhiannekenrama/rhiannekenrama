import {NextRequest,NextResponse} from 'next/server';
import {secureOwner,reject} from '@/lib/api';
export async function PATCH(req:NextRequest){
 const o=await secureOwner(req);if(o.error)return o.error;
 const d=await req.json();
 const portrait=d.portrait_media_id===null||d.portrait_media_id===''?null:String(d.portrait_media_id||'');
 if(portrait){
   if(!/^[a-f0-9-]{36}$/i.test(portrait))return reject('Invalid portrait media ID',400);
   const {data:media,error:mediaError}=await o.owner!.db.from('media').select('id,mime').eq('id',portrait).maybeSingle();
   if(mediaError||!media||!media.mime.startsWith('image/'))return reject('Choose a valid uploaded image for your portrait.',400);
 }
 const next={
   site_name:String(d.site_name||'Rhianne Ken S. Rama').slice(0,70),
   tagline:String(d.tagline||'').slice(0,250),
   intro:String(d.intro||'').slice(0,1500),
   about:String(d.about||'').slice(0,15000),
   contact_email:String(d.contact_email||'').slice(0,200),
   portrait_media_id:portrait,
   show_contact:Boolean(d.show_contact),
   accent:['lavender','cyan','amber'].includes(d.accent)?d.accent:'lavender',
   updated_at:new Date().toISOString()
 };
 const {error}=await o.owner!.db.from('site_settings').update(next).eq('id',1);
 return error?reject(error.message):NextResponse.json({ok:true});
}
