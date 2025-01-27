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
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
        outDir: 'dist',
    },
}); 