import { expect, test, type Page } from '@playwright/test';

const historyKey = 'hanno-diagnosis-history-v1';
const progressKey = 'hanno-guide-progress-v1';

async function memo(page: Page, text: string) {
  await page.getByText('결과 메모 남기기 (선택)', { exact: true }).click();
  await page.getByRole('textbox', { name: '결과 메모', exact: true }).fill(text);
}

test('메모를 이어 쓰고 해결 결과와 함께 이력에 보관한다', async ({ page }) => {
  await page.goto('/');
  await page.locator('.symptom-option').filter({ hasText: '인터넷에 연결되지 않아요' }).click();
  await page.getByRole('button', { name: '다른 기기는 되고 이 PC만 안 돼요' }).click();
  await memo(page, 'Wi-Fi를 다시 연결하니 해결됐어요.');
  await page.reload();
  await page.getByRole('button', { name: '이어서 점검' }).click();
  await page.getByText('결과 메모 남기기 (선택)', { exact: true }).click();
  await expect(page.getByRole('textbox', { name: '결과 메모', exact: true })).toHaveValue('Wi-Fi를 다시 연결하니 해결됐어요.');
  await page.getByRole('button', { name: '이제 여러 사이트가 잘 열려요' }).click();
  await expect(page.getByRole('region', { name: '이어서 점검' })).toHaveCount(0);
  await page.reload();
  const history = page.getByRole('region', { name: '점검 이력', exact: true });
  await expect(history).toContainText('남겨 둔 기록 1개');
  await history.locator('.history-entry > summary').click();
  await expect(history).toContainText('해결됨');
  await expect(history).toContainText('다른 기기는 되고 이 PC만 안 돼요');
  await expect(history).toContainText('이제 여러 사이트가 잘 열려요');
  await expect(history.getByRole('textbox', { name: '메모 수정' })).toHaveValue('Wi-Fi를 다시 연결하니 해결됐어요.');
});

test('메모를 수정해 복사하고 한 기록만 삭제한다', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (value: string) => { (window as unknown as { report: string }).report = value; } } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: '해결됐어요' }).click();
  await page.locator('.symptom-option').filter({ hasText: '전원을 켜면 삐 소리가 나요' }).click();
  await page.getByRole('button', { name: '미해결로 기록', exact: true }).click();
  const history = page.getByRole('region', { name: '점검 이력', exact: true });
  const entry = history.locator('.history-entry').filter({ hasText: '본체는 켜지는데 화면이 안 나와요' });
  await entry.locator(':scope > summary').click();
  await entry.getByRole('textbox', { name: '메모 수정' }).fill('HDMI 입력을 바꾸니 해결됨');
  await entry.getByRole('button', { name: '메모 저장' }).click();
  await entry.getByRole('button', { name: '기록 복사', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { report: string }).report)).toContain('HDMI 입력을 바꾸니 해결됨');
  await history.screenshot({ path: `test-results/diagnosis-history-${test.info().project.name}.png`, style: '.skip-link:not(:focus) { visibility: hidden; }' });
  await entry.getByRole('button', { name: '이 기록 삭제' }).click();
  await expect(history.locator('.history-entry')).toHaveCount(1);
  await expect(history).toContainText('전원을 켜면 삐 소리가 나요');
  await expect(history.getByRole('heading', { name: '점검 이력', exact: true })).toBeFocused();
  await page.reload();
  await expect(history.locator('.history-entry')).toHaveCount(1);
});

test('같은 점검을 다시 저장해도 중복되지 않고 재점검은 처음부터 시작한다', async ({ page }) => {
  await page.goto('/');
  await memo(page, '같은 증상이 반복됨');
  await page.getByRole('button', { name: '미해결로 기록', exact: true }).click();
  await page.getByRole('button', { name: '점검으로 돌아가기' }).click();
  await page.getByRole('button', { name: '다음 확인' }).click();
  await page.getByRole('button', { name: '해결됐어요' }).click();
  const history = page.getByRole('region', { name: '점검 이력', exact: true });
  await expect(history.locator('.history-entry')).toHaveCount(1);
  await history.locator('.history-entry > summary').click();
  await expect(history).toContainText('해결됨');
  await history.getByRole('textbox', { name: '메모 수정' }).fill('저장한 메모를 나중에 수정함');
  await history.getByRole('button', { name: '메모 저장' }).click();
  await page.getByRole('button', { name: '점검으로 돌아가기' }).click();
  await page.getByRole('button', { name: '해결됐어요' }).click();
  await expect(history.getByRole('textbox', { name: '메모 수정' })).toHaveValue('저장한 메모를 나중에 수정함');
  await history.getByRole('button', { name: '다시 점검', exact: true }).click();
  await expect(page.getByText('1번째 확인', { exact: true })).toBeVisible();
  await expect(page.locator('.checklist button.is-reviewed')).toHaveCount(0);
  await expect(history.locator('.history-entry')).toHaveCount(1);
  await page.getByRole('button', { name: '해결됐어요' }).click();
  await expect(history.locator('.history-entry')).toHaveCount(2);
});

test('이력 저장에 실패하면 진행 상태를 유지하고 다시 저장할 수 있다', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    (window as unknown as { failHistory: boolean }).failHistory = true;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'hanno-diagnosis-history-v1' && (window as unknown as { failHistory: boolean }).failHistory) throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: '다음 확인' }).click();
  await memo(page, '저장 실패에도 남겨야 하는 메모');
  await page.getByRole('button', { name: '해결됐어요' }).click();
  await expect(page.getByRole('alert')).toContainText('점검 이력을 저장하지 못했어요');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).progress.note, progressKey)).toBe('저장 실패에도 남겨야 하는 메모');
  await expect(page.getByRole('region', { name: '이어서 점검' })).toBeVisible();
  await page.evaluate(() => { (window as unknown as { failHistory: boolean }).failHistory = false; });
  await page.getByRole('button', { name: '기록 저장 다시 시도' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('region', { name: '이어서 점검' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: '점검 이력', exact: true }).locator('.history-entry')).toHaveCount(1);
});

test('보관 한도에서 기존 기록을 지우지 않고 빈자리가 생기면 저장한다', async ({ page }) => {
  await page.addInitScript(key => {
    localStorage.setItem(key, JSON.stringify({ version: 1, records: Array.from({ length: 50 }, (_, index) => ({ id: `record-${index}`, guideId: 'display', title: `이전 점검 ${index + 1}`, recordedAt: '2026-10-29T00:00:00.000Z', status: 'resolved', checked: [], answers: [], device: [], variant: '', note: '' })) }));
  }, historyKey);
  await page.goto('/');
  await page.getByRole('button', { name: '해결됐어요' }).click();
  await expect(page.getByRole('alert')).toContainText('50개까지');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).records.length, historyKey)).toBe(50);
  const history = page.getByRole('region', { name: '점검 이력', exact: true });
  await history.locator('.history-entry > summary').first().click();
  await history.getByRole('button', { name: '이 기록 삭제' }).click();
  await page.getByRole('button', { name: '기록 저장 다시 시도' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(history).toContainText('남겨 둔 기록 50개');
  if (test.info().project.name === 'mobile-chromium') {
    await page.setViewportSize({ width: 320, height: 740 });
    expect(await history.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  }
});
