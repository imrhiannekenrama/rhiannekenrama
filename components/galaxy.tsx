'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,RotateCcw} from 'lucide-react';
import {sections} from '@/lib/types';
const pts=[[188,93],[525,86],[620,255],[475,395],[225,393],[75,258],[350,38],[358,464]];
export function Galaxy({compact=false}:{compact?:boolean}){
 const [active,setActive]=useState(0);const [list,setList]=useState(false);const s=sections[active];
 return <div className="stack">{!compact&&<div className="space"><p style={{margin:0}}>Select a world, then enter to explore its published content.</p><button className="button-outline" onClick={()=>setList(!list)}>{list?'Show galaxy':'List view'}</button></div>}
 {list?<div className="grid two">{sections.map((s,i)=><Link className="card" href={s.href} key={s.type}><div className="space"><span>{s.label}</span><ArrowUpRight size={18}/></div></Link>)}</div>:<div className="galaxy"><svg viewBox="0 0 700 510" role="img" aria-label="Interactive map connecting the categories of this personal website">
 <defs><radialGradient id="core"><stop stopColor="#7a7cef" stopOpacity=".65"/><stop offset="1" stopColor="#293263" stopOpacity="0"/></radialGradient></defs>
 {pts.map(([x,y],i)=><line key={`l${i}`} x1="350" y1="255" x2={x} y2={y} stroke={sections[i].color} strokeOpacity=".33" strokeDasharray="5 7"/>)}
 <circle cx="350" cy="255" r="103" fill="url(#core)"/><circle cx="350" cy="255" r="53" fill="#2b3a69" stroke="#b7b7ff" strokeWidth="2"/><text x="350" y="263" textAnchor="middle" fill="white" fontWeight="800" fontSize="15">RHIANNE</text>
 {sections.map((w,i)=>{const [x,y]=pts[i];return <g key={w.type} className="world-node" tabIndex={0} role="button" aria-label={`Select ${w.label}`} onClick={()=>setActive(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setActive(i)}}}><circle cx={x} cy={y} r="38" fill={active===i?'#2d4062':'#1e2942'} stroke={w.color} strokeWidth={active===i?3:1.3}/><circle cx={x} cy={y} r="12" fill={w.color}/><text x={x} y={y+58} fontSize="12" textAnchor="middle" fill={active===i?'#fff':'#afbed5'}>{w.label}</text></g>})}</svg></div>}
 {!compact&&<div className="card space wrap"><div><span className="eyebrow">Selected destination</span><h3 style={{margin:'7px 0'}}>{s.label}</h3><p className="small" style={{margin:0}}>An interconnected world in your life archive.</p></div><div className="flex"><button className="button-ghost" onClick={()=>setActive(0)}><RotateCcw size={16}/> Reset</button><Link className="button" href={s.href}>Enter World <ArrowUpRight size={16}/></Link></div></div>}
 </div>
}
