// Keep semantic handle IDs in saved edges; only the visible input is unified.
export const inputPorts = {
 groupNode: [['groupReferenceInput','reference_assets','reference','References']],
 characterNode: [['designPromptInput','prompt','text','Character description'],['designImageInput','referenceImages','image','Reference images']],
 sceneNode: [['designPromptInput','prompt','text','Scene description'],['designImageInput','referenceImages','image','Reference images']],
 textNode: [['textInput','prompt','text','Prompt'],['textInput2','image_url','image','Reference image'],['textInput3','images_list','image','Reference images'],['textInput4','system_prompt','text','System prompt']],
 imageNode: [['imageInput','prompt','text','Prompt'],['imageInput2','images_list','image','Reference images'],['imageInput3','image_url','image','Reference image']],
 videoNode: [['videoInput','prompt','text','Prompt'],['videoInput2','image_url','image','First frame'],['videoInput3','last_image','image','Last frame'],['videoInput4','video_url','video','Reference video'],['videoInput5','audio_url','audio','Audio'],['videoInput6','images_list','image','Reference images'],['videoInput7','videos_list','video','Video list'],['videoInput8','audios_list','audio','Audio list']],
 audioNode: [['audioInput','audio_url','audio','Audio'],['audioInput2','prompt','text','Prompt'],['audioInput3','image_url','image','Reference image'],['audioInput4','video_url','video','Reference video']],
};
export function getInputPorts(node) {
 if (!node) return [];
 if (['groupNode','characterNode','sceneNode'].includes(node.type)) return inputPorts[node.type];
 const values = node.data?.formValues || {};
 if (node.type === 'apiNode') return (node.data?.exposedHandles || []).filter(key => key in values).map(key => {
  const format = node.data?.taskData?.[key]?.format || key;
  const type = /image/.test(format) ? 'image' : /video/.test(format) ? 'video' : /audio/.test(format) ? 'audio' : 'text';
  return [key,key,type,key.replaceAll('_',' ')];
 });
 if (node.data?.selectedModel?.id === 'text-passthrough' && node.type === 'textNode') return [inputPorts.textNode[0]];
 if (node.data?.selectedModel?.id?.includes('passthrough')) return [];
 return (inputPorts[node.type] || []).filter(([,field]) => field in values || (field === 'videos_list' && 'video_files' in values) || (field === 'audios_list' && 'audio_files' in values));
}
export function connectionOptions(connection, nodes) {
 const source = nodes.find(node => node.id === connection.source);
 const target = nodes.find(node => node.id === connection.target);
 if (!source || !target || source.id === target.id) return [];
 if (connection.sourceHandle === 'groupOutput' && source.type === 'groupNode' && inputPorts[target.type]) return [['groupReferenceInput','reference_assets','reference','References']];
 const types = {textOutput:'text',concatOutput:'text',imageOutput:'image',videoOutput:'video',audioOutput:'audio'};
 let type = types[connection.sourceHandle];
 if (connection.sourceHandle === 'apiOutput') {
  const output = source.data?.outputs?.[0]?.type;
  const modelType = source.data?.formValues?.model_type;
  type = output === 'text' || modelType === 'chat' ? 'text' : output === 'video_url' || modelType === 'video' ? 'video' : output === 'audio_url' || modelType === 'audio' ? 'audio' : 'image';
 }
 if (target.type === 'groupNode' && type) return inputPorts.groupNode;
 return getInputPorts(target).filter(port => port[2] === type);
}

export function getDesignInputs(id, nodes, edges) {
 const incoming = edges.filter(edge => edge.target === id);
 const valueOf = edge => {
  const source = nodes.find(node => node.id === edge.source);
  if (source?.type === 'concatNode') return source.data?.formValues?.prompt || '';
  return source?.data?.viewingOutput ?? source?.data?.resultUrl ?? source?.data?.outputs?.[0]?.value ?? '';
 };
 const promptEdge = incoming.find(edge => edge.targetHandle === 'designPromptInput');
 return {
  references: getGroupReferences(id,nodes,edges),
  hasPrompt: Boolean(promptEdge),
  prompt: promptEdge ? valueOf(promptEdge) : '',
  referenceImages: [...new Set(incoming.filter(edge => edge.targetHandle === 'designImageInput').map(valueOf).filter(value => typeof value === 'string' && value.trim()))],
 };
}

