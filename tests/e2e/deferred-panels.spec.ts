import { expect, test } from '@playwright/test';

test('첫 화면에서는 PC·연습·사전 모듈을 요청하지 않고 메뉴에서 불러온다', async ({ page }) => {
  const requested = new Set<string>();
  page.on('request', request => requested.add(new URL(request.url()).pathname));
  await page.goto('/');
  await expect(page.locator('#symptoms')).toBeVisible();
  for (const file of ['PcProfile.tsx', 'ShellLab.tsx', 'LearningLibrary.tsx', 'KnowledgeExplorer.tsx', 'TopicArticle.tsx']) {
    expect([...requested].some(path => path.endsWith(`/${file}`))).toBe(false);
  }
  await page.getByRole('navigation').getByRole('link', { name: '내 PC 알아보기', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'PC 이름 또는 모델', exact: true })).toBeVisible();
  expect([...requested].some(path => path.endsWith('/PcProfile.tsx'))).toBe(true);
  await page.getByRole('navigation').getByRole('link', { name: '컴퓨터 이해하기', exact: true }).click();
  await expect(page.getByRole('button', { name: /60Hz vs 75Hz vs 144Hz/ })).toBeVisible();
  expect([...requested].some(path => path.endsWith('/KnowledgeExplorer.tsx'))).toBe(true);
  expect([...requested].some(path => path.endsWith('/TopicArticle.tsx'))).toBe(false);
  await page.getByRole('button', { name: /60Hz vs 75Hz vs 144Hz/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect([...requested].some(path => path.endsWith('/TopicArticle.tsx'))).toBe(true);
});

test('메뉴 로딩이 실패하면 재시도 안내를 표시하고 같은 주소로 다시 불러온다', async ({ page }) => {
  await page.route('**/src/PcProfile.tsx', route => route.abort());
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: '내 PC 알아보기', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('화면을 불러오지 못했어요.');
  await page.unroute('**/src/PcProfile.tsx');
  await page.getByRole('button', { name: '다시 불러오기', exact: true }).click();
  await expect(page).toHaveURL(/\?view=pc$/);
  await expect(page.getByRole('textbox', { name: 'PC 이름 또는 모델', exact: true })).toBeVisible();
});
