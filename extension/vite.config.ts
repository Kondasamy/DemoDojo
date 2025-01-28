import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import manifest from './manifest.json';

const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, 'src');

// https://vite.dev/config/
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
  plugins: [react(), crx({ manifest })],
});
