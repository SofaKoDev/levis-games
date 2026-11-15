# Levi's Games

**Little games. Big imagination.** A free collection of toddler-friendly browser games, designed for iPhone Safari. No accounts, advertising, analytics, external APIs or backend.

- **Color Lab:** the original paint-mixing game, preserved with its own spectral mixing and naming engines.
- **Smoothie Station:** a cozy fruit-mixing kitchen (Phase 2 follows the verified website migration).

## Publication and migration

Migration target repository: https://github.com/SofaKoDev/levis-games

Migration target website: https://sofakodev.github.io/levis-games/

Game routes: `color-lab/` and `smoothie-station/` below the website root. The repository rename requires owner approval. Until it is renamed and successfully deployed, the existing site remains at https://sofakodev.github.io/levis-color-lab/.

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

The public repository uses free GitHub Pages hosting. Settings → Pages → Source must be **GitHub Actions**. Pushes to `main` and manual workflow dispatches run locked dependency installation, all tests, a multi-page build and deployment. The production base path derives from the actual repository name, so a rename does not require hardcoding a username or path in the workflow. Deployment waits for successful tests and build; concurrent deployments are serialized. Runtime dependencies and their MIT notices are bundled locally.

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
