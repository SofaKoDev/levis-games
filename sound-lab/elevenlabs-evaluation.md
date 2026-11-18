# ElevenLabs evaluation — no generation authorized yet

Connection is not yet confirmed. No recordings have been generated. The owner requires approval before any paid generation or purchases, and review of all seven recordings before integration. Sound Lab remains local and unpublished.

## Recommendation

Evaluate ElevenLabs first with one stock adult American-English voice. Prefer calm, neutral articulation and a patient pace over dramatic emotion or character acting. Do not purchase or clone a voice. Select the exact voice after checking available account voices and listening to existing samples.

Current documentation describes direct IPA in Eleven v4 and English phoneme tags in Flash v2. Other documentation pages have differing model-support lists. Verify the models actually available to the account and test the resulting sound; none of these features guarantees isolated-phoneme accuracy.

Initial pilot: generate candidate recordings for /s/, /ʌ/, /n/, connected /sʌ/ and connected /sʌn/ with the same voice. Test a normal spoken “sun” as a reference. Do not concatenate separately recorded sounds to make blends. If isolated consonants gain a schwa or blending remains unnatural after limited attempts, stop. A human-recorded model or speech-to-speech approach can then be evaluated separately, with permission before uploading any person's recording.

## Account and key setup

1. Sign in at https://elevenlabs.io/app/api/api-keys. The official CLI failed to launch its Windows executable in this environment, so use the dashboard rather than assuming an account was connected.
2. Stay on the Free plan for evaluation if eligible. Do not buy a subscription, add paid credits, enable overages, or generate billable speech yet.
3. Create a restricted key named `Levis Sound Lab local`. Enable Text to Speech for later approved generation, plus read access to voices, models and subscription/account metadata if available. Leave unrelated endpoints disabled. Set a small usage quota and a short expiry where supported. The local read-only inspection requires the metadata permissions; a 403 means a permission is missing, not that speech generation should be attempted.
4. Copy `.env.example` to `.env.local` within this directory and enter the key there locally. These files are ignored by Git except the blank example. Never prefix the secret with `VITE_`, put it in game source, or paste it into chat.
5. Run this read-only check from the repository root, or ask Codex to run it after the key is saved:

```powershell
node --env-file=sound-lab/.env.local sound-lab/inspect-elevenlabs.mjs
```

It reports selected quota information, American-accent voice candidates and speech models. It does not generate speech or print the key. No browser API integration is needed for the finished activity; only downloaded MP3 assets will ship.

## Costs checked on 2026-11-15

- ElevenCreative Free: $0/month, 10,000 credits/month. Starter: $6/month, 30,000 credits/month and a commercial license. Ignore the advertised first-month promotion until checkout verifies eligibility.
- ElevenAPI public base TTS rates: $0.08/1,000 characters for v4/v3/Multilingual and $0.04/1,000 for Flash/Turbo. The site also lists free included allowances; actual quota, model pricing and selected voice charges must be confirmed in the account before generating.
- Current seven scripts total 360 characters. A single base-rate pass is approximately $0.0144–$0.0288. Rewrites, tags, retries, premium voice charges, taxes, subscription fees and minimum billing rules are not included in that estimate. Instructions in the manifest are not automatically spoken text.
- Proposed paid-generation cap for a later approval: $1 of usage, no subscription or purchases. This is a proposal, not authorization. Prefer confirmed free allowance, with overages disabled. Stop when a cost cannot be established rather than assuming free use.

## Review every recording

All seven clips require manual listening approval, including introduction and final word. Clips 02–06 are especially pronunciation-sensitive; clip 01 also models all three sounds. Check /s/ without “suh” or “ess,” short /ʌ/ without “you,” and sustained /n/ without “nuh” or “en.” Both blends must be continuous utterances, not stitched sound files. The natural final word must match the stretched blend. Review volume, silence and comfort too.

Keep raw candidates outside the game's installed audio folder. Present all seven draft MP3s together for adult review before installing them as lesson assets. Failed candidates remain unapproved. No homepage integration, Git commit, push or deployment follows automatically from audio approval.

## Primary sources

- https://elevenlabs.io/pricing
- https://elevenlabs.io/pricing/api
- https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices
- https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/pronunciation-dictionaries
- https://elevenlabs.io/docs/api-reference/authentication
- https://elevenlabs.io/docs/overview/administration/workspaces/api-keys
