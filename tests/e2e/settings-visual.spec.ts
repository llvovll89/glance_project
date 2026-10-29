import { expect, test, type Page } from '@playwright/test';

async function openGuide(page: Page, title: string) {
  await page.goto('/');
  await page.getByRole('searchbox', { name: '무엇이 궁금한가요?' }).fill(title);
  await page.locator('.result-row').filter({ hasText: title }).click();
}

test('네트워크 안내를 확대하고 닫아도 점검 위치와 답변을 유지한다', async ({ page }) => {
  await openGuide(page, '인터넷에 연결되지 않아요');
  await page.getByRole('button', { name: '다른 기기는 되고 이 PC만 안 돼요' }).click();
  const guide = page.getByRole('region', { name: '네트워크 연결 상태 찾기' });
  await expect(guide.getByRole('img')).toBeVisible();
  await expect(guide).toContainText('상태·장치 이름·수치는 예시');
  const before = await page.evaluate(() => localStorage.getItem('hanno-guide-progress-v1'));
  const opener = guide.getByRole('button', { name: '네트워크 연결 상태 찾기 크게 보기' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: '네트워크 연결 상태 찾기' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: '닫기', exact: true })).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  expect(await page.evaluate(() => localStorage.getItem('hanno-guide-progress-v1'))).toBe(before);
  await opener.click();
  await dialog.getByRole('button', { name: '닫기', exact: true }).click();
  await expect(opener).toBeFocused();
  await expect(page.getByText('2번째 확인', { exact: true })).toBeVisible();
  await guide.screenshot({ path: `test-results/settings-network-${test.info().project.name}.png`, style: '.skip-link:not(:focus) { visibility: hidden; }' });
});

test('소리 점검의 단계에 맞춰 출력 장치와 앱별 볼륨 그림을 표시한다', async ({ page }) => {
  await openGuide(page, '스피커나 이어폰에서 소리가 안 나요');
  await page.getByRole('button', { name: '모든 앱에서 소리가 안 나요' }).click();
  await expect(page.getByRole('region', { name: '소리를 보낼 출력 장치 찾기' })).toBeVisible();
  await page.locator('.settings-visual').screenshot({ path: `test-results/settings-output-${test.info().project.name}.png`, style: '.skip-link:not(:focus) { visibility: hidden; }' });
  await page.getByRole('button', { name: '다음 확인' }).click();
  const mixer = page.getByRole('region', { name: '앱별 볼륨 찾기' });
  await expect(mixer).toBeVisible();
  await expect(page.getByRole('region', { name: '소리를 보낼 출력 장치 찾기' })).toHaveCount(0);
  await mixer.getByRole('button', { name: '앱별 볼륨 찾기 크게 보기' }).click();
  await expect(page.getByRole('dialog', { name: '앱별 볼륨 찾기' }).getByRole('img')).toBeVisible();
  await page.getByRole('dialog', { name: '앱별 볼륨 찾기' }).screenshot({ path: `test-results/settings-mixer-dialog-${test.info().project.name}.png` });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '아직 소리가 안 나요', exact: true }).click();
  await expect(page.locator('.settings-visual')).toHaveCount(0);
});

test('작업 관리자 안내는 좁은 화면과 어두운 테마에서도 넘치지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await openGuide(page, '컴퓨터가 평소보다 느려요');
  await page.getByRole('button', { name: '여전히 느려요', exact: true }).click();
  const guide = page.getByRole('region', { name: 'CPU와 메모리 사용량 찾기' });
  await expect(guide).toBeVisible();
  expect(await guide.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await guide.screenshot({ path: `test-results/settings-task-dark-${test.info().project.name}.png`, style: '.skip-link:not(:focus) { visibility: hidden; }' });
  await guide.getByRole('button', { name: 'CPU와 메모리 사용량 찾기 크게 보기' }).click();
  const dialog = page.getByRole('dialog', { name: 'CPU와 메모리 사용량 찾기' });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '다음 확인' }).click();
  await expect(page.locator('.settings-visual')).toHaveCount(0);
});

test('Wi-Fi 목록과 유선 점검에서도 네트워크 그림을 바로 확인한다', async ({ page }) => {
  for (const title of ['Wi-Fi 목록이나 내 공유기가 안 보여요', '랜선을 꽂았는데 인터넷이 안 돼요']) {
    await openGuide(page, title);
    await expect(page.getByRole('region', { name: '네트워크 연결 상태 찾기' }).getByRole('img')).toBeVisible();
  }
});
