export const MIN=1,MAX=20;
export const voiceFile=question=>`${question.operation}-${question.current}-${question.amount}.wav`;
const draw=(random,min,max)=>min+Math.floor(random()*(max-min+1));
export function makeQuestion(current,random=Math.random){
 if(!Number.isInteger(current)||current<MIN||current>MAX)throw new RangeError('Current number must be 1–20');
 const plus=MAX-current,minus=current-MIN;
 const operation=plus&&minus?(random()<.5?'add':'subtract'):plus?'add':'subtract';
 const amount=draw(random,1,operation==='add'?plus:minus);
 const answer=current+(operation==='add'?amount:-amount);
 const distractors=[];
 for(let distance=1;distractors.length<2&&distance<MAX;distance++){
  for(const candidate of [answer-distance,answer+distance])if(candidate>=MIN&&candidate<=MAX&&candidate!==answer&&!distractors.includes(candidate))distractors.push(candidate);
 }
 const choices=[answer,...distractors.slice(0,2)];
 for(let i=choices.length-1;i>0;i--){const j=draw(random,0,i);[choices[i],choices[j]]=[choices[j],choices[i]];}
 return {current,operation,amount,answer,choices,instruction:operation==='add'?`Add ${amount}!`:`Take away ${amount}!`,equation:`${current} ${operation==='add'?'+':'−'} ${amount} = ?`};
}
export function createJourney(random=Math.random){
 let current=draw(random,MIN,MAX),hearts=3,question=makeQuestion(current,random);
 return {get current(){return current},get hearts(){return hearts},get question(){return question},choose(value){
  if(!question.choices.includes(value))throw new RangeError('Unknown destination');
  if(value===question.answer){current=value;hearts=Math.min(3,hearts+1);question=makeQuestion(current,random);return 'correct';}
  hearts--;if(hearts===0){current=draw(random,MIN,MAX);hearts=3;question=makeQuestion(current,random);return 'restart';}
  return 'wrong';
 }};
}
