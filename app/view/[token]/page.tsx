import {notFound} from 'next/navigation';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {Blocks} from '@/components/public-ui';
import {CopyLink} from '@/components/small-actions';
export const dynamic='force-dynamic';
export const metadata={title:'Shared Private Link',robots:{index:false,follow:false}};
export default async function Shared({params}:{params:Promise<{token:string}>}){const {token}=await params;if(!/^[a-f0-9-]{36}$/i.test(token))notFound();let e;try{const admin=supabaseAdmin();const {data}=await admin.from('entries').select('*').eq('share_token',token).eq('visibility','unlisted').is('deleted_at',null).in('status',['published','scheduled']).lte('published_at',new Date().toISOString()).maybeSingle();e=data;}catch{notFound()}if(!e)notFound();return <main id="main"><div className="page-head"><div className="container"><span className="eyebrow">Unlisted content · Anyone with this link may view</span><h1>{e.title}</h1><p>{e.summary}</p></div></div><div className="container section" style={{maxWidth:900}}>{e.cover_media_id&&<img style={{width:'100%',maxHeight:360,objectFit:'contain',marginBottom:22}} src={`/api/media/${e.cover_media_id}?share=${token}`} alt={e.title}/>}<div className="reading"><Blocks blocks={e.body} share={token}/></div><div style={{marginTop:20}}><CopyLink/></div></div></main>}
