import {requireOwner} from '@/lib/auth';
import {ContentTable} from '@/components/content-table';
export default async function Library(){const {db}=await requireOwner();const {data,error}=await db.from('entries').select('*').order('updated_at',{ascending:false}).limit(500);return <><div className="studio-title"><span className="eyebrow">Studio / Archive</span><h1>All Content</h1><p>Manage every entry, draft, published work and archived item in one place.</p></div>{error?<div className="notice error">{error.message}</div>:<ContentTable initial={data||[]}/>}</>}
