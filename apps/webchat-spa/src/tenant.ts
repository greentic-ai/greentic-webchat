export interface TenantResolution {
  tenant: string;
  isEmbed: boolean;
  segments: string[];
}

export function resolveTenant(pathname: string): TenantResolution {
  const trimmed = pathname.replace(/(^\/+|\/+?$)/g, '');
  const segments = trimmed ? trimmed.split('/') : [];
  const tenant = segments[0] || '_template';
  const isEmbed = segments[1] === 'embed';
  return { tenant, isEmbed, segments };
}
