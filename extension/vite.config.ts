// vite.config.ts
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
      '@types': resolve(srcDir, 'types'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        content: resolve(srcDir, 'content.ts'),
        main: resolve(srcDir, 'main.tsx'),
        offscreen: resolve(srcDir, 'offscreen.html'), // Include offscreen.html
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.facadeModuleId?.includes('content.ts')) {
            return 'assets/content.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]',
        format: 'es',
        preserveModules: false,
        inlineDynamicImports: false,
      },
    },
    modulePreload: false,
    sourcemap: true,
  },
  plugins: [react(), crx({ manifest })],
});