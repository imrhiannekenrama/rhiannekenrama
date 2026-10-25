import type {Metadata} from 'next';
import {Suspense} from 'react';
import Link from 'next/link';
import {BookOpen} from 'lucide-react';
import {StoryLibrary} from '@/components/story-library';
import {MathBackdrop} from '@/components/math-backdrop';

export const metadata:Metadata={title:'Stories of Hope & Miracles',description:'320 short, encouraging retellings of Bible stories of hope, miracles, and grace — searchable and easy to read.'};

export default function BibleStoriesPage(){
 return <main id="main" className="scene">
  <section className="page-head" data-glow><MathBackdrop/><div className="container" style={{position:'relative'}}>
    <div className="eyebrow">The Word / Stories</div>
    <h1>Stories of hope &amp; miracles.</h1>
    <p>320 short retellings of Bible stories — hope for heavy days, miracles for doubting days, and a gentle encouragement with each one. Search a theme, a book, or a feeling.</p>
    <div className="flex wrap" style={{marginTop:16}}>
      <Link href="/bible" className="button-outline"><BookOpen size={15}/> Open the full Bible</Link>
    </div>
  </div></section>
  <section className="section container">
    <Suspense fallback={<div className="word-skeleton" aria-live="polite">Preparing the stories…</div>}>
      <StoryLibrary/>
    </Suspense>
  </section>
 </main>;
}
