import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import { FiX, FiStar, FiSearch, FiVideo } from '../../../../src/components/meika/CanvasIcons';
import artwork from '../../../../src/data/showcasePortraits.json';

const motions = [
 ['Fixed camera','fixed','Keep the camera still; movement happens within the frame.'],
 ['Follow shot','follow','Move with the subject to keep it in the frame.'],
 ['Orbit up','orbit-up','Circle around the subject while rising.'],
 ['Orbit down','orbit-down','Circle around the subject while descending.'],
 ['Tilt up','tilt-up','Angle the camera upward from a fixed position.'],
 ['Tilt down','tilt-down','Angle the camera downward from a fixed position.'],
 ['Pan left','pan-left','Turn the camera left from a fixed position.'],
 ['Pan right','pan-right','Turn the camera right from a fixed position.'],
 ['Crane up','crane-up','Raise the camera to reveal a higher viewpoint.'],
 ['Crane down','crane-down','Lower the camera toward the subject.'],
 ['Truck left','truck-left','Move the camera sideways to the left.'],
 ['Truck right','truck-right','Move the camera sideways to the right.'],
 ['Dolly in','dolly-in','Move closer to the subject through the scene.'],
 ['Dolly out','dolly-out','Move away from the subject through the scene.'],
 ['Slow zoom in','zoom','Slowly magnify the view while the camera stays still.'],
].map(([name,movement,summary],i)=>({id:`motion-${i}`,name,movement,summary,description:`Camera movement: ${name.toLowerCase()}.`}));
function ScrollRoller() {
 return <svg viewBox="0 0 900 100" preserveAspectRatio="none" aria-hidden="true" className="scroll-roller-art">
  <path d="M25 64L866 62L888 83L850 96L49 93Z" fill="#332a22" opacity=".28"/>
  <path d="M7 45L64 26L82 35L81 61L20 73L5 61Z" fill="#4b3929"/><path d="M8 45L63 26L74 34L19 55Z" fill="#796044"/><path d="M20 55L74 34L81 42L80 61L20 73Z" fill="#392e24"/>
  <path d="M817 34L872 22L894 34L894 54L837 69L816 58Z" fill="#463727"/><path d="M818 34L873 22L894 34L837 49Z" fill="#806347"/><path d="M837 49L894 34L894 54L837 69Z" fill="#302a22"/>
  <path d="M62 22L84 10L107 20L116 46L103 78L80 88L59 71L51 43Z" fill="#504c40"/><path d="M62 22L84 10L107 20L94 32L72 36Z" fill="#8c8873"/><path d="M51 43L72 36L80 65L80 88L59 71Z" fill="#353a32"/>
  <g className="scroll-paper-facets">
   <path d="M94 16L801 13L824 28L836 50L823 77L803 87L94 83L76 67L68 44L77 25Z" fill="#d1c29b"/>
   <path d="M94 16L801 13L817 27L91 31L77 25Z" fill="#fff0bd"/>
   <path d="M91 31L817 27L828 48L87 52L68 44L77 25Z" fill="#f2e2b6"/>
   <path d="M87 52L828 48L823 68L94 72L76 67L68 44Z" fill="#d6c8a2"/>
   <path d="M94 72L823 68L803 87L94 83L76 67Z" fill="#a89e83"/>
   <path d="M137 31L342 30L249 51L91 52Z" fill="#f9eac0"/><path d="M503 29L691 28L607 49L439 50Z" fill="#e8d8ab"/>
   <path d="M94 83L803 87L808 80L104 77Z" fill="#8e8671"/>
  </g>
  <path d="M801 13L821 9L844 23L853 49L844 76L823 90L803 87L823 68L828 48L817 27Z" fill="#59594b"/>
  <path d="M801 13L821 9L844 23L831 30L817 27Z" fill="#9c9980"/><path d="M844 23L853 49L843 54L831 30Z" fill="#737563"/><path d="M843 54L853 49L844 76L823 90L813 81Z" fill="#343d33"/>
  <path d="M811 27L824 26L836 43L835 61L822 76L809 77L820 65L824 49L818 34Z" fill="#b6ac8c"/>
 </svg>;
}
function MotionDiagram({movement}) {
 const horizontal=movement.includes('left')||movement.includes('right')||movement==='follow';
 const up=movement.includes('up');
 const arrow=movement==='fixed'?'':movement.startsWith('orbit')?(up?'⤴':'⤵'):horizontal?(movement.includes('left')?'←':'→'):movement==='dolly-in'?'↗':movement==='dolly-out'?'↙':movement==='zoom'?'+':up?'↑':'↓';
 return <div className={`motion-diagram movement-${movement}`} aria-hidden="true"><svg viewBox="0 0 300 130">
  <path d="M0 0H300V130H0Z" fill="#a8b8a1"/><path d="M0 85L59 25L117 85L176 16L250 85L300 54V130H0Z" fill="#718d7c"/><path d="M0 102L72 66L140 103L229 68L300 105V130H0Z" fill="#496e63"/>
  <path d="M0 117L300 117M150 88L42 130M150 88L258 130" stroke="#c5d0ab" strokeWidth="1" opacity=".4"/>
  <g className="motion-subject"><ellipse cx="150" cy="114" rx="19" ry="4" fill="#29493d" opacity=".4"/><circle cx="150" cy="76" r="9" fill="#f3dab0"/><path d="M139 89L161 89L166 112H134Z" fill="#ecd49c"/></g>
  <g className="motion-camera" fill="none" stroke="#fff0c3" strokeWidth="2.5"><path d="M109 47H99V57M191 47H201V57M99 100V110H109M191 110H201V100"/><path d="M142 37H158V45H142ZM158 39L164 36V46L158 43"/></g>
  <text x="264" y="38" textAnchor="middle" fill="#ffe09b" fontSize="32" fontFamily="Arial" fontWeight="700">{arrow}</text>
  {movement==='fixed'&&<path d="M257 24H271V38H257Z" fill="none" stroke="#ffe09b" strokeWidth="2"/>}
 </svg><span>{movement==='fixed'?'LOCKED FRAME':'HOVER TO PREVIEW'}</span></div>;
}

