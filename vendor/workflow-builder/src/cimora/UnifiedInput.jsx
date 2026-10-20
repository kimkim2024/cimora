import React, { useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { getInputPorts, inputPorts } from './unifiedInputs.mjs';

export default function UnifiedInput({ id, data, nodeType }) {
 const ports = getInputPorts({type:nodeType,data});
 const aliases = nodeType === 'apiNode' ? Object.keys(data.formValues || {}).map(key => [key]) : inputPorts[nodeType] || [];
 const update = useUpdateNodeInternals();
 const signature = ports.map(port => port[0]).join(',');
 useEffect(() => { update(id); }, [id, signature, update]);
 return <>
  {nodeType !== "groupNode" && <Handle type="target" position={Position.Left} id="groupReferenceInput" isConnectable={false} style={{top:"50%",opacity:0,pointerEvents:"none"}}/>}
  {aliases.map(([handle]) => <Handle key={handle} type="target" position={Position.Left} id={handle} isConnectable={false} style={{top:'50%',opacity:0,pointerEvents:'none',width:12,height:12}}/>)}
  {(ports.length > 0 || Boolean(inputPorts[nodeType])) && <Handle type="target" position={Position.Left} id="unifiedInput" aria-label="Connect input" title="Input" style={{top:'50%',width:12,height:12,background:'#202735',border:'3px solid #a8b9ce',zIndex:5}}/>}
 </>;
}
