# Free TTS evaluation: SUN pronunciation pilot

Research date: 2026-11-15. Local review only. No account, billing, paid generation, commit, push, or deployment is authorized by this evaluation.

## Microsoft Azure Speech F0

### Live anonymous gallery check (2026-11-15)

The legacy Voice Gallery loaded while signed out. Selecting standard Jenny (`en-US-JennyNeural`) and its Try it out tab exposed a custom-text field (500 characters), speaking-style selector, and Play button. No account, resource, key, subscription, or billing was created. An IPA/SSML probe was submitted through that public field, but the available observations did not establish that markup was interpreted or that the resulting sound was phonemically correct. Do not report this as a successful blend test. No reusable Azure audio file was saved. The gallery was left on Jenny with an ordinary SUN sentence for voice audition only.

The linked Audio Content Creation page displayed a sign-in requirement, with no anonymous editing controls. Full SSML testing therefore remains unresolved without authenticated access; this observation does not prove that the gallery rejects all SSML. Source pages: [Voice Gallery](https://speech.microsoft.com/portal/voicegallery), [Audio Content Creation](https://speech.microsoft.com/portal/audiocontentcreation), and [quickstart describing the signup-free gallery](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-text-to-speech).

### Tier, licensing, and prerequisites

- The [official pricing table](https://azure.microsoft.com/en-us/pricing/details/speech/) lists **500,000 neural TTS characters per month** for the free F0 tier. This is different from consuming trial credit on a paid S0 resource. Only an explicitly verified F0 resource should be considered for a free test.
- The [quickstart](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-text-to-speech) requires an Azure subscription and Speech resource; synthesis uses its regional endpoint and key or supported identity authentication. No Azure Speech key or region is currently configured locally. The owner confirmed there is no existing F0 resource and selected the local Kokoro test.
- The [Azure account FAQ](https://azure.microsoft.com/en-us/free/free-account-faq/) says signup requires a phone number, non-prepaid credit/debit card, and Microsoft or GitHub account. A temporary $1 verification hold may occur. The new-customer free account has spending protection, but continuing after 30 days or trial-credit exhaustion requires opting into pay-as-you-go. F0's monthly allowance and the account's trial conditions are separate. No account or resource was created and no billing was enabled.
- **Output licensing remains a blocker for shipped F0 assets:** [Microsoft's current Product Terms](https://www.microsoft.com/licensing/terms/product/MicrosoftAzure/all), under TTS Services, explicitly grant prebuilt neural output-use rights to **paid-tier** customers. This does not establish equivalent redistribution rights for F0 output. Do not ship F0 recordings in the public game without clarification of the applicable agreement from Microsoft; a free website does not by itself settle this question.
- [SSML pronunciation control](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-pronunciation) supports explicit IPA phonemes. A future test could use an American English prebuilt voice such as JennyNeural, with separate phoneme elements for `s`, `ʌ`, `n`, `sʌ`, and `sʌn`, plus ordinary text `Sun.`. IPA support is a control mechanism, not evidence of accurate isolated phonemes. No Azure audio has been generated or evaluated.

## Fully local Kokoro

- [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) provides Apache-2.0 model weights and expressly describes personal and production use. Local inference needs no account, API key, paid allowance, or ongoing network access. The downloaded ONNX model and voices total about 354 MB, excluding Python dependencies; they stay in ignored `.local-tools/` and are not shipped to the browser.
- The [kokoro-onnx wrapper](https://github.com/thewh1teagle/kokoro-onnx/blob/main/LICENSE) is MIT licensed. Local phonemizer/eSpeak tooling has GPL licensing; keep its notices if redistributing the tools. The browser game will receive audio files only, not the inference tools or model. Preserve provenance and model/voice licensing information with eventual approved assets; do not label the entire toolchain Apache-only.
- The model's [voice documentation](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md) lists `af_heart` as an American English voice and explicitly warns about weakness on very short utterances, especially below 10–20 tokens. Isolated sounds are therefore a high-risk use case. The selected voice is a candidate for a friendly adult voice, subject to listening review.
- The local wrapper permits direct phoneme input. The pilot bypasses spelling-to-sound conversion for the five phonetic probes. Each blend is one inference request; isolated sounds are never spliced into a blend. A separate natural-text SUN sample provides a reference.
- Neither voice quality, direct phoneme support, nor a valid WAV file proves phonics accuracy. No sample is approved for teaching until listened to and checked against the criteria below. If the model adds vowels or cannot sustain consonants, reject those outputs rather than teaching an incorrect sound.

## User review result

On 2026-11-15 the owner reported that the sounds did not match well and sounded broken, with “sun” as the exception. Isolated /s/, /ʌ/, /n/ and partial /sʌ/ are rejected. The natural word remains a usable candidate; approval of the stretched connected blend is not assumed. All integration approvals remain false. This tested Kokoro configuration does not pass the phonics gate. Do not generate the seven lesson recordings using this failed phonetic method. The files are retained for comparison, not installed.

## Review the actual candidates

Open [the local listening page](http://localhost:5178/sound-lab/pilot.html), or open the WAV files in `sound-lab/pilot/kokoro/` directly. These are test drafts with the review outcome above, not the seven finished teacher recordings.

| File | Intended sound | Manual review |
| --- | --- | --- |
| 01-s.wav | /s/ | Clean unvoiced hiss; no ess/suh; enough duration to model |
| 02-u.wav | /ʌ/ | Short vowel in sun/cup for American English; no you/oo |
| 03-n.wav | /n/ | Sustained nasal; no en/nuh or released extra vowel |
| 04-su.wav | /sʌ/ | Connected transition; no sue, gap, or final n |
| 05-sun-connected.wav | /sʌn/ | Continuous blend; no gaps/extra vowels; suitable stretching |
| 06-sun-natural.wav | sun | Natural word, correct short vowel and final nasal |

The manifest records exact inputs, speed, runtime versions, local model hashes, clip hashes, durations, peaks and RMS. Technical checks cover nonempty, finite, non-clipping WAV output; they do not certify what a listener hears. Output is raw model audio with built-in edge trimming, without splicing, loudness normalization, or post-generation time stretching. Final mastering and MP3 conversion wait until pronunciation approval.

## Reproduce offline after the one-time download

The generation script uses no network. From the repository root:

```powershell
$env:PYTHONPATH=(Join-Path (Get-Location) '.local-tools/python')
python sound-lab/generate-kokoro-pilot.py
```

The tools used for this pilot were installed with Python 3.12 into `.local-tools/python`: kokoro-onnx 0.6.1, phonemizer-fork 3.3.2, espeakng-loader 0.2.4, soundfile 0.14.0, and supporting packages. Existing ONNX Runtime and NumPy were reused; the manifest records their versions. The installed fork exposes the required phonemizer API; this is a tested local combination, not a claim that it meets the wrapper's declared `phonemizer>=3.4.0` package constraint. A clean setup should recheck dependency compatibility before reuse. `download-kokoro.py` downloads the documented v1.0 model and voice files from the wrapper's public release; this download is separate from inference.

Next gate: owner listens to the six probes. Only after the phonetic method passes review should the seven complete scripts be generated, individually auditioned, and considered for integration. Sound Lab and these probes remain unpublished; production build inputs and the homepage are unchanged.
