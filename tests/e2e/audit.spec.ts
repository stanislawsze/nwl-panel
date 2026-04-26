import { expect, test } from '@playwright/test';

import { mockApi } from './api-mocks';

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(
    page.getByRole('heading', { name: 'Operations Workspace' }),
  ).toBeVisible();
});

test('shows tenant audit logs with event filtering', async ({ page }) => {
  await page.getByRole('link', { name: 'Audit' }).click();

  await expect(page.getByRole('heading', { name: 'Audit log' })).toBeVisible();
  await expect(
    page.locator('strong').filter({ hasText: /^Invitation created$/ }),
  ).toBeVisible();
  await expect(
    page.locator('strong').filter({ hasText: /^Member added$/ }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Invites' }).click();

  await expect(
    page.locator('strong').filter({ hasText: /^Invitation created$/ }),
  ).toBeVisible();
  await expect(
    page.locator('strong').filter({ hasText: /^Member added$/ }),
  ).toBeHidden();
});
