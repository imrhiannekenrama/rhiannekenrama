/**
 * Buhay Pinoy — original standalone life-simulator mechanics.
 * ES modules, zero dependencies. Call functions with game state and DB;
 * every public operation returns a new state or {state,...} (never mutates caller).
 * Game balances are fictional and NOT Philippine legal, medical or wage advice.
 */
export const VERSION = '1.0.0';
export const DEGREE_RANK = Object.freeze({none:0, elementary:1,jhs:2,shs:3,technical:4,college:5,postgrad:6});
const BOUNDS = {stats:[0,100],relationships:[0,100],education:[0,100],career:[0,100],civic:[0,1000],legal:[0,100],finance:[0,1e15]};
const STAT_KEYS=['health','happiness','smarts','looks','stress','confidence','reputation','discipline','empathy','fitness','spirituality'];
const deep = v => JSON.parse(JSON.stringify(v));
const clamp=(n,a=0,b=100)=>Math.min(b,Math.max(a,n));
const id=(prefix,state)=>`${prefix}_${state.year}_${state._counter++}`;
const requireAlive=s=>{if(!s.living)throw Error('Character has died; use nextGeneration for a new playable life.');};
const requireAdult=s=>{if(s.age<18)throw Error('This action requires an adult (18+) in the game.');};
const push=(s,kind,text,extra={})=>s.history.push({age:s.age,year:s.year,kind,text,...extra});
function rand(s) { let x=s._rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;s._rng=x>>>0;return (s._rng>>>0)/4294967296; }
const randInt=(s,min,max)=>min+Math.floor(rand(s)*(max-min+1));
function choose(s,arr) {if(!arr.length) throw Error('Cannot choose from empty list');return arr[Math.floor(rand(s)*arr.length)];}
function catalog(db,key){const items=db?.catalog?.[key];if(!items)throw Error(`Database missing catalog.${key}`);return items;}
const find=(db,key,value)=>catalog(db,key).find(x=>x.id===value);
function rerate(s){
 for (const k of STAT_KEYS)s.stats[k]=clamp(s.stats[k]);
 s.relationships.familyBond=clamp(s.relationships.familyBond);
 s.relationships.friendship=clamp(s.relationships.friendship);
 s.education.performance=clamp(s.education.performance);
 s.career.performance=clamp(s.career.performance);
 s.career.experience=clamp(s.career.experience,0,100);
 s.legal.heat=clamp(s.legal.heat);s.civic.service=clamp(s.civic.service,0,1000);
 for(const k of ['cash','savings','debt','invested'])s.finance[k]=Math.max(0,Math.round(s.finance[k]));
 return s;
}
function spendOrDebt(s,cost){
  if(cost<=0){s.finance.cash+=-cost;return;}
  if(s.age<18){s.family.householdExpensesCovered=(s.family.householdExpensesCovered||0)+cost;return;}
  if(s.finance.cash>=cost){s.finance.cash-=cost;return;}
  const rest=cost-s.finance.cash;s.finance.cash=0;s.finance.debt+=rest;
}
function randomNpc(s,db,role='friend'){
 const ns=catalog(db,'names');const given=choose(s,ns.given.neutral.concat(ns.given.feminine,ns.given.masculine));
 return {id:id('npc',s),name:`${given} ${choose(s,ns.surnames)}`,role,age:Math.max(0,s.age+randInt(s,-3,3)),bond:50};
}
/** Loading: db={events:[...],catalog:{regions,names,jobs,assets,businesses,culture,...}}. */
export async function loadDatabase(baseUrl='../',fetcher=fetch){
 const base=baseUrl.endsWith('/')?baseUrl:`${baseUrl}/`;
 const read=async p=>{const res=await fetcher(new URL(p,base).href);if(!res.ok)throw Error(`Cannot load ${p}: ${res.status}`);return res.json();};
 const manifest=await read('manifest.json');
 const [[...eventParts],...catalogParts]=await Promise.all([
     Promise.all(manifest.eventFiles.map(read)),...manifest.catalogFiles.map(read)]);
 const events=eventParts.flat();const ct={};
 for(let k=0;k<manifest.catalogFiles.length;k++)ct[manifest.catalogFiles[k].split('/').pop().replace('.json','')]=catalogParts[k];
 return {manifest,events,catalog:ct,eventById:Object.fromEntries(events.map(e=>[e.id,e]))};
}
export function compileDatabase(manifest,events,catalogs){return {manifest,events,catalog:catalogs,eventById:Object.fromEntries(events.map(e=>[e.id,e]))};}
export function createLife(db,opts={}){
 const seed=(Number.isFinite(opts.seed)?opts.seed:(Math.random()*0xffffffff))>>>0;
 const s={
   version:VERSION,_rng:seed||0x914365af,_counter:1,
   age:0,year:opts.year||2026,birthYear:opts.year||2026,living:true,
   gender:opts.gender||'unspecified',firstName:'',lastName:'',
   birthplace:null,regionId:opts.regionId||'r8',city:null,homeRegion:null,
   stats:{health:85,happiness:75,smarts:50,looks:50,stress:0,confidence:40,reputation:50,discipline:45,empathy:50,fitness:50,spirituality:50},
   finance:{cash:0,savings:0,debt:0,invested:0},
   education:{level:'none',grade:null,performance:50,enrolled:null,history:[]},
   career:{jobId:null,level:0,experience:0,performance:50,yearStarted:null,history:[],retired:false},
   relationships:{familyBond:65,friendship:50,partner:null,status:'single',friends:[]},
   family:{parents:[],children:[],householdExpensesCovered:0},
   legal:{heat:0,criminalRecord:0,jailYears:0},civic:{service:0},
   businesses:[],assets:[],conditions:[],inventory:[],achievements:[],
   flags:{},seenEvents:{},pendingEventId:null,history:[]
 };
 const region=find(db,'regions',s.regionId);if(!region)throw Error('Unknown regionId');
 const ns=catalog(db,'names');
 s.firstName=opts.firstName||choose(s,ns.given[opts.gender]||ns.given.neutral);
 s.lastName=opts.lastName||choose(s,ns.surnames);
 s.city=opts.city||choose(s,region.sampleLocations);s.birthplace={regionId:s.regionId,city:s.city};s.homeRegion=s.regionId;
 s.stats.smarts=randInt(s,28,78);s.stats.looks=randInt(s,28,78);s.stats.health=randInt(s,70,100);
 s.family.parents=[randomNpc(s,db,'guardian'),randomNpc(s,db,'guardian')].map(x=>({...x,age:randInt(s,23,43)}));
 push(s,'birth',`${s.firstName} ${s.lastName} was born in ${s.city}, ${region.name}.`);
 return s;
}
export function getStage(age){return age<6?'early childhood':age<13?'childhood':age<18?'teenager':age<30?'young adult':age<60?'adult':'senior';}
export function netWorth(s,db){
 let total=s.finance.cash+s.finance.savings+s.finance.invested-s.finance.debt;
 if(db)for(const v of s.assets){const a=find(db,'assets',v.id);if(a)total+=Math.round(a.pricePHP*.75)*v.quantity;}
 if(db)for(const b of s.businesses){const x=find(db,'businesses',b.id);if(x)total+=Math.round(x.startupCostPHP*.60);}
 return Math.round(total);
}
export function eligible(s,e){
 if(!s.living||s.age<e.minAge||s.age>e.maxAge||s.legal.jailYears>0)return false;
 if(e.regionIds&&!e.regionIds.includes(s.regionId))return false;
 if(e.once&&s.seenEvents[e.id]!==undefined)return false;
 if(s.seenEvents[e.id]!==undefined&&s.age-s.seenEvents[e.id]<5)return false;
 const r=e.requires||{};
 if(r.jobId&&s.career.jobId!==r.jobId)return false;
 if(r.employed!==undefined&&Boolean(s.career.jobId)!==r.employed)return false;
 if(r.relationshipStatus&&s.relationships.status!==r.relationshipStatus)return false;
 if(r.educationAtLeast&&DEGREE_RANK[s.education.level]<DEGREE_RANK[r.educationAtLeast])return false;
 if(r.cashMin!==undefined&&s.finance.cash<r.cashMin)return false;
 if(r.flag&&s.flags[r.flag]!==true)return false;
 return true;
}
export function listEligibleEvents(s,db,{category,tag,sourceType}={}){
 return db.events.filter(e=>eligible(s,e)&&(!category||e.category===category)&&(!tag||e.tags.includes(tag))&&(!sourceType||e.sourceType===sourceType));
}
export function selectEvent(s,db,filters={}){
 const next=deep(s);requireAlive(next);
 if(next.pendingEventId)return {state:next,event:db.eventById[next.pendingEventId]};
 const possibilities=listEligibleEvents(next,db,filters);if(!possibilities.length)return {state:next,event:null};
 const weight=possibilities.reduce((n,e)=>n+(e.weight||1),0);
 let ticket=rand(next)*weight;let event=possibilities.at(-1);
 for(const e of possibilities){ticket-=(e.weight||1);if(ticket<0){event=e;break;}}
 next.pendingEventId=event.id;return {state:next,event};
}
export function applyEffects(s,effects={}){
 const next=deep(s);
 const numericGroups=new Set(['stats','finance','education','career','relationships','civic','legal']);
 for(const [path,delta] of Object.entries(effects)){
   if(!Number.isFinite(delta))throw Error(`Invalid numeric effect ${path}`);
   const bits=path.split('.');if(bits.length!==2||!numericGroups.has(bits[0]))throw Error(`Effect path not allowed: ${path}`);
   const [root,key]=bits;if(typeof next[root]?.[key]!=='number')throw Error(`Unknown numeric effect: ${path}`);
   if(path==='finance.cash'){spendOrDebt(next,-delta);continue;}
   if(path==='finance.savings'&&delta<0){const taken=Math.min(next.finance.savings,-delta);next.finance.savings-=taken;next.finance.cash+=taken;continue;}
   next[root][key]+=delta;
 }
 return rerate(next);
}
function applyAction(s,db,action){
 if(!action)return s;
 try {
   switch(action.type){
     case 'startDating':return startDating(s,db);
     case 'marry':return marry(s);
     case 'haveChild':return haveChild(s,db);
     case 'resign':return resign(s);
     case 'repayDebt':return repayDebt(s,action.amount||1000);
     case 'startEducation':return startEducation(s,action.path);
     case 'crime':{const n=deep(s);n.legal.heat=clamp(n.legal.heat+4*Number(action.severity||1));return n;}
     case 'jail':return imprison(s,action.years||1);
     case 'setFlag':{const n=deep(s);n.flags[String(action.key)]=action.value??true;return n;}
     default:throw Error('Unsupported event action type: '+action.type);
   }
 }catch(err){
   // Expected failure of a random milestone (e.g., already married) does not crash the game.
   const next=deep(s);push(next,'action',`A possible follow-up could not happen: ${err.message}`);return next;
 }
}
export function answerEvent(s,db,optionId){
 const n=deep(s);requireAlive(n);
 if(!n.pendingEventId)throw Error('No event is pending. Call selectEvent or ageUp first.');
 const event=db.eventById[n.pendingEventId];if(!event)throw Error('Pending event ID not present in database');
 const option=event.options.find(x=>x.id===optionId);if(!option)throw Error('Invalid option for pending event');
 let outcome=option.outcome;
 let next=applyEffects(n,option.effects);
 next=applyAction(next,db,option.action);
 if(option.chance){
   const succeeded=rand(next)<option.chance.probability;
   const branch=succeeded?option.chance.success:option.chance.failure;
   if(branch){if(branch.outcome)outcome=branch.outcome;next=applyEffects(next,branch.effects);next=applyAction(next,db,branch.action);}
 }
 next.seenEvents[event.id]=next.age;next.pendingEventId=null;
 push(next,'choice',`${event.title} — ${option.label}. ${outcome}`,{eventId:event.id,optionId:option.id});
 if(next.stats.health<=0)next=die(next,'Severe health complications');
 checkAchievements(next,db);
 return {state:next,event,option,outcome};
}
function ordinaryEducation(s){
 if(s.age===6){s.education.level='elementary';s.education.grade=1;push(s,'school','You started Grade 1.');}
 else if(s.age>=7&&s.age<=11){s.education.grade=s.age-5;}
 else if(s.age===12){s.education.level='jhs';s.education.grade=7;push(s,'school','You started junior high school.');}
 else if(s.age>=13&&s.age<=15){s.education.grade=s.age-5;}
 else if(s.age===16){s.education.level='shs';s.education.grade=11;push(s,'school','You started senior high school.');}
 else if(s.age===17)s.education.grade=12;
 else if(s.age===18){s.education.level='shs';s.education.grade=null;push(s,'school','You completed the game’s basic K–12 education path.');}
}
function yearlyEconomy(s,db){
 const r=find(db,'regions',s.regionId);
 const cost=r?.gameCostMultiplier||1;
 if(s.age>=18){
   let pay=0;
   if(s.career.jobId&&!s.legal.jailYears){const job=find(db,'jobs',s.career.jobId);
     if(job){pay=Math.round(job.annualBasePayPHP*(1+0.15*s.career.level)*(0.88+0.24*rand(s)));}}
   // Game-only simplified tax/benefit deduction; not statutory Philippine brackets.
   const deductions=Math.round(pay*.09);s.finance.cash+=pay-deductions;
   const expense=Math.round((s.age<=22?96000:s.age<60?152000:120000)*cost*(0.85+rand(s)*0.3));
   spendOrDebt(s,expense);
   s.finance.debt=Math.round(s.finance.debt*1.07);
   s.finance.savings+=Math.round(s.finance.savings*0.015);
   s.finance.invested=Math.round(s.finance.invested*(0.93+0.17*rand(s)));
   for(const own of s.businesses){const b=find(db,'businesses',own.id);if(!b)continue;
      const profit=Math.round(b.baselineAnnualRevenuePHP*b.expectedMargin*(0.55+1.05*rand(s)));
      s.finance.cash+=profit;own.lifetimeProfit+=profit;own.years+=1;
   }
   for(const a of s.assets){const item=find(db,'assets',a.id);if(item)spendOrDebt(s,item.annualMaintenancePHP*a.quantity);}
   for(const ch of s.family.children){if(ch.age<18)spendOrDebt(s,Math.round(22000*cost));}
   if(s.career.jobId)s.career.experience=clamp(s.career.experience+4,0,100);
   if(s.legal.heat>0)s.legal.heat=clamp(s.legal.heat-2);
   push(s,'finances',`Annual finances: wages ₱${pay.toLocaleString('en-PH')}, deductions ₱${deductions.toLocaleString('en-PH')}, living costs ₱${expense.toLocaleString('en-PH')}.`);
 }
}
function yearlyHealth(s){
 s.stats.stress=clamp(s.stats.stress-2);
 if(s.age>=55){s.stats.health=clamp(s.stats.health-randInt(s,0,3));s.stats.fitness=clamp(s.stats.fitness-randInt(s,0,2));}
 if(s.age<12)s.stats.health=clamp(s.stats.health+randInt(s,0,2));
 if(s.stats.stress>80)s.stats.health=clamp(s.stats.health-3);
 for(const c of s.conditions){c.years++;if(rand(s)<.22){s.stats.health=clamp(s.stats.health-1);}}
}
export function die(s,cause='Natural causes'){
 const n=deep(s);if(!n.living)return n;
 n.living=false;n.pendingEventId=null;n.death={age:n.age,year:n.year,cause};
 push(n,'death',`${n.firstName} died at age ${n.age}. Cause: ${cause}.`);return n;
}
export function ageUp(s,db,{autoEvent=true}={}){
 let n=deep(s);requireAlive(n);
 if(n.pendingEventId)throw Error('Resolve your pending situation before aging up.');
 n.age++;n.year++;
 for(const ch of n.family.children)ch.age++;
 for(const p of n.family.parents)p.age++;
 if(n.legal.jailYears>0){n.legal.jailYears--;if(!n.legal.jailYears)push(n,'legal','You completed the game’s simplified sentence and were released.');}
 ordinaryEducation(n);
 if(n.education.enrolled){
   n.education.enrolled.yearsLeft--;
   if(n.education.enrolled.yearsLeft<=0){
     n.education.level=n.education.enrolled.path;
     n.education.history.push({year:n.year,path:n.education.level});
     push(n,'graduation',`You completed ${n.education.level} studies.`);
     n.education.enrolled=null;
   }
 }
 yearlyEconomy(n,db);yearlyHealth(n);
 if(n.age===60&&n.career.jobId&&!n.career.retired)push(n,'milestone','You can now consider retirement (the game has no mandatory retirement age).');
 if(n.age>=65&&n.stats.health<30&&rand(n)<.08)n=die(n,'Age-related health complications');
 else if(n.age>=85&&rand(n)<(n.age-82)*.014)n=die(n,'Natural causes');
 else if(n.age>=115)n=die(n,'Advanced age');
 if(n.stats.health<=0)n=die(n,'Severe health complications');
 checkAchievements(n,db);push(n,'birthday',`You turned ${n.age} years old.`);
 if(!n.living||!autoEvent)return {state:n,event:null};
 return selectEvent(n,db);
}
export function startEducation(s,path){
 const n=deep(s);requireAlive(n);requireAdult(n);
 if(n.education.enrolled)throw Error('Already enrolled in a program');
 if(!['technical','college','postgrad'].includes(path))throw Error('Unknown education path');
 if(path==='college'&&DEGREE_RANK[n.education.level]<3)throw Error('Senior high school or an equivalent path is required by this game.');
 if(path==='postgrad'&&DEGREE_RANK[n.education.level]<5)throw Error('College qualification required.');
 const duration={technical:2,college:4,postgrad:2}[path];const fee={technical:7000,college:24000,postgrad:35000}[path];
 spendOrDebt(n,fee);n.education.enrolled={path,yearsLeft:duration};
 push(n,'education',`You enrolled in ${path} study; ₱${fee.toLocaleString('en-PH')} paid.`);return n;
}
export function applyForJob(s,db,jobId){
 const n=deep(s);requireAlive(n);requireAdult(n);
 if(n.legal.jailYears)throw Error('Cannot start a job while serving a sentence');
 const job=find(db,'jobs',jobId);if(!job)throw Error('Unknown job');
 if(DEGREE_RANK[n.education.level]<DEGREE_RANK[job.requiredEducation])throw Error(`Need ${job.requiredEducation} education for this game role`);
 const old=n.career.jobId;n.career.jobId=jobId;n.career.level=0;n.career.yearStarted=n.year;
 n.career.performance=50;n.career.retired=false;n.career.history.push({year:n.year,jobId});
 push(n,'career',`${old?'Changed careers to':'Hired as'} ${job.title}.`);checkAchievements(n,db);return n;
}
export function promote(s){const n=deep(s);requireAlive(n);if(!n.career.jobId)throw Error('Not employed');
 if(n.career.level>=6)throw Error('Already at max career level');
 if(n.career.performance<60||n.career.experience<10)throw Error('Improve performance and experience first');
 n.career.level++;n.career.performance=clamp(n.career.performance-10);
 push(n,'career',`Earned a promotion to career level ${n.career.level}.`);return n;}
