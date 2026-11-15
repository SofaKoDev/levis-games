## Mixing model and dependency evaluation

Spectral.js 3.0.0 (https://github.com/rvanwijnen/spectral.js), MIT, is a small dependency-free JavaScript library. Its browser-compatible UMD module is bundled locally by Vite. It reconstructs reflectance from sRGB and uses a Kubelka–Munk inspired spectral model rather than summing or multiplying RGB channels. This was preferred over a custom artist-wheel approximation because it supplies documented spectral behavior and supports simultaneous weighted mixtures. Package source and license are included in node_modules; see THIRD_PARTY_NOTICES.md.

Every drop has equal quantity. Original pigments are grouped by hex, normalized by total count, sorted deterministically and mixed simultaneously. The adapter compensates for Spectral.js squaring input factors and applying luminance weights: each factor is sqrt(drop fraction / pigment luminance), yielding an equal-volume spectral K/S average. Undo recalculates from the remaining original drops. Identical paints return their original hex. No combination-presence rules or accumulation of rounded intermediate mixtures are used. Cached pigment reconstruction keeps repeated taps inexpensive. The animations are decorative and cannot change the state.

This is a **display-color approximation**, not a simulation of measured physical paint. Real tubes, scattering, opacity, lighting and displays differ. Complementary mixtures may be muted. The defined Red is a cool red (#ff2255), chosen to give useful violet mixtures with Blue (#3455eb). These presets are display pigments rather than scientific spectral primaries. The slider is a fully saturated hue spectrum; selecting a preset positions its thumb at that preset's hue, while retaining the preset's exact RGB. Moving the slider selects a new fully saturated color.

## Naming

Names use nearest Euclidean OKLab matching against the CSS named-color palette from `color-name` (MIT), additional descriptive anchors, and programmatically derived light/pale/deep/dark shades (several hundred candidates). Presets and exact descriptive anchors take priority. All three perceptual coordinates participate, preventing a dark teal from being confused with bright turquoise. Generated labels describe approximations; no Pantone or other licensed matching is claimed. Adjacent colors can share a name while their hex and bowl color change.

## Verification and accessibility

`npm.cmd test` runs Vitest checks for all requested pair families with OKLab tolerances, first-through-tenth Blue dominance, 100-drop stability, exact identical pigments, order independence, Undo/Empty and naming. At high counts, 8-bit RGB rounding can make adjacent drops visually identical; tests allow quantization tolerance after ten drops. A jsdom interaction test covers fast additions, undo restoration, empty state and selector synchronization.

Large touch targets, a labeled native keyboard-accessible rainbow slider, focus outlines, live result announcements, safe-area padding, portrait responsive layouts and reduced-motion support are included. No audio is implemented. The layout compacts on short screens; vertical scrolling remains available when accessibility text sizes require it. Desktop browser phone-size review is not a substitute for testing on a physical iPhone Safari.



