// @vitest-environment jsdom
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi, afterEach } from "vitest";
import { namedColors } from "../src/colorNames.js";
import { presets } from "../src/colorPresets.js";
import { ingredients } from "../src/games/smoothie-station/ingredients.js";
import {
  formatColorAnnouncement,
  formatSmoothieAnnouncement,
  playVoiceClip,
  speak,
  stopSpeaking,
  voiceSlug,
} from "../src/shared/speech.js";

afterEach(() => {
  stopSpeaking();
  vi.unstubAllGlobals();
});

describe("speech helpers", () => {
  it("formats smoothie and color announcements and slugs", () => {
    expect(formatSmoothieAnnouncement("Strawberry Banana Swirl")).toBe(
      "You made Strawberry Banana Swirl Smoothie",
    );
    expect(formatSmoothieAnnouncement("Berry Smoothie")).toBe(
      "You made Berry Smoothie",
    );
    expect(formatSmoothieAnnouncement("")).toBe("");
    expect(formatColorAnnouncement("Green")).toBe("You made the color Green");
    expect(formatColorAnnouncement("")).toBe("");
    expect(voiceSlug("Blue-green")).toBe("blue-green");
    expect(voiceSlug("Strawberry Banana Swirl")).toBe("strawberry-banana-swirl");
  });

  it("plays local Jenny clips via Audio and stops cleanly", async () => {
    vi.resetModules();
    const instances = [];
    class MockAudio {
      constructor() {
        this.src = "";
        this.currentTime = 0;
        this.load = vi.fn();
        this.play = vi.fn(() => Promise.resolve());
        this.pause = vi.fn();
        instances.push(this);
      }
    }
    vi.stubGlobal("Audio", MockAudio);
    const mod = await import("../src/shared/speech.js");

    expect(mod.playVoiceClip("/color-lab/audio/red.mp3", "You made the color Red")).toBe(
      true,
    );
    expect(instances).toHaveLength(1);
    expect(instances[0].src).toBe("/color-lab/audio/red.mp3");
    expect(instances[0].play).toHaveBeenCalledTimes(1);

    mod.stopSpeaking();
    expect(instances[0].pause).toHaveBeenCalledTimes(1);
  });

  it("falls back to speechSynthesis when no local clip is available", () => {
    const speakMock = vi.fn();
    const cancelMock = vi.fn();
    const jennyVoice = {
      name: "Microsoft Jenny Online (Natural)",
      lang: "en-US",
      localService: false,
      default: false,
    };
    const localVoice = {
      name: "Microsoft David",
      lang: "en-US",
      localService: true,
      default: true,
    };
    class MockUtterance {
      constructor(text) {
        this.text = text;
      }
    }
    vi.stubGlobal("speechSynthesis", {
      speak: speakMock,
      cancel: cancelMock,
      getVoices: () => [localVoice, jennyVoice],
    });
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    expect(playVoiceClip(undefined, "You made the color Purple")).toBe(true);
    expect(speakMock).toHaveBeenCalledTimes(1);
    const utterance = speakMock.mock.calls[0][0];
    expect(utterance.text).toBe("You made the color Purple");
    expect(utterance.voice).toBe(jennyVoice);
  });

  it("falls back to speechSynthesis only once when both onerror and play rejection fire", async () => {
    vi.resetModules();
    const speakMock = vi.fn();
    const cancelMock = vi.fn();
    class MockUtterance {
      constructor(text) {
        this.text = text;
      }
    }
    let lastAudio = null;
    class FailingAudio {
      constructor() {
        this.src = "";
        this.currentTime = 0;
        this.onerror = null;
        this.load = vi.fn();
        this.pause = vi.fn();
        this.play = vi.fn(() => {
          this.onerror?.(new Event("error"));
          return Promise.reject(new Error("decode failed"));
        });
        lastAudio = this;
      }
    }
    vi.stubGlobal("Audio", FailingAudio);
    vi.stubGlobal("speechSynthesis", {
      speak: speakMock,
      cancel: cancelMock,
      getVoices: () => [],
    });
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    const mod = await import("../src/shared/speech.js");
    expect(mod.playVoiceClip("/missing/clip.mp3", "Fallback phrase")).toBe(true);
    await Promise.resolve();
    await Promise.resolve();

    expect(lastAudio).not.toBeNull();
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0].text).toBe("Fallback phrase");
  });

  it("safely no-ops when Audio and speechSynthesis are unavailable", () => {
    vi.stubGlobal("Audio", undefined);
    vi.stubGlobal("speechSynthesis", undefined);
    vi.stubGlobal("SpeechSynthesisUtterance", undefined);
    expect(speak("Hello")).toBe(false);
    expect(() => stopSpeaking()).not.toThrow();
  });

  it("has a generated local Jenny MP3 for every Color Lab color and Smoothie Station recipe", () => {
    const colors = new Set([
      ...presets.map((p) => p.name),
      ...namedColors.map((c) => c.name),
    ]);
    for (const name of colors) {
      const file = resolve("color-lab/audio", `${voiceSlug(name)}.mp3`);
      expect(existsSync(file), `Missing Color Lab clip: ${file}`).toBe(true);
      expect(statSync(file).size).toBeGreaterThan(1000);
    }

    const smoothies = new Set([
      "Strawberry Banana Swirl",
      "Purple Monster",
      "Sunshine Shake",
      "Wiggly Goblin",
      "Dragon Berry Blast",
      "Rainbow Rocket",
    ]);
    const descriptors = ["Pink", "Golden", "Purple", "Green", "Peachy"];
    const topWords = ["Sunshine", "Wiggly", "Magic"];
    for (const a of ingredients) {
      for (const w of topWords) {
        smoothies.add(`${a.name} ${w} Shake`);
        smoothies.add(`${a.name} ${w} Swirl`);
      }
      for (const b of ingredients) {
        if (a.id !== b.id) smoothies.add(`${a.name} ${b.name} Splash`);
      }
      for (const d of descriptors) {
        smoothies.add(`${d} ${a.name} Rocket`);
        smoothies.add(`${d} ${a.name} Splash`);
      }
    }
    for (const name of smoothies) {
      const file = resolve("smoothie-station/audio", `${voiceSlug(name)}.mp3`);
      expect(existsSync(file), `Missing Smoothie Station clip: ${file}`).toBe(true);
      expect(statSync(file).size).toBeGreaterThan(1000);
    }
  });
});
