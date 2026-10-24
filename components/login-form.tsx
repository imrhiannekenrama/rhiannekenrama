'use client';
import {useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {supabaseBrowser} from '@/lib/supabase/browser';
import Link from 'next/link';
export function LoginForm(){const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[code,setCode]=useState(''),[factor,setFactor]=useState(''),[challenge,setChallenge]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);const router=useRouter();
 async function login(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{const db=supabaseBrowser();const {data,error}=await db.auth.signInWithPassword({email,password});if(error)throw error;
 const {data:account}=await db.from('owner_accounts').select('user_id').eq('user_id',data.user.id).maybeSingle();if(!account){await db.auth.signOut();throw new Error('This account is not the authorized owner.');}
 const {data:aal,error:aalError}=await db.auth.mfa.getAuthenticatorAssuranceLevel();if(aalError)throw aalError;
 if(aal?.nextLevel==='aal2'&&aal.currentLevel!=='aal2'){
  const {data:factors,error:fErr}=await db.auth.mfa.listFactors();if(fErr)throw fErr;
  const verified=factors?.totp?.find(f=>f.status==='verified');if(!verified)throw new Error('A verified authenticator is required.');
  const {data:challengeData,error:cErr}=await db.auth.mfa.challenge({factorId:verified.id});if(cErr)throw cErr;
  setFactor(verified.id);setChallenge(challengeData.id);setPassword('');return;
 }
 router.push('/studio');router.refresh();
 }catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function verify(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{const db=supabaseBrowser();const {error}=await db.auth.mfa.verify({factorId:factor,challengeId:challenge,code});if(error)throw error;router.push('/studio');router.refresh()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <div className="card"><h2 style={{fontSize:'1.6rem'}}>Owner sign in</h2>{!factor?<form onSubmit={login}><p>Enter your credentials to access Creator Studio.</p><div className="field"><label htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="username" className="input" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field"><label htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete="current-password" className="input" required value={password} onChange={e=>setPassword(e.target.value)}/></div>{error&&<div className="notice error" role="alert">{error}</div>}<button type="submit" className="button" disabled={busy} style={{width:'100%'}}>{busy?'Verifying...':'Sign in to Creator Studio'}</button></form>:<form onSubmit={verify}><p>Enter the six-digit code from your authenticator app.</p><div className="field"><label htmlFor="otp">Authenticator code</label><input id="otp" className="input" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value)} required/></div>{error&&<div className="notice error" role="alert">{error}</div>}<button type="submit" className="button" disabled={busy}>{busy?'Checking code...':'Verify second factor'}</button><button type="button" className="button-ghost" onClick={()=>{setFactor('');setChallenge('');setCode('')}}>Back to password sign-in</button></form>}<div className="divider"/><Link href="/" className="small muted">← Return to public website</Link><p className="tiny" style={{marginTop:18}}>No public account registration. Enable authenticator MFA from Studio → Settings.</p></div>
}
