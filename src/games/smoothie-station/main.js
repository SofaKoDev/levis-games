import "./styles.css";
import { addHomeLink } from "../../shared/navigation.js";
import {
  formatSmoothieAnnouncement,
  playVoiceClip,
  primeVoicePlayer,
  stopSpeaking,
  voiceSlug,
} from "../../shared/speech.js";
const voiceAssets = import.meta.glob("/smoothie-station/audio/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
});
import { ingredients } from "./ingredients.js";
import { createRecipe } from "./recipe.js";
import { fruitArt, fruitShape, kitchenArt } from "./art.js";
document.body.classList.add("smoothie-body");
document.querySelector("#app").innerHTML =
  `<main class="smoothie-kitchen"><header class="smoothie-header"><h1>Levi's <span>Smoothie Station</span></h1><p>A little fruit. A lot of happy.</p></header><section class="smoothie-scene" aria-label="Your smoothie kitchen"><div class="recipe-heading"><div class="kitchen-eyebrow" id="recipe-stage">LET'S MAKE SOMETHING YUMMY</div><h2 id="smoothie-name" aria-live="polite">Pick your fruit!</h2></div><div class="blender-stage">${kitchenArt}<div class="fruit-drop-layer" aria-hidden="true"></div></div><p class="recipe-status" id="recipe-status" aria-live="polite">Your blender is ready</p></section>
<section class="fruit-tray" aria-label="Add fruit"><div class="tray-label">TAP A FRUIT TO POP IT IN <span aria-hidden="true">↓</span></div><div class="fruit-grid">${ingredients.map((f) => `<button class="fruit-button" data-fruit="${f.id}" aria-label="Add ${f.name}" style="--fruit-color:${f.color}">${fruitArt(f.id)}<span class="fruit-name">${f.name}</span><span class="fruit-quantity" data-count="${f.id}" aria-hidden="true" hidden></span></button>`).join("")}</div></section>
<section class="smoothie-actions" aria-label="Blender controls"><button id="blend" class="blend-button" disabled><span aria-hidden="true">✳</span> Blend!</button><div class="recipe-tools"><button id="undo-ingredient" disabled>↶ Undo Last Ingredient</button><button id="empty-blender" disabled>Empty Blender</button></div><div class="result-actions" hidden><button id="serve-smoothie">Serve Smoothie <span aria-hidden="true">♡</span></button><button id="make-another">Make Another <span aria-hidden="true">＋</span></button></div></section><p class="kitchen-footer">Every recipe is a happy little experiment.</p></main>`;
const $ = (s) => document.querySelector(s),
  recipe = createRecipe();
addHomeLink($(".smoothie-kitchen"));
function decorateDrop(id) {
  if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
    return;
  const drop = document.createElement("span");
  drop.className = "dropping-fruit";
  drop.innerHTML = fruitArt(id);
  $(".fruit-drop-layer").append(drop);
  drop.addEventListener("animationend", () => drop.remove(), { once: true });
}
function animateScene(name) {
  const scene = $(".blender-stage");
  scene.classList.remove("is-blending", "is-serving");
  // Restart decoration only; recipe state is committed synchronously on every tap.
  void scene.offsetWidth;
  scene.classList.add(name);
}
function render() {
  const portions = recipe.portions,
    counts = recipe.counts,
    n = portions.length,
    blended = recipe.phase !== "adding",
    served = recipe.phase === "served";
  $(".smoothie-kitchen").dataset.phase = recipe.phase;
  $("#recipe-stage").textContent = served
    ? "A LITTLE CUP OF HAPPY"
    : blended
      ? "LOOK WHAT YOU MADE"
      : "LET'S MAKE SOMETHING YUMMY";
  $("#smoothie-name").textContent = served
    ? `Yum! ${recipe.name}`
    : blended
      ? recipe.name
      : n
        ? "Ready for a whirl?"
        : "Pick your fruit!";
  $("#recipe-status").textContent = n
    ? `${n} ${n === 1 ? "portion" : "portions"} · ${served ? "Served with a smile!" : blended ? "Add more fruit or serve it up!" : "Add more fruit, then blend!"}`
    : "Your blender is ready";
  const color = recipe.color || "#f4d475";
  $("#smoothie-liquid").setAttribute("fill", color);
  $("#smoothie-liquid").setAttribute(
    "y",
    blended ? String(195 - Math.min(133, 28 + n * 10)) : "195",
  );
  $("#cup-liquid").setAttribute("fill", color);
  $("#pour-stream").setAttribute("stroke", color);
  $("#fruit-pieces").innerHTML = blended
    ? ""
    : portions
        .slice(-15)
        .map(
          (id, i) =>
            `<g transform="translate(${135 + (i % 3) * 25} ${154 - Math.floor(i / 3) * 23}) rotate(${i % 2 ? 12 : -9} 15 15) scale(.5)">${fruitShape(id)}</g>`,
        )
        .join("");
  $("#swirl-lines").style.opacity = blended ? "1" : "0";
  $(".kitchen-art").setAttribute(
    "aria-label",
    served
      ? `A cup of ${recipe.name}`
      : blended
        ? `Blended ${recipe.name}`
        : n
          ? `Blender with ${n} fruit portions`
          : "An empty blender on a wooden kitchen counter",
  );
  for (const f of ingredients) {
    const count = $(`[data-count="${f.id}"]`),
      button = $(`[data-fruit="${f.id}"]`);
    count.hidden = !counts[f.id];
    count.textContent = counts[f.id] || "";
    button.setAttribute(
      "aria-label",
      `Add ${f.name}${counts[f.id] ? `, ${counts[f.id]} ${counts[f.id] === 1 ? "portion" : "portions"} in blender` : ""}`,
    );
    button.disabled = served;
  }
  $("#blend").disabled = !n || served;
  $("#blend").hidden = blended;
  $(".recipe-tools").hidden = served;
  $("#undo-ingredient").disabled = $("#empty-blender").disabled = !n;
  $(".result-actions").hidden = !blended;
  $("#serve-smoothie").hidden = served;
  $(".fruit-tray").hidden = served;
}
for (const button of document.querySelectorAll("[data-fruit]"))
  button.addEventListener("click", () => {
    stopSpeaking();
    recipe.add(button.dataset.fruit);
    render();
    decorateDrop(button.dataset.fruit);
  });
$("#blend").addEventListener("click", () => {
  primeVoicePlayer();
  recipe.blend();
  render();
  animateScene("is-blending");
  if (recipe.phase === "blended") {
    const url =
      voiceAssets[`/smoothie-station/audio/${voiceSlug(recipe.name)}.mp3`];
    playVoiceClip(url, formatSmoothieAnnouncement(recipe.name));
  }
});
$("#undo-ingredient").addEventListener("click", () => {
  stopSpeaking();
  recipe.undo();
  render();
});
function clearDecorations() {
  $(".blender-stage").classList.remove("is-blending", "is-serving");
  $(".fruit-drop-layer").replaceChildren();
}
$("#empty-blender").addEventListener("click", () => {
  stopSpeaking();
  recipe.empty();
  render();
  clearDecorations();
});
$("#serve-smoothie").addEventListener("click", () => {
  recipe.serve();
  render();
  animateScene("is-serving");
  $("#make-another").focus({ preventScroll: true });
});
$("#make-another").addEventListener("click", () => {
  stopSpeaking();
  recipe.makeAnother();
  render();
  clearDecorations();
  document.querySelector("[data-fruit]").focus({ preventScroll: true });
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopSpeaking();
});
render();
