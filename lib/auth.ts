import {supabaseServer} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
export async function getOwner(){
 const db=await supabaseServer();
 const {data:{user}}=await db.auth.getUser();
 if(!user)return null;
 const {data}=await db.from('owner_accounts').select('user_id').eq('user_id',user.id).maybeSingle();
 if(!data)return null;const {data:level}=await db.auth.mfa.getAuthenticatorAssuranceLevel();if(level?.nextLevel==='aal2'&&level.currentLevel!=='aal2')return null;return {user,db};
}
export async function requireOwner(){const o=await getOwner();if(!o)redirect('/owner/login?next=%2Fstudio');return o;}
export async function apiOwner(){return getOwner();}
