# Levi's Sound Lab — local word library

Local-only expansion of the approved SUN prototype. No commit, push, deployment, or homepage integration is authorized.

## Preview

Run from the project root:

```powershell
node node_modules/vite/bin/vite.js --config sound-lab/vite.preview.config.js --host 127.0.0.1 --port 5178 --strictPort
```

- Game: http://localhost:5178/sound-lab/
- Parent listening review: http://localhost:5178/sound-lab/library-review.html
- [Word inventory and official book evidence](WORD-INVENTORY.md)
- [Audio and illustration checklist](AUDIO-REVIEW.md)

## Current approval state

All 40 words were approved by the owner in the local review page and are now marked reviewed in `src/games/sound-lab/words.json`. The 40 complete, hash-verified audio sets and original SVG illustrations are playable across local browsers without depending on one browser's local storage. No recordings were regenerated or replaced for this integration.

The parent review page remains available for listening and checking stages. Changes to audio or word mappings require fresh review.

## Behavior and phonics

The game opens with a randomly selected approved word and continues through the shuffle bag. Start plays only after a user action. Next advances through isolated sounds, growing connected prefixes, the full blend, and the natural word. The final stage reveals the illustration; the following Next starts another shuffled word. Back replays the previous stage in the same word. Start again and Listen again retain their established roles. Page hiding and navigation stop active audio.

Two-phoneme lessons have five stages, three-phoneme lessons seven, and four-phoneme lessons nine. Grapheme units follow phoneme boundaries: ee in see/green stays together; gr and st remain separate sounds; gg in eggs is one /g/, followed by voiced /z/. The X in box/fox is taught as one combined /ks/ unit, as requested; both words have passed listening review. Natural American English accent choices and consonant-only prefixes require particular listening care.

## Local assets and generation

The existing SUN installer, source recordings, approval files, and installed hashes remain intact. New candidates use the same en-US-JennyNeural Azure voice and 24 kHz mono PCM16 format. `audio/library/` contains reusable isolated phonemes, complete synthesized prefix blends, natural words, and introductions assembled from separated isolated clips with their original pauses. Connected blends are not spliced together. The three approved SUN isolated phonemes are reused unchanged.

`library-manifest.json` records hashes and mechanical audio measurements. New generation used 126 requests. The shared conservative usage estimate, including earlier SUN tests and a failed connection reservation, is $0.385770 at $15 per million characters, counting XML conservatively. This is an estimate, not an invoice, and stays within the previously approved $1 ceiling. `pilot/azure/request-budget.json` retains the shared ledger. No retries are automatic. Generation is a separate development script; gameplay uses only local files and never needs a key or API connection.

Original SVG recipes live in `prepare-library.py`, which reads the one editable JSON inventory. It does not rewrite word data. Pictures for names and function words need adult context. No book illustrations or emojis are used.

## Verify

```powershell
node node_modules/vitest/vitest.mjs run --no-isolate --testTimeout=20000
node node_modules/vite/bin/vite.js build --config sound-lab/vite.preview.config.js
pnpm run build
```

The isolated build writes `dist-sound-preview`, including game, review page, local audio, and review documents. It supports `PAGES_BASE_PATH=/levis-games/`. Public build inputs, homepage registry, and GitHub Actions are unchanged; the production build excludes Sound Lab.

Automated tests exercise variable phoneme boundaries, Back replay, word-to-word transitions, shuffle bags, review gating, stale approvals, missing assets, original SUN compatibility, audio interruption, and file hashes. Browser checks use an iPhone-sized viewport, not physical iPhone Safari. Target-phone playback and every new recording still need owner review before further integration or publication.

## Approved standalone P update

The owner approved the fresh Jenny /pə/ (“puh”) recording only for the standalone P demonstration. MAP and other P lessons use `audio/library/phoneme-p-demo.wav` only during that single-letter stage. Introductions, connected prefixes, full blends and natural words retain their original recordings. `install-p-demo.py` verifies and installs the approved source unchanged; this does not approve entire words or the other new M/N samples. The review page supports `?word=map` for a direct MAP review link.

## Approved longer M and N

The owner approved the fresh raw m-slow.wav and n-slow.wav samples. These replace isolated M/N across the library and N in SUN. All affected separated introductions use the same approved sources, without loops or stretching. All 111 connected/whole-word recordings remain unchanged. Run install-approved-nasals.py to reproduce this local update; the original SUN installer preserves this newer approval. The opening-example change to P-with-schwa remains deferred at the owner's request. No new synthesis or paid calls were made.

## Approved standalone G and approval labels

The owner approved raw Jenny guh for standalone G. G stages use audio/library/phoneme-g-demo.wav; introductions, connected blends, and natural words retain their original G recordings. install-g-demo.py verifies and reproduces this update. The separate G comparison control is removed after acceptance. Review labels and approval counts now reflect browser-local approvals immediately, after reload, and across tabs; saves merge decisions from other tabs. Word approval needs only the review checkbox, not a separate chat confirmation. Changes to exact lesson assets still require re-review.

## PIG short-I partial candidate

The owner reported that the generated /pɪ/ prefix sounded like PEE. The replacement partial uses the original connected PIG recording through 405 ms, ending during its short vowel before G closure/release, with an 8 ms fade to prevent a cut click. No phoneme clips are joined, and there is no looping, stretching, pitch edit, or new synthesis. prepare-pig-partial.py verifies the source hash, retains the old partial in pilot/pig-partial, and installs the replacement with pending pronunciation review. The full PIG blend and natural word remain byte-for-byte unchanged. The owner still needs to listen and approve the revised word through the review checkbox.
