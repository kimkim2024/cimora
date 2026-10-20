import React from 'react';
import { BaseEdge, getBezierPath, getSmoothStepPath, getStraightPath } from 'reactflow';
import './TransferEdge.css';

export default function TransferEdge({ routing = 'default', ...props }) {
 const { id, style, markerStart, markerEnd, interactionWidth, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, pathOptions } = props;
 const geometry = {...props, ...pathOptions};
 const [path, labelX, labelY] = routing === 'straight' ? getStraightPath(geometry)
  : routing === 'step' || routing === 'smoothstep' ? getSmoothStepPath({...geometry, ...(routing === 'step' ? {borderRadius:0} : {})})
  : getBezierPath(geometry);
 const phase = [...id].reduce((value, char) => (value * 31 + char.charCodeAt(0)) % 2000, 0);
 return <>
  <BaseEdge id={id} path={path} style={style} markerStart={markerStart} markerEnd={markerEnd} interactionWidth={interactionWidth}
   label={label} labelX={labelX} labelY={labelY} labelStyle={labelStyle} labelShowBg={labelShowBg} labelBgStyle={labelBgStyle} labelBgPadding={labelBgPadding} labelBgBorderRadius={labelBgBorderRadius}/>
  <g className="transfer-edge-light" aria-hidden="true" style={{'--transfer-phase':`${-phase}ms`}}>
   <path d={path} pathLength="1" className="transfer-edge-glow" stroke={style?.stroke || '#a8b9ce'}/>
   <path d={path} pathLength="1" className="transfer-edge-core"/>
  </g>
 </>;
}

export const transferEdgeTypes = {
 default: TransferEdge,
 straight: props => <TransferEdge {...props} routing="straight"/>,
 step: props => <TransferEdge {...props} routing="step"/>,
 smoothstep: props => <TransferEdge {...props} routing="smoothstep"/>,
};
