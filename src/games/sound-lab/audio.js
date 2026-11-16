// Only installed, local recordings are played. No speech-synthesis fallback.
export function createLessonAudio({resolve,createAudio=url=>new Audio(url),onStatus=()=>{}}){
  const cache=new Map();let active=null,generation=0;
  function stop(){generation++;if(active){active.onended=null;active.onerror=null;active.pause();try{active.currentTime=0;}catch{}active=null;}}
  function preload(stages){for(const stage of stages){const url=resolve(stage.audio);if(url&&!cache.has(url)){const audio=createAudio(url);audio.preload='auto';audio.load();cache.set(url,audio);}}}
  function play(stage){
    stop();const token=generation,url=resolve(stage.audio);
    if(!url){onStatus({kind:'missing',file:stage.audio});return;}
    const audio=cache.get(url)||createAudio(url);cache.set(url,audio);active=audio;
    audio.onended=()=>{if(token===generation)onStatus({kind:'ready'});};
    audio.onerror=()=>{if(token===generation)onStatus({kind:'error',file:stage.audio});};
    try{onStatus({kind:'playing'});const result=audio.play();result?.catch(()=>{if(token===generation)onStatus({kind:'error',file:stage.audio});});}
    catch{if(token===generation)onStatus({kind:'error',file:stage.audio});}
  }
  return {preload,play,stop};
}
