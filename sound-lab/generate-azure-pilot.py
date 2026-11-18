"""Generate the owner-approved Jenny probes, with a shared $1 usage ceiling.

Credentials are read from a temporary JSON file and removed on exit. No keys
are printed or copied into this project. The game never imports this script.
"""
import argparse
import array
import hashlib
import io
import json
import math
import wave
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

OUT = Path(__file__).resolve().parent / 'pilot' / 'azure'
NAMES = ['01-partial-su', '02-connected-sun', '03-natural-sun']
MISSING_PHONEMES = ['04-s', '05-u', '06-n']
USD_PER_CHARACTER = 15 / 1_000_000
MAX_USD = 1


def main(credential_file, missing_phonemes=False):
    secret_path = Path(credential_file)
    ledger_path = OUT / 'request-budget.json'
    manifest_path = OUT / 'manifest.json'
    ledger = json.loads(ledger_path.read_text()) if ledger_path.exists() else {'attempts': []}
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {
                'status': 'Unreviewed pronunciation probes; no integration approval',
                'createdUtc': datetime.now(timezone.utc).isoformat(),
                'provider': 'Azure Speech', 'resource': 'levis-sound-lab',
                'tier': 'Standard S0', 'region': 'eastus', 'voice': 'en-US-JennyNeural',
                'format': '24000 Hz mono PCM16 WAV',
                'processing': 'Raw synthesis output; no splicing, normalization or time stretching',
                'budgetUsd': MAX_USD, 'costEstimateIsNotAnInvoice': True, 'clips': []}
    try:
        credentials = json.loads(secret_path.read_text())
        if credentials['region'] != 'eastus':
            raise ValueError('Unexpected region; refusing to send credentials')
        for name in MISSING_PHONEMES if missing_phonemes else NAMES:
            wav_path = OUT / f'{name}.wav'
            ssml = (OUT / f'{name}.ssml').read_text(encoding='utf-8')
            if not wav_path.exists():
                reserved = sum(a['xmlCharacters'] for a in ledger['attempts']) + len(ssml)
                if reserved * USD_PER_CHARACTER > MAX_USD:
                    raise ValueError('Approved synthesis allowance would be exceeded')
                # Reserve every submitted XML character before sending, including
                # markup, as a conservative upper bound for these English probes.
                attempt = {'file': wav_path.name, 'xmlCharacters': len(ssml),
                           'submittedUtc': datetime.now(timezone.utc).isoformat(),
                           'result': 'reserved; outcome unknown if process interrupted'}
                ledger['attempts'].append(attempt)
                ledger_path.write_text(json.dumps(ledger, indent=2) + '\n')
                request = Request('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1',
                                  data=ssml.encode('utf-8'), method='POST', headers={
                                      'Ocp-Apim-Subscription-Key': credentials['key'],
                                      'Content-Type': 'application/ssml+xml',
                                      'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
                                      'User-Agent': 'LevisSoundLab-LocalPronunciationPilot'})
                try:
                    with urlopen(request, timeout=30) as response:
                        data = response.read()
                    with wave.open(io.BytesIO(data), 'rb') as wav:
                        if (wav.getnchannels(), wav.getsampwidth(), wav.getframerate()) != (1, 2, 24000):
                            raise ValueError('Unexpected audio format')
                    wav_path.write_bytes(data)
                    attempt['result'] = 'audio saved'
                except HTTPError as error:
                    attempt['result'] = f'HTTP {error.code}'
                    raise RuntimeError(f'{name}: Azure returned HTTP {error.code}; no automatic retries') from None
                except URLError:
                    attempt['result'] = 'connection failed; billing outcome unconfirmed'
                    raise RuntimeError(f'{name}: connection failed; no automatic retries') from None
                finally:
                    ledger_path.write_text(json.dumps(ledger, indent=2) + '\n')
            with wave.open(str(wav_path), 'rb') as wav:
                samples = array.array('h', wav.readframes(wav.getnframes()))
                rate = wav.getframerate()
            if not samples or not any(samples):
                raise ValueError(f'{name}: silent or empty output')
            peak = max(abs(s) for s in samples)
            if peak >= 32767:
                raise ValueError(f'{name}: clipping detected; do not integrate')
            clip = {'file': wav_path.name, 'ssmlFile': f'{name}.ssml',
                    'seconds': round(len(samples) / rate, 3), 'peak': round(peak / 32768, 5),
                    'rms': round(math.sqrt(sum(s*s for s in samples) / len(samples)) / 32768, 5),
                    'sha256': hashlib.sha256(wav_path.read_bytes()).hexdigest(),
                    'ssmlSha256': hashlib.sha256(ssml.encode()).hexdigest(), 'approved': False}
            active = [i for i, sample in enumerate(samples) if abs(sample) > 100]
            clip['activeSpanSeconds'] = round((active[-1] - active[0] + 1) / rate, 3) if active else 0
            clip['reviewStatus'] = 'Awaiting pronunciation and duration review'
            manifest['clips'] = [old for old in manifest['clips'] if old['file'] != clip['file']]
            manifest['clips'].append(clip)
            print(f'{wav_path.name}: {clip["seconds"]} seconds total, active span {clip["activeSpanSeconds"]}, peak {clip["peak"]}', flush=True)
        manifest['updatedUtc'] = datetime.now(timezone.utc).isoformat()
        manifest['status'] = 'Azure candidates retained; new isolated phonemes awaiting review. No lesson integration approval.'
        manifest['reservedXmlCharacters'] = sum(a['xmlCharacters'] for a in ledger['attempts'])
        manifest['conservativeUsageEstimateUsd'] = round(manifest['reservedXmlCharacters'] * USD_PER_CHARACTER, 6)
        manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
        print(f'Conservative synthesis estimate: ${manifest["conservativeUsageEstimateUsd"]:.6f}; actual invoice may differ.', flush=True)
    finally:
        # Remove only the explicitly named temporary credential, never a tree.
        if secret_path.name == 'speech-session.json' and secret_path.parent.name.startswith('levis-azure-'):
            secret_path.unlink(missing_ok=True)
            secret_path.parent.rmdir()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--credential-file', required=True)
    parser.add_argument('--missing-phonemes', action='store_true', help='Generate only s, short u, n; retain the original three probes')
    args = parser.parse_args()
    main(args.credential_file, args.missing_phonemes)
