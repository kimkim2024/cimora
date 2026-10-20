import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

function pageRoutes(): Plugin {
  const middleware = (req: IncomingMessage, _res: ServerResponse, next: () => void) => {
    const url = new URL(req.url || '/', 'http://localhost');
    if (/^\/(sign-in|showcase|pricing|projects|canvas|anime|game|meika)\/?$/.test(url.pathname)) {
      req.url = url.pathname.replace(/\/$/, '') + '/index.html' + url.search;
    }
    next();
  };
  return {
    name: 'page-routes',
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [pageRoutes(), react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        signIn: "sign-in/index.html",
        showcase: "showcase/index.html",
        pricing: "pricing/index.html",
        projects: "projects/index.html",
        canvas: "canvas/index.html",
        anime: "anime/index.html",
        game: "game/index.html",
        gameReference: "reference-operators.html",
        meika: "meika/index.html",
      },
    },
  },
});
