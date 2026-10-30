import { expect, test, type Page } from '@playwright/test';

const windowsResult = JSON.stringify({
  source: 'hanno-windows-specs',
  version: 1,
  profile: { nickname: 'Test PC', os: 'windows11', cpu: 'Test CPU', ram: '16 GiB' },
});

async function openImport(page: Page) {
  await page.goto('/');
  await page.getByRole('navigation', { name: '주요 메뉴' }).getByRole('link', { name: '내 PC 알아보기' }).click();
  await page.getByRole('button', { name: '사양 가져오기' }).click();
  await expect(page.getByRole('heading', { name: '내 PC 사양 가져오기' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test('CMD 명령을 복사하고 원본 PowerShell 스크립트를 확인한다', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openImport(page);
  await page.getByRole('combobox', { name: '운영체제와 터미널' }).click();
  await page.getByRole('option', { name: 'Windows CMD' }).click();
  await page.getByRole('button', { name: '수집 명령 복사' }).click();
  const command = await page.evaluate(() => navigator.clipboard.readText());
  expect(command).toMatch(/^powershell\.exe -NoProfile -EncodedCommand /);
  await page.getByText('수집 명령 보기').click();
  await expect(page.getByText('CMD가 실행하는 PowerShell 스크립트')).toBeVisible();
  await expect(page.locator('.pc-collector-details pre').last()).toContainText('Get-CimInstance');
});

test('클립보드 결과를 미리 보고 적용한 뒤 저장한다', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openImport(page);
  await page.evaluate(value => navigator.clipboard.writeText(value), windowsResult);
  await page.getByRole('button', { name: '클립보드에서 가져오기' }).click();
  await expect(page.getByRole('heading', { name: '입력칸에 적용할 정보' })).toBeVisible();
  await expect(page.locator('.pc-import-preview')).toContainText('CPU: Test CPU');
  await page.getByRole('button', { name: '입력칸에 적용' }).click();
  await expect(page.getByRole('textbox', { name: 'CPU' })).toHaveValue('Test CPU');
  await page.getByRole('button', { name: '내 PC 사양 저장' }).click();
  await expect(page.getByText('이 브라우저에 저장했어요. 새로고침해도 다시 볼 수 있어요.')).toBeVisible();
  await page.reload();
  await page.getByRole('navigation', { name: '주요 메뉴' }).getByRole('link', { name: '내 PC 알아보기' }).click();
  await expect(page.getByRole('textbox', { name: 'CPU' })).toHaveValue('Test CPU');
});

test('Linux 결과를 붙여넣으면 기존 미수집 항목을 유지한다', async ({ page }) => {
  await openImport(page);
  await page.getByRole('textbox', { name: '그래픽 장치' }).fill('Keep GPU');
  await page.getByRole('combobox', { name: '운영체제와 터미널' }).click();
  await page.getByRole('option', { name: 'Linux Terminal (bash)' }).click();
  await page.getByRole('textbox', { name: '복사한 사양 정보' }).fill('hanno-specs-v1\tlinux\ncpu\tLinux CPU\nram\t32 GiB');
  await page.getByRole('button', { name: '붙여넣은 내용 확인' }).click();
  await expect(page.locator('.pc-import-preview')).toContainText('CPU: Linux CPU');
  await page.getByRole('button', { name: '입력칸에 적용' }).click();
  await expect(page.getByRole('textbox', { name: 'CPU' })).toHaveValue('Linux CPU');
  await expect(page.getByRole('textbox', { name: '그래픽 장치' })).toHaveValue('Keep GPU');
});
