'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {BookOpen,Dumbbell,Moon,Home,Users,HeartHandshake,UserPlus,Briefcase,Stethoscope,Flower2,Wallet,Gift,Plus,Heart,HeartCrack,Baby,UserPlus2,Church,Dices,Save,ArrowUpRight,Sparkles,Trophy,MapPin,Banknote,Landmark,GraduationCap,Pill,Plane,HandCoins,Repeat,Play} from 'lucide-react';

/* BUHAY PINOY — Philippine life simulator.
   Runs the bundled zero-dependency ES engine + JSON data from /games/buhay-pinoy-life-sim/.
   All game prose and data come from the original "Buhay Pinoy" content package. */
const GAME_BASE='/games/buhay-pinoy-life-sim/';
const SAVE_KEY='buhay-pinoy-save-v1';
const SKINS=['#f5d0a9','#eabf94','#d29b6c','#b07b4f','#8d5524'];
const peso=(n:number)=>'₱'+Math.round(n).toLocaleString('en-PH');
const ACTS=[['study','Study',BookOpen],['exercise','Exercise',Dumbbell],['rest','Rest',Moon],['familyTime','Family time',Home],['friendTime','Friend time',Users],['volunteer','Volunteer',HeartHandshake],['network','Make a friend',UserPlus],['workHarder','Work harder',Briefcase],['checkup','Checkup',Stethoscope],['meditate','Relax',Flower2],['sideGig','Side gig',Wallet],['donate','Donate',Gift]] as const;

type Flash='good'|'bad'|'party'|null;

