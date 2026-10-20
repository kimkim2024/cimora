import './ShowcaseFooter.css';

export default function ShowcaseFooter({ onNotice }: { onNotice: (topic: string) => void }) {
  function backToTop(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  return <footer className="site-footer" id="footer">
    <div className="footer-dots" aria-hidden="true"><div className="footer-dots__line" /></div>
    <div className="site-footer__inner">
      <div className="site-footer__top">
        <h2>Imagination.<br />Next anime.<br />Creative studio.</h2>
        <nav className="site-footer__nav" aria-label="Footer navigation">
          <a href="/">Home</a>
          <button onClick={() => onNotice('About Cimora')}>About Cimora</button>
          <button onClick={() => onNotice('Open Studio')}>Open Studio ↗</button>
          <a href="#top" onClick={backToTop}>Back to top ↑</a>
        </nav>
        <nav className="site-footer__nav" aria-label="Explore Cimora">
          <a href="#top" onClick={backToTop}>Creations</a>
          <button onClick={() => onNotice('Agent')}>AI Agents</button>
          <button onClick={() => onNotice('Creative Process')}>Creative Process</button>
          <button onClick={() => onNotice('Studio in Action')}>Studio in Action</button>
        </nav>
        <nav className="site-footer__nav" aria-label="Connect with Cimora">
          <button onClick={() => onNotice('Community')}>Community</button>
          <button onClick={() => onNotice('Discord')}>Discord ↗</button>
          <button onClick={() => onNotice('X')}>Follow us on X ↗</button>
          <button onClick={() => onNotice('Contact')}>Contact Us</button>
        </nav>
      </div>
      <div className="site-footer__brand-row">
        <a className="site-footer__brand" href="/" aria-label="Cimora Studio home">
          <span className="site-footer__mark" aria-hidden="true" /><span className="site-footer__wordmark">Cimora Studio</span>
        </a>
      </div>
      <div className="site-footer__legal">
        <p>© 2026 Cimora Studio. All rights reserved.</p>
        <button onClick={() => onNotice('Privacy Policy')}>Privacy Policy</button>
        <button onClick={() => onNotice('Terms of Use')}>Terms of Use</button>
      </div>
    </div>
  </footer>;
}
