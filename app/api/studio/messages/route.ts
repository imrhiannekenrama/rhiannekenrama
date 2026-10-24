import {NextRequest,NextResponse} from 'next/server';
import {secureOwner,reject} from '@/lib/api';
export async function PATCH(req:NextRequest){const o=await secureOwner(req);if(o.error)return o.error;const d=await req.json();const {error}=await o.owner!.db.from('contact_messages').update({read_at:d.read?new Date().toISOString():null}).eq('id',d.id);return error?reject(error.message):NextResponse.json({ok:true});}
