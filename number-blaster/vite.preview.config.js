import {defineConfig} from 'vite';
import shared from '../vite.config.js';
import {fileURLToPath} from 'node:url';
export default defineConfig({...shared,base:'/',server:{port:5181,strictPort:true,host:'127.0.0.1'},build:{outDir:'dist-number-preview',rollupOptions:{input:{number:fileURLToPath(new URL('./index.html',import.meta.url))}}}});
