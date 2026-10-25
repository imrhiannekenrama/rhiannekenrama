import type {Metadata} from 'next';
import Link from 'next/link';
import {Gamepad2,ArrowUpRight,Play} from 'lucide-react';
import {MathBackdrop} from '@/components/math-backdrop';

export const metadata:Metadata={title:'Games',description:'Play Buhay Pinoy, a Philippine life simulator — and more games from the universe of Rhianne Ken S. Rama.'};

export default function GamesPage(){
 return <main id="main" className="scene">
  <section className="page-head" data-glow><MathBackdrop/><div className="container" style={{position:'relative'}}>
    <div className="eyebrow">Arcade</div>
    <h1>Games.</h1>
    <p>Little worlds to play in, made with the same love as everything else here. More games are coming.</p>
  </div></section>
  <section className="section container">
    <div className="grid two bp-hub">
      <Link href="/games/buhay-pinoy" className="card bp-herocard">
        <span className="bp-badge"><Gamepad2 size={15}/> Life Simulator</span>
        <h3 style={{fontSize:'1.6rem',margin:'12px 0 6px'}}>Buhay Pinoy</h3>
        <p>Grow up from baby to senior anywhere in the Philippines — study, work, fall in love, run a sari-sari store, survive typhoons, celebrate fiestas. Almost a thousand true-to-life situations, all yours to decide.</p>
        <span className="button bp-playbtn"><Play size={16}/> Play now <ArrowUpRight size={14}/></span>
        <div className="bp-heroart" aria-hidden>
          <svg viewBox="0 0 60 30" width="60"><path d="M6 12 a12 12 0 0 1 16 -7" stroke="#ffd166" strokeWidth="3" fill="none" strokeLinecap="round"/><circle cx="10" cy="20" r="5" fill="#ffd166"/><circle cx="24" cy="22" r="7" fill="#7ee0c9"/><circle cx="38" cy="19" r="5" fill="#ff9db3"/><path d="M46 8 q3 7 10 8 -7 2 -10 8 -3 -6 -10 -8 7 -1 10 -8" fill="#a9a5ff"/></svg>
        </div>
      </Link>
      <div className="card bp-soon">
        <span className="bp-badge bp-badge-soon">Coming soon</span>
        <h3 style={{margin:'12px 0 6px'}}>More games</h3>
        <p>Ken is building more Filipino-made games for this arcade. Keep an eye on this space — the universe keeps growing.</p>
        <Link href="/explore" className="button-ghost" style={{marginTop:12}}>Back to the galaxy <ArrowUpRight size={14}/></Link>
      </div>
    </div>
  </section>
 </main>;
}