export function resign(s){const n=deep(s);requireAlive(n);n.career.jobId=null;n.career.level=0;push(n,'career','You left your job.');return n;}
export function retire(s){const n=resign(s);n.career.retired=true;push(n,'career','You chose to retire from employment.');return n;}
export function saveMoney(s,amount){const n=deep(s);requireAlive(n);requireAdult(n);amount=Math.round(amount);
 if(amount<=0||amount>n.finance.cash)throw Error('Insufficient cash or invalid amount');n.finance.cash-=amount;n.finance.savings+=amount;push(n,'finance',`Saved ₱${amount}.`);return n;}
export function withdrawSavings(s,amount){const n=deep(s);requireAlive(n);amount=Math.round(amount);if(amount<=0||amount>n.finance.savings)throw Error('Invalid amount');n.finance.savings-=amount;n.finance.cash+=amount;return n;}
export function borrow(s,amount){const n=deep(s);requireAlive(n);requireAdult(n);amount=Math.round(amount);
 if(amount<=0||amount>2e7)throw Error('Invalid loan amount');n.finance.cash+=amount;n.finance.debt+=amount;push(n,'finance',`Borrowed ₱${amount} (fictional interest applies annually).`);return n;}
export function repayDebt(s,amount){const n=deep(s);requireAlive(n);requireAdult(n);amount=Math.min(Math.round(amount),n.finance.debt,n.finance.cash);
 if(amount<=0)throw Error('No affordable repayment');n.finance.cash-=amount;n.finance.debt-=amount;push(n,'finance',`Repaid ₱${amount} in debt.`);return n;}
