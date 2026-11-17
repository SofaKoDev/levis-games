import {it,expect} from 'vitest';
import {SAVE_KEY,newMonster,validateSave,applyElapsed,act,readSave,writeSave,exportSave,importSave} from '../src/games/little-monsters/state.js';

const HOUR=3_600_000;
function storage(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};}

it('adopts and reloads the same named monster from its own versioned save',()=>{
 const store=storage(),monster=newMonster('sparkfox','  Poppy  ',1000);
 expect(monster.name).toBe('Poppy');expect(writeSave(monster,store)).toBe(true);
 expect(readSave(store,1000)).toEqual(monster);
 expect(store.getItem(SAVE_KEY)).toContain('Poppy');
 expect(()=>newMonster('unknown','Poppy')).toThrow();expect(()=>newMonster('tidefin','')).toThrow();
});

it('decays gently, clamps after a long absence, and ignores a backward clock',()=>{
 const monster=newMonster('leafsprite','Moss',1000);
 const day=applyElapsed(monster,1000+24*HOUR);
 expect(day.needs.fullness).toBeLessThan(monster.needs.fullness);expect(day.needs.fullness).toBeGreaterThan(0);
 const weeks=applyElapsed(monster,1000+90*24*HOUR);
 for(const value of Object.values(weeks.needs))expect(value).toBeGreaterThanOrEqual(0);
 expect(weeks.name).toBe('Moss');expect(weeks.species).toBe('leafsprite');
 expect(applyElapsed(monster,500).needs).toEqual(monster.needs);
});

it('applies each care action without exceeding bounds, and play uses a little energy',()=>{
 let monster=newMonster('tidefin','Bloo',1000);
 monster=act(monster,'feed',1000);expect(monster.needs.fullness).toBe(100);
 monster=act(monster,'play',1000);expect(monster.needs.happiness).toBe(100);expect(monster.needs.energy).toBe(79);
 monster=act(monster,'clean',1000);expect(monster.needs.cleanliness).toBe(100);
 monster=act(monster,'rest',1000);expect(monster.needs.energy).toBe(100);
 expect(()=>act(monster,'unknown')).toThrow();
});

it('validates imports, rejects outdated or malformed saves, and exports portable JSON',()=>{
 const monster=newMonster('leafsprite','Noodle',1000),text=exportSave(monster);
 expect(importSave(text,1000+HOUR).needs.fullness).toBeLessThan(85);
 expect(validateSave({...monster,version:3})).toBeNull();
 expect(validateSave({...monster,needs:{...monster.needs,energy:101}})).toBeNull();
 expect(()=>importSave('{broken')).toThrow();
 expect(()=>importSave(JSON.stringify({...monster,name:'<script>'}))).toThrow();
 const store=storage();store.setItem(SAVE_KEY,'{broken');expect(readSave(store)).toBeNull();
});

it('preserves old pet names and needs while migrating their artwork',()=>{
 const replacements={moss:'leafsprite',peach:'sparkfox',sky:'tidefin'};
 for(const [oldSpecies,newSpecies] of Object.entries(replacements)){
  const oldSave={version:1,species:oldSpecies,appearance:oldSpecies,name:'Buddy',needs:{fullness:42,happiness:65,cleanliness:72,energy:80},savedAt:1000};
  const migrated=validateSave(oldSave);
  expect(migrated.species).toBe(newSpecies);
  expect(migrated.appearance).toBe(newSpecies);
  expect(migrated.name).toBe('Buddy');
  expect(migrated.needs).toEqual(oldSave.needs);
 }
});

it('keeps a resting pet asleep until another care action',()=>{
 const initial=newMonster('moonmoth','Luna',1000);
 const sleeping=act(initial,'rest',1000);
 expect(sleeping.sleeping).toBe(true);
 expect(validateSave(JSON.parse(exportSave(sleeping))).sleeping).toBe(true);
 expect(act(sleeping,'feed',1000).sleeping).toBe(false);
 expect(validateSave({...initial,sleeping:'yes'})).toBeNull();
});
