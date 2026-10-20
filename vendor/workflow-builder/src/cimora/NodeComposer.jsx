import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiPlus, FiX, FiMaximize2, FiMinimize2, FiBookmark, FiBookOpen, FiCpu, FiChevronDown, FiSliders, FiArrowUp, FiFile } from '../../../../src/components/meika/CanvasIcons';
import { toast } from 'react-hot-toast';
import { uploadAsset } from './transport';
import VideoPresetPicker from './VideoPresetPicker';
import { FiVideo, FiLayers, FiZap, FiCheck, FiFilm } from '../../../../src/components/meika/CanvasIcons';
import ReferenceMenu from './ReferenceMenu';
import NodePropertiesPanel from './NodePropertiesPanel';

export default function NodeComposer({node, models, editable, running, onChange, onDataChange, onModelChange, onGenerate, onLibrary, onClose, groupReferences=[], inputConnections=[], onInputPurposeChange}) {
 const isVideo=node.type==='videoNode';
 const isImage=node.type==='imageNode';
 const [library,setLibrary]=useState(null);
 const [assistantText,setAssistantText]=useState('');
 const [expanded,setExpanded] = useState(false);
 const [popover,setPopover] = useState(null);
 const [uploading,setUploading] = useState(false);
 const [title,setTitle] = useState('');
 const fileInput = useRef(null);
 const referenceButton = useRef(null);
 const [referenceMenu,setReferenceMenu] = useState(false);
 const modelButton = useRef(null);
 const modelMenu = useRef(null);
 const settingsButton = useRef(null);
 const [settingsPosition,setSettingsPosition] = useState({});
 useLayoutEffect(()=>{
  if(!(isVideo||isImage)||popover!=='settings')return;
  const button=settingsButton.current;
  const shell=button?.closest('.node-properties-panel');
  function place() {
   const rect=button?.getBoundingClientRect();if(!rect)return;
   const gap=10, margin=16, width=Math.min(500,window.innerWidth-margin*2);
   const above=rect.top-gap-margin, below=window.innerHeight-rect.bottom-gap-margin;
   // Prefer directly above the trigger; only flip when there is no usable room.
   const up=above>=120||above>=below;
   setSettingsPosition({position:'fixed',left:Math.max(margin,Math.min(rect.left+rect.width/2-width/2,window.innerWidth-width-margin)),top:up?'auto':rect.bottom+gap,bottom:up?window.innerHeight-rect.top+gap:'auto',maxHeight:Math.max(0,up?above:below),width,maxWidth:'calc(100vw - 32px)'});
  }
  let frame;
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(place);};
  const resize=new ResizeObserver(schedule);
  if(button)resize.observe(button);
  if(shell)resize.observe(shell);
  const movement=new MutationObserver(schedule);
  if(shell)movement.observe(shell,{attributes:true,attributeFilter:['style']});
  place();schedule();
  window.addEventListener('resize',schedule);window.addEventListener('scroll',schedule,true);
  return()=>{resize.disconnect();movement.disconnect();cancelAnimationFrame(frame);window.removeEventListener('resize',schedule);window.removeEventListener('scroll',schedule,true);};
 },[isVideo,isImage,popover]);
 // A portal keeps viewport coordinates independent of the glass panel's backdrop-filter.
 const renderPopover=content=>(isVideo||isImage)&&popover==='settings'
  ? createPortal(content,document.getElementById('cimora-canvas')) : content;
 useEffect(()=>{
  if(!['models','settings'].includes(popover))return;
  const dismiss=e=>{if(!modelMenu.current?.contains(e.target)&&!modelButton.current?.contains(e.target)&&!settingsButton.current?.contains(e.target))setPopover(null);};
  document.addEventListener('pointerdown',dismiss,true);
  return()=>document.removeEventListener('pointerdown',dismiss,true);
 },[popover]);
 function modelTags(item) {
  const properties=item.input_schema?.schemas?.input_data?.properties || item.input_schema?.properties || {};
  const duration=properties.duration;
  const tags=item.tags?.length ? [...item.tags] : [item.id.includes('passthrough')?'Upload video':'Generation preview'];
  if(duration?.minimum!=null&&duration?.maximum!=null)tags.push(`${duration.minimum}–${duration.maximum}s`);
  else if(duration?.enum?.length)tags.push(duration.enum.map(value=>`${value}s`).join(' / '));
  return tags;
 }
 const model = node.data?.selectedModel;
 const values = node.data?.formValues || {};
 const schema = model?.input_schema?.schemas?.input_data || model?.input_schema || {};
 const fields = schema.properties || model?.input_params?.properties || {};
 const mediaFields = Object.entries(fields).filter(([,meta]) => ['image','images_list','video','audio'].includes(meta.field));
 const parameters = Object.entries(fields).filter(([key,meta]) => key !== 'prompt' && !mediaFields.some(([mediaKey]) => mediaKey === key) && typeof meta === 'object');
 const mediaType = node.type === 'videoNode' ? 'video' : node.type === 'imageNode' ? 'image' : node.type === 'audioNode' ? 'audio' : 'content';
 const prompt = values.prompt || '';
 const references = [...mediaFields.flatMap(([key,meta]) => (Array.isArray(values[key]) ? values[key] : values[key] ? [values[key]] : []).map((url,index) => ({url,key,index,kind:meta.field==='images_list'?'image':meta.field}))), ...(values.reference_assets || []).filter(ref=>!ref.linked), ...groupReferences];
 const summary = isImage ? [values.resolution || '2k',values.aspect_ratio || fields.aspect_ratio?.default || 'Auto'].join(' · ') : isVideo && fields.aspect_ratio ? [values.aspect_ratio || fields.aspect_ratio.default, `${values.duration ?? fields.duration?.default ?? 5}s`, values.resolution || fields.resolution?.default || '720p'].join(' · ') : parameters.filter(([,meta])=>meta.enum || meta.type==='integer' || meta.type==='number').map(([key,meta])=>values[key] ?? meta.default).filter(v=>v!==undefined && v!=='').slice(0,3).join(' · ') || 'Settings';
 const imageAlign=values.align_to_16 ?? true;
 const initialImageRatio=String(values.aspect_ratio||fields.aspect_ratio?.default||'Auto').split(':').map(Number);
 const [initialW,initialH]=initialImageRatio.length===2&&initialImageRatio.every(value=>value>0)?initialImageRatio:[1,1];
 const imageWidth=values.width || imageDimension(2048*initialW/Math.max(initialW,initialH));
 const imageHeight=values.height || imageDimension(2048*initialH/Math.max(initialW,initialH));
 function updateImageSettings(patch) {
  onDataChange({formValues:{...values,...patch}});
 }
 function imageDimension(value,align=imageAlign) {
  const number=Number(value);
  const bounded=Math.max(16,Math.min(8192,Number.isFinite(number)&&number>0?number:2048));
  return align?Math.round(bounded/16)*16:Math.round(bounded);
 }
 function imageRatio(value) {
  if(value==='Auto'){updateImageSettings({aspect_ratio:value});return;}
  const [w,h]=value.split(':').map(Number);
  const longest=values.resolution==='Auto'?Math.max(imageWidth,imageHeight):2048;
  updateImageSettings({aspect_ratio:value,width:imageDimension(longest*w/Math.max(w,h)),height:imageDimension(longest*h/Math.max(w,h))});
 }
 function addReferences(items) {
  if(!editable)return;
   const nextValues = {...values}; const extras = [...(values.reference_assets || [])];
   for(const item of items) {
    const field = mediaFields.find(([,meta]) => meta.field===item.kind || (item.kind==='image' && meta.field==='images_list'));
    if(field) {const [key,meta]=field;if(meta.type==='array')nextValues[key]=[...(nextValues[key]||[]),item.url];else if(!nextValues[key])nextValues[key]=item.url;else if(nextValues[key]!==item.url && !extras.some(ref=>ref.url===item.url))extras.push(item);}
    else if(!extras.some(ref=>ref.url===item.url))extras.push(item);
   }
   onDataChange({formValues:{...nextValues,reference_assets:extras}});
 }
 async function upload(files) {
  if(!editable || !files?.length)return;
  setUploading(true);
  try {
   // Read all files before changing state so a failed upload does not partially replace references.
   const uploaded = await Promise.all(Array.from(files).map(async file => ({url:await uploadAsset(file),kind:file.type.split('/')[0],name:file.name})));
   addReferences(uploaded);
  } catch(error) {toast.error(error.message || 'Could not add reference.');}
  finally {setUploading(false);if(fileInput.current)fileInput.current.value='';}
 }
 function removeReference(ref) {
  if(ref.key)onChange(ref.key,Array.isArray(values[ref.key])?values[ref.key].filter((_,i)=>i!==ref.index):'');
  else onChange('reference_assets',(values.reference_assets || []).filter(item=>item!==ref));
 }
 function savePrompt(e) {
  e.preventDefault(); if(!prompt.trim())return;
  try {const existing=JSON.parse(localStorage.getItem('cimora.prompts.v1') || '[]');if(!Array.isArray(existing))throw new Error('Invalid saved prompts');const type={imageNode:'Image',videoNode:'Video',audioNode:'Audio'}[node.type] || 'Text';localStorage.setItem('cimora.prompts.v1',JSON.stringify([...existing,{id:crypto.randomUUID(),title:title.trim(),body:prompt,type}]));setPopover(null);toast.success('Prompt saved to My prompts');}
  catch {toast.error('Unable to save prompt in this browser.');}
 }
 function choosePreset(item) {
  const field=library==='style'?'video_style':'camera_motion';
  const previous=values[field];
  const base=previous?.description?prompt.replace(previous.description,'').trim():prompt.trim();
  onDataChange({formValues:{...values,[field]:{id:item.id,name:item.name,description:item.description},prompt:[base,item.description].filter(Boolean).join('\n')}});
 }
 const toggle = name => setPopover(popover===name?null:name);
 return <NodePropertiesPanel node={node} expanded={expanded} composer>
  <div className={`node-composer ${isVideo?'video-composer':''}`} onKeyDown={e=>{if(e.key==='Escape'){setPopover(null);setExpanded(false);}e.stopPropagation();}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void upload(e.dataTransfer.files);}}>
   <div className="composer-heading"><strong>References</strong>{isVideo&&<div className="video-composer-heading-actions"><button type="button" onClick={()=>toggle('assistant')}><FiZap/> Prompt assistant</button><button type="button" aria-label={expanded?'Collapse input':'Expand input'} onClick={()=>setExpanded(!expanded)}>{expanded?<FiMinimize2/>:<FiMaximize2/>}</button></div>}<button type="button" aria-label="Close input panel" onClick={onClose}><FiX/></button></div>
   <div className="composer-references">
    <button className="composer-add" type="button" aria-label="Add reference" aria-haspopup="menu" aria-expanded={referenceMenu} ref={referenceButton} disabled={!editable||uploading} onClick={()=>{setPopover(null);setReferenceMenu(!referenceMenu);}}>{uploading?'…':<FiPlus/>}</button>
    <input hidden ref={fileInput} type="file" accept="image/*,video/*,audio/*" multiple onChange={e=>void upload(e.target.files)}/>
    {references.map((ref,i)=><div className="composer-reference" title={ref.kind==='text'?ref.url:ref.name} key={`${ref.key||'extra'}-${i}`}>{ref.kind==='image'?<img src={ref.url} alt={ref.name || 'Reference'}/>:ref.kind==='video'?<video src={ref.url} muted/>:<FiFile/>}<button type="button" aria-label={`Remove reference ${i+1}`} disabled={!editable} onClick={()=>removeReference(ref)}><FiX/></button></div>)}
   </div>
   {referenceMenu && <ReferenceMenu anchor={referenceButton} nodeId={node.id} onLocal={()=>fileInput.current?.click()} onAdd={addReferences} onClose={()=>setReferenceMenu(false)}/> }
   <textarea className="composer-prompt" aria-label="Prompt" placeholder={isVideo?'Paste or drop reference images here, and describe your scene':`Describe the ${mediaType} you want to generate`} value={prompt} readOnly={!editable} onChange={e=>onChange('prompt',e.target.value)} onPaste={e=>{if(e.clipboardData.files.length){e.preventDefault();void upload(e.clipboardData.files);}}}/>
   <div className="composer-footer">
    {!isVideo&&<div className="composer-actions">
     <button type="button" title={expanded?'Collapse input':'Expand input'} aria-label={expanded?'Collapse input':'Expand input'} onClick={()=>setExpanded(!expanded)}>{expanded?<FiMinimize2/>:<FiMaximize2/>}</button>
     <button type="button" title="Save prompt" aria-label="Save prompt" disabled={!prompt.trim()} onClick={()=>{setTitle('');toggle('save');}}><FiBookmark/></button>
     <button type="button" title="Prompt Library" aria-label="Open prompt library" onClick={onLibrary}><FiBookOpen/></button>
    </div>}
    <button ref={modelButton} className="composer-pill composer-model" type="button" aria-haspopup="dialog" title={model?.name || 'Select model'} aria-expanded={popover==='models'} onClick={()=>toggle('models')}>{isVideo?<FiFilm/>:<FiCpu/>}<span>{model?.name || 'Select model'}</span><FiChevronDown/></button>
    {isVideo&&<><button className="video-composer-choice" type="button" disabled={!editable} onClick={()=>setLibrary('style')}><FiLayers/>{values.video_style?.name || 'Style'}</button><button className="video-composer-choice" type="button" disabled={!editable} onClick={()=>setLibrary('motion')}><FiVideo/>{values.camera_motion?.name || 'Camera motion'}</button></>}
    <button ref={settingsButton} className="composer-pill video-settings-trigger" type="button" aria-haspopup="dialog" aria-label="Generation settings" aria-expanded={popover==='settings'} onClick={()=>toggle('settings')}><FiSliders/><span>{summary}</span></button>
    <span className="composer-estimate">Estimate unavailable</span>
    <button className="composer-generate" type="button" aria-label="Generate" title="Generate" disabled={!editable||running||uploading} onClick={onGenerate}>{running?'…':<FiArrowUp/>}</button>
   </div>
   {popover&&renderPopover(<div ref={modelMenu} className={`composer-popover ${isVideo&&popover==='models'?'video-model-menu':(isVideo||isImage)&&popover==='settings'?'video-settings-menu':''}`} style={(isVideo||isImage)&&popover==='settings'?settingsPosition:undefined} role="dialog" aria-label={popover==='models'?'Select model':popover==='settings'?(isImage?'Image settings':'Generation settings'):popover==='assistant'?'Prompt assistant':'Save prompt'}>
    {!(isVideo&&['models','settings'].includes(popover))&&<header><strong>{popover==='models'?'Model':popover==='settings'?(isImage?'Image settings':'Generation settings'):popover==='assistant'?'Prompt assistant':'Save prompt'}</strong><button type="button" aria-label="Close options" onClick={()=>setPopover(null)}><FiX/></button></header>}
    {popover==='models'&&<div className="composer-model-list">{(models.length?models:model?[model]:[]).map(item=><button type="button" key={item.id} disabled={!editable} aria-pressed={model?.id===item.id} onClick={()=>{onModelChange(item);setPopover(null);}}>{isVideo?<><span className="video-model-name">{item.id.includes('passthrough')?<FiVideo/>:<FiFilm/>}<span>{item.name}</span></span><span className="video-model-tags">{modelTags(item).map(tag=><span key={tag}>{tag}</span>)}</span>{model?.id===item.id&&<FiCheck className="video-model-check" aria-hidden="true"/>}</>:item.name}</button>)}{!models.length&&!model&&<p>No models available for this node.</p>}</div>}
    {popover==='settings'&&!isVideo&&!isImage&&<div className="composer-settings">{parameters.map(([key,meta])=><label key={key}><span>{meta.title || key}</span>{meta.enum?<select disabled={!editable} value={values[key]??meta.default??meta.enum[0]} onChange={e=>onChange(key,e.target.value)}>{meta.enum.map(value=><option key={value} value={value}>{value}</option>)}</select>:meta.type==='boolean'?<input type="checkbox" disabled={!editable} checked={values[key]??meta.default??false} onChange={e=>onChange(key,e.target.checked)}/>:<input disabled={!editable} type={['integer','number'].includes(meta.type)?'number':'text'} min={meta.minimum} max={meta.maximum} value={values[key]??meta.default??''} onChange={e=>onChange(key,['integer','number'].includes(meta.type)?(e.target.value===''?'':Number(e.target.value)):e.target.value)}/>}</label>)}<label><span>Mark as Output</span><input type="checkbox" disabled={!editable} checked={!!values.make_output} onChange={e=>onChange('make_output',e.target.checked)}/></label></div>}
    {popover==='settings'&&isImage&&<div className="video-settings-content image-settings-content">
     <fieldset disabled={!editable}><div className="image-size-heading"><span>Size</span><label>Align to multiples of 16 <button className="image-align-switch" type="button" role="switch" aria-label="Align to multiples of 16" aria-checked={imageAlign} onClick={()=>updateImageSettings({align_to_16:!imageAlign,...(!imageAlign?{width:imageDimension(imageWidth,true),height:imageDimension(imageHeight,true)}:{})})}><span/></button></label></div>
      <div className="image-size-inputs">{['width','height'].map((dimension,index)=><React.Fragment key={dimension}>{index===1&&<button type="button" className="image-swap" aria-label="Swap width and height" onClick={()=>{const ratio=values.aspect_ratio||fields.aspect_ratio?.default||'Auto';updateImageSettings({width:imageHeight,height:imageWidth,aspect_ratio:ratio.includes(':')?ratio.split(':').reverse().join(':'):'Auto'});}}>↔</button>}<label><span>{index===0?'W':'H'}</span><input key={values[dimension]} aria-label={index===0?'Image width':'Image height'} type="number" min="16" max="8192" step={imageAlign?16:1} defaultValue={index===0?imageWidth:imageHeight} onBlur={e=>{const size=imageDimension(e.target.value);e.target.value=String(size);updateImageSettings({[dimension]:size,aspect_ratio:'Auto'});}} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/></label></React.Fragment>)}</div>
     </fieldset>
     <fieldset disabled={!editable}><legend>Resolution</legend><div className="video-quality-options">{['2k','Auto'].map(value=><button type="button" key={value} aria-pressed={(values.resolution||'2k')===value} onClick={()=>{const longest=Math.max(imageWidth,imageHeight);updateImageSettings({resolution:value,...(value==='2k'?{width:imageDimension(2048*imageWidth/longest),height:imageDimension(2048*imageHeight/longest)}:{})});}}>{value}</button>)}</div></fieldset>
     <fieldset disabled={!editable}><legend>Aspect ratio</legend><div className="image-ratio-options">{['1:1','2:3','3:2','4:3','3:4','16:9','9:16','21:9','9:21','Auto'].map(value=>{const [w,h]=value==='Auto'?[1,1]:value.split(':').map(Number);return <button type="button" key={value} aria-pressed={(values.aspect_ratio||fields.aspect_ratio?.default||'Auto')===value} onClick={()=>imageRatio(value)}>{value!=='Auto'&&<i aria-hidden="true" style={{width:32*w/Math.max(w,h),height:32*h/Math.max(w,h)}}/>}{value}</button>;})}</div></fieldset>
    </div>}
    {popover==='settings'&&isVideo&&<div className="video-settings-content">
     {inputConnections.length>0&&<fieldset disabled={!editable}><legend>Connected inputs</legend>{inputConnections.map(edge=><label key={edge.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:8}}><span>{edge.label}</span><select aria-label={`Input purpose for ${edge.label}`} value={edge.targetHandle} onChange={event=>onInputPurposeChange(edge.id,event.target.value)}>{edge.options.map(([handle,,,label])=><option key={handle} value={handle}>{label}</option>)}</select></label>)}</fieldset>}
     <fieldset disabled={!editable}><legend>Quality</legend><div className="video-quality-options">{['480p','720p','1080p'].map(value=><button type="button" key={value} aria-pressed={(values.resolution||fields.resolution?.default||'720p')===value} onClick={()=>onChange('resolution',value)}>{value}</button>)}</div></fieldset>
     <fieldset disabled={!editable}><legend>Aspect ratio</legend><div className="video-ratio-options">{['1:1','3:4','4:3','16:9','9:16','21:9','Auto'].map(value=><button type="button" key={value} aria-pressed={(values.aspect_ratio||fields.aspect_ratio?.default||'Auto')===value} onClick={()=>onChange('aspect_ratio',value)}>{value!=='Auto'&&<i aria-hidden="true" style={{width:value==='9:16'?14:value==='3:4'?19:30,height:value==='21:9'?13:value==='16:9'?17:value==='4:3'?23:30}}/>}{value}</button>)}</div></fieldset>
     <fieldset disabled={!editable}><legend>Seconds</legend><div className="video-duration"><input aria-label="Video duration" type="range" min={fields.duration?.minimum??1} max={fields.duration?.maximum??30} step="1" value={values.duration??5} onChange={e=>onChange('duration',Number(e.target.value))}/><output>{values.duration??5}</output><span>s</span></div></fieldset>
     <fieldset disabled={!editable}><legend>Mode</legend><div className="video-mode-options">{[['first_last_frame','First & last frame'],['general_reference','General reference']].map(([value,label])=><button type="button" key={value} aria-pressed={(values.reference_mode||'general_reference')===value} onClick={()=>onChange('reference_mode',value)}>{label}</button>)}</div></fieldset>
    </div>}
    {popover==='assistant'&&<form onSubmit={e=>{e.preventDefault();onChange('prompt',[prompt.trim(),assistantText.trim()].filter(Boolean).join('\n'));setAssistantText('');setPopover(null);}}><p>Add scene details: subject, action, setting, lighting and mood.</p><textarea aria-label="Scene details" placeholder="A traveler walks through a rainy neon street, cinematic lighting…" value={assistantText} onChange={e=>setAssistantText(e.target.value)}/><small>Local prompt helper · no AI service connected</small><button type="submit" disabled={!editable||!assistantText.trim()}>Add to prompt</button></form>}
    {popover==='save'&&<form onSubmit={savePrompt}><input aria-label="Prompt title" placeholder="Prompt title" value={title} onChange={e=>setTitle(e.target.value)} required maxLength={120}/><button type="submit" disabled={!title.trim()}>Save to My prompts</button></form>}
   </div>)}
   {library&&<VideoPresetPicker kind={library} onSelect={choosePreset} onClose={()=>setLibrary(null)}/>}
  </div>
 </NodePropertiesPanel>;
}
