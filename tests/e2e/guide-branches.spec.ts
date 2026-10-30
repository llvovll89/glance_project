import { expect, test } from '@playwright/test';

async function openNetwork(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('.symptom-option').filter({ hasText: '인터넷에 연결되지 않아요' }).click();
}

test('다른 기기도 안 되면 PC 점검을 건너뛰고 선택 결과와 함께 이어간다', async ({ page }) => {
  await openNetwork(page);
  await page.getByRole('button', { name: '다른 기기도 여러 사이트가 안 열려요' }).click();
  await expect(page.getByRole('heading', { name: '공유기와 회선 지원을 확인해요' })).toBeFocused();
  await expect(page.locator('.checklist button.is-reviewed')).toHaveCount(1);
  await page.reload();
  await page.getByRole('button', { name: '이어서 점검' }).click();
  await expect(page.getByText('4번째 확인')).toBeVisible();
  await page.getByText('선택한 확인 결과 1개', { exact: true }).click();
  await expect(page.locator('.answer-history')).toContainText('다른 기기도 여러 사이트가 안 열려요');
  await page.getByRole('button', { name: '1번째 확인 결과 변경' }).click();
  await page.getByRole('button', { name: '다른 기기는 되고 이 PC만 안 돼요' }).click();
  await expect(page.getByRole('heading', { name: 'Wi-Fi 또는 LAN 연결을 확인해요' })).toBeFocused();
});

test('이전 답변을 바꾸면 이후 답변을 지우고 복사 기록도 갱신한다', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (value: string) => { (window as unknown as { report: string }).report = value; } } });
  });
  await openNetwork(page);
  await page.getByRole('button', { name: '다른 기기는 되고 이 PC만 안 돼요' }).click();
  await page.getByRole('button', { name: '여전히 인터넷이 안 돼요', exact: true }).click();
  await page.getByText('선택한 확인 결과 2개', { exact: true }).click();
  await page.getByRole('button', { name: '1번째 확인 결과 변경' }).click();
  await page.getByRole('button', { name: '다른 기기도 여러 사이트가 안 열려요' }).click();
  await expect(page.getByText('선택한 확인 결과 1개', { exact: true })).toBeVisible();
  await expect(page.locator('.checklist button.is-reviewed')).toHaveCount(1);
  await page.getByRole('button', { name: '점검 기록 복사' }).click();
  const report = await page.evaluate(() => (window as unknown as { report: string }).report);
  expect(report).toContain('다른 기기도 여러 사이트가 안 열려요');
  expect(report).not.toContain('다른 기기는 되고 이 PC만 안 돼요');
  expect(report).not.toContain('여전히 인터넷이 안 돼요');
});

test('결과를 몰라도 순서대로 진행하고 해결 결과를 고르면 저장 기록을 삭제한다', async ({ page }) => {
  await openNetwork(page);
  await page.getByRole('button', { name: '다음 확인' }).click();
  await expect(page.getByText('2번째 확인')).toBeVisible();
  await page.getByRole('button', { name: '이제 여러 사이트가 잘 열려요' }).click();
  await expect(page.getByRole('heading', { name: '다시 잘 작동한다니 다행이에요.' })).toBeFocused();
  await expect(page.getByRole('region', { name: '이어서 점검' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('region', { name: '이어서 점검' })).toHaveCount(0);
});

test('모바일에서도 긴 결과 선택지가 화면 밖으로 넘치지 않는다', async ({ page }) => {
  await openNetwork(page);
  const question = page.locator('.result-question');
  await expect(question).toBeVisible();
  expect(await question.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: `test-results/branches-${test.info().project.name}.png`, fullPage: true });
});

test('결과 선택이 우선이며 기록 작업은 점검 마무리에서 펼친다', async ({ page }) => {
  await openNetwork(page);
  await expect(page.locator('.result-question button')).toHaveCount(2);
  await expect(page.locator('.step-actions .button-primary')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '미해결로 기록', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: '해결됐어요', exact: true })).toBeHidden();
  await page.getByRole('button', { name: '다음 확인', exact: true }).click();
  await expect(page.getByText('2번째 확인', { exact: true })).toBeVisible();
  await page.locator('.diagnosis-finish > summary').click();
  await page.getByRole('button', { name: '미해결로 기록', exact: true }).click();
  await expect(page.getByRole('heading', { name: '추가 확인이 필요해요.' })).toBeFocused();
  await expect(page.getByRole('region', { name: '점검 이력', exact: true })).toContainText('추가 확인 필요');
});
