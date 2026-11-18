"""Install the six reviewed sources locally, plus a separated intro sequence.

No paid generation or network use. The intro is explicitly three separate
sounds, never a synthetic connected blend. Existing pauses are retained.
"""
import hashlib
import io
import json
import shutil
import wave
from pathlib import Path

LAB = Path(__file__).resolve().parent
SOURCE = LAB / 'pilot' / 'azure'
DEST = LAB / 'audio'
MAPPING = {
    '04-s.wav': '02-s.wav',
    '05-u.wav': '03-u.wav',
    '06-n.wav': '04-n.wav',
    '01-partial-su.wav': '05-partial-su.wav',
    '02-connected-sun.wav': '06-connected-sun.wav',
    '03-natural-sun.wav': '07-word-sun.wav',
}


def main():
    review = json.loads((SOURCE / 'pronunciation-review.json').read_text())
    manifest = json.loads((SOURCE / 'manifest.json').read_text())
    expected = {clip['file']: clip['sha256'] for clip in manifest['clips']}
    if not review['pronunciationApproved'] or set(review['clips']) != set(MAPPING):
        raise ValueError('The full set must have owner pronunciation approval')
    # Check every source before writing any installed output.
    for source in MAPPING:
        data = (SOURCE / source).read_bytes()
        if hashlib.sha256(data).hexdigest() != expected[source]:
            raise ValueError(f'{source}: reviewed content has changed')
        with wave.open(io.BytesIO(data)) as wav:
            if (wav.getnchannels(), wav.getsampwidth(), wav.getframerate()) != (1, 2, 24000):
                raise ValueError(f'{source}: unexpected format')
    DEST.mkdir(exist_ok=True)
    installed = []
    for source, target in MAPPING.items():
        shutil.copyfile(SOURCE / source, DEST / target)
        installed.append({'file': target, 'source': f'../pilot/azure/{source}',
                          'sha256': expected[source], 'processing': 'Byte-for-byte copy'})
    intro_sources = ['04-s.wav', '05-u.wav', '06-n.wav']
    pcm = []
    for source in intro_sources:
        with wave.open(str(SOURCE / source)) as wav:
            pcm.append(wav.readframes(wav.getnframes()))
    with wave.open(str(DEST / '01-intro.wav'), 'wb') as intro:
        intro.setparams((1, 2, 24000, 0, 'NONE', 'not compressed'))
        intro.writeframes(b''.join(pcm))
    installed.append({'file': '01-intro.wav',
                      'sources': [f'../pilot/azure/{name}' for name in intro_sources],
                      'sha256': hashlib.sha256((DEST / '01-intro.wav').read_bytes()).hexdigest(),
                      'processing': 'Separate s, short u, n in order with original silence; PCM joined without changing samples. Not a connected blend.'})
    (DEST / 'installed-manifest.json').write_text(json.dumps({
        'voice': 'en-US-JennyNeural', 'format': '24 kHz mono PCM16 WAV',
        'ownerAuthorizedLocalIntegration': True, 'publicationAuthorized': False,
        'clips': installed}, indent=2) + '\n')
    print('Installed six approved recordings and one separated intro sequence for local preview.')
    # Reapplying the original installation must retain newer owner approvals.
    data_path = LAB.parent / 'src/games/sound-lab/words.json'
    if data_path.exists() and json.loads(data_path.read_text(encoding='utf-8')).get('sustainedConsonants'):
        import runpy
        runpy.run_path(str(LAB / 'install-approved-nasals.py'), run_name='__main__')


if __name__ == '__main__':
    main()
