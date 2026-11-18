"""Install the owner-approved 'puh' only as a standalone P demonstration.
Existing isolated /p/, introductions, prefix blends and whole words stay intact.
"""
import hashlib,importlib.util,json
from pathlib import Path

LAB=Path(__file__).resolve().parent
ROOT=LAB.parent
EXPECTED='618279318af4fdba06e3ff33e77b832643ff856ea18f02196e797953ac9bf46b'

def main():
    source=LAB/'pilot/fresh-consonants/p-with-schwa.wav'
    if hashlib.sha256(source.read_bytes()).hexdigest()!=EXPECTED:raise ValueError('Approved source has changed')
    spec=importlib.util.spec_from_file_location('library_tools',LAB/'generate-library.py')
    library=importlib.util.module_from_spec(spec);spec.loader.exec_module(library)
    dest=LAB/'audio/library/phoneme-p-demo.wav';dest.write_bytes(source.read_bytes())
    description={**library.describe(dest),'reviewed':True,'spokenIpa':'pə','approvalScope':'Owner approved only for the standalone P demonstration, never merged words or blends','source':'pilot/fresh-consonants/p-with-schwa.wav'}
    manifestPath=LAB/'library-manifest.json';manifest=json.loads(manifestPath.read_text())
    manifest['files']['library/phoneme-p-demo.wav']=description
    manifestPath.write_text(json.dumps(manifest,indent=2)+'\n')
    dataPath=ROOT/'src/games/sound-lab/words.json';data=json.loads(dataPath.read_text(encoding='utf-8'))
    data.setdefault('isolatedDemonstrations',{})['p']={'audio':'library/phoneme-p-demo.wav','spokenIpa':'pə','approved':True,'scope':'Standalone P only; introductions, partial blends, full blends and natural words retain /p/'}
    dataPath.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    freshPath=LAB/'pilot/fresh-consonants/manifest.json';fresh=json.loads(freshPath.read_text())
    for clip in fresh['clips']:
        if clip['file']=='p-with-schwa.wav':
            clip['reviewed']=True;clip['note']='Owner approved as the standalone P demonstration only. Not used in introductions, blends or natural words.'
    fresh['status']='P-with-schwa approved for standalone P only; all other new candidates remain pending.'
    freshPath.write_text(json.dumps(fresh,indent=2)+'\n')
    print('Approved P demonstration installed unchanged. All original phonemes and word/blend recordings retained.')

if __name__=='__main__':main()
