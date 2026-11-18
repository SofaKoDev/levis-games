/** Plays an action's actual frame list; no frame count is assumed. */
function createAnimationController(image, sequences, onActionChange = () => {}, assetRoot = 'output') {
  let action = 'idle';
  let frame = 0;
  let timer = null;

  function show() {
    const frames = sequences[action]?.frames ?? [];
    if (!frames.length) return;
    image.src = `${assetRoot}/${frames[frame].path}`;
    image.alt = `${action} pose ${frame + 1} of ${frames.length}`;
    image.dataset.action = action;
    image.dataset.frame = String(frame);
  }

  function play(nextAction = 'idle', fps = 5) {
    if (!sequences[nextAction]?.frames?.length) throw new Error(`No frames for ${nextAction}`);
    if (timer) clearInterval(timer);
    action = nextAction;
    frame = 0;
    onActionChange(action);
    show();
    const interval = Math.max(90, Math.round(1000 / fps));
    timer = setInterval(() => {
      const frames = sequences[action].frames;
      frame = (frame + 1) % frames.length;
      show();
    }, interval);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  play('idle');
  return { play, stop, destroy: stop, get action() { return action; } };
}

window.createAnimationController = createAnimationController;