export function invest(s,amount){const n=deep(s);requireAlive(n);requireAdult(n);amount=Math.round(amount);
 if(amount<=0||amount>n.finance.cash)throw Error('Insufficient cash');n.finance.cash-=amount;n.finance.invested+=amount;push(n,'finance',`Invested ₱${amount}; game investment values may rise or fall.`);return n;}
export function sellInvestment(s,amount){const n=deep(s);requireAlive(n);amount=Math.round(amount);if(amount<=0||amount>n.finance.invested)throw Error('Invalid amount');n.finance.invested-=amount;n.finance.cash+=amount;return n;}
export function buyAsset(s,db,assetId){const n=deep(s);requireAlive(n);requireAdult(n);const a=find(db,'assets',assetId);if(!a)throw Error('Unknown asset');
 if(n.finance.cash<a.pricePHP)throw Error(`Need ₱${a.pricePHP} cash`);
 n.finance.cash-=a.pricePHP;const own=n.assets.find(x=>x.id===assetId);if(own)own.quantity++;else n.assets.push({id:assetId,quantity:1});
 push(n,'asset',`Purchased ${a.name} for ₱${a.pricePHP}.`);checkAchievements(n,db);return n;}
export function sellAsset(s,db,assetId){const n=deep(s);requireAlive(n);const own=n.assets.find(x=>x.id===assetId);
 if(!own)throw Error('Asset not owned');const a=find(db,'assets',assetId);n.finance.cash+=Math.round(a.pricePHP*.65);own.quantity--;
 if(!own.quantity)n.assets=n.assets.filter(x=>x.id!==assetId);push(n,'asset',`Sold ${a.name}.`);return n;}
