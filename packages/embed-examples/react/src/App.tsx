import { useEffect, useRef, useState } from 'react';

const WEBCHAT_SITE = import.meta.env.VITE_WEBCHAT_SITE ?? 'https://<your-org>.github.io/greentic-webchat';
const WEBCHAT_SCRIPT = 'https://cdn.botframework.com/botframework-webchat/latest/webchat.js';

declare global {
  interface Window {
    WebChat?: any;
  }
}

interface Skin {
  tenant: string;
  brand: { name: string; logo: string };
  webchat: { locale: string; styleOptions: string; adaptiveCardsHostConfig: string };
  directLine: { tokenUrl: string };
}

async function ensureScript() {
  if (window.WebChat) {
    return window.WebChat;
  }
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = WEBCHAT_SCRIPT;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
  return window.WebChat!;
}

async function loadTenant(tenant: string) {
  const skin = (await fetch(`${WEBCHAT_SITE}/skins/${tenant}/skin.json`).then((res) => res.json())) as Skin;
  const [token, styleOptions, hostConfig] = await Promise.all([
    fetch(skin.directLine.tokenUrl).then((res) => res.json()).then((json) => json.token as string),
    fetch(`${WEBCHAT_SITE}${skin.webchat.styleOptions}`).then((res) => res.json()),
    fetch(`${WEBCHAT_SITE}${skin.webchat.adaptiveCardsHostConfig}`).then((res) => res.json())
  ]);
  return { skin, token, styleOptions, hostConfig };
}

const WebChatEmbed = ({ tenant }: { tenant: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    (async () => {
      try {
        const [webchat, context] = await Promise.all([ensureScript(), loadTenant(tenant)]);
        if (cancelled || !containerRef.current) {
          return;
        }
        const directLine = webchat.createDirectLine({ token: context.token });
        webchat.renderWebChat(
          {
            directLine,
            locale: context.skin.webchat.locale,
            styleOptions: context.styleOptions,
            adaptiveCardsHostConfig: context.hostConfig
          },
          containerRef.current
        );
        setStatus('ready');
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError((err as Error).message);
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tenant]);

  return (
    <section>
      <h2>Tenant: {tenant}</h2>
      {status === 'loading' && <p>Booting WebChat…</p>}
      {error && <p style={{ color: '#ba1b1d' }}>{error}</p>}
      <div ref={containerRef} style={{ minHeight: 480, border: '1px solid #d0d0d0', borderRadius: 16 }} />
    </section>
  );
};

export function App() {
  const [tenant, setTenant] = useState('customera');
  return (
    <main style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
      <h1>React embed</h1>
      <label>
        Tenant
        <select value={tenant} onChange={(event) => setTenant(event.target.value)}>
          <option value="customera">Customer A</option>
          <option value="customerb">Customer B</option>
          <option value="customerc">Customer C</option>
        </select>
      </label>
      <WebChatEmbed tenant={tenant} />
    </main>
  );
}
