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

test('filters and manages tenant invitations', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('link', { name: 'Members' }).click();

  await expect(
    page.getByRole('heading', { name: 'Invitations' }),
  ).toBeVisible();
  await expect(page.getByText('pending@example.com')).toBeVisible();
  await expect(page.getByText('accepted@example.com')).toBeHidden();

  await page.getByRole('button', { name: 'Accepted' }).click();
  await expect(page.getByText('accepted@example.com')).toBeVisible();
  await expect(page.getByText('pending@example.com')).toBeHidden();

  await page.getByRole('button', { name: 'Pending' }).click();
  await page.getByLabel('Copy invitation link for pending@example.com').click();
  await expect(page.getByText('Invitation link copied.')).toBeVisible();

  await page.getByLabel('Resend invitation to pending@example.com').click();
  await expect(page.getByText('Invitation resent.')).toBeVisible();

  await page.getByLabel('Revoke invitation for pending@example.com').click();
  await expect(page.getByText('Invitation revoked.')).toBeVisible();
});
