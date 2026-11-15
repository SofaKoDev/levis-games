import {it,expect} from 'vitest';
import {fresh,load,createTree} from '../src/games/christmas-tree/state.js';
import {topperArt} from '../src/games/christmas-tree/scene.js';
it('offers three toppers and draws the hat without a Santa emoji',()=>{const t=createTree();t.set('topper',2);expect(t.state.topper).toBe(2);t.set('topper',3);expect(t.state.topper).toBe(2);expect(topperArt(2)).toContain('<path');expect(topperArt(2)).not.toContain('🎅');expect(topperArt(2)).not.toContain('👼');});
it('migrates old Santa hats and replaces removed angels with stars',()=>{for(const [before,after] of [[3,2],[2,0],[1,1],[0,0]]){const old={...fresh(),version:1,topper:before};expect(load({getItem:()=>JSON.stringify(old)}).topper).toBe(after);}});