export function openBusiness(s,db,businessId){const n=deep(s);requireAlive(n);requireAdult(n);const b=find(db,'businesses',businessId);if(!b)throw Error('Unknown business');
 if(n.finance.cash<b.startupCostPHP)throw Error(`Need ₱${b.startupCostPHP} cash`);
 n.finance.cash-=b.startupCostPHP;n.businesses.push({id:businessId,instance:id('biz',n),years:0,lifetimeProfit:0});
 push(n,'business',`Opened ${b.name}; startup cost ₱${b.startupCostPHP}.`);checkAchievements(n,db);return n;}
export function closeBusiness(s,db,instanceId){const n=deep(s);requireAlive(n);const own=n.businesses.find(x=>x.instance===instanceId);if(!own)throw Error('Business not found');
 const b=find(db,'businesses',own.id);n.finance.cash+=Math.round(b.startupCostPHP*.32);n.businesses=n.businesses.filter(x=>x.instance!==instanceId);
 push(n,'business',`Closed ${b.name} and salvaged part of its equipment value.`);return n;}
export function startDating(s,db){const n=deep(s);requireAlive(n);requireAdult(n);if(n.relationships.status==='dating'||n.relationships.status==='married')throw Error('Already in a relationship');
 n.relationships.partner=randomNpc(n,db,'partner');n.relationships.status='dating';push(n,'relationship',`You started dating ${n.relationships.partner.name}.`);return n;}
