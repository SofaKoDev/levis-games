import { readFileSync, existsSync } from "node:fs";
import { resolve, sep } from "node:path";
const base = process.env.PAGES_BASE_PATH || "/";
if (!base.startsWith("/") || !base.endsWith("/"))
  throw new Error("The production base must start and end with /");
const root = resolve("dist");
for (const [path, title] of [
  ["index.html", "Levi's Games"],
  ["color-lab/index.html", "Levi's Color Lab"],
  ["smoothie-station/index.html", "Levi's Smoothie Station"],
]) {
  const html = readFileSync(resolve(root, path), "utf8");
  if (!html.includes(`<title>${title}</title>`))
    throw new Error(`Wrong title in ${path}`);
  for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (!url.startsWith(base))
      throw new Error(`Asset outside base path: ${url}`);
    const file = resolve(root, url.slice(base.length));
    if (!file.startsWith(root + sep) || !existsSync(file))
      throw new Error(`Missing or invalid asset in ${path}: ${url}`);
  }
}
for (const name of ["spectral.js", "color-name"])
  if (!existsSync(resolve(root, `licenses/${name}.txt`)))
    throw new Error(`Missing license for ${name}`);
console.log(
  `Verified all three static entries, local assets and licenses under ${base}`,
);
