function selectVoice(synth) {
  if (typeof synth.getVoices !== "function") return null;
  const voices = synth.getVoices() || [];
  if (!voices.length) return null;
  const english = voices.filter((v) => /^en\b/i.test(v.lang || ""));
  return (
    english.find((v) => v.localService && v.default) ||
    english.find((v) => v.localService) ||
    english.find((v) => v.default) ||
    english[0] ||
    null
  );
}

export function stopSpeaking() {
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
