import type {Metadata,Viewport} from 'next';
import Script from 'next/script';
import './globals.css';
import './motion.css';
import {SiteHeader,SiteFooter} from '@/components/site-header';
import {KitMotion} from '@/components/motion';
import {BackToTop} from '@/components/back-to-top';
import {settings} from '@/lib/data';
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#090e1b'};
export async function generateMetadata():Promise<Metadata>{const s=await settings();return {title:{default:s.site_name,template:`%s | ${s.site_name}`},description:s.tagline,metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'),icons:{icon:'/favicon.svg'},openGraph:{type:'website',title:s.site_name,description:s.tagline,images:['/og-cover.svg']}};}
export default async function RootLayout({children}:{children:React.ReactNode}){const s=await settings();return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><KitMotion/><SiteHeader name={s.site_name}/>{children}<SiteFooter name={s.site_name}/><BackToTop/><Script id="ken-ai-agent" src="https://cdn.jotfor.ms/agent/embedjs/01a16da4bbf8700082aac85e54da50062729/embed.js" strategy="afterInteractive"/></body></html>}
