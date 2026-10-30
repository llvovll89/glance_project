import { finishDiagnosis } from './helpers/diagnosis';
import { expect, test } from '@playwright/test';

test('점검 단계가 새로고침 후 이어지고 기록을 삭제할 수 있다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '다음 확인' }).click();
  await expect(page.getByText('2번째 확인')).toBeVisible();
  await expect(page.getByRole('region', { name: '이어서 점검' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('region', { name: '이어서 점검' })).toContainText('2번째 단계부터');
  await page.getByRole('button', { name: '이어서 점검' }).click();
  await expect(page.getByText('2번째 확인')).toBeVisible();
  await expect(page.locator('.checklist button.is-reviewed')).toHaveCount(1);
  await page.getByRole('button', { name: '기록 삭제' }).click();
  await expect(page.getByRole('region', { name: '이어서 점검' })).toHaveCount(0);
  await expect(page.getByText('1번째 확인')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('region', { name: '이어서 점검' })).toHaveCount(0);
});

test('해결됨으로 표시하면 저장된 점검이 사라진다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '다음 확인' }).click();
  await expect(page.getByRole('region', { name: '이어서 점검' })).toBeVisible();
  await finishDiagnosis(page, 'resolved');
  await expect(page.getByRole('region', { name: '이어서 점검' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('region', { name: '이어서 점검' })).toHaveCount(0);
});

test('다른 가이드를 해결해도 이전 점검 기록을 유지한다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '다음 확인' }).click();
  await page.locator('.symptom-option').filter({ hasText: '전원을 켜면 삐 소리가 나요' }).click();
  await finishDiagnosis(page, 'resolved');
  await expect(page.getByRole('region', { name: '이어서 점검' })).toContainText('본체는 켜지는데 화면이 안 나와요');
  await page.reload();
  await page.getByRole('button', { name: '이어서 점검' }).click();
  await expect(page.getByText('2번째 확인')).toBeVisible();
});

test('다른 메뉴를 다녀와도 최신 점검 단계가 유지된다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '다음 확인' }).click();
  await page.getByRole('button', { name: '다음 확인' }).click();
  await page.getByRole('navigation', { name: '주요 메뉴' }).getByRole('button', { name: '내 PC 알아보기' }).click();
  await page.getByRole('navigation', { name: '주요 메뉴' }).getByRole('button', { name: '문제 해결' }).click();
  await expect(page.getByText('3번째 확인')).toBeVisible();
  await expect(page.locator('.checklist button.is-reviewed')).toHaveCount(2);
});