export function BuhayPinoy(){
 const [phase,setPhase]=useState<'load'|'menu'|'create'|'play'|'error'>('load');
 const simRef=useRef<any>(null),dbRef=useRef<any>(null);
 const [life,setLife]=useState<any>(null);
 const [notice,setNotice]=useState<{text:string,bad?:boolean}|null>(null);
 const [flash,setFlash]=useState<Flash>(null);
 const [tab,setTab]=useState('life');
 const [amount,setAmount]=useState('');
 const achRef=useRef(0);
 /* creation form */
 const [skin,setSkin]=useState(1);
 const [gender,setGender]=useState('neutral');
 const [regionId,setRegionId]=useState('');
 const [fName,setFName]=useState('');const [lName,setLName]=useState('');
 const [confetti,setConfetti]=useState(false);

 /* ---- load engine + database once ---- */
 useEffect(()=>{let live=true;
   (async()=>{
     const importer=new Function('u','return import(u)');
     const sim:any=await importer(GAME_BASE+'engine/index.js');
     const db=await sim.loadDatabase(GAME_BASE);
     if(!live)return;
     simRef.current=sim;dbRef.current=db;
     setRegionId(db.catalog.regions[0].id);
     try{const raw=localStorage.getItem(SAVE_KEY);
       if(raw){const s=sim.restoreGame(raw);
         if(s&&s.living!==undefined){setLife(s);setPhase('play');achRef.current=s.achievements.length;return}}}catch{}
     setPhase('menu');
   })().catch(()=>{if(live)setPhase('error')});
   return()=>{live=false};
 },[]);

 const sim=()=>simRef.current,db=()=>dbRef.current;

 /* ---- helpers ---- */
 const persist=(s:any)=>{setLife(s);try{localStorage.setItem(SAVE_KEY,sim().serializeGame(s))}catch{}
   if(s.achievements&&s.achievements.length>achRef.current){achRef.current=s.achievements.length;
     setNotice({text:'🏆 Achievement unlocked!'});popFlash('party');}
 };
 const popFlash=(f:Flash)=>{setFlash(f);setTimeout(()=>setFlash(null),2400)};
 const run=(fn:()=>any,okText?:string,good=true)=>{
   try{const s=fn();persist(s);if(okText)setNotice({text:okText,bad:!good});popFlash(good?'good':'bad');}
   catch(e:any){setNotice({text:e?.message||'That is not possible right now.',bad:true})}
 };
 const ageUp=()=>{
   try{const res=sim().ageUp(life,db());persist(res.state);
     popFlash('party');launchConfetti();setNotice(res.event?null:{text:'You turned '+res.state.age+'. Maligayang kaarawan!'});
     if(res.event)setNotice(null);
   }catch(e:any){setNotice({text:e?.message,bad:true})}
 };
 const answer=(optionId:string)=>{
   try{const res=sim().answerEvent(life,db(),optionId);persist(res.state);
     setNotice({text:res.outcome});
     const eff=res.option?.effects||{};
     const good=Object.entries(eff).some(([k,v])=>String(k).includes('happiness')&&Number(v)>0)||Object.entries(eff).some(([k,v])=>Number(v)>0&&!String(k).includes('stress'));
     popFlash(good?'good':'bad');
   }catch(e:any){setNotice({text:e?.message,bad:true})}
 };
 const launchConfetti=()=>{setConfetti(true);setTimeout(()=>setConfetti(false),2200)};
 const newLife=(opts:any)=>{const s=sim().createLife(db(),{...opts,gender,year:2026});achRef.current=0;persist(s);setPhase('play');popFlash('party');launchConfetti();setNotice({text:`${s.firstName} ${s.lastName} was born in ${s.city}. Kamusta, mundo!`})};
 const randomName=()=>{const ns=db().catalog.names;const g=ns.given[gender]||ns.given.neutral;
   setFName(g[Math.floor(Math.random()*g.length)]);setLName(ns.surnames[Math.floor(Math.random()*ns.surnames.length)])};

 /* ---- render ---- */
 if(phase==='load')return <div className="bp-load"><div className="bp-spin"/><p>Loading Buhay Pinoy…</p></div>;
 if(phase==='error')return <div className="notice error">The game engine could not load. Refresh the page, or tell Ken the site needs attention.</div>;

 if(phase==='menu')return <div className="bp-menu card">
   <h2 className="gradient-text">Buhay Pinoy</h2>
   <p>Grow up in the Philippines. Study, work, love, celebrate fiestas, run a sari-sari store, ride jeepneys, start a family — every year is your choice.</p>
   <div className="flex wrap">
     {life&&<button className="button" onClick={()=>setPhase('play')}><Play size={16}/> Continue your life (age {life.age})</button>}
     <button className="button-outline" onClick={()=>{randomName();setPhase('create')}}><Plus size={16}/> New life</button>
   </div>
   {life&&<p className="tiny muted" style={{marginTop:10}}>Starting a new life replaces your saved one.</p>}
 </div>;

 if(phase==='create'){const regions=db()?.catalog?.regions||[];return <div className="bp-create card">
   <h2>Ito ang simula. <span className="muted small">This is your beginning.</span></h2>
   <div className="bp-form">
     <div className="field"><label>First name</label><input className="input" value={fName} onChange={e=>setFName(e.target.value)}/></div>
     <div className="field"><label>Last name</label><input className="input" value={lName} onChange={e=>setLName(e.target.value)}/></div>
     <div className="field"><label>Surprise me</label><button className="button-ghost" onClick={randomName}><Dices size={15}/> Random Filipino name</button></div>
     <div className="field"><label>Kulay ng balat</label><div className="bp-skins">{SKINS.map((c,i)=><button key={c} aria-label={'Skin tone '+(i+1)} className={skin===i?'bp-skin selected':'bp-skin'} style={{background:c}} onClick={()=>setSkin(i)}/>)}</div></div>
     <div className="field"><label>Kasarian</label><div className="flex wrap">
       {[['feminine','Babae'],['masculine','Lalaki'],['neutral','Sikreto']].map(([g,l])=><button key={g} className={gender===g?'word-vbtn selected':'word-vbtn'} onClick={()=>setGender(g)}>{l}</button>)}
     </div></div>
     <div className="field"><label>Where are you born?</label><select className="input" value={regionId} onChange={e=>setRegionId(e.target.value)}>
       {regions.map((r:any)=><option key={r.id} value={r.id}>{r.label} — {r.name}</option>)}
     </select></div>
   </div>
   <button className="button bp-big" onClick={()=>newLife({firstName:fName.trim()||undefined,lastName:lName.trim()||undefined,regionId})}>
     <Sparkles size={17}/> Ito na ako — start my life</button>
 </div>;}

 /* ---------- PLAY ---------- */
 if(!life)return null;
 const sum=sim().lifeSummary(life,db());
 if(!life.living){const kids=life.family?.children||[];
   return <div className="bp-dead card">
     <div className="bp-tomb"><span>✝</span><h3>{life.firstName} {life.lastName}</h3>
       <p className="muted">{life.birthYear||sum.year-life.age} — {sum.year}</p>
       <p className="small">Lived {life.age} years as a {sum.stage} in {sum.city}, {sum.region}.</p>
       <p className="small muted">Net worth {peso(sum.netWorthPHP)} · {sum.achievements} achievement{sum.achievements===1?'':'s'} · {sum.relationship==='married'?'married':sum.relationship}</p>
     </div>
     {notice&&!notice.bad&&<p className="small muted">{life.history[life.history.length-1]?.text}</p>}
     <div className="flex wrap">
       {kids.length>0&&<button className="button" onClick={()=>{try{const s=sim().nextGeneration(life,db(),kids[0].id);achRef.current=0;persist(s);setNotice({text:'You now continue as '+s.firstName+'. The buhay goes on.'})}catch(e:any){setNotice({text:e.message,bad:true})}}}>
         <Repeat size={16}/> Continue as your child</button>}
       <button className="button-outline" onClick={()=>{localStorage.removeItem(SAVE_KEY);setLife(null);setPhase('menu')}}><Plus size={16}/> New life</button>
     </div>
   </div>;}

 const pending=life.pendingEventId?db().eventById[life.pendingEventId]:null;
 const stats=life.stats;
 const job=life.career.jobId?db().jobs.find((j:any)=>j.id===life.career.jobId):null;

 return <div className="bp-game">
  {confetti&&<div className="bp-confetti" aria-hidden>{Array.from({length:26},(_,i)=><span key={i} style={{left:(i*3.7)%100+'%',animationDelay:(i%7)*0.12+'s',background:['#ffd166','#06d6a0','#118ab2','#ef476f','#a9a5ff'][i%5]}}/>)}</div>}

  {/* header card */}
  <div className="card bp-hero">
    <Avatar life={life} flash={flash} skin={skin}/>
    <div className="bp-hero-info">
      <h3>{life.firstName} {life.lastName}</h3>
      <p className="small muted" style={{margin:'2px 0 8px'}}><MapPin size={13} style={{display:'inline',marginRight:2}}/> {sum.city}, {sum.region} · {sum.year}</p>
      <div className="bp-chips">
        <span className="pill">Age {life.age}</span><span className="pill">{sum.stage}</span>
        {job&&<span className="pill">{job.title}</span>}
        {sum.relationship!=='single'&&<span className="pill">{sum.relationship}</span>}
        {sum.achievements>0&&<span className="pill"><Trophy size={12}/> {sum.achievements}</span>}
      </div>
    </div>
  </div>

  {/* stats */}
  <div className="card bp-stats">
    {[['Health',stats.health,'#7ae58c'],['Happiness',stats.happiness,'#ffd166'],['Smarts',stats.smarts,'#74c0fc'],['Looks',stats.looks,'#f4a6c0']].map(([l,v,c]:any)=>
      <div key={l} className="bp-stat"><span>{l}</span><div className="bp-track"><div className="bp-fill" style={{width:Math.max(2,Math.min(100,v))+'%',background:c}}/></div><b>{v}</b></div>)}
    <div className="bp-stat"><span>Stress</span><div className="bp-track"><div className="bp-fill" style={{width:Math.max(2,Math.min(100,stats.stress))+'%',background:'#ef476f'}}/></div><b>{stats.stress}</b></div>
  </div>

  {/* money strip */}
  <div className="card bp-money space wrap">
    <div><span className="eyebrow">Cash</span><h4 style={{margin:2}}>{peso(life.finance.cash)}</h4></div>
    <div><span className="eyebrow">Savings</span><h4 style={{margin:2}}>{peso(life.finance.savings)}</h4></div>
    <div><span className="eyebrow">Net worth</span><h4 style={{margin:2}} className={sum.netWorthPHP<0?'bp-neg':''}>{peso(sum.netWorthPHP)}</h4></div>
    {life.finance.debt>0&&<div><span className="eyebrow">Debt</span><h4 style={{margin:2}} className="bp-neg">{peso(life.finance.debt)}</h4></div>}
  </div>

  {/* notice / outcome */}
  {notice&&<div className={'notice bp-notice '+(notice.bad?'error':'')} role="status">{notice.text}</div>}

  {/* event or peace */}
  {pending?<div className="card bp-event" key={pending.id}>
    <span className="eyebrow">{pending.category}</span>
    <h3 style={{margin:'6px 0'}}>{pending.title}</h3>
    <p>{pending.text}</p>
    <div className="bp-choices">{pending.options.map((o:any)=><button key={o.id} className="bp-choice" onClick={()=>answer(o.id)}>{o.label}</button>)}</div>
  </div>
  :<div className="bp-peace">{flash==='party'?'🎂 Maligayang kaarawan!':'Walang problema. A quiet year in the Philippines…'}</div>}

  {/* age up */}
  <button className="bp-agebtn" onClick={ageUp} disabled={!!pending} aria-label="Advance one year">
    <Plus size={22}/>{life.age===0?'It is your first birthday':'Age up'}</button>

  {/* tabs */}
  <div className="tabs bp-tabs">
    {[['life','Buhay'],['people','Pamilya'],['career','Trabaho'],['money','Pera'],['civic','Bayan']].map(([k,l])=>
      <button key={k} className={tab===k?'selected':''} onClick={()=>setTab(k)}>{l}</button>)}
  </div>

  {tab==='life'&&<div className="card">
    <span className="eyebrow">Gawain · Activities</span>
    <div className="bp-acts">{ACTS.map(([a,l,Icon]:any)=><button key={a} className="bp-act" onClick={()=>run(()=>sim().doActivity(life,db(),a),l+' — done!')}><Icon size={18}/><span>{l}</span></button>)}</div>
    <div className="bp-hist"><span className="eyebrow">Kwento ng buhay · Life so far</span>
      {life.history.slice(-14).reverse().map((h:any,i:number)=><p key={i} className="small muted" style={{margin:'4px 0'}}><b>{h.age}</b> · {h.text}</p>)}
    </div>
  </div>}

  {tab==='people'&&<div className="card">
    <div className="bp-stat"><span>Family bond</span><div className="bp-track"><div className="bp-fill" style={{width:life.relationships.familyBond+'%',background:'#ffd166'}}/></div><b>{life.relationships.familyBond}</b></div>
    <div className="bp-stat"><span>Friendship</span><div className="bp-track"><div className="bp-fill" style={{width:life.relationships.friendship+'%',background:'#74c0fc'}}/></div><b>{life.relationships.friendship}</b></div>
    <p className="small muted">Status: <b>{sum.relationship}</b> · {life.relationships.friends.length} friends · {life.family.children.length} anak</p>
    {life.relationships.partner&&<p className="small muted">Kasama: <b>{life.relationships.partner.name}</b></p>}
    <div className="bp-actions">
      <button className="bp-act" disabled={life.age<18||sum.relationship!=='single'} onClick={()=>run(()=>sim().startDating(life,db()),'You are now dating!')}><Heart size={16}/><span>Start dating</span></button>
      <button className="bp-act" disabled={life.age<18||sum.relationship!=='dating'} onClick={()=>run(()=>sim().marry(life),'Congratulations! Ikasal na kayo.')}><Church size={16}/><span>Marry</span></button>
      <button className="bp-act" disabled={life.age<18||sum.relationship!=='married'} onClick={()=>run(()=>sim().haveChild(life,db()),'A baby joins the family!',true)}><Baby size={16}/><span>Have a child</span></button>
      <button className="bp-act" disabled={['married','dating'].includes(sum.relationship)} onClick={()=>run(()=>sim().separate(life),'You went your separate ways.',false)}><HeartCrack size={16}/><span>Break up</span></button>
      <button className="bp-act" onClick={()=>run(()=>sim().makeFriend(life,db()),'You made a new friend!')}><UserPlus2 size={16}/><span>Make a friend</span></button>
      <button className="bp-act" onClick={()=>run(()=>sim().spendTime(life,'family'),'Quality time with the family.')}><Home size={16}/><span>Family time</span></button>
      <button className="bp-act" onClick={()=>run(()=>sim().spendTime(life,'friends'),'Time with the barkada!')}><Users size={16}/><span>Friend time</span></button>
      <button className="bp-act" onClick={()=>run(()=>sim().spendTime(life,'partner'),'Time with your partner.')}><Heart size={16}/><span>Partner time</span></button>
    </div>
  </div>}

  {tab==='career'&&<div className="card">
    <span className="eyebrow">Edukasyon · Education</span>
    <p className="small muted" style={{margin:'4px 0 10px'}}>Current level: <b>{sum.education}</b>{life.career.retired?' · retired':''}</p>
    <div className="bp-actions">
      {[['technical','Technical/vocational'],['college','College'],['postgrad','Postgraduate']].map(([p,l])=>
        <button key={p} className="bp-act" onClick={()=>run(()=>sim().startEducation(life,p),'You enrolled: '+l)}><GraduationCap size={16}/><span>{l}</span></button>)}
    </div>
    {job?<div>
      <span className="eyebrow" style={{display:'block',marginTop:16}}>Trabaho · Work</span>
      <p className="small muted" style={{margin:'4px 0 8px'}}><b>{job.title}</b> · {peso(job.annualBasePayPHP)}/year · level {life.career.level} · performance {life.career.performance}</p>
      <div className="bp-actions">
        <button className="bp-act" onClick={()=>run(()=>sim().promote(life),'Promotion! Ang galing mo.')}><ArrowUpRight size={16}/><span>Ask for promotion</span></button>
        <button className="bp-act" onClick={()=>run(()=>sim().doActivity(life,db(),'workHarder'),'You worked extra hard.')}><Briefcase size={16}/><span>Work harder</span></button>
        <button className="bp-act" onClick={()=>run(()=>sim().resign(life),'You resigned.',false)}><HeartCrack size={16}/><span>Resign</span></button>
        <button className="bp-act" disabled={!life.career.jobId} onClick={()=>run(()=>sim().retire(life),'Enjoy retirement!')}><Moon size={16}/><span>Retire</span></button>
      </div>
    </div>:
    <div>
      <span className="eyebrow" style={{display:'block',marginTop:16}}>Mga trabaho · Jobs for you</span>
      <div className="bp-jobs">{db().jobs.slice(0,115).map((j:any)=>{
        const need=DEG_RANK[j.requiredEducation]??0,have=DEG_RANK[life.education.level]??0,ok=have>=need&&life.age>=18;
        return <button key={j.id} className="bp-job" disabled={!ok} title={ok?'':'Requires '+j.requiredEducation} onClick={()=>run(()=>sim().applyForJob(life,db(),j.id),'Hired as '+j.title+'!')}>
          <b>{j.title}</b><span className="small muted">{peso(j.annualBasePayPHP)}/yr</span></button>})}
      </div>
    </div>}
  </div>}

  {tab==='money'&&<div className="card">
    <span className="eyebrow">Bangko · Bank</span>
    <div className="flex wrap" style={{margin:'10px 0'}}>
      <input className="input" style={{maxWidth:180}} placeholder="Halaga (₱)" inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value.replace(/[^\d]/g,''))}/>
      {[['save','Save',Banknote],['withdraw','Withdraw',Wallet],['borrow','Borrow',Landmark],['repay','Repay',HandCoins],['invest','Invest',ArrowUpRight],['divest','Sell investments',Banknote]].map(([a,l,Icon]:any)=>
        <button key={a} className="bp-act" onClick={()=>{const n=parseInt(amount);if(!n)return setNotice({text:'Enter an amount first.',bad:true});
          const ops:Record<string,()=>any>={save:()=>sim().saveMoney(life,n),withdraw:()=>sim().withdrawSavings(life,n),borrow:()=>sim().borrow(life,n),repay:()=>sim().repayDebt(life,n),invest:()=>sim().invest(life,n),divest:()=>sim().sellInvestment(life,n)};
          run(()=>ops[a](),l+' done!');
          setAmount('')}}><Icon size={15}/><span>{l}</span></button>)}
    </div>
    <span className="eyebrow" style={{display:'block',marginTop:6}}>Ari-arian · Assets</span>
    <div className="bp-jobs">{db().catalog.assets.map((a:any)=>{
      const own=life.assets.find((x:any)=>x.id===a.id);
      return <button key={a.id} className="bp-job" onClick={()=>run(()=>own?sim().sellAsset(life,db(),a.id):sim().buyAsset(life,db(),a.id),own?'Sold '+a.name:'Bought '+a.name+'!')}>
        <b>{a.name}</b><span className="small muted">{own?'owned · sell':'₱'+a.pricePHP.toLocaleString('en-PH')}</span></button>})}
    </div>
    <span className="eyebrow" style={{display:'block',marginTop:16}}>Negosyo · Businesses</span>
    <div className="bp-jobs">{db().catalog.businesses.map((b:any)=>{
      const own=life.businesses.find((x:any)=>x.id===b.id);
      return <button key={b.id} className="bp-job" onClick={()=>run(()=>own?sim().closeBusiness(life,db(),own.instance):sim().openBusiness(life,db(),b.id),own?'Closed '+b.name:'Opened '+b.name+'!')}>
        <b>{b.name}</b><span className="small muted">{own?'open · close':'₱'+b.startupCostPHP.toLocaleString('en-PH')+' to start'}</span></button>})}
    </div>
  </div>}

  {tab==='civic'&&<div className="card">
    <span className="eyebrow">Bayan · Community & health</span>
    <div className="bp-actions">
      <button className="bp-act" onClick={()=>run(()=>sim().volunteer(life),'You volunteered — kalinga sa kapwa.')}><HeartHandshake size={16}/><span>Volunteer</span></button>
      <button className="bp-act" onClick={()=>run(()=>sim().participateInCivicForum(life),'You spoke at the barangay forum.')}><Users size={16}/><span>Barangay forum</span></button>
      <button className="bp-act" disabled={!!(life.flags&&life.flags.registeredToVote)} onClick={()=>run(()=>sim().registerToVote(life),'You are now a registered voter.')}><Save size={16}/><span>Register to vote</span></button>
      <button className="bp-act" disabled={!(life.flags&&life.flags.registeredToVote)} onClick={()=>run(()=>sim().castVote(life),'You voted. Boto mo, buhay mo.')}><Heart size={16}/><span>Vote</span></button>
      <button className="bp-act" disabled={life.age<18} onClick={()=>{try{const r=sim().runForCommunityOffice(life);persist(r.state);setNotice({text:r.won?'You WON the barangay election! Kagawad ka na!':'You lost this election. Try again next time.',bad:!r.won});popFlash(r.won?'party':'bad')}catch(e:any){setNotice({text:e.message,bad:true})}}}><Trophy size={16}/><span>Run for barangay office</span></button>
      <button className="bp-act" onClick={()=>run(()=>sim().visitClinic(life),'The checkup made you feel better.')}><Stethoscope size={16}/><span>Visit the clinic</span></button>
    </div>
    <span className="eyebrow" style={{display:'block',marginTop:16}}>Lakbay · Travel</span>
    <div className="bp-jobs">{db().catalog.regions.map((r:any)=>
      <button key={r.id} className="bp-job" disabled={r.id===life.regionId} onClick={()=>run(()=>sim().visitRegion(life,db(),r.id),'You visited '+r.label+'.')}>
        <b>{r.label}</b><span className="small muted">{r.id===life.regionId?'home ·':r.name+' · '}</span><span className="small muted">{r.id===life.regionId?'':'visit'}</span></button>)}
    </div>
    <p className="small muted" style={{marginTop:12}}>Want to move for good? Regions with jobs, family, or love await — pick one to relocate (18+).</p>
    <div className="bp-jobs">{db().catalog.regions.map((r:any)=>
      r.id===life.regionId?null:<button key={r.id} className="bp-job" disabled={life.age<18} onClick={()=>run(()=>sim().moveRegion(life,db(),r.id),'You moved to '+r.label+'.')}>
        <b>Move to {r.label}</b><span className="small muted">{r.name}</span></button>)}
    </div>
  </div>}

  <div className="flex wrap" style={{justifyContent:'center',gap:10}}>
    <button className="button-ghost" onClick={()=>{try{localStorage.setItem(SAVE_KEY,sim().serializeGame(life));setNotice({text:'Saved!'})}catch{setNotice({text:'Could not save.',bad:true})}}}><Save size={15}/> Save</button>
    <Link className="button-ghost" href="/games"><ArrowUpRight size={14}/> All games</Link>
  </div>
 </div>;
}

