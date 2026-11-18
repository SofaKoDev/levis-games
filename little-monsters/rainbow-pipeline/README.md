# Rainbow Monster Sanctuary asset pipeline

## Original transparent sprite sheets (recommended review)

The six original PNGs supplied later are preserved unchanged in `source/` with
`-original` filenames. They contain seven distinct creatures, each with five
actions and four poses per action. `original-layout.json` records the source
regions. Run `Audit-OriginalSheets.ps1`, then `Build-OriginalSheets.ps1` to
recreate `output-originals/manifest.json`, 140 transparent 256x256 frames, and
seven 4x5 sheets. Open `preview-originals.html` to review their animations.

This extraction preserves the original alpha and uses one scale per monster.
It does not redraw or invent poses. The original images have visible colored
edge fringes. The audit also flags one Nighthawk and two Moonmoth cut lines for
visual inspection. The supplied Nighthawk is an owl; the earlier Nightwhisk
was a cat. Keep that identity change explicit when selecting final game art.

The original-sheet preview is separate from the earlier composite preview
below. The local Little Monsters prototype now uses the seven normalized
original-sheet animations; the source PNGs remain unchanged.

This folder preserves both supplied images unchanged. `layout.json` maps the
newer seven-panel image, while `layout-overview.json` records the older board.
Run `Build-Assets.ps1` in PowerShell to
regenerate `output/frames` and `output/manifest.json` from `layout.json`.
The build also makes one 4-column, 5-row action sheet per monster in
`output/sheets`; rows are idle, feed, clean, play, sleep.

Extract the ZIP, then double-click `rainbow-pipeline/preview.html` to play
every extracted action and see its real frame count. Keep the `output` folder
beside the page. The preview's movement and particle effect are programmatic
and do not alter the supplied images. Run `node test-preview.mjs` in the Game
workspace to check all seven cards and all 140 frame paths.

The new source is a semi-transparent 1536×1024 composite with four poses for
each of five actions. It is substantially better than the old opaque board,
including Moonmoth's fourth sleep pose. Its colored panel matte, glow, and
some sprites crossing implied cell divisions still require manual review. The
extractor removes pixels below the configured alpha threshold. Do not replace
the game's existing artwork with unreviewed frames automatically.

## Observed assets

| Monster | Idle | Feed | Clean | Play | Sleep | Status |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Emberhorn | 4 | 4 | 4 | 4 | 4 | Review fire glow and crop edges |
| Sparkfox | 4 | 4 | 4 | 4 | 4 | Review tail and panel matte |
| Sunfeather | 4 | 4 | 4 | 4 | 4 | Review wings and effect pixels |
| Leafsprite | 4 | 4 | 4 | 4 | 4 | Review tail and crop edges |
| Tidefin | 4 | 4 | 4 | 4 | 4 | Review fins, water effects, and panel matte |
| Nightwhisk | 4 | 4 | 4 | 4 | 4 | Review dark outline and tail |
| Moonmoth | 4 | 4 | 4 | 4 | 4 | Review wings and panel matte |

The older board's labels said four sleep frames but showed only three. The new
image supplies four visible sleep poses per monster. No frame is invented.

## Needed to finish the game-ready pack

Original individual transparent sheets would allow clean extraction where
sprites overlap their implied cells. The current cutouts and animation preview
still need visual approval before the game art is replaced.
