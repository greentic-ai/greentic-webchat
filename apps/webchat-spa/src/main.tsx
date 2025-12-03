import { StrictMode, useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
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

function sanitizeShellHtml(html: string | undefined) {
  const clean = DOMPurify.sanitize(html || MISSING_TEMPLATE_FALLBACK, {
    USE_PROFILES: { html: true },
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|\.{1,2}\/)/i
  });
  return clean || MISSING_TEMPLATE_FALLBACK;
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
