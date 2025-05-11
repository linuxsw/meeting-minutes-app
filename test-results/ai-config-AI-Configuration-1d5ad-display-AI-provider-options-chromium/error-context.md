# Test info

- Name: AI Configuration Page Tests >> should display AI provider options
- Location: /home/ubuntu/meeting-minutes-app/tests/e2e/ai-config.spec.ts:9:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByLabel('Select AI Provider')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByLabel('Select AI Provider')

    at /home/ubuntu/meeting-minutes-app/tests/e2e/ai-config.spec.ts:10:57
```

# Page snapshot

```yaml
- alert
- dialog:
  - heading "Build Error" [level=1]
  - text: Next.js (15.1.4) out of date
  - link "(learn more)":
    - /url: https://nextjs.org/docs/messages/version-staleness
  - paragraph: Failed to compile
  - link "./src/app/ai-config/page.tsx":
    - text: ./src/app/ai-config/page.tsx
    - img
  - text: "Error: × You're importing a component that needs `useState`. This React hook only works in a client component. To fix, mark the file (or its parent) with the `\"use client\"` directive. │ │ Learn more:"
  - link "https://nextjs.org/docs/app/api-reference/directives/use-client":
    - /url: https://nextjs.org/docs/app/api-reference/directives/use-client
  - text: "│ │ ╭─[/home/ubuntu/meeting-minutes-app/src/app/ai-config/page.tsx:1:1] 1 │ import React, { useState, useEffect } from 'react'; · ──────── 2 │ 3 │ // Assuming this is the structure based on typical Next.js app router pages ╰────"
  - contentinfo:
    - paragraph: This error occurred during the build process and can only be dismissed by fixing the error.
```

# Test source

```ts
   1 | // tests/e2e/ai-config.spec.ts
   2 | import { test, expect } from '@playwright/test';
   3 |
   4 | test.describe('AI Configuration Page Tests', () => {
   5 |   test.beforeEach(async ({ page }) => {
   6 |     await page.goto('http://localhost:3000/ai-config');
   7 |   });
   8 |
   9 |   test('should display AI provider options', async ({ page }) => {
> 10 |     await expect(page.getByLabel('Select AI Provider')).toBeVisible();
     |                                                         ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  11 |     await expect(page.getByRole('option', { name: 'OpenAI' })).toBeVisible();
  12 |     await expect(page.getByRole('option', { name: 'Together AI' })).toBeVisible();
  13 |     await expect(page.getByRole('option', { name: 'Ollama (Self-Hosted)' })).toBeVisible();
  14 |     await expect(page.getByRole('option', { name: 'No AI (Manual Processing)' })).toBeVisible();
  15 |   });
  16 |
  17 |   test('should show API key input for OpenAI when selected', async ({ page }) => {
  18 |     await page.selectOption('select[name="aiProvider"]', 'openai');
  19 |     await expect(page.getByLabel('OpenAI API Key')).toBeVisible();
  20 |     await expect(page.getByText('Your OpenAI API Key will be stored locally in your browser.')).toBeVisible();
  21 |     await expect(page.getByText('Data sent to OpenAI will be subject to their privacy policy.')).toBeVisible();
  22 |   });
  23 |
  24 |   test('should show API key input for Together AI when selected', async ({ page }) => {
  25 |     await page.selectOption('select[name="aiProvider"]', 'togetherai');
  26 |     await expect(page.getByLabel('Together AI API Key')).toBeVisible();
  27 |     await expect(page.getByText('Your Together AI API Key will be stored locally in your browser.')).toBeVisible();
  28 |     await expect(page.getByText('Data sent to Together AI will be subject to their privacy policy.')).toBeVisible();
  29 |   });
  30 |
  31 |   test('should show Ollama base URL input when Ollama is selected', async ({ page }) => {
  32 |     await page.selectOption('select[name="aiProvider"]', 'ollama');
  33 |     await expect(page.getByLabel('Ollama Base URL')).toBeVisible();
  34 |     await expect(page.getByText('Ensure your Ollama instance is running and accessible.')).toBeVisible();
  35 |     await expect(page.getByText('Data processed by Ollama stays on your local machine or configured server.')).toBeVisible();
  36 |   });
  37 |
  38 |   test('should not show API key input for No AI', async ({ page }) => {
  39 |     await page.selectOption('select[name="aiProvider"]', 'none');
  40 |     await expect(page.getByLabel('OpenAI API Key')).not.toBeVisible();
  41 |     await expect(page.getByLabel('Together AI API Key')).not.toBeVisible();
  42 |     await expect(page.getByLabel('Ollama Base URL')).not.toBeVisible();
  43 |   });
  44 |
  45 |   // Test for saving configuration (mocking localStorage or checking for visual feedback)
  46 |   test('should allow saving configuration', async ({ page }) => {
  47 |     await page.selectOption('select[name="aiProvider"]', 'openai');
  48 |     await page.fill('input[name="openaiApiKey"]', 'test_api_key');
  49 |     await page.getByRole('button', { name: 'Save Configuration' }).click();
  50 |     // Add assertion for success message or localStorage check if applicable
  51 |     // For now, we just check if the button is clickable
  52 |     await expect(page.getByText('Configuration saved!')).toBeVisible(); // Assuming a success message appears
  53 |   });
  54 | });
  55 |
  56 |
```