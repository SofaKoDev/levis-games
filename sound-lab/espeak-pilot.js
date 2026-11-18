const voice = document.querySelector('#voice');
const players = [...document.querySelectorAll('audio[data-clip]')];
const status = document.querySelector('#voice-status');
const nasal = document.querySelector('[data-clip="09-n-held"]');
const duration = document.querySelector('#n-duration');
const stopAll = () => { for (const player of players) player.pause(); };
const updateDuration = () => {
  duration.textContent = Number.isFinite(nasal.duration)
    ? `${nasal.duration.toFixed(2)} seconds total. Pronunciation still needs listening review.`
    : 'Loading duration…';
};
nasal.addEventListener('loadedmetadata', updateDuration);
updateDuration();
voice.addEventListener('change', () => {
  stopAll();
  const folder = `./pilot/espeak/voices/${voice.value}/`;
  for (const player of players) {
    player.querySelector('source').src = `${folder}${player.dataset.clip}.wav`;
    player.load();
  }
  document.querySelector('#manifest').href = `${folder}manifest.json`;
  status.textContent = `${voice.selectedOptions[0].textContent} selected. Playback stopped; choose a sound to listen.`;
  updateDuration();
});
for (const player of players) {
  player.addEventListener('play', () => {
    for (const other of players) if (other !== player) other.pause();
  });
  player.addEventListener('error', () => {
    status.textContent = 'A local recording could not load. Select another voice or refresh to retry.';
  });
}
window.addEventListener('pagehide', stopAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); });
