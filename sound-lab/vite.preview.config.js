import {defineConfig} from 'vite';
import shared from '../vite.config.js';
import {fileURLToPath} from 'node:url';
import {mkdirSync,copyFileSync} from 'node:fs';
const copyReviewDocs={name:'local-review-docs',closeBundle(){const output=new URL('../dist-sound-preview/sound-lab/',import.meta.url);mkdirSync(output,{recursive:true});for(const file of ['WORD-INVENTORY.md','AUDIO-REVIEW.md'])copyFileSync(new URL(file,import.meta.url),new URL(file,output));}};
export default defineConfig({...shared,plugins:[copyReviewDocs],build:{outDir:'dist-sound-preview',rollupOptions:{input:{sound:fileURLToPath(new URL('./index.html',import.meta.url)),review:fileURLToPath(new URL('./library-review.html',import.meta.url))}}}});
