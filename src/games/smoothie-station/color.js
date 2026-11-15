import { ingredientById, validateIngredient } from "./ingredients.js";
// Independent equal-volume average in OKLab. Conversion matrices:
// https://bottosson.github.io/posts/oklab/
export function toLab(hex) {
  const [r, g, b] = hex
    .match(/[0-9a-f]{2}/gi)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b),
    m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b),
    s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
export function fromLab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3,
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3,
    s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return (
    "#" +
    rgb
      .map((v) =>
        Math.round(
          Math.max(
            0,
            Math.min(
              1,
              v <= 0.0031308
                ? 12.92 * v
                : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055,
            ),
          ) * 255,
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
const labs = Object.fromEntries(
  Object.entries(ingredientById).map(([id, fruit]) => [id, toLab(fruit.color)]),
);
export const colorDistance = (a, b) =>
  Math.hypot(...toLab(a).map((v, i) => v - toLab(b)[i]));
export function mixSmoothie(portions) {
  if (!portions.length) return null;
  const counts = {};
  for (const id of portions) {
    validateIngredient(id);
    counts[id] = (counts[id] || 0) + 1;
  }
  const ids = Object.keys(counts).sort();
  if (ids.length === 1) return ingredientById[ids[0]].color;
  const mean = [0, 0, 0];
  for (const id of ids)
    for (let i = 0; i < 3; i++)
      mean[i] += (labs[id][i] * counts[id]) / portions.length;
  return fromLab(mean);
}
