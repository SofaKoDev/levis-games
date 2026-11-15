export const COURSE_LENGTH=500;
export const SKI_SPEED=13;
export const RECOVERY_SECONDS=1.3;
export const speed=s=>SKI_SPEED*(1-.65*Math.min(1,s.protection/RECOVERY_SECONDS));
export const BONUSES={cocoa:2,mittens:3,hat:5};
export const SPAWN_WEIGHTS={cocoa:.6,mittens:.28,hat:.12};
export const multiplier=s=>Math.max(1,1+2*s.counts.cocoa+3*s.counts.mittens+5*s.counts.hat-2*s.collisions);
export const score=s=>Math.floor(s.distance)*multiplier(s);
export function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export function course(seed){
 const r=random(seed),objects=[];let id=0;
 for(let d=30;d<463;d+=14){let x=.13+r()*.74;if(Math.abs(x-.5)<.13)x=x<.5?.23:.77;objects.push({id:id++,type:r()<.7?'tree':'rock',x,d,used:false});}
 for(let d=18;d<465;d+=22){const v=r(),type=v<SPAWN_WEIGHTS.cocoa?'cocoa':v<SPAWN_WEIGHTS.cocoa+SPAWN_WEIGHTS.mittens?'mittens':'hat';let x=.19+r()*.62;if(objects.some(o=>Math.abs(o.d-d)<4&&Math.abs(o.x-x)<.12))x=.5;objects.push({id:id++,type,x,d,used:false});}
 return objects;
}
export function createRun(seed=12345){return {phase:'ready',distance:0,x:.5,elapsed:0,protection:0,counts:{cocoa:0,mittens:0,hat:0},collisions:0,objects:course(seed),events:[],seed};}
export function collect(s,obj){if(s.phase!=='running'||obj.used||!BONUSES[obj.type])return false;obj.used=true;s.counts[obj.type]++;s.events.push({text:`+${BONUSES[obj.type]}×`,x:obj.x,age:0,good:true});return true;}
export function collide(s,obj){if(s.phase!=='running'||obj.used)return false;obj.used=true;if(s.protection>0)return false;s.collisions++;s.protection=RECOVERY_SECONDS;s.events.push({text:'−2×',x:s.x,age:0,good:false});return true;}
export function advance(s,dt,input=0,target=null){
 if(s.phase!=='running'||!Number.isFinite(dt)||dt<=0)return;
 let remaining=Math.min(dt,.1);
 while(remaining>0&&s.phase==='running'){
  const step=Math.min(.015,remaining);remaining-=step;s.elapsed+=step;s.protection=Math.max(0,s.protection-step);
  const direction=target===null?input:Math.max(-1,Math.min(1,(target-s.x)*10));s.x=Math.max(.08,Math.min(.92,s.x+direction*step*.52));s.distance=Math.min(500,s.distance+speed(s)*step);
  for(const o of s.objects){if(!o.used&&Math.abs(o.d-s.distance)<1.7&&Math.abs(o.x-s.x)<(BONUSES[o.type]?.075:.045)){if(BONUSES[o.type])collect(s,o);else collide(s,o);}}
  for(const e of s.events)e.age+=step;s.events=s.events.filter(e=>e.age<1);
  if(s.distance>=500){s.distance=500;s.phase='finished';s.events=[];}
 }
}
export function pause(s){if(s.phase==='running')s.phase='paused';}
export function resume(s){if(s.phase==='paused')s.phase='running';}
export const tally=s=>({distance:Math.floor(s.distance),...s.counts,collisions:s.collisions,multiplier:multiplier(s),score:score(s)});
