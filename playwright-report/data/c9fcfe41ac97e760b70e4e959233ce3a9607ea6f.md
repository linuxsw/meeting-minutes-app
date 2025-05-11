# Test info

- Name: File Uploader Tests >> should allow selecting a file
- Location: /home/ubuntu/meeting-minutes-app/tests/e2e/file-uploader.spec.ts:15:7

# Error details

```
Error: locator.setInputFiles: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="file"]')

    at /home/ubuntu/meeting-minutes-app/tests/e2e/file-uploader.spec.ts:21:5
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
   1 | // tests/e2e/file-uploader.spec.ts
   2 | import { test, expect } from '@playwright/test';
   3 | import path from 'path';
   4 |
   5 | test.describe('File Uploader Tests', () => {
   6 |   test.beforeEach(async ({ page }) => {
   7 |     await page.goto('http://localhost:3000/review-transcript');
   8 |   });
   9 |
  10 |   test('should display file input and upload button', async ({ page }) => {
  11 |     await expect(page.locator('input[type="file"]')).toBeVisible();
  12 |     await expect(page.getByRole('button', { name: /Process Transcript/i })).toBeVisible();
  13 |   });
  14 |
  15 |   test('should allow selecting a file', async ({ page }) => {
  16 |     // Create a dummy file for testing
  17 |     const filePath = path.join(__dirname, '..', 'fixtures', 'sample.vtt'); // Assuming a fixtures folder with a sample file
  18 |     // Ensure the dummy file exists or create it if necessary for the test environment
  19 |     // For now, we'll just check if the input accepts a file path
  20 |     const fileInput = page.locator('input[type="file"]');
> 21 |     await fileInput.setInputFiles(filePath);
     |     ^ Error: locator.setInputFiles: Test timeout of 30000ms exceeded.
  22 |     
  23 |     const inputValue = await fileInput.inputValue();
  24 |     expect(inputValue).toContain('sample.vtt');
  25 |   });
  26 |
  27 |   // Add more tests for actual upload and processing if backend can be mocked or a test backend is available
  28 |   // For example, checking if a loading state appears, or if a success/error message is shown.
  29 | });
  30 |
  31 | // Create a dummy fixture file for the test
  32 | // In a real setup, this would be part of your test assets
  33 | // For this environment, we'll create it if it doesn't exist
  34 | const fs = require('fs');
  35 | const fixturesDir = path.join(__dirname, '..', 'fixtures');
  36 | const sampleVTTPath = path.join(fixturesDir, 'sample.vtt');
  37 |
  38 | if (!fs.existsSync(fixturesDir)) {
  39 |   fs.mkdirSync(fixturesDir);
  40 | }
  41 | if (!fs.existsSync(sampleVTTPath)) {
  42 |   fs.writeFileSync(sampleVTTPath, 'WEBVTT\n\n00:00:01.000 --> 00:00:05.000\nThis is a sample transcript line.\n');
  43 | }
  44 |
  45 |
```