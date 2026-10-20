import {useState, useEffect} from "react";
import s from "./App.module.css";
const roles=[{name:"Anime Creator",tag:"ANIME",paths:["Character Creation","Anime Shorts"],desc:"Give your imagination a character. Then give that character a story.",out:["Character art & variations","Anime shots & short films"]},{name:"Game Builder",tag:"GAME",paths:["Game Concept Visualization","Game Asset Generation"],desc:"Explore the look of your next game, before you build it.",out:["Game concept videos","2D icons, portraits & backgrounds"]},{name:"Comic Artist",tag:"COMIC",paths:["American Comics","Manga","Webtoon"],desc:"Find your cast. Frame the moment. Tell your next story.",out:["American-style comic pages","Manga pages","Vertical comic panels"]}];
function Blank({label}:{label:string}){return <div className={s.blank}><span>＋</span><p>{label}<small>ARTWORK COMING SOON</small></p><span>＋</span></div>}
function GameHero({ onOpen }: { onOpen: () => void }) {
  return <section id="home" className={s.comicHero}>
    <div className={s.stageStamp}>CIMORA STUDIO / GAME BUILDER <span>01 — IMAGINE FIRST</span></div>
    <div className={s.comicStage} aria-label="Reserved space for game characters and scene artwork">
      <span className={s.stageWord} aria-hidden="true">IMAGINE</span>
      <div className={s.artGuide}><span>＋</span><p>YOUR NEXT WORLD<small>CHARACTER + SCENE ARTWORK<br/>COMING SOON</small></p><span>＋</span></div>
      <div className={s.stageSeal}>YOUR IDEA.<br/><strong>YOUR RULES.</strong></div>
    </div>
    <div className={s.heroPlacard}>
      <p className={s.kicker}>FROM IDEA TO POSSIBILITY</p>
      <h1>SEE YOUR GAME.<br/>BEFORE YOU<br/>BUILD IT.</h1>
      <p className={s.placardLead}>Visualize concepts. Create assets.<br/>All on one AI canvas.</p>
      <button className={s.cta} onClick={onOpen}>Open Studio <span>↗</span></button>
    </div>
    <div className={s.demoSticker}>
      <h2>SEE WHAT'S POSSIBLE ↗</h2>
      <div className={s.demoPlaceholder}><span aria-hidden="true">▷</span><p>DEMO PREVIEW<small>VIDEO COMING SOON</small></p></div>
      <span className={s.stickerFoot}>CONCEPTS / ASSETS / NEW WORLDS</span>
    </div>
    <a className={s.stageScroll} href="#roles">CHOOSE YOUR ABILITY ↓</a>
  </section>;
}
export default function App(){
const role=roles.findIndex(x=>"/"+x.tag.toLowerCase()===window.location.pathname.replace(/\/$/,""));
const isHome=role===-1;
const [choices,setChoices]=useState([0,0,0]),[preview,setPreview]=useState(0),[filter,setFilter]=useState(0),[notice,setNotice]=useState(false);
const r=roles[isHome?0:role],c=choices[isHome?0:role];
const activeFilter=isHome?filter:role;
useEffect(()=>{document.title=isHome?"Cimora Studio — AI creative canvas":r.name+" — Cimora Studio"},[isHome,r.name]);
useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(false),3500);return()=>clearTimeout(t)},[notice]);
const demo=()=>setNotice(true);
return <div className={s.site} data-direction={isHome?"home":r.tag.toLowerCase()}><a className={s.skip} href="#main">Skip to content</a><header className={s.header}><a href="/" className={s.brand}>CIMORA<small>STUDIO</small></a><nav aria-label="Main navigation">{roles.map((x,i)=><a key={x.tag} href={"/"+x.tag.toLowerCase()} aria-current={role===i?"page":undefined}>{x.tag[0]+x.tag.slice(1).toLowerCase()}</a>)}<a href="/#templates">Templates</a></nav><button className={s.cta} onClick={demo}>Open Studio ↗</button></header><main id="main">
{role===1?<GameHero onOpen={demo}/>:<section id="home" className={s.hero}>
  <span className={s.watermark} aria-hidden="true">{isHome?"CREATE":r.tag}</span>
  <div>
    <p className={s.kicker}>{isHome?"YOUR NEXT OBSESSION STARTS HERE":r.name.toUpperCase()} / 01</p>
    <h1>{isHome?"YOUR IDEAS.":role===0?"YOUR CAST.":role===1?"YOUR GAME.":"YOUR STORY."}<br/><em>{isHome?"NEW WORLDS.":role===0?"IN MOTION.":role===1?"IN SIGHT.":"YOUR STYLE."}</em></h1>
    <p className={s.lead}>{isHome?"An AI canvas for anime, comics, and game creation.":r.desc}</p>
    <div className={s.actions}><button className={s.cta} onClick={demo}>Open Studio ↗</button><a className={s.outline} href={isHome?"#showcase":"#roles"}>{isHome?"Explore creations ↓":"Explore abilities ↓"}</a></div>
    <p className={s.kicker}>{isHome?"THREE CREATIVE PATHS. ONE OPEN CANVAS.":role===1?"VISUALIZE THE IDEA. BUILD THE GAME YOUR WAY.":"ONE CHARACTER. ONE CREATIVE POSSIBILITY."}</p>
  </div>
  <div className={s.heroArtwork}><div className={s.artFrame}><Blank label={isHome?"CIMORA BRAND VISUAL":r.tag+" WORLD VISUAL"}/></div><span className={s.artCaption}>{isHome?"A CANVAS FOR YOUR NEXT OBSESSION":r.name.toUpperCase()} / 01</span></div>
  <div className={s.heroBottom}><span>IMAGINE / EXPLORE / CREATE</span><a href={isHome?"#showcase":"#roles"}>SCROLL TO DISCOVER ↓</a></div>
</section>}

