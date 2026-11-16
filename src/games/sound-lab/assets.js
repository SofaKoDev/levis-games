import {sunArt} from './illustration.js';
const recordings=import.meta.glob(['/sound-lab/audio/**/*.mp3','/sound-lab/audio/**/*.wav'],{eager:true,query:'?url',import:'default'});
const rawArt=import.meta.glob('/sound-lab/illustrations/*.svg',{eager:true,query:'?raw',import:'default'});
export const art={sun:sunArt,...Object.fromEntries(Object.entries(rawArt).map(([path,svg])=>[path.split('/').at(-1).replace('.svg',''),svg]))};
export const resolve=file=>recordings[`/sound-lab/audio/${file}`];
