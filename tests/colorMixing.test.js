import {describe,it,expect} from 'vitest';
import {mixPaint,createBowl} from '../src/colorMixing.js';
import {presets} from '../src/colorPresets.js';
import {distance} from '../src/colorNames.js';
const p=Object.fromEntries(presets.map(p=>[p.name,p.hex]));
describe('pigment mixtures in OKLab',()=>{
  it.each([
    ['Red','Yellow','#ff772f',.12],['Cyan','Yellow','#50e949',.12],
    ['Yellow','Blue','#338261',.12],['Red','Blue','#753878',.12],
    ['Green','Blue','#1e7a9b',.12],
  ])('%s + %s has the expected color family',(a,b,target,tolerance)=>{
    expect(distance(mixPaint([p[a],p[b]]),target)).toBeLessThan(tolerance);
  });
  it('every extra Blue drop progressively approaches Blue',()=>{
    let previous=Infinity;
    for(let n=0;n<=100;n++){
      const color=mixPaint([p.Cyan,p.Yellow,...Array(n).fill(p.Blue)]);
      const d=distance(color,p.Blue);
      // At high counts adjacent mixtures can round to the same 8-bit RGB.
      if(n<=10) expect(d).toBeLessThan(previous);
      else expect(d).toBeLessThanOrEqual(previous+.002);
      previous=d;
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(previous).toBeLessThan(.15);
  });
  it('the first Blue drop shifts green toward Blue',()=>{
    const a=mixPaint([p.Cyan,p.Yellow]),b=mixPaint([p.Cyan,p.Yellow,p.Blue]);
    expect(distance(a,b)).toBeGreaterThan(.1);expect(distance(b,p.Blue)).toBeLessThan(distance(a,p.Blue));
  });
  it.each(presets)('identical $name drops preserve their pigment',({hex})=>{
    expect(distance(mixPaint([hex,hex]),hex)).toBeLessThan(.001);
  });
  it('same quantities are independent of order',()=>{
    const drops=[p.Red,p.Blue,p.Cyan,p.Yellow,p.Blue];
    expect(distance(mixPaint(drops),mixPaint([...drops].reverse()))).toBeLessThan(.00001);
  });
  it('undo restores the previous mixture and empty resets all paint',()=>{
    const b=createBowl();b.add(p.Cyan);b.add(p.Yellow);const previous=b.color;b.add(p.Blue);
    expect(b.undo()).toBe(previous);expect(b.drops).toHaveLength(2);b.empty();expect(b.color).toBeNull();expect(b.drops).toEqual([]);expect(b.undo()).toBeNull();b.add(p.Red);expect(b.color).toBe(p.Red);
  });
  it('does not expose mutable drop state',()=>{const b=createBowl();b.add(p.Red);b.drops.push(p.Blue);expect(b.drops).toHaveLength(1)});
  it('rejects invalid paint',()=>expect(()=>mixPaint(['oops'])).toThrow(TypeError));
});
