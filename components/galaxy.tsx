'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,RotateCcw,BookOpen,FlaskConical,Camera,GraduationCap,NotebookPen,Rocket,BrainCircuit,Award,Cross,Gamepad2} from 'lucide-react';
import {sections} from '@/lib/types';
const iconMap:Record<string,any>={BookOpen,FlaskConical,Camera,GraduationCap,NotebookPen,Rocket,BrainCircuit,Award,Cross,Gamepad2};
const desc:Record<string,string>={book:'Stories and guides published on Amazon and Gumroad.',research:'Mathematics research from Leyte Normal University.',album:'Photographs of family, school, and milestones.',course:'Courses, studies, and the learning journey.',journal:'Updates and reflections along the way.',project:'Web platforms and data systems I built.',idea:'Ideas worth growing.',achievement:'Chess, competitions, and milestones.',bible:'Scripture and stories of hope and miracles.',games:'Buhay Pinoy and the games of the arcade.'};
const CX=380,CY=280;
const inner=[315,225,135,45].map(a=>[CX+168*Math.cos(a*Math.PI/180),CY-118*Math.sin(a*Math.PI/180)]);
const outer=[268,182,90,0,326,218].map(a=>[CX+262*Math.cos(a*Math.PI/180),CY-186*Math.sin(a*Math.PI/180)]);
const pts=[...inner,...outer].map(([x,y])=>[Math.round(x*10)/10,Math.round(y*10)/10]);
const stars:any[]=[[72,52],[151,148],[648,72],[703,178],[92,428],[668,470],[536,38],[204,88],[592,432],[355,124],[58,240],[712,300],[283,508],[477,518]].map(([x,y],i)=><circle key={i} className={i%4===0?'star twinkle':'star'} cx={x} cy={y} r={i%3===0?1.6:1.1} opacity={.5}/>);

export function Galaxy({compact=false}:{compact?:boolean}){
 const [active,setActive]=useState(-1);const [list,setList]=useState(false);
 const s=active>=0?sections[active]:null;
 return <div className="stack">
 {!compact&&<div className="space wrap"><p style={{margin:0}}>Select a world, then enter to explore its published content.</p><button className="button-outline" onClick={()=>setList(!list)}>{list?'Show galaxy':'List view'}</button></div>}
 {list?<div className="grid two">{sections.map((w,i)=><Link className="card space" href={w.href} key={w.type}><span>{w.label}</span><ArrowUpRight size={18} color={w.color}/></Link>)}</div>:
 <div className="galaxy"><svg viewBox="0 0 760 560" role="img" aria-label="Interactive universe map: Ken at the center, surrounded by the worlds of the archive">
 <defs>
  <radialGradient id="kenGlow"><stop stopColor="#8f8fff" stopOpacity=".55"/><stop offset=".55" stopColor="#4b57a8" stopOpacity=".22"/><stop offset="1" stopColor="#1a2450" stopOpacity="0"/></radialGradient>
  <radialGradient id="coreFill"><stop stopColor="#3a4a86"/><stop offset="1" stopColor="#212d58"/></radialGradient>
 </defs>
 {stars}
 <ellipse cx={CX} cy={CY} rx="168" ry="118" fill="none" stroke="#4a5c8c" strokeOpacity=".4"/>
 <ellipse cx={CX} cy={CY} rx="262" ry="186" fill="none" stroke="#39496f" strokeOpacity=".55" strokeDasharray="3 9" className="orbit-dash"/>
 <circle className="core-glow" cx={CX} cy={CY} r="104" fill="url(#kenGlow)"/>
 <g className="world-node" onClick={()=>setActive(-1)} style={{cursor:'pointer'}} aria-label="Ken, the center of the universe">
  <circle cx={CX} cy={CY} r="62" fill="none" stroke="#7a86c9" strokeOpacity=".28"/>
  <circle cx={CX} cy={CY} r="52" fill="url(#coreFill)" stroke="#b9b7ff" strokeWidth="2"/>
  <text x={CX} y={CY+6} textAnchor="middle" fill="#fff" fontWeight="800" fontSize="17" letterSpacing="2.5">KEN</text>
 </g>
 {sections.map((w,i)=>{const [x,y]=pts[i];const Icon=iconMap[w.icon];return <g key={w.type} className="world-node" tabIndex={0} role="button" aria-label={'Select '+w.label} onClick={()=>setActive(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setActive(i)}}}>
  <circle cx={x} cy={y} r="33" fill={w.color} opacity={active===i?'.16':'0'}/>
  <circle cx={x} cy={y} r="30" fill="#1a2440" stroke={w.color} strokeWidth={active===i?2.6:1.4}/>
  {Icon&&<Icon x={x-14} y={y-14} width={28} height={28} color={w.color} strokeWidth={active===i?2.2:1.6}/>}
  <text className="node-label" x={x} y={y+52} textAnchor="middle" fontSize="12.5" fontWeight={active===i?800:600} fill={active===i?'#fff':'#afbed5'}>{w.label}</text>
 </g>})}
 </svg></div>}
 {!compact&&<div className="card space wrap"><div><span className="eyebrow">Selected destination</span><h3 style={{margin:'7px 0 4px'}}>{s?s.label:'All of Ken\'s worlds'}</h3><p className="small" style={{margin:0}}>{s?desc[s.type]:'Pick any world in the galaxy to begin exploring the archive.'}</p></div><div className="flex">{s&&<Link className="button" href={s.href}>Enter World <ArrowUpRight size={16}/></Link>}<button className="button-ghost" onClick={()=>setActive(-1)}><RotateCcw size={16}/> Center</button></div></div>}
 </div>;
}
