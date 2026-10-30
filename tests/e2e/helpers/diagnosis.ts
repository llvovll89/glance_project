import type { Page } from '@playwright/test';

export async function finishDiagnosis(page: Page, status: 'resolved' | 'unresolved') {
  const finish = page.locator('.diagnosis-finish');
  if (!await finish.evaluate(element => (element as HTMLDetailsElement).open)) {
    await finish.locator('summary').click();
  }
  await finish.getByRole('button', { name: status === 'resolved' ? '해결됐어요' : '미해결로 기록', exact: true }).click();
}
