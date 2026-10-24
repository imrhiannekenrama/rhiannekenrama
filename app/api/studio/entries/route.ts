import {NextRequest,NextResponse} from 'next/server';
import {secureOwner,reject} from '@/lib/api';
import {normalizeEntry,slugify} from '@/lib/validation';
import {syncMedia} from '@/lib/entry-media';
export async function GET(req:NextRequest){const o=await secureOwner(req);if(o.error)return o.error;const {data,error}=await o.owner!.db.from('entries').select('*').order('updated_at',{ascending:false}).limit(500);return error?reject(error.message,500):NextResponse.json({items:data});}
export async function POST(req:NextRequest){const o=await secureOwner(req);if(o.error)return o.error;
 try{const val=normalizeEntry(await req.json());const slug=`${slugify(val.title)}-${crypto.randomUUID().slice(0,7)}`;const {data,error}=await o.owner!.db.from('entries').insert({...val,slug}).select('*').single();if(error)return reject(error.message,400);try{await syncMedia(o.owner!.db,data.id,val.cover_media_id,val.body);}catch(err){return reject(`Entry was saved, but media indexing failed: ${(err as Error).message}`,500)}return NextResponse.json({entry:data},{status:201});}catch(e){return reject((e as Error).message)}
}
