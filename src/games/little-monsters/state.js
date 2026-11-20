export const SAVE_KEY='levis-little-monsters-active-v2';
export const LEGACY_SAVE_KEY='levis-little-monsters-v1';
export const SPECIES=['emberhorn','sparkfox','sunfeather','leafsprite','tidefin','nighthawk','moonmoth'];
const LEGACY_SPECIES={moss:'leafsprite',peach:'sparkfox',sky:'tidefin'};
export const NEEDS=['fullness','happiness','cleanliness','energy'];
export const CARE_ACTIONS=['feed','play','clean','rest'];
export const DECAY_PER_HOUR={fullness:1.6,happiness:.7,cleanliness:.55,energy:.9};
export const MAX_AWAY_MS=30*24*60*60*1000;
const clamp=value=>Math.max(0,Math.min(100,value));
const validTime=value=>Number.isFinite(value)&&value>=0;
const validName=value=>typeof value==='string'&&!!value.trim()&&value.length<=20&&!/[<>\u0000-\u001f]/.test(value);
const emptyStats=()=>Object.fromEntries(CARE_ACTIONS.map(action=>[action,0]));

function uniqueId(now=Date.now()){
 if(globalThis.crypto?.randomUUID)return globalThis.crypto.randomUUID();
 return `pet-${now.toString(36)}-${Math.random().toString(36).slice(2,12)}`;
}

export function newMonster(species,name,now=Date.now()){
 if(!SPECIES.includes(species))throw new Error('Choose a monster');
 const cleanName=String(name).trim().replace(/\s+/g,' ').slice(0,20);
 if(!validName(cleanName))throw new Error('Give your monster a name');
 return {version:2,id:uniqueId(now),species,name:cleanName,appearance:species,needs:{fullness:85,happiness:85,cleanliness:85,energy:85},sleeping:false,adoptedAt:now,adoptionDateEstimated:false,savedAt:now,stats:emptyStats()};
}

export function validateSave(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||![1,2].includes(raw.version))return null;
 const species=LEGACY_SPECIES[raw.species]??raw.species;
 if(!SPECIES.includes(species)||raw.appearance!==raw.species||!validName(raw.name)||!validTime(raw.savedAt)||!raw.needs||typeof raw.needs!=='object')return null;
 if(!NEEDS.every(key=>typeof raw.needs[key]==='number'&&Number.isFinite(raw.needs[key])&&raw.needs[key]>=0&&raw.needs[key]<=100))return null;
 if(raw.sleeping!==undefined&&typeof raw.sleeping!=='boolean')return null;
 const isLegacy=raw.version===1;
 if(!isLegacy&&(typeof raw.id!=='string'||!raw.id.trim()||raw.id.length>100||!validTime(raw.adoptedAt)))return null;
 const stats=raw.stats??emptyStats();
 if(!CARE_ACTIONS.every(action=>Number.isSafeInteger(stats[action])&&stats[action]>=0))return null;
 const result={version:2,id:isLegacy?`legacy-${raw.savedAt.toString(36)}-${species}-${encodeURIComponent(raw.name.trim())}`:raw.id,species,name:raw.name.trim(),appearance:species,needs:Object.fromEntries(NEEDS.map(key=>[key,raw.needs[key]])),sleeping:raw.sleeping??false,adoptedAt:isLegacy?raw.savedAt:raw.adoptedAt,adoptionDateEstimated:isLegacy?true:raw.adoptionDateEstimated===true,savedAt:raw.savedAt,stats:Object.fromEntries(CARE_ACTIONS.map(action=>[action,stats[action]]))};
 for(const key of ['progression','customization']){
  if(raw[key]!==undefined){if(!raw[key]||typeof raw[key]!=='object'||Array.isArray(raw[key]))return null;result[key]=raw[key];}
 }
 return result;
}

export function applyElapsed(state,now=Date.now()){
 const elapsed=Math.min(MAX_AWAY_MS,Math.max(0,now-state.savedAt))/3_600_000;
 return {...state,needs:Object.fromEntries(NEEDS.map(key=>[key,clamp(state.needs[key]-DECAY_PER_HOUR[key]*elapsed)])),savedAt:now};
}

export function act(state,action,now=Date.now()){
 if(!CARE_ACTIONS.includes(action))throw new Error('Unknown action');
 const current=applyElapsed(state,now),needs={...current.needs};
 if(action==='feed')needs.fullness=clamp(needs.fullness+26);
 if(action==='play'){needs.happiness=clamp(needs.happiness+27);needs.energy=clamp(needs.energy-6);needs.cleanliness=clamp(needs.cleanliness-6);needs.fullness=clamp(needs.fullness-5);}
 if(action==='clean')needs.cleanliness=clamp(needs.cleanliness+30);
 if(action==='rest')needs.energy=clamp(needs.energy+32);
 return {...current,needs,sleeping:action==='rest',stats:{...current.stats,[action]:current.stats[action]+1}};
}

export function renameMonster(state,name,now=Date.now()){
 const cleanName=String(name).trim().replace(/\s+/g,' ').slice(0,20);
 if(!validName(cleanName))throw new Error('Give your monster a name');
 return {...state,name:cleanName,savedAt:now};
}

export function readSave(storage=globalThis.localStorage,now=Date.now()){
 for(const key of [SAVE_KEY,LEGACY_SAVE_KEY]){
  try{
   const raw=storage.getItem(key);
   if(!raw)continue;
   const valid=validateSave(JSON.parse(raw));
   if(valid)return applyElapsed(valid,now);
  }catch{continue;}
 }
 return null;
}
export function writeSave(state,storage=globalThis.localStorage){
 const valid=validateSave(state);if(!valid)return false;
 try{storage.setItem(SAVE_KEY,JSON.stringify(valid));return true;}catch{return false;}
}
export function exportSave(state){const valid=validateSave(state);if(!valid)throw new Error('Invalid save');return JSON.stringify(valid,null,2);}
export function importSave(text,now=Date.now()){const valid=validateSave(JSON.parse(text));if(!valid)throw new Error('Invalid save');return applyElapsed(valid,now);}
