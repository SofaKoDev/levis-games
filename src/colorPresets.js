export const presets = [
  {name:'Red',hex:'#ff2255'}, {name:'Orange',hex:'#ff8800'},
  {name:'Yellow',hex:'#ffff00'}, {name:'Green',hex:'#22c77a'},
  {name:'Cyan',hex:'#00ffff'}, {name:'Blue',hex:'#3455eb'},
  {name:'Purple',hex:'#9333ea'}, {name:'Pink',hex:'#ff69b4'},
];
export function hueOf(hex) {
  const [r,g,b]=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255);
  const max=Math.max(r,g,b),d=max-Math.min(r,g,b);
  if(!d) return 0;
  return ((max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4)*60+360)%360;
}
export function hueToHex(h) {
  const x=1-Math.abs((h/60)%2-1);
  const rgb=h<60?[1,x,0]:h<120?[x,1,0]:h<180?[0,1,x]:h<240?[0,x,1]:h<300?[x,0,1]:[1,0,x];
  return '#'+rgb.map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');
}
