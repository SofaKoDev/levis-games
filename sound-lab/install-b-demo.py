"""Install owner-approved buh for standalone B only; no new synthesis."""
import hashlib,importlib.util,json
from pathlib import Path
LAB=Path(__file__).resolve().parent
EXPECTED=''

def main():
    source=LAB/'pilot/b-consonant/b-with-schwa.wav'
    manifestPath=LAB/'pilot/b-consonant/manifest.json';pilot=json.loads(manifestPath.read_text())
    approvedHash=pilot['clips'][0]['sha256']
    if hashlib.sha256(source.read_bytes()).hexdigest()!=approvedHash:raise ValueError('Approved B source changed')
    target=LAB/'audio/library/phoneme-b-demo.wav';target.write_bytes(source.read_bytes())
    spec=importlib.util.spec_from_file_location('library_tools',LAB/'generate-library.py');lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)
    path=LAB/'library-manifest.json';data=json.loads(path.read_text());data['files']['library/phoneme-b-demo.wav']={**lib.describe(target),'reviewed':True,'spokenIpa':'bə','source':'pilot/b-consonant/b-with-schwa.wav','approvalScope':'Standalone B only; introductions, connected blends, and whole words retain pure /b/'};path.write_text(json.dumps(data,indent=2)+'\n')
    path=LAB.parent/'src/games/sound-lab/words.json';data=json.loads(path.read_text(encoding='utf-8'));data.setdefault('isolatedDemonstrations',{})['b']={'audio':'library/phoneme-b-demo.wav','spokenIpa':'bə','approved':True,'scope':'Standalone B only; introductions, connected blends and whole words retain /b/'};data.get('comparisonRecordings',{}).pop('b',None);path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    pilot['status']='Owner approved buh for standalone B only; installed unchanged locally.';pilot['clips'][0].update(reviewed=True,note='Owner approved for standalone B only. No separate comparison control.');manifestPath.write_text(json.dumps(pilot,indent=2)+'\n')
    print('Installed buh for standalone B. Intro, blends, and words unchanged.')

if __name__=='__main__':main()
