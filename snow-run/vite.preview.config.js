import {defineConfig} from 'vite';
import shared from '../vite.config.js';
import {fileURLToPath} from 'node:url';
// Review-only build. No changes to the public site's production entry points.
export default defineConfig({...shared,build:{outDir:'dist-snow-preview',rollupOptions:{input:{snow:fileURLToPath(new URL('./index.html',import.meta.url))}}}});
