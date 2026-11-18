"""Generate local BOX/FOX candidates within the existing Azure $1 allowance."""
import importlib.util, json, sys, wave
from pathlib import Path
from datetime import datetime, timezone
from urllib.request import Request, urlopen

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('library_generator',HERE/'generate-library.py')
lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)
words=[w for w in lib.DATA['words'] if w['id'] in ('box','fox')]
requests={'phoneme-ks.wav':lib.ssml('x','ks','-30%')}
for word in words:
 for n in (2,3):
  units=word['units'][:n]
  requests[f'{word["id"]}-blend-{n}.wav']=lib.ssml(''.join(u['text'] for u in units),''.join(u['ipa'] for u in units))
 requests[f'{word["id"]}-word.wav']=lib.ssml(word['word'],rate='0%')

def main(credential_path):
 ledger=json.loads(lib.LEDGER.read_text());manifest=json.loads(lib.MANIFEST.read_text())
 missing={name:xml for name,xml in requests.items() if not (lib.OUT/name).exists()}
 total=(sum(a['xmlCharacters'] for a in ledger['attempts'])+sum(len(xml) for xml in missing.values()))*lib.RATE
 print(f'{len(missing)} new recordings; conservative shared total ${total:.6f} of approved $1 ceiling',flush=True)
 if total>1:raise SystemExit('Approved Azure ceiling exceeded; no requests sent')
 credentials=json.loads(credential_path.read_text(encoding='utf-8'))
 try:
  if credentials['region']!='eastus':raise ValueError('Unexpected Azure region')
  for name,xml in missing.items():
   attempt={'file':f'library/{name}','xmlCharacters':len(xml),'submittedUtc':datetime.now(timezone.utc).isoformat(),'result':'reserved; outcome unknown if interrupted'}
   ledger['attempts'].append(attempt);lib.LEDGER.write_text(json.dumps(ledger,indent=2)+'\n')
   try:
    req=Request('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1',data=xml.encode(),method='POST',headers={'Ocp-Apim-Subscription-Key':credentials['key'],'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'riff-24khz-16bit-mono-pcm','User-Agent':'LevisSoundLab-LocalXReview'})
    with urlopen(req,timeout=30) as response: audio=response.read()
    target=lib.OUT/name;target.write_bytes(audio);lib.describe(target)
    target.with_suffix('.ssml').write_text(xml,encoding='utf-8')
    attempt['result']='audio saved; unreviewed'
   except Exception as exc:
    attempt['result']=f'failed: {type(exc).__name__}; no retry';raise
   finally:lib.LEDGER.write_text(json.dumps(ledger,indent=2)+'\n')
  for word in words:
   target=lib.OUT/f'{word["id"]}-intro.wav'
   if not target.exists():
    frames=[]
    for unit in word['units']:
     with wave.open(str(lib.OUT/f'phoneme-{unit["phoneme"]}.wav'),'rb') as wav:frames.append(wav.readframes(wav.getnframes()))
    with wave.open(str(target),'wb') as wav:
     wav.setparams((1,2,24000,0,'NONE','not compressed'));wav.writeframes(b''.join(frames))
   lib.describe(target)
  for path in [lib.OUT/name for name in requests]+[lib.OUT/f'{w["id"]}-intro.wav' for w in words]:
   manifest['files'][path.relative_to(HERE/'audio').as_posix()]=lib.describe(path)
  manifest['conservativeTotalEstimateUsd']=round(sum(a['xmlCharacters'] for a in ledger['attempts'])*lib.RATE,6)
  lib.MANIFEST.write_text(json.dumps(manifest,indent=2)+'\n')
  print('BOX and FOX candidate assets saved; listening approval required.',flush=True)
 finally:
  credentials.clear();credential_path.unlink(missing_ok=True)
  if credential_path.name=='speech-session.json' and credential_path.parent.name.startswith('levis-azure-'):credential_path.parent.rmdir()

if __name__=='__main__':main(Path(sys.argv[1]))
