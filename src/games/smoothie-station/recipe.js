import { validateIngredient } from "./ingredients.js";
import { mixSmoothie } from "./color.js";
import { nameSmoothie } from "./naming.js";
export function createRecipe() {
  const portions = [];
  let phase = "adding";
  return {
    get portions() {
      return [...portions];
    },
    get phase() {
      return phase;
    },
    get counts() {
      return portions.reduce(
        (all, id) => ((all[id] = (all[id] || 0) + 1), all),
        {},
      );
    },
    get color() {
      return mixSmoothie(portions);
    },
    get name() {
      return nameSmoothie(portions);
    },
    add(id) {
      validateIngredient(id);
      if (phase === "served") return;
      portions.push(id);
      phase = "adding";
    },
    undo() {
      if (phase === "served") return;
      portions.pop();
      phase = "adding";
    },
    blend() {
      if (portions.length && phase !== "served") phase = "blended";
    },
    serve() {
      if (phase === "blended") phase = "served";
    },
    empty() {
      portions.length = 0;
      phase = "adding";
    },
    makeAnother() {
      this.empty();
    },
  };
}
