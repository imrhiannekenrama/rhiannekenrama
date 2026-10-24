import {NextRequest,NextResponse} from 'next/server';
import {secureOwner,reject} from '@/lib/api';
/** Owner-only JSON metadata export. Files must be backed up separately via Supabase Storage. */
export async function GET(req:NextRequest){const o=await secureOwner(req);if(o.error)return o.error;const db=o.owner!.db;const tables=['entries','entry_links','entry_revisions','entry_media','media','site_settings','contact_messages'] as const;
 const payload:Record<string,unknown>={format:'the-human-os-json-v1',created_at:new Date().toISOString(),note:'Media file metadata included; binary objects must be backed up from Supabase Storage.'};
 for(const t of tables){const {data,error}=await db.from(t).select('*').limit(10000);if(error)return reject(`Export failed: ${t}`,500);payload[t]=data||[];}
 return new NextResponse(JSON.stringify(payload,null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':`attachment; filename="the-human-os-export-${new Date().toISOString().slice(0,10)}.json"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
