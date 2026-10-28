import { test, expect } from '@playwright/test';

// Language paths: German has no prefix, Turkish and English use /tr and /en.

test('English home page shows English text and lang attribute', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pass on technology. Open up opportunities.');
  await expect(page.getByRole('note')).toHaveCount(0);
});

test('legal and staff pages in English keep the German-only note', async ({ page }) => {
  await page.goto('/en/impressum');
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
  await expect(page.locator('header').getByRole('link', { name: 'Donate a device' })).toHaveAttribute('href', '/en/spenden');
});

test('header link in Turkish opens the Turkish donation page', async ({ page }) => {
  await page.goto('/tr');
  await page.locator('header').getByRole('link', { name: 'Cihaz bağışla' }).click();
  await expect(page).toHaveURL(/\/tr\/spenden$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Laptop veya tablet bağışla');
  await expect(page.getByRole('note')).toHaveCount(0);
});

test('the donation check runs in Turkish and English', async ({ page }) => {
  await page.goto('/tr/spenden');
  await expect(page.getByText('Adım 1 / 6:')).toBeVisible();
  await page.getByRole('button', { name: 'Devam', exact: true }).click();
  await expect(page.getByText('Adım 2 / 6:')).toBeVisible();
  await page.getByRole('group', { name: 'Pil' }).getByLabel('Şişmiş veya hasarlı', { exact: true }).check();
  await expect(page.getByRole('status', { name: 'Ön kontrol' })).toContainText('yangın tehlikesi');
  await page.goto('/en/spenden');
  await expect(page.getByText('Step 1 of 6:')).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('group', { name: 'Battery' }).getByLabel('Swollen or damaged', { exact: true }).check();
  await expect(page.getByRole('status', { name: 'Pre-check' })).toContainText('fire risk');
});

test('acceptance criteria, partnership and request pages are translated', async ({ page }) => {
  await page.goto('/tr/annahmekriterien');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kabul kriterleri');
  await expect(page.getByRole('table')).toHaveCount(5);
  await page.goto('/en/annahmekriterien');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Acceptance criteria');
  await expect(page.getByRole('table')).toHaveCount(5);
  await page.goto('/en/geraetepartnerschaft');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Device partnership');
  await expect(page.getByText('coming soon').first()).toBeVisible();
  await expect(page.getByRole('note')).toHaveCount(0);
});

// No horizontal scroll at 320 px, iPhone 13 (390 px) and Pixel 7 (412 px).
for (const [name, width] of [['320', 320], ['iPhone 13', 390], ['Pixel 7', 412]] as const) {
  for (const path of ['/tr/spenden', '/en/spenden', '/tr/annahmekriterien', '/en/annahmekriterien', '/tr/geraetepartnerschaft', '/en/beantragen']) {
    test(`${path} has no horizontal scroll at ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const breit = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(breit).toBeLessThanOrEqual(0);
    });
  }
}

test('request form has no second language select; the language comes from the address', async ({ page }) => {
  await page.goto('/tr/beantragen');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.getByRole('combobox', { name: 'Dil', exact: true })).toHaveCount(1);
  await expect(page.locator('form')).toHaveAttribute('lang', 'tr');
});

// Contact and summary steps in Turkish and English, with the narrowest and the widest phone.
for (const [lang, width, weiter, kontakt, absenden, danke] of [
  ['tr', 320, 'Devam', 'İletişime geç', 'Talebi gönder', 'Bağışınız için çok teşekkürler!'],
  ['en', 412, 'Next', 'Continue to contact', 'Send request', 'Thank you for your donation!'],
] as const) {
  test(`a request can be sent in ${lang} at ${width} px without horizontal scroll`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(`/${lang}/spenden`);
    await page.locator('input[autocomplete="off"]').first().fill('Lenovo');
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: weiter, exact: true }).click();
    await page.getByRole('button', { name: kontakt }).click();
    await page.locator('input[autocomplete="name"]').fill('Erika Muster');
    await page.locator('input[autocomplete="email"]').fill('erika@example.de');
    await page.locator('input[autocomplete="postal-code"]').fill('50667');
    await page.getByRole('button', { name: weiter, exact: true }).click();
    await page.getByRole('checkbox').nth(0).check();
    await page.getByRole('checkbox').nth(1).check();
    const breit = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(breit).toBeLessThanOrEqual(0);
    await page.getByRole('button', { name: absenden }).click();
    await expect(page.getByText(danke)).toBeVisible();
  });
}
