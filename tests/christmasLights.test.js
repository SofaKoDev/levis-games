import {it,expect} from 'vitest';
import {bulbPositions,renderLights} from '../src/games/christmas-tree/lights.js';
import {createTree,load} from '../src/games/christmas-tree/state.js';
it('scatters bulbs without repeated rows and keeps patterns stable',()=>{
  expect(bulbPositions).toHaveLength(32);
  expect(new Set(bulbPositions.map(p=>p.y)).size).toBe(32);
  for(const {x,y} of bulbPositions){expect(y).toBeGreaterThan(.23);expect(y).toBeLessThan(.78);expect(Math.abs(x-.5)).toBeLessThan(.035+(y-.16)*.43);}
  expect(renderLights(0)).toBe(renderLights(0));
  expect(new Set([...renderLights(0).matchAll(/fill="([^"]+)"/g)].map(m=>m[1])).size).toBe(5);
});
it('renders mixed blue and white and saves it without changing existing off saves',()=>{
  const fills=[...renderLights(4).matchAll(/fill="([^"]+)"/g)].map(m=>m[1]);
  expect(new Set(fills)).toEqual(new Set(['#78baff','#fff9ec']));
  const t=createTree();t.set('lights',4);expect(load({getItem:()=>JSON.stringify(t.state)}).lights).toBe(4);
  t.set('lights',3);expect(load({getItem:()=>JSON.stringify(t.state)}).lights).toBe(3);
});
