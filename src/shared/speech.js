let voicePlayer = null;
let playGeneration = 0;

function getVoicePlayer() {
  if (!voicePlayer && typeof globalThis.Audio === "function") {
    voicePlayer = new globalThis.Audio();
  }
  return voicePlayer;
}

function selectVoice(synth) {
  if (typeof synth.getVoices !== "function") return null;
  const voices = synth.getVoices() || [];
  if (!voices.length) return null;
  const english = voices.filter((v) => /^en\b/i.test(v.lang || ""));
  return (
    english.find((v) => /\bjenny\b/i.test(v.name || "")) ||
    english.find((v) => /\b(aria|samantha|ava|natural)\b/i.test(v.name || "")) ||
    english.find((v) => v.localService && v.default) ||
    english.find((v) => v.localService) ||
    english.find((v) => v.default) ||
    english[0] ||
    null
  );
}

export function voiceSlug(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function primeVoicePlayer() {
  return getVoicePlayer();
}

export function stopSpeaking() {
  playGeneration++;
  if (voicePlayer) {
    voicePlayer.onerror = null;
    try {
      voicePlayer.pause?.();
      voicePlayer.currentTime = 0;
    } catch {
      // Ignore audio element reset errors in restricted environments.
    }
  }
  try {
    globalThis.speechSynthesis?.cancel?.();
  } catch {
    // Ignore speech synthesis errors in restricted environments.
  }
}

export function speak(text, { rate = 0.95, pitch = 1.05, lang = "en-US" } = {}) {
  const message = String(text || "").trim();
  if (!message) return false;
  const synth = globalThis.speechSynthesis;
  const Utterance = globalThis.SpeechSynthesisUtterance;
  if (
    !synth ||
    typeof synth.speak !== "function" ||
    typeof Utterance !== "function"
  ) {
    return false;
  }
  try {
    synth.cancel?.();
    const utterance = new Utterance(message);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    const voice = selectVoice(synth);
    if (voice) utterance.voice = voice;
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function playVoiceClip(url, fallbackText = "") {
  stopSpeaking();
  const token = playGeneration;
  if (url) {
    const audio = getVoicePlayer();
    if (audio && typeof audio.play === "function") {
      try {
        audio.onerror = () => {
          if (token === playGeneration && fallbackText) {
            speak(fallbackText);
          }
        };
        audio.src = url;
        audio.load?.();
        const result = audio.play();
        result?.catch?.(() => {
          if (token === playGeneration && fallbackText) {
            speak(fallbackText);
          }
        });
        return true;
      } catch {
        // Fall back to speechSynthesis below.
      }
    }
  }
  return fallbackText ? speak(fallbackText) : false;
}

export function formatSmoothieAnnouncement(name) {
  const clean = String(name || "").trim();
  if (!clean) return "";
  return /\bsmoothie$/i.test(clean)
    ? `You made ${clean}`
    : `You made ${clean} Smoothie`;
}

export function formatColorAnnouncement(name) {
  const clean = String(name || "").trim();
  if (!clean) return "";
  return `You made the color ${clean}`;
}
