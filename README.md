# Levi's Color Lab

A local, toddler-friendly paint playground. No accounts, backend, ads, tracking, remote fonts, or runtime internet requests. Paint resets when the page reloads.

## GitHub Pages

Repository: https://github.com/MaxAultKodev/levis-color-lab

Website address: https://MaxAultKodev.github.io/levis-color-lab/

The address is live only after the **Deploy Levi's Color Lab** workflow completes successfully. On an iPhone, open that HTTPS address in Safari; no login or shared Wi-Fi is needed for the published game. Safari's Share menu offers **Add to Home Screen** as a shortcut. This project does not currently implement a PWA manifest, service worker, or offline caching of the hosted site.

GitHub Free Pages hosting requires a public repository, so the source is publicly readable. No credentials belong in this project.

The workflow in `.github/workflows/deploy.yml` runs on pushes to `main` and supports manual runs from Actions. It installs pnpm 11.25.0 on Node 22, installs from `pnpm-lock.yaml` with `--frozen-lockfile`, runs all tests, builds the production site, uploads `dist`, and deploys only after the build job succeeds. Deployment permissions are restricted to the deployment job. Deployments run one at a time.

In repository **Settings → Pages**, select **GitHub Actions** as the publishing source. The workflow sets `PAGES_BASE_PATH=/levis-color-lab/`, while local builds default to `/`. If the repository is renamed, update that workflow value and these URLs. For a future custom domain, configure the domain in Pages, add its CNAME file in `public`, and set `PAGES_BASE_PATH=/`.

To publish future changes from this checkout:

```powershell
pnpm run test
pnpm run build
git add .
git commit -m "Describe the update"
git push origin main
```

Git must be authenticated to GitHub (for example with `gh auth login`). Review the staged files with `git diff --cached` before committing. Follow the run in the repository's **Actions** tab; a failed test/build leaves the previous deployment intact. You can also use **Actions → Deploy Levi's Color Lab → Run workflow** to redeploy `main`.

Troubleshooting:

- **404:** Wait for the deployment to succeed, confirm the public repository and Pages source, and use the full URL including `/levis-color-lab/`.
- **Blank page or missing assets:** Check the workflow base path, rebuild and redeploy; do not publish source files directly as the site.
- **Lockfile mismatch:** Run the pinned pnpm version locally, update `pnpm-lock.yaml` intentionally, and commit it with `package.json`. CI never bypasses the frozen lockfile.
- **Pages permission failure:** Confirm Actions is enabled and Pages uses GitHub Actions. The deploy job needs Pages write and OIDC token write permissions.
- **Old content on Safari:** Reload after the successful deployment; if needed close and reopen the tab. There is no service worker to unregister.

## Windows PowerShell setup

Install Node.js 22 LTS or later from https://nodejs.org (includes npm), then reopen PowerShell:

```powershell
Set-Location 'PATH-TO-YOUR-CHECKOUT'
npm.cmd install
npm.cmd test
npm.cmd run dev
```

Open http://localhost:5173 on the computer. Leave the terminal running; Ctrl+C stops the server. The `.cmd` form avoids PowerShell script execution-policy issues. Dependencies are only downloaded during initial setup. A pnpm lockfile is also included; pnpm users can run `pnpm install --store-dir .pnpm-store --node-linker=hoisted` and `pnpm run dev`.

In the prepared Codex environment, dependencies are already installed and these direct commands also work without npm:

```powershell
node node_modules/vite/bin/vite.js --host 0.0.0.0
node node_modules/vitest/vitest.mjs run
node node_modules/vite/bin/vite.js build
node scripts/copy-licenses.js
```

## Play on an iPhone

Connect the computer and iPhone to the same trusted home Wi-Fi (avoid guest-network client isolation). Run the development command above, then find the computer's Wi-Fi IPv4 address:

```powershell
ipconfig
```

In Safari open `http://YOUR-IP:5173`, for example `http://192.168.1.100:5173`. IP addresses can change. The computer must stay awake. If Windows Firewall prompts, allow Node.js on **Private networks only**. If blocked, use Windows Defender Firewall's allowed-app settings to allow Node.js on Private networks, or create an inbound TCP rule for the chosen port scoped to Private profile and Local subnet. Do not disable the firewall. No router port forwarding or public exposure is needed.

