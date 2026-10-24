import {requireOwner} from '@/lib/auth';
import {Designer} from '@/components/designer';
export default async function Design(){const {db}=await requireOwner();const {data}=await db.from('site_settings').select('*').eq('id',1).single();return <><div className="studio-title"><span className="eyebrow">Studio / Page Designer</span><h1>Design Your Universe</h1><p>Rearrange homepage sections, hide unused areas and update your site identity.</p></div>{data&&<Designer settings={data}/>}</>}
