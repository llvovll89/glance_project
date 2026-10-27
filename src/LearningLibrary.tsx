import { useState } from 'react';
import { TextInput } from '@mantine/core';
import { topics } from './content';
import { questions, quizScore } from './quiz';

export function Dictionary({ onTopic }: { onTopic: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('전체');
  const categories = ['전체', ...new Set(topics.map(topic => topic.category))];
  const results = topics.filter(topic => (category === '전체' || topic.category === category) && `${topic.title} ${topic.summary} ${topic.paragraphs.join(' ')}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <section className="dictionary" aria-labelledby="dictionary-title"><div className="section-heading"><h2 id="dictionary-title">낯선 이름을 쉬운 말로.</h2><p>용어를 펼쳐 설명을 읽고, 확인 방법까지 이어서 알아봐요.</p></div><label className="library-search-label" htmlFor="dictionary-search">용어 찾기</label><TextInput id="dictionary-search" className="library-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="예: RAM, 백업, USB-C"/><div className="library-filters" aria-label="용어 분야">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><p className="library-result-count" role="status">{results.length}개 용어</p><div className="dictionary-list">{results.map(topic => <details key={topic.id}><summary><strong>{topic.title}</strong><span>{topic.category}</span></summary><p>{topic.summary}</p><p>{topic.paragraphs[0]}</p><button className="text-button" type="button" onClick={() => onTopic(topic.id)}>전체 설명과 확인 방법 보기</button></details>)}</div>{!results.length && <div className="library-empty"><h3>일치하는 용어가 없어요.</h3><p>검색어를 짧게 바꾸거나 다른 분야를 골라 보세요.</p><button className="button button-secondary" type="button" onClick={() => { setQuery(''); setCategory('전체'); }}>전체 용어 보기</button></div>}</section>;
}
export function KnowledgeQuiz({ onTopic }: { onTopic: (id: string) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const question = questions[index];
  const chosen = answers[question.id];
  const answered = chosen !== undefined;
  const score = quizScore(answers);
  function restart() { setIndex(0); setAnswers({}); setFinished(false); }
  if (finished) return <section className="knowledge-quiz" aria-labelledby="quiz-title"><h2 id="quiz-title">직접 풀어본 컴퓨터 기초</h2><p className="quiz-score">{questions.length}문제 중 {score.correct}개 정답</p><p>점수보다 헷갈린 개념을 다시 알아보는 것이 중요해요. 결과는 현재 화면에서만 유지돼요.</p><div className="quiz-review">{questions.filter(item => answers[item.id] !== item.answer).map(item => <button type="button" key={item.id} onClick={() => onTopic(item.topicId)}>{topics.find(topic => topic.id === item.topicId)?.title} 다시 알아보기</button>)}</div>{score.correct === questions.length && <p className="quiz-feedback">모든 문제를 맞혔어요. 실제 문제를 만났을 때도 확인한 사실부터 차근차근 살펴봐요.</p>}<button type="button" className="button button-primary" onClick={restart}>처음부터 다시 풀기</button></section>;
  return <section className="knowledge-quiz" aria-labelledby="quiz-title"><div className="section-heading"><h2 id="quiz-title">얼마나 이해했는지 확인해요.</h2><p>답을 고르면 이유를 바로 볼 수 있어요. 정답을 외우기보다 개념을 연결해 보세요.</p></div><div className="quiz-meta"><span>{index + 1} / {questions.length}번째 문제</span><span>{score.correct}개 정답</span></div><div className="quiz-question"><h3>{question.question}</h3><div className="quiz-choices">{question.choices.map((choice, choiceIndex) => <button key={choice} type="button" disabled={answered} className={answered && choiceIndex === question.answer ? 'is-correct' : answered && choiceIndex === chosen ? 'is-chosen' : ''} aria-pressed={chosen === choiceIndex} onClick={() => setAnswers(previous => ({ ...previous, [question.id]: choiceIndex }))}><span>{choiceIndex + 1}</span><strong>{choice}</strong>{answered && choiceIndex === question.answer && <small>정답</small>}</button>)}</div>{answered && <div className="quiz-feedback" role="status"><strong>{chosen === question.answer ? '맞았어요.' : '이렇게 생각해 보세요.'}</strong><p>{question.explanation}</p><button type="button" className="text-button" onClick={() => onTopic(question.topicId)}>관련 개념 자세히 보기</button></div>}<div className="quiz-actions"><button type="button" className="text-button" onClick={restart}>다시 시작</button><button type="button" className="button button-primary" disabled={!answered} onClick={() => { if (index === questions.length - 1) setFinished(true); else setIndex(value => value + 1); }}>{index === questions.length - 1 ? '결과 보기' : '다음 문제'}</button></div></div></section>;
}
