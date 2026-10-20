import React, { useEffect, useRef } from 'react';
import { FiSidebar, FiMenu, FiSave, FiPlay, FiEdit2, FiArrowLeft } from '../../../../src/components/meika/CanvasIcons';
import CanvasResourcePanel from './CanvasResourcePanel';
import { backUrl } from './navigation';
export default function CanvasHeading({ name, nodes, onRename, onSave, onRun, onSelect, editable, running, onAddCharacter, onAddScene, onAddPrompt, open, setOpen, tab, setTab }) {
 const root=useRef(null);const trigger=useRef(null);
 useEffect(()=>{
  if(!open)return;
  const outside=e=>{if(open === 'menu' && !root.current?.contains(e.target))setOpen(null);};
  const key=e=>{if(e.key==='Escape'){setOpen(null);trigger.current?.focus();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);};
 },[open, setOpen]);
 const toggle=(value,event)=>{trigger.current=event.currentTarget;setOpen(open===value?null:value);};
 return <div className="canvas-heading" ref={root}>
  <div className="canvas-heading-row">
   <button type="button" aria-label={open==='panel'?'Collapse panel':'Expand panel'} title={open==='panel'?'Collapse panel':'Expand panel'} aria-expanded={open==='panel'} onClick={e=>toggle('panel',e)}><FiSidebar size={20} style={{ transform: open === "panel" ? undefined : "scaleX(-1)" }} /></button>
   <button type="button" aria-label="Menu" title="Menu" aria-expanded={open==='menu'} onClick={e=>toggle('menu',e)}><FiMenu/></button>
   <button type="button" className="canvas-heading-name" title={name} aria-label="Rename canvas" disabled={!editable} onClick={()=>{setOpen(null);onRename();}}>{name||'Untitled'}</button>
   <a href="/" className="canvas-heading-logo" aria-label="Cimora Studio home"><img src="/favicon.svg" alt="Cimora Studio"/></a>
  </div>
  {open==='menu'&&<div className="canvas-heading-popover" role="dialog" aria-label="Canvas menu">
   <button type="button" disabled={!editable} onClick={()=>{setOpen(null);onSave();}}><FiSave/>Save canvas</button>
   <button type="button" disabled={!editable||running} onClick={()=>{setOpen(null);onRun();}}><FiPlay/>Run all</button>
   <button type="button" disabled={!editable} onClick={()=>{setOpen(null);onRename();}}><FiEdit2/>Rename canvas</button>
   <a href={backUrl()}><FiArrowLeft/>Back to projects</a>
  </div>}
  {open==='panel'&&<CanvasResourcePanel tab={tab} setTab={setTab} nodes={nodes} onSelect={onSelect} onAddPrompt={onAddPrompt} onAddCharacter={onAddCharacter} onAddScene={onAddScene} editable={editable} onClose={()=>{setOpen(null);trigger.current?.focus();}} />}
 </div>;
}
