import emberhornSheet from '../../../little-monsters/assets/sprites/emberhorn-animation-sheet.webp';
import sparkfoxSheet from '../../../little-monsters/assets/sprites/sparkfox-animation-sheet.webp';
import sunfeatherSheet from '../../../little-monsters/assets/sprites/sunfeather-animation-sheet.webp';
import leafspriteSheet from '../../../little-monsters/assets/sprites/leafsprite-animation-sheet.webp';
import tidefinSheet from '../../../little-monsters/assets/sprites/tidefin-animation-sheet.webp';
import nighthawkSheet from '../../../little-monsters/assets/sprites/nighthawk-animation-sheet.webp';
import moonmothSheet from '../../../little-monsters/assets/sprites/moonmoth-animation-sheet.webp';

export const MONSTERS = [
  {id:'emberhorn',label:'Emberhorn',description:'A warm fire friend',sheet:emberhornSheet},
  {id:'sparkfox',label:'Sparkfox',description:'A playful fox',sheet:sparkfoxSheet},
  {id:'sunfeather',label:'Sunfeather',description:'A bright little griffin',sheet:sunfeatherSheet},
  {id:'leafsprite',label:'Leafsprite',description:'A leafy garden friend',sheet:leafspriteSheet},
  {id:'tidefin',label:'Tidefin',description:'A gentle water drake',sheet:tidefinSheet},
  {id:'nighthawk',label:'Nighthawk',description:'A watchful moon owl',sheet:nighthawkSheet},
  {id:'moonmoth',label:'Moonmoth',description:'A glowing night friend',sheet:moonmothSheet},
];

export const ACTION_ROW = {idle:0,feed:1,clean:2,play:3,sleep:4};

export function monsterFor(species) {
  return MONSTERS.find(monster=>monster.id===species) ?? MONSTERS[0];
}

export function monsterSprite(species, action='idle', lazy=false) {
  const monster=monsterFor(species);
  const row=ACTION_ROW[action] ?? ACTION_ROW.idle;
  return `<span class="monster-sprite" role="img" aria-label="${monster.label} ${action}"><img src="${monster.sheet}" alt="" aria-hidden="true" draggable="false" ${lazy?'loading="lazy"':''} style="left:0;top:-${row*100}%"></span>`;
}
