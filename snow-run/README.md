# Levi's Snow Run — local review only

The owner approved the preview, homepage integration and remote publication. The game uses the existing GitHub Pages workflow. Public route: https://sofakodev.github.io/levis-games/snow-run/. No deployment workflow changes are required.

## Preview

From the project directory in PowerShell:

```powershell
node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5177
```

Open http://localhost:5177/snow-run/. For another device on the same trusted Wi-Fi, use the server's printed Network address followed by `/snow-run/`. The current preview host reports http://192.168.86.55:5177/snow-run/. The computer must stay awake; allow Node only on Private networks if Windows Firewall prompts. Do not forward this port through the router. Ctrl+C stops the server.

## Verification

```powershell
node node_modules/vitest/vitest.mjs run
node node_modules/vite/bin/vite.js build --config snow-run/vite.preview.config.js
pnpm run build
```

The separate preview build writes `dist-snow-preview` (ignored by Git). The normal production build now includes Snow Run after preview approval. To verify the eventual Pages subpath in the isolated build, set `$env:PAGES_BASE_PATH='/levis-games/'` before that preview build. It does not modify the production input list.

## Design and controls

- Canvas artwork is original; spectators use device emoji glyphs. No external assets or dependencies are introduced.
- The player stays at 70% of the Canvas height. Objects scroll by their world distance; the finish line approaches before the player reaches exactly 500 m. The skier's skis cross the visible line when the simulation finishes.
- Speed is 13 m/s: about 38.5 seconds of active skiing. No lives, countdown, ranking or online score storage.
- Arrow keys/A/D, large hold-to-steer buttons, or drag anywhere on the snow. Pointer capture and `touch-action:none` keep steering gestures within the game.
- Pause and visibility/blur handlers freeze the simulation. Resume resets the frame clock and clears held inputs. A single animation loop survives restarts; simulation advances in small elapsed-time substeps, capped to 0.1 seconds per frame to avoid large jumps.
- Every collectible and obstacle has its own consumed flag. Collisions grant 1.3 seconds of protection; spectators never enter collision detection.
- Objects are generated once per round, with an open center corridor and no objects in the final 35 meters. Configurable collectible weights live in `engine.js` (60% cocoa, 28% mittens, 12% hats).
- The multiplier is recomputed from cumulative totals, including all penalties: `max(1, 1 + 2C + 3M + 5H - 2O)`. Score is `floor(distance) * multiplier`. Both freeze at the finish.
- The final tally counts up, with a Show final score button to skip. Reduced motion skips the count-up and decorative movement. Sound is synthesized locally, off by default, and activated only by the Sound button.

## Files

`src/games/snow-run/engine.js` contains course generation, motion, collisions, scoring and round state. `render.js` draws the mountain and skier. `input.js` handles keyboard and pointers. `audio.js` provides soft optional tones. `main.js` owns the sole game loop, HUD, pause/start/restart and celebration UI. `styles.css` handles portrait, landscape and reduced motion. Automated logic regressions are in `tests/snowRun.test.js`.

Physical iPhone/Android testing remains necessary. Emoji appearance varies by device. Background tabs pause rather than silently advancing. Progress is intentionally per-round and is not persisted.

## Approval stages

First review and approve the local game. Only then add its registry entry and production route and run final regressions. Homepage approval alone does not authorize a Git commit or remote publication; obtain the separately requested authorization before committing, pushing or deploying.

Verification in this OneDrive checkout passed all 90 tests using `node node_modules/vitest/vitest.mjs run --no-isolate`; default isolated workers intermittently hit existing EBUSY file locks while opening jsdom files. The normal production build and isolated preview build both succeeded. Desktop browser checks covered a complete 500-meter run and correct final tally, keyboard steering, pointer button/drag steering, pause/resume, restart and portrait/landscape layouts. No physical phone testing is claimed.

Preview revision: faster scroll with a closer camera, pickups spaced 22 meters apart (21 total rather than 50), no pickup circles, illustrated mittens with thumbs and cuffs, and speech bubbles anchored beside the animal spectators.

Second speed revision: cruising speed is now 13 m/s. A collision reduces it to 35% and smoothly restores full speed during the 1.3-second protected recovery. The skier never stops or loses progress; collisions extend the run naturally.

Preview integration and remote publication were separately approved by the owner. Confirm deployment success in GitHub Actions.
