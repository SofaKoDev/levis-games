"""Generate all valid Number Blaster prompts as local Jenny WAVs.

The credential file is temporary and deleted even on failure. Completed files are
never regenerated. Each attempt is recorded before sending so interrupted runs
can be audited without guessing what Azure processed.
"""
import argparse, hashlib, html, json, sys, time, wave
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'audio'
LEDGER=ROOT/'audio-generation-ledger.json'
MANIFEST=ROOT/'audio-manifest.json'
VOICE='en-US-JennyNeural'
RATE=15/1_000_000

def prompts():
 for current in range(1,21):
  for amount in range(1,21-current):
   yield f'add-{current}-{amount}',f'Add {amount}! {current} plus {amount} equals what?'
  for amount in range(1,current):
   yield f'subtract-{current}-{amount}',f'Take away {amount}! {current} minus {amount} equals what?'

def ssml(text):
 return f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="{VOICE}"><prosody rate="-10%">{html.escape(text)}</prosody></voice></speak>'

def check(path):
 with wave.open(str(path),'rb') as wav:
  assert (wav.getnchannels(),wav.getsampwidth(),wav.getframerate())==(1,2,24000),path
  assert wav.getnframes()>1000,path
 return hashlib.sha256(path.read_bytes()).hexdigest()

def main(credential_file=None):
 OUT.mkdir(exist_ok=True)
 planned=list(prompts());assert len(planned)==380
 ledger=json.loads(LEDGER.read_text()) if LEDGER.exists() else {'voice':VOICE,'attempts':[]}
 missing=[(name,text) for name,text in planned if not (OUT/f'{name}.wav').exists()]
 reserved=sum(a['xmlCharacters'] for a in ledger['attempts'])
 estimate=(reserved+sum(len(ssml(text)) for _,text in missing))*RATE
 print(f'{len(missing)} missing of 380 prompts; conservative total including previous attempts: ${estimate:.3f}',flush=True)
 if credential_file is None:return
 credentials=json.loads(credential_file.read_text(encoding='utf-8'))
 try:
  if credentials['region']!='eastus':raise ValueError('Unexpected Azure region')
  for index,(name,spoken) in enumerate(missing,1):
   xml=ssml(spoken)
   attempt={'file':f'{name}.wav','xmlCharacters':len(xml),'submittedUtc':datetime.now(timezone.utc).isoformat(),'result':'reserved; outcome unknown if interrupted'}
   ledger['attempts'].append(attempt);LEDGER.write_text(json.dumps(ledger,indent=2)+'\n',encoding='utf-8')
   req=Request('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1',data=xml.encode(),method='POST',headers={'Ocp-Apim-Subscription-Key':credentials['key'],'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'riff-24khz-16bit-mono-pcm','User-Agent':'LevisNumberBlaster-LocalAudio'})
   try:
    with urlopen(req,timeout=30) as response:audio=response.read()
    target=OUT/f'{name}.wav';target.write_bytes(audio);check(target)
    attempt['result']='audio saved; awaiting game review'
   except HTTPError as error:
    attempt['result']=f'HTTP {error.code}; stopped';raise RuntimeError(f'Azure returned HTTP {error.code} at {name}; stopped without retry') from None
   except URLError:
    attempt['result']='connection failed; billing outcome unknown';raise RuntimeError(f'Connection failed at {name}; stopped without retry') from None
   finally:LEDGER.write_text(json.dumps(ledger,indent=2)+'\n',encoding='utf-8')
   if index%25==0:print(f'{index}/{len(missing)} new clips saved',flush=True)
   time.sleep(.12)
  manifest={'voice':VOICE,'status':'locally generated; pronunciation review pending','files':{f'{name}.wav':{'spoken':spoken,'sha256':check(OUT/f'{name}.wav')} for name,spoken in planned},'conservativeTotalEstimateUsd':round(sum(a['xmlCharacters'] for a in ledger['attempts'])*RATE,3)}
  MANIFEST.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
  print('All 380 local recordings complete.',flush=True)
 finally:
  credentials.clear();credential_file.unlink(missing_ok=True)
  if credential_file.name=='speech-session.json' and credential_file.parent.name.startswith('levis-azure-'):credential_file.parent.rmdir()

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--credential-file');args=parser.parse_args()
 main(Path(args.credential_file) if args.credential_file else None)
