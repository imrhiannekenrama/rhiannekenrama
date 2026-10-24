'use client';
import {useState,useEffect} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Menu,X,Search} from 'lucide-react';

const mainNav=[['/','Home'],['/about','About'],['/explore','Explore'],['/ideas','Ideas'],['/achievements','Achievements'],['/contact','Contact']] as const;
export function SiteHeader({name='Rhianne Ken S. Rama'}:{name?:string}){
 const [open,setOpen]=useState(false);const path=usePathname();
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);};
  document.addEventListener('keydown',onKey);const onResize=()=>{if(window.innerWidth>950)setOpen(false);};window.addEventListener('resize',onResize);
  return ()=>{document.removeEventListener('keydown',onKey);window.removeEventListener('resize',onResize);};},[open]);
 useEffect(()=>{setOpen(false);},[path]);
 return <header className="site-header"><div className="container site-header-inner">
  <Link href="/" className="logo" onClick={()=>setOpen(false)} aria-label={`${name} — Homepage`}><span className="logo-mark" aria-hidden>RR</span><span className="site-name">{name}</span></Link>
  <nav className="nav" aria-label="Main navigation">
    {mainNav.map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}
    <Link href="/search" aria-label="Search the website" title="Search"><Search size={19}/></Link>
  </nav>
  <button className="icon-button menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls="mobile-site-nav" onClick={()=>setOpen(v=>!v)}>{open?<X/>:<Menu/>}</button>
 </div>{open&&<nav id="mobile-site-nav" className="container nav-mobile" aria-label="Mobile navigation">{mainNav.map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}<Link href="/search">Search</Link></nav>}</header>;
}
export function SiteFooter({name='Rhianne Ken S. Rama'}:{name?:string}){return <footer className="footer"><div className="container space wrap"><div><strong>{name}</strong><p className="small" style={{margin:'4px 0'}}>Books, research, photographs and moments from my life.</p></div><div className="flex wrap"><Link href="/about" className="small">About Me</Link><Link href="/explore" className="small">Explore</Link><Link href="/ideas" className="small">Ideas</Link><Link href="/achievements" className="small">Achievements</Link><Link href="/contact" className="small">Contact</Link></div></div></footer>}

