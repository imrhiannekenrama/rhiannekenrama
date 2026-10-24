import Link from 'next/link';
import {ArrowRight,ArrowUpRight,Sparkles,BookOpen,Clock3,Camera,GraduationCap,FileText} from 'lucide-react';
import {publicEntries,settings} from '@/lib/data';
import {Worlds,EntryGrid} from '@/components/public-ui';
import {ProfilePortrait} from '@/components/profile-portrait';
import {SplitHeading} from '@/components/motion';
export default async function Home(){
 const [s,items]=await Promise.all([settings(),publicEntries()]);
 const components:Record<string,React.ReactNode>={
  worlds:<section key="worlds" data-reveal className="section container"><div className="section-heading"><div><div className="eyebrow">Find what interests you</div><h2 style={{margin:'7px 0'}}>Explore my world.</h2><p>Start with a topic, a story, or a question. Every section is one click away.</p></div><Link href="/explore" className="button-outline">Visual explorer <ArrowUpRight size={16}/></Link></div><Worlds/></section>,
  latest:<section key="latest" data-reveal data-delay="0.1" className="section container"><div className="section-heading"><div><div className="eyebrow">What's new</div><h2 style={{margin:'7px 0'}}>Latest from me.</h2><p>New writing, research, courses, and personal updates, as I publish them.</p></div><Link href="/search" className="button-ghost">Browse the archive <ArrowUpRight size={15}/></Link></div><EntryGrid entries={items.slice(0,6)}/></section>,
  timeline:<section key="timeline" data-reveal data-delay="0.15" className="section" style={{background:'#101b30'}}><div className="container two grid" style={{alignItems:'center'}}><div><div className="eyebrow">My story through the years</div><h2>A life still unfolding.</h2><p>Follow the milestones, experiences, and questions that connect the different chapters of my life.</p><Link href="/timeline" className="button">View my timeline <Clock3 size={16}/></Link></div><div className="card" style={{minHeight:230,display:'grid',placeItems:'center'}}><div className="stack" style={{textAlign:'center'}}><BookOpen size={56} color="#b4b1ff" style={{margin:'auto'}}/><h3>Writing. Learning. Becoming.</h3><p>My story, recorded one chapter at a time.</p></div></div></div></section>
 };
 return <main id="main">
  <section className="hero" data-glow><div className="container hero-inner">
    <div className="hero-copy"><div className="eyebrow flex"><Sparkles size={16}/> Welcome to my personal website</div>
      <SplitHeading delay={0.25}>Hi, I’m <span className="gradient-text">{s.site_name}.</span></SplitHeading>
      <p>{s.intro}</p>
      <div className="hero-actions"><Link className="button" href="/about">Get to know me <ArrowRight size={17}/></Link><Link className="button-outline" href="/explore">Explore my work <ArrowUpRight size={16}/></Link></div>
      <div className="flex muted small"><Sparkles size={16} color="#adabff"/> A personal space for everything I write, learn, and create.</div>
    </div>
    <div className="hero-portrait-area"><ProfilePortrait mediaId={s.portrait_media_id} displayName={s.site_name}/></div>
  </div></section>
  <section data-reveal className="container quick-discovery" aria-label="Quick navigation"><div className="quick-discovery-label">Find your way around</div><div className="quick-links">
    <Link href="/books"><BookOpen size={20}/> Books <ArrowUpRight size={13}/></Link>
    <Link href="/research"><FileText size={20}/> Research <ArrowUpRight size={13}/></Link>
    <Link href="/memories"><Camera size={20}/> Photos <ArrowUpRight size={13}/></Link>
    <Link href="/learning"><GraduationCap size={20}/> Courses <ArrowUpRight size={13}/></Link>
    <Link href="/journal"><Sparkles size={20}/> Life Updates <ArrowUpRight size={13}/></Link>
  </div></section>
  {(s.home_sections||['worlds','latest','timeline']).map(k=>components[k]||null)}
 </main>
 }
