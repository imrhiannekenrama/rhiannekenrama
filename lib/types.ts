export type EntryType = 'book'|'research'|'album'|'course'|'journal'|'project'|'idea'|'achievement'|'page';
export type EntryStatus = 'draft'|'scheduled'|'published'|'archived';
export type Visibility = 'private'|'unlisted'|'public';
export type Block = { id:string; type:'paragraph'|'heading'|'quote'|'list'|'image'|'file'|'divider'|'gallery'|'video'; text:string; media_id?:string; media_ids?:string[]; interval?:number };
export type Entry = {
 id:string; type:EntryType; slug:string; title:string; summary:string; body:Block[]; tags:string[]; metadata:Record<string,string>;
 cover_media_id:string|null; status:EntryStatus; visibility:Visibility; published_at:string|null;
 share_token:string; created_at:string; updated_at:string; deleted_at:string|null;
};
export type Media = {id:string;path:string;filename:string;mime:string;bytes:number;alt_text:string;caption:string;created_at:string};
export type Settings = {id:1;site_name:string;tagline:string;intro:string;about:string;contact_email:string;portrait_media_id:string|null;accent:'lavender'|'cyan'|'amber';show_contact:boolean;home_sections?:string[]};
export const sections = [
 {type:'book',label:'Books & Writings',icon:'BookOpen',href:'/books',color:'#f7cc78'},
 {type:'research',label:'Research Lab',icon:'FlaskConical',href:'/research',color:'#73d3fa'},
 {type:'album',label:'Memory Vault',icon:'Camera',href:'/memories',color:'#f19ac1'},
 {type:'course',label:'Learning',icon:'GraduationCap',href:'/learning',color:'#76e7b2'},
 {type:'journal',label:'Life Journal',icon:'NotebookPen',href:'/journal',color:'#bba8ff'},
 {type:'project',label:'Creation Studio',icon:'Rocket',href:'/projects',color:'#fda8a0'},
 {type:'idea',label:'Mind Garden',icon:'BrainCircuit',href:'/ideas',color:'#91a4ff'},
 {type:'achievement',label:'Milestones',icon:'Award',href:'/achievements',color:'#fed28c'},
 {type:'bible',label:'The Word',icon:'Cross',href:'/bible',color:'#f2e2b3'},
 {type:'games',label:'Games',icon:'Gamepad2',href:'/games',color:'#7ee0c9'},
] as const;
export const routeTypes:Record<string,EntryType> = {books:'book',research:'research',memories:'album',learning:'course',journal:'journal',projects:'project',ideas:'idea',achievements:'achievement',pages:'page'};
export function entryHref(e:Pick<Entry,'type'|'slug'>){ const part=Object.keys(routeTypes).find(k=>routeTypes[k]===e.type)||'pages';return `/${part}/${encodeURIComponent(e.slug)}`; }
export function isLive(e:Pick<Entry,'status'|'published_at'|'visibility'|'deleted_at'>){return !e.deleted_at && e.visibility==='public' && ['published','scheduled'].includes(e.status) && !!e.published_at && new Date(e.published_at).getTime()<=Date.now();}