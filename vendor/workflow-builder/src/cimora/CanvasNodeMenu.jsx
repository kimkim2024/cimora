import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import { FiUser, FiX, FiFileText, FiImage, FiVideo, FiMusic, FiGrid, FiUpload } from '../../../../src/components/meika/CanvasIcons';
import { TbArrowMerge } from '../../../../src/components/meika/CanvasIcons';
import {toast} from 'react-hot-toast';
const nodes=[['characterNode','Character Design',FiUser,'Create a character and a three-view sheet'],['sceneNode','Scene Design',FiImage,'Create a scene and a four-view sheet'],['textNode','Text',FiFileText,'Scripts, ad copy, brand stories'],['imageNode','Image',FiImage],['videoNode','Video',FiVideo],['audioNode','Audio',FiMusic]];
const utilities=[['vidConcatNode','Merge videos',TbArrowMerge],['groupNode','Group',FiGrid]];
export default function CanvasNodeMenu({x,y,onAdd,onUpload,onClose,fromText=false,connectionMode=false,allowedTypes=null}) {
 const ref=useRef(null);
 const fileInput=useRef(null);
 const [uploading,setUploading]=useState(false);
 useLayoutEffect(()=>{
  const place=()=>{const menu=ref.current;if(!menu)return;menu.style.left=`${Math.max(12,Math.min(x,window.innerWidth-menu.offsetWidth-12))}px`;menu.style.top=`${Math.max(12,Math.min(y,window.innerHeight-menu.offsetHeight-12))}px`;};
  place();window.addEventListener('resize',place);return()=>window.removeEventListener('resize',place);
 },[x,y]);
 useEffect(()=>{
  const close=e=>{if(!ref.current?.contains(e.target))onClose();};
  const key=e=>{if(e.key==='Escape')onClose();};
  document.addEventListener('pointerdown',close,true);document.addEventListener('keydown',key);
  ref.current?.querySelector('button')?.focus();
  return()=>{document.removeEventListener('pointerdown',close,true);document.removeEventListener('keydown',key);};
 },[onClose]);
 async function upload(file) {
  if(!file)return;
  setUploading(true);
  try{await onUpload(file);}catch(error){toast.error(error.message||'Could not upload file.');}
  finally{setUploading(false);if(fileInput.current)fileInput.current.value='';}
 }
 const choices=items=>items.filter(([type])=>!allowedTypes||allowedTypes.includes(type)).map(([type,label,Icon,description])=><button type="button" className="canvas-node-choice" key={type} disabled={uploading} onClick={()=>onAdd(type)}><i><Icon/></i><span>{label}{description&&<small>{description}</small>}</span></button>);
 return <div ref={ref} className="canvas-select-node nodrag nopan nowheel" role="dialog" aria-label="Select a node" onPointerDown={e=>e.stopPropagation()} onDoubleClick={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
  <header><strong>{connectionMode?'Add connected node':fromText?'Generate from this node':'Add node'}</strong><button type="button" aria-label="Close node menu" onClick={onClose}><FiX/></button></header>
  <section aria-label="Add node">{choices(fromText?[['characterNode','Character Design',FiUser],['sceneNode','Scene Design',FiImage],['textNode','Generate text',FiFileText,'Scripts, ad copy, and brand content'],['imageNode','Generate image',FiImage],['videoNode','Generate video',FiVideo],['audioNode','Audio reference',FiMusic]]:nodes)}</section>
  {!fromText&&(!allowedTypes||utilities.some(([type])=>allowedTypes.includes(type)))&&<section aria-label="Utilities"><h3>Utilities</h3>{choices(utilities)}</section>}
  {!fromText&&!connectionMode&&<section aria-label="Add resources"><h3>Add resources</h3><button type="button" className="canvas-node-choice" disabled={uploading} onClick={()=>fileInput.current?.click()}><i><FiUpload/></i><span>{uploading?'Uploading…':'Upload'}</span></button></section>}
  <input hidden ref={fileInput} type="file" accept="image/*,video/*,audio/*,.txt" onChange={e=>void upload(e.target.files?.[0])}/>
 </div>;
}
