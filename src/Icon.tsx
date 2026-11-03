import type { CSSProperties } from 'react';
import type { Topic, IconName } from './content';

const topicIcons: Record<string, IconName> = { cpu: 'Cpu', ram: 'Memory', ssd: 'HardDrives', gpu: 'GraphicsCard', os: 'Desktop', shell: 'TerminalWindow' };
export function topicIcon(topic: Topic): IconName { return topic.icon ?? topicIcons[topic.id] ?? 'BookOpen'; }
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <span aria-hidden="true" className={`icon ${className}`} style={{ '--icon': `url("/icons/${name}.svg")` } as CSSProperties} />;
}
