import type {Metadata} from 'next';
import {MathBackdrop} from '@/components/math-backdrop';

export const metadata:Metadata={
  title:"Ken's Arcade — 161 Mini Games",
  description:"161 offline mini games in 8 categories: strategy, Filipino quizzes, cards, puzzles, memory, logic and arcade. Ken is your rival, dealer, puzzle setter and coach."
};

export default function KenArcadePage(){
 return <main id="main" className="scene">
  <section className="page-head" data-glow><MathBackdrop/><div className="container" style={{position:'relative'}}>
    <div className="eyebrow">Games / Ken's Arcade</div>
    <h1>Ken’s Arcade.</h1>
    <p>161 mini games in one place — strategy against Ken, Filipino quizzes, cards, puzzles, memory, logic and arcade. No sign-in, no ads, and no internet needed once loaded. Results save in your browser.</p>
  </div></section>
  <section className="section container" style={{paddingTop:0}}>
    <iframe
      src="/games/ken-arcade/index.html"
      title="Ken's Arcade mini games"
      loading="lazy"
      style={{display:'block',width:'100%',height:'min(88vh,1080px)',border:'1px solid #3d4e6e',borderRadius:'18px',background:'#0b1019'}}
    />
    <p style={{textAlign:'center',color:'#8fa3c4',fontSize:'.85rem',marginTop:10}}>
      Every game runs in your browser — progress and scores stay on this device only.
    </p>
  </section>
 </main>;
}
