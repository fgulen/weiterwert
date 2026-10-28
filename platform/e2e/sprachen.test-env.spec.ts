import { test, expect } from '@playwright/test';

// Language paths: German has no prefix, Turkish and English use /tr and /en.

test('English home page shows English text and lang attribute', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pass on technology. Open doors to opportunities.');
  await expect(page.getByRole('note')).toHaveText('This page is currently available in German only.');
});

test('Turkish home page shows Turkish text and lang attribute', async ({ page }) => {
  await page.goto('/tr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Teknolojiyi aktar. Fırsatların kapısını aç.');
});

test('German home page has no language note', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.getByRole('note')).toHaveCount(0);
});

test('language select opens the same page in another language', async ({ page }) => {
  await page.goto('/spenden');
  await page.getByLabel('Sprache', { exact: true }).selectOption('tr');
  await expect(page).toHaveURL(/\/tr\/spenden$/);
  await expect(page.getByRole('link', { name: 'Cihaz bağışla' })).toBeVisible();
});

test('header links keep the language prefix', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByRole('link', { name: 'Donate a device' })).toHaveAttribute('href', '/en/spenden');
});

test('header link in Turkish opens the Turkish donation page', async ({ page }) => {
  await page.goto('/tr');
  await page.getByRole('link', { name: 'Cihaz bağışla' }).click();
  await expect(page).toHaveURL(/\/tr\/spenden$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.getByRole('note')).toHaveText('Bu sayfa şimdilik yalnızca Almanca.');
});
