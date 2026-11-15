# Levi's Games

**Little games. Big imagination.** A free collection of toddler-friendly browser games, designed for iPhone Safari. No accounts, advertising, analytics, external APIs or backend.

- **Color Lab:** the original paint-mixing game, preserved with its own spectral mixing and naming engines.
- **Smoothie Station:** a cozy fruit-mixing kitchen with six fruits, quantity-aware colors and playful recipe names.

## Publication and migration

Repository: https://github.com/SofaKoDev/levis-games

Website: https://sofakodev.github.io/levis-games/

- Color Lab: https://sofakodev.github.io/levis-games/color-lab/
- Smoothie Station: https://sofakodev.github.io/levis-games/smoothie-station/

The existing public repository was renamed with owner approval; its history was preserved. Update old `/levis-color-lab/` bookmarks to the new website address. The final publication is confirmed only by a successful Actions deployment.

## Local development (Windows PowerShell)

Install Node.js 22 or later, including npm, then open PowerShell in your checkout:

```powershell
npm.cmd install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm run dev
```

Open http://localhost:5173/. To use an iPhone on the same trusted Wi-Fi, open `http://YOUR-PC-IP:5173/` in Safari. Find the Wi-Fi IPv4 address using `ipconfig`. Allow Node through Windows Firewall on Private networks only; never forward the development port through the router. The computer must remain awake. Ctrl+C stops the server.

In the prepared environment, dependencies are installed. Direct alternatives:

```powershell
node node_modules/vite/bin/vite.js --host 0.0.0.0
node node_modules/vitest/vitest.mjs run
node node_modules/vite/bin/vite.js build
node scripts/copy-licenses.js
node scripts/check-build.js
```

## Test and production build

```powershell
pnpm run test
pnpm run build
pnpm run preview
```

Preview defaults to http://localhost:4173/. To verify the exact Pages subpath locally:

```powershell
$env:PAGES_BASE_PATH='/levis-games/'
pnpm run build
pnpm run preview
```

Then open http://localhost:4173/levis-games/. Remove the override with `Remove-Item Env:PAGES_BASE_PATH` to return to root hosting. The built `dist` folder contains all runtime assets and license notices; it needs no internet or Node runtime when served by a local static server. Vite preview is for local review, not public server hosting. A future Ubuntu server can serve `dist` with Nginx; use `/` as the base when hosting at a domain root.

## Static routing and project layout

Vite builds three actual HTML entries: `index.html`, `color-lab/index.html`, and `smoothie-station/index.html`. GitHub Pages serves each directory's index directly, including on refresh and direct navigation. Ordinary anchor links support browser back/forward without a routing framework or a 404 redirect workaround. Reloading or leaving a game resets its current recipe; nothing is stored remotely.

- `src/home/`: home page, original SVG illustrations and reusable game registry.
- `src/shared/`: shared Home navigation.
- `src/main.js`, `src/styles.css`: preserved Color Lab interface, with Home navigation added.
- `src/colorMixing.js`, `src/colorNames.js`, `src/colorPresets.js`, `src/animations.js`: existing independent Color Lab modules.
- `src/games/smoothie-station/`: separate Smoothie Station logic and interface.
- `tests/`: regression, state, naming, color and UI checks.
- `.github/workflows/deploy.yml`: test, build and Pages deployment.

To add a game, create a directory with its `index.html` entry and independent source module, register that HTML in `vite.config.js`, then add its title, description, illustration and route to `src/home/gameRegistry.js`. Use `import.meta.env.BASE_URL` for navigation. The registry automatically updates the home cards. Artwork is original local SVG; no remotely hosted images or fonts are needed.

## GitHub Pages and future updates

The public repository uses free GitHub Pages hosting. Settings → Pages → Source must be **GitHub Actions**. Pushes to `main` and manual workflow dispatches run locked dependency installation, all tests, a multi-page build, generated-page/asset checks, and deployment. The production base path derives from the actual repository name, so a rename does not require hardcoding a username or path in the workflow. Deployment waits for successful tests and build; concurrent deployments are serialized. Runtime dependencies and their MIT notices are bundled locally.

After editing:

```powershell
pnpm run test
pnpm run build
git add .
git diff --cached
git commit -m "Describe the update"
git push origin main
```

Follow the run in the repository's Actions tab. If Git uses a different credential manager from GitHub CLI, authenticate that manager or use `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push origin main` after `gh auth login`. Never put credentials in files or remote URLs.

For a custom domain, configure it in Pages, add `public/CNAME`, and change the workflow base path to `/`. For 404s, verify the full repository subpath, trailing slash, Pages source and successful workflow. For blank pages, inspect asset URLs and rebuild with the right base. For lockfile errors, update the lockfile intentionally with the pinned pnpm; CI must retain `--frozen-lockfile`. GitHub may redirect a renamed repository's source URL, but old Pages bookmarks should be updated explicitly.

