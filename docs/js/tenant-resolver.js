(function () {
  function resolveTenant() {
    const qs = new URLSearchParams(location.search);
    const q = qs.get("tenant");
    if (q) return q;

    const a = document.documentElement?.dataset?.tenant;
    if (a) return a;

    const host = location.hostname;
    const segs = location.pathname.split("/").filter(Boolean);
    const IGNORE = new Set(["greentic-webchat"]);
    if (host.endsWith("github.io") && segs.length && IGNORE.has(segs[0])) segs.shift();
    const cleaned = segs.filter(s => !/^index\.html?$/i.test(s));
    return cleaned[0] || "demo";
  }
  function resolveBasePath() {
    const baseTag = document.querySelector("base")?.getAttribute("href");
    if (baseTag) return baseTag;
    const host = location.hostname;
    const segs = location.pathname.split("/").filter(Boolean);
    let base = "/";
    if (host.endsWith("github.io") && segs.length) base = `/${segs[0]}/`;
    return base;
  }
  function sanitizeTenantName(name) {
    return (
      String(name || "")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .substring(0, 64) || "demo"
    );
  }
  if (!window.__TENANT__) window.__TENANT__ = resolveTenant();
  if (!window.__BASE_PATH__) window.__BASE_PATH__ = resolveBasePath();
  window.__loadSkin__ = async function () {
    const tenant = window.__TENANT__;
    const safeTenant = sanitizeTenantName(tenant);
    const base = window.__BASE_PATH__;
    const url = `${base}skins/${encodeURIComponent(safeTenant)}.json`;
    try {
      const res = await fetch(url, { credentials: "omit" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const skin = await res.json();
      window.__SKIN__ = skin;
      return skin;
    } catch (err) {
      console.error("[webchat] Unable to load skin", { tenant: safeTenant, url, error: err });
      window.__SKIN__ = { theme: "default", brand: { name: safeTenant } };
      return window.__SKIN__;
    }
  };
})();
