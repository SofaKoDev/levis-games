import {mkdirSync,copyFileSync} from 'node:fs';
mkdirSync('dist/licenses',{recursive:true});
for(const [pkg,file] of [['spectral.js','LICENSE'],['color-name','LICENSE']])copyFileSync(`node_modules/${pkg}/${file}`,`dist/licenses/${pkg}.txt`);
