import UnifiedInput from './UnifiedInput';
import EditableNodeName from "./EditableNodeName";
import React from 'react';
import { FiMaximize2 } from '../../../../src/components/meika/CanvasIcons';
import {Handle,Position,NodeResizer,useReactFlow} from 'reactflow';
export default function CanvasGroupNode({id,data,selected}) {
 const {setNodes,setEdges}=useReactFlow();
 function ungroup() {
  setEdges(edges=>edges.filter(edge=>edge.source!==id&&edge.target!==id));
  setNodes(nodes=>{const group=nodes.find(node=>node.id===id);return nodes.filter(node=>node.id!==id).map(node=>node.parentNode===id?{...node,parentNode:undefined,extent:undefined,position:{x:node.position.x+group.position.x,y:node.position.y+group.position.y}}:node);});
 }
 return <div className="canvas-group-frame"><NodeResizer minWidth={240} minHeight={180} handleClassName="group-resize-handle" lineClassName="group-resize-line"/><span className="group-resize-hint" title="Drag a corner or edge to resize"><FiMaximize2 aria-hidden="true"/></span><UnifiedInput id={id} data={data} nodeType="groupNode"/><Handle type="source" position={Position.Right} id="groupOutput" aria-label="Connect group references" title="Group references"/><header><EditableNodeName id={id} data={data} fallback="Group"/>{selected&&<button type="button" className="nodrag" onClick={ungroup}>Ungroup</button>}</header></div>;
}
