import { expect, test } from '@playwright/test';

import { mockApi } from './api-mocks';

test('signs in and lands on the tenant overview', async ({ page }) => {
  await mockApi(page);

  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page.getByRole('heading', { name: 'Operations Workspace' }),
  ).toBeVisible();
  await expect(page.getByText('Signed in successfully.')).toBeVisible();
  await expect(page.getByText('admin@example.com')).toBeVisible();
});

test('validates sign in fields before submitting', async ({ page }) => {
  await mockApi(page);

  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expect(
    page.getByText('Password must be at least 8 characters.'),
  ).toBeVisible();
});
