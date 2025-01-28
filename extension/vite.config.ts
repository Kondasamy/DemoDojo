import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import manifest from './manifest.json';

const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, 'src');

export default defineConfig({
  resolve: {
    alias: {
      '@': srcDir,
      '@assets': resolve(srcDir, 'assets'),
      '@components': resolve(srcDir, 'components'),
      '@pages': resolve(srcDir, 'pages'),
      '@utils': resolve(srcDir, 'utils'),
      '@hooks': resolve(srcDir, 'hooks'),
      '@types': resolve(srcDir, 'types')
    },
  },
  build: {
    rollupOptions: {
      input: {
        content: resolve(srcDir, 'content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.facadeModuleId?.endsWith('content.ts')) {
            return 'assets/content.js'; // Fixed name for the content script. This refered in Popup.tsx
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
  plugins: [react(), crx({ manifest })],
});