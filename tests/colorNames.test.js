import {it,expect} from 'vitest';
import {colorName,namedColors,distance} from '../src/colorNames.js';
import {presets,hueOf,hueToHex} from '../src/colorPresets.js';
it.each(presets)('preserves exact preset $name',({name,hex})=>expect(colorName(hex)).toBe(name));
it('includes hundreds of descriptive choices',()=>expect(namedColors.length).toBeGreaterThan(300));
it.each([['#004c4c','Deep Teal'],['#40e0d0','Turquoise'],['#ffbf00','Amber'],['#ccccff','Periwinkle']])('names %s appropriately',(hex,name)=>expect(colorName(hex)).toBe(name));
it('chosen names stay perceptually close across the rainbow',()=>{
  for(let h=0;h<360;h+=5){const hex=hueToHex(h),name=colorName(hex);const candidate=presets.find(p=>p.name===name)||namedColors.find(c=>c.name===name);expect(distance(hex,candidate.hex)).toBeLessThan(.15);expect(Math.abs(hueOf(hex)-h)).toBeLessThan(1);}
});
