import { setTokenFetchState } from '../state/token';

function getDirectLineEndpoint(baseTokenUrl: string): string {
  if (typeof window === 'undefined') {
    return baseTokenUrl;
  }
  const override = new URLSearchParams(window.location.search).get('directline');
  return override ? override : baseTokenUrl;
}

export async function fetchDirectLineToken(baseTokenUrl: string): Promise<string> {
  const tokenUrl = getDirectLineEndpoint(baseTokenUrl);
  setTokenFetchState('loading');
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      credentials: 'omit'
    });
    if (!response.ok) {
      throw new Error(`Direct Line token request failed (${response.status})`);
    }
    const payload = await response.json();
    if (!payload || typeof payload.token !== 'string') {
      throw new Error('Token endpoint did not return a token.');
    }
    setTokenFetchState('ok');
    return payload.token;
  } catch (error) {
    setTokenFetchState('error');
    throw error;
  }
}
