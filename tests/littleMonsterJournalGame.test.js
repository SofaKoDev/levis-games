// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {readSave} from '../src/games/little-monsters/state.js';
import {readJournal} from '../src/games/little-monsters/journal.js';

it('renames, archives, and adopts through the journal while keeping the old pet',async()=>{
 vi.useFakeTimers();
 try{
  localStorage.clear();
  document.body.innerHTML='<div id="app"></div>';
  const writes=vi.spyOn(Storage.prototype,'setItem');
  await import('../src/games/little-monsters/main.js');
  expect(writes).not.toHaveBeenCalled();
  document.querySelector('.monster-choice[data-species="leafsprite"]').click();
  document.querySelector('#monster-name').value='Sprout';
  document.querySelector('#adopt-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  const firstId=readSave(localStorage).id;
  document.querySelector('#rename-input').value='Fern';
  document.querySelector('#rename').click();
  expect(readSave(localStorage).name).toBe('Fern');
  document.querySelector('.action.feed').click();
  document.querySelector('#journal-open').click();
  expect(document.querySelector('#journal').hidden).toBe(false);
  const dialog=document.querySelector('#replace-dialog');
  dialog.showModal=()=>{dialog.open=true};dialog.close=()=>{dialog.open=false};
  document.querySelector('#adopt-another').click();
  expect(dialog.open).toBe(true);
  expect(readJournal(localStorage).entries).toHaveLength(0);
  document.querySelector('#replace-confirm').click();
  expect(document.querySelector('#adopt').hidden).toBe(false);
  document.querySelector('.monster-choice[data-species="moonmoth"]').click();
  document.querySelector('#monster-name').value='Luna';
  document.querySelector('#adopt-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  expect(readSave(localStorage)).toMatchObject({name:'Luna',species:'moonmoth'});
  const entries=readJournal(localStorage).entries;
  expect(entries).toHaveLength(1);
  expect(entries[0]).toMatchObject({id:firstId,name:'Fern',species:'leafsprite',stats:{feed:1}});
  document.querySelector('#journal-open').click();
  expect(document.querySelectorAll('.journal-card')).toHaveLength(1);
  expect(document.querySelector('.journal-card h3').textContent).toBe('Fern');
  expect(readJournal(localStorage).entries).toHaveLength(1);
  document.querySelector('.journal-restore').click();
  expect(dialog.open).toBe(true);
  document.querySelector('#replace-confirm').click();
  expect(document.querySelector('#home').hidden).toBe(false);
  expect(document.querySelector('#pet-name').textContent).toBe('Fern');
  expect(document.querySelector('#message').textContent).toContain('Welcome back, Fern!');
  expect(readSave(localStorage)).toMatchObject({id:firstId,name:'Fern',species:'leafsprite',stats:{feed:1}});
  expect(readJournal(localStorage).entries).toHaveLength(1);
  expect(readJournal(localStorage).entries[0]).toMatchObject({name:'Luna',species:'moonmoth'});
  writes.mockRestore();
 }finally{vi.clearAllTimers();vi.useRealTimers()}
});
