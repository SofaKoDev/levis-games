import {it,expect} from 'vitest';
import {SAVE_KEY,LEGACY_SAVE_KEY,newMonster,readSave,writeSave,act} from '../src/games/little-monsters/state.js';
import {JOURNAL_KEY,emptyJournal,readJournal,archiveAndAdopt} from '../src/games/little-monsters/journal.js';

function storage(failKey){
 const data=new Map();let writes=0;
 return {data,get writes(){return writes},getItem:key=>data.get(key)??null,setItem:(key,value)=>{writes++;if(key===failKey)throw new Error('storage full');data.set(key,value)}};
}

it('loads an older active save without rewriting it or losing the pet',()=>{
 const store=storage();
 const old={version:1,species:'moss',appearance:'moss',name:'Mossy',needs:{fullness:64,happiness:75,cleanliness:81,energy:92},savedAt:1000};
 store.data.set(LEGACY_SAVE_KEY,JSON.stringify(old));
 const pet=readSave(store,1000);
 expect(pet.species).toBe('leafsprite');
 expect(pet.name).toBe('Mossy');
 expect(pet.adoptionDateEstimated).toBe(true);
 expect(pet.adoptedAt).toBe(1000);
 expect(store.writes).toBe(0);
 expect(store.data.has(SAVE_KEY)).toBe(false);
 expect(writeSave(pet,store)).toBe(true);
 expect(readSave(store,1000).id).toBe(pet.id);
});

it('archives pets permanently, including several of the same species, without duplicates',()=>{
 const store=storage();
 const first=act(newMonster('sparkfox','Pip',1000),'feed',1000);
 const second=newMonster('sparkfox','Flame',2000);
 const third=newMonster('moonmoth','Luna',3000);
 const one=archiveAndAdopt(first,second,emptyJournal(),store,2000);
 expect(one.ok).toBe(true);
 expect(one.journal.entries).toHaveLength(1);
 expect(one.journal.entries[0]).toMatchObject({id:first.id,name:'Pip',species:'sparkfox',adoptedAt:1000,archivedAt:2000,stats:{feed:1}});
 const two=archiveAndAdopt(second,third,one.journal,store,3000);
 expect(two.ok).toBe(true);
 expect(two.journal.entries).toHaveLength(2);
 expect(two.journal.entries[1]).toMatchObject({name:'Flame',species:'sparkfox'});
 expect(new Set(two.journal.entries.map(entry=>entry.id)).size).toBe(2);
 expect(readJournal(store).entries).toHaveLength(2);
 expect(readSave(store,3000).name).toBe('Luna');
 const retry=archiveAndAdopt(first,newMonster('tidefin','Blue',4000),two.journal,store,4000);
 expect(retry.ok).toBe(true);
 expect(retry.journal.entries).toHaveLength(2);
 expect(JSON.parse(store.data.get(JOURNAL_KEY)).entries).toHaveLength(2);
});

it('keeps the active save if the journal or active write fails',()=>{
 const old=newMonster('emberhorn','Old',1000),next=newMonster('tidefin','New',2000);
 const journalFailure=storage(JOURNAL_KEY);
 writeSave(old,journalFailure);
 expect(archiveAndAdopt(old,next,emptyJournal(),journalFailure,2000).ok).toBe(false);
 expect(readSave(journalFailure,2000).name).toBe('Old');
 const activeFailure=storage(SAVE_KEY);
 activeFailure.data.set(SAVE_KEY,JSON.stringify(old));
 const result=archiveAndAdopt(old,next,emptyJournal(),activeFailure,2000);
 expect(result).toMatchObject({ok:false,reason:'active-write'});
 expect(readSave(activeFailure,2000).name).toBe('Old');
 expect(readJournal(activeFailure).entries).toHaveLength(1);
});

it('does not overwrite malformed journal data when it cannot be read',()=>{
 const store=storage();store.data.set(JOURNAL_KEY,'{broken');
 expect(readJournal(store)).toBeNull();
 expect(archiveAndAdopt(newMonster('leafsprite','A',1000),newMonster('tidefin','B',2000),readJournal(store),store,2000).ok).toBe(false);
 expect(store.data.get(JOURNAL_KEY)).toBe('{broken');
});

it('keeps optional progression and customization data in saves and journal entries',()=>{
 const store=storage();
 const pet={...newMonster('sunfeather','Sunny',1000),progression:{visits:4},customization:{ribbon:'gold'}};
 const next=newMonster('moonmoth','Moon',2000);
 expect(writeSave(pet,store)).toBe(true);
 expect(readSave(store,1000)).toMatchObject({progression:{visits:4},customization:{ribbon:'gold'}});
 const result=archiveAndAdopt(pet,next,emptyJournal(),store,2000);
 expect(result.ok).toBe(true);
 expect(readJournal(store).entries[0]).toMatchObject({progression:{visits:4},customization:{ribbon:'gold'}});
});
