"""Install the owner-approved guh only for standalone G. No synthesis."""
import hashlib,importlib.util,json
from pathlib import Path
LAB=Path(__file__).resolve().parent
EXPECTED='608a3cf9e37dab99985aeabd7c593f2500d2818d5375b031fad5f0ea1e05164c'

def main():
    source=LAB/'pilot/g-consonant/g-with-schwa.wav'
    if hashlib.sha256(source.read_bytes()).hexdigest()!=EXPECTED:raise ValueError('Approved source has changed')
    spec=importlib.util.spec_from_file_location('library_tools',LAB/'generate-library.py');library=importlib.util.module_from_spec(spec);spec.loader.exec_module(library)
    dest=LAB/'audio/library/phoneme-g-demo.wav';dest.write_bytes(source.read_bytes())
    path=LAB/'library-manifest.json';data=json.loads(path.read_text());data['files']['library/phoneme-g-demo.wav']={**library.describe(dest),'reviewed':True,'spokenIpa':'ɡə','approvalScope':'Owner approved for standalone G only, never introductions, connected blends or natural words','source':'pilot/g-consonant/g-with-schwa.wav'};path.write_text(json.dumps(data,indent=2)+'\n')
    path=LAB.parent/'src/games/sound-lab/words.json';data=json.loads(path.read_text(encoding='utf-8'));data.setdefault('isolatedDemonstrations',{})['g']={'audio':'library/phoneme-g-demo.wav','spokenIpa':'ɡə','approved':True,'scope':'Standalone G only; introductions, connected blends and natural words retain /ɡ/'};data.get('comparisonRecordings',{}).pop('g',None);path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    path=LAB/'pilot/g-consonant/manifest.json';data=json.loads(path.read_text());data['status']='Owner approved guh for standalone G only; installed unchanged locally.';data['clips'][0].update(reviewed=True,note='Owner approved for standalone G only. Not used in introductions, connected blends or whole words.');path.write_text(json.dumps(data,indent=2)+'\n')
    print('Approved guh installed unchanged for standalone G. Intro, blends and whole-word recordings unchanged.')

if __name__=='__main__':main()
