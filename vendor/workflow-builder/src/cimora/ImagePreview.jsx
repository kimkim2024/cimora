import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from '../../../../src/components/meika/CanvasIcons';

export default function ImagePreview({ src, name, onClose }) {
 const dialog = useRef(null);
 useEffect(() => {
  const previousFocus = document.activeElement;
  dialog.current.showModal();
  return () => { previousFocus?.focus?.(); };
 }, []);
 return createPortal(
  <dialog ref={dialog} className="canvas-image-preview" aria-label={`${name} preview`}
   onCancel={event => { event.preventDefault(); onClose(); }}
   onClick={event => { event.stopPropagation(); if (event.target === event.currentTarget) onClose(); }}
   onPointerDown={event => event.stopPropagation()}
   onKeyDown={event => event.stopPropagation()}>
   <button type="button" className="image-preview-close" aria-label="Close image preview" autoFocus onClick={onClose}><FiX /></button>
   <img src={src} alt={name} draggable={false} />
  </dialog>, document.getElementById('cimora-canvas')
 );
}
