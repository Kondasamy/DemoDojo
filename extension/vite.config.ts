import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    plugins: [
        react() as PluginOption,
        {
            name: 'copy-files',
            buildEnd() {
                // Copy manifest.json
                this.emitFile({
                    type: 'asset',
                    fileName: 'manifest.json',
                    source: fs.readFileSync('manifest.json', 'utf-8')
                });

                // Copy icons
                const iconsDir = 'icons';
                if (fs.existsSync(iconsDir)) {
                    const icons = fs.readdirSync(iconsDir);
                    icons.forEach(icon => {
                        this.emitFile({
                            type: 'asset',
                            fileName: `icons/${icon}`,
                            source: fs.readFileSync(path.join(iconsDir, icon))
                        });
                    });
                }
            }
        }
    ],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'popup.html'),
                background: resolve(__dirname, 'src/background.ts'),
                content: resolve(__dirname, 'src/content.ts'),
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    return chunkInfo.name === 'background' || chunkInfo.name === 'content'
                        ? '[name].js'
                        : 'assets/[name].js';
                },
                chunkFileNames: 'assets/[name].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') return 'assets/style.css';
                    if (assetInfo.name?.endsWith('.png') || assetInfo.name?.endsWith('.svg')) return assetInfo.name;
                    return 'assets/[name][extname]';
                }
            }
        },
        outDir: 'dist',
        assetsDir: 'assets',
        cssCodeSplit: false,
        minify: false
    }
}); 