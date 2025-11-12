import { ConnectionDot } from './ConnectionDot';
import { useTokenFetchState } from '../state/token';
import { useWebChatConnectionStatus } from '../state/connection';

type BrandColors = {
  ok?: string;
  warn?: string;
  err?: string;
};

export function StatusBar({ className, brand, show = true }: { className?: string; brand?: BrandColors; show?: boolean }) {
  const connectionStatus = useWebChatConnectionStatus();
  const tokenFetchState = useTokenFetchState();

  if (!show) {
    return null;
  }

  let text = 'Connecting…';
  let kind: 'ok' | 'warn' | 'err' = 'warn';

  if (tokenFetchState === 'error') {
    text = 'Unable to fetch a Direct Line token. Please try again later.';
    kind = 'err';
  } else if (connectionStatus === 'connected') {
    text = 'Connected';
    kind = 'ok';
  } else if (connectionStatus === 'failedToConnect' || connectionStatus === 'expiredToken' || connectionStatus === 'reconnecting') {
    text = 'Disconnected. Reconnecting…';
    kind = 'err';
  }

  return (
    <div className={className ? `${className} status-bar` : 'status-bar'} role="status" aria-live="polite">
      <ConnectionDot kind={kind} brand={brand} />
      <span>{text}</span>
    </div>
  );
}
