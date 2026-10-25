import type {Metadata} from 'next';
import Link from 'next/link';
import {Suspense} from 'react';
import {BuhayPinoy,Avatar} from '@/components/buhay-pinoy-game';
import {MathBackdrop} from '@/components/math-backdrop';

export const metadata:Metadata={title:'Buhay Pinoy — Life Simulator',description:'Grow up in the Philippines in this life simulator: study, work, love, celebrate fiestas, and build your buhay one year at a time.'};

/* Small static preview of the character for the game shell */
const previewLife={age:24,gender:'feminine',stats:{happiness:82}};

export default function BuhayPinoyPage(){
 return <main id="main" className="scene">
  <section className="page-head" data-glow><MathBackdrop/><div className="container" style={{position:'relative'}}>
    <div className="eyebrow">Games / Buhay Pinoy</div>
    <h1>Buhay Pinoy.</h1>
    <p>A Philippine life simulator. Born in one of 18 regions, you live year by year — pag-aaral, trabaho, pag-ibig, fiesta at pamilya. Your choices, your buhay.</p>
  </div></section>
  <section className="section container">
    <Suspense fallback={<div className="bp-load"><div className="bp-spin"/><p>Loading Buhay Pinoy…</p></div>}>
      <BuhayPinoy/>
    </Suspense>
  </section>
 </main>;
}
