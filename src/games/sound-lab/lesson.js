export const sunLesson={
  id:'sun',word:'sun',letters:['s','u','n'],illustration:'sun',
  stages:[
    {id:'intro',title:'A little word adventure',prompt:'Listen to the three sounds.',audio:'01-intro.wav',animation:'apart',focus:[]},
    {id:'s',title:'The first sound',prompt:'Listen, then try the sound.',audio:'02-s.wav',animation:'apart',focus:[0]},
    {id:'u',title:'The middle sound',prompt:'Listen, then try the sound.',audio:'03-u.wav',animation:'apart',focus:[1]},
    {id:'n',title:'The last sound',prompt:'Listen, then try the sound.',audio:'04-n.wav',animation:'apart',focus:[2]},
    {id:'partial',title:'Let’s slide two sounds together',prompt:'Listen to the first two sounds joining.',audio:'05-partial-su.wav',animation:'partial',focus:[0,1]},
    {id:'blend',title:'Now all three sounds',prompt:'Listen as the sounds slide together.',audio:'06-connected-sun.wav',animation:'together',focus:[0,1,2]},
    {id:'word',title:'You made a word!',prompt:'Listen to the whole word.',audio:'07-word-sun.wav',animation:'word',focus:[],complete:true},
  ],
};
export function createLesson(lesson=sunLesson){
  let index=-1;
  return {lesson,get index(){return index},get stage(){return lesson.stages[index]||null},get started(){return index>=0},get canBack(){return index>0},get canNext(){return index>=0&&index<lesson.stages.length-1},start(){index=0;},next(){if(this.canNext)index++;},back(){if(this.canBack)index--;},restart(){index=0;}};
}
