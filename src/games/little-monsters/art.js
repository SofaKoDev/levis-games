import emberhornSheet from '../../../little-monsters/rainbow-pipeline/output-originals/sheets/emberhorn-animation-sheet.png';
import sparkfoxSheet from '../../../little-monsters/rainbow-pipeline/output-originals/sheets/sparkfox-animation-sheet.png';
import sunfeatherSheet from '../../../little-monsters/rainbow-pipeline/output-originals/sheets/sunfeather-animation-sheet.png';
import leafspriteSheet from '../../../little-monsters/rainbow-pipeline/output-originals/sheets/leafsprite-animation-sheet.png';
import tidefinSheet from '../../../little-monsters/rainbow-pipeline/output-originals/sheets/tidefin-animation-sheet.png';
import nighthawkSheet from '../../../little-monsters/rainbow-pipeline/output-originals/sheets/nighthawk-animation-sheet.png';
import moonmothSheet from '../../../little-monsters/rainbow-pipeline/output-originals/sheets/moonmoth-animation-sheet.png';

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
