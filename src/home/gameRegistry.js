export const games = [
  {id:'color-lab',title:'Color Lab',description:'Mix colors and discover new shades!',label:"Play Levi's Color Lab",accent:'mint',art:'color'},
  {id:'smoothie-station',title:'Smoothie Station',description:'Mix fruit and make silly smoothies!',label:"Play Levi's Smoothie Station",accent:'peach',art:'smoothie'},
{id:'christmas-tree',title:"Levi's Christmas Tree",description:'Decorate your own magical Christmas tree!',label:"Play Levi's Christmas Tree",accent:'mint',art:'christmas',category:'Creative Play',icon:'🎄'},
];
export const gameUrl=id=>`${import.meta.env.BASE_URL}${id}/`;
