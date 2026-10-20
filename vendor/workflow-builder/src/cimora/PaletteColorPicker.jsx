import { FiEdit3 } from '../../../../src/components/meika/CanvasIcons';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function toHsv(hex, fallbackHue = 0) {
 const [r, g, b] = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
 const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
 let h = fallbackHue;
 if (delta) {
  h = max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  h *= 60;
 }
 return { h, s: max ? delta / max : 0, v: max };
}
function toHex({ h, s, v }) {
 const channel = n => {
  const k = (n + h / 60) % 6;
  return Math.round(255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1)))).toString(16).padStart(2, '0');
 };
 return '#' + channel(5) + channel(3) + channel(1);
}

export default function PaletteColorPicker({ value, disabled, label, onChange }) {
 const [open, setOpen] = useState(false);
 const [position, setPosition] = useState({ left: 8, top: 8 });
 const [hsv, setHsv] = useState(() => toHsv(value));
 const emitted = useRef(value);
 const trigger = useRef(null);
 const panel = useRef(null);
 const channels = [1, 3, 5].map(start => parseInt(value.slice(start, start + 2), 16));

 useEffect(() => {
  if (value !== emitted.current) setHsv(previous => toHsv(value, previous.h));
 }, [value]);
 useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
 useLayoutEffect(() => {
  if (!open) return;
  const anchor = trigger.current.getBoundingClientRect();
  const bounds = panel.current.getBoundingClientRect();
  setPosition({
   left: Math.max(8, anchor.left - bounds.width - 12),
   top: Math.max(8, Math.min(anchor.top, window.innerHeight - bounds.height - 8)),
  });
 }, [open]);
 useEffect(() => {
  if (!open) return;
  const outside = event => {
   if (!panel.current?.contains(event.target) && !trigger.current?.contains(event.target)) setOpen(false);
  };
  const escape = event => {
   if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
  };
  const moved = event => { if (!panel.current?.contains(event.target)) setOpen(false); };
  document.addEventListener('pointerdown', outside);
  document.addEventListener('keydown', escape);
  window.addEventListener('resize', moved);
  window.addEventListener('scroll', moved, true);
  window.addEventListener('wheel', moved, true);
  return () => {
   document.removeEventListener('pointerdown', outside);
   document.removeEventListener('keydown', escape);
   window.removeEventListener('resize', moved);
   window.removeEventListener('scroll', moved, true);
   window.removeEventListener('wheel', moved, true);
  };
 }, [open]);

 const changeColor = next => {
  emitted.current = next;
  setHsv(previous => toHsv(next, previous.h));
  onChange(next);
 };
 const changeHsv = next => {
  setHsv(next);
  emitted.current = toHex(next);
  onChange(emitted.current);
 };
 const selectPoint = event => {
  const bounds = event.currentTarget.getBoundingClientRect();
  changeHsv({ ...hsv, s: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
   v: 1 - Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) });
 };
 const changeChannel = (index, number) => {
  const next = channels.map((channel, i) => i === index ? Math.max(0, Math.min(255, Math.round(Number(number)))) : channel);
  changeColor('#' + next.map(channel => channel.toString(16).padStart(2, '0')).join(''));
 };
 const sampleColor = async () => {
  try { const result = await new window.EyeDropper().open(); changeColor(result.sRGBHex); }
  catch { /* Cancelling the eyedropper leaves the color unchanged. */ }
 };
 return <>
  <button ref={trigger} type="button" className="palette-color-trigger nodrag nopan"
   aria-label={label} aria-haspopup="dialog" aria-expanded={open} title={value.toUpperCase()}
   disabled={disabled} onClick={() => setOpen(!open)}><span style={{ background: value }}/></button>
  {open && createPortal(<div ref={panel} role="dialog" aria-label="Palette color"
   className="palette-color-popover nodrag nopan nowheel" style={position}
   onPointerDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()}
   onWheel={event => event.stopPropagation()}>
   <div className="palette-color-field" role="group" tabIndex={0} aria-label="Saturation and brightness"
    style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
    onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); selectPoint(event); }}
    onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) selectPoint(event); }}
    onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
    onKeyDown={event => {
     if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
     event.preventDefault(); event.stopPropagation();
     changeHsv({ ...hsv, s: Math.max(0, Math.min(1, hsv.s + (event.key === 'ArrowRight' ? .01 : event.key === 'ArrowLeft' ? -.01 : 0))),
      v: Math.max(0, Math.min(1, hsv.v + (event.key === 'ArrowUp' ? .01 : event.key === 'ArrowDown' ? -.01 : 0))) });
    }}>
    <span className="palette-color-marker" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}/>
   </div>
   <div className="palette-color-controls">
    <div className="palette-color-tools">
     <button type="button" aria-label="Pick color from screen" title="Pick color from screen" disabled={!window.EyeDropper} onClick={sampleColor}>
      <FiEdit3 size={18} />
     </button>
     <span className="palette-color-preview" style={{ background: value }}/>
     <input className="palette-color-hue" type="range" min="0" max="360" aria-label="Hue" value={hsv.h}
      onChange={event => changeHsv({ ...hsv, h: Number(event.target.value) })}/>
    </div>
    <div className="palette-color-channels">
     {['R', 'G', 'B'].map((channel, index) => <label key={channel}>
      <input type="number" min="0" max="255" aria-label={`${channel} channel`} value={channels[index]}
       onChange={event => changeChannel(index, event.target.value)}/><span>{channel}</span>
     </label>)}
    </div>
   </div>
  </div>, document.body)}
 </>;
}
