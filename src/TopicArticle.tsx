import { useEffect, useRef, useState } from 'react';
import { topics, type Topic } from './content';
import { appHref, readAppRoute } from './app-route';
import { Icon, topicIcon } from './Icon';

export default function Article({ topic, close, onTopic }: { topic: Topic | undefined; close: () => void; onTopic: (id: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [shareStatus, setShareStatus] = useState('');
  useEffect(() => {
    setShareStatus('');
    if (topic && ref.current) {
      ref.current.scrollTop = 0;
      ref.current.querySelector<HTMLButtonElement>('.article-toolbar button')?.focus({ preventScroll: true });
    }
  }, [topic?.id]);
  async function copyLink() {
    if (!topic) return;
    const url = new URL(appHref({ ...readAppRoute(), topicId: topic.id, query: '' }), window.location.href);
    try { await navigator.clipboard.writeText(url.href); setShareStatus('설명 링크를 복사했어요.'); }
    catch { setShareStatus('복사할 수 없어요. 주소창의 링크를 직접 복사해 주세요.'); }
  }
  useEffect(() => {
    if (topic && !ref.current?.open) ref.current?.showModal();
    else if (!topic) ref.current?.close();
    if (!topic) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [topic]);
  return <dialog ref={ref} onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }} aria-labelledby="article-title" className="article-dialog">
    {topic && <article className="article-content">
      <div className="article-toolbar"><span>{topic.category}</span><button className="icon-button" aria-label="설명 닫기" onClick={close}><Icon name="X" /></button></div>
      <div className="article-symbol"><Icon name={topicIcon(topic)} /></div>
      <h2 id="article-title">{topic.title}</h2><p className="article-lead">{topic.summary}</p>
      <div className="article-body">{topic.paragraphs.map(p => <p key={p}>{p}</p>)}</div>
      {topic.comparison && <div className="article-comparison"><table><caption>{topic.comparison.caption}</caption><thead><tr>{topic.comparison.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{topic.comparison.rows.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>}
      <aside className="practice"><div className="practice-heading"><Icon name="Desktop" /><h3>내 컴퓨터에서 확인하기</h3></div><p>{topic.exercise}</p><small>Windows 11 기준. 버전이나 기기에 따라 메뉴가 다를 수 있어요.</small></aside>
      {topic.relatedTopics && <section className="article-related" aria-label="함께 읽을 개념"><h3>함께 읽으면 이해가 쉬워요</h3><div>{topic.relatedTopics.map(id => { const related = topics.find(item => item.id === id); return related ? <button type="button" className="text-button" key={id} onClick={() => onTopic(id)}>{related.title}<Icon name="ArrowRight" /></button> : null; })}</div></section>}
      {topic.sources && <section className="article-sources" aria-label="공식 참고 자료"><h3>공식 자료에서 더 알아보기</h3><ul>{topic.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.name}<Icon name="ArrowSquareOut" /></a></li>)}</ul><p>자료 확인: 2026.11.03. 정확한 지원 범위는 제품별 설명서를 확인해요.</p></section>}
      <div className="article-actions"><button className="button button-secondary article-close" onClick={close}>확인했어요<Icon name="Check" /></button><button className="text-button" onClick={copyLink}><Icon name="Copy" />설명 링크 복사</button></div>{shareStatus && <p role="status" className="copy-status">{shareStatus}</p>}
    </article>}
  </dialog>;
}
