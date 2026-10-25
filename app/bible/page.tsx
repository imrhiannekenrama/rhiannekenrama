import type {Metadata} from 'next';
import {Suspense} from 'react';
import Link from 'next/link';
import {BookOpen,Sparkles,ArrowUpRight} from 'lucide-react';
import {ScriptureReader} from '@/components/scripture-reader';
import {MathBackdrop} from '@/components/math-backdrop';

export const metadata:Metadata={title:'The Word',description:'Read the Bible — World English Bible and King James Version — plus 320 short stories of hope, miracles, and encouragement.'};

export default function BiblePage(){
 return <main id="main" className="scene">
  <section className="page-head" data-glow><MathBackdrop/><div className="container" style={{position:'relative'}}>
    <div className="eyebrow">God first</div>
    <h1>The Word.</h1>
    <p>Scripture in two beloved translations, and 320 short stories of hope and miracles for the days that need them. Settle in, adjust the text to your eyes, and read comfortably.</p>
    <div className="flex wrap" style={{marginTop:16}}>
      <Link href="/bible/stories" className="button-outline"><Sparkles size={15}/> Stories of hope &amp; miracles</Link>
    </div>
  </div></section>
  <section className="section container">
    <Suspense fallback={<div className="word-skeleton" aria-live="polite">Preparing the reader…</div>}>
      <ScriptureReader/>
    </Suspense>
  </section>
 </main>;
}
