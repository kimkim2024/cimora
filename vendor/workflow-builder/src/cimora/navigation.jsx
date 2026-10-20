/* eslint-disable react/only-export-components -- Compatibility exports for the vendored Next.js components. */
import React from 'react';

export function getCanvasContext() {
  const query = new URLSearchParams(location.search);
  return { id: query.has('episode') ? `episode:${query.get('show')}:${query.get('episode')}` : `project:${query.get('project') || 'sandbox'}` };
}
export function backUrl() {
  const show = new URLSearchParams(location.search).get('show');
  return show ? `/projects?show=${encodeURIComponent(show)}` : '/projects';
}
export function Link(props) { return <a {...props} />; }
export function Image({ fill: _fill, unoptimized: _unoptimized, priority: _priority, loader: _loader, quality: _quality, ...props }) { return <img {...props} />; }
