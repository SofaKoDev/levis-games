import {defineConfig} from 'vite';
import shared from '../vite.config.js';
import {fileURLToPath} from 'node:url';
export default defineConfig({...shared,base:'/',server:{port:5182,strictPort:true,host:'0.0.0.0'},build:{outDir:'dist-monsters-preview',rollupOptions:{input:{monsters:fileURLToPath(new URL('./index.html',import.meta.url))}}}});
