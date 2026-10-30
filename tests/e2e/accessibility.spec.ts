import { expect, test, type Page } from '@playwright/test';

async function fits(page: Page) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return {
      page: document.documentElement.scrollWidth - width,
      controls: [...document.querySelectorAll('button, input, textarea, select, main a, summary')]
        .filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden')
        .filter(element => { const rect = element.getBoundingClientRect(); return rect.left < -1 || rect.right > width + 1; })
        .map(element => element.textContent?.slice(0, 60) || element.id),
    };
  });
  expect(overflow, page.url()).toEqual({ page: 0, controls: [] });
}

for (const colorScheme of ['light', 'dark'] as const) {
  test(`${colorScheme}: 주요 화면과 펼친 입력·설명이 좁은 화면에서 넘치지 않는다`, async ({ page, isMobile }) => {
    await page.emulateMedia({ colorScheme });
    for (const width of isMobile ? [320, 390] : [320, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/', '/?view=learn', '/?view=learn&mode=dictionary', '/?view=learn&mode=quiz', '/?view=pc', '/?view=lab']) {
        await page.goto(path);
        await expect(page.locator('#page-title')).toBeVisible();
        if (path === '/?view=pc') {
          await page.getByRole('button', { name: '사양 가져오기', exact: true }).click();
          await page.getByText('수집 명령 보기', { exact: true }).click();
        }
        if (path === '/?view=learn&mode=dictionary') await page.locator('.dictionary-list summary').first().click();
        await fits(page);
      }
      await page.goto('/?view=learn&topic=cpu');
      const dialog = page.getByRole('dialog', { name: 'CPU', exact: true });
      await expect(dialog).toBeVisible();
      expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      await dialog.screenshot({ path: `test-results/article-${width}-${colorScheme}-${test.info().project.name}.png` });
    }
  });
}

test('키보드로 본문과 메뉴에 접근하고 설명을 닫으면 열었던 버튼으로 돌아온다', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '본문으로 이동', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('searchbox', { name: '무엇이 궁금한가요?' })).toBeFocused();
  await page.goto('/?view=learn');
  const opener = page.locator('.part-description').getByRole('button', { name: '설명과 실습 보기' });
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'CPU', exact: true });
  await expect(dialog.getByRole('button', { name: '설명 닫기', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect.poll(() => page.evaluate(() => Boolean(document.activeElement?.closest('dialog')))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test('200% 확대에 상응하는 640 CSS px 화면에서 주요 기능을 사용할 수 있다', async ({ page }) => {
  // A 1280px desktop at 200% browser zoom has a 640 CSS px layout viewport.
  // This checks equivalent reflow; it does not emulate native browser zoom.
  await page.setViewportSize({ width: 640, height: 450 });
  await page.goto('/?guide=network');
  await page.getByRole('button', { name: '다른 기기는 되고 이 PC만 안 돼요' }).click();
  await fits(page);
  await page.getByRole('button', { name: '네트워크 연결 상태 찾기 크게 보기' }).click();
  const dialog = page.getByRole('dialog', { name: '네트워크 연결 상태 찾기' });
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '네트워크 연결 상태 찾기 크게 보기' })).toBeFocused();
});

test('분야 버튼은 이름 있는 그룹이며 퀴즈를 넘기면 새 질문으로 초점이 이동한다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('group', { name: '증상 분야' }).getByRole('button')).toHaveCount(6);
  await page.goto('/?view=learn&mode=quiz');
  await page.locator('.quiz-choices button').first().focus();
  await page.keyboard.press('Enter');
  const next = page.getByRole('button', { name: '다음 문제', exact: true });
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.quiz-question h3')).toBeFocused();
  await page.getByRole('button', { name: '다시 시작', exact: true }).click();
  await expect(page.locator('.quiz-question h3')).toBeFocused();
});
