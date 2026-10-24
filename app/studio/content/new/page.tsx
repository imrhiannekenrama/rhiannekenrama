import {Editor} from '@/components/editor';
export default async function New({searchParams}:{searchParams:Promise<{type?:string}>}){const p=await searchParams;return <Editor defaultType={p.type||'journal'}/>}