## Accessibility and verification

Large touch targets, safe-area spacing, keyboard focus indicators, live status announcements and reduced-motion support are included. No audio, login, service worker, PWA manifest or offline caching is introduced. Safari can add the site to the Home Screen as a shortcut. Desktop checks at 375px and 390px are not physical iPhone Safari testing.

## Smoothie Station models and behavior

Tap one of six original illustrated fruit buttons to add an equal portion. Blend turns the recipe into liquid and reveals its name and cup. Continue experimenting by tapping more fruit, or Serve Smoothie for a happy cup reveal. Undo removes exactly the last portion, including after blending. Empty Blender and Make Another clear all portions. Serving preserves the recipe until Make Another starts fresh. Current recipes reset on reload or navigation; no data is stored.

`ingredients.js` defines Strawberry, Banana, Blueberry, Mango, Grape and Kiwi colors. `color.js` averages original fruit colors by quantity in OKLab, then converts to clamped displayable sRGB. This independent engine does not use or alter Color Lab's spectral paint model. It is a playful display approximation, not a claim about the appearance or nutrition of real smoothies. [OKLab matrices and explanation](https://bottosson.github.io/posts/oklab/).

`naming.js` uses exact fruit sets and proportions for special names: balanced Strawberry + Banana becomes Strawberry Banana Swirl, Mango + Banana becomes Sunshine Shake, and so on. Two-fruit specials apply only up to a 2:1 ratio. The exact four-fruit Rainbow Rocket requires every fruit to have at least 15% and none above 40%. Outside those bounds, dominant fruits (60% or more) lead generated names. Other recipes use their actual fruits, perceptual color and playful endings. Counts and sorted IDs make names repeatable and independent of ingredient order. A token blueberry cannot hijack a banana-heavy smoothie.

Recipe state changes synchronously. Drop, swirl and pour animations never schedule state mutations. Reset removes decorative drops, and late animation events cannot restore fruit. The jar draws up to 15 pieces for performance, while counts, mixtures and naming retain every portion. Tapping is the primary input; drag-and-drop, audio and a service worker are intentionally not implemented. All artwork is original inline SVG.

Tests preserve the original Color Lab suite and cover smoothie quantities, order independence, OKLab conversion and weights, balanced names, dominance changes in both directions, undo/reset, serving/restarting, rapid taps and late animation events. `scripts/check-build.js` checks each generated HTML page, asset prefix, actual asset file and required third-party license. Physical iPhone Safari testing remains a user-device check; desktop mobile viewport inspection is documented separately.

For the original paint model and naming details, see [Color Lab model](docs/color-lab-model.md).

## Christmas Tree Decorator

New route: `christmas-tree/`. Source modules are in `src/games/christmas-tree/`: catalog, normalized state and undo history, SVG scene, pointer controls and PNG export. Twenty ornaments and three gift options can be selected, tapped into place, dragged, selected again, moved or removed. Keyboard users can focus placed objects, use arrow keys to move them, and Delete to remove them. The tree has three styles, three toppers (star, snowflake and an illustrated Santa hat), five light modes (scattered multicolor, warm white, icy blue, off, and scattered blue-and-white), day/night and a celebration view. Reset requires a confirmation dialog and preserves the tree style; Undo can restore a reset.

Progress saves to browser localStorage under `levis-tree`. Invalid/unavailable storage falls back safely. Only saved normalized positions and customization persist, not undo history. Save Picture renders a standalone SVG into a 1200×1500 PNG and opens a preview/download dialog; on iPhone, touch and hold the preview if downloads are restricted. System emoji artwork may look different across devices. Audio is not implemented. Desktop PNG preview/export and save restoration were checked; physical iPhone/Android download and touchscreen behavior still require device testing.

Run `pnpm run dev` and open `/christmas-tree/`, or build with `PAGES_BASE_PATH=/levis-games/` and preview `/levis-games/christmas-tree/`. Publishing uses the existing Actions workflow after review: `git add .`, `git commit -m "Add Christmas Tree Decorator"`, then `git push origin main`. The approved Christmas game is published through this same workflow.

## Snow Run

Snow Run's homepage card and static route are at `snow-run/`. Christmas Tree remains the final card. The game includes keyboard, button and drag steering; a 500-meter course; collectible multipliers; collision slowdown/recovery; pause, restart and a final tally. Sound is optional and initially off. Source and review instructions: [Snow Run](snow-run/README.md). The owner approved preview integration and publication through the existing GitHub Pages workflow. Game URL: https://sofakodev.github.io/levis-games/snow-run/.
