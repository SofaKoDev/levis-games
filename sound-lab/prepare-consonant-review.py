"""Local, unapproved comparison edits. Originals and playable lessons stay intact.

Hold the steady voiced center of /m/ and /n/ using pitch-period repetition.
Preserve their original onset, release and pitch. Raise the quiet /p/ release
without inventing a vowel. Requires the already installed numpy package.
"""
import hashlib,json,wave
from pathlib import Path
import numpy as np

LAB=Path(__file__).resolve().parent
OUT=LAB/'pilot/consonant-length'
RATE=24000

def load(path):
    with wave.open(str(path),'rb') as w:
        assert (w.getnchannels(),w.getsampwidth(),w.getframerate())==(1,2,RATE)
        return np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)

def active(x):
    found=np.flatnonzero(np.abs(x)>100)
    if not len(found):raise ValueError('Silent source')
    return int(found[0]),int(found[-1]+1)

def sustain(x,seconds=.60):
    start,end=active(x);center=(start+end)//2
    # Correlate a 35 ms central window over the typical voiced pitch range.
    window=int(.035*RATE);anchor=center-window//2
    reference=x[anchor:anchor+window];reference=reference-reference.mean()
    candidates=[]
    for period in range(int(RATE/400),int(RATE/100)):
        shifted=x[anchor+period:anchor+period+window];shifted=shifted-shifted.mean()
        score=float(np.dot(reference,shifted)/(np.linalg.norm(reference)*np.linalg.norm(shifted)+1e-9))
        candidates.append((score,period))
    score,period=max(candidates)
    if score<.65:raise ValueError('Steady voiced center not reliable enough for this edit')
    # Use several intact periods per repeat, avoiding a tiny buzzy single-cycle loop.
    grain=period*4;cut=center-grain//2
    repeats=max(1,round((seconds*RATE-(end-start))/grain))
    chunk=x[cut:cut+grain].copy()
    fade=min(period,len(chunk)//4)
    # Crossfade each repeated period boundary with the natural neighboring onset.
    blend=np.linspace(0,1,fade,endpoint=False)
    insert=np.tile(chunk,repeats)
    for boundary in range(grain,len(insert),grain):
        insert[boundary:boundary+fade]=chunk[:fade]*blend+chunk[-fade:]*(1-blend)
    insert[:fade]=x[cut:cut+fade]*blend+x[cut-fade:cut]*(1-blend)
    result=np.concatenate([x[:cut],insert,x[cut:]])
    return result,{'method':'Pitch-period repetition of the original steady nasal center; original pitch, onset and release retained','pitchPeriodSamples':period,'centralCorrelation':round(score,4),'insertedSeconds':round(len(insert)/RATE,3)}

def main():
    OUT.mkdir(exist_ok=True)
    manifest={'status':'Unapproved local comparison edits; no game assets replaced','voice':'en-US-JennyNeural','additionalApiCostUsd':0,'clips':[]}
    for phone in ['m','n','p']:
        source=LAB/f'audio/library/phoneme-{phone}.wav';x=load(source)
        if phone=='p':
            gain=min(6, .28*32768/np.max(np.abs(x)))
            result=x*gain
            # Do not amplify the low-level background in the long silent tail.
            start,end=active(x);left=max(0,start-int(.03*RATE));right=min(len(x),end+int(.08*RATE))
            result[:left]=0;result[right:]=0
            fade=int(.005*RATE);result[left:left+fade]*=np.linspace(0,1,fade);result[right-fade:right]*=np.linspace(1,0,fade)
            processing={'method':'Gain on the original burst and release; background tail removed. No vowel added and no phoneme stretching','gainDb':round(20*np.log10(gain),2)}
        else:result,processing=sustain(x)
        # Keep the comparison easy to hear without a long empty WAV tail.
        start,end=active(result);result=result[max(0,start-int(.12*RATE)):min(len(result),end+int(.30*RATE))]
        samples=np.rint(result).astype('<i2');path=OUT/f'{phone}-candidate.wav'
        if np.max(np.abs(result))>=32767:raise ValueError('Clipped output')
        with wave.open(str(path),'wb') as w:
            w.setparams((1,2,RATE,0,'NONE','not compressed'));w.writeframes(samples.tobytes())
        begin,finish=active(samples)
        record={'phoneme':phone,'file':path.name,'source':source.relative_to(LAB).as_posix(),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'sourceActiveSeconds':round((active(x)[1]-active(x)[0])/RATE,3),'candidateActiveSeconds':round((finish-begin)/RATE,3),'peak':round(float(np.max(np.abs(result)))/32768,5),'approved':False,**processing}
        manifest['clips'].append(record)
        print(f'{phone}: {record["sourceActiveSeconds"]}s to {record["candidateActiveSeconds"]}s active; peak {record["peak"]}',flush=True)
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')

if __name__=='__main__':main()
