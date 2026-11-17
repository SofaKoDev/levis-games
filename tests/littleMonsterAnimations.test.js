// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {MONSTERS,ACTION_ROW} from '../src/games/little-monsters/art.js';
import {createMonsterAnimator} from '../src/games/little-monsters/animation.js';

it('plays every supplied action row for all seven distinct monster sheets',()=>{
 vi.useFakeTimers();
 try{
  expect(MONSTERS).toHaveLength(7);
  expect(new Set(MONSTERS.map(monster=>monster.sheet)).size).toBe(7);
  for(const monster of MONSTERS){
   const container=document.createElement('div');
   const animator=createMonsterAnimator(container,monster.id);
   for(const [action,row] of Object.entries(ACTION_ROW)){
    animator.play(action);
    const image=container.querySelector('.monster-sprite img');
    expect(image.src).toContain(monster.sheet);
    expect(image.style.top).toBe(row===0?'0%':`-${row*100}%`);
    expect(image.style.left).toBe('0%');
    vi.advanceTimersByTime(action==='sleep'?550:action==='idle'?420:action==='play'?230:260);
    expect(image.style.left).toBe('-100%');
    if(action==='sleep'){
     for(const expected of ['-200%','-300%','-200%','-300%','-200%']){
      vi.advanceTimersByTime(550);
      expect(image.style.left).toBe(expected);
     }
     animator.play('feed');
     expect(image.style.top).toBe('-100%');
     expect(image.style.left).toBe('0%');
    }
   }
   animator.stop();
  }
 }finally{vi.useRealTimers()}
});
