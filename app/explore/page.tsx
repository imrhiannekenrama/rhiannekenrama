import type {Metadata} from 'next';
import {Galaxy} from '@/components/galaxy';
export const metadata:Metadata={title:'Universe Explorer'};
export default function Explore(){return <main id="main" className="scene scene-explore"><div data-reveal className="page-head"><div className="container"><div className="eyebrow">Universe / Map of My Life</div><h1>Enter the universe.</h1><p>Explore the connections between ideas, writing, research, memories, learning and everything else.</p></div></div><div className="container section"><Galaxy/></div></main>}
