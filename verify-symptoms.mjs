import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { JSDOM } from 'jsdom';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
dom.window.HTMLDialogElement.prototype.close = () => {};

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const root = createRoot(document.getElementById('root'));
try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx');
  await act(async () => { root.render(createElement(App)); });

  const symptoms = document.getElementById('symptoms');
  const options = () => symptoms.querySelectorAll('.symptom-option');
  const moreButton = () => symptoms.querySelector('.symptom-more button');
  async function click(button) {
    assert.ok(button, 'Expected button to exist');
    await act(async () => { button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); });
  }
  async function selectGroup(label) {
    await click([...symptoms.querySelectorAll('.guide-filters button')].find(button => button.textContent.startsWith(label)));
  }

  assert.equal(options().length, 6, 'Initially shows six symptoms');
  assert.match(symptoms.querySelector('.symptom-more').textContent, /6 \/ 30개 표시/);
  await click(moreButton());
  assert.equal(options().length, 12, 'Adds six symptoms per click');
  while (options().length < 30) await click(moreButton());
  assert.equal(options().length, 30, 'All symptoms remain accessible');
  assert.match(moreButton().textContent, /처음 6개만 보기/);
  await click(moreButton());
  assert.equal(options().length, 6, 'Can collapse the complete list');

  await selectGroup('속도·저장·복구');
  assert.equal(options().length, 4, 'Short categories show all symptoms');
  assert.equal(moreButton(), null, 'Short categories need no more button');
  await selectGroup('화면·전원·발열');
  assert.equal(options().length, 6, 'Changing category resets the limit');
  assert.match(moreButton().textContent, /증상 3개 더 보기/);
  await click(moreButton());
  assert.equal(options().length, 9, 'Last click shows only remaining symptoms');
  await selectGroup('전체');
  assert.equal(options().length, 6, 'Returning to all resets the limit');
  console.log('PASS: symptom pagination, collapse, category reset, short and partial categories');
} finally {
  await act(async () => { root.unmount(); });
  await server.close();
  dom.window.close();
}
