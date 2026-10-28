import { test, expect } from '@playwright/test';
import { SITEMAP } from '../src/lib/sitemap';

// /admin redirects to the sign-in page; it is covered in admin.test-env.spec.ts.
for (const p of SITEMAP.filter((x) => x.path !== '/' && x.path !== '/admin')) {
  test(`${p.path} renders with its title`, async ({ page }) => {
    const res = await page.goto(p.path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.title);
  });
}

// TEMPORARY: admin is switched on for the live check; the test environment shows the sign-in page.
test('/admin/login is shown in the test environment (temporary)', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Anmeldung Verwaltung');
});

test('/geraetepartnerschaft is marked as coming soon', async ({ page }) => {
  await page.goto('/geraetepartnerschaft');
  await expect(page.getByText('demnächst').first()).toBeVisible();
});

test('/annahmekriterien shows draft criteria v0.1', async ({ page }) => {
  await page.goto('/annahmekriterien');
  await expect(page.getByText('Entwurf v0.1')).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(5);
});
