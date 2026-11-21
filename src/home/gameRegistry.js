export const games = [
  {id:'number-blaster',title:'Number Blaster',description:'Solve math puzzles and fly through space!',label:"Play Levi's Number Blaster",accent:'snow',art:'number'},
  {id:'sound-lab',title:'Sound It Out',description:'Learn to read by putting letter sounds together!',label:"Play Levi's Sound It Out",accent:'peach',art:'phonics'},
  {id:'little-monsters',title:'Little Monsters',description:'Care for a magical monster friend!',label:"Play Levi's Little Monsters",accent:'mint',art:'monsters'},
  {id:'color-lab',title:'Color Lab',description:'Mix colors and discover new shades!',label:"Play Levi's Color Lab",accent:'mint',art:'color'},
  {id:'smoothie-station',title:'Smoothie Station',description:'Mix fruit and make silly smoothies!',label:"Play Levi's Smoothie Station",accent:'peach',art:'smoothie'},
  {id:'snow-run',title:'Snow Run',description:'Ski down the mountain and collect winter goodies!',label:"Play Levi's Snow Run",accent:'snow',art:'snow'},
  {id:'christmas-tree',title:'Christmas Tree',description:'Decorate your own magical Christmas tree!',label:"Play Levi's Christmas Tree",accent:'mint',art:'christmas',category:'Creative Play',icon:'🎄'},
  {id:'bowling',title:'Bouncy Bowling',description:'Roll the ball, bounce off bumpers, and knock down the pins!',label:"Play Levi's Bouncy Bowling",accent:'peach',art:'bowling',href:'https://sofakodev.github.io/bowling/'},
  {id:'holeo',title:'Holeo',description:'Grow your cozy hole bigger and gobble up the whole town!',label:"Play Levi's Holeo",accent:'snow',art:'holeo',href:'https://sofakodev.github.io/holeo/'},
];
export const gameUrl = (gameOrId) => {
  if (typeof gameOrId === 'object' && gameOrId !== null) {
    return gameOrId.href ?? `${import.meta.env.BASE_URL}${gameOrId.id}/`;
  }
  return `${import.meta.env.BASE_URL}${gameOrId}/`;
};