{!isHome&&<section id="roles" className={s.roles}><div className={s.heading}>{role===1?<h2 className={s.abilityTape}><span>＋</span>YOUR ABILITIES<span>＋</span></h2>:<><div><p className={s.kicker}>FIND YOUR CREATIVE DIRECTION</p><h2>CHOOSE YOUR<br/>CREATIVE ABILITY.</h2></div><div className={s.chapter}>Abilities<b>02</b></div></>}</div><div className={s.stage}><div><p className={s.kicker}>CUSTOMIZE YOUR PATH / 0{role+1}</p><h3>{r.name}</h3><div className={s.board}><div className={s.boardHead}>YOUR ABILITIES <small>{r.paths.length} / {role===1?2:6}</small></div><div className={s.slots}>{Array.from({length:role===1?2:6},(_,i)=>i<r.paths.length?<button key={i} className={c===i?s.selected:""} aria-label={r.paths[i]} aria-pressed={c===i} onClick={()=>setChoices(choices.map((v,j)=>j===role?i:v))}><span>＋</span>{c===i&&<strong>SELECTED</strong>}</button>:<div key={i} className={s.empty}/>)}</div></div><p className={s.desc}>{r.desc}</p>{role===0&&<p className={s.planned}>Live2D · In exploration<br/><small>Availability to be confirmed</small></p>}</div><div className={s.character}><b>0{c+1}</b><span>CHARACTER ARTWORK<br/>COMING SOON</span><div className={s.nameplate}>{r.tag}<small>{r.paths[c]}</small></div></div><aside className={s.dossier}><p className={s.kicker}>CREATIVE ABILITY / 0{c+1}</p><h3>{r.paths[c]}</h3><p>{r.desc}</p><small>START WITH</small><p>Your idea + visual references</p><small>CREATE</small><p>{r.out[c]}</p><Blank label="RESULT PREVIEW"/><button className={s.cta} onClick={demo}>Explore this path ↗</button></aside></div></section>}

