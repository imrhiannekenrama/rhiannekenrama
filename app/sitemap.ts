import type {MetadataRoute} from 'next';
import {publicEntries} from '@/lib/data';
import {entryHref} from '@/lib/types';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const origin=(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000').replace(/\/$/,'');const entries=await publicEntries();return [...['','/about','/explore','/bible','/bible/stories','/books','/research','/memories','/learning','/journal','/projects','/contact'].map(p=>({url:origin+p,changeFrequency:'monthly' as const})),...entries.map(e=>({url:origin+entryHref(e),lastModified:e.updated_at,changeFrequency:'weekly' as const}))];}

