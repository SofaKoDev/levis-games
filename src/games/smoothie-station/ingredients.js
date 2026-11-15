export const ingredients = [
  { id: "strawberry", name: "Strawberry", color: "#f16f91" },
  { id: "banana", name: "Banana", color: "#f4d475" },
  { id: "blueberry", name: "Blueberry", color: "#777bc8" },
  { id: "mango", name: "Mango", color: "#f7ac50" },
  { id: "grape", name: "Grape", color: "#a47cbd" },
  { id: "kiwi", name: "Kiwi", color: "#a1c76b" },
];
export const ingredientById = Object.fromEntries(
  ingredients.map((fruit) => [fruit.id, fruit]),
);
export function validateIngredient(id) {
  if (!Object.hasOwn(ingredientById, id))
    throw new TypeError(`Unknown fruit: ${id}`);
}
