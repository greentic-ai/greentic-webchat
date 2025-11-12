(function () {
  const KNOWN_REPO_SLUGS = new Set(['greentic-webchat']);

  function getPathSegments() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const segments = parts.slice();
    const host = window.location.hostname;
    if (host.endsWith('github.io') && segments.length && KNOWN_REPO_SLUGS.has(segments[0])) {
      segments.shift();
    }
    return segments.filter((segment) => segment && !/^index\.html?$/i.test(segment));
  }

  function resolveTenant() {
    const qs = new URLSearchParams(window.location.search);
    const fromQuery = qs.get('tenant');
    if (fromQuery) {
      return fromQuery.trim();
    }

    const fromAttr = (document.documentElement.getAttribute('data-tenant') || '').trim();
    if (fromAttr) {
      return fromAttr;
    }

    const segments = getPathSegments();
    return segments[0] || '_template';
  }

  function ensureTrailingSlash(input) {
    if (!input) {
      return '/';
    }
    return input.endsWith('/') ? input : `${input}/`;
  }

  function resolveBasePath() {
    const baseTag = document.querySelector('base');
    if (baseTag) {
      const href = baseTag.getAttribute('href');
      if (href) {
        return ensureTrailingSlash(href);
      }
    }

    const host = window.location.hostname;
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (host.endsWith('github.io') && segments.length) {
      return ensureTrailingSlash(`/${segments[0]}`);
    }

    return '/';
  }

  function injectSkinError(html) {
    const target = document.getElementById('skin-error');
    if (target && target.insertAdjacentHTML) {
      target.insertAdjacentHTML('afterbegin', html);
      return;
    }

    function write() {
      if (document.body) {
        document.body.insertAdjacentHTML('afterbegin', html);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', write, { once: true });
    } else {
      write();
    }
  }

  function initGlobals() {
    if (!window.__TENANT__) {
      window.__TENANT__ = resolveTenant();
    }
    if (!window.__BASE_PATH__) {
      window.__BASE_PATH__ = ensureTrailingSlash(resolveBasePath());
    }
  }

  initGlobals();

  window.__loadSkin__ = async function loadSkin() {
    const tenant = window.__TENANT__ || resolveTenant();
    const base = ensureTrailingSlash(window.__BASE_PATH__ || resolveBasePath());
    const url = `${base}skins/${encodeURIComponent(tenant)}/skin.json`;
    try {
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const skin = await res.json();
      window.__SKIN__ = skin;
      console.info('[webchat] skin loaded:', tenant, url);
      return skin;
    } catch (err) {
      console.error(`[webchat] Unable to load skin for tenant "${tenant}" from "${url}"`, err);
      injectSkinError(
        `<div style="background:#fee2e2;color:#7f1d1d;padding:12px;border-radius:8px;margin:8px 0;">` +
          `Something went wrong — Unable to load skin for tenant <b>${tenant}</b>.` +
          `<div style="opacity:.8;font-size:12px">Base path: ${base}</div>` +
          `</div>`
      );
      throw err;
    }
  };
})();
