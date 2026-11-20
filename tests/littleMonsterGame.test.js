// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';

it('adopts a new sprite and shows its matching care animations',async()=>{
  vi.useFakeTimers();
  try{
    localStorage.clear();
    document.body.innerHTML='<div id="app"></div>';
    await import('../src/games/little-monsters/main.js');
    const choices=[...document.querySelectorAll('.monster-choice')];
    expect(choices).toHaveLength(7);
    const choice=choices.find(button=>button.dataset.species==='moonmoth');
    choice.click();
    document.querySelector('#monster-name').value='Luna';
    document.querySelector('#adopt-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    expect(document.querySelector('#home').hidden).toBe(false);
    expect(document.querySelector('#pet-name').textContent).toBe('Luna');
    expect(document.querySelector('label[for="need-fullness"]').textContent).toBe('Hunger');
    expect(document.querySelector('#need-fullness').value).toBe(85);
    expect(document.querySelectorAll('.need-meter progress')).toHaveLength(4);
    expect(document.querySelector('.ui-need-meter')).toBeNull();
    expect(document.querySelector('#pet .monster-sprite').getAttribute('aria-label')).toContain('Moonmoth');
    for(const [action,top] of [['feed','-100%'],['clean','-200%'],['play','-300%'],['rest','-400%']]){
      document.querySelector(`.action.${action}`).click();
      expect(document.querySelector('#pet .monster-sprite img').style.top).toBe(top);
    }
    expect(document.querySelector('#need-fullness').value).toBe(95);
    vi.advanceTimersByTime(2200);
    expect(document.querySelector('#pet .monster-sprite img').style.top).toBe('-400%');
    document.querySelector('.action.feed').click();
    vi.advanceTimersByTime(1200);
    expect(document.querySelector('#pet .monster-sprite img').style.top).toBe('0%');
  }finally{vi.clearAllTimers();vi.useRealTimers()}
});
