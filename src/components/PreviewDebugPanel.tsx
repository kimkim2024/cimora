import { createPortal } from 'react-dom';
import './PreviewDebugPanel.css';

const pages = [
  { href: '/', label: '首页', detail: 'Homepage' },
  { href: '/showcase', label: '作品展示', detail: 'Showcase' },
  { href: '/projects', label: '注册后项目页', detail: 'Projects · 免登录' },
  { href: '/canvas', label: '画布入口', detail: 'Canvas' },
];

export default function PreviewDebugPanel() {
  if (!import.meta.env.DEV) return null;
  const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';

  return createPortal(
    <details className="preview-debug" onKeyDown={event => {
      if (event.key === 'Escape') {
        event.currentTarget.open = false;
        event.currentTarget.querySelector('summary')?.focus();
      }
    }}>
      <summary>调试台 <span aria-hidden="true">↗</span></summary>
      <nav className="preview-debug-panel" aria-label="预览页面快捷跳转">
        <p>页面预览 <span>DEV</span></p>
        {pages.map(page => <a key={page.href} href={page.href} aria-current={path === page.href ? 'page' : undefined}>
          <strong>{page.label}</strong><small>{page.detail}</small>
        </a>)}
        <footer>仅开发预览显示，无需登录。</footer>
      </nav>
    </details>,
    document.body,
  );
}
