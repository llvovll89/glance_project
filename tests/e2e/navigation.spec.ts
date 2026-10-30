import { expect, test } from '@playwright/test';

test('공유한 가이드는 바로 열리고 새로고침하면 이 브라우저의 진행 상태를 복원한다', async ({ page, browser }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (value: string) => { (window as unknown as { copiedLink: string }).copiedLink = value; } } });
  });
  await page.goto('/?guide=network');
  await expect(page.locator('#guide-title')).toHaveText('인터넷에 연결되지 않아요');
  await page.getByRole('button', { name: '다른 기기는 되고 이 PC만 안 돼요' }).click();
  await page.reload();
  await expect(page.getByText('2번째 확인', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '가이드 링크 복사', exact: true }).click();
  const link = await page.evaluate(() => (window as unknown as { copiedLink: string }).copiedLink);
  expect(new URL(link).search).toBe('?guide=network');
  const freshPage = await browser.newPage();
  try {
    await freshPage.goto(link);
    await expect(freshPage.locator('#guide-title')).toHaveText('인터넷에 연결되지 않아요');
    await expect(freshPage.getByText('1번째 확인', { exact: true })).toBeVisible();
  } finally { await freshPage.close(); }
});

test('메뉴와 학습 방식은 URL·새로고침·뒤로가기·앞으로가기에 맞춰 복원된다', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: '주요 메뉴' });
  await expect(nav.getByRole('link', { name: '명령어 연습', exact: true })).toHaveAttribute('href', '/?view=lab');
  await nav.getByRole('link', { name: '컴퓨터 이해하기', exact: true }).click();
  await expect(page).toHaveURL(/\?view=learn$/);
  await page.getByRole('button', { name: '용어 사전', exact: true }).click();
  await expect(page).toHaveURL(/view=learn&mode=dictionary$/);
  await page.reload();
  await expect(page.getByRole('button', { name: '용어 사전', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveTitle('용어 사전 | 한눈');
  await nav.getByRole('link', { name: '내 PC 알아보기', exact: true }).click();
  await expect(page).toHaveURL(/\?view=pc$/);
  await page.goBack();
  await expect(page.getByRole('button', { name: '용어 사전', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.goBack();
  await expect(page.getByRole('button', { name: '부품과 기초', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.goForward();
  await expect(page.getByRole('button', { name: '용어 사전', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '이해도 퀴즈', exact: true }).click();
  await page.reload();
  await expect(page).toHaveURL(/view=learn&mode=quiz$/);
  await expect(page.getByRole('button', { name: '이해도 퀴즈', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('설명 링크를 공유하고 뒤로가기와 닫기로 원래 화면에 돌아간다', async ({ page }) => {
  await page.goto('/?view=learn');
  await page.locator('.part-description').getByRole('button', { name: '설명과 실습 보기' }).click();
  await expect(page).toHaveURL(/view=learn&topic=cpu$/);
  const dialog = page.getByRole('dialog', { name: 'CPU', exact: true });
  await expect(dialog).toBeVisible();
  await page.goBack();
  await expect(dialog).not.toBeVisible();
  await page.goForward();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '설명 닫기', exact: true }).click();
  await expect(page).toHaveURL(/\?view=learn$/);
  await expect(dialog).not.toBeVisible();
  await page.goto('/?view=learn&topic=ram');
  const direct = page.getByRole('dialog', { name: 'RAM', exact: true });
  await expect(direct).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(direct).not.toBeVisible();
  await expect(page).toHaveURL(/\?view=learn$/);
  await expect(page.getByRole('button', { name: '부품과 기초', exact: true })).toBeVisible();
});

test('검색 결과를 새로고침하고 가이드에서 뒤로 돌아와도 검색어를 유지한다', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: '무엇이 궁금한가요?' });
  await search.fill('와이파이');
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('와이파이');
  await page.reload();
  await expect(search).toHaveValue('와이파이');
  await page.locator('.result-row').filter({ hasText: '인터넷에 연결되지 않아요' }).click();
  await expect(page).toHaveURL(/\?guide=network$/);
  await page.goBack();
  await expect(search).toHaveValue('와이파이');
  await expect(page.getByRole('heading', { name: '검색 결과', exact: true })).toBeVisible();
});

test('가이드에서 설명을 열고 닫아도 점검 단계와 선택 결과를 유지한다', async ({ page }) => {
  await page.goto('/?guide=network');
  await page.getByRole('button', { name: '다른 기기는 되고 이 PC만 안 돼요' }).click();
  const before = await page.evaluate(() => localStorage.getItem('hanno-guide-progress-v1'));
  await page.locator('.guide-tools').getByRole('button', { name: 'Wi-Fi와 인터넷', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByText('2번째 확인', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('hanno-guide-progress-v1'))).toBe(before);
});

test('알 수 없는 주소 값은 기본 가이드로 안전하게 열고 메뉴 링크는 새 탭에서도 동작한다', async ({ page, context }) => {
  await page.goto('/?view=missing&guide=missing&mode=missing&topic=missing');
  await expect(page.locator('#guide-title')).toHaveText('본체는 켜지는데 화면이 안 나와요');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  const nav = page.getByRole('navigation', { name: '주요 메뉴' });
  const popupPromise = context.waitForEvent('page');
  await nav.getByRole('link', { name: '명령어 연습', exact: true }).click({ modifiers: ['ControlOrMeta'] });
  const popup = await popupPromise;
  try {
    await expect(popup.locator('#page-title')).toHaveText('명령어 연습');
    await expect(popup.getByRole('textbox', { name: '연습할 명령어', exact: true })).toBeVisible();
  } finally { await popup.close(); }
});

test('홈으로 이동할 때 다른 가이드의 단계를 섞지 않고 뒤로가면 이전 점검을 복원한다', async ({ page }) => {
  await page.goto('/?guide=network');
  await page.getByRole('button', { name: '다른 기기도 여러 사이트가 안 열려요' }).click();
  await expect(page.getByText('4번째 확인', { exact: true })).toBeVisible();
  await page.locator('.brand').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#guide-title')).toHaveText('본체는 켜지는데 화면이 안 나와요');
  await expect(page.getByText('1번째 확인', { exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.locator('#guide-title')).toHaveText('인터넷에 연결되지 않아요');
  await expect(page.getByText('4번째 확인', { exact: true })).toBeVisible();
  await expect(page.locator('.checklist button.is-reviewed')).toHaveCount(1);
});