export function marry(s){const n=deep(s);requireAlive(n);requireAdult(n);if(n.relationships.status!=='dating')throw Error('Must be dating before marrying');
 n.relationships.status='married';spendOrDebt(n,12000);push(n,'relationship',`You married ${n.relationships.partner.name}.`);return n;}
export function separate(s){const n=deep(s);requireAlive(n);if(!['married','dating'].includes(n.relationships.status))throw Error('No partnership');
 n.relationships.status='single';n.relationships.partner=null;n.stats.happiness=clamp(n.stats.happiness-10);
 push(n,'relationship','You and your partner decided to separate.');return n;}
export function haveChild(s,db){const n=deep(s);requireAlive(n);requireAdult(n);const ns=catalog(db,'names');
 if(n.family.children.length>=12)throw Error('Maximum supported children reached');
 const name=choose(n,ns.given.neutral.concat(ns.given.feminine,ns.given.masculine));
 const ch={id:id('child',n),name:`${name} ${n.lastName}`,age:0,birthYear:n.year,bond:65};n.family.children.push(ch);
 spendOrDebt(n,15000);n.relationships.familyBond=clamp(n.relationships.familyBond+5);
 push(n,'family',`You welcomed ${ch.name} into your family.`);checkAchievements(n,db);return n;
}
export function makeFriend(s,db){const n=deep(s);requireAlive(n);if(n.relationships.friends.length>=60)throw Error('Friend limit reached');
 const f=randomNpc(n,db,'friend');n.relationships.friends.push(f);n.relationships.friendship=clamp(n.relationships.friendship+4);
 push(n,'relationship',`You befriended ${f.name}.`);return n;}
