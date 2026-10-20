import React, { useEffect, useRef, useState } from 'react';
import { useReactFlow, useViewport } from 'reactflow';
import { FiMousePointer, FiRotateCcw, FiRotateCw, FiCompass, FiMaximize, FiHelpCircle } from '../../../../src/components/meika/CanvasIcons';
import { LuHand, LuPalette, LuEraser } from '../../../../src/components/meika/CanvasIcons';

const editableTarget = target => target?.closest('input, textarea, select, [contenteditable=true]');
const snapshot = (nodes, edges) => JSON.stringify({nodes: nodes.map(({selected, dragging, resizing, ...node}) => node), edges: edges.map(({selected, ...edge}) => edge)});
export default function CanvasBottomToolbar({nodes, edges, setNodes, setEdges, editable, hand, setHand, setSpace, miniMap, setMiniMap, grid, setGrid}) {
 const {fitView, setViewport, zoomTo} = useReactFlow();
 const {zoom} = useViewport();
 const [panel,setPanel] = useState(null);
 const [currentTheme,setCurrentTheme] = useState('dark');
 const [past,setPast] = useState([]), [future,setFuture] = useState([]);
 const current = useRef(snapshot(nodes, edges));
 const root = useRef(null);
 const historyTimer = useRef(null);
 useEffect(() => {
  const next = snapshot(nodes, edges);
  if(next === current.current || nodes.some(n => n.dragging || n.resizing)) return;
  const before = current.current;
  historyTimer.current = setTimeout(() => {setPast(p => [...p.slice(-39), before]);current.current = next;setFuture([]);}, 250);
  return () => clearTimeout(historyTimer.current);
 }, [nodes, edges]);
 function restore(value) {clearTimeout(historyTimer.current);const data=JSON.parse(value);current.current=value;setNodes(data.nodes);setEdges(data.edges);}
 function undo() {
  if(!editable)return;
  const now=snapshot(nodes,edges);
  if(now!==current.current){
   setFuture([now]);
   restore(current.current);
   return;
  }
  if(!past.length)return;
  setFuture(f=>[now,...f]);restore(past[past.length-1]);setPast(p=>p.slice(0,-1));
 }
 function redo() {if(!future.length || !editable || snapshot(nodes,edges)!==current.current)return;setPast(p=>[...p,current.current]);restore(future[0]);setFuture(f=>f.slice(1));}
 useEffect(() => {
  const down=e=>{if(editableTarget(e.target))return;if(e.code==='Space'){e.preventDefault();setSpace(true);}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)redo();else undo();}if(e.key==='Escape')setPanel(null);};
  const up=e=>{if(e.code==='Space')setSpace(false);};const blur=()=>setSpace(false);
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);};
 });
 useEffect(()=>{const element=document.getElementById('cimora-canvas');const update=()=>{const light=element?.dataset.theme==='light';setCurrentTheme(element?.dataset.palette==='sky'?'sky-blue':element?.dataset.palette==='bubblegum'?'bubblegum-remix':(light?'light':'dark'));};update();const observer=new MutationObserver(update);observer.observe(element,{attributes:true,attributeFilter:['data-theme','data-palette']});return()=>observer.disconnect();},[]);
 useEffect(()=>{if(!panel)return;const outside=e=>{if(!root.current?.contains(e.target))setPanel(null);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[panel]);
 function theme(value){window.dispatchEvent(new CustomEvent('cimora:canvas-theme',{detail:value}));}
 function button(label,icon,action,disabled=false,pressed){return <button type="button" title={label} aria-label={label} disabled={disabled} aria-pressed={pressed} onClick={action}>{icon}</button>;}
 return <div className="canvas-bottom-wrap" ref={root}>
  {panel==='appearance'&&<div className="canvas-bottom-popover" role="dialog" aria-label="Canvas appearance"><h3>Canvas appearance</h3><p>Theme</p><div className="bottom-options canvas-theme-options">{[{id:'dark',name:'Black'},{id:'light',name:'White'},{id:'sky-blue',name:'Sky Blue'},{id:'bubblegum-remix',name:'Bubblegum'}].map(option=><button key={option.id} aria-pressed={currentTheme===option.id} onClick={()=>theme(option.id)}><span className={`canvas-theme-dot theme-dot-${option.id}`} aria-hidden="true"/>{option.name}</button>)}</div><p>Grid style</p><div className="bottom-options">{['Dots','Lines','Blank'].map(value=><button key={value} aria-pressed={grid===value.toLowerCase()} onClick={()=>setGrid(value.toLowerCase())}>{value}</button>)}</div></div>}
  {panel==='help'&&<div className="canvas-bottom-popover" role="dialog" aria-label="Canvas navigation"><h3>Canvas navigation</h3><p>Pointer: drag to select nodes.</p><p>Hand: hold Space and drag to pan.</p><p>Mouse wheel: zoom.</p><p>Ctrl / Cmd + Z: undo. Add Shift to redo.</p></div>}
  {panel==='clear'&&<div className="canvas-bottom-popover" role="alertdialog" aria-label="Clear canvas confirmation"><h3>Clear canvas?</h3><p>Remove all {nodes.length} nodes and their connections? You can undo this action.</p><div className="bottom-options"><button onClick={()=>setPanel(null)}>Cancel</button><button className="bottom-danger" onClick={()=>{const now=snapshot(nodes,edges);setPast(p=>[...p.slice(-39),now]);setFuture([]);restore(JSON.stringify({nodes:[],edges:[]}));setPanel(null);}}>Clear all nodes</button></div></div>}
  <div className="canvas-bottom-toolbar" role="toolbar" aria-label="Canvas navigation tools">
   {button(hand?'Hand mode — hold Space to pan':'Pointer mode',hand?<LuHand/>:<FiMousePointer/>,()=>setHand(!hand),false,hand)}
   {button('Undo',<FiRotateCcw/>,undo,!editable||(!past.length&&snapshot(nodes,edges)===current.current))}{button('Redo',<FiRotateCw/>,redo,!editable||!future.length||snapshot(nodes,edges)!==current.current)}
   <i/>{button(miniMap?'Close mini map':'Open mini map',<FiCompass/>,()=>setMiniMap(!miniMap),false,miniMap)}
   {button('Reset view',<FiMaximize/>,()=>nodes.length?fitView({padding:.3,duration:300,maxZoom:1}):setViewport({x:0,y:0,zoom:1},{duration:300}))}
   <input type="range" aria-label="Canvas zoom" min="10" max="400" value={Math.round(zoom*100)} onChange={e=>zoomTo(Number(e.target.value)/100)}/><span className="bottom-zoom">{Math.round(zoom*100)}%</span>
   {button('Navigation help',<FiHelpCircle/>,()=>setPanel(panel==='help'?null:'help'))}<i/>
   {button('Canvas appearance',<LuPalette/>,()=>setPanel(panel==='appearance'?null:'appearance'),false,panel==='appearance')}<i/>
   {button('Clear canvas',<LuEraser/>,()=>setPanel('clear'),!editable||!nodes.length)}
  </div>
 </div>;
}
