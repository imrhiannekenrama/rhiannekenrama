import {NextRequest,NextResponse} from 'next/server';
import {secureOwner,reject} from '@/lib/api';
import {normalizeEntry} from '@/lib/validation';
import {syncMedia} from '@/lib/entry-media';
const validId=(v:string)=>/^[a-f0-9-]{36}$/i.test(v);
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){const o=await secureOwner(req);if(o.error)return o.error;const {id}=await params;if(!validId(id))return reject('Bad identifier');const {data,error}=await o.owner!.db.from('entries').select('*').eq('id',id).single();return error?reject('Not found',404):NextResponse.json({entry:data});}
export async function PUT(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const o=await secureOwner(req);if(o.error)return o.error;const {id}=await params;if(!validId(id))return reject('Bad identifier');
 try{const db=o.owner!.db;const {data:existing,error:e}=await db.from('entries').select('*').eq('id',id).single();if(e||!existing||existing.deleted_at)return reject('Entry not found',404);const val=normalizeEntry(await req.json());
 const {error:revError}=await db.from('entry_revisions').insert({entry_id:id,snapshot:existing});if(revError)return reject(revError.message,500);
 const {data,error}=await db.from('entries').update({...val,updated_at:new Date().toISOString()}).eq('id',id).select('*').single();if(error)return reject(error.message,400);try{await syncMedia(db,id,val.cover_media_id,val.body)}catch(err){return reject(`Entry updated; media indexing failed: ${(err as Error).message}`,500)}return NextResponse.json({entry:data});
 }catch(e){return reject((e as Error).message)}
}
export async function DELETE(req:NextRequest,{params}:{params:Promise<{id:string}>}){const o=await secureOwner(req);if(o.error)return o.error;const {id}=await params;if(!validId(id))return reject('Invalid ID');const {error}=await o.owner!.db.from('entries').update({deleted_at:new Date().toISOString()}).eq('id',id);return error?reject(error.message,400):NextResponse.json({ok:true});}
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){const o=await secureOwner(req);if(o.error)return o.error;const {id}=await params;const data=await req.json();if(data.action!=='restore')return reject('Invalid action');const {error}=await o.owner!.db.from('entries').update({deleted_at:null}).eq('id',id);return error?reject(error.message,400):NextResponse.json({ok:true});}
