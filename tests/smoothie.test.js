import { describe, it, expect } from "vitest";
import { createRecipe } from "../src/games/smoothie-station/recipe.js";
import {
  mixSmoothie,
  toLab,
  fromLab,
  colorDistance,
} from "../src/games/smoothie-station/color.js";
import { nameSmoothie } from "../src/games/smoothie-station/naming.js";
import {
  ingredients,
  ingredientById,
} from "../src/games/smoothie-station/ingredients.js";
describe("independent smoothie recipe", () => {
  it("starts empty and ignores invalid blend/serve actions", () => {
    const r = createRecipe();
    r.blend();
    r.serve();
    r.undo();
    expect(r.portions).toEqual([]);
    expect(r.color).toBeNull();
    expect(r.phase).toBe("adding");
  });
  it("counts different and repeated equal portions", () => {
    const r = createRecipe();
    r.add("banana");
    r.add("kiwi");
    r.add("banana");
    expect(r.counts).toEqual({ banana: 2, kiwi: 1 });
    expect(r.portions).toHaveLength(3);
  });
  it("undo removes exactly the last portion, even after blending", () => {
    const r = createRecipe();
    r.add("banana");
    const original = r.color;
    r.add("blueberry");
    r.blend();
    r.undo();
    expect(r.color).toBe(original);
    expect(r.portions).toEqual(["banana"]);
    expect(r.phase).toBe("adding");
  });
  it("blending preserves quantities and adding continues the same recipe", () => {
    const r = createRecipe();
    r.add("mango");
    r.add("mango");
    r.blend();
    expect(r.counts).toEqual({ mango: 2 });
    r.add("kiwi");
    expect(r.counts).toEqual({ mango: 2, kiwi: 1 });
    expect(r.phase).toBe("adding");
  });
  it("serves only a blended recipe and Make Another resets everything", () => {
    const r = createRecipe();
    r.add("grape");
    r.serve();
    expect(r.phase).toBe("adding");
    r.blend();
    r.serve();
    expect(r.phase).toBe("served");
    r.add("banana");
    expect(r.counts).toEqual({ grape: 1 });
    r.makeAnother();
    expect(r.phase).toBe("adding");
    expect(r.counts).toEqual({});
    expect(r.color).toBeNull();
  });
  it("empty resets a blended recipe", () => {
    const r = createRecipe();
    r.add("strawberry");
    r.blend();
    r.empty();
    expect(r.portions).toEqual([]);
    expect(r.phase).toBe("adding");
  });
  it("returned portions and counts cannot mutate the recipe", () => {
    const r = createRecipe();
    r.add("banana");
    r.portions.push("grape");
    r.counts.banana = 90;
    expect(r.counts).toEqual({ banana: 1 });
  });
  it("handles rapid alternating actions without losing or duplicating quantities", () => {
    const r = createRecipe();
    for (let i = 0; i < 300; i++) {
      r.add("banana");
      r.add("blueberry");
      r.blend();
      r.undo();
    }
    expect(r.counts).toEqual({ banana: 300 });
    r.empty();
    expect(r.color).toBeNull();
  });
  it("rejects unknown ingredients without corrupting the recipe", () => {
    const r = createRecipe();
    r.add("banana");
    expect(() => r.add("watermelon")).toThrow(TypeError);
    expect(r.counts).toEqual({ banana: 1 });
  });
});
describe("smoothie colors and quantity regressions", () => {
  it.each(ingredients)(
    "preserves pure $name and round-trips OKLab",
    ({ id, color }) => {
      expect(mixSmoothie([id, id])).toBe(color);
      expect(colorDistance(fromLab(toLab(color)), color)).toBeLessThan(0.002);
    },
  );
  it("known RGB primaries have standard OKLab coordinates", () => {
    const red = toLab("#ff0000");
    expect(red[0]).toBeCloseTo(0.627955, 5);
    expect(red[1]).toBeCloseTo(0.224863, 5);
    expect(red[2]).toBeCloseTo(0.125846, 5);
  });
  it("weights by count in perceptual space", () => {
    const actual = toLab(mixSmoothie(["banana", "banana", "blueberry"]));
    const a = toLab(ingredientById.banana.color),
      b = toLab(ingredientById.blueberry.color);
    for (let i = 0; i < 3; i++)
      expect(actual[i]).toBeCloseTo((2 * a[i] + b[i]) / 3, 2);
  });
  it("is independent of order for both color and name", () => {
    const portions = ["banana", "kiwi", "blueberry", "banana", "mango"];
    expect(mixSmoothie(portions)).toBe(mixSmoothie([...portions].reverse()));
    expect(nameSmoothie(portions)).toBe(nameSmoothie([...portions].reverse()));
  });
  it.each(["banana", "blueberry"])(
    "more %s progressively dominates color and name",
    (id) => {
      const portions = ["banana", "blueberry"],
        target = ingredientById[id].color;
      let previous = colorDistance(mixSmoothie(portions), target);
      const initialName = nameSmoothie(portions);
      for (let i = 0; i < 10; i++) {
        portions.push(id);
        const distance = colorDistance(mixSmoothie(portions), target);
        expect(distance).toBeLessThan(previous);
        previous = distance;
      }
      expect(nameSmoothie(portions)).toMatch(
        new RegExp(`^${ingredientById[id].name} `),
      );
      expect(nameSmoothie(portions)).not.toBe(initialName);
      expect(previous).toBeLessThan(0.04);
    },
  );
  it("validates varied hundred-portion mixtures", () => {
    for (let seed = 0; seed < 60; seed++) {
      const portions = Array.from(
        { length: 100 },
        (_, i) =>
          ingredients[(i * i + seed * i + seed) % ingredients.length].id,
      );
      expect(mixSmoothie(portions)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
describe("hybrid naming", () => {
  it.each([
    [["strawberry", "banana"], "Strawberry Banana Swirl"],
    [["blueberry", "grape"], "Purple Monster"],
    [["mango", "banana"], "Sunshine Shake"],
    [["kiwi", "grape"], "Wiggly Goblin"],
    [["strawberry", "blueberry"], "Dragon Berry Blast"],
    [["strawberry", "banana", "blueberry", "mango"], "Rainbow Rocket"],
  ])("recognizes balanced recipe %j", (recipe, name) =>
    expect(nameSmoothie(recipe)).toBe(name),
  );
  it("does not let a special recipe lock an increasingly banana-heavy mix", () =>
    expect(nameSmoothie(["strawberry", ...Array(11).fill("banana")])).toMatch(
      /^Banana /,
    ));
  it("does not mention absent fruit in generated unusual recipes", () => {
    const name = nameSmoothie(["kiwi", "mango", "grape"]);
    for (const absent of ["Banana", "Strawberry", "Blueberry"])
      expect(name).not.toContain(absent);
    expect(name).toBe(nameSmoothie(["grape", "kiwi", "mango"]));
  });
});
