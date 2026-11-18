"""Generate unapproved local SUN probes using the already installed eSpeak NG DLL.

Run from the repository root with .local-tools/python on PYTHONPATH.
No downloads, credentials, network calls, playback, or game integration.
"""
import array
import argparse
import ctypes as C
import hashlib
import json
import math
import wave
from datetime import datetime, timezone
from pathlib import Path

import espeakng_loader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'sound-lab' / 'pilot' / 'espeak'
CASES = [
    ('01-s', '/s/', '[[s]]', 80),
    ('02-u', '/ʌ/', "[['V]]", 80),
    ('03-n', '/n/', '[[n]]', 80),
    ('04-su', '/sʌ/', "[[s'V]]", 80),
    ('05-sun-connected', '/sʌn/', "[[s'Vn]]", 80),
    ('06-sun-natural', 'sun', 'Sun.', 175),
    ('07-s-lengthened', '/s/ lengthening experiment', '[[s:]]', 80),
    ('08-n-lengthened', '/n/ lengthening experiment', '[[n:]]', 80),
    ('09-n-held', '/n/ sustained candidate', '[[' + 'n' * 32 + ']]', 80),
]


class EventId(C.Union):
    _fields_ = [('number', C.c_int), ('name', C.c_char_p), ('string', C.c_char * 8)]


class Event(C.Structure):
    _fields_ = [('type', C.c_int), ('unique_identifier', C.c_uint),
                ('text_position', C.c_int), ('length', C.c_int),
                ('audio_position', C.c_int), ('sample', C.c_int),
                ('user_data', C.c_void_p), ('id', EventId)]


def main(variant=None):
    out = OUT / 'voices' / variant if variant else OUT
    voice = 'en-us' if not variant or variant == 'default' else f'en-us+{variant}'
    out.mkdir(parents=True, exist_ok=True)
    lib = C.CDLL(espeakng_loader.get_library_path())
    lib.espeak_Initialize.argtypes = [C.c_int, C.c_int, C.c_char_p, C.c_int]
    lib.espeak_Initialize.restype = C.c_int
    lib.espeak_SetVoiceByName.argtypes = [C.c_char_p]
    lib.espeak_SetParameter.argtypes = [C.c_int, C.c_int, C.c_int]
    lib.espeak_Info.argtypes = [C.POINTER(C.c_char_p)]
    lib.espeak_Info.restype = C.c_char_p
    lib.espeak_Synth.argtypes = [C.c_void_p, C.c_size_t, C.c_uint, C.c_int,
                                C.c_uint, C.c_uint, C.POINTER(C.c_uint), C.c_void_p]
    callback_type = C.CFUNCTYPE(C.c_int, C.POINTER(C.c_short), C.c_int, C.POINTER(Event))
    lib.espeak_SetSynthCallback.argtypes = [callback_type]
    # Synchronous retrieval, with IPA phoneme events. It never plays to speakers.
    rate = lib.espeak_Initialize(2, 0, str(Path(espeakng_loader.get_data_path()).parent).encode(), 3)
    if rate <= 0:
        raise RuntimeError('eSpeak initialization failed')
    chunks, events = [], []

    @callback_type
    def collect(samples, count, event_list):
        if samples and count:
            chunks.append(C.string_at(samples, count * C.sizeof(C.c_short)))
        if event_list:
            i = 0
            while event_list[i].type:
                event = event_list[i]
                if event.type == 7:
                    events.append({'ipa': bytes(event.id.string).decode('utf-8', errors='replace'),
                                   'audioMs': event.audio_position})
                i += 1
        return 0

    lib.espeak_SetSynthCallback(collect)
    if lib.espeak_SetVoiceByName(voice.encode()):
        raise RuntimeError('American English voice unavailable')
    data_path = C.c_char_p()
    result = {'createdUtc': datetime.now(timezone.utc).isoformat(),
              'status': 'Unreviewed eSpeak pronunciation candidates; no integration approval',
              'engine': lib.espeak_Info(C.byref(data_path)).decode(),
              'engineLicense': 'GPL-3.0-or-later; inference tools are not shipped in the game',
              'librarySha256': hashlib.sha256(Path(espeakng_loader.get_library_path()).read_bytes()).hexdigest(),
              'voice': voice, 'sampleRate': rate, 'format': 'mono PCM16 WAV',
              'processing': 'Unmodified synchronous engine output; no splicing, time stretching, or normalization',
              'clips': []}
    try:
        for name, intended, text, speed in CASES:
            n_tokens = 8 if variant == 'klatt' else 32
            if name == '09-n-held':
                text = '[[' + 'n' * n_tokens + ']]'
            chunks.clear()
            events.clear()
            if lib.espeak_SetParameter(1, speed, 0) or lib.espeak_SetParameter(2, 80, 0):
                raise RuntimeError('Parameter setup failed')
            buf = C.create_string_buffer(text.encode('utf-8'))
            # UTF-8 + explicit [[phoneme]] syntax; no automatic final sentence pause.
            if lib.espeak_Synth(buf, len(buf), 0, 1, 0, 0x101, None, None):
                raise RuntimeError(f'{name}: synthesis failed')
            pcm = b''.join(chunks)
            samples = array.array('h', pcm)
            if not samples or not any(samples):
                raise RuntimeError(f'{name}: empty/silent output')
            peak = max(abs(s) for s in samples)
            if peak >= 32767:
                raise RuntimeError(f'{name}: clipped output')
            path = out / f'{name}.wav'
            with wave.open(str(path), 'wb') as wav:
                wav.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
                wav.writeframes(pcm)
            active = [i for i, s in enumerate(samples) if abs(s) > 100]
            clip = {'file': path.name, 'intended': intended, 'input': text, 'wordsPerMinute': speed,
                    'volume': 80, 'directPhonemes': text.startswith('[['),
                    'seconds': round(len(samples) / rate, 3),
                    'activeSpanSeconds': round((active[-1] - active[0] + 1) / rate, 3) if active else 0,
                    'peak': round(peak / 32768, 5),
                    'rms': round(math.sqrt(sum(s*s for s in samples) / len(samples)) / 32768, 5),
                    'engineReportedPhonemes': list(events),
                    'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'approved': False}
            if name == '09-n-held':
                clip['method'] = f'{n_tokens} consecutive n phoneme tokens in one synthesis request; no audio loops, splicing, or vowel tokens. Review for pulsing/artifacts.'
            result['clips'].append(clip)
            print(json.dumps(clip, ensure_ascii=True), flush=True)
        (out / 'manifest.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    finally:
        lib.espeak_Terminate()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--variant', choices=['default', 'f2', 'f3', 'm3', 'klatt'])
    main(parser.parse_args().variant)
