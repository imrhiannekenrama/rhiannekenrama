import {NextRequest,NextResponse} from 'next/server';
import {apiOwner} from '@/lib/auth';
export function reject(error:string,status=400){return NextResponse.json({error},{status,headers:{'Cache-Control':'no-store'}});}
export async function secureOwner(req:NextRequest){
 if(!['GET','HEAD','OPTIONS'].includes(req.method)){
  const origin=req.headers.get('origin');
  if(!origin||origin!==req.nextUrl.origin)return {error:reject('Cross-origin write rejected',403)};
 }
 const owner=await apiOwner();if(!owner)return {error:reject('Owner authentication required',401)};
 return {owner};
}
