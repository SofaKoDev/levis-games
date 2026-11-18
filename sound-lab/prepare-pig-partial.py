"""Local PIG partial candidate from the connected word's P-to-short-I prefix.
No generation, phoneme splicing, looping, pitch changes or time stretching.
"""
import hashlib,importlib.util,json,wave
from pathlib import Path
import numpy as np

LAB=Path(__file__).resolve().parent
SOURCE=LAB/'audio/library/pig-blend-3.wav'
EXPECTED='c5881f81d8b00978f5edd2657f703983c24e21cfe8a7920b7c471b631fb2e936'
OUT=LAB/'pilot/pig-partial'
CUT_SECONDS=.405
FADE_SECONDS=.008

def main():
    if hashlib.sha256(SOURCE.read_bytes()).hexdigest()!=EXPECTED:raise ValueError('Connected PIG source changed; recheck the vowel and cut position')
    OUT.mkdir(exist_ok=True)
    dest=LAB/'audio/library/pig-blend-2.wav'
    original=OUT/'original-pig-blend-2.wav'
    if not original.exists():original.write_bytes(dest.read_bytes())
    with wave.open(str(SOURCE),'rb') as w:
        params=w.getparams();samples=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').copy()
    if (params.nchannels,params.sampwidth,params.framerate)!=(1,2,24000):raise ValueError('Unexpected source format')
    cutoff=round(CUT_SECONDS*params.framerate);fade=round(FADE_SECONDS*params.framerate)
    # End inside the vowel, before closure/release of G. A brief fade avoids a click.
    samples[cutoff-fade:cutoff]=np.rint(samples[cutoff-fade:cutoff].astype(float)*np.linspace(1,0,fade)).astype('<i2')
    samples[cutoff:]=0
    candidate=OUT/'pig-short-i-candidate.wav'
    with wave.open(str(candidate),'wb') as w:w.setparams(params);w.writeframes(samples.tobytes())
    dest.write_bytes(candidate.read_bytes())
    spec=importlib.util.spec_from_file_location('library_tools',LAB/'generate-library.py');library=importlib.util.module_from_spec(spec);spec.loader.exec_module(library)
    entry={**library.describe(dest),'source':'audio/library/pig-blend-3.wav','sourceSha256':EXPECTED,'processing':'Single connected prefix through 405 ms; last 8 ms faded and rest silenced before G. No phoneme splicing or stretching.','reviewed':False,'reviewStatus':'Replacement short-I partial candidate awaiting owner listening review','cutSeconds':CUT_SECONDS,'fadeSeconds':FADE_SECONDS}
    path=LAB/'library-manifest.json';data=json.loads(path.read_text());data['files']['library/pig-blend-2.wav']=entry;path.write_text(json.dumps(data,indent=2)+'\n')
    (OUT/'manifest.json').write_text(json.dumps({'status':'Short-I replacement candidate connected to local review only; pronunciation review pending','originalPartialSha256':hashlib.sha256(original.read_bytes()).hexdigest(),'additionalApiCostUsd':0,'clip':entry},indent=2)+'\n')
    print(f'PIG short-I partial candidate installed: {entry["activeSpanSeconds"]}s active. Connected source and whole word unchanged.')

if __name__=='__main__':main()
