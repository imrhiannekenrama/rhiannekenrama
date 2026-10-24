import {NextRequest,NextResponse} from 'next/server';
import {secureOwner,reject} from '@/lib/api';
const max=15*1024*1024;
function sniff(b:Buffer):string|null{
 if(b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';
 if(b.length>=3&&b.subarray(0,3).equals(Buffer.from([255,216,255])))return 'image/jpeg';
 if(b.length>=12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')return 'image/webp';
 if(b.length>=6&&['GIF87a','GIF89a'].includes(b.toString('ascii',0,6)))return 'image/gif';
 if(b.length>=5&&b.toString('ascii',0,5)==='%PDF-')return 'application/pdf';
 return null;
}
export async function POST(req:NextRequest){const o=await secureOwner(req);if(o.error)return o.error;try{const form=await req.formData();const item=form.get('file');if(!(item instanceof File))return reject('Choose a file.');if(item.size>max||item.size===0)return reject('File must be between 1 byte and 15MB.',413);const bytes=Buffer.from(await item.arrayBuffer());const mime=sniff(bytes);if(!mime)return reject('Only PNG, JPEG, GIF, WEBP and PDF files are supported.');const ext={'image/png':'png','image/jpeg':'jpg','image/gif':'gif','image/webp':'webp','application/pdf':'pdf'}[mime];const path=`${o.owner!.user.id}/${crypto.randomUUID()}.${ext}`;const db=o.owner!.db;const {error}=await db.storage.from('archive').upload(path,bytes,{contentType:mime,upsert:false});if(error)return reject(error.message,400);const {data,error:e}=await db.from('media').insert({path,filename:item.name.slice(0,220),mime,bytes:item.size,alt_text:String(form.get('alt_text')||'').slice(0,250),caption:String(form.get('caption')||'').slice(0,500)}).select('*').single();if(e){await db.storage.from('archive').remove([path]);return reject(e.message,400)}return NextResponse.json({media:data},{status:201});}catch(e){return reject((e as Error).message,400)}}