The server listens on all interfaces for LAN access. To limit it to the computer, use `npm.cmd run dev -- --host 127.0.0.1`. To choose a port, use `npm.cmd run dev -- --port 5174` and use that port on the phone. Ports are strict so an occupied port produces an error rather than a surprising new address.

## Production build and local hosting

```powershell
npm.cmd run build
npm.cmd run preview
```

Open http://localhost:4173 or `http://YOUR-IP:4173` from Safari. Preview is convenient for home use; it is not a hardened public production server. It serves the built `dist` folder without requiring internet. Dependencies must remain installed for this preview command. Alternatively serve `dist` using an existing local static web server. Opening index.html directly via file:// is unsupported.

For future Ubuntu deployment, build here, copy the **contents** of `dist` to an Nginx document root such as `/var/www/levis-color-lab`, and configure Nginx to serve that root with `index index.html;` and `try_files $uri $uri/ =404;`. Keep the server on the home LAN; restrict its firewall to the LAN subnet. Node and npm are not needed on Ubuntu to serve the built static files.

## Mixing model and dependency evaluation

Spectral.js 3.0.0 (https://github.com/rvanwijnen/spectral.js), MIT, is a small dependency-free JavaScript library. Its browser-compatible UMD module is bundled locally by Vite. It reconstructs reflectance from sRGB and uses a Kubelka–Munk inspired spectral model rather than summing or multiplying RGB channels. This was preferred over a custom artist-wheel approximation because it supplies documented spectral behavior and supports simultaneous weighted mixtures. Package source and license are included in node_modules; see THIRD_PARTY_NOTICES.md.

Every drop has equal quantity. Original pigments are grouped by hex, normalized by total count, sorted deterministically and mixed simultaneously. The adapter compensates for Spectral.js squaring input factors and applying luminance weights: each factor is sqrt(drop fraction / pigment luminance), yielding an equal-volume spectral K/S average. Undo recalculates from the remaining original drops. Identical paints return their original hex. No combination-presence rules or accumulation of rounded intermediate mixtures are used. Cached pigment reconstruction keeps repeated taps inexpensive. The animations are decorative and cannot change the state.

This is a **display-color approximation**, not a simulation of measured physical paint. Real tubes, scattering, opacity, lighting and displays differ. Complementary mixtures may be muted. The defined Red is a cool red (#ff2255), chosen to give useful violet mixtures with Blue (#3455eb). These presets are display pigments rather than scientific spectral primaries. The slider is a fully saturated hue spectrum; selecting a preset positions its thumb at that preset's hue, while retaining the preset's exact RGB. Moving the slider selects a new fully saturated color.

## Naming

Names use nearest Euclidean OKLab matching against the CSS named-color palette from `color-name` (MIT), additional descriptive anchors, and programmatically derived light/pale/deep/dark shades (several hundred candidates). Presets and exact descriptive anchors take priority. All three perceptual coordinates participate, preventing a dark teal from being confused with bright turquoise. Generated labels describe approximations; no Pantone or other licensed matching is claimed. Adjacent colors can share a name while their hex and bowl color change.

## Verification and accessibility

`npm.cmd test` runs Vitest checks for all requested pair families with OKLab tolerances, first-through-tenth Blue dominance, 100-drop stability, exact identical pigments, order independence, Undo/Empty and naming. At high counts, 8-bit RGB rounding can make adjacent drops visually identical; tests allow quantization tolerance after ten drops. A jsdom interaction test covers fast additions, undo restoration, empty state and selector synchronization.

Large touch targets, a labeled native keyboard-accessible rainbow slider, focus outlines, live result announcements, safe-area padding, portrait responsive layouts and reduced-motion support are included. No audio is implemented. The layout compacts on short screens; vertical scrolling remains available when accessibility text sizes require it. Desktop browser phone-size review is not a substitute for testing on a physical iPhone Safari.


