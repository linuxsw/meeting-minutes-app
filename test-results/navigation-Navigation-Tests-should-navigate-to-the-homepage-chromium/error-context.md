# Test info

- Name: Navigation Tests >> should navigate to the homepage
- Location: /home/ubuntu/meeting-minutes-app/tests/e2e/navigation.spec.ts:5:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)

Locator: locator(':root')
Expected pattern: /Meeting Minutes Generator/
Received string:  ""
Call log:
  - expect.toHaveTitle with timeout 5000ms
  - waiting for locator(':root')
    8 × locator resolved to <html>…</html>
      - unexpected value ""

    at /home/ubuntu/meeting-minutes-app/tests/e2e/navigation.spec.ts:7:24
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
   1 | // tests/e2e/navigation.spec.ts
   2 | import { test, expect } from '@playwright/test';
   3 |
   4 | test.describe('Navigation Tests', () => {
   5 |   test('should navigate to the homepage', async ({ page }) => {
   6 |     await page.goto('http://localhost:3000/');
>  7 |     await expect(page).toHaveTitle(/Meeting Minutes Generator/);
     |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)
   8 |   });
   9 |
  10 |   test('should navigate to Review Transcript page', async ({ page }) => {
  11 |     await page.goto('http://localhost:3000/review-transcript');
  12 |     // Add a more specific assertion for the review page, e.g., checking for a unique element
  13 |     await expect(page.locator('h1:has-text("Review Transcript")')).toBeVisible();
  14 |   });
  15 |
  16 |   test('should navigate to AI Configuration page', async ({ page }) => {
  17 |     await page.goto('http://localhost:3000/ai-config');
  18 |     await expect(page.locator('h1:has-text("AI Provider Configuration")')).toBeVisible();
  19 |   });
  20 |
  21 |   test('should navigate to Test page', async ({ page }) => {
  22 |     await page.goto('http://localhost:3000/test');
  23 |     await expect(page.locator('h1:has-text("Test Page")')).toBeVisible();
  24 |   });
  25 |
  26 |   test('should navigate to Test Transcript page', async ({ page }) => {
  27 |     await page.goto('http://localhost:3000/test-transcript');
  28 |     await expect(page.locator('h1:has-text("Test Transcript Processing")')).toBeVisible();
  29 |   });
  30 | });
  31 |
  32 |
```