export function spendTime(s,target='family') {const n=deep(s);requireAlive(n);
 if(target==='family')n.relationships.familyBond=clamp(n.relationships.familyBond+6);
 else if(target==='friends')n.relationships.friendship=clamp(n.relationships.friendship+6);
 else if(target==='partner'){if(!n.relationships.partner)throw Error('No partner');n.relationships.partner.bond=clamp(n.relationships.partner.bond+6);}
 else throw Error('Unknown relationship target');n.stats.happiness=clamp(n.stats.happiness+3);return n;}
export function moveRegion(s,db,regionId,city=null){const n=deep(s);requireAlive(n);requireAdult(n);const region=find(db,'regions',regionId);if(!region)throw Error('Unknown region');
 spendOrDebt(n,18000);n.regionId=regionId;n.city=city||choose(n,region.sampleLocations);
 push(n,'relocation',`Moved to ${n.city}, ${region.name}.`);return n;}
export function visitRegion(s,db,regionId){const n=deep(s);requireAlive(n);const region=find(db,'regions',regionId);if(!region)throw Error('Unknown region');
 spendOrDebt(n,6500);n.stats.happiness=clamp(n.stats.happiness+6);push(n,'travel',`Visited ${region.name} for a short trip.`);return n;}
export function getSick(s,db,conditionId){const n=deep(s);requireAlive(n);const illness=find(db,'health_conditions',conditionId);if(!illness)throw Error('Unknown condition');
 if(!n.conditions.some(x=>x.id===conditionId))n.conditions.push({id:conditionId,years:0});
 n.stats.health=clamp(n.stats.health-illness.severity*3);push(n,'health',`You developed a game condition: ${illness.label}.`);return n;}
export function visitClinic(s){const n=deep(s);requireAlive(n);spendOrDebt(n,1800);n.stats.health=clamp(n.stats.health+randInt(n,7,15));
 if(n.conditions.length&&rand(n)<.65)n.conditions.shift();push(n,'health','You visited a healthcare provider.');return n;}
export function imprison(s,years=1){const n=deep(s);requireAlive(n);requireAdult(n);n.legal.jailYears=Math.max(n.legal.jailYears,Math.min(10,Math.round(years)));
 n.legal.criminalRecord++;n.career.jobId=null;n.stats.happiness=clamp(n.stats.happiness-20);
 push(n,'legal',`You received a fictional sentence of ${n.legal.jailYears} year(s).`);return n;}
export function volunteer(s){const n=deep(s);requireAlive(n);n.civic.service+=2;n.stats.reputation=clamp(n.stats.reputation+2);n.stats.empathy=clamp(n.stats.empathy+2);
 push(n,'community','You gave time to a community volunteer effort.');return n;}