export function defaultInputPort(connection, nodes, edges) {
 const target = nodes.find(node => node.id === connection.target);
 let options = connectionOptions(connection,nodes);
 if (target?.type === 'videoNode' && options.some(port => port[2] === 'image')) {
  const mode = target.data?.formValues?.reference_mode || 'general_reference';
  const order = mode === 'general_reference' ? ['videoInput6','videoInput2','videoInput3'] : ['videoInput2','videoInput3','videoInput6'];
  options = [...options].sort((a,b) => order.indexOf(a[0])-order.indexOf(b[0]));
 }
 return options.find(([handle,field]) => field === 'reference_assets' || field.endsWith('_list') || field === 'referenceImages' || !edges.some(edge => edge.target === connection.target && edge.targetHandle === handle));
}

// Use the same canvas bounds for membership, references and detaching children.
export function getNodeBounds(node, nodes) {
 let x=node.position.x, y=node.position.y, parentId=node.parentNode;
 const seen=new Set([node.id]);
 while(parentId && !seen.has(parentId)) {
  seen.add(parentId);
  const parent=nodes.find(item=>item.id===parentId);
  if(!parent) break;
  x+=parent.position.x; y+=parent.position.y; parentId=parent.parentNode;
 }
 return {x,y,width:node.width||Number(node.style?.width)||320,height:node.height||Number(node.style?.height)||300};
}
function containsNode(group, node, nodes) {
 const area=getNodeBounds(group,nodes), box=getNodeBounds(node,nodes);
 return box.x>=area.x-1 && box.y>=area.y-1 && box.x+box.width<=area.x+area.width+1 && box.y+box.height<=area.y+area.height+1;
}
export function getGroupMembers(groupId, nodes) {
 const group=nodes.find(node=>node.id===groupId && node.type==='groupNode');
 return group ? nodes.filter(node=>node.type!=='groupNode' && containsNode(group,node,nodes)) : [];
}
export function detachOutsideGroupNodes(nodes) {
 // Reconcile membership only after React Flow finishes dragging/resizing.
 if(nodes.some(node=>node.dragging || node.resizing)) return nodes;
 const groups=nodes.filter(node=>node.type==='groupNode');
 let changed=false;
 const next=nodes.map(node=>{
  if(node.type==='groupNode') return node;
  // Wait for restored cards to be measured before deciding membership.
  if(!(node.width || Number(node.style?.width)) || !(node.height || Number(node.style?.height))) return node;
  const parent=groups.find(item=>item.id===node.parentNode);
  if(parent && containsNode(parent,node,nodes)) return node;
  // In overlapping groups, use the smallest containing frame.
  const containing=groups.filter(group=>containsNode(group,node,nodes))
   .sort((a,b)=>{const aa=getNodeBounds(a,nodes),bb=getNodeBounds(b,nodes);return aa.width*aa.height-bb.width*bb.height;})[0];
  if(!node.parentNode && !containing) return node;
  const {x,y}=getNodeBounds(node,nodes);
  const area=containing ? getNodeBounds(containing,nodes) : {x:0,y:0};
  changed=true;
  return {...node,parentNode:containing?.id,extent:undefined,
   position:{x:x-area.x,y:y-area.y},selected:parent?.selected?false:node.selected};
 });
 // React Flow requires parents before their children.
 return changed?[...next.filter(node=>node.type==='groupNode'),...next.filter(node=>node.type!=='groupNode')]:nodes;
}
export function getGroupReferences(targetId, nodes, edges) {
 const references=[], seen=new Set(), visited=new Set([targetId]);
 function collect(nodeId, groupId) {
  if(visited.has(nodeId)) return;
  visited.add(nodeId);
  const node=nodes.find(item=>item.id===nodeId);
  if(!node) return;
  if(node.type==='groupNode') {
   for(const member of getGroupMembers(node.id,nodes)) collect(member.id,groupId);
   for(const edge of edges.filter(edge=>edge.target===node.id)) collect(edge.source,groupId);
   return;
  }
  const data=node.data||{};
  const fallback=['characterNode','sceneNode'].includes(node.type)?'image':node.type==='vidConcatNode'?'video':node.type.replace('Node','');
  const outputs=data.outputs?.length?data.outputs:[{type:fallback,value:data.resultUrl || (node.type==='textNode'?data.formValues?.prompt:'')}];
  for(const output of outputs) {
   const kind=String(output.type||fallback).replace('_url','');
   if(!['text','image','video','audio'].includes(kind)) continue;
   for(const url of Array.isArray(output.value)?output.value:[output.value]) {
    if(typeof url!=='string'||!url.trim()||seen.has(kind+':'+url)) continue;
    seen.add(kind+':'+url);
    references.push({url,kind,sourceNodeId:node.id,groupId,name:data.label||node.type.replace('Node',''),linked:true});
   }
  }
 }
 for(const edge of edges.filter(edge=>edge.target===targetId && edge.sourceHandle==='groupOutput')) collect(edge.source,edge.source);
 return references;
}
