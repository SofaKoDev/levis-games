"""Install owner-approved raw longer M/N; rebuild only separated introductions.
No generation, editing, changes to connected blends, or deferred P intro change.
"""
import hashlib,importlib.util,json,wave
from pathlib import Path

LAB=Path(__file__).resolve().parent
ROOT=LAB.parent
APPROVED={
 'm':('m-slow.wav','1805dfa2e79ec967be4f5139158af3a6ea73f3fc9b4e2876e7594bc335029005'),
 'n':('n-slow.wav','c0c84db304ea8337d0d008f0f061e3274d0c63c5ae31851f536697bf908d93f3'),
}

def join_separated(target,sources):
    frames=[]
    for source in sources:
        with wave.open(str(source),'rb') as w:
            if (w.getnchannels(),w.getsampwidth(),w.getframerate())!=(1,2,24000):raise ValueError('Unexpected source format')
            frames.append(w.readframes(w.getnframes()))
    with wave.open(str(target),'wb') as w:
        w.setparams((1,2,24000,0,'NONE','not compressed'));w.writeframes(b''.join(frames))

def main():
    dataPath=ROOT/'src/games/sound-lab/words.json';data=json.loads(dataPath.read_text(encoding='utf-8'))
    spec=importlib.util.spec_from_file_location('library_tools',LAB/'generate-library.py');library=importlib.util.module_from_spec(spec);spec.loader.exec_module(library)
    for file,expected in APPROVED.values():
        if hashlib.sha256((LAB/'pilot/fresh-consonants'/file).read_bytes()).hexdigest()!=expected:raise ValueError('Approved source has changed')
    # Establish an invariant before writing: connected recordings must stay exact.
    protected={p:hashlib.sha256(p.read_bytes()).hexdigest() for p in (LAB/'audio').rglob('*.wav') if '-blend-' in p.name or '-word' in p.name or p.name in ['05-partial-su.wav','06-connected-sun.wav']}
    changed=[]
    for phone,(file,expected) in APPROVED.items():
        target=LAB/f'audio/library/phoneme-{phone}.wav';target.write_bytes((LAB/'pilot/fresh-consonants'/file).read_bytes());changed.append(target)
        data.setdefault('sustainedConsonants',{})[phone]={'approved':True,'source':f'pilot/fresh-consonants/{file}','sha256':expected,'scope':'Isolated sound and separated introductions only; connected blends and natural words unchanged'}
    target=LAB/'audio/04-n.wav';target.write_bytes((LAB/'pilot/fresh-consonants/n-slow.wav').read_bytes());changed.append(target)
    for word in data['words']:
        if word['id']=='sun' or word['engineStatus']!='supported' or not any(u['phoneme'] in APPROVED for u in word['units']):continue
        target=LAB/f'audio/library/{word["id"]}-intro.wav'
        join_separated(target,[LAB/f'audio/library/phoneme-{u["phoneme"]}.wav' for u in word['units']]);changed.append(target)
    join_separated(LAB/'audio/01-intro.wav',[LAB/f'audio/{name}' for name in ['02-s.wav','03-u.wav','04-n.wav']]);changed.append(LAB/'audio/01-intro.wav')
    manifestPath=LAB/'library-manifest.json';manifest=json.loads(manifestPath.read_text())
    for path in changed:
        key=path.relative_to(LAB/'audio').as_posix();manifest['files'][key]={**library.describe(path),'reviewed':path.name in ['phoneme-m.wav','phoneme-n.wav','04-n.wav'],'processing':'Approved raw longer M/N; separated introductions concatenate unchanged source PCM with pauses' if 'intro' in path.name else 'Byte-for-byte copy of owner-approved fresh Jenny recording'}
    manifestPath.write_text(json.dumps(manifest,indent=2)+'\n')
    installedPath=LAB/'audio/installed-manifest.json';installed=json.loads(installedPath.read_text())
    for clip in installed['clips']:
        if clip['file']=='04-n.wav':clip.update(source='../pilot/fresh-consonants/n-slow.wav',sha256=APPROVED['n'][1],processing='Byte-for-byte copy of newly owner-approved longer N')
        if clip['file']=='01-intro.wav':
            clip.pop('source',None);clip.update(sources=['02-s.wav','03-u.wav','04-n.wav'],sha256=manifest['files']['01-intro.wav']['sha256'],processing='Separate approved s, short u and newly approved longer n; source PCM unchanged, no connected blend')
    installedPath.write_text(json.dumps(installed,indent=2)+'\n')
    freshPath=LAB/'pilot/fresh-consonants/manifest.json';fresh=json.loads(freshPath.read_text())
    for clip in fresh['clips']:
        if clip['file'] in ['m-slow.wav','n-slow.wav']:clip['reviewed']=True;clip['note']='Owner approved the raw longer nasal for isolated sound and separated introductions; no connected blend changes'
    fresh['status']='Longer M/N and standalone P-with-schwa approved; P opening-intro change explicitly deferred.'
    freshPath.write_text(json.dumps(fresh,indent=2)+'\n');dataPath.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    for path,expected in protected.items():
        if hashlib.sha256(path.read_bytes()).hexdigest()!=expected:raise ValueError(f'Unexpected connected audio change: {path.name}')
    print(f'Installed approved longer M/N and refreshed {sum("intro" in p.name for p in changed)} separated introductions. All {len(protected)} connected/word recordings unchanged.')

if __name__=='__main__':main()
