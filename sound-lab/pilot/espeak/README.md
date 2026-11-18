# eSpeak NG SUN pronunciation test

**Set aside by owner on 2026-11-15:** the voice remains too robotic, including the variant comparison. Do not use eSpeak recordings for the lesson. The previous Kokoro preview was reopened for comparison; that does not reverse its rejected isolated-phoneme and partial-blend results. Diagnostic files are retained locally only.

Generated locally on 2026-11-15 using the eSpeak NG library already included in ignored `.local-tools/python/espeakng_loader/`. No new download, service account, credentials, or billing was needed. The synthesizer is GPL-3.0-or-later; it is local tooling and is not bundled into the browser game. See the [upstream project](https://github.com/espeak-ng/espeak-ng) and [native API](https://github.com/espeak-ng/espeak-ng/blob/master/src/include/espeak-ng/speak_lib.h).

Listen at http://localhost:5178/sound-lab/espeak-pilot.html. These are unapproved tests, not the seven complete teacher recordings. All files remain outside the lesson's installed audio directory. No production routes, homepage entries, or deployment inputs were changed.

## Voice comparison and longer nasal candidate

The local page now offers Original (`en-us`), Female 2 (`en-us+f2`), Female 3 (`en-us+f3`), Male 3 (`en-us+m3`), and Klatt (`en-us+klatt`). Each has nine pre-generated diagnostic WAVs and its own manifest in `voices/<variant>/`. Selecting a voice stops previous playback and loads the corresponding local files without autoplay. No synthesis occurs in the browser.

The displayed nasal candidate, `09-n-held.wav`, uses 32 consecutive `n` tokens (8 for Klatt, whose timing differs) in one engine request. Its active span is approximately 0.63–0.72 seconds across voices, versus the original default's 28 ms. The engine event trace contains only `n` and silence events. This increases duration without adding vowel tokens, copying audio loops, or stretching a short waveform, but repeated engine tokens can still introduce audible pulsing or artifacts. This is not a verified sustained human nasal; reject it if it does not sound steady and correct. Original short files remain available for comparison and diagnosis. This method is used for the isolated candidate only, never to construct blends.

To generate a voice's files, append `--variant default`, `--variant f2`, `--variant f3`, `--variant m3`, or `--variant klatt` to the command below. Omitting the argument regenerates the original diagnostic set, including the new nasal experiment, in the original directory.

Inputs use eSpeak's native phoneme mnemonics between double brackets; `V` is the engine's English STRUT vowel. The engine's IPA events report /s/, /ʌ/, /n/ in the intended order for the probes, with no additional vowel phonemes. This is internal trace evidence only, not independent acoustic verification. Human listening must still assess the sound quality and transitions.

The manifest records engine version, DLL hash, voice, exact input, speed, volume, PCM format, duration, approximate active span, peak, RMS, phoneme events and WAV hashes. Active span measures the first-to-last sample above 100 PCM units; it is not a phonetic boundary detector. Each connected blend is synthesized in one request. No separate phoneme recordings are concatenated, and no output is normalized or stretched afterward.

## Original baseline failures and remaining limitations

- At 80 words/minute, isolated `[[n]]` produces only around 28 ms of active audio (50 ms total). It is too brief for a sustained teaching model. `[[n:]]` does not materially extend it. Both diagnostic files are retained; the listening page explicitly flags the failure.
- `[[s:]]` extends the active /s/ span from about 183 ms to about 367 ms. The page presents the longer candidate, with the original available for comparison. Even the longer sample is below the original lesson's approximately 700 ms goal.
- Isolated vowel and blends need review for American short /ʌ/, clarity, natural transitions and absence of added vowels. A trace showing the intended symbols does not prove acoustic correctness.
- Relative levels vary between the quiet fricative/nasal and voiced vowel. Listen at a low comfortable volume. Final mastering is deferred until pronunciation approval.
- The tested configuration therefore does not yet provide a complete usable phonics set. Do not integrate it or generate the seven final scripts without resolving the consonant-duration failures and getting listening approval.

## Reproduce

From the repository root:

```powershell
$env:PYTHONPATH=(Join-Path (Get-Location) '.local-tools/python')
python sound-lab/generate-espeak-pilot.py
```

The script uses Python's standard library and the existing `espeakng_loader` package. It uses the native synchronous callback API to save audio without playing it or contacting any service.
