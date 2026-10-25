import type {Metadata} from 'next';
import {MathBackdrop} from '@/components/math-backdrop';

export const metadata:Metadata={
  title:"Castle Chess — Ken's Chess Academy",
  description:"Play chess against five versions of Ken — from Pawn Ken, just learning the rules, to Peak Ken at full strength. 204 guided lessons and 52 puzzles, all offline in your browser."
};

export default function CastleChessPage(){
 return <main id="main" className="scene">
  <section className="page-head" data-glow><MathBackdrop/><div className="container" style={{position:'relative'}}>
    <div className="eyebrow">Games / Castle Chess</div>
    <h1>Ken’s Chess Academy.</h1>
    <p>Challenge five versions of Ken — from Pawn Ken, just learning the rules, to Peak Ken at full strength. Study 204 guided lessons, solve 52 puzzles, and grow your game, all inside your browser.</p>
  </div></section>
  <section className="section container" style={{paddingTop:0}}>
    <iframe
      src="/games/castle-chess/"
      title="Ken's Chess Academy"
      loading="lazy"
      style={{display:'block',width:'100%',height:'min(88vh,1080px)',border:'1px solid #3d4e6e',borderRadius:'18px',background:'#101b19'}}
    />
    <p style={{textAlign:'center',color:'#8fa3c4',fontSize:'.85rem',marginTop:10}}>
      Your lessons, puzzles and match progress save in this browser only — no accounts, nothing stored on the server.
    </p>
  </section>
 </main>;
}
