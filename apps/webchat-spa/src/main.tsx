import { StrictMode, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import { prepareExperience, PreparedExperience, resolvePublicUrl } from './bootstrap';
import { StatusBar } from './components/StatusBar';

interface LoadingState {
  status: 'loading';
}

interface ReadyState {
  status: 'ready';
  data: PreparedExperience;
}

interface ErrorState {
  status: 'error';
  message: string;
}

type AppState = LoadingState | ReadyState | ErrorState;
const MISSING_TEMPLATE_FALLBACK = '<p>Missing full-page template.</p>';
const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

function isSafeUrl(value: string) {
  try {
    const parsed = new URL(value, window.location.origin);
    return SAFE_URL_PROTOCOLS.has(parsed.protocol);
  } catch (_error) {
    // Treat relative URLs as safe.
    return value.startsWith('/') || value.startsWith('./') || value.startsWith('../');
  }
}

function sanitizeShellHtml(html: string | undefined) {
  if (!html) {
    return MISSING_TEMPLATE_FALLBACK;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const disallowedTags = ['script', 'style', 'link', 'meta', 'object', 'embed', 'applet', 'iframe', 'frame', 'frameset', 'noscript'];
  disallowedTags.forEach((tag) => doc.querySelectorAll(tag).forEach((el) => el.remove()));

  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  const elements: Element[] = [];
  while (walker.nextNode()) {
    elements.push(walker.currentNode as Element);
  }

  elements.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
        return;
      }
      if (name === 'style') {
        el.removeAttribute(attr.name);
        return;
      }
      if (['href', 'src', 'srcset', 'action', 'formaction', 'poster', 'data', 'xlink:href'].includes(name)) {
        if (name === 'srcset') {
          const sources = value.split(',').map((entry) => entry.trim().split(/\s+/)[0]);
          if (sources.some((source) => !isSafeUrl(source))) {
            el.removeAttribute(attr.name);
          }
          return;
        }
        if (!isSafeUrl(value)) {
          el.removeAttribute(attr.name);
        }
        return;
      }
      if (/^javascript:/i.test(value)) {
        el.removeAttribute(attr.name);
      }
    });
  });

  const sanitized = doc.body.innerHTML.trim();
  return sanitized || MISSING_TEMPLATE_FALLBACK;
}

const App = () => {
  const [state, setState] = useState<AppState>({ status: 'loading' });
  const hasRendered = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await prepareExperience();
        if (!cancelled) {
          hasRendered.current = false;
          setState({ status: 'ready', data });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: (error as Error).message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'ready') {
      return;
    }
    const mount = document.getElementById('webchat');
    if (!mount) {
      setState({ status: 'error', message: 'WebChat mount node not found in the DOM.' });
      return;
    }
    if (hasRendered.current) {
      return;
    }
    state.data
      .renderWebChat(mount)
      .then(() => {
        hasRendered.current = true;
      })
      .catch((error) => {
        setState({ status: 'error', message: (error as Error).message });
      });
  }, [state]);

  if (state.status === 'loading') {
    return (
      <div className="status-card">
        <p>Loading tenant experience…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="status-card">
        <div className="error-message">
          <h1>Something went wrong</h1>
          <p>{state.message}</p>
          <p>Check the browser console for more details.</p>
        </div>
      </div>
    );
  }

  if (state.data.mode === 'fullpage') {
    return (
      <div className="fullpage-shell">
        <StatusBar
          brand={state.data.skin.statusBar?.brand}
          className="fullpage-status"
          show={state.data.skin.statusBar?.show}
        />
        <div
          className="fullpage-shell-content"
          dangerouslySetInnerHTML={{ __html: sanitizeShellHtml(state.data.shellHtml) }}
        />
      </div>
    );
  }

  const { skin } = state.data;
  const logoUrl = resolvePublicUrl(skin.brand.logo);

  return (
    <div className="widget-frame">
      <div className="widget-card">
        <div className="widget-meta">
          <img src={logoUrl} alt={`${skin.brand.name} logo`} />
          <div>
            <p>{skin.brand.name}</p>
            <small>Locale: {skin.webchat.locale}</small>
          </div>
        </div>
        <StatusBar brand={skin.statusBar?.brand} className="widget-status" show={skin.statusBar?.show} />
        <div id="webchat" className="widget-surface" aria-live="polite" />
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
