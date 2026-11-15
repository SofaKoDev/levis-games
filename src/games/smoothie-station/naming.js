import { ingredientById } from "./ingredients.js";
import { mixSmoothie, colorDistance } from "./color.js";
const specials = {
  "banana+strawberry": "Strawberry Banana Swirl",
  "blueberry+grape": "Purple Monster",
  "banana+mango": "Sunshine Shake",
  "grape+kiwi": "Wiggly Goblin",
  "blueberry+strawberry": "Dragon Berry Blast",
};
const palette = [
  ["Pink", "#ed8cab"],
  ["Golden", "#efc76b"],
  ["Purple", "#9d88bd"],
  ["Green", "#a3c67c"],
  ["Peachy", "#efad83"],
];
export function describeColor(color) {
  return [...palette].sort(
    (a, b) => colorDistance(color, a[1]) - colorDistance(color, b[1]),
  )[0][0];
}
export function nameSmoothie(portions) {
  if (!portions.length) return "A little fruit, a little magic!";
  const color = mixSmoothie(portions),
    counts = {};
  for (const id of portions) counts[id] = (counts[id] || 0) + 1;
  const ids = Object.keys(counts).sort(),
    ranked = [...ids].sort(
      (a, b) => counts[b] - counts[a] || a.localeCompare(b),
    );
  const top = ranked[0],
    share = counts[top] / portions.length;
  // Specials require balanced exact recipes; presence alone never locks a name.
  if (ids.length === 2 && share <= 2 / 3 && specials[ids.join("+")])
    return specials[ids.join("+")];
  if (
    ids.join("+") === "banana+blueberry+mango+strawberry" &&
    share <= 0.4 &&
    Math.min(...Object.values(counts)) / portions.length >= 0.15
  )
    return "Rainbow Rocket";
  const descriptor = describeColor(color);
  if (share >= 0.6)
    return `${ingredientById[top].name} ${descriptor === "Golden" ? "Sunshine" : descriptor === "Green" ? "Wiggly" : "Magic"} ${ids.length === 1 ? "Shake" : "Swirl"}`;
  if (ids.length === 2)
    return `${ingredientById[ranked[0]].name} ${ingredientById[ranked[1]].name} Splash`;
  return `${descriptor} ${ingredientById[top].name} ${ids.length >= 4 ? "Rocket" : "Splash"}`;
}
