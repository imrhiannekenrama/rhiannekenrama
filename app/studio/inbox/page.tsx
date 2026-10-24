import {requireOwner} from '@/lib/auth';
import {MessageInbox} from '@/components/message-inbox';
export default async function Inbox(){const {db}=await requireOwner();const {data}=await db.from('contact_messages').select('*').order('created_at',{ascending:false}).limit(100);return <><div className="studio-title"><div className="eyebrow">Studio / Connections</div><h1>Contact Inbox</h1><p>Private messages people send through your website.</p></div><MessageInbox initial={data||[]}/></>}
