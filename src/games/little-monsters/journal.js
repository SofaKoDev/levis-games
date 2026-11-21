import {validateSave,writeSave} from './state.js';

export const JOURNAL_KEY='levis-little-monsters-journal-v1';
export const emptyJournal=()=>({version:1,entries:[]});

export function validateJournal(raw){
 if(!raw||typeof raw!=='object'||raw.version!==1||!Array.isArray(raw.entries))return null;
 const entries=[];
 const ids=new Set();
 for(const item of raw.entries){
  const pet=validateSave(item);
  if(!pet||!Number.isFinite(item.archivedAt)||item.archivedAt<0)return null;
  if(ids.has(pet.id))continue;
  ids.add(pet.id);
  entries.push({...pet,archivedAt:item.archivedAt});
 }
 return {version:1,entries};
}

export function readJournal(storage=globalThis.localStorage){
 try{
  const raw=storage.getItem(JOURNAL_KEY);
  return raw?validateJournal(JSON.parse(raw)):emptyJournal();
 }catch{return null;}
}

export function writeJournal(journal,storage=globalThis.localStorage){
 const valid=validateJournal(journal);
 if(!valid)return false;
 try{storage.setItem(JOURNAL_KEY,JSON.stringify(valid));return true;}catch{return false;}
}

/** Journal first, active pet second: a failed write never discards the old pet. */
export function archiveAndAdopt(active,next,journal,storage=globalThis.localStorage,now=Date.now()){
 const oldPet=validateSave(active),newPet=validateSave(next);
 if(!oldPet||!newPet||!journal||oldPet.id===newPet.id)return {ok:false,reason:'invalid'};
 const validJournal=validateJournal(journal);
 if(!validJournal)return {ok:false,reason:'journal-invalid'};
 const alreadyArchived=validJournal.entries.some(entry=>entry.id===oldPet.id);
 const updated=alreadyArchived?validJournal:{version:1,entries:[...validJournal.entries,{...oldPet,archivedAt:now}]};
 if(!writeJournal(updated,storage))return {ok:false,reason:'journal-write'};
 if(!writeSave(newPet,storage))return {ok:false,reason:'active-write',journal:updated};
 return {ok:true,active:newPet,journal:updated};
}

/** Swap an archived monster back into the active room and tuck the current pet into the journal. */
export function restoreFromJournal(active,entryId,journal,storage=globalThis.localStorage,now=Date.now()){
 const oldPet=validateSave(active);
 const validJournal=validateJournal(journal);
 if(!oldPet||!validJournal||typeof entryId!=='string'||!entryId)return {ok:false,reason:validJournal?'invalid':'journal-invalid'};
 const target=validJournal.entries.find(entry=>entry.id===entryId);
 if(!target)return {ok:false,reason:'not-found'};
 const {archivedAt:_archivedAt,...rest}=target;
 const restored=validateSave({...rest,savedAt:now});
 if(!restored)return {ok:false,reason:'invalid'};
 const remaining=validJournal.entries.filter(entry=>entry.id!==entryId&&entry.id!==oldPet.id);
 const updated={version:1,entries:[...remaining,{...oldPet,archivedAt:now}]};
 if(!writeJournal(updated,storage))return {ok:false,reason:'journal-write'};
 if(!writeSave(restored,storage)){
  writeJournal(validJournal,storage);
  return {ok:false,reason:'active-write',journal:validJournal};
 }
 return {ok:true,active:restored,journal:updated};
}
