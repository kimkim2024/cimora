import { useEffect, useState } from 'react';
import WorkflowBuilder from '../vendor/workflow-builder/src/WorkflowBuilder';
import { loadWorkflow } from '../vendor/workflow-builder/src/cimora/transport';
import { previewSchemas } from '../vendor/workflow-builder/src/cimora/schemas';
import { getCanvasContext, backUrl } from '../vendor/workflow-builder/src/cimora/navigation';
import 'reactflow/dist/style.css';
import '../vendor/workflow-builder/canvas-utilities.css';
import './Canvas.css';
import CanvasToolbar from './components/CanvasToolbar';
import './CanvasTheme.css';
import './CanvasFantasyExperiment.css';
import './CanvasMeika.css';

function readCanvas() {
  const query = new URLSearchParams(location.search);
  const project = query.get('project');
  const episode = query.get('episode');
  let name = 'Untitled canvas';
  if (episode) {
    const shows = JSON.parse(localStorage.getItem('cimora.anime-shows.v1') || '[]');
    const show = shows.find((item: { id: string }) => item.id === query.get('show'));
    const item = show?.episodes?.find((item: { id: string }) => item.id === episode);
    if (!item) throw new Error('Episode not found. Open an existing episode from your projects.');
    name = `${show.name} · EP ${item.number} · ${item.name}`;
  } else if (project) {
    const projects = JSON.parse(localStorage.getItem('cimora.projects.v1') || '[]');
    const item = projects.find((item: { id: string }) => item.id === project);
    if (!item) throw new Error('Project not found. Open an existing project from your projects.');
    name = item.name;
  }
  return loadWorkflow(getCanvasContext().id, name);
}

export default function Canvas() {
  const [initial] = useState(() => {
    try { return { data: readCanvas(), error: '' }; }
    catch (error) { return { data: null, error: error instanceof Error ? error.message : 'Could not load this canvas.' }; }
  });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    document.title = 'Canvas — Cimora Studio';
    const update = () => setSaved(true);
    window.addEventListener('cimora:canvas-saved', update);
    return () => window.removeEventListener('cimora:canvas-saved', update);
  }, []);
  return <div id="cimora-canvas" className="canvas-fantasy-experiment canvas-meika mk-theme">
    {initial.error ? <main className="canvas-load-error"><h1>Canvas unavailable</h1><p>{initial.error}</p><a href={backUrl()}>Back to projects</a></main> : <>
      <div className="canvas-status" role="status">Frontend preview · {saved ? 'Last save completed locally' : 'Use Save to keep your changes'} · Generation not connected</div>
      {/* Preview fixture only. Replace with account balance query state; see docs/integration.md. */}
      <CanvasToolbar key={getCanvasContext().id} canvasId={getCanvasContext().id} balance={2388} balanceIsPreview />
      <WorkflowBuilder initialNodeSchemas={previewSchemas} initialWorkflowData={initial.data} />
    </>}
  </div>;
}

