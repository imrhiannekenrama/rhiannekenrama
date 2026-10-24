import {NextRequest,NextResponse} from 'next/server';
import {secureOwner,reject} from '@/lib/api';
export async function GET(req:NextRequest){const o=await secureOwner(req);if(o.error)return o.error;const {data,error}=await o.owner!.db.from('media').select('*').order('created_at',{ascending:false}).limit(300);return error?reject(error.message,500):NextResponse.json({items:data});}
export async function PATCH(req:NextRequest){const o=await secureOwner(req);if(o.error)return o.error;const d=await req.json();const {data,error}=await o.owner!.db.from('media').update({alt_text:String(d.alt_text||'').slice(0,250),caption:String(d.caption||'').slice(0,500)}).eq('id',d.id).select('*').single();return error?reject(error.message,400):NextResponse.json({media:data});}
export async function DELETE(req:NextRequest){const o=await secureOwner(req);if(o.error)return o.error;const id=req.nextUrl.searchParams.get('id');if(!id)return reject('Missing ID');const db=o.owner!.db;const {data:record}=await db.from('media').select('*').eq('id',id).maybeSingle();if(!record)return reject('Missing media',404);
 const {count:cover}=await db.from('entries').select('id',{head:true,count:'exact'}).eq('cover_media_id',id);
 const {count:attached}=await db.from('entry_media').select('entry_id',{head:true,count:'exact'}).eq('media_id',id);
 const {data:portrait}=await db.from('site_settings').select('portrait_media_id').eq('id',1).single();
 if(portrait?.portrait_media_id===id)return reject('This is your active profile photo. Remove it from Studio → Settings before deleting.',409);
 if((cover||0)+(attached||0)>0)return reject('File is used by content. Remove it from those entries before deletion.',409);
 const {error}=await db.storage.from('archive').remove([record.path]);if(error)return reject(error.message);const {error:e}=await db.from('media').delete().eq('id',id);return e?reject(e.message):NextResponse.json({ok:true});}
