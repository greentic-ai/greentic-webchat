import { z } from 'zod';
import { skinSchema } from '../shared/skin-schema.mjs';

export { skinSchema };

export type Skin = z.infer<typeof skinSchema>;

export interface WebChatStore {
  dispatch: (action: unknown) => unknown;
  getState: () => unknown;
}

export type StoreMiddleware = (store: WebChatStore) => (next: (action: unknown) => unknown) => (action: unknown) => unknown;

export interface WebChatConfig {
  directLine: unknown;
  locale: string;
  styleOptions: Record<string, unknown>;
  adaptiveCardsHostConfig: Record<string, unknown>;
  store?: WebChatStore;
}

export interface WebChatExports {
  createDirectLine: (options: { token: string }) => unknown;
  createStore?: (initialState?: Record<string, unknown>, ...middleware: StoreMiddleware[]) => WebChatStore;
  renderWebChat: (config: WebChatConfig, element: HTMLElement) => void;
}

export interface SkinHookContext {
  tenant: string;
  skin: Skin;
  webchatConfig: WebChatConfig;
}

export interface SkinHooksModule {
  createStoreMiddleware?: () => StoreMiddleware;
  onBeforeRender?: (context: SkinHookContext) => void | Promise<void>;
}

declare global {
  interface Window {
    WebChat?: WebChatExports;
  }
}
