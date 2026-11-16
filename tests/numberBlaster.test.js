import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {makeQuestion,createJourney,voiceFile} from '../src/games/number-blaster/game.js';

it('keeps every question solvable with three unique answers from 1 through 20',()=>{
 for(let current=1;current<=20;current++)for(let seed=0;seed<100;seed++){
  let n=seed;const random=()=>((n=n*1664525+1013904223)>>>0)/2**32;
  const q=makeQuestion(current,random);
  expect(q.amount).toBeGreaterThanOrEqual(1);expect(q.amount).toBeLessThanOrEqual(19);
  expect(q.choices).toHaveLength(3);expect(new Set(q.choices).size).toBe(3);
  expect(q.choices.filter(value=>value===q.answer)).toHaveLength(1);
  expect(q.answer).toBe(current+(q.operation==='add'?q.amount:-q.amount));
  for(const value of q.choices)expect(value).toBeGreaterThanOrEqual(1);
  for(const value of q.choices)expect(value).toBeLessThanOrEqual(20);
 }
});

it('allows amounts above five when the answer still fits 1–20',()=>{
 const addDraws=[.1,.9],subtractDraws=[.9,.9];const addition=makeQuestion(10,()=>addDraws.shift()??.5),subtraction=makeQuestion(10,()=>subtractDraws.shift()??.5);
 expect(addition.operation).toBe('add');expect(addition.amount).toBeGreaterThan(5);expect(addition.answer).toBeLessThanOrEqual(20);
 expect(subtraction.operation).toBe('subtract');expect(subtraction.amount).toBeGreaterThan(5);expect(subtraction.answer).toBeGreaterThanOrEqual(1);
});

it('maps every valid prompt to its complete local Jenny recording',()=>{
 const manifest=JSON.parse(readFileSync('number-blaster/audio-manifest.json','utf8'));
 expect(Object.keys(manifest.files)).toHaveLength(380);
 for(let current=1;current<=20;current++)for(const operation of ['add','subtract'])for(let amount=1;amount<=19;amount++){
  const answer=current+(operation==='add'?amount:-amount);
  if(answer<1||answer>20)continue;
  const file=voiceFile({current,operation,amount}),entry=manifest.files[file];expect(entry).toBeDefined();
  expect(createHash('sha256').update(readFileSync(`number-blaster/audio/${file}`)).digest('hex')).toBe(entry.sha256);
 }
});

it('preserves the question after a miss, restores hearts on arrival, and restarts gently at zero',()=>{
 const journey=createJourney(()=>.3),first=journey.question,wrong=first.choices.find(v=>v!==first.answer);
 expect(journey.choose(wrong)).toBe('wrong');expect(journey.hearts).toBe(2);expect(journey.question).toBe(first);expect(journey.current).toBe(first.current);
 expect(journey.choose(first.answer)).toBe('correct');expect(journey.current).toBe(first.answer);expect(journey.hearts).toBe(3);
 for(let i=0;i<2;i++)expect(journey.choose(journey.question.choices.find(v=>v!==journey.question.answer))).toBe('wrong');
 expect(journey.choose(journey.question.choices.find(v=>v!==journey.question.answer))).toBe('restart');expect(journey.hearts).toBe(3);expect(journey.current).toBe(journey.question.current);
});
