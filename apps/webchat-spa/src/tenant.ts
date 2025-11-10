const KNOWN_REPO_SLUGS = new Set(['greentic-webchat']);

export interface TenantResolution {
  tenant: string;
  isEmbed: boolean;
  segments: string[];
}

export function resolveTenant(pathname: string): TenantResolution {
  const segments = normalizeSegments(pathname);
  const explicitTenant =
    typeof window !== 'undefined' && window.__TENANT__ ? window.__TENANT__.trim() : undefined;
  const tenant = explicitTenant || segments[0] || '_template';
  const isEmbed = segments[1] === 'embed';
  return { tenant, isEmbed, segments };
}

function normalizeSegments(pathname: string): string[] {
  const trimmed = pathname.replace(/(^\/+|\/+?$)/g, '');
  let segments = trimmed ? trimmed.split('/') : [];

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.endsWith('github.io') && segments.length && KNOWN_REPO_SLUGS.has(segments[0])) {
      segments = segments.slice(1);
    }
  }

  return segments.filter((segment) => segment && !/^index\.html?$/i.test(segment));
}
