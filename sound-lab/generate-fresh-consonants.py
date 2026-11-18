"""Fresh, raw Jenny comparison probes, sharing the approved $1 ledger.
No looping, stretching, normalization, installation, or automatic retries.
"""
import argparse,importlib.util,json,sys
from datetime import datetime,timezone
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError

LAB=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('library_tools',LAB/'generate-library.py')
library=importlib.util.module_from_spec(spec);spec.loader.exec_module(library)
OUT=LAB/'pilot/fresh-consonants'
PROBES=[
 ('m-slow','m','mː','-50%','Sustained /m/ candidate, freshly synthesized at half speaking rate'),
 ('n-slow','n','nː','-50%','Sustained /n/ candidate, freshly synthesized at half speaking rate'),
 ('p-isolated','p','p','0%','Isolated /p/ at normal speaking rate; compare its release with the previous clip'),
 ('p-with-schwa','puh','pə','0%','Comparison only: /pə/ includes an extra vowel. Not a pure isolated /p/ and not approved for the lesson'),
]

def main(secret):
    OUT.mkdir(exist_ok=True)
    ledger=json.loads(library.LEDGER.read_text())
    plans=[(name,library.ssml(text,ipa,rate),note) for name,text,ipa,rate,note in PROBES]
    estimate=(sum(a['xmlCharacters'] for a in ledger['attempts'])+sum(len(xml) for name,xml,_ in plans if not (OUT/f'{name}.wav').exists()))*library.RATE
    print(f'Shared conservative maximum estimate: ${estimate:.6f}; approved ceiling $1.',flush=True)
    if estimate>1:raise ValueError('Shared approved ceiling would be exceeded')
    credentials=json.loads(secret.read_text(encoding='utf-8'))
    if credentials['region']!='eastus':raise ValueError('Unexpected region')
    manifest={'voice':'en-US-JennyNeural','status':'Fresh raw candidates awaiting owner listening review. No game replacements.','processing':'Unchanged Azure output; no looping, time stretching, gain edits or splicing','clips':[]}
    try:
        for name,xml,note in plans:
            path=OUT/f'{name}.wav'
            if not path.exists():
                attempt={'file':f'{OUT.name}/{path.name}','xmlCharacters':len(xml),'submittedUtc':datetime.now(timezone.utc).isoformat(),'result':'reserved; outcome unknown if interrupted'}
                ledger['attempts'].append(attempt);library.LEDGER.write_text(json.dumps(ledger,indent=2)+'\n')
                request=Request('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1',data=xml.encode(),method='POST',headers={'Ocp-Apim-Subscription-Key':credentials['key'],'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'riff-24khz-16bit-mono-pcm','User-Agent':'LevisSoundLab-FreshConsonantReview'})
                try:
                    with urlopen(request,timeout=30) as response:raw=response.read()
                    path.write_bytes(raw);library.describe(path)
                    (OUT/f'{name}.ssml').write_text(xml,encoding='utf-8');attempt['result']='audio saved; unreviewed'
                except HTTPError as error:
                    attempt['result']=f'HTTP {error.code}';raise RuntimeError(f'{name}: HTTP {error.code}; no retry') from None
                except URLError:
                    attempt['result']='connection failed; billing outcome unknown';raise RuntimeError(f'{name}: connection failed; no retry') from None
                finally:library.LEDGER.write_text(json.dumps(ledger,indent=2)+'\n')
            clip={'file':path.name,'note':note,**library.describe(path)}
            manifest['clips'].append(clip)
            print(f'{path.name}: {clip["activeSpanSeconds"]}s active, peak {clip["peak"]}',flush=True)
            (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
        manifest['conservativeSharedEstimateUsd']=round(sum(a['xmlCharacters'] for a in ledger['attempts'])*library.RATE,6)
        (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
        print(f'All {len(plans)} raw comparisons saved. Shared estimate ${manifest["conservativeSharedEstimateUsd"]:.6f}.',flush=True)
    finally:credentials.clear()

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--credential-file',required=True);parser.add_argument('--g-only',action='store_true');parser.add_argument('--b-only',action='store_true');args=parser.parse_args();secret=Path(args.credential_file)
    if args.g_only:
        OUT=LAB/'pilot/g-consonant'
        PROBES=[('g-with-schwa','guh','ɡə','0%','Standalone G demonstration candidate /ɡə/; never for connected blends or whole words. Awaiting owner listening review.')]
    if args.b_only:
        OUT=LAB/'pilot/b-consonant'
        PROBES=[('b-with-schwa','buh','bə','0%','Standalone B demonstration candidate /bə/; never for connected blends or whole words. Awaiting owner listening review.')]
    try:main(secret)
    finally:
        if secret.name=='speech-session.json' and secret.parent.name.startswith('levis-azure-'):
            secret.unlink(missing_ok=True);secret.parent.rmdir()
