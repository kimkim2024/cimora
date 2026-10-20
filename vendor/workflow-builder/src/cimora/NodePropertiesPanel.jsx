import React, { useLayoutEffect, useRef } from 'react';
import { useViewport } from 'reactflow';

export default function NodePropertiesPanel({ node, children, expanded = false, composer = false }) {
 const panel = useRef(null);
 const viewport = useViewport();
 useLayoutEffect(() => {
  const element = panel.current;
  const anchor = document.querySelector(`.react-flow__node[data-id="${CSS.escape(node.id)}"]`);
  if (!element || !anchor) return;
  const place = () => {
   const rect = anchor.getBoundingClientRect();
   const topLimit = window.innerWidth <= 900 ? 140 : 84;
   const bottomLimit = window.innerHeight - 104;
   const gap = 14;
   const topGap = node.type === 'textNode' ? 165 * viewport.zoom : gap;
   const above = Math.max(0, rect.top - topGap - topLimit);
   const below = Math.max(0, bottomLimit - rect.bottom - gap);
   const desired = composer ? 360 : 340;
   const minimumBelow = Math.min(desired, composer ? 280 : 240, Math.max(140, bottomLimit - topLimit));
   const direction = below >= minimumBelow || below >= above ? 'bottom' : 'top';
   const available = direction === 'top' ? above : below;
   const height = Math.min(desired, Math.max(140, available), Math.max(140, bottomLimit - topLimit));
   const width = Math.min(composer ? 920 : 560, window.innerWidth - 32);
   const x = Math.min(Math.max(16, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 16);
   const y = direction === 'top' ? rect.top - topGap - height : rect.bottom + gap;
   element.style.width = `${width}px`;
   element.style.height = `${height}px`;
   element.style.left = `${x}px`;
   element.style.top = `${Math.max(topLimit, Math.min(y, bottomLimit - height))}px`;
   element.dataset.placement = direction;
   if(expanded) {element.style.width = `${window.innerWidth - 64}px`;element.style.height = `${bottomLimit - topLimit}px`;element.style.left = '32px';element.style.top = `${topLimit}px`;element.dataset.placement = 'expanded';}
  };
  place();
  // React Flow moves nodes with CSS transforms, which ResizeObserver does not detect.
  let frame;
  const schedulePlace = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(place); };
  const movementObserver = new MutationObserver(schedulePlace);
  movementObserver.observe(anchor, { attributes: true, attributeFilter: ['style', 'class'] });
  const observer = new ResizeObserver(place);
  observer.observe(anchor);
  window.addEventListener('resize', place);
  return () => { observer.disconnect(); movementObserver.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', place); };
 }, [node, viewport.x, viewport.y, viewport.zoom, expanded, composer]);
 return <div ref={panel} className={`node-properties-panel nodrag nopan nowheel ${composer ? 'composer-shell' : ''}`} role="dialog" aria-label="Node properties" onPointerDown={e => e.stopPropagation()} onWheel={e => e.stopPropagation()}>{children}</div>;
}
