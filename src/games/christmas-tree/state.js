import {byId} from './catalog.js';
export const fresh=()=>({version:2,style:0,lights:0,night:false,topper:0,items:[]});
export function valid(s){return s?.version===2&&Number.isInteger(s.style)&&s.style>=0&&s.style<3&&Number.isInteger(s.lights)&&s.lights>=0&&s.lights<5&&typeof s.night==='boolean'&&Number.isInteger(s.topper)&&s.topper>=0&&s.topper<3&&Array.isArray(s.items)&&s.items.length<=10000&&new Set(s.items.map(i=>i.id)).size===s.items.length&&s.items.every(i=>typeof i.id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(i.id)&&byId[i.type]&&Number.isFinite(i.x)&&Number.isFinite(i.y)&&i.x>=0&&i.x<=1&&i.y>=0&&i.y<=1);}
export function load(storage){try{const s=JSON.parse(storage.getItem('levis-tree'));if(s?.version===1){s.version=2;s.topper=s.topper===3?2:s.topper===2?0:s.topper;}return valid(s)?s:fresh();}catch{return fresh();}}
export function position(type,x,y){const gift=byId[type].kind==='present';y=Math.max(gift?.86:.18,Math.min(gift?.95:.79,y));const half=gift?.39:.05+(y-.16)*.45;return {x:Math.max(.5-half,Math.min(.5+half,x)),y};}
export function createTree(initial=fresh()){
 let state=valid(initial)?structuredClone(initial):fresh(),history=[];
 const change=fn=>{history.push(structuredClone(state));fn();};
 return {get state(){return structuredClone(state)},place(type,x,y){if(!byId[type])return;change(()=>state.items.push({id:crypto.randomUUID(),type,...position(type,x,y)}));},move(id,x,y){const item=state.items.find(i=>i.id===id);if(item)change(()=>Object.assign(item,position(item.type,x,y)));},remove(id){if(state.items.some(i=>i.id===id))change(()=>state.items=state.items.filter(i=>i.id!==id));},undo(){if(history.length)state=history.pop();},set(key,value){const next={...state,[key]:value};if(valid(next))change(()=>state=next);},reset(confirmed){if(confirmed)change(()=>state.items=[]);}};
}
