import './style.css';
import { Game } from './game';

const mount = document.getElementById('world');

if (!mount) {
  throw new Error('Missing #world mount point');
}

const game = new Game(mount);

declare global {
  interface Window {
    loveGarden?: Game;
  }
}

window.loveGarden = game;

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const base = import.meta.env.BASE_URL || '/';
  const sendAssetList = (registration: ServiceWorkerRegistration) => {
    const worker = registration.active ?? registration.waiting ?? registration.installing;
    if (!worker) return;
    const urls = performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((url) => url.startsWith(window.location.origin))
      .filter((url) => /\.(js|css|svg|webmanifest)$/i.test(url));
    const manifest = new URL('manifest.webmanifest', window.location.href).href;
    worker.postMessage({ type: 'cache-urls', urls: [...new Set([...urls, manifest])] });
  };

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base })
      .then((registration) => {
        sendAssetList(registration);
        navigator.serviceWorker.ready.then(sendAssetList).catch(() => undefined);
      })
      .catch(() => undefined);
  });
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.dispose();
  });
}