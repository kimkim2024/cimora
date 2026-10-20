import { inputPorts } from './unifiedInputs.mjs';

const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const asList = value => (Array.isArray(value) ? value : [value]).filter(value => typeof value === 'string' && value.trim());
function portFor(node, handle) {
 if (['characterNode','sceneNode','groupNode'].includes(node.type) || handle === 'groupReferenceInput') return null;
 if (node.type === 'concatNode' && handle === 'concatInput') return { field:'prompt', join:true };
 const form = node.data?.formValues || {};
 let field = inputPorts[node.type]?.find(port => port[0] === handle)?.[1];
 if (node.type === 'vidConcatNode' && handle === 'videoInput7') field = 'videos_list';
 if (node.type === 'apiNode') field = handle;
 if (!field) return null;
 if (field === 'videos_list' && 'video_files' in form) field = 'video_files';
 if (field === 'audios_list' && 'audio_files' in form) field = 'audio_files';
 const list = field.endsWith('_list') || ['video_files','audio_files','images','image_urls'].includes(field)
  || node.data?.taskData?.[field]?.type === 'array';
 return { field, list };
}
function outputOf(node) {
 if (node?.type === 'concatNode') return node.data?.formValues?.prompt;
 return node?.data?.viewingOutput ?? node?.data?.resultUrl ?? node?.data?.outputs?.[0]?.value;
}

// Store manual values separately from the last projected connected values.
// Keeping this on node.data makes undo/redo and saved workflows preserve provenance.
export function syncLinkedInputs(nodes, edges, previousGraph = null) {
 const byId = new Map(nodes.map(node => [node.id,node]));
 let changed = false;
 const next = nodes.map(node => {
  const form = node.data?.formValues || {};
  const prior = node.data?.linkedInputs || {};
  const fields = new Map();
  for (const edge of edges) {
   if (edge.target !== node.id || edge.sourceHandle === 'groupOutput' || !byId.has(edge.source)) continue;
   const port = portFor(node,edge.targetHandle);
   if (!port) continue;
   if (!fields.has(port.field)) fields.set(port.field,{...port, values:[]});
   fields.get(port.field).values.push(...asList(outputOf(byId.get(edge.source))));
  }
  if (!fields.size && !Object.keys(prior).length) return node;
  const values = {...form}, linkedInputs = {};
  for (const field of new Set([...fields.keys(),...Object.keys(prior)])) {
   const incoming = fields.get(field), saved = prior[field];
   const list = incoming?.list ?? saved?.list;
   const empty = list ? [] : '';
   const current = form[field] ?? empty;
   let manual = saved?.manual ?? current;
   if (saved && !equal(current,saved.applied)) {
    // A form edit changes only the manual part of a list, not its connected assets.
    manual = list ? asList(current).filter(value => !saved.linked.includes(value)) : current;
   } else if (!saved && incoming) {
    const existed = !previousGraph || !previousGraph.nodes.some(item => item.id === node.id)
     || previousGraph.edges.some(edge => edge.target === node.id && portFor(node,edge.targetHandle)?.field === field);
    // Legacy saved forms contain projected references without ownership metadata.
    if (existed) manual = list ? asList(current).filter(value => !incoming.values.includes(value))
     : incoming.values.includes(current) || String(current).includes('{{ ') ? empty : current;
   }
   if (!incoming) { values[field] = manual; continue; }
   const linked = [...new Set(incoming.values)];
   const applied = incoming.join ? [...asList(manual),...linked].join(' ')
    : list ? [...new Set([...asList(manual),...linked])] : linked[0] ?? '';
   values[field] = applied;
   linkedInputs[field] = { manual, applied, linked, list:!!list };
  }
  if (equal(values,form) && equal(linkedInputs,prior)) return node;
  changed = true;
  return {...node,data:{...node.data,formValues:values,linkedInputs}};
 });
 return changed ? next : nodes;
}
