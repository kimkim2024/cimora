import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import SignIn1 from './ui/modern-stunning-sign-in';
import './SiteNavigation.css';

export default function SiteNavigation() {
  const [selected, setSelected] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState(0);
  const [notice, setNotice] = useState('');
  const [position, setPosition] = useState<CSSProperties>({});
  const root = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const authDialog = useRef<HTMLDialogElement>(null);
  const loginButton = useRef<HTMLButtonElement>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastSelected = useRef(0);
  const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';

  function open(index: number) {
    clearTimeout(closeTimer.current);
    clearTimeout(exitTimer.current);
    setDirection(selected === null ? 0 : index > selected ? 70 : -70);
    lastSelected.current = index;
    setSelected(index);
    setVisible(true);
  }
  function close(restoreFocus = false) {
    clearTimeout(closeTimer.current);
    clearTimeout(exitTimer.current);
    setSelected(null);
    if (restoreFocus) tabs.current[lastSelected.current]?.focus();
    exitTimer.current = setTimeout(() => setVisible(false), 160);
  }
  function showNotice(topic: string) {
    close();
    setNotice(topic);
    dialog.current?.showModal();
  }
  function onKey(event: KeyboardEvent, index: number) {
    if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey && selected === index)) {
      event.preventDefault();
      open(index);
      requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>('a,button')?.focus());
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = (index + 1) % 2;
      tabs.current[next]?.focus();
      open(next);
    }
  }
  useLayoutEffect(() => {
    if (selected === null) return;
    function place() {
      const bounds = nav.current!.getBoundingClientRect();
      const tab = tabs.current[selected!]!.getBoundingClientRect();
      const width = Math.min(384, innerWidth - 32);
      const left = Math.max(16, Math.min(bounds.left, innerWidth - width - 16));
      setPosition({ left, top: bounds.bottom + 24, width, '--nub-left': `${Math.max(16, Math.min(width - 16, tab.left + tab.width / 2 - left))}px` } as CSSProperties);
    }
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [selected]);
  useEffect(() => {
    if (selected === null) return;
    const outside = (event: Event) => { if (!root.current?.contains(event.target as Node)) close(); };
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); close(true); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [selected]);
  useEffect(() => () => { clearTimeout(closeTimer.current); clearTimeout(exitTimer.current); }, []);
  useEffect(() => {
    if (!authOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    authDialog.current?.showModal();
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      authDialog.current?.close();
    };
  }, [authOpen]);

  const active = selected ?? lastSelected.current;
  return <div className="cimora-navigation" ref={root}>
    <nav className="cimora-nav" ref={nav} aria-label="Main navigation"
      onPointerEnter={() => clearTimeout(closeTimer.current)}
      onPointerLeave={event => { if (event.pointerType === 'mouse') closeTimer.current = setTimeout(() => close(), 150); }}>
      <a href="/" aria-current={path === '/' ? 'page' : undefined} onPointerEnter={() => close()} onFocus={() => close()}>Home</a>
      <a href="/showcase" ref={el => { tabs.current[0] = el; }} aria-current={path === '/showcase' ? 'page' : undefined}
        aria-expanded={selected === 0} aria-controls="site-nav-panel" onPointerEnter={event => { if (event.pointerType === 'mouse') open(0); }} onClick={() => close()} onKeyDown={event => onKey(event, 0)}>
        Showcase <span className="shift-chevron" aria-hidden="true">⌄</span>
      </a>
      <button type="button" ref={el => { tabs.current[1] = el; }} aria-expanded={selected === 1} aria-controls="site-nav-panel"
        onPointerEnter={event => { if (event.pointerType === 'mouse') open(1); }} onClick={() => open(1)} onKeyDown={event => onKey(event, 1)}>
        Agent <span className="shift-chevron" aria-hidden="true">⌄</span>
      </button>
      <a href="/pricing" aria-current={path === '/pricing' ? 'page' : undefined} onPointerEnter={() => close()} onFocus={() => close()}>Pricing</a>
      <button type="button" ref={loginButton} aria-haspopup="dialog" onClick={() => { close(); setAuthOpen(true); }}>Log in</button>
    </nav>
    <div id="site-nav-panel" ref={panel} hidden={!visible} inert={selected === null} className={`cimora-nav-panel${selected === null ? ' shift-closing' : ''}`} style={position}
      onPointerEnter={() => clearTimeout(closeTimer.current)} onPointerLeave={event => { if (event.pointerType === 'mouse') closeTimer.current = setTimeout(() => close(), 150); }}>
      <span className="shift-nub" aria-hidden="true" />
      <div className="shift-viewport"><div className="shift-content shift-feature" key={active} style={{ '--shift-direction': `${direction}px` } as CSSProperties}>
        <span className="shift-kicker">CIMORA {active === 0 ? 'SHOWCASE' : 'AGENT'}</span>
        <h3>{active === 0 ? 'Every style. A different story.' : 'Meet your creative team.'}</h3>
        <p>{active === 0 ? 'Explore anime styles and find your next creative direction.' : 'Discover the AI agents behind your next anime. Full introduction coming soon.'}</p>
        {active === 0 ? <a href="/showcase">Explore showcase <span>→</span></a> : <button onClick={() => showNotice('Agent')}>Explore agents <span>→</span></button>}
      </div></div>
    </div>
    <dialog className="cimora-auth-dialog" ref={authDialog} aria-label="Sign in to Cimora Studio"
      onClose={() => { setAuthOpen(false); loginButton.current?.focus(); }}
      onClick={event => { if (event.target === event.currentTarget) authDialog.current?.close(); }}>
      {authOpen && <SignIn1 onClose={() => authDialog.current?.close()} />}
    </dialog>
    <dialog className="cimora-nav-dialog" ref={dialog} aria-labelledby="site-nav-notice">
      <button autoFocus onClick={() => dialog.current?.close()}>Close ×</button><p>CIMORA STUDIO</p>
      <h2 id="site-nav-notice">{notice === 'Log in' ? 'LOG IN / SIGN UP' : notice}</h2>
      <p>{notice === 'Log in' ? 'Account access is not connected to this preview yet.' : 'Meet the Cimora AI agents. Full introduction coming soon.'}</p>
      {notice === 'Log in' && <p><a href="/projects">Preview the project workspace ↗</a></p>}
    </dialog>
  </div>;
}
