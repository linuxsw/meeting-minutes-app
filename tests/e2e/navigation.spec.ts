// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('should navigate to the homepage', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveTitle(/Meeting Minutes Generator/);
  });

  test('should navigate to Review Transcript page', async ({ page }) => {
    await page.goto('http://localhost:3000/review-transcript');
    // Add a more specific assertion for the review page, e.g., checking for a unique element
    await expect(page.locator('h1:has-text("Review Transcript")')).toBeVisible();
  });

  test('should navigate to AI Configuration page', async ({ page }) => {
    await page.goto('http://localhost:3000/ai-config');
    await expect(page.locator('h1:has-text("AI Provider Configuration")')).toBeVisible();
  });

  test('should navigate to Test page', async ({ page }) => {
    await page.goto('http://localhost:3000/test');
    await expect(page.locator('h1:has-text("Test Page")')).toBeVisible();
  });

  test('should navigate to Test Transcript page', async ({ page }) => {
    await page.goto('http://localhost:3000/test-transcript');
    await expect(page.locator('h1:has-text("Test Transcript Processing")')).toBeVisible();
  });
});

