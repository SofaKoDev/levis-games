import uiSheetUrl from '../../../little-monsters/assets/monster-ui-v2-original.png';

const sheetWidth = 2172;
const sheetHeight = 724;

// Rectangles refer to the supplied sheet. Keep the original PNG intact.
const needArt = {
  fullness: [266, 17, 211, 190],
  happiness: [589, 16, 190, 190],
  cleanliness: [880, 16, 205, 190],
  energy: [1170, 8, 275, 210],
};

const actionArt = {
  feed: [42, 218, 367, 260],
  play: [407, 218, 363, 260],
  clean: [765, 218, 363, 260],
  rest: [1126, 218, 366, 260],
};

const utilityArt = {
  paw: [39, 510, 179, 188],
  settings: [226, 507, 170, 193],
  journal: [394, 509, 188, 190],
};

function sprite(rect, className) {
  const [x, y, width, height] = rect;
  const style = `aspect-ratio:${width}/${height};`;
  const imageStyle = `width:${sheetWidth / width * 100}%;left:${-x / width * 100}%;top:${-y / height * 100}%;`;
  return `<span class="ui-sprite ${className}" style="${style}" aria-hidden="true"><img src="${uiSheetUrl}" width="${sheetWidth}" height="${sheetHeight}" style="${imageStyle}" alt=""></span>`;
}

export function uiNeedIcon(need) {
  return sprite(needArt[need], 'ui-need-icon');
}

export function uiActionSprite(action) {
  return sprite(actionArt[action], 'ui-action-art');
}

export function uiUtilityIcon(icon) {
  return sprite(utilityArt[icon], 'ui-utility-icon');
}
