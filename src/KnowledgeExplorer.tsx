import { useState } from 'react';
import { topics, type Topic } from './content';
import { Icon, topicIcon } from './Icon';

function HardwareExplorer({ openTopic }: { openTopic: (id: string) => void }) {
  const [selected, setSelected] = useState('cpu');
  const current = topics.find(t => t.id === selected)!;
  return <section className="explorer" aria-labelledby="explorer-title"><div className="section-heading"><h2 id="explorer-title">부품을 누르면, 역할이 보여요.</h2><p>이름보다 하는 일부터 알아볼까요?</p></div><div className="explorer-workspace"><div className="parts-board" role="group" aria-label="알아볼 부품 선택">{topics.filter(t => t.category === '부품').map(t => <button key={t.id} className={`part part-${t.id} ${selected === t.id ? 'is-selected' : ''}`} aria-pressed={selected === t.id} onClick={() => setSelected(t.id)}><Icon name={topicIcon(t)} /><strong>{t.title}</strong><span>{t.shortLabel ?? ({ cpu: '명령 처리', ram: '작업 공간', ssd: '파일 보관', gpu: '화면과 그래픽' } as Record<string, string>)[t.id]}</span><Icon name="CaretRight" className="part-arrow" /></button>)}<p>역할을 살펴보는 개념도예요. 실제 배치와 크기는 기기에 따라 달라요.</p></div><article className="part-description" key={selected}><span className="part-category">부품 알아보기</span><h3>{current.title}</h3><p className="part-summary">{current.summary}</p><p>{current.paragraphs[0]}</p><button className="button button-primary" onClick={() => openTopic(selected)}>설명과 실습 보기<Icon name="ArrowRight" /></button></article></div></section>;
}
function ConceptSection({ title, description, id, items, openTopic }: { title: string; description: string; id: string; items: Topic[]; openTopic: (id: string) => void }) {
  return <section className="concepts" aria-labelledby={id}><div className="section-heading"><h2 id={id}>{title}</h2><p>{description}</p></div><div className="concept-grid">{items.map(topic => <button className="concept-item" key={topic.id} onClick={() => openTopic(topic.id)}><Icon name={topicIcon(topic)}/><div><h3>{topic.title}</h3><p>{topic.summary}</p><span>설명과 실습 보기<Icon name="ArrowRight"/></span></div></button>)}</div></section>;
}
export default function KnowledgeExplorer({ openTopic }: { openTopic: (id: string) => void }) {
  return <><ConceptSection title="모니터 숫자와 이름, 무엇이 다를까요?" description="60Hz·75Hz·144Hz, FHD·4K, OLED·QLED를 서로 다른 기준으로 이해해요." id="display-knowledge-title" items={topics.filter(t => t.category === '모니터와 화면')} openTopic={openTopic}/><ConceptSection title="그래픽카드와 모니터를 함께 봐요" description="VRAM 8GB의 역할부터 새 그래픽카드와 구형 모니터 조합까지 알아봐요." id="gpu-knowledge-title" items={topics.filter(t => t.category === '그래픽카드와 조합')} openTopic={openTopic}/><HardwareExplorer openTopic={openTopic}/><ConceptSection title="부품 다음은, 기본 개념." description="운영체제와 명령어 창의 역할을 알아봐요." id="concept-title" items={topics.filter(t => ['os', 'shell'].includes(t.id))} openTopic={openTopic}/><ConceptSection title="Windows에서 직접 해보기" description="설정과 도구를 이해하면 일상적인 문제도 덜 낯설어요." id="windows-title" items={topics.filter(t => t.category === 'Windows 기초')} openTopic={openTopic}/></>;
}
