import { expect, test } from '@playwright/test';

test('학습에서 비교표를 읽고 관련 개념으로 이동한 뒤 주소로 복원한다', async ({ page }) => {
  await page.goto('/?view=learn');
  await page.getByRole('button', { name: /60Hz vs 75Hz vs 144Hz/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('table', { name: '주사율별 갱신 횟수와 간격' })).toBeVisible();
  await expect(dialog.getByRole('row', { name: '144Hz 144번 약 6.94ms' })).toBeVisible();
  await expect(dialog.getByRole('link', { name: /Microsoft/ })).toHaveAttribute('href', /^https:\/\/support.microsoft.com\//);
  await dialog.getByRole('button', { name: 'FPS와 Hz, 응답 속도는 달라요' }).click();
  await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('FPS와 Hz, 응답 속도는 달라요');
  await expect(page).toHaveURL(/topic=fps-hz/);
  await page.reload();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/티어링/)).toBeVisible();
  await page.goBack();
  await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('60Hz vs 75Hz vs 144Hz');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('검색과 용어 사전에서 VRAM 및 구형 모니터 조합을 찾는다', async ({ page }) => {
  await page.goto('/?view=learn');
  await page.getByRole('searchbox', { name: '무엇이 궁금한가요?' }).fill('5060');
  await page.getByRole('button', { name: /새 그래픽카드와 구형 모니터 조합/ }).click();
  await expect(page.getByRole('table', { name: 'RTX 5060 Ti 8GB 조합에서 확인할 상황 예시' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'VRAM과 그래픽카드의 8GB' }).click();
  await expect(page.getByRole('dialog').getByText(/GTX 5060 Ti가 아니라 RTX 5060 Ti/)).toBeVisible();
  await page.goto('/?view=learn&mode=dictionary');
  await page.getByRole('button', { name: '모니터와 화면', exact: true }).click();
  await expect(page.locator('.dictionary-list details')).toHaveCount(4);
  await page.getByRole('button', { name: '전체', exact: true }).click();
  await page.getByRole('searchbox', { name: '용어 찾기' }).fill('VRAM');
  const entry = page.locator('.dictionary-list details').filter({ has: page.locator('summary strong', { hasText: 'VRAM과 그래픽카드의 8GB' }) });
  await entry.locator('summary').click();
  await entry.getByRole('button', { name: '전체 설명과 확인 방법 보기' }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { level: 2 })).toHaveText('VRAM과 그래픽카드의 8GB');
});

test('새 비교표는 좁은 화면과 두 테마에서 가로로 넘치지 않는다', async ({ page }, testInfo) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.setViewportSize({ width: 320, height: 740 });
    for (const id of ['refresh-rate', 'display-resolution', 'display-panels', 'gpu-monitor-match']) {
      await page.goto(`/?view=learn&topic=${id}`);
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('table')).toBeVisible();
      expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await dialog.getByRole('table').screenshot({ path: testInfo.outputPath(`${id}-${colorScheme}.png`) });
    }
  }
});
