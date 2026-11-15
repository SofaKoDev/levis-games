import { defineConfig } from 'vite';
export default defineConfig({
  base: process.env.PAGES_BASE_PATH || '/',
  server:{port:5173,strictPort:true,watch:{ignored:['**/.pnpm-store/**'],usePolling:true}},
  preview:{port:4173,strictPort:true},
  test:{environment:'node',pool:'threads',maxWorkers:1},
});