function read(key) {try {const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[];}catch{return [];}}
// Both faces contain a complete paper page, including its header and folio.
function TurnPageContent({turn,back}) {
 const side=back?(turn.direction==='next'?0:1):(turn.direction==='next'?1:0);
 const layout=turn.layout[side];
 const items=back?turn.backItems:turn.items;
 return <div className="atlas-turn-content" style={{width:turn.width}}>
  <div className="atlas-turn-heading" style={{top:turn.headerTop,left:layout.left,width:layout.width}}>{side===0?<><small>THE CREATOR’S FIELD GUIDE</small><h2>Style library</h2></>:<label><FiSearch/><span>{turn.search||'Search styles'}</span></label>}</div>
  <div className="atlas-turn-index" style={{top:turn.indexTop,left:layout.left,width:layout.width}}>{side===0?<span>Style index <i>{turn.category}⌄</i></span>:<span>{turn.count} styles</span>}</div>
  <div className="atlas-turn-rows" style={{top:turn.rowsTop,left:layout.left,width:layout.width}}>{items.map(item=><article key={item.id}><div className="atlas-entry"><img src={item.poster} alt=""/><span><b>{item.name}</b><em>{item.description}</em><strong>Apply style →</strong></span></div><span className="atlas-favorite" aria-pressed={turn.favorites.includes(item.id)}><FiStar/></span></article>)}</div>
  <span className="atlas-page-number" style={{top:turn.numberTop,bottom:'auto',left:layout.left,width:layout.width}}>{(back?turn.nextPage:turn.oldPage)*2+side+1}</span>
  <div className="atlas-turn-footer" style={{top:turn.footerTop,left:layout.left,width:layout.width}}><span>{side===0?'← Previous':'Next →'}</span></div>
 </div>;
}
function TurningLeaf({turn}) {
 // A smooth displacement field bends the whole rendered page, including its text.
 // Unlike individual strips, it has no internal edges that can open into seams.
 const bendMap=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><defs><linearGradient id="curve"><stop stop-color="rgb(128,128,128)"/><stop offset=".28" stop-color="rgb(128,205,128)"/><stop offset=".62" stop-color="rgb(128,255,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient></defs><path fill="url(#curve)" d="M0 0h512v512H0z"/></svg>`;
 return <>
  <svg className="atlas-curl-definition" aria-hidden="true" width="0" height="0"><defs>
   <filter id="atlas-continuous-curl" x="-12%" y="-14%" width="124%" height="128%" colorInterpolationFilters="sRGB">
    <feImage href={`data:image/svg+xml,${encodeURIComponent(bendMap)}`} x="-12%" y="-14%" width="124%" height="128%" preserveAspectRatio="none" result="bend"/>
    <feDisplacementMap in="SourceGraphic" in2="bend" scale="0" xChannelSelector="R" yChannelSelector="G">
     <animate attributeName="scale" values="0;-48;-90;36;10;0" keyTimes="0;.18;.42;.7;.88;1" dur="0.76s" fill="freeze"/>
    </feDisplacementMap>
   </filter>
  </defs></svg>
  <div className="atlas-paper-face front"><TurnPageContent turn={turn} back={false}/></div>
  <div className="atlas-paper-face back"><TurnPageContent turn={turn} back/></div>
 </>;
}
function StylePreview({selection,favorites,onFavorite,onApply,onClose}) {
 const modal=useRef(null);
 const [index,setIndex]=useState(selection.index);
 const [failed,setFailed]=useState(false);
 const item=selection.items[index];
 useEffect(()=>{const previous=document.activeElement;modal.current?.showModal();return()=>previous?.focus();},[]);
 function move(delta){setIndex(value=>(value+delta+selection.items.length)%selection.items.length);setFailed(false);}
 return <dialog ref={modal} className="atlas-preview" aria-labelledby="atlas-preview-title" onCancel={e=>{e.preventDefault();e.stopPropagation();onClose();}} onClick={e=>{e.stopPropagation();if(e.target===e.currentTarget)onClose();}} onKeyDown={e=>{e.stopPropagation();if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}if(e.key==='ArrowRight'){e.preventDefault();move(1);}}}>
  <div className="atlas-preview-layout">
   <button type="button" className="atlas-preview-close" aria-label="Close style preview" onClick={onClose}><FiX/></button>
   <div className="atlas-preview-image">{failed?<p>Image unavailable. Please try another style.</p>:<img key={item.id} src={item.preview||item.poster} alt={`${item.name} style reference`} onError={()=>setFailed(true)}/>}</div>
   <aside><small>STYLE REFERENCE</small><h2 id="atlas-preview-title">{item.name}</h2><p>{item.description}</p><p className="atlas-preview-note">A visual reference for the style. Applying it adds the style description to your prompt.</p>
    <button type="button" className="atlas-preview-apply" onClick={()=>onApply(item)}>Apply this style →</button>
    <button type="button" className="atlas-preview-save" aria-pressed={favorites.includes(item.id)} onClick={event=>onFavorite(item,event)}><FiStar/>{favorites.includes(item.id)?'Saved to favorites':'Add to favorites'}</button>
    <nav aria-label="Style preview navigation"><button type="button" aria-label="Previous style" disabled={selection.items.length<2} onClick={()=>move(-1)}>←</button><span aria-live="polite">{index+1} / {selection.items.length}</span><button type="button" aria-label="Next style" disabled={selection.items.length<2} onClick={()=>move(1)}>→</button></nav>
   </aside>
  </div>
 </dialog>;
}
export default function VideoPresetPicker({kind,onSelect,onClose}) {
 const dialog=useRef(null);
 const closeTimer=useRef(null);
 const [scrollPhase,setScrollPhase]=useState(()=>kind==='motion'?'opening':'open');
 useEffect(()=>{
  if(kind!=='motion')return;
  const timer=setTimeout(()=>setScrollPhase(phase=>phase==='opening'?'open':phase),window.matchMedia('(prefers-reduced-motion: reduce)').matches?150:650);
  return()=>{clearTimeout(timer);clearTimeout(closeTimer.current);};
 },[kind]);
 function closeLibrary(){
  if(kind!=='motion'){onClose();return;}
  if(closeTimer.current)return;
  setScrollPhase('closing');
  closeTimer.current=setTimeout(onClose,window.matchMedia('(prefers-reduced-motion: reduce)').matches?150:350);
 }
 const spread=useRef(null);
 const atlas=useRef(null);
 const [search,setSearch]=useState('');const [tab,setTab]=useState('All');const [category,setCategory]=useState('All');
 const [page,setPage]=useState(0);
 const [preview,setPreview]=useState(null);
 const [turn,setTurn]=useState(null);
 useEffect(()=>{
  if(!turn)return;
  const timer=setTimeout(()=>setTurn(null),780);
  return()=>clearTimeout(timer);
 },[turn]);
 const key=`cimora.video.${kind}`;
 const [favorites,setFavorites]=useState(()=>read(`${key}.favorites`));
 const [recent,setRecent]=useState(()=>read(`${key}.recent`));
 const items=kind==='style'?artwork.map(item=>({...item,name:item.style})):motions;
 useEffect(()=>{const previous=document.activeElement;dialog.current?.showModal();return()=>previous?.focus();},[]);
 function save(suffix,value) {try{localStorage.setItem(`${key}.${suffix}`,JSON.stringify(value));}catch{/* Selection still works when browser storage is unavailable. */}}
 function choose(item) {const next=[item.id,...recent.filter(id=>id!==item.id)].slice(0,20);setRecent(next);save('recent',next);onSelect(item);closeLibrary();}
 const visible=items.filter(item=>(tab!=='Favorites'||favorites.includes(item.id))&&(tab!=='Recent'||recent.includes(item.id))&&(category==='All'||category===item.name)&&`${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
 if(tab==='Recent')visible.sort((a,b)=>recent.indexOf(a.id)-recent.indexOf(b.id));
 const pageCount=Math.max(1,Math.ceil(visible.length/6));
 const currentPage=Math.min(page,pageCount-1);
 function turnPage(direction){
  if(turn)return;
  const next=currentPage+(direction==='next'?1:-1);
  if(next<0||next>=pageCount)return;
  const start=currentPage*6+(direction==='next'?3:0);
  if(!window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 700px)').matches){
   const backStart=next*6+(direction==='next'?0:3);
   const book=atlas.current.getBoundingClientRect();
   const paperTop=book.top+book.height*.063;
   const width=book.width*.457;
   const topOf=selector=>atlas.current.querySelector(selector).getBoundingClientRect().top-paperTop;
   const layout=Array.from(spread.current.querySelectorAll('.atlas-leaf')).map((leaf,side)=>{
    const rect=leaf.getBoundingClientRect();
    return {left:rect.left-(side===0?book.left+book.width*.043:book.left+book.width*.5),width:rect.width};
   });
   setTurn({direction,items:visible.slice(start,start+3),backItems:visible.slice(backStart,backStart+3),oldItems:visible.slice(currentPage*6,currentPage*6+6),width,layout,headerTop:topOf('.atlas-heading'),indexTop:topOf('.atlas-index'),rowsTop:topOf('.atlas-spread'),numberTop:topOf('.atlas-page-number'),footerTop:topOf('.atlas-footer'),oldPage:currentPage,nextPage:next,search,category,count:visible.length,favorites});
  }
  setPage(next);
 }
 function favorite(item,event){
  const wasFavorite=favorites.includes(item.id);
  const next=wasFavorite?favorites.filter(id=>id!==item.id):[...favorites,item.id];
  setFavorites(next);save('favorites',next);
  const icon=event?.currentTarget.querySelector('svg');
  if(icon&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   icon.getAnimations().forEach(animation=>animation.cancel());
   icon.animate(wasFavorite?[
    {transform:'scale(1)'},{transform:'scale(.72)',offset:.4},{transform:'scale(1)'}
   ]:[
    {transform:'scale(.7) rotate(-12deg)'},
    {transform:'scale(1.28) rotate(8deg)',offset:.45},
    {transform:'scale(.94) rotate(-3deg)',offset:.75},
    {transform:'scale(1) rotate(0deg)'}
   ],{duration:wasFavorite?220:420,easing:'ease-out'});
  }
 }
 return createPortal(<dialog ref={dialog} className={`video-preset-dialog ${kind}`} onCancel={e=>{e.preventDefault();closeLibrary();}} onClick={e=>{e.stopPropagation();if(e.target===e.currentTarget)closeLibrary();}} onKeyDown={e=>e.stopPropagation()}>
  {kind==='style'?<div ref={atlas} className={`style-atlas${turn?' atlas-is-turning':''}`}>
   <svg className="atlas-art" viewBox="0 0 1000 680" preserveAspectRatio="none" aria-hidden="true">
    <defs>
     <linearGradient id="atlas-cover" x2="0" y2="1"><stop stopColor="#873e2c"/><stop offset="1" stopColor="#472923"/></linearGradient>
     <linearGradient id="atlas-left"><stop stopColor="#ddd0a7"/><stop offset=".12" stopColor="#faf2d8"/><stop offset=".87" stopColor="#f4ebd2"/><stop offset="1" stopColor="#c1ac7d"/></linearGradient>
     <linearGradient id="atlas-right"><stop stopColor="#bca579"/><stop offset=".08" stopColor="#fff6df"/><stop offset=".88" stopColor="#f3e9cd"/><stop offset="1" stopColor="#dfd0a7"/></linearGradient>
     <pattern id="atlas-grain" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 9L9 0" stroke="#98794d" strokeOpacity=".035"/></pattern>
    </defs>
    <path d="M28 15L961 8L986 32L994 636L973 670L29 663L8 640L9 43Z" fill="#34241f"/>
    <path d="M28 5L958 9L983 30L984 627L963 653L29 647L9 625L9 35Z" fill="url(#atlas-cover)" stroke="#9e6742" strokeWidth="3"/>
    <path d="M38 23L946 26L965 43L964 617L949 633L40 629L26 612L27 46Z" fill="none" stroke="#ccad69" strokeWidth="2"/>
    <path d="M55 49Q270 34 500 54Q726 34 946 49L948 615Q727 596 500 622Q269 600 54 612Z" fill="#a99468" stroke="#d8c99f" strokeWidth="7"/>
    <path d="M57 43Q272 29 500 50L500 611Q278 592 58 601L43 582L43 69Z" fill="url(#atlas-left)" stroke="#bda575" strokeWidth="2"/>
    <path d="M500 50Q718 29 941 43L955 64L955 579L931 604Q711 589 500 611Z" fill="url(#atlas-right)" stroke="#bda575" strokeWidth="2"/>
    <path d="M57 43Q272 29 500 50Q718 29 941 43L955 64L955 579L931 604Q711 589 500 611Q278 592 58 601L43 582L43 69Z" fill="url(#atlas-grain)"/>
    <path d="M500 55Q490 312 500 605" fill="none" stroke="#fff7dd" strokeWidth="3" opacity=".65"/>
    <path d="M930 603L954 577L928 581Z" fill="#b9af96"/><path d="M928 581L930 603L908 603Z" fill="#e8debf"/>
    <path d="M31 38L69 35M29 40L28 79M944 31L962 48L962 80M29 586L29 610L48 625" fill="none" stroke="#e5c77b" strokeWidth="4"/>
   </svg>
   <nav className="atlas-bookmarks" aria-label="Style collections">{['All','Favorites','Recent'].map(name=><button key={name} type="button" aria-pressed={tab===name} onClick={()=>{setTurn(null);setTab(name);setPage(0);}}>{name}<small>{name==='All'?items.length:name==='Favorites'?favorites.length:recent.length}</small></button>)}</nav>
   <button className="atlas-close" type="button" aria-label="Close library" onClick={onClose}><FiX/></button>
   <div className="atlas-content">
    <header className="atlas-heading"><div><small>THE CREATOR’S FIELD GUIDE</small><h2>Style library</h2></div><label><FiSearch/><input aria-label="Search presets" placeholder="Search styles" value={search} onChange={e=>{setTurn(null);setSearch(e.target.value);setPage(0);}}/></label></header>
    <div className="atlas-index"><label>Style index <select aria-label="Style category" value={category} onChange={e=>{setTurn(null);setCategory(e.target.value);setPage(0);}}>{['All',...items.map(item=>item.name)].map(name=><option key={name}>{name}</option>)}</select></label><span>{visible.length} styles</span></div>
    <div ref={spread} className={`atlas-spread${turn?` is-turning turn-${turn.direction}`:''}`}>{[0,1].map(leaf=><section className="atlas-leaf" key={leaf} aria-label={leaf===0?'Left page':'Right page'}>{(turn&&leaf===(turn.direction==='next'?0:1)?turn.oldItems.slice(leaf*3,leaf*3+3):visible.slice(currentPage*6+leaf*3,currentPage*6+leaf*3+3)).map(item=><article key={item.id}>
     <button type="button" className="atlas-entry atlas-preview-trigger" aria-label={`Preview ${item.name}`} onClick={()=>setPreview({items:[...visible],index:visible.findIndex(entry=>entry.id===item.id)})}><span className="atlas-thumbnail"><img src={item.poster} alt=""/><FiSearch className="atlas-thumbnail-zoom"/></span><span><b>{item.name}</b><em>{item.description}</em></span></button>
     <button type="button" className="atlas-quick-apply" onClick={()=>choose(item)}>Apply style →</button>
     <button type="button" className="atlas-favorite" aria-label={`Favorite ${item.name}`} aria-pressed={favorites.includes(item.id)} onClick={event=>favorite(item,event)}><FiStar/></button>
    </article>)}{!visible.length&&leaf===0&&<p className="atlas-empty">No matching presets.</p>}<span className="atlas-page-number">{(turn&&leaf===(turn.direction==='next'?0:1)?turn.oldPage:currentPage)*2+leaf+1}</span></section>)}</div>
    <footer className="atlas-footer"><button type="button" disabled={currentPage===0||Boolean(turn)} onClick={()=>turnPage('previous')}>← Previous</button><span aria-live="polite">{currentPage+1} / {pageCount}</span><button type="button" disabled={currentPage===pageCount-1||Boolean(turn)} onClick={()=>turnPage('next')}>Next →</button></footer>
   </div>
   {turn&&<><div className={`atlas-cast-shadow ${turn.direction}`} aria-hidden="true"/><div className={`atlas-turn-sheet ${turn.direction}`} aria-hidden="true"><TurningLeaf turn={turn}/></div></>}
  </div>:<div className={`motion-scroll-shell scroll-${scrollPhase}`}>
   <svg className="motion-scroll-paper" viewBox="0 0 800 700" preserveAspectRatio="none" aria-hidden="true"><path d="M14 0L783 2L789 126L784 259L792 406L786 549L790 696L12 700L17 567L9 421L14 277L7 136Z" fill="#9b8765"/><path d="M10 0L780 0L784 127L779 260L786 406L781 549L784 690L8 694L12 566L4 421L9 277L2 136Z" fill="#f4e7c1"/><path d="M10 0L375 0L189 184L2 136Z" fill="#fff0ca"/><path d="M780 0L784 127L594 296L654 40Z" fill="#ecddb4"/><path d="M4 421L238 321L160 599L8 694Z" fill="#eddeb7"/><path d="M784 690L502 692L662 521L781 549Z" fill="#dfcfa7"/><path d="M9 277L178 283L238 321L4 421Z" fill="#f8ebc8"/></svg>
   <div className="motion-scroll-rod rod-top"><ScrollRoller/><button type="button" className="motion-scroll-close" aria-label="Close library" onClick={closeLibrary}><FiX/></button></div>
   <div className="motion-board" inert={scrollPhase!=='open'}>

   <header className="motion-board-heading"><div><small>THE CREATOR’S CAMERA SCROLL</small><h2>Camera motion</h2></div></header>
   <div className="motion-board-controls"><nav aria-label="Motion collections">{['All','Recent'].map(name=><button type="button" key={name} aria-pressed={tab===name} onClick={()=>setTab(name)}>{name==='All'?'All motions':name}</button>)}</nav><label><FiSearch/><input aria-label="Search motions" placeholder="Search motions" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
   <div className="motion-board-scroll" tabIndex={0} role="region" aria-label="Camera motion notices" key={tab}>
    <div className="motion-notices">{visible.map(item=><article className="motion-notice" key={item.id}>
     <span className="motion-notice-pin" aria-hidden="true"/><MotionDiagram movement={item.movement}/>
     <div className="motion-notice-copy"><h3>{item.name}</h3><p>{item.summary}</p><button type="button" aria-label={`Apply ${item.name}`} onClick={()=>choose(item)}>Apply motion →</button></div>
    </article>)}</div>
    {!visible.length&&<p className="motion-board-empty">{tab==='Recent'&&!search?'Your recently used camera motions will appear here.':'No matching motions.'}</p>}
   </div>
   <footer className="motion-board-footer"><span>{visible.length} motions</span><span>Select a motion to add its camera instruction to your prompt.</span></footer>
   </div>
   <div className="motion-scroll-rod rod-bottom" aria-hidden="true"><ScrollRoller/></div>
  </div>}
 {preview&&<StylePreview selection={preview} favorites={favorites} onFavorite={favorite} onApply={choose} onClose={()=>setPreview(null)}/>}
 </dialog>,document.getElementById('cimora-canvas'));
}
