import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useReactFlow } from 'reactflow';
import { FiMonitor, FiGrid, FiCrosshair, FiEdit3, FiX, FiFile } from '../../../../src/components/meika/CanvasIcons';
import { toast } from 'react-hot-toast';

function nodeAssets(node) {
 const items = [];
 const add = (url,kind) => {if(typeof url==='string' && /^(https?:|data:|blob:)/.test(url) && !items.some(i=>i.url===url))items.push({url,kind,name:node.id});};
 const kind = {imageNode:'image',videoNode:'video',audioNode:'audio'}[node.type];
 if(kind) {add(node.data?.resultUrl,kind);for(const out of node.data?.outputs || [])add(out.value,kind);}
 for(const type of ['image','video','audio'])add(node.data?.formValues?.[`${type}_url`],type);
 for(const url of node.data?.formValues?.images_list || [])add(url,'image');
 for(const ref of node.data?.formValues?.reference_assets || [])add(ref.url,ref.kind);
 return items;
}
export default function ReferenceMenu({ anchor, nodeId, onLocal, onAdd, onClose }) {
 const [mode,setMode] = useState('menu');
 const [query,setQuery] = useState('');
 const [assets,setAssets] = useState([]);
 const [hasDrawing,setHasDrawing] = useState(false);
 const [color,setColor] = useState('#202020');
 const [size,setSize] = useState(4);
 const root=useRef(null), dialog=useRef(null), canvas=useRef(null), drawing=useRef(false);
 const {getNodes} = useReactFlow();
 useEffect(()=>{
  const escape=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();}};
  const outside=e=>{if(mode==='menu' && !root.current?.contains(e.target) && !anchor.current?.contains(e.target))onClose();};
  window.addEventListener('keydown',escape,true);document.addEventListener('pointerdown',outside);
  return()=>{window.removeEventListener('keydown',escape,true);document.removeEventListener('pointerdown',outside);};
 },[mode,onClose,anchor]);
 useEffect(()=>{
  if(mode==='assets'||mode==='draw') {dialog.current?.showModal();}
  if(mode==='draw') {const ctx=canvas.current.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,720,400);}
 },[mode]);
 useEffect(()=>{
  if(mode!=='canvas')return;
  const element=document.getElementById('cimora-canvas');element.classList.add('picking-reference');
  const choose=e=>{
   const target=e.target.closest('.react-flow__node');if(!target)return;
   e.preventDefault();e.stopPropagation();
   if(target.dataset.id===nodeId){toast.error('Choose another node.');return;}
   const node=getNodes().find(n=>n.id===target.dataset.id);
   const choices=node?nodeAssets(node):[];
   if(!choices.length){toast.error('This node has no image, video or audio to reference.');return;}
   if(choices.length===1){onAdd(choices);onClose();}else{setAssets(choices);setMode('assets');}
  };
  document.addEventListener('click',choose,true);
  return()=>{element.classList.remove('picking-reference');document.removeEventListener('click',choose,true);};
 },[mode,nodeId,getNodes,onAdd,onClose]);
 function openAssets(){const seen=new Set();setAssets(getNodes().flatMap(nodeAssets).filter(asset=>{if(seen.has(asset.url))return false;seen.add(asset.url);return true;}));setMode('assets');}
 function point(e){const rect=canvas.current.getBoundingClientRect();return [(e.clientX-rect.left)*720/rect.width,(e.clientY-rect.top)*400/rect.height];}
 function drawStart(e){if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);drawing.current=true;setHasDrawing(true);const ctx=canvas.current.getContext('2d');const [x,y]=point(e);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=size;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.arc(x,y,size/2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(x,y);}
 function drawMove(e){if(!drawing.current)return;const ctx=canvas.current.getContext('2d');ctx.lineTo(...point(e));ctx.stroke();}
 const rect=anchor.current?.getBoundingClientRect();
 const style={left:Math.max(12,Math.min(rect?.left || 12,window.innerWidth-222)),top:Math.max(12,Math.min((rect?.bottom || 80)+8,window.innerHeight-200))};
 return createPortal(<>
  {mode==='menu'&&<div className="reference-source-menu" ref={root} style={style} role="menu" aria-label="Reference source">
   <button role="menuitem" onClick={()=>{onLocal();onClose();}}><FiMonitor/>Upload from device</button>
   <button role="menuitem" onClick={openAssets}><FiGrid/>Choose from assets</button>
   <button role="menuitem" onClick={()=>setMode('canvas')}><FiCrosshair/>Choose from canvas</button>
   <button role="menuitem" onClick={()=>setMode('draw')}><FiEdit3/>Draw reference</button>
  </div>}
  {mode==='canvas'&&<div className="reference-pick-banner" role="status">Click a node to use its media as a reference.<button onClick={onClose}>Cancel</button></div>}
  {(mode==='assets'||mode==='draw')&&<dialog ref={dialog} className="reference-picker-dialog" aria-label={mode==='assets'?'Choose reference asset':'Draw reference'} onCancel={e=>{e.preventDefault();onClose();}} onKeyDown={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
   <header><h3>{mode==='assets'?'Choose from assets':'Draw reference'}</h3><button aria-label="Close reference picker" onClick={onClose}><FiX/></button></header>
   {mode==='assets'?<><p>Media available in this canvas.</p><input type="search" aria-label="Search reference assets" placeholder="Search assets…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="reference-asset-grid">{assets.filter(a=>(a.name+' '+a.kind).toLowerCase().includes(query.toLowerCase())).map((asset,i)=><button key={i} aria-label={`Use ${asset.name} ${asset.kind}`} onClick={()=>{onAdd([asset]);onClose();}}>{asset.kind==='image'?<img src={asset.url} alt=""/>:asset.kind==='video'?<video src={asset.url} muted/>:<FiFile/>}<span>{asset.name} · {asset.kind}</span></button>)}</div>{!assets.length&&<p>No assets yet. Upload media or add it to a canvas node first.</p>}</>:<><div className="reference-draw-controls"><label>Color <input type="color" aria-label="Brush color" value={color} onChange={e=>setColor(e.target.value)}/></label><label>Brush <input type="range" aria-label="Brush size" min="1" max="24" value={size} onChange={e=>setSize(Number(e.target.value))}/></label><button onClick={()=>{const ctx=canvas.current.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,720,400);setHasDrawing(false);}}>Clear drawing</button></div><canvas ref={canvas} width="720" height="400" aria-label="Reference drawing area" onPointerDown={drawStart} onPointerMove={drawMove} onPointerUp={()=>{drawing.current=false;}} onPointerCancel={()=>{drawing.current=false;}}/><footer><button onClick={onClose}>Cancel</button><button disabled={!hasDrawing} onClick={()=>{onAdd([{url:canvas.current.toDataURL('image/png'),kind:'image',name:'Sketch reference'}]);onClose();}}>Use drawing</button></footer></>}
  </dialog>}
 </>,document.getElementById('cimora-canvas'));
}
