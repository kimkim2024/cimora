import { demoSceneAsset } from './SceneDesignNode';
import React, { useEffect, useState } from 'react';
import { FiSearch, FiList, FiFileText, FiX, FiArrowLeft } from '../../../../src/components/meika/CanvasIcons';

const categories = ['Character', 'Scene', 'Action'];
const legacyCategories = { 'Character Design': 'Character', 'Scene Design': 'Scene', 'Action Design': 'Action', '角色设计': 'Character', '场景设计': 'Scene', '动作设计': 'Action' };
const promptCategory = prompt => categories.includes(prompt.category) ? prompt.category : legacyCategories[prompt.category] || (prompt.type === 'Video' ? 'Action' : prompt.type === 'Audio' ? 'Scene' : 'Character');
const templates = [
 { id: 'reverse', category: 'Scene', title: 'Reverse-Engineer an Image Prompt', type: 'Text', body: 'Analyze the reference image. Describe its subject, composition, lighting, palette and visual style. Turn the description into a clear image generation prompt.' },
 { id: 'extract', category: 'Character', title: 'Extract Character, Scene, and Props', type: 'Text', body: 'Read the script and list every character, location and prop. Describe their visual traits and keep recurring details consistent across scenes.' },
 { id: 'drama', category: 'Action', title: 'Format Short-Form Drama', type: 'Text', body: 'Turn the story idea into a short anime episode script. Include scene headings, action, dialogue, a strong opening hook and a closing reveal.' },
 { id: 'cinematic', category: 'Action', title: 'Cinematic Narrative', type: 'Video', body: 'Create a cinematic anime shot with a clear subject, motivated camera movement, expressive character acting and consistent lighting. Describe the beginning and end of the shot.' },
 { id: 'character', category: 'Character', title: 'Character Design Sheet', type: 'Image', body: 'Create a character reference sheet with front, side and back views, consistent proportions, costume details and a small set of facial expressions on a neutral background.' },
 { id: 'audio', category: 'Scene', title: 'Atmosphere and Sound Design', type: 'Audio', body: 'Design an atmospheric soundscape for this scene. Specify ambience, foreground effects, pacing and mood, leaving space for character dialogue.' },
];
export default function CanvasResourcePanel({ nodes, onSelect, onAddPrompt, onAddCharacter, onAddScene, editable, onClose, tab, setTab }) {
 const [source, setSource] = useState('Official prompts');
 const [category, setCategory] = useState(categories[0]);
 const [query, setQuery] = useState('');
 const [selected, setSelected] = useState(null);
 const [creating, setCreating] = useState(false);
 const [error, setError] = useState('');
 const [mine, setMine] = useState(() => { try { const value = JSON.parse(localStorage.getItem('cimora.prompts.v1') || '[]'); return Array.isArray(value) ? value.filter(p => typeof p.title === 'string' && typeof p.body === 'string') : []; } catch { return []; } });
 const [characterAssets,setCharacterAssets]=useState([]);
 useEffect(()=>{
  const load=()=>{try{const items=JSON.parse(localStorage.getItem('cimora.character-assets.v1')||'[]');setCharacterAssets(Array.isArray(items)?items.filter(item=>typeof item.title==='string'&&typeof item.url==='string'&&item.url.startsWith('data:image/svg+xml')):[]);}catch{setCharacterAssets([]);}};
  load();window.addEventListener('cimora:character-assets',load);
  return()=>window.removeEventListener('cimora:character-assets',load);
 },[]);
 const [sceneAssets,setSceneAssets]=useState([demoSceneAsset]);
 useEffect(()=>{
  const load=()=>{try{const items=JSON.parse(localStorage.getItem('cimora.scene-assets.v1')||'[]');setSceneAssets([...(Array.isArray(items)?items.filter(item=>item.id!==demoSceneAsset.id&&typeof item.title==='string'&&typeof item.url==='string'&&item.url.startsWith('data:image/svg+xml')):[]),demoSceneAsset]);}catch{setSceneAssets([demoSceneAsset]);}};
  load();window.addEventListener('cimora:scene-assets',load);
  return()=>window.removeEventListener('cimora:scene-assets',load);
 },[]);
 const [textAssets,setTextAssets]=useState([]);
 useEffect(()=>{
  const load=()=>{try{const items=JSON.parse(localStorage.getItem('cimora.text-assets.v1')||'[]');setTextAssets(Array.isArray(items)?items.filter(item=>typeof item.title==='string'&&typeof item.body==='string'):[]);}catch{setTextAssets([]);}};
  load();window.addEventListener('cimora:text-assets',load);
  return()=>window.removeEventListener('cimora:text-assets',load);
 },[]);
 const matches = value => value.toLowerCase().includes(query.toLowerCase());
 const prompts = (source === 'Official prompts' ? templates : mine).filter(p => promptCategory(p) === category && matches(p.title + ' ' + p.body));
 const assets = nodes.flatMap(node => ['image', 'video', 'audio'].flatMap(kind => {
  const url = node.data?.formValues?.[`${kind}_url`] || (node.type === `${kind}Node` ? node.data?.resultUrl || node.data?.outputs?.[0]?.value : null);
  return typeof url === 'string' && /^(https?:|data:|blob:)/.test(url) ? [{ node, kind, url }] : [];
 })).filter(asset => matches(asset.node.id + ' ' + asset.kind));
 const savePrompt = event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const title = String(data.get('title')).trim(), body = String(data.get('body')).trim();
  if (!title || !body) { setError('Enter a title and prompt.'); return; }
  const next = [...mine, { id: crypto.randomUUID(), title, body, type: 'Text', category: data.get('category') }];
  try { localStorage.setItem('cimora.prompts.v1', JSON.stringify(next)); setMine(next); setCreating(false); setError(''); setCategory(String(data.get('category'))); setQuery(''); } catch { setError('Unable to save. Browser storage may be full.'); }
 };
 return <aside className="canvas-resource-panel" aria-label="Canvas resources" onKeyDown={e => e.stopPropagation()}>
  <div className="resource-tabs" role={tab === 'Tasks' ? undefined : 'tablist'} aria-label="Resources">
   {tab === 'Tasks' ? <h3 className="resource-tasks-title">Tasks</h3> : ['Prompt Library', 'Canvas', 'Assets'].map(label => <button key={label} role="tab" aria-selected={tab === label} onClick={() => { setTab(label); setQuery(''); setSelected(null); setCreating(false); }}>{label}</button>)}
   <button className="resource-close" aria-label="Close panel" onClick={onClose}><FiX /></button>
  </div>
  {tab !== 'Tasks' && <label className="resource-search"><FiSearch /><input aria-label={`Search ${tab}`} placeholder={tab === 'Prompt Library' ? 'Search prompts' : `Search ${tab.toLowerCase()}`} value={query} onChange={e => setQuery(e.target.value)} /></label>}
  {tab === 'Prompt Library' && <>
   <div className="resource-sources">{['Official prompts', 'My prompts'].map(label => <button key={label} aria-pressed={source === label} onClick={() => { setSource(label); setSelected(null); setCreating(false); }}>{label}</button>)}</div>
   <div className="resource-filters">{categories.map(label => <button key={label} aria-pressed={category === label} onClick={() => { setCategory(label); setSelected(null); }}>{label}</button>)}</div>
  </>}
  <div className="resource-scroll">
   {tab === 'Tasks' && <div className="resource-tasks-empty"><FiList /><h3>No generation tasks</h3><p>Task progress will appear here when generation is connected.</p></div>}
   {tab === 'Canvas' && <div className="resource-node-list">{nodes.filter(n => matches(n.id + ' ' + (n.data?.selectedModel?.name || n.type))).map(n => <button key={n.id} onClick={() => onSelect(n.id)}><FiFileText /><span>{n.id}<small>{n.data?.selectedModel?.name || n.type}</small></span></button>)}{!nodes.length && <p>Add a node to start your canvas.</p>}</div>}
   {tab === 'Assets' && <>{characterAssets.length>0&&<><h3>Characters</h3><div className="resource-grid">{characterAssets.filter(item=>matches(item.title)).map(item=><div className="resource-card character-asset-card" key={item.id}><div className="resource-preview"><img src={item.url} alt={item.title}/></div><div className="resource-card-copy"><strong>{item.title}</strong><small>{item.sheet?'Three-view sheet':'Character'} · Demo</small><div className="asset-card-actions"><button className="resource-primary" disabled={!editable} onClick={()=>onAddCharacter(item)}>Add to canvas</button><a className="asset-download" href={item.url} download={`${item.title}.svg`}>Download assets</a></div></div></div>)}</div></>}<><h3>Scenes</h3>{!sceneAssets.some(item=>matches(item.title))&&<p className="resource-empty">{sceneAssets.length?"No matching scenes.":"No scenes yet. Save a scene from Scene Design to see it here."}</p>}<div className="resource-grid">{sceneAssets.filter(item=>matches(item.title)).map(item=><div className="resource-card character-asset-card" key={item.id}><div className="resource-preview"><img src={item.url} alt={item.title}/></div><div className="resource-card-copy"><strong>{item.title}</strong><small>{item.sheet?'Four-view sheet':'Scene'} · Demo</small><div className="asset-card-actions"><button className="resource-primary" disabled={!editable} onClick={()=>onAddScene(item)}>Add to canvas</button><a className="asset-download" href={item.url} download={`${item.title}.svg`}>Download assets</a></div></div></div>)}</div></>{!characterAssets.length && !sceneAssets.length && !assets.length && !textAssets.length && <p className="resource-empty">Your canvas media and saved text will appear here.</p>}<div className="resource-grid">{assets.map(a => <button className="resource-card" key={a.node.id + a.kind} onClick={() => onSelect(a.node.id)}><div className="resource-preview">{a.kind === 'image' ? <img src={a.url} alt={a.node.id} /> : <FiFileText />}</div><div className="resource-card-copy"><strong>{a.node.id}</strong><small>{a.kind}</small></div></button>)}{textAssets.filter(item=>matches(item.title+' '+item.body)).map(item=><button className="resource-card" key={item.id} disabled={!editable} title="Add text to canvas" onClick={()=>onAddPrompt(item.body)}><div className="resource-preview"><FiFileText/></div><div className="resource-card-copy"><strong>{item.title}</strong><small>Text · Add to canvas</small></div></button>)}</div></>}
   {tab === 'Prompt Library' && (creating ? <form className="resource-detail" onSubmit={savePrompt}><button type="button" onClick={() => setCreating(false)}><FiArrowLeft /> Back</button><h3>New prompt</h3><input name="title" aria-label="Prompt title" placeholder="Title" required maxLength={120} /><select name="category" aria-label="Prompt category" defaultValue={category}>{categories.map(t => <option key={t}>{t}</option>)}</select><textarea name="body" aria-label="Prompt content" placeholder="Write your prompt…" required rows={8} /><p role="alert">{error}</p><button className="resource-primary" type="submit">Save prompt</button></form> : selected ? <div className="resource-detail"><button onClick={() => setSelected(null)}><FiArrowLeft /> Back</button><h3>{selected.title}</h3><small>{promptCategory(selected)}</small><p>{selected.body}</p><button className="resource-primary" disabled={!editable} onClick={() => onAddPrompt(selected.body)}>Add to canvas</button></div> : <>
    {source === 'My prompts' && <button className="resource-new" onClick={() => { setCreating(true); setError(''); }}>+ New prompt</button>}
    <div className="resource-grid resource-prompt-grid">{prompts.map(prompt => <button className="resource-card" key={prompt.id} onClick={() => setSelected(prompt)}><div className="resource-preview"><FiFileText /></div><div className="resource-card-copy"><strong>{prompt.title}</strong><small>{promptCategory(prompt)}</small></div></button>)}</div>
    {!prompts.length && <p className="resource-empty">No prompts found.</p>}
    {source === 'Official prompts' && <p className="resource-caption">Cimora starter templates</p>}
   </>)}
  </div>
 </aside>;
}
