'use client';
import {useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Menu,X,Search,LockKeyhole,ChevronDown} from 'lucide-react';

const mainNav=[['/','Home'],['/about','About'],['/books','Books'],['/research','Research'],['/memories','Photos'],['/journal','Updates'],['/explore','Explore']] as const;
const moreNav=[['/learning','Courses & Skills'],['/projects','Projects'],['/ideas','Ideas'],['/achievements','Achievements'],['/timeline','My Timeline'],['/contact','Contact']] as const;
export function SiteHeader({name='Rhianne Ken S. Rama'}:{name?:string}){
 const [open,setOpen]=useState(false);const path=usePathname();
 return <header className="site-header"><div className="container site-header-inner">
  <Link href="/" className="logo" onClick={()=>setOpen(false)} aria-label={`${name} — Homepage`}><span className="logo-mark" aria-hidden>RR</span><span className="site-name">{name}</span></Link>
  <nav className="nav" aria-label="Main navigation">
    {mainNav.map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}
    <details className="nav-more"><summary>More <ChevronDown size={13}/></summary><div className="nav-dropdown">{moreNav.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</div></details>
    <Link href="/search" aria-label="Search the website" title="Search"><Search size={19}/></Link>
    <Link href="/owner/login" aria-label="Owner sign in" title="Owner sign in"><LockKeyhole size={18}/></Link>
  </nav>
  <button className="icon-button menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls="mobile-site-nav" onClick={()=>setOpen(v=>!v)}>{open?<X/>:<Menu/>}</button>
 </div>{open&&<nav id="mobile-site-nav" className="container nav-mobile" aria-label="Mobile navigation">{[...mainNav,...moreNav].map(([href,label])=><Link key={href} href={href} onClick={()=>setOpen(false)} aria-current={path===href?'page':undefined}>{label}</Link>)}<Link href="/search" onClick={()=>setOpen(false)}>Search</Link><Link href="/owner/login" onClick={()=>setOpen(false)}>Owner Sign In</Link></nav>}</header>;
}
export function SiteFooter({name='Rhianne Ken S. Rama'}:{name?:string}){return <footer className="footer"><div className="container space wrap"><div><strong>{name}</strong><p className="small" style={{margin:'4px 0'}}>Books, research, photographs and moments from my life.</p></div><div className="flex wrap"><Link href="/about" className="small">About Me</Link><Link href="/books" className="small">Books</Link><Link href="/research" className="small">Research</Link><Link href="/memories" className="small">Photos</Link><Link href="/contact" className="small">Contact</Link><Link href="/owner/login" className="small">Owner</Link></div></div></footer>}
