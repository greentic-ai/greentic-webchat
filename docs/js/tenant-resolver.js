(function () {
  function resolveTenant() {
    const qs = new URLSearchParams(location.search);
    const fromQuery = qs.get('tenant');
    if (fromQuery) return fromQuery;

    const fromAttr = document.documentElement?.dataset?.tenant;
    if (fromAttr) return fromAttr;

    const host = location.hostname;
    const segs = location.pathname.split('/').filter(Boolean);
    const IGNORE = new Set(['greentic-webchat']);

    if (host.endsWith('github.io') && segs.length && IGNORE.has(segs[0])) {
      segs.shift();
    }

    const cleaned = segs.filter((s) => !/^index\.html?$/i.test(s));
    return cleaned[0] || 'demo';
  }

  function resolveBasePath() {
    const baseTag = document.querySelector('base')?.getAttribute('href');
    if (baseTag) return baseTag;

    const host = location.hostname;
    const segs = location.pathname.split('/').filter(Boolean);
    let base = '/';

    if (host.endsWith('github.io') && segs.length) {
      base = `/${segs[0]}/`;
    }

    return base.endsWith('/') ? base : `${base}/`;
  }

  if (!window.__TENANT__) window.__TENANT__ = resolveTenant();
  if (!window.__BASE_PATH__) window.__BASE_PATH__ = resolveBasePath();

  window.__loadSkin__ = async function loadSkin() {
    const tenant = window.__TENANT__;
    const base = window.__BASE_PATH__ || '/';
    const url = `${base}skins/${encodeURIComponent(tenant)}.json`;
    console.info('[webchat] resolve:', { tenant, base, url });

    try {
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const skin = await res.json();
      window.__SKIN__ = skin;
      return skin;
    } catch (err) {
      console.error(`[webchat] Unable to load skin for tenant "${tenant}" from "${url}"`, err);
      const fallback = { theme: 'default', brand: { name: tenant } };
      window.__SKIN__ = fallback;
      const host = document.getElementById('skin-error') || document.body;
      host.insertAdjacentHTML(
        'afterbegin',
        `<div style="background:#fee2e2;color:#7f1d1d;padding:12px;border-radius:8px;margin:8px 0;">` +
          `Unable to load skin for "<b>${tenant}</b>". Base: ${base}` +
          `</div>`
      );
      return fallback;
    }
  };
})();
