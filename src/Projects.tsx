import { useEffect, useRef, useState } from 'react';
import './Projects.css';

type Project = { id: string; name: string; description: string; createdAt: number };
const storageKey = 'cimora.projects.v1';
function loadProjects(): Project[] {
  const data: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(data) || !data.every(p => p && typeof p.id === 'string' && typeof p.name === 'string' && typeof p.description === 'string' && typeof p.createdAt === 'number')) throw new Error('Invalid saved projects');
  return data;
}
function Icon({ name }: { name: 'grid' | 'plus' | 'search' | 'arrow' | 'home' | 'canvas' }) {
  const paths = { grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z', plus: 'M12 5v14 M5 12h14', search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0', arrow: 'M5 12h14 M13 6l6 6-6 6', home: 'M3 10l9-7 9 7 M5 9v12h14V9 M9 21v-8h6v8', canvas: 'M3 4h18v16H3z M3 9h18 M8 9v11' };
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function Projects({ canvas = false }: { canvas?: boolean }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [storageError, setStorageError] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [episodeInfo, setEpisodeInfo] = useState<{ series: string; number: number } | null>(null);
  const createDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const projectId = new URLSearchParams(location.search).get('project');
  const showId = new URLSearchParams(location.search).get('show');
  const episodeId = new URLSearchParams(location.search).get('episode');
  const current = projects.find(p => p.id === (episodeId || projectId));
  useEffect(() => {
    document.title = canvas ? 'Canvas — Cimora Studio' : 'Projects — Cimora Studio';
    try {
      if (canvas && episodeId) {
        const shows = JSON.parse(localStorage.getItem('cimora.anime-shows.v1') || '[]');
        if (!Array.isArray(shows)) throw new Error('Invalid series');
        const show = shows.find(item => item?.id === showId);
        if (show && (typeof show.name !== 'string' || !Array.isArray(show.episodes))) throw new Error('Invalid series');
        const episode = show?.episodes.find((item: { id?: string } | null) => item?.id === episodeId);
        if (episode) {
          if (typeof episode.name !== 'string' || typeof episode.description !== 'string' || !Number.isFinite(episode.createdAt) || !Number.isInteger(episode.number) || episode.number < 1) throw new Error('Invalid episode');
          setProjects([episode]);
          setEpisodeInfo({ series: show.name, number: episode.number });
        }
      } else setProjects(loadProjects());
    } catch { setStorageError('Saved projects could not be read. Please check browser storage before creating a project.'); }
    setLoaded(true);
  }, [canvas, showId, episodeId]);
  function openCreate() { setName(''); setDescription(''); setFormError(''); createDialog.current?.showModal(); }
  function createProject(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) { setFormError('Give your project a name.'); return; }
    try {
      const project = { id: crypto.randomUUID(), name: name.trim(), description: description.trim(), createdAt: Date.now() };
      const next = [project, ...loadProjects()];
      localStorage.setItem(storageKey, JSON.stringify(next));
      setProjects(next); createDialog.current?.close();
    } catch { setFormError('Could not save this project. Check available browser storage and try again.'); }
  }
  const filtered = projects.filter(p => `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : b.createdAt - a.createdAt);
  const latest = [...projects].sort((a,b) => b.createdAt-a.createdAt)[0];
  const canvasUrl = (p: Project) => `/canvas?project=${encodeURIComponent(p.id)}`;

  if (!canvas) return <iframe title="Cimora projects workspace" src="/weather/index.html" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, background: '#04121b' }} />;
  return <div className="projects-page">
    <aside className="projects-sidebar" aria-label="Workspace navigation">
      <a href="/" className="projects-logo" aria-label="Cimora home">C<span>~</span></a>
      <nav><a href="/projects" aria-label="Projects" aria-current={!canvas ? 'page' : undefined}><Icon name="grid" /></a><a href="/showcase" aria-label="Showcase"><Icon name="canvas" /></a><a href="/" aria-label="Home"><Icon name="home" /></a></nav>
      <span className="projects-sidebar-foot">CS</span>
    </aside>
    <header className="projects-header"><div><span>Welcome to your studio</span><strong>{canvas ? current?.name || 'Project canvas' : 'Creator workspace'}</strong></div><div className="projects-tools">{!canvas && <><button aria-label="Create project" onClick={openCreate} disabled={!!storageError}><Icon name="plus" /></button><button aria-label="Search projects" onClick={() => searchInput.current?.focus()}><Icon name="search" /></button></>}<span className="projects-avatar" aria-label="Local preview account">C</span></div></header>
    {canvas ? <main className="canvas-preview">
      <a className="projects-back" href={showId ? `/projects?show=${encodeURIComponent(showId)}` : '/projects'}>{episodeId ? '← My anime show' : '← All projects'}</a>
      {!loaded ? <p>Loading project…</p> : !current ? <div className="projects-empty"><h1>Project not found.</h1><p>{storageError || 'Return to your projects to open an existing workspace.'}</p></div> : <>
        <div className="canvas-preview-toolbar"><span><Icon name="canvas" /> {current.name}</span><small>{episodeInfo ? `${episodeInfo.series} · EP ${String(episodeInfo.number).padStart(2, '0')}` : 'CANVAS PREVIEW'}</small></div>
        <div className="canvas-preview-surface"><div className="canvas-preview-note"><span>01 / YOUR STARTING POINT</span><h1>{current.name}</h1><p>{current.description || 'Every story starts with an idea.'}</p><hr /><small>Your project is ready. Canvas editing and AI creation will be added in the next stage.</small></div></div>
      </>}
    </main> : <main className="projects-main">
      <section className="projects-hero"><span className="projects-chip">CIMORA / PROJECTS</span><h1><span>A new world.</span><span>Starts with you.</span></h1><p>Give your next anime a place to begin.<br />Bring characters, stories, and ideas together in a project.</p><button className="projects-primary" onClick={openCreate} disabled={!!storageError}><Icon name="plus" /> Create project</button></section>
      <aside className="projects-rail"><div className="projects-glass projects-overview"><span>YOUR WORKSPACE</span><strong>{String(projects.length).padStart(2,'0')}<small>projects</small></strong><p>Room for every idea.</p><div className="projects-local"><span /> Saved in this browser</div></div><div className="projects-glass projects-latest"><span>LATEST PROJECT</span>{latest ? <a href={canvasUrl(latest)}><h2>{latest.name}</h2><p>Open your canvas <span>↗</span></p></a> : <><h2>A blank canvas.<br />An open possibility.</h2><p>Create your first project to get started.</p></>}</div><div className="projects-glass projects-tip"><span>LOCAL PREVIEW</span><p>Projects stay on this device. Account sign-in and cloud sync are not connected yet.</p></div></aside>
      <section className="projects-library" aria-labelledby="projects-heading"><div className="projects-library-heading"><h2 id="projects-heading">Your projects <span>{projects.length}</span></h2><div><label className="projects-search"><Icon name="search" /><input ref={searchInput} placeholder="Search projects" aria-label="Search projects" value={query} onChange={e=>setQuery(e.target.value)} /></label><select aria-label="Sort projects" value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">Newest first</option><option value="name">Name A–Z</option></select></div></div>
        {storageError && <p role="alert" className="projects-error">{storageError}</p>}
        {!loaded ? <p>Loading projects…</p> : filtered.length ? <div className="projects-grid">{filtered.map((project,index)=><a className="projects-card projects-glass" key={project.id} href={canvasUrl(project)}><div className="projects-card-art"><span>{String(index+1).padStart(2,'0')}</span><Icon name="canvas" /></div><div className="projects-card-copy"><h3>{project.name}</h3><p>{project.description || 'Your next story starts here.'}</p><div><time>{new Date(project.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</time><Icon name="arrow" /></div></div></a>)}</div> : <div className="projects-empty"><Icon name={query ? 'search' : 'canvas'} /><h3>{query ? 'No matching projects' : 'Your first story is waiting.'}</h3><p>{query ? 'Try another name or clear your search.' : 'Create a project, then open it to enter your canvas.'}</p>{!query && <button onClick={openCreate} disabled={!!storageError}>Create your first project ↗</button>}</div>}
      </section>
    </main>}
    <dialog ref={createDialog} className="projects-dialog" aria-labelledby="create-project-title"><form onSubmit={createProject}><div className="projects-dialog-heading"><span>NEW PROJECT</span><button type="button" aria-label="Close create project" onClick={()=>createDialog.current?.close()}>×</button></div><h2 id="create-project-title">Start something new.</h2><label>Project name<input autoFocus maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder="My next anime" required /></label><label>Description <small>Optional</small><textarea maxLength={500} value={description} onChange={e=>setDescription(e.target.value)} placeholder="A character, a world, a story…" rows={3} /></label>{formError && <p role="alert" className="projects-error">{formError}</p>}<p className="projects-save-note">Saved locally in this browser.</p><button className="projects-primary" type="submit"><Icon name="plus" /> Create project</button></form></dialog>
  </div>;
}
