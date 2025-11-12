type Kind = 'ok' | 'warn' | 'err';

type BrandColors = {
  ok?: string;
  warn?: string;
  err?: string;
};

const DEFAULT_COLORS: Record<Kind, string> = {
  ok: '#22c55e',
  warn: '#f59e0b',
  err: '#ef4444'
};

export function ConnectionDot({ kind, brand }: { kind: Kind; brand?: BrandColors }) {
  const style = {
    backgroundColor: brand?.[kind] ?? DEFAULT_COLORS[kind]
  };

  return <span className="connection-dot" aria-hidden="true" style={style} />;
}
