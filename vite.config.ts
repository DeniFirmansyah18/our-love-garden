import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.VITE_BASE || '/',
    server: { host: true },
    build: {
      target: 'es2020',
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks: { three: ['three'] }
        }
      }
    },
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts']
    }
  };
});