<section id="showcase" className={s.showcase}><div className={s.showcaseGrid}><div><p className={s.kicker}>SEE THE POSSIBILITIES</p><h2 className={role===1?s.creationTape:undefined}>{role===1?"CREATIONS":"IDEAS TAKE SHAPE."}</h2><Blank label={(isHome?roles[preview].tag:r.paths[c])+" CREATION PREVIEW"}/><div className={s.previews}><span>SELECTED CREATIONS / 0{isHome?preview+1:c+1}</span><div>{isHome?roles.map((x,i)=><button key={x.tag} className={preview===i?s.chosen:""} aria-pressed={preview===i} onClick={()=>setPreview(i)}>0{i+1} / {x.tag}</button>):<a href="#roles">Explore {r.tag.toLowerCase()} abilities ↑</a>}</div></div></div><div className={s.chapter}>Creations<b>{isHome?"02":"03"}</b></div></div><div className={s.film}/></section>
{isHome&&(<section id="workflow" className={s.workflow}><div><p className={s.kicker}>KEEP THE WHOLE IDEA IN VIEW / 03</p><h2>ONE CANVAS.<br/>EVERY POSSIBILITY.</h2><p className={s.desc}>Bring your references, characters, and creative directions together. Make room for your next idea.</p><button className={s.cta} onClick={demo}>Open your canvas ↗</button></div><div className={s.canvas}><div className={s.canvasBar}>● ● ● <span>CIMORA / CREATIVE WORKSPACE ↗</span></div><Blank label="CANVAS WALKTHROUGH"/><div className={s.steps}><span>01 / Add references</span><span>02 / Explore directions</span><span>03 / Create & refine</span></div></div></section>)}

<section id="templates" className={s.templates}><div className={s.heading}><div className={s.chapter}>Templates<b>04</b></div><div><p className={s.kicker}>A LITTLE INSPIRATION GOES A LONG WAY</p><h2>FIND YOUR<br/>STARTING POINT.</h2></div></div>{isHome&&<div className={s.filters}>{roles.map((x,i)=><button key={x.tag} className={filter===i?s.chosen:""} aria-pressed={filter===i} onClick={()=>setFilter(i)}>{x.name}</button>)}</div>}<div className={s.cards}>{(activeFilter===0?["Character exploration","A scene in motion","Style studies"]:activeFilter===1?["World exploration","Concept in motion","Asset studies"]:["Comic character studies","Vertical storytelling","Panel composition"]).map((title,i)=><article key={title}><Blank label={roles[activeFilter].tag+" / 0"+(i+1)}/><div><small>{i===1&&activeFilter!==2?"VIDEO":"IMAGE"}</small><h3>{title}</h3><p>Find a starting point for your next creation.</p><small className={s.soon}>PREVIEW COMING SOON</small></div></article>)}</div><button className={s.outline} onClick={demo}>Explore all templates ↗</button></section>

</main>
<footer className={s.footer}><div className={s.invite}><h2>MAKE SOMETHING<br/><em>ONLY YOU CAN IMAGINE.</em></h2><button className={s.cta} onClick={demo}>Open Studio ↗</button></div><div className={s.links}><a href="/" className={s.brand}>CIMORA<small>STUDIO</small></a><div><strong>Create</strong>{roles.map((x)=><a key={x.tag} href={"/"+x.tag.toLowerCase()}>{x.name}</a>)}</div><div><strong>Explore</strong><a href="#showcase">Creations</a><a href="#templates">Templates</a><a href="/#workflow">The canvas</a></div><div><strong>Connect</strong>{["Community","Help & support","Contact"].map(x=><button key={x} onClick={demo}>{x}</button>)}</div></div><div className={s.legal}><span>© {new Date().getFullYear()} Cimora Studio</span><span>A CANVAS FOR YOUR NEXT OBSESSION.</span><a href="#home">BACK TO TOP ↑</a></div></footer>{notice&&<div className={s.toast} role="status">Preview only — this destination is not connected yet.<button onClick={()=>setNotice(false)} aria-label="Dismiss notification">×</button></div>}</div>
}
