import {ACTION_ROW,monsterFor,monsterSprite} from './art.js';

const frameCount=4;
const frameMs={idle:420,feed:260,clean:260,play:230,sleep:550};

/** Plays the existing four poses in each action row, for any supplied monster. */
export function createMonsterAnimator(container,species) {
  let currentSpecies=species;
  let action='idle';
  let frame=0;
  let timer;

  function show() {
    const image=container.querySelector('.monster-sprite img');
    const wrapper=container.querySelector('.monster-sprite');
    if(!image||!wrapper)return;
    image.style.left=`-${frame*100}%`;
    image.style.top=`-${ACTION_ROW[action]*100}%`;
    wrapper.setAttribute('aria-label',`${monsterFor(currentSpecies).label} ${action}`);
  }

  function play(nextAction='idle') {
    if(!(nextAction in ACTION_ROW))throw new Error(`Unknown animation: ${nextAction}`);
    clearInterval(timer);
    action=nextAction;
    frame=0;
    show();
    if(!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){
      timer=setInterval(()=>{
        frame=action==='sleep'&&frame===frameCount-1?frameCount-2:(frame+1)%frameCount;
        show();
      },frameMs[action]);
    }
  }

  function setSpecies(nextSpecies) {
    if(nextSpecies===currentSpecies)return;
    currentSpecies=nextSpecies;
    container.innerHTML=monsterSprite(currentSpecies);
    play('idle');
  }

  container.innerHTML=monsterSprite(currentSpecies);
  play('idle');
  return {play,setSpecies,stop(){clearInterval(timer);timer=undefined;},get action(){return action;},get species(){return currentSpecies;}};
}
