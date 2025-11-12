import { useSyncExternalStore } from 'react';

export type TokenFetchState = 'idle' | 'loading' | 'ok' | 'error';

let currentState: TokenFetchState = 'idle';
const tokenListeners = new Set<(state: TokenFetchState) => void>();

export function setTokenFetchState(state: TokenFetchState) {
  if (state === currentState) {
    return;
  }
  currentState = state;
  tokenListeners.forEach((listener) => listener(currentState));
}

export function useTokenFetchState(): TokenFetchState {
  return useSyncExternalStore(
    (listener) => {
      tokenListeners.add(listener);
      return () => tokenListeners.delete(listener);
    },
    () => currentState,
    () => currentState
  );
}
