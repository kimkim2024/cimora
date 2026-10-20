import { useEffect, useRef, useState } from 'react';
import './Showcase.css';
import portraits from './data/showcasePortraits.json';
import ShowcaseFooter from './components/ShowcaseFooter';
import SiteNavigation from './components/SiteNavigation';

// Reference posters are replaced by original films when showcase assets arrive.
export const showcaseFilms = portraits.map(film => ({ ...film, video: '' }));

export default function Showcase() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState('');
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const slide = showcaseFilms[active];

  useEffect(() => { document.title = 'Showcase — Cimora Studio'; }, []);
  useEffect(() => {
    const current = videos.current[active];
    videos.current.forEach((video, i) => { if (video && i !== active) video.pause(); });
    if (!current) return;
    current.currentTime = 0;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void current.play().catch(() => { /* The play control remains available if autoplay is blocked. */ });
    }
    return () => current.pause();
  }, [active]);

  function showNotice(topic: string) { setNotice(topic); dialog.current?.showModal(); }
  function select(index: number) { if (index === active) return; setError(false); setPlaying(false); setActive(index); }
  function togglePlay() {
    const video = videos.current[active];
    if (!video) return;
    if (video.paused) void video.play().catch(() => setError(true)); else video.pause();
  }

  return <><SiteNavigation /><section className="showcase-page" aria-label="Anime film showcase">
    <div className="showcase-media" aria-hidden="true">
      {showcaseFilms.map((film, index) => film.video ? <video key={film.id} ref={el => { videos.current[index] = el; }}
        className={index === active ? 'is-active' : ''} src={film.video}
        poster={film.poster || undefined} muted={index === active ? muted : true} loop playsInline preload="none" tabIndex={-1}
        onPlay={() => { if (index === active) setPlaying(true); }} onPause={() => { if (index === active) setPlaying(false); }}
        onError={() => { if (index === active) setError(true); }} /> : <img key={film.id} className={index === active ? 'is-active' : ''} src={film.poster} alt="" />)}
    </div>
    <div className="showcase-shade" />
    <div className="showcase-content">
      <div className="showcase-intro">
        <div><a className="showcase-home" href="/">CIMORA STUDIO / SHOWCASE</a><h1>Every style.<br />A different story.</h1></div>
        <div className="showcase-description" key={slide.id}><p>{slide.description}</p><small>Style reference · Existing film artwork.<br /><a href={slide.source} target="_blank" rel="noopener noreferrer">Poster source ↗</a></small></div>
      </div>
      <div className="showcase-bottom">
        <div className="showcase-picker" aria-label="Choose an anime style">
          {showcaseFilms.map((film, index) => <button key={film.id} aria-label={`Show ${film.style}`} aria-pressed={index === active} title={film.style} onClick={() => select(index)}>
            <span className="showcase-dot" /><span className="showcase-avatar">{film.avatar ? <img src={film.avatar} alt="" /> : <svg viewBox="0 0 56 56" aria-hidden="true"><rect width="56" height="56" fill="#424242" /><circle cx="28" cy="21" r="10" fill="#b5b5b5" /><ellipse cx="28" cy="55" rx="22" ry="21" fill="#b5b5b5" /></svg>}</span>
          </button>)}
        </div>
        <div className="showcase-meta">
          <div className="showcase-film" key={slide.id}><span>{slide.name}</span><small>{slide.style}</small></div>
          <span className="showcase-count">{String(active + 1).padStart(2, '0')} / {String(showcaseFilms.length).padStart(2, '0')} — STYLE PREVIEW</span>
          {slide.video && <div className="showcase-controls"><button onClick={togglePlay}>{playing ? 'Pause' : 'Play'}</button><button aria-pressed={!muted} onClick={() => setMuted(!muted)}>{muted ? 'Sound off' : 'Sound on'}</button></div>}
        </div>
        {error && <p className="showcase-error" role="status">The preview could not play. Try Play again.</p>}
      </div>
    </div>
    <dialog className="showcase-dialog" ref={dialog} aria-labelledby="showcase-notice"><button autoFocus onClick={() => dialog.current?.close()}>Close ×</button><h2 id="showcase-notice">{notice}</h2><p>This destination is coming soon.</p>{notice === 'Log in' && <p><a href="/projects">Preview the project workspace ↗</a></p>}</dialog>
  </section><ShowcaseFooter onNotice={showNotice} /></>;
}
