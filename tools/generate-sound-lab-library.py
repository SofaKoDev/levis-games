"""Local-only Jenny library candidates. --generate reads credentials on stdin.
Never retries failed requests. Shares the previously approved $1 total ceiling.
"""
import argparse, array, hashlib, html, io, json, math, sys, wave
from pathlib import Path
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

LAB=Path(__file__).resolve().parent
ROOT=LAB.parent
DATA=json.loads((ROOT/'src/games/sound-lab/words.json').read_text(encoding='utf-8'))
OUT=LAB/'audio/library'
LEDGER=LAB/'pilot/azure/request-budget.json'
MANIFEST=LAB/'library-manifest.json'
RATE=15/1_000_000

def ssml(text,ipa=None,rate='-20%'):
    content=f'<phoneme alphabet="ipa" ph="{html.escape(ipa,quote=True)}">{html.escape(text)}</phoneme>' if ipa else html.escape(text)
    return f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="{DATA["voice"]}"><prosody rate="{rate}">{content}</prosody></voice></speak>'

def plan():
    requests={}
    for word in DATA['words']:
        if word['id']=='sun' or word['engineStatus']!='supported':continue
        for u in word['units']:
            # Sustained continuants only. Stop consonants must not acquire a vowel.
            ph=u['ipa']+('ː' if u['ipa'] in ['s','f','m','n','z','ɹ'] else '')
            requests[f'phoneme-{u["phoneme"]}.wav']=ssml(u['text'],ph,'-30%')
        for n in range(2,len(word['units'])+1):
            units=word['units'][:n]
            requests[f'{word["id"]}-blend-{n}.wav']=ssml(''.join(u['text'] for u in units),''.join(u['ipa'] for u in units))
        requests[f'{word["id"]}-word.wav']=ssml(word['word'],rate='0%')
    for key in ['s','uh','n']:requests.pop(f'phoneme-{key}.wav',None)
    return requests

def describe(path):
    raw=path.read_bytes()
    with wave.open(io.BytesIO(raw),'rb') as w:
        if (w.getnchannels(),w.getsampwidth(),w.getframerate())!=(1,2,24000):raise ValueError(f'Unexpected WAV format: {path.name}')
        samples=array.array('h',w.readframes(w.getnframes()))
    peak=max(map(abs,samples),default=0)
    if not peak or peak>=32767:raise ValueError(f'Empty or clipped: {path.name}')
    active=[i for i,s in enumerate(samples) if abs(s)>100]
    return {'sha256':hashlib.sha256(raw).hexdigest(),'seconds':round(len(samples)/24000,3),'activeSpanSeconds':round((active[-1]-active[0]+1)/24000,3) if active else 0,'peak':round(peak/32768,5),'reviewed':False}

def main(generate=False):
    OUT.mkdir(exist_ok=True)
    requests=plan();ledger=json.loads(LEDGER.read_text())
    missing={name:xml for name,xml in requests.items() if not (OUT/name).exists()}
    reserved=sum(a['xmlCharacters'] for a in ledger['attempts'])
    estimate=(reserved+sum(map(len,missing.values())))*RATE
    print(json.dumps({'missingRequests':len(missing),'priorReservedCharacters':reserved,'maximumTotalEstimateUsd':round(estimate,6),'sharedApprovedCeilingUsd':1}),flush=True)
    if estimate>1:raise SystemExit('Shared approved ceiling would be exceeded; no requests sent')
    if not generate:return
    credentials=json.loads(sys.stdin.readline())
    if credentials['region']!='eastus':raise ValueError('Unexpected region')
    try:
        for index,(name,xml) in enumerate(missing.items(),1):
            attempt={'file':f'library/{name}','xmlCharacters':len(xml),'submittedUtc':datetime.now(timezone.utc).isoformat(),'result':'reserved; outcome unknown if interrupted'}
            ledger['attempts'].append(attempt);LEDGER.write_text(json.dumps(ledger,indent=2)+'\n')
            request=Request('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1',data=xml.encode(),method='POST',headers={'Ocp-Apim-Subscription-Key':credentials['key'],'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'riff-24khz-16bit-mono-pcm','User-Agent':'LevisSoundLab-LocalLibraryReview'})
            try:
                with urlopen(request,timeout=30) as response:audio=response.read()
                (OUT/name).write_bytes(audio);describe(OUT/name)
                (OUT/name.replace('.wav','.ssml')).write_text(xml,encoding='utf-8')
                attempt['result']='audio saved; unreviewed'
            except HTTPError as error:
                attempt['result']=f'HTTP {error.code}';raise RuntimeError(f'{name}: HTTP {error.code}; stopped, no retry') from None
            except URLError:
                attempt['result']='connection failed; billing outcome unknown';raise RuntimeError(f'{name}: connection failed; stopped, no retry') from None
            finally:LEDGER.write_text(json.dumps(ledger,indent=2)+'\n')
            if index%10==0:print(f'{index}/{len(missing)} recordings saved for review',flush=True)
    finally:credentials.clear()
    # Exact approved phonemes are reused, never synthesized again.
    for key,source in [('s','02-s.wav'),('uh','03-u.wav'),('n','04-n.wav')]:
        (OUT/f'phoneme-{key}.wav').write_bytes((LAB/'audio'/source).read_bytes())
    for word in DATA['words']:
        if word['id']=='sun' or word['engineStatus']!='supported':continue
        frames=[]
        for u in word['units']:
            with wave.open(str(OUT/f'phoneme-{u["phoneme"]}.wav'),'rb') as w:frames.append(w.readframes(w.getnframes()))
        with wave.open(str(OUT/f'{word["id"]}-intro.wav'),'wb') as w:
            w.setparams((1,2,24000,0,'NONE','not compressed'));w.writeframes(b''.join(frames))
    manifest={'voice':DATA['voice'],'status':'Candidates require human pronunciation and illustration review','processing':'Raw synthesis; intro files concatenate isolated phonemes with their original pauses. No synthetic blend splicing.','files':{},'art':{}}
    for path in sorted((LAB/'audio').rglob('*.wav')):manifest['files'][path.relative_to(LAB/'audio').as_posix()]=describe(path)
    for path in sorted((LAB/'illustrations').glob('*.svg')):manifest['art'][path.stem]=hashlib.sha256(path.read_bytes()).hexdigest()
    manifest['art']['sun']=hashlib.sha256((ROOT/'src/games/sound-lab/illustration.js').read_bytes()).hexdigest()
    manifest['conservativeTotalEstimateUsd']=round(sum(a['xmlCharacters'] for a in ledger['attempts'])*RATE,6)
    MANIFEST.write_text(json.dumps(manifest,indent=2)+'\n')
    print(f'Candidate assets complete. Shared conservative estimate ${manifest["conservativeTotalEstimateUsd"]:.6f}. Human review still required.',flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--generate',action='store_true');parser.add_argument('--credential-file');args=parser.parse_args()
    secret=Path(args.credential_file) if args.credential_file else None
    try:
        if secret:sys.stdin=secret.open(encoding='utf-8')
        main(args.generate)
    finally:
        if secret:
            sys.stdin.close()
            if secret.name=='speech-session.json' and secret.parent.name.startswith('levis-azure-'):
                secret.unlink(missing_ok=True);secret.parent.rmdir()
