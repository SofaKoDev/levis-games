"""Offline pronunciation candidates, never installed into the game automatically.

Run after installing the local tools and downloading the model:
  $env:PYTHONPATH=(Join-Path (Get-Location) '.local-tools/python')
  python sound-lab/generate-kokoro-pilot.py
No network calls, accounts, credentials, or paid services are used here.
"""
import hashlib
import importlib.metadata
import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
MODELS = ROOT / '.local-tools' / 'kokoro'
OUT = ROOT / 'sound-lab' / 'pilot' / 'kokoro'
VOICE = 'af_heart'
CASES = [
    ('01-s', 's', True, 0.8, 'Unvoiced /s/ only; reject suh or the letter name ess.'),
    ('02-u', 'ʌ', True, 0.85, 'Short vowel in sun/cup; reject you, oo, or an added consonant.'),
    ('03-n', 'n', True, 0.8, 'Voiced nasal /n/ only; reject nuh or en.'),
    ('04-su', 'sˈʌ', True, 0.8, 'One connected /sʌ/; reject sue, a gap, or the whole word sun.'),
    ('05-sun-connected', 'sˈʌn', True, 0.8, 'One connected /sʌn/; reject gaps and extra vowels.'),
    ('06-sun-natural', 'Sun.', False, 1.0, 'Natural SUN reference; check short vowel and final nasal.'),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    kokoro = Kokoro(str(MODELS / 'kokoro-v1.0.onnx'), str(MODELS / 'voices-v1.0.bin'))
    result = {
        'createdUtc': datetime.now(timezone.utc).isoformat(),
        'status': 'Unreviewed pronunciation candidates; not approved for teaching or integration',
        'voice': VOICE, 'language': 'en-us', 'format': '24000 Hz mono PCM16 WAV',
        'processing': 'Model output with built-in edge trimming; no splicing, normalization, or time stretching',
        'runtimeVersions': {name: importlib.metadata.version(name) for name in
                            ['kokoro-onnx', 'onnxruntime', 'numpy', 'soundfile', 'phonemizer-fork']},
        'modelSha256': {}, 'clips': [],
    }
    for name in ['kokoro-v1.0.onnx', 'voices-v1.0.bin']:
        result['modelSha256'][name] = hashlib.file_digest((MODELS / name).open('rb'), 'sha256').hexdigest()
    for name, value, direct, speed, review in CASES:
        audio, rate = kokoro.create(value, voice=VOICE, speed=speed, lang='en-us', is_phonemes=direct)
        if not len(audio) or not np.isfinite(audio).all() or np.max(np.abs(audio)) <= 0:
            raise ValueError(f'{name}: invalid or silent model output')
        if np.max(np.abs(audio)) >= 1:
            raise ValueError(f'{name}: output would clip PCM16; review before changing gain')
        path = OUT / f'{name}.wav'
        sf.write(path, audio, rate, subtype='PCM_16')
        clip = {'file': path.name, 'input': value, 'directPhonemes': direct, 'speed': speed,
                'seconds': round(len(audio) / rate, 3), 'peak': round(float(np.max(np.abs(audio))), 5),
                'rms': round(float(np.sqrt(np.mean(audio ** 2))), 5),
                'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                'manualReview': review, 'approved': False}
        result['clips'].append(clip)
        print(f'{path.name}: {clip["seconds"]} seconds, peak {clip["peak"]}', flush=True)
    (OUT / 'manifest.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
