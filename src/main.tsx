import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Anime from "./Anime";
import Game from "./Game";
import Showcase from "./Showcase";
import Projects from "./Projects";
import SignIn1 from "./components/ui/modern-stunning-sign-in";
import PreviewDebugPanel from "./components/PreviewDebugPanel";
import "./global.css";

const Canvas = React.lazy(() => import('./Canvas'));
const Pricing = React.lazy(() => import('./Pricing'));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PreviewDebugPanel />
    {window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') === '/sign-in' ? (
      <SignIn1 />
    ) : window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') === '/pricing' ? (
      <React.Suspense fallback={<div style={{ minHeight: '100dvh', background: '#c9dfe6' }} />}><Pricing /></React.Suspense>
    ) : window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') === '/canvas' ? (
      <React.Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#04121b', color: '#fff', padding: 32 }}>Loading canvas…</div>}><Canvas /></React.Suspense>
    ) : window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') === '/projects' ? (
      <Projects />
    ) : window.location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "") === "/showcase" ? (
      <Showcase />
    ) : window.location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "") === "/anime" ? (
      <Anime />
    ) : ["/game", "/reference-operators.html"].includes(
        window.location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, ""),
      ) ? (
      <Game />
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
