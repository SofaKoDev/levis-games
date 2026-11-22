// @vitest-environment jsdom
import { it, expect, vi } from "vitest";
it("supports fast fruit taps, blending, continued recipes, serving and reset", async () => {
  document.body.innerHTML = '<div id="app"></div>';
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  await import("../src/games/smoothie-station/main.js");
  const $ = (s) => document.querySelector(s),
    fruit = (id) => $(`[data-fruit="${id}"]`).click();
  expect($("#blend").disabled).toBe(true);
  expect($(".home-link").getAttribute("href")).toBe("/");
  fruit("banana");
  fruit("blueberry");
  $("#blend").click();
  const first = $("#smoothie-name").textContent;
  expect($(".result-actions").hidden).toBe(false);
  for (let i = 0; i < 10; i++) fruit("banana");
  expect($("#recipe-status").textContent).toContain("12 portions");
  expect($('[data-count="banana"]').textContent).toBe("11");
  $("#blend").click();
  expect($("#smoothie-name").textContent).toMatch(/^Banana /);
  expect($("#smoothie-name").textContent).not.toBe(first);
  for (let i = 0; i < 10; i++) $("#undo-ingredient").click();
  $("#blend").click();
  expect($("#smoothie-name").textContent).toBe(first);
  $("#serve-smoothie").click();
  expect($(".smoothie-kitchen").dataset.phase).toBe("served");
  expect($(".fruit-tray").hidden).toBe(true);
  expect(document.activeElement).toBe($("#make-another"));
  $("#make-another").click();
  expect($("#recipe-status").textContent).toBe("Your blender is ready");
  expect($("#blend").disabled).toBe(true);
  for (let i = 0; i < 100; i++) fruit(i % 2 ? "kiwi" : "mango");
  expect($("#recipe-status").textContent).toContain("100 portions");
  $("#empty-blender").click();
  expect($("#recipe-status").textContent).toBe("Your blender is ready");
});
it("late decorative animation events cannot repopulate an emptied blender", async () => {
  vi.resetModules();
  document.body.innerHTML = '<div id="app"></div>';
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  await import("../src/games/smoothie-station/main.js");
  const $ = (s) => document.querySelector(s);
  for (let i = 0; i < 20; i++) $('[data-fruit="banana"]').click();
  const drops = [...document.querySelectorAll(".dropping-fruit")];
  expect(drops).toHaveLength(20);
  $("#blend").click();
  $("#empty-blender").click();
  for (const drop of drops) drop.dispatchEvent(new Event("animationend"));
  expect(document.querySelectorAll(".dropping-fruit")).toHaveLength(0);
  expect($("#recipe-status").textContent).toBe("Your blender is ready");
  expect($("#blend").disabled).toBe(true);
});

it("announces the smoothie name when blended and stops speech on reset", async () => {
  vi.resetModules();
  document.body.innerHTML = '<div id="app"></div>';
  const speakMock = vi.fn();
  const cancelMock = vi.fn();
  class MockUtterance {
    constructor(text) {
      this.text = text;
    }
  }
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  vi.stubGlobal("speechSynthesis", {
    speak: speakMock,
    cancel: cancelMock,
    getVoices: () => [],
  });
  vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

  await import("../src/games/smoothie-station/main.js");
  const $ = (s) => document.querySelector(s);
  $('[data-fruit="banana"]').click();
  $('[data-fruit="strawberry"]').click();
  expect(speakMock).not.toHaveBeenCalled();

  $("#blend").click();
  expect(speakMock).toHaveBeenCalledTimes(1);
  expect(speakMock.mock.calls[0][0].text).toBe(
    "You made Strawberry Banana Swirl Smoothie",
  );

  cancelMock.mockClear();
  $("#empty-blender").click();
  expect(cancelMock).toHaveBeenCalledTimes(1);
  vi.unstubAllGlobals();
});
