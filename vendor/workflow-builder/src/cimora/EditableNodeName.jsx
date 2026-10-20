import React, {useEffect, useRef, useState} from 'react';

export default function EditableNodeName({id,data,fallback}) {
 const [editing,setEditing]=useState(false);
 const [draft,setDraft]=useState('');
 const input=useRef(null);
 const cancelled=useRef(false);
 const name=data.label||fallback;
 useEffect(()=>{if(editing){input.current?.focus();input.current?.select();}},[editing]);
 function start(){cancelled.current=false;setDraft(name);setEditing(true);}
 function finish(){
  if(!cancelled.current&&draft.trim()&&draft.trim()!==name)data.onDataChange?.(id,{label:draft.trim()});
  setEditing(false);
 }
 return <span className="editable-node-name nodrag nopan" onPointerDown={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()} onDoubleClick={e=>{e.stopPropagation();if(!editing)start();}}>
  {editing?<input ref={input} aria-label="Node name" value={draft} maxLength={120} onChange={e=>setDraft(e.target.value)} onBlur={finish} onKeyDown={e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();finish();}if(e.key==='Escape'){e.preventDefault();cancelled.current=true;setEditing(false);}}}/>:<span role="button" tabIndex={0} title="Double-click to rename" onKeyDown={e=>{e.stopPropagation();if(e.key==='Enter'||e.key==='F2'){e.preventDefault();start();}}}>{name}</span>}
 </span>;
}
