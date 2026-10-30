import { guides, topics } from './content';

export type View = 'help' | 'learn' | 'pc' | 'lab';
export type LearnMode = 'explore' | 'dictionary' | 'quiz';
export type AppRoute = { view: View; guideId?: string; learnMode: LearnMode; topicId?: string; query: string };

export function readAppRoute(search = typeof window === 'undefined' ? '' : window.location.search): AppRoute {
  const params = new URLSearchParams(search);
  const view = params.get('view');
  const mode = params.get('mode');
  const guideId = params.get('guide');
  const topicId = params.get('topic');
  return {
    view: view === 'learn' || view === 'pc' || view === 'lab' ? view : 'help',
    guideId: guides.find(guide => guide.id === guideId)?.id,
    learnMode: mode === 'dictionary' || mode === 'quiz' ? mode : 'explore',
    topicId: topics.find(topic => topic.id === topicId)?.id,
    query: (params.get('q') ?? '').slice(0, 200),
  };
}

// Query URLs also open directly on static hosts without a rewrite rule.
export function appHref(route: AppRoute, pathname = typeof window === 'undefined' ? '/' : window.location.pathname): string {
  const params = new URLSearchParams();
  if (route.view !== 'help') params.set('view', route.view);
  if (route.view === 'help' && route.guideId) params.set('guide', route.guideId);
  if (route.view === 'learn' && route.learnMode !== 'explore') params.set('mode', route.learnMode);
  if (route.topicId) params.set('topic', route.topicId);
  if (route.query) params.set('q', route.query.slice(0, 200));
  const search = params.toString();
  return pathname + (search ? `?${search}` : '');
}
