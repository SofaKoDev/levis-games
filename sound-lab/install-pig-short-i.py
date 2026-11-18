"""Install the owner-approved short I for PIG's standalone I stage only."""
import hashlib,importlib.util,json
from pathlib import Path

LAB=Path(__file__).resolve().parent
SOURCE=LAB/'audio/library/pig-short-i-candidate.wav'
EXPECTED='992e71fdee6c30d9ea9b3834d21c29c0cc018fa13c4ec9f5a5749b75fa03a240'

def main():
    if hashlib.sha256(SOURCE.read_bytes()).hexdigest()!=EXPECTED:raise ValueError('Reviewed short-I candidate changed')
    target=LAB/'audio/library/pig-short-i-demo.wav';target.write_bytes(SOURCE.read_bytes())
    spec=importlib.util.spec_from_file_location('library_tools',LAB/'generate-library.py');library=importlib.util.module_from_spec(spec);spec.loader.exec_module(library)
    path=LAB/'library-manifest.json';manifest=json.loads(path.read_text());manifest['files']['library/pig-short-i-demo.wav']={**library.describe(target),'reviewed':True,'spokenIpa':'ɪ','source':'audio/library/pig-short-i-candidate.wav','approvalScope':'Owner approved for the standalone I in PIG only'};path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=LAB.parent/'src/games/sound-lab/words.json';data=json.loads(path.read_text(encoding='utf-8'))
    data.setdefault('wordDemonstrations',{}).setdefault('pig',{})['1']={'audio':'library/pig-short-i-demo.wav','spokenIpa':'ɪ','approved':True,'scope':'Standalone I in PIG only; other words, intro, partial blend, full blend, and whole word retain their own recordings'}
    data.get('comparisonRecordings',{}).pop('i',None)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Installed approved short I for PIG standalone stage; connected audio unchanged.')

if __name__=='__main__':main()
