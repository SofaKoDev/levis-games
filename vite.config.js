import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const entry = path => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  base: process.env.PAGES_BASE_PATH || '/',
  build:{rollupOptions:{input:{sound:entry('./sound-lab/index.html'),snow:entry('./snow-run/index.html'),christmas:entry('./christmas-tree/index.html'),home:entry('./index.html'),colorLab:entry('./color-lab/index.html'),smoothieStation:entry('./smoothie-station/index.html')}}},
  server:{port:5173,strictPort:true,watch:{ignored:['**/.pnpm-store/**'],usePolling:true}},
  preview:{port:4173,strictPort:true},
  test:{environment:'node',pool:'threads',maxWorkers:1},
});
