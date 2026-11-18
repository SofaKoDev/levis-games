"""Original SVG recipes for the word library.
No network or audio generation. Word inventory comes only from words.json.
"""
import json
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT / 'sound-lab'
DATA = ROOT / 'src/games/sound-lab/words.json'


def svg(label, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 215" role="img" aria-label="{escape(label)}"><g stroke="#65766c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>'


def person(seated=False, child=False):
    return ('<circle cx="140" cy="58" r="28" fill="#f0c79f"/><path d="M115 46q24-29 50 0" fill="#8a6854"/>'
            '<path d="M111 112q29-22 58 0v44h-58z" fill="#7cb8ad"/><path d="M111 120l-22 24m80-24 23 24" fill="none"/>'
            + ('<path d="M120 156h48v30m-26-30v30" fill="none"/><path d="M106 164h76m-8 0v35" fill="none"/>' if seated else '<path d="M122 156v35m36-35v35" fill="none"/>')
            + '<circle cx="131" cy="61" r="2" fill="#65766c"/><circle cx="150" cy="61" r="2" fill="#65766c"/><path d="M132 75q9 8 18 0" fill="none"/>')


def art(word):
    if word in ['cat','dog','pig','rat','fox']:
        ears = '<path d="M91 87L87 30l43 43m20 0 43-43-4 57" fill="#e8b473"/>' if word in ['cat','fox'] else '<ellipse cx="88" cy="80" rx="22" ry="40" fill="#d3ad8e"/><ellipse cx="192" cy="80" rx="22" ry="40" fill="#d3ad8e"/>'
        if word=='pig': ears='<path d="M92 82L80 42l47 23m26 0 47-23-12 40" fill="#e9b3b5"/>'
        tail='<path d="M196 162q72-22 45-57" fill="none"/>' if word=='rat' else ''
        snout='<ellipse cx="140" cy="133" rx="28" ry="18" fill="#d88f9b"/><circle cx="130" cy="132" r="3"/><circle cx="150" cy="132" r="3"/>' if word=='pig' else '<path d="M133 126h14l-7 8z" fill="#65766c"/><path d="M129 144q11 8 22 0" fill="none"/>'
        return ears+tail+f'<ellipse cx="140" cy="149" rx="64" ry="46" fill="{"#e5a27e" if word=="fox" else "#ecc6a8"}"/><ellipse cx="140" cy="102" rx="65" ry="51" fill="{"#efbfc0" if word=="pig" else "#e5b576"}"/><circle cx="117" cy="103" r="4"/><circle cx="163" cy="103" r="4"/>'+snout
    if word in ['man','sam','am','me','sat','sit','see']:
        body=person(word in ['sat','sit'],word in ['sam','me','am'])
        if word in ['sam','am','me']: body+=f'<rect x="115" y="118" width="50" height="25" rx="7" fill="#fff9e9"/><text x="140" y="136" text-anchor="middle" stroke="none" fill="#475c58" font-family="sans-serif" font-size="15">{escape("Sam" if word=="sam" else "I am" if word=="am" else "me")}</text>'
        if word=='see': body+='<circle cx="192" cy="87" r="25" fill="#d8edf0" fill-opacity=".8"/><path d="M209 106l24 25" fill="none"/>'
        return body
    shapes={
      'map':'<path d="M35 55l70-19 70 19 70-19v132l-70 18-70-18-70 18z" fill="#e8dbaf"/><path d="M105 36v132m70-113v131" fill="none"/><path d="M56 138l35-42 37 19 37-37 51 43" fill="none" stroke="#7ca79b"/><circle cx="216" cy="121" r="9" fill="#d89a8e"/>',
      'hat':'<path d="M71 139l16-69q53-34 106 0l16 69z" fill="#88b6ad"/><path d="M81 112h119v27H81z" fill="#e6bc67"/><ellipse cx="140" cy="147" rx="104" ry="22" fill="#88b6ad"/>',
      'bat':'<path d="M127 98Q84 47 25 70l31 34-17 37 42-6 24 41 25-30h20l25 30 24-41 42 6-17-37 31-34q-59-23-102 28z" fill="#9b9bb8"/><ellipse cx="140" cy="124" rx="22" ry="47" fill="#7d809c"/><path d="M120 95l5-27 15 15 15-15 5 27" fill="#7d809c"/><circle cx="132" cy="102" r="2"/><circle cx="148" cy="102" r="2"/>',
      'mat':'<rect x="45" y="55" width="190" height="125" rx="12" fill="#e4bc85"/><path d="M65 77h150v81H65z" fill="#9fc6b3"/><path d="M27 69h18m-18 25h18m-18 25h18m-18 25h18m-18 25h18m190-100h18m-18 25h18m-18 25h18m-18 25h18m-18 25h18"/>',
      'fan':'<path d="M140 153v34m-40 5h80" fill="none"/><circle cx="140" cy="91" r="67" fill="#dce9de"/><path d="M140 88q-49-59-22-53 49-5 30 45 74-16 54 11-24 43-55 13-24 70-39 42-27-39 26-48" fill="#86b4ad"/><circle cx="140" cy="91" r="12" fill="#e8c779"/>',
      'pan':'<ellipse cx="111" cy="121" rx="75" ry="48" fill="#97a89e"/><ellipse cx="111" cy="108" rx="75" ry="38" fill="#dce4d7"/><path d="M184 110h68v22h-68" fill="#c6a47e"/>',
      'can':'<path d="M82 53h116v115q-58 32-116 0z" fill="#adc4be"/><ellipse cx="140" cy="53" rx="58" ry="20" fill="#e2e7de"/><path d="M85 87h110v54H85z" fill="#d9b581"/><path d="M111 49h33q16 0 11 10h-24" fill="none"/>',
      'pin':'<path d="M84 149L176 49q31-19 40 12 5 15-9 28l-87 92q-47 18-47-21 0-16 15-20l82-87" fill="none" stroke="#7faaa6" stroke-width="12"/><path d="M176 47l34 37-27 22-32-34z" fill="#e5c57e"/>',
      'fin':'<path d="M75 114q59-71 127 0-68 71-127 0l-43-32v64z" fill="#a7c9c3"/><path d="M121 88l17-54 28 54z" fill="#e7b766"/><circle cx="178" cy="106" r="4"/>',
      'pot':'<path d="M69 96h142v65q-71 46-142 0z" fill="#a2bcb3"/><path d="M68 107H43v32h26m143-32h25v32h-25" fill="none"/><path d="M61 91q79-40 158 0z" fill="#d1d9cd"/><path d="M127 68V57h26v11" fill="none"/>',
      'cup':'<path d="M76 77h113v73q-55 46-113 0z" fill="#a6c9bf"/><path d="M190 89q65-9 29 47l-29 4" fill="none"/><ellipse cx="133" cy="77" rx="56" ry="15" fill="#f4e2bc"/>',
      'hot':'<path d="M77 110h119v51q-61 38-119 0z" fill="#d6ab93"/><path d="M105 89q-15-17 0-33m34 33q-15-17 0-33m34 33q-15-17 0-33" fill="none" stroke="#c58377"/><path d="M44 113l-14-10m201 10 14-10" stroke="#e2ae62"/>',
      'hop':'<ellipse cx="146" cy="114" rx="50" ry="38" fill="#d0c5b0"/><ellipse cx="187" cy="81" rx="29" ry="31" fill="#d0c5b0"/><ellipse cx="182" cy="42" rx="8" ry="27" fill="#d0c5b0"/><ellipse cx="204" cy="43" rx="8" ry="27" fill="#d0c5b0"/><circle cx="197" cy="79" r="3"/><path d="M130 141l-33 14m72-19 34 10M48 181q36-49 66-9" fill="none"/><path d="M101 155l14 18-23 2" fill="none"/>',
      'pop':'<circle cx="129" cy="109" r="39" fill="#d4e5eb"/><path d="M168 64l14-23m4 58 37-2m-43 37 26 23m-51-8 5 31M94 65 77 44m6 64-37-5" fill="none" stroke="#e8bb6b"/><path d="M109 92q9-14 22-14" fill="none" stroke="#fffdf6"/>',
      'top':'<path d="M70 91h140l-70 98z" fill="#db9f96"/><ellipse cx="140" cy="91" rx="70" ry="26" fill="#ebc66f"/><path d="M140 38v49m-62 38h124m-106 24h87M39 164q-22-69 19-84m166 64q28-49 1-72" fill="none"/>',
      'stop':'<path d="M99 27h82l57 57v67l-57 40H99l-57-40V84z" fill="#ce8c82"/><text x="140" y="123" stroke="none" text-anchor="middle" fill="#fff9e9" font-family="sans-serif" font-weight="bold" font-size="42">STOP</text>',
      'up':'<path d="M112 185v-92H67l73-65 73 65h-45v92z" fill="#9cbeb1"/>',
      'on':'<path d="M65 127h150v65H65z" fill="#dab78d"/><circle cx="140" cy="88" r="37" fill="#9bbdb4"/><path d="M104 88h72" fill="none"/>',
      'not':'<rect x="88" y="74" width="104" height="80" rx="12" fill="#a8c4ba"/><circle cx="140" cy="109" r="78" fill="none" stroke="#c8857b" stroke-width="12"/><path d="M87 53l106 112" stroke="#c8857b" stroke-width="12"/>',
      'box':'<path d="M55 69l82-33 90 33v109l-87 29-85-29z" fill="#d8b88c"/><path d="M55 69l85 33 87-33m-87 33v105M97 53l87 32v43" fill="none"/>',
      'bed':'<path d="M40 98h200v76H40z" fill="#c4aa87"/><path d="M43 47v145m194-117v117" fill="none" stroke-width="9"/><rect x="50" y="78" width="57" height="32" rx="12" fill="#fff7e3"/><path d="M111 80h123v71H111z" fill="#a4c5ba"/>',
      'hen':'<ellipse cx="135" cy="137" rx="69" ry="47" fill="#f3e5c3"/><circle cx="181" cy="83" r="31" fill="#f3e5c3"/><path d="M168 53q-10-24 6-19 7-24 15-7 22-7 12 27" fill="#c77e75"/><path d="M210 78l24 10-24 12" fill="#e6b55f"/><circle cx="189" cy="79" r="3"/><path d="M75 113l-36-26 12 49m62 44-6 20m50-20 4 20" fill="none"/>',
      'ham':'<ellipse cx="140" cy="174" rx="105" ry="17" fill="#d7e0d4"/><path d="M56 144q22-86 115-79 61 10 55 66-44 54-170 13z" fill="#c98f87"/><ellipse cx="164" cy="124" rx="52" ry="39" fill="#efbfba"/><ellipse cx="174" cy="124" rx="14" ry="11" fill="#fff4de"/>',
      'jam':'<path d="M86 63h108v112q-54 27-108 0z" fill="#c78a96"/><rect x="80" y="48" width="120" height="25" rx="8" fill="#b3c4b4"/><rect x="99" y="95" width="82" height="55" rx="10" fill="#fff5de"/><path d="M124 120q16-28 32 0 0 29-16 22-16 7-16-22" fill="#c87880"/>',
      'eggs':'<ellipse cx="140" cy="183" rx="109" ry="15" fill="#d8e2d7"/><path d="M56 135q0-69 36-87 40 18 40 87 0 58-40 51-36 7-36-51z" fill="#fff4d9"/><path d="M143 135q0-69 36-87 40 18 40 87 0 58-40 51-36 7-36-51z" fill="#e8d5b1"/>',
    }
    if word in ['red','green']: return f'<path d="M67 66q35-41 68-16 66-22 77 23 47 37 8 75-18 53-75 30-70 28-90-22-34-43 12-90z" fill="{"#cf7e7c" if word=="red" else "#7cab85"}"/>'
    return shapes[word]


def main():
    # Word data has one source: words.json. Art recipes are original shapes.
    words=json.loads(DATA.read_text(encoding='utf-8'))['words']
    dest=LAB/'illustrations';dest.mkdir(exist_ok=True)
    for word in words:
        if word['id']=='sun': continue
        (dest/word['illustration']).write_text(svg(f"An original illustration for {word['word']}",art(word['id'])),encoding='utf-8')
    print('Regenerated original artwork for the editable inventory.')

if __name__=='__main__': main()
