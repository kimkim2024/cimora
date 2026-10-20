import { useEffect, useRef, useState } from 'react';
import { FiX, FiArrowRight, FiCheck } from './meika/CanvasIcons';

const packs = [
 { name:'Free', title:'Every story starts here.', description:'A little space for your next big idea.', theme:'free', scene:'THE FIRST SPARK' },
 { name:'Hobbyist', title:'Follow your imagination.', description:'Make room for experiments, discoveries, and personal projects.', theme:'hobby', scene:'THE EXPLORER' },
 { name:'Pro creator', title:'Bring your vision to life.', description:'For creators building their next distinctive body of work.', theme:'pro', scene:'THE VISION MAKER' },
 { name:'Studio elite', title:'Build worlds together.', description:'A bigger stage for ambitious creative work.', theme:'studio', scene:'THE WORLD BUILDER' },
];
export function PackArt({ index, isolated = false }: { index:number; isolated?:boolean }) {
 const objectBounds = ["460 80 380 410", "325 50 580 400", "510 60 300 500", "420 15 460 560"];
 return <svg viewBox={isolated ? objectBounds[index] : "0 0 1000 700"} preserveAspectRatio={isolated ? "xMidYMid meet" : "xMidYMid slice"} aria-hidden="true">
  {!isolated && <>
  <path fill="var(--pack-sky)" d="M0 0h1000v700H0z"/>
  <path fill="var(--pack-mid)" d="m0 0 470 0L0 470Zm1000 30L360 700h640Z"/>
  <path fill="var(--pack-light)" opacity=".25" d="m650 0 90 0-390 700H180Zm350 280v130L160 700H0Z"/>
  <circle cx="695" cy="235" r="150" fill="none" stroke="var(--pack-light)" strokeWidth="2" opacity=".45"/>
  <path fill="var(--pack-dark)" d="M0 500 190 350l120 90 210-190 200 160 140-90 140 90v290H0Z"/>
  <path fill="var(--pack-mid)" d="m190 350 35 190-225-40Zm330-100 65 290-275-100Zm340 70 30 280-170-190Z"/>
  <path fill="var(--pack-light)" opacity=".65" d="m520 250-65 74 45-14 30 22 29-34Z"/>
  </>}
  {index===0&&<><path fill="#f5efd3" d="m490 350 170-43 150 53-150 43Z"/><path fill="#d1bc89" d="m490 350 170 53v55l-170-44Zm170 53 150-43v55l-150 43Z"/><path fill="#fff3a4" d="m659 110 30 90 71 33-71 33-30 92-29-92-72-33 72-33Z"/><path fill="#e99a34" d="m659 110 0 123 101 0-71 33-30 92Z"/><path fill="#fffbe1" d="m630 200 29-90v123l-101 0Z"/></>}
  {index===1&&<><path fill="#f4e6b9" d="m421 206 99-109 225-18 130 113-78 94-258-5Z"/><path fill="#e9b55e" d="m421 206 454-14-78 94-258-5Z"/><path fill="#fff4d5" d="m520 97 60 106 165-124Z"/><path fill="#cb7b42" d="m580 203-41 78 258 5-52-207Z"/><path stroke="#e9d6a0" strokeWidth="5" d="m540 278 45 89m185-82-47 82"/><path fill="#2d343c" d="m564 356 183 0-31 63-117 0Z"/><path fill="#ffd447" d="m584 357 142 0-24 24-106 0Z"/><path fill="#e9b55e" d="m421 206-69-46 12 118 69-48Z"/></>}
  {index===2&&<><path fill="#eee4c5" d="m575 427 32-219 47-37 54 37 36 219Z"/><path fill="#a897bb" d="m654 171 54 37 36 219-90-20Z"/><path fill="#ffd447" d="m578 205 76-118 79 118Z"/><path fill="#e99a34" d="m654 87 79 118h-79Z"/><path fill="#292039" d="M622 227h65v70h-65Z"/><path fill="#fff3a4" d="m626 235 53 0-25 53Z"/><path fill="#ece4cc" d="m538 430 117-30 128 30-128 51Z"/><path fill="#9b79a3" d="m538 430 117 51 128-51-40 56-88 41-90-41Z"/>{!isolated && <path fill="#fff3a4" opacity=".7" d="m654 245 346-182v78L654 261Z"/>}</>}
  {index===3&&<><path fill="#ead6a4" d="M478 400V244h62v-82h75v122h74V133h75v111h66v156Z"/><path fill="#ab703e" d="M516 244h24v156h-24Zm61-82h38v238h-38Zm148-29h39v267h-39Zm70 111h35v156h-35Z"/><path fill="#ffd447" d="m463 244 46-74 46 74Zm65-82 50-90 50 90Zm147-29 51-91 52 91Zm104 111 35-68 33 68Z"/><path fill="#312839" d="M627 400v-79l24-23 25 23v79ZM560 195h16v30h-16Zm146-28h16v30h-16Z"/><path fill="#fff3a4" d="m452 414 202-30 197 30-197 64Z"/><path fill="#a46c3c" d="m452 414 202 64 197-64-86 88-111 45-122-49Z"/></>}
  {!isolated && <><path fill="var(--pack-light)" d="m890 96 12 24 25 9-25 8-12 24-8-24-25-8 25-9ZM367 312l7 14 16 6-16 5-7 16-5-16-16-5 16-6Z"/>
  <path fill="#171b25" opacity=".55" d="M0 530 1000 480v220H0Z"/></>}
 </svg>;
}
export default function TopUpDialog({ onClose }: { onClose:()=>void }) {
 const dialog=useRef<HTMLDialogElement>(null);
 const [selected,setSelected]=useState(1);
 const [confirmed,setConfirmed]=useState(false);
 const pack=packs[selected];
 useEffect(()=>{const el=dialog.current;el?.showModal();return()=>el?.close();},[]);
 return <dialog ref={dialog} className="ct-pack-dialog" aria-labelledby="pack-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className={`ct-pack-layout pack-${pack.theme}`}>
   <div className="ct-pack-art" key={pack.theme}><PackArt index={selected}/></div>
   <header className="ct-pack-header"><div><span>CIMORA / CREDIT PACKS</span><h2 id="pack-title">TOP UP YOUR CREATIVITY</h2></div><button type="button" aria-label="Close top up" onClick={onClose}><FiX/></button></header>
   <nav className="ct-pack-nav" aria-label="Credit packs">{packs.map((item,index)=><button key={item.name} type="button" className={`ct-pack-tab pack-${item.theme}`} aria-pressed={selected===index} onClick={()=>{setSelected(index);setConfirmed(false);}}><PackArt index={index}/><span><small>0{index+1}</small><strong>{item.name}</strong></span>{selected===index&&<FiCheck/>}</button>)}</nav>
   <section className="ct-pack-detail" aria-live="polite"><span className="ct-pack-eyebrow">{pack.scene}</span><h3>{pack.name}</h3><p className="ct-pack-tagline">{pack.title}</p><p>{pack.description}</p></section>
   <footer className="ct-pack-footer"><div className="ct-pack-facts"><span>ONE-TIME CREDIT PACK</span><strong>{selected===0?'Free tier':'Price to be announced'}</strong><small>Credit amount to be confirmed · No subscription</small></div><div className="ct-pack-action"><button type="button" disabled={selected===0} onClick={()=>setConfirmed(true)}>{selected===0?'FREE PLAN':confirmed?'PREVIEW SELECTED':'PREVIEW TOP UP'}{confirmed?<FiCheck/>:<FiArrowRight/>}</button><p role="status">{confirmed?`${pack.name} selected. Demo only — no payment or credits added.`:'Interactive demo · Payments are not connected'}</p></div></footer>
  </div>
 </dialog>;
}
