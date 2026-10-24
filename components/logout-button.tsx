'use client';
import {useRouter} from 'next/navigation';
import {supabaseBrowser} from '@/lib/supabase/browser';
import {LogOut} from 'lucide-react';
export function Logout(){const router=useRouter();return <button className="button-ghost" onClick={async()=>{await supabaseBrowser().auth.signOut();router.replace('/');router.refresh()}}><LogOut size={16}/> Sign out</button>}
