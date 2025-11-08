import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoBase = '/greentic-webchat/';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  return {
    base: isDev ? '/' : repoBase,
    plugins: [react()],
    build: {
      sourcemap: !isDev
    },
    server: {
      port: 5173,
      open: false
    }
  };
});
