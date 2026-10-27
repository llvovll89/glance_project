import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const lab = await server.ssrLoadModule('/src/shell-lab.ts');
  for (const shell of ['powershell', 'cmd', 'bash']) {
    let state = lab.createLabState(shell);
    for (const lesson of lab.lessons) {
      const before = structuredClone(state);
      const result = lab.runLabCommand(state, lab.lessonCommand(state, lesson.id));
      assert.deepEqual(state, before, 'Commands do not mutate their input state');
      assert.equal(result.ok, true, `${shell}: ${lesson.id}: ${result.output}`);
      assert.ok(result.state.completed.includes(lesson.id), `${shell}: ${lesson.id} completes after its actual action`);
      state = result.state;
    }
    assert.deepEqual(state.cwd, []);
    assert.equal(state.completed.length, lab.lessons.length);
    const clear = lab.runLabCommand(state, lab.commands[shell].clear);
    assert.equal(clear.clear, true); assert.deepEqual(clear.state, state);
    const repeated = lab.runLabCommand(state, lab.commands[shell].where);
    assert.equal(repeated.state.completed.length, lab.lessons.length, 'No duplicate mission completion');
    for (const command of ['rm -rf /', 'del notes.txt', 'Remove-Item notes.txt', 'node app.js', 'pwd; ls', 'dir > result.txt', 'cd "Documents', 'cd missing', 'cd ..', 'cat ' + 'X'.repeat(250)]) {
      const result = lab.runLabCommand(state, command);
      assert.equal(result.ok, false, `${shell}: unsupported command ${command}`);
      assert.deepEqual(result.state, state, 'Rejected commands preserve path and progress');
    }
  }
  const bash = lab.createLabState('bash');
  assert.equal(lab.runLabCommand(bash, 'cd documents').ok, false, 'Bash path case matters');
  assert.equal(lab.runLabCommand(bash, 'PWD').ok, false, 'Bash command case matters');
  assert.equal(lab.runLabCommand(lab.createLabState('cmd'), 'CD documents').state.cwd[0], 'Documents');
  assert.equal(lab.runLabCommand(lab.createLabState('powershell'), 'get-location').ok, true);
  const documents = lab.runLabCommand(bash, 'cd Documents').state;
  assert.equal(lab.runLabCommand(documents, 'cd notes.txt').ok, false);
  assert.equal(lab.runLabCommand(documents, 'cat "Computer Guide"').ok, false);
  assert.equal(lab.runLabCommand(documents, 'cat notes.txt/../notes.txt').ok, false);
  const spaced = lab.runLabCommand(documents, 'cd "Computer Guide"');
  assert.equal(spaced.ok, true); assert.equal(lab.runLabCommand(spaced.state, 'cat welcome.txt').ok, true);
  assert.equal(lab.runLabCommand(spaced.state, 'cd ../../Downloads').state.cwd[0], 'Downloads');
  assert.equal(lab.runLabCommand(documents, 'cd Computer Guide').ok, false, 'Unquoted multiple arguments are outside supported subset');
  const direct = lab.runLabCommand(lab.createLabState('cmd'), 'type "C:\\Users\\Learner\\Documents\\notes.txt"');
  assert.equal(direct.ok, true); assert.match(direct.output, /RAM/);
  const { default: Lab } = await server.ssrLoadModule('/src/ShellLab.tsx');
  const html = renderToString(createElement(MantineProvider, null, createElement(Lab, { onTopic() {} })));
  assert.ok(html.includes('id="lab-command"')); assert.ok(html.includes('role="log"')); assert.ok(html.includes('실제 PC 파일'));
  assert.equal((html.match(/class="lab-mission-index/g) ?? []).length, lab.lessons.length);
  console.log('PASS: all 21 missions across 3 shells, quoted/absolute/relative paths, case handling, immutable state, reset behavior, unsupported commands, out-of-home paths and initial render');
} finally { await server.close(); }
