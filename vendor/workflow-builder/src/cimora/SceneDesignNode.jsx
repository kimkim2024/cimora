import PaletteColorPicker from "./PaletteColorPicker";
import UnifiedInput from "./UnifiedInput";
import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { FiChevronDown, FiChevronUp, FiImage, FiSave, FiMaximize2, FiX } from '../../../../src/components/meika/CanvasIcons';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import './CharacterDesignNode.css';
import { getPaletteRows, withPalettePrompt, normalizeCharacterForm } from './characterPalette.mjs';

// Original geometric demo artwork. No generation service is called.
function demoImage(sheet, color) {
 const room=(x,y,view)=>{
  const front=`<path d="M25 48H275V205H25Z" fill="${color}"/><path d="M25 205H275L300 235H0Z" fill="#bba88b"/><path d="M105 75H195V140H105Z" fill="#acd8e5"/><path d="M150 75V140M105 108H195" stroke="#344458" stroke-width="5"/><path d="M40 160H85V205H40Z" fill="#b17d53"/>`;
  const side=`<path d="M25 48H275V205H25Z" fill="${color}"/><path d="M25 205H275L300 235H0Z" fill="#bba88b"/><path d="M205 86H255V205H205Z" fill="#755c50"/><path d="M72 150H160V160H72ZM80 160H88V205H80ZM144 160H152V205H144Z" fill="#c09b6b"/>`;
  const top=`<path d="M40 45H260V225H40Z" fill="#bba88b" stroke="${color}" stroke-width="12"/><path d="M80 110H185V162H80Z" fill="#c09b6b"/><path d="M51 57H91V95H51Z" fill="#b17d53"/><path d="M110 39H190V51H110Z" fill="#acd8e5"/><path d="M248 170H266V215H248Z" fill="#755c50"/>`;
  const perspective=`<path d="M25 58L155 32 275 67V180L150 230 25 180Z" fill="${color}"/><path d="M155 32L275 67V180L155 146Z" fill="#00000022"/><path d="M25 180L155 146 275 180 150 230Z" fill="#bba88b"/><path d="M60 77L120 65V117L60 132Z" fill="#acd8e5"/><path d="M86 162L148 145 205 165 142 186Z" fill="#d8b680"/><path d="M95 167V197M192 170V196" stroke="#755c50" stroke-width="7"/>`;
  return `<g transform="translate(${x},${y})">${view==='FRONT'?front:view==='SIDE'?side:view==='TOP'?top:perspective}<text x="150" y="259" text-anchor="middle" fill="#405069" font-family="Arial" font-size="12" letter-spacing="2">${view}</text></g>`;
 };
 const width=sheet?640:320,height=sheet?590:310;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f1eee4"/><text x="18" y="22" fill="#697486" font-family="Arial" font-size="10" letter-spacing="2">SCENE STUDY / DEMO</text>${sheet?room(10,25,'FRONT')+room(330,25,'SIDE')+room(10,310,'TOP')+room(330,310,'PERSPECTIVE'):room(10,30,'PERSPECTIVE')}</svg>`;
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
export const demoSceneAsset = {
 id:'demo-scene-sky-studio',
 title:'Sky Studio',
 url:demoImage(true,'#688ca7'),
 sheet:true,
 demo:true,
 form:{name:'Sky Studio',prompt:'A quiet creative studio with sky-blue walls, a wooden desk, a large window and warm daylight. Keep the room layout consistent across front, side, top and perspective views.',paletteRows:[{id:'demo-walls',attribute:'Walls',color:'#688ca7'}],palettePromptVersion:2}
};
export default function SceneDesignNode({id,data,selected}) {
 const [busy,setBusy]=useState(false),[expanded,setExpanded]=useState(false);
 const timer=useRef(null);const dialog=useRef(null);const updateInternals=useUpdateNodeInternals();
 const savedForm=normalizeCharacterForm(data.sceneForm||{name:'',prompt:'',paletteRows:[]});
 const form={...savedForm,...(data.designInputs?.hasPrompt?{prompt:data.designInputs.prompt}:{}),reference_assets:data.designInputs?.references||[],referenceImages:data.designInputs?.referenceImages||[]};
 const paletteRows=getPaletteRows(form);
 const models=Object.values(data.nodeSchemas?.categories?.image?.models||{}).filter(model=>!model.id.includes('passthrough'));
 const modelId=form.modelId||models[0]?.id||'';
 const selectedModel=models.find(model=>model.id===modelId);

 const patch=values=>data.onDataChange?.(id,values);
 const edit=(key,value)=>patch({sceneForm:{...savedForm,[key]:value}});
 const updatePalette=rows=>patch({sceneForm:{...savedForm,paletteRows:rows}});
 const editColor=(rowId,key,value)=>updatePalette(paletteRows.map(row=>row.id===rowId?{...row,[key]:value}:row));
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{updateInternals(id);},[id,data.collapsed,data.resultUrl,updateInternals]);
 useEffect(()=>{if(expanded)dialog.current?.showModal();},[expanded]);
 function generate(sheet=false){
  if(!form.prompt.trim()){toast.error('Describe your scene first.');return;}
  if(!selectedModel){toast.error('Select an available image model.');return;}
  setBusy(true);
  const sourceForm=normalizeCharacterForm(sheet?(data.generatedForm||form):form);
  const rows=getPaletteRows(sourceForm);
  const generatedForm={...sourceForm,paletteRows:rows,modelId:selectedModel.id,modelName:selectedModel.name};
  const generationPrompt=withPalettePrompt(sourceForm.prompt,rows);
  const palette=rows.find(row=>/^(walls?|building|architecture|墙壁|建筑)$/i.test(row.attribute.trim()))?.color||'#688ca7';
  timer.current=setTimeout(()=>{const url=demoImage(sheet,palette);patch({resultUrl:url,sceneSheet:sheet,generatedForm,generationPrompt,outputs:[{type:'image_url',value:url}]});setBusy(false);},850);
 }
 function save(){
  try{
   const key='cimora.scene-assets.v1';const items=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(items))throw Error();
   const item={id:crypto.randomUUID(),title:form.name.trim()||'Untitled scene',url:data.resultUrl,sheet:!!data.sceneSheet,form:data.generatedForm||form,createdAt:Date.now(),demo:true};
   localStorage.setItem(key,JSON.stringify([item,...items]));window.dispatchEvent(new Event('cimora:scene-assets'));toast.success('Saved to Assets · Scenes');
  }catch{toast.error('Unable to save asset. Check available browser storage.');}
 }
 return <article className={`character-design-node ${data.collapsed?'is-collapsed':''} ${selected?'is-selected':''}`}>
  {!data.collapsed&&<header><FiImage/><strong>SCENE DESIGN</strong><button className="nodrag" aria-label={data.collapsed?'Expand scene node':'Collapse scene node'} onClick={()=>patch({collapsed:!data.collapsed})}>{data.collapsed?<FiChevronDown/>:<FiChevronUp/>}</button></header>}
  {data.collapsed?<div className="character-collapsed-image"><img src={data.resultUrl||'/images/scene-design-empty.png'} alt={data.resultUrl?(form.name||'Scene preview'):'Scene placeholder: retro train interior'} draggable={false} onLoad={()=>updateInternals(id)}/><button className="character-expand nodrag nopan" aria-label="Expand scene node" title="Expand scene node" onClick={()=>patch({collapsed:false})}><FiChevronDown/></button></div>:<div className="character-columns nodrag nopan nowheel" onKeyDown={e=>e.stopPropagation()}>
   <section className="character-inputs"><div className="character-input-scroll"><label>Scene name<input value={form.name} maxLength={80} placeholder="Name your scene" disabled={busy} onChange={e=>edit('name',e.target.value)}/></label><label>Scene description<textarea value={form.prompt} maxLength={2000} placeholder="Location, architecture, lighting, atmosphere…" disabled={busy||data.designInputs?.hasPrompt} onChange={e=>edit('prompt',e.target.value)}/></label>{form.referenceImages.length>0&&<div className="design-reference-images"><strong>References</strong><div>{form.referenceImages.map((url,index)=><img key={url} src={url} alt={`Reference ${index+1}`} draggable={false}/>)}</div></div>}{form.reference_assets.length>0&&<div className="design-reference-images"><strong>References</strong><div>{form.reference_assets.map((ref,index)=>ref.kind==='image'?<img key={index} src={ref.url} alt={ref.name} draggable={false}/>:<span key={index} title={ref.kind==='text'?ref.url:ref.name}>{ref.kind==='text'?ref.url:`${ref.kind}: ${ref.name}`}</span>)}</div></div>}<div className="character-palette"><div className="character-palette-heading"><strong>Palette</strong><button type="button" disabled={busy} onClick={()=>updatePalette([...paletteRows,{id:crypto.randomUUID(),color:'#688ca7',attribute:''}])}>+ Add color</button></div>{paletteRows.map((row,index)=><div className="character-palette-row" key={row.id}><PaletteColorPicker label={`Palette color ${index+1}`} value={row.color} disabled={busy} onChange={color=>editColor(row.id,'color',color)}/><input aria-label={`Palette attribute ${index+1}`} placeholder="Walls, ground, sky…" value={row.attribute} maxLength={60} disabled={busy} onChange={e=>editColor(row.id,'attribute',e.target.value)}/><button type="button" aria-label={`Remove palette color ${index+1}`} disabled={busy} onClick={()=>updatePalette(paletteRows.filter(item=>item.id!==row.id))}><FiX/></button></div>)}<p>Colors are combined with your description when you generate.</p></div><p>Interactive demo with sample artwork. Your description is saved; no AI request or credits are used.</p></div><div className="character-generate-controls"><label>Model<select aria-label="Scene model" value={modelId} disabled={busy||!models.length} onChange={e=>edit('modelId',e.target.value)}>{!models.length&&<option value="">No models available</option>}{form.modelId&&!selectedModel&&<option value={form.modelId} disabled>Previously selected model unavailable</option>}{models.map(model=><option key={model.id} value={model.id}>{model.name}</option>)}</select></label><button className="character-primary" disabled={busy||!form.prompt.trim()} onClick={()=>generate(false)}>{busy?'Preparing artwork…':data.resultUrl?'Regenerate Scene':'Generate Scene'}</button></div></section>
   <section className="character-results"><div className="character-result-title"><strong>{data.sceneSheet?'FOUR-VIEW SHEET':'SCENE PREVIEW'}</strong></div><button className="character-preview" disabled={!data.resultUrl||busy} onClick={()=>setExpanded(true)} aria-label="View scene image">{data.resultUrl?<><img src={data.resultUrl} alt={data.sceneSheet?'Front, side, top and perspective in one image':'Sample scene design'}/><FiMaximize2/></>:<img className="scene-empty-artwork" src="/images/scene-design-empty.png" alt="Scene placeholder: four views of a retro train interior" draggable={false}/>}{busy&&<span className="character-loading" role="status">Preparing sample artwork…</span>}</button><div className="character-actions"><button disabled={busy||!data.resultUrl} onClick={()=>generate(true)}>Generate 4 Views</button><button disabled={busy||!data.resultUrl} onClick={save}><FiSave/> Save to Assets</button></div></section>
  </div>}
  <UnifiedInput id={id} data={data} nodeType="sceneNode"/>
  <Handle type="source" position={Position.Right} id="imageOutput" style={{background:'#22c55e'}}/>
  {expanded&&createPortal(<dialog ref={dialog} className="character-image-dialog" onCancel={()=>setExpanded(false)} onClick={e=>{if(e.target===e.currentTarget)setExpanded(false);}}><button aria-label="Close scene image" onClick={()=>setExpanded(false)}><FiX/></button><img src={data.resultUrl} alt="Scene design enlarged"/><a href={data.resultUrl} download={`${form.name||'scene'}${data.sceneSheet?'-four-views':''}.svg`}>Download image</a></dialog>,document.body)}
 </article>;
}
