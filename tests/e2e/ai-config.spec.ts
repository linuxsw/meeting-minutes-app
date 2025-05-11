// tests/e2e/ai-config.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AI Configuration Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/ai-config');
  });

  test('should display AI provider options', async ({ page }) => {
    await expect(page.getByLabel('Select AI Provider')).toBeVisible();
    await expect(page.getByRole('option', { name: 'OpenAI' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Together AI' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Ollama (Self-Hosted)' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'No AI (Manual Processing)' })).toBeVisible();
  });

  test('should show API key input for OpenAI when selected', async ({ page }) => {
    await page.selectOption('select[name="aiProvider"]', 'openai');
    await expect(page.getByLabel('OpenAI API Key')).toBeVisible();
    await expect(page.getByText('Your OpenAI API Key will be stored locally in your browser.')).toBeVisible();
    await expect(page.getByText('Data sent to OpenAI will be subject to their privacy policy.')).toBeVisible();
  });

  test('should show API key input for Together AI when selected', async ({ page }) => {
    await page.selectOption('select[name="aiProvider"]', 'togetherai');
    await expect(page.getByLabel('Together AI API Key')).toBeVisible();
    await expect(page.getByText('Your Together AI API Key will be stored locally in your browser.')).toBeVisible();
    await expect(page.getByText('Data sent to Together AI will be subject to their privacy policy.')).toBeVisible();
  });

  test('should show Ollama base URL input when Ollama is selected', async ({ page }) => {
    await page.selectOption('select[name="aiProvider"]', 'ollama');
    await expect(page.getByLabel('Ollama Base URL')).toBeVisible();
    await expect(page.getByText('Ensure your Ollama instance is running and accessible.')).toBeVisible();
    await expect(page.getByText('Data processed by Ollama stays on your local machine or configured server.')).toBeVisible();
  });

  test('should not show API key input for No AI', async ({ page }) => {
    await page.selectOption('select[name="aiProvider"]', 'none');
    await expect(page.getByLabel('OpenAI API Key')).not.toBeVisible();
    await expect(page.getByLabel('Together AI API Key')).not.toBeVisible();
    await expect(page.getByLabel('Ollama Base URL')).not.toBeVisible();
  });

  // Test for saving configuration (mocking localStorage or checking for visual feedback)
  test('should allow saving configuration', async ({ page }) => {
    await page.selectOption('select[name="aiProvider"]', 'openai');
    await page.fill('input[name="openaiApiKey"]', 'test_api_key');
    await page.getByRole('button', { name: 'Save Configuration' }).click();
    // Add assertion for success message or localStorage check if applicable
    // For now, we just check if the button is clickable
    await expect(page.getByText('Configuration saved!')).toBeVisible(); // Assuming a success message appears
  });
});

