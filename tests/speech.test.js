// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  formatColorAnnouncement,
  formatSmoothieAnnouncement,
  speak,
  stopSpeaking,
} from "../src/shared/speech.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("speech helpers", () => {
  it("formats smoothie and color announcements", () => {
    expect(formatSmoothieAnnouncement("Strawberry Banana Swirl")).toBe(
      "You made Strawberry Banana Swirl Smoothie",
    );
    expect(formatSmoothieAnnouncement("Berry Smoothie")).toBe(
      "You made Berry Smoothie",
    );
    expect(formatSmoothieAnnouncement("")).toBe("");
    expect(formatColorAnnouncement("Green")).toBe("You made the color Green");
    expect(formatColorAnnouncement("")).toBe("");
  });

  it("speaks via speechSynthesis and cancels prior speech", () => {
    const speakMock = vi.fn();
    const cancelMock = vi.fn();
    const enVoice = { lang: "en-US", localService: true, default: true };
    class MockUtterance {
      constructor(text) {
        this.text = text;
      }
    }
    vi.stubGlobal("speechSynthesis", {
      speak: speakMock,
      cancel: cancelMock,
      getVoices: () => [enVoice],
    });
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    expect(speak("You made the color Purple")).toBe(true);
    expect(cancelMock).toHaveBeenCalledTimes(1);
    expect(speakMock).toHaveBeenCalledTimes(1);
    const utterance = speakMock.mock.calls[0][0];
    expect(utterance.text).toBe("You made the color Purple");
    expect(utterance.voice).toBe(enVoice);

    stopSpeaking();
    expect(cancelMock).toHaveBeenCalledTimes(2);
  });

  it("safely no-ops when speechSynthesis is unavailable", () => {
    vi.stubGlobal("speechSynthesis", undefined);
    vi.stubGlobal("SpeechSynthesisUtterance", undefined);
    expect(speak("Hello")).toBe(false);
    expect(() => stopSpeaking()).not.toThrow();
  });
});
