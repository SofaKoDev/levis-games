# Azure pronunciation test — sounds accepted

**Owner review, 2026-11-15:** all six Azure sound models were accepted with “these sound good.” See `pronunciation-review.json` and the manifest's `pronunciationApproved` fields. This supersedes the pending-pronunciation language in the generation history below. Lesson integration, additional generation, and publication are separate approvals and have not been granted by this review.

## Missing isolated sounds added

After the owner confirmed key regeneration, only `04-s.wav`, `05-u.wav`, and `06-n.wav` were generated. The original three blend/word WAV files were retained byte-for-byte. All six use `en-US-JennyNeural`. The shared conservative synthesis estimate is now $0.018405 across six requests, below the approved $1 allowance. The regenerated credential was obtained without printing its value, held in a temporary file outside the project, and that file was removed after use.

The consonant inputs request IPA length (`sː`, `nː`) at 30% slower rate; short /ʌ/ uses 20% slower rate. These requests did not yield the original approximately 600–700 ms sustain goal: measured active spans are about 206 ms for s, 412 ms for the vowel, and 211 ms for n. Total durations include considerable silence. Explicit markup is not evidence of acoustic accuracy. The local listening page flags the short consonants for owner review; no stretching, loops, or additional paid retries were used. Do not mark the new clips approved until the owner has listened.

Prepared locally on 2026-11-15 after the owner created an Azure account. These three SSML fixtures use the regular American English Jenny neural voice: connected /sʌ/, connected /sʌn/ at 20% slower rate, and a natural SUN reference. The two blends each use one phoneme element without internal breaks or spliced recordings. All outputs will need listening review for vowels, transitions, nasal endings and unwanted sounds. Slower overall rate does not establish adequate consonant sustain or phonics accuracy.

Proposed portal draft: `levis-sound-lab`, new resource group `levis-games-audio`, East US, Standard S0. The active subscription overview showed Azure Plan and current reported cost 0.00. A welcome message mentioned $200 free credits, but the actual available credit balance has not been verified. Do not assume the test is covered by trial credit.

The owner created the Speech resource and then explicitly approved generation with a $1 maximum synthesis allowance. The agent verified the deployed resource is Active, East US, Standard tier. Three authenticated synthesis requests succeeded. The request ledger conservatively counts all 577 XML characters, including markup, at $15/million, yielding an estimated $0.008655 before any credits or taxes; this is not an invoice. Trial-credit coverage is still unverified. No billing upgrade, commitment tier, voice training, custom voice, model hosting, or ongoing game API was added by the agent.

Listen at http://localhost:5178/sound-lab/azure-pilot.html. Outputs are raw mono PCM16 WAV, 24 kHz. Each is nonempty and non-clipping. The manifest records exact input hashes, output hashes, duration, peak and RMS. Every clip remains unapproved for teaching or integration; file integrity does not certify pronunciation. No file was added to `sound-lab/audio/` and no publication occurred.

A temporary credential file outside the repository was removed after generation. An earlier portal diagnostic accidentally included key values in field labels. The owner was informed; both exposed keys should be regenerated in Azure. Do not reuse those credentials or write them into project files or logs.

The fixtures contain fewer than 1,000 total characters including XML. This is a conservative planning bound, not Azure's exact billable-character definition. All generated files must stay local and outside the lesson's installed audio folder until the owner has heard and approved them. Commercial use must follow the paid-tier terms and the applicable agreement. No deployment is authorized.