export function doActivity(s,db,kind){let n=deep(s);requireAlive(n);switch(kind){
 case 'study':n.stats.smarts=clamp(n.stats.smarts+2);n.education.performance=clamp(n.education.performance+5);n.stats.stress=clamp(n.stats.stress+1);break;
 case 'exercise':n.stats.health=clamp(n.stats.health+2);n.stats.fitness=clamp(n.stats.fitness+4);n.stats.stress=clamp(n.stats.stress-2);break;
 case 'rest':n.stats.stress=clamp(n.stats.stress-5);n.stats.happiness=clamp(n.stats.happiness+2);break;
 case 'workHarder':if(!n.career.jobId)throw Error('Need a job');n.career.performance=clamp(n.career.performance+5);n.stats.stress=clamp(n.stats.stress+4);break;
 case 'familyTime':n=spendTime(n,'family');break;
 case 'friendTime':n=spendTime(n,'friends');break;
 case 'volunteer':n=volunteer(n);break;
 case 'network':n=makeFriend(n,db);break;
 case 'checkup':n=visitClinic(n);break;
 case 'meditate':n.stats.stress=clamp(n.stats.stress-5);n.stats.spirituality=clamp(n.stats.spirituality+3);break;
 case 'sideGig':requireAdult(n);n.finance.cash+=randInt(n,1000,5500);n.stats.stress=clamp(n.stats.stress+3);break;
 case 'donate':requireAdult(n);if(n.finance.cash<500)throw Error('Need ₱500 cash');n.finance.cash-=500;n.civic.service+=2;n.stats.empathy=clamp(n.stats.empathy+2);break;
 default:throw Error('Unknown activity');
 }push(n,'activity',`Activity: ${kind}.`);checkAchievements(n,db);return n;}
export function checkAchievements(s,db){
 const add=i=>{if(!s.achievements.includes(i))s.achievements.push(i);};
 if(s.civic.service>=1)add('barangay_helper');if(s.civic.service>=20)add('bayanihan_hero');
 if(s.education.level==='college'||s.education.level==='postgrad')add('iskolar');
 if(s.education.level==='technical')add('technical_talent');
 if(s.relationships.familyBond>=90)add('family_first');
 if(s.career.jobId)add('first_paycheck');if(s.businesses.length)add('negosyante');
 if(s.finance.savings>=100000)add('financial_cushion');
 const worth=netWorth(s,db);if(worth>=1e6)add('millionaire');if(worth>=1e7)add('multimillionaire');
 if(s.assets.some(a=>['home','property'].includes(find(db,'assets',a.id)?.type)))add('homeowner');
 if(s.assets.some(a=>find(db,'assets',a.id)?.type==='vehicle'))add('road_warrior');
 if(s.relationships.partner)add('first_love');if(s.relationships.status==='married')add('wedding_bells');
 if(s.family.children.length)add('parenthood');if(s.career.level>=4)add('career_climber');
 if(s.businesses.length>=3)add('business_builder');if(s.age>=90)add('long_life');if(s.age>=100)add('centenarian');
 const job=find(db,'jobs',s.career.jobId);
 if(job){if(job.industry==='Overseas work')add('worldly');if(job.industry==='Creative'||job.industry==='Arts')add('creative_spark');
 if(job.industry==='Technology')add('tech_builder');if(job.industry==='Public service')add('public_service');
 if(job.industry==='Health')add('medical_hero');if(job.industry==='Maritime')add('seaside_life');
 if(job.industry==='Agriculture')add('rural_roots');}
}
export function lifeSummary(s,db){return {
 name:`${s.firstName} ${s.lastName}`,age:s.age,year:s.year,stage:getStage(s.age),living:s.living,
 region:find(db,'regions',s.regionId)?.name||s.regionId,city:s.city,
 job:find(db,'jobs',s.career.jobId)?.title||'Not employed',education:s.education.level,
 netWorthPHP:netWorth(s,db),cashPHP:s.finance.cash,savingsPHP:s.finance.savings,debtPHP:s.finance.debt,
 familySize:s.family.children.length+1,relationship:s.relationships.status,
 achievements:s.achievements.length,death:s.death||null
};}
/** Family succession carries household inheritance into a newly playable life. */
export function nextGeneration(s,db,childId){
 if(s.living)throw Error('Succession is only available after death.');
 const ch=s.family.children.find(x=>x.id===childId);if(!ch)throw Error('Child not found');
 const n=createLife(db,{firstName:ch.name.replace(` ${s.lastName}`,'').trim(),lastName:s.lastName,year:s.year-ch.age,regionId:s.regionId,seed:s._rng});
 // The game seeds the new life then advances to the child’s current age with no events.
 for(let i=0;i<ch.age;i++){const out=ageUp(n,db,{autoEvent:false});Object.assign(n,out.state);if(!n.living)break;}
 n.year=s.year;n.birthYear=s.year-n.age;
 n.finance.cash+=Math.max(0,Math.round(netWorth(s,db)/Math.max(s.family.children.length,1)));
 n.family.parents=[{id:'parent_previous',name:`${s.firstName} ${s.lastName}`,age:s.age,role:'deceased parent',bond:75}];
 push(n,'legacy',`You continue the family story as ${ch.name}.`);return n;
}
export function serializeGame(s){return JSON.stringify(s);}
export function restoreGame(json){const x=typeof json==='string'?JSON.parse(json):deep(json);
 if(x.version!==VERSION||!Number.isInteger(x.age)||!Number.isInteger(x._rng)||typeof x.stats?.health!=='number'||typeof x.finance?.cash!=='number'||!Array.isArray(x.history))throw Error('Invalid/incompatible save');return x;}

