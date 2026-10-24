import {notFound} from 'next/navigation';
import {requireOwner} from '@/lib/auth';
import {Editor} from '@/components/editor';
export default async function Edit({params}:{params:Promise<{id:string}>}){const {id}=await params;const {db}=await requireOwner();const {data}=await db.from('entries').select('*').eq('id',id).maybeSingle();if(!data||data.deleted_at)notFound();return <Editor initial={data}/>}
