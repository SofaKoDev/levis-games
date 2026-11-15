export function controls(canvas,left,right){
 const keys=new Set(),held=new Set();let target=null;
 const down=e=>{if(['ArrowLeft','ArrowRight','a','d','A','D'].includes(e.key)&&!['INPUT','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();keys.add(e.key.toLowerCase());}};
 window.addEventListener('keydown',down);window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 for(const [button,value] of [[left,-1],[right,1]]){button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);held.add(value);target=null;});for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>held.delete(value));}
 const point=e=>{const rect=canvas.getBoundingClientRect();target=(e.clientX-rect.left)/rect.width;};let dragging=false;
 canvas.addEventListener('pointerdown',e=>{dragging=true;canvas.setPointerCapture(e.pointerId);point(e);});canvas.addEventListener('pointermove',e=>{if(dragging)point(e);});for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{dragging=false;target=null;});
 const clear=()=>{keys.clear();held.clear();target=null;dragging=false;};window.addEventListener('blur',clear);
 return {get direction(){return (keys.has('arrowright')||keys.has('d')||held.has(1)?1:0)-(keys.has('arrowleft')||keys.has('a')||held.has(-1)?1:0)},get target(){return target},clear};
}
