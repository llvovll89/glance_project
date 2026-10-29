import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { guides, topics } = await server.ssrLoadModule('/src/content.ts');
  const { Diagnosis } = await server.ssrLoadModule('/src/App.tsx');
  const { screenGuides, screenGuideTargets, findScreenGuide } = await server.ssrLoadModule('/src/settings-visuals.ts');
  const { default: SettingsVisual } = await server.ssrLoadModule('/src/SettingsVisual.tsx');
  assert.equal(new Set(screenGuideTargets.map(target => `${target.guideId}:${target.step}`)).size, screenGuideTargets.length);
  for (const target of screenGuideTargets) {
    assert.ok(guides.find(guide => guide.id === target.guideId)?.steps[target.step], 'Screen guide must refer to an existing check');
    const screen = findScreenGuide(target.guideId, target.step);
    assert.equal(screen, screenGuides[target.screen]);
    const html = renderToString(createElement(SettingsVisual, target));
    assert.ok(html.includes(screen.title) && html.includes('role="img"'));
    assert.ok(html.includes('aria-haspopup="dialog"'));
  }
  assert.equal(findScreenGuide('missing', 0), undefined);
  assert.equal(renderToString(createElement(SettingsVisual, { guideId: 'display', step: 0 })), '');
  for (const [id, screen] of Object.entries(screenGuides)) {
    assert.equal(screen.id, id);
    assert.ok(screen.path.length >= 2 && screen.open.trim() && screen.note.trim() && screen.reviewed);
    assert.ok(screen.points.length >= 2 && screen.points.every(point => point.title.trim() && point.description.trim()));
    assert.equal(new URL(screen.source).hostname, 'support.microsoft.com');
    assert.equal(new URL(screen.source).protocol, 'https:');
  }
  assert.equal(new Set(guides.map(g => g.id)).size, guides.length, 'Unique guide IDs');
  assert.equal(new Set(topics.map(t => t.id)).size, topics.length, 'Unique topic IDs');
  for (const guide of guides) {
    const html = renderToString(createElement(Diagnosis, { guide, onTopic() {}, onGuide() {} }));
    assert.ok(html.includes(guide.title));
    for (const match of html.matchAll(/\/icons\/([A-Za-z]+)\.svg/g)) assert.ok(existsSync(`public/icons/${match[1]}.svg`), `Missing icon ${match[1]}`);
    assert.equal(new URL(guide.source).protocol, 'https:');
    for (const variant of guide.variants ?? []) {
      const target = variant.guideId ? guides.find(g => g.id === variant.guideId) : guide;
      assert.ok(target?.steps[variant.step], `${guide.id}/${variant.id}: route must reach an existing step`);
    }
    for (const step of guide.steps) {
      if (step.choices) {
        assert.ok(step.question?.trim() && step.choices.length >= 2, `${guide.id}: result question and choices`);
        assert.equal(new Set(step.choices.map(choice => choice.id)).size, step.choices.length);
        for (const choice of step.choices) {
          assert.ok(choice.id.trim() && choice.label.trim());
          assert.ok(choice.target === 'resolved' || (Number.isInteger(choice.target) && choice.target > guide.steps.indexOf(step) && guide.steps[choice.target]), `${guide.id}/${choice.id}: forward branch destination`);
        }
      }
      for (const topic of step.relatedTopics ?? guide.relatedTopics ?? []) assert.ok(topics.some(t => t.id === topic), `${guide.id}: unresolved topic ${topic}`);
      if (step.visual) assert.ok(existsSync(`public/icons/${step.visual.icon}.svg`));
    }
  }
  for (const topic of topics) {
    assert.ok(topic.paragraphs.length >= 2 && topic.exercise.trim(), `${topic.id}: explanation and exercise`);
    if (topic.icon) assert.ok(existsSync(`public/icons/${topic.icon}.svg`));
  }
  const power = guides.find(g => g.id === 'power');
  assert.equal(power.variants.find(v => v.id === 'fans-on').guideId, 'display');
  assert.equal(power.variants.find(v => v.id === 'shuts-down').step, 2);
  console.log(`PASS: ${guides.length} guides, ${topics.length} topics, all branch destinations, topic links, step visuals and guide renders`);
} finally { await server.close(); }
