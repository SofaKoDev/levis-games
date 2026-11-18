import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {JSDOM} from 'jsdom';

const originals = process.argv.includes('--originals');
const page = new URL(originals ? './preview-originals.html' : './preview.html', import.meta.url);
const outputDir = originals ? 'output-originals' : 'output';
const dom = await JSDOM.fromFile(fileURLToPath(page), {
  url: page.href,
  resources: 'usable',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
});

try {
  await new Promise((resolve, reject) => {
    dom.window.addEventListener('load', resolve, {once: true});
    dom.window.addEventListener('error', event => reject(event.error), {once: true});
  });
  const {document, Event} = dom.window;
  const cards = [...document.querySelectorAll('article')];
  assert.equal(cards.length, 7, 'all seven monster cards should render');
  for (const card of cards) {
    const image = card.querySelector('img');
    const select = card.querySelector('select');
    assert.equal(select.options.length, 5, 'each card should offer five actions');
    assert.equal(image.dataset.action, 'idle');
    assert.ok(existsSync(fileURLToPath(image.src)), `missing ${image.src}`);
    for (const action of ['feed', 'clean', 'play', 'sleep']) {
      select.value = action;
      select.dispatchEvent(new Event('change', {bubbles: true}));
      assert.equal(image.dataset.action, action);
      assert.match(card.querySelector('.count').textContent, /4 visible frames/);
      assert.ok(existsSync(fileURLToPath(image.src)), `missing ${image.src}`);
    }
  }
  for (const monster of dom.window.RAINBOW_ASSETS.monsters) {
    for (const sequence of Object.values(monster.sequences)) {
      for (const frame of sequence.frames) {
        assert.ok(existsSync(fileURLToPath(new URL(`./${outputDir}/${frame.path}`, page))), `missing ${frame.path}`);
      }
    }
  }
  console.log('Asset review renders 7 cards and 5 actions each; all 140 frame paths exist.');
} finally {
  dom.window.close();
}
