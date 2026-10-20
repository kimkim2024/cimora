import PaletteColorPicker from "./PaletteColorPicker";
import UnifiedInput from "./UnifiedInput";
import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { FiUser, FiChevronDown, FiChevronUp, FiSave, FiMaximize2, FiX } from '../../../../src/components/meika/CanvasIcons';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import './CharacterDesignNode.css';
import { getPaletteRows, withPalettePrompt, normalizeCharacterForm } from './characterPalette.mjs';

// Original geometric demo artwork. No generation service is called.
function demoImage(sheet, color) {
 const person = (x, view) => `<g transform="translate(${x},70)"><g transform="${view==='SIDE'?'translate(45 0) scale(.55 1)':''}"><ellipse cx="100" cy="325" rx="57" ry="9" fill="#c8c5bc"/><path d="M74 210H98L93 310H67ZM102 210H126L134 310H107Z" fill="#303d50"/><path d="M66 305H93V322H58ZM107 305H134L145 322H107Z" fill="#1e2738"/><path d="M69 110L44 126 33 217 49 221 67 159 64 234H136L132 156 150 220 167 214 153 127 129 110Z" fill="${color}"/><path d="M69 110L100 134 129 110 119 177 136 234H100L81 175Z" fill="#ffffff35"/><path d="M86 88H114V121L100 135 86 121Z" fill="#d7a47e"/><path d="${view==='SIDE'?'M88 33H117L125 55 140 65 126 73 122 96 96 102 81 78Z':'M75 35L100 22 126 38 130 71 117 97 99 105 79 91 69 64Z'}" fill="${view==='BACK'?'#29354a':'#eac3a0'}"/><path d="M69 65L63 36 82 13 116 17 135 43 127 76 114 41 91 52 79 43Z" fill="#29354a"/>${view==='FRONT'?'<path d="M81 66h10m18 0h10" stroke="#29354a" stroke-width="3"/>':''}${view==='BACK'?'<path d="M80 133L100 149 121 133 112 188H89Z" fill="#23354b"/>':'<path d="M100 137V229" stroke="#29354a" stroke-width="3"/>'}</g><text x="100" y="362" text-anchor="middle" fill="#505d70" font-family="Arial" font-size="13" letter-spacing="3">${view}</text></g>`;
 const width=sheet?660:260;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="460" viewBox="0 0 ${width} 460"><rect width="100%" height="100%" fill="#f1eee4"/><path d="M0 130H${width}M0 280H${width}M0 392H${width}" stroke="#d9d7cf" stroke-dasharray="5 7"/><text x="20" y="28" fill="#697486" font-family="Arial" font-size="10" letter-spacing="2">CHARACTER STUDY / DEMO</text>${sheet?person(10,'FRONT')+person(230,'SIDE')+person(450,'BACK'):person(30,'FRONT')}</svg>`;
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function CharacterEmptyArtwork() {
 return <img className="character-empty-artwork" src="/images/character-design-empty.png" alt="" aria-hidden="true" draggable={false}/>;
}
export default function CharacterDesignNode({id,data,selected}) {
 const [busy,setBusy]=useState(false),[expanded,setExpanded]=useState(false);
 const timer=useRef(null);const dialog=useRef(null);const updateInternals=useUpdateNodeInternals();
 const savedForm=normalizeCharacterForm(data.characterForm||{name:'',prompt:'',paletteRows:[]});
 const form={...savedForm,...(data.designInputs?.hasPrompt?{prompt:data.designInputs.prompt}:{}),reference_assets:data.designInputs?.references||[],referenceImages:data.designInputs?.referenceImages||[]};
 const paletteRows=getPaletteRows(form);
 const models=Object.values(data.nodeSchemas?.categories?.image?.models||{}).filter(model=>!model.id.includes('passthrough'));
 const modelId=form.modelId||models[0]?.id||'';
 const selectedModel=models.find(model=>model.id===modelId);

 const patch=values=>data.onDataChange?.(id,values);
 const edit=(key,value)=>patch({characterForm:{...savedForm,[key]:value}});
 const updatePalette=rows=>patch({characterForm:{...savedForm,paletteRows:rows}});
 const editColor=(rowId,key,value)=>updatePalette(paletteRows.map(row=>row.id===rowId?{...row,[key]:value}:row));
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{updateInternals(id);},[id,data.collapsed,data.resultUrl,updateInternals]);
 useEffect(()=>{if(expanded)dialog.current?.showModal();},[expanded]);
 function generate(sheet=false){
  if(!form.prompt.trim()){toast.error('Describe your character first.');return;}
  if(!selectedModel){toast.error('Select an available image model.');return;}
  setBusy(true);
  const sourceForm=normalizeCharacterForm(sheet?(data.generatedForm||form):form);
  const rows=getPaletteRows(sourceForm);
  const generatedForm={...sourceForm,paletteRows:rows,modelId:selectedModel.id,modelName:selectedModel.name};
  const generationPrompt=withPalettePrompt(sourceForm.prompt,rows);
  const palette=rows.find(row=>/^(clothes|clothing|outfit|coat|衣服|服装|外套)$/i.test(row.attribute.trim()))?.color||'#688ca7';
  timer.current=setTimeout(()=>{const url=demoImage(sheet,palette);patch({resultUrl:url,characterSheet:sheet,generatedForm,generationPrompt,outputs:[{type:'image_url',value:url}]});setBusy(false);},850);
 }
 function save(){
  try{
   const key='cimora.character-assets.v1';const items=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(items))throw Error();
   const item={id:crypto.randomUUID(),title:form.name.trim()||'Untitled character',url:data.resultUrl,sheet:!!data.characterSheet,form:data.generatedForm||form,createdAt:Date.now(),demo:true};
   localStorage.setItem(key,JSON.stringify([item,...items]));window.dispatchEvent(new Event('cimora:character-assets'));toast.success('Saved to Assets · Characters');
  }catch{toast.error('Unable to save asset. Check available browser storage.');}
 }
 return <article className={`character-design-node ${data.collapsed?'is-collapsed':''} ${selected?'is-selected':''}`}>
  {!data.collapsed&&<header><FiUser/><strong>CHARACTER DESIGN</strong><button className="nodrag" aria-label="Collapse character node" onClick={()=>patch({collapsed:true})}><FiChevronUp/></button></header>}
  {data.collapsed?<div className="character-collapsed-image">{data.resultUrl?<img src={data.resultUrl} alt={form.name||'Character preview'} draggable={false} onLoad={()=>updateInternals(id)}/>:<div className="character-collapsed-empty"><CharacterEmptyArtwork/><span>Your character starts here</span></div>}<button className="character-expand nodrag nopan" aria-label="Expand character node" title="Expand character node" onClick={()=>patch({collapsed:false})}><FiChevronDown/></button></div>:<div className="character-columns nodrag nopan nowheel" onKeyDown={e=>e.stopPropagation()}>
   <section className="character-inputs"><div className="character-input-scroll"><label>Character name<input value={form.name} maxLength={80} placeholder="Name your character" disabled={busy} onChange={e=>edit('name',e.target.value)}/></label><label>Character description<textarea value={form.prompt} maxLength={2000} placeholder="Appearance, outfit, personality…" disabled={busy||data.designInputs?.hasPrompt} onChange={e=>edit('prompt',e.target.value)}/></label>{form.referenceImages.length>0&&<div className="design-reference-images"><strong>References</strong><div>{form.referenceImages.map((url,index)=><img key={url} src={url} alt={`Reference ${index+1}`} draggable={false}/>)}</div></div>}{form.reference_assets.length>0&&<div className="design-reference-images"><strong>References</strong><div>{form.reference_assets.map((ref,index)=>ref.kind==='image'?<img key={index} src={ref.url} alt={ref.name} draggable={false}/>:<span key={index} title={ref.kind==='text'?ref.url:ref.name}>{ref.kind==='text'?ref.url:`${ref.kind}: ${ref.name}`}</span>)}</div></div>}<div className="character-palette"><div className="character-palette-heading"><strong>Palette</strong><button type="button" disabled={busy} onClick={()=>updatePalette([...paletteRows,{id:crypto.randomUUID(),color:'#688ca7',attribute:''}])}>+ Add color</button></div>{paletteRows.map((row,index)=><div className="character-palette-row" key={row.id}><PaletteColorPicker label={`Palette color ${index+1}`} value={row.color} disabled={busy} onChange={color=>editColor(row.id,'color',color)}/><input aria-label={`Palette attribute ${index+1}`} placeholder="Skin, clothes, hair…" value={row.attribute} maxLength={60} disabled={busy} onChange={e=>editColor(row.id,'attribute',e.target.value)}/><button type="button" aria-label={`Remove palette color ${index+1}`} disabled={busy} onClick={()=>updatePalette(paletteRows.filter(item=>item.id!==row.id))}><FiX/></button></div>)}<p>Colors are combined with your description when you generate.</p></div><p>Interactive demo with sample artwork. Your description is saved; no AI request or credits are used.</p></div><div className="character-generate-controls"><label>Model<select aria-label="Character model" value={modelId} disabled={busy||!models.length} onChange={e=>edit('modelId',e.target.value)}>{!models.length&&<option value="">No models available</option>}{form.modelId&&!selectedModel&&<option value={form.modelId} disabled>Previously selected model unavailable</option>}{models.map(model=><option key={model.id} value={model.id}>{model.name}</option>)}</select></label><button className="character-primary" disabled={busy||!form.prompt.trim()} onClick={()=>generate(false)}>{busy?'Preparing artwork…':data.resultUrl?'Regenerate Character':'Generate Character'}</button></div></section>
   <section className="character-results"><div className="character-result-title"><strong>{data.characterSheet?'THREE-VIEW SHEET':'CHARACTER PREVIEW'}</strong></div><button className="character-preview" disabled={!data.resultUrl||busy} onClick={()=>setExpanded(true)} aria-label="View character image">{data.resultUrl?<><img src={data.resultUrl} alt={data.characterSheet?'Front, side and back in one image':'Sample character design'}/><FiMaximize2/></>:<span className="character-empty-state"><CharacterEmptyArtwork/><strong>Your character starts here</strong><small>Describe a character to bring them to life.</small></span>}{busy&&<span className="character-loading" role="status">Preparing sample artwork…</span>}</button><div className="character-actions"><button disabled={busy||!data.resultUrl} onClick={()=>generate(true)}>Generate 3 Views</button><button disabled={busy||!data.resultUrl} onClick={save}><FiSave/> Save to Assets</button></div></section>
  </div>}
  <UnifiedInput id={id} data={data} nodeType="characterNode"/>
  <Handle type="source" position={Position.Right} id="imageOutput" style={{background:'#22c55e'}}/>
  {expanded&&createPortal(<dialog ref={dialog} className="character-image-dialog" onCancel={()=>setExpanded(false)} onClick={e=>{if(e.target===e.currentTarget)setExpanded(false);}}><button aria-label="Close character image" onClick={()=>setExpanded(false)}><FiX/></button><img src={data.resultUrl} alt="Character design enlarged"/><a href={data.resultUrl} download={`${form.name||'character'}${data.characterSheet?'-three-views':''}.svg`}>Download image</a></dialog>,document.body)}
 </article>;
}
