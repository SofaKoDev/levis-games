export const games = [
  {id:'color-lab',title:'Color Lab',description:'Mix colors and discover new shades!',label:"Play Levi's Color Lab",accent:'mint',art:'color'},
  {id:'smoothie-station',title:'Smoothie Station',description:'Mix fruit and make silly smoothies!',label:"Play Levi's Smoothie Station",accent:'peach',art:'smoothie'},
{id:'snow-run',title:'Snow Run',description:'Ski down the mountain and collect winter goodies!',label:"Play Levi's Snow Run",accent:'snow',art:'snow'},
{id:'christmas-tree',title:"Levi's Christmas Tree",description:'Decorate your own magical Christmas tree!',label:"Play Levi's Christmas Tree",accent:'mint',art:'christmas',category:'Creative Play',icon:'🎄'},
{id:'sound-lab',title:"Levi's Sound It Out",description:'Learn to read by putting letter sounds together!',label:"Play Levi's Sound It Out",accent:'peach',art:'phonics'},
];
export const gameUrl=id=>`${import.meta.env.BASE_URL}${id}/`;
