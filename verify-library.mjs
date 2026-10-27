import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { questions, quizScore } = await server.ssrLoadModule('/src/quiz.ts');
  const { topics, guides } = await server.ssrLoadModule('/src/content.ts');
  const { Dictionary, KnowledgeQuiz } = await server.ssrLoadModule('/src/LearningLibrary.tsx');
  assert.equal(new Set(questions.map(question => question.id)).size, questions.length);
  for (const question of questions) {
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.choices.length);
    assert.equal(new Set(question.choices).size, question.choices.length);
    assert.ok(topics.some(topic => topic.id === question.topicId), `Quiz topic ${question.topicId}`);
    assert.ok(question.explanation.trim());
  }
  assert.deepEqual(quizScore({}), { answered: 0, correct: 0 });
  assert.deepEqual(quizScore(Object.fromEntries(questions.map(question => [question.id, question.answer]))), { answered: questions.length, correct: questions.length });
  assert.deepEqual(quizScore(Object.fromEntries(questions.map(question => [question.id, (question.answer + 1) % question.choices.length]))), { answered: questions.length, correct: 0 });
  assert.deepEqual(quizScore({ [questions[0].id]: -1, [questions[1].id]: 100, [questions[2].id]: NaN, [questions[3].id]: 1.5, unknown: 0 }), { answered: 0, correct: 0 });
  const html = renderToString(createElement(Dictionary, { onTopic() {} }));
  assert.equal((html.match(/<details/g) ?? []).length, topics.length);
  assert.ok(html.includes('dictionary-search'));
  assert.ok(renderToString(createElement(KnowledgeQuiz, { onTopic() {} })).includes(questions[0].question));
  const categorized = ['display', 'beep', 'power', 'stop-error', 'heat', 'slow', 'disk-space', 'network', 'audio', 'usb-device', 'bluetooth-connect', 'camera'];
  assert.deepEqual([...guides.map(guide => guide.id)].sort(), [...categorized].sort(), 'Guide categories cover the full collection');
  console.log(`PASS: ${questions.length} quiz questions, correct/incorrect/invalid scoring, topic references, dictionary entries and complete guide categorization`);
} finally { await server.close(); }