/** Optional life systems: pets, civic life, household gifts, OFW family remittances. */
export function adoptPet(s,kind='cat'){
 const n=deep(s);requireAlive(n);if(!['cat','dog','fish','bird'].includes(kind))throw Error('Unknown pet type');
 if(!n.pets)n.pets=[];if(n.pets.length>=8)throw Error('Maximum pets reached');
 spendOrDebt(n,1200);const pet={id:id('pet',n),type:kind,name:kind==='dog'?'Bantay':kind==='cat'?'Muning':kind==='fish'?'Bubbles':'Kiko',bond:60,health:85,age:0};
 n.pets.push(pet);n.stats.happiness=clamp(n.stats.happiness+4);push(n,'pet',`You welcomed a ${kind} named ${pet.name}.`);return n;
}
export function careForPet(s,petId){const n=deep(s);requireAlive(n);const pet=(n.pets||[]).find(p=>p.id===petId);
 if(!pet)throw Error('Pet not found');spendOrDebt(n,300);pet.bond=clamp(pet.bond+6);pet.health=clamp(pet.health+3);
 n.stats.happiness=clamp(n.stats.happiness+2);push(n,'pet',`You spent time caring for ${pet.name}.`);return n;}
export function giveGift(s,target='family',amount=700){const n=deep(s);requireAlive(n);amount=Math.round(amount);
 if(amount<=0)throw Error('Invalid gift');spendOrDebt(n,amount);
 if(target==='partner'){if(!n.relationships.partner)throw Error('No partner');n.relationships.partner.bond=clamp(n.relationships.partner.bond+5);}
 else if(target==='friend'){n.relationships.friendship=clamp(n.relationships.friendship+4);}
 else if(target==='family'){n.relationships.familyBond=clamp(n.relationships.familyBond+4);}
 else throw Error('Invalid gift target');push(n,'gift',`You shared a thoughtful ₱${amount} gift.`);return n;}
export function sendRemittance(s,amount){const n=deep(s);requireAlive(n);requireAdult(n);amount=Math.round(amount);
 if(amount<=0||amount>n.finance.cash)throw Error('Insufficient money to send a remittance');
 n.finance.cash-=amount;n.relationships.familyBond=clamp(n.relationships.familyBond+3);
 push(n,'family',`You sent ₱${amount} to relatives to help with their needs.`);return n;}
export function participateInCivicForum(s){const n=deep(s);requireAlive(n);if(n.age<15)throw Error('Not eligible for this game activity');
 n.civic.service+=1;n.stats.smarts=clamp(n.stats.smarts+1);n.stats.reputation=clamp(n.stats.reputation+1);
 push(n,'civic','You joined an issue-based community consultation.');return n;}
export function registerToVote(s){const n=deep(s);requireAlive(n);requireAdult(n);n.flags.registeredVoter=true;
 push(n,'civic','You followed the game’s simplified voter registration process.');return n;}
export function castVote(s){const n=deep(s);requireAlive(n);requireAdult(n);if(!n.flags.registeredVoter)throw Error('Register first');
 n.civic.service+=1;push(n,'civic','You participated in a secret, issue-based vote.');return n;}
export function runForCommunityOffice(s){const n=deep(s);requireAlive(n);requireAdult(n);
 if(n.civic.service<10||n.stats.reputation<60)throw Error('Build civic experience and reputation first');
 spendOrDebt(n,5500);const win=rand(n)<clamp((n.stats.reputation+n.civic.service)/190,.15,.82);
 n.flags.communityOfficial=win;n.stats.reputation=clamp(n.stats.reputation+(win?7:-1));
 push(n,'civic',win?'You won a fictional local community leadership contest.':'You ran for a community leadership role and did not win this time.');
 return {state:n,won:win};}
