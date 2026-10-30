import { Component, Suspense, type ReactNode } from 'react';

export default class AsyncPanel extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <section className="panel-message" role="alert"><h2>화면을 불러오지 못했어요.</h2><p>연결 상태를 확인한 뒤 다시 불러와 주세요.</p><button type="button" className="button button-secondary" onClick={() => window.location.reload()}>다시 불러오기</button></section>;
    return <Suspense fallback={<div className="panel-message" role="status">화면을 불러오고 있어요.</div>}>{this.props.children}</Suspense>;
  }
}