const DEG_RANK:Record<string,number>={none:0,elementary:1,jhs:2,shs:3,technical:4,college:5,postgrad:6};

/* ============ Animated avatar ============ */
export function Avatar({life,flash,skin=1}:{life:any;flash:Flash;skin?:number}){
 const age=life.age||0;
 const stage:string=age<6?'baby':age<13?'child':age<18?'teen':age<60?'adult':'senior';
 const hap=life.stats?.happiness??60;
 const mood:string=flash==='bad'?'sad':(flash==='good'||flash==='party')?'happy':hap>=70?'happy':hap>=40?'neutral':'sad';
 const sk=SKINS[skin]||SKINS[1];
 const fem=life.gender==='feminine';
 const hair=stage==='senior'?'#9ca3af':'#26201b';
 const big=stage==='baby';
 const headR=big?50:stage==='child'?45:41;
 const cy=big?78:70;
 const bodyY=cy+headR-14;
 const shirt=stage==='baby'?'#ffd9c0':stage==='adult'||stage==='senior'?(fem?'#f2e8ff':'#eef4ff'):(fem?'#ffffff':'#ffffff');
 const sleeve=fem&&(stage==='adult'||stage==='senior')?'#d9c2ff':(stage==='adult'||stage==='senior')?'#dfe9ff':'#e8eefc';
 return <div className={'bp-avatar '+(flash==='party'?'bp-cheer':flash==='bad'?'bp-sad':'bp-idle')} aria-hidden>
  <svg viewBox="0 0 200 235" width="150" height="176" role="img" aria-label={`${life.firstName}, ${stage}`}>
   {/* torso */}
   {big?<g>
     <ellipse cx="100" cy={bodyY+34} rx="34" ry="30" fill={shirt}/>
     <ellipse cx="100" cy={bodyY+34} rx="34" ry="30" fill="none" stroke="#f3e2d2" strokeWidth="2"/>
   </g>:
   <g>
     <rect x="60" y={bodyY-6} width="80" height={stage==='teen'||stage==='child'?68:74} rx="22" fill={shirt}/>
     {(stage==='adult'||stage==='senior')&&<path d={`M60 ${bodyY+8} q-12 6 -10 18 l14 2`} fill={sleeve}/>}
     {(stage==='adult'||stage==='senior')&&<path d={`M140 ${bodyY+8} q12 6 10 18 l-14 2`} fill={sleeve}/>}
     {/* collar */}
     {fem?<path d={`M86 ${bodyY-4} q14 12 28 0 l-7 -6 h-14 z`} fill={stage==='baby'?'#f7c8a0':'#d9c2ff'}/>:<path d={`M86 ${bodyY-4} l14 10 14-10 l-3 -6 h-22 z`} fill="#7da7d9"/>}
     {(stage==='child'||stage==='teen')&&<rect x="82" y={bodyY+16} width="36" height="8" rx="2" fill="#a8c3e8" opacity=".8"/>}
   </g>}
   {/* neck + head */}
   <rect x="92" y={cy+headR-16} width="16" height="18" fill={sk}/>
   <ellipse cx="100" cy={cy} rx={headR} ry={headR*1.06} fill={sk}/>
   {/* ears */}
   <circle cx={100-headR+4} cy={cy+6} r="7" fill={sk}/><circle cx={100+headR-4} cy={cy+6} r="7" fill={sk}/>
   {/* hair */}
   {stage==='baby'?<path d={`M${100-headR} ${cy-14} q4 -${headR-8} ${headR} -${headR-10} q${headR-4} 2 ${headR} ${headR-10} q2 10 -4 8 q-6 -18 -${headR-8} -14 q-8 2 -6 16 q-8 2 -8 -8`} fill={hair}/>:
   fem?<path d={`M${100-headR} ${cy-10} q0 -${headR+6} ${headR} -${headR+6} q${headR} 0 ${headR} ${headR+6} l4 34 q-2 8 -10 4 l0 -22 q-2 -14 -${headR-12} -12 q-10 2 -10 14 l0 20 q-10 4 -12 -4 z`} fill={hair}/>:
   <path d={`M${100-headR} ${cy-8} q2 -${headR+8} ${headR} -${headR+8} q${headR-2} 0 ${headR} ${headR+8} q-6 -12 -18 -10 q-12 -8 -${headR-14} 4 q-6 4 -6 10 z`} fill={hair}/>}
   {/* eyes */}
   <g className="bp-eyes">
     <circle cx={100-16} cy={cy-2} r="5.4" fill="#fff"/><circle cx={100-16} cy={cy-2} r="3" fill="#241f1c"/>
     <circle cx={100+16} cy={cy-2} r="5.4" fill="#fff"/><circle cx={100+16} cy={cy-2} r="3" fill="#241f1c"/>
   </g>
   {/* brows */}
   {mood==='sad'
     ?<g stroke={hair} strokeWidth="3.4" strokeLinecap="round"><path d={`M${100-24} ${cy-16} q8 -4 16 0`}/><path d={`M${100+8} ${cy-16} q8 0 16 -4`}/></g>
     :mood==='happy'
       ?<g stroke={hair} strokeWidth="3.4" strokeLinecap="round"><path d={`M${100-24} ${cy-17} q8 -6 16 -1`}/><path d={`M${100+8} ${cy-18} q8 -5 16 1`}/></g>
       :<g stroke={hair} strokeWidth="3.4" strokeLinecap="round"><path d={`M${100-24} ${cy-15} h16`}/><path d={`M${100+8} ${cy-15} h16`}/></g>}
   {/* mouth */}
   {mood==='happy'?<path d={`M86 ${cy+16} q14 14 28 0`} stroke="#7c3a2d" strokeWidth="3.6" fill="#ff8f8f" strokeLinecap="round"/>
     :mood==='sad'?<path d={`M88 ${cy+24} q12 -10 24 0`} stroke="#7c3a2d" strokeWidth="3.6" fill="none" strokeLinecap="round"/>
     :<path d={`M90 ${cy+18} h20`} stroke="#7c3a2d" strokeWidth="3.6" strokeLinecap="round"/>}
   {(mood==='happy')&&<g fill="#f78ca0" opacity=".5"><circle cx={100-26} cy={cy+8} r="6"/><circle cx={100+26} cy={cy+8} r="6"/></g>}
   {/* glasses for seniors / smart adults */}
   {(stage==='senior')&&<g stroke="#374151" strokeWidth="2.4" fill="none" opacity=".9"><circle cx={100-16} cy={cy-2} r="10"/><circle cx={100+16} cy={cy-2} r="10"/><path d={`M${100-6} ${cy-2} h12`}/></g>}
   {/* mustache for masculine adults+ */}
   {!fem&&(stage==='adult'||stage==='senior')&&<path d={`M88 ${cy+13} q12 8 24 0 q-12 3 -24 0`} fill={hair}/>}
   {/* baby pacifier */}
   {stage==='baby'&&<g><circle cx="100" cy={cy+20} r="7.5" fill="#ff9db3"/><circle cx="100" cy={cy+20} r="3.4" fill="#fff"/><path d={`M92 ${cy+13} q8 -4 16 0`} stroke="#e56b8c" strokeWidth="2.6" fill="none"/></g>}
   {/* party stars */}
   {(flash==='party'||flash==='good')&&<g className="bp-stars" fill="#ffd166"><path d="M38 40 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z"/><path d="M160 34 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 z"/><path d="M155 120 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z"/></g>}
  </svg>
 </div>;
}
