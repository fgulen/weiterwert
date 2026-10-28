import { test, expect } from '@playwright/test';

// Admin area in the test environment: no real accounts, so visitors are sent to the sign-in page.

test('admin page redirects to the sign-in page without a session', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Anmeldung Verwaltung');
});

test('sign-in form has e-mail and password fields', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.getByLabel('E-Mail')).toBeVisible();
  await expect(page.getByLabel('Passwort')).toHaveAttribute('type', 'password');
});

test('failed sign-in shows the error message', async ({ page }) => {
  await page.goto('/admin/login?fehler=1');
  await expect(page.getByText('E-Mail oder Passwort ist nicht richtig.')).toBeVisible();
});
