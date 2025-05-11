# Test info

- Name: API Endpoint Tests >> POST /api/process without required data should return error
- Location: /home/ubuntu/meeting-minutes-app/tests/e2e/api.spec.ts:34:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 500
    at /home/ubuntu/meeting-minutes-app/tests/e2e/api.spec.ts:38:31
```

# Test source

```ts
   1 | // tests/e2e/api.spec.ts
   2 | import { test, expect } from '@playwright/test';
   3 |
   4 | test.describe('API Endpoint Tests', () => {
   5 |   const BASE_URL = 'http://localhost:3000/api';
   6 |
   7 |   test('GET /api/download/[documentId] should return 404 for non-existent document', async ({ request }) => {
   8 |     const response = await request.get(`${BASE_URL}/download/nonexistentdoc123`);
   9 |     expect(response.status()).toBe(404);
  10 |     const jsonResponse = await response.json();
  11 |     expect(jsonResponse.error).toBe('Document not found or expired.');
  12 |   });
  13 |
  14 |   // Test for /api/upload (requires form-data, more complex to mock fully without a running app)
  15 |   // This test will check if the endpoint exists and returns an expected error for a GET request (as it expects POST)
  16 |   test('GET /api/upload should return method not allowed or specific error', async ({ request }) => {
  17 |     const response = await request.get(`${BASE_URL}/upload`);
  18 |     expect(response.status()).toBe(405); // Or 400/500 depending on implementation if GET is not handled
  19 |   });
  20 |
  21 |   test('POST /api/upload without file should return error', async ({ request }) => {
  22 |     const response = await request.post(`${BASE_URL}/upload`, {
  23 |       // Sending an empty form data or incorrect data to trigger error handling
  24 |       multipart: {
  25 |         // no file part
  26 |       }
  27 |     });
  28 |     expect(response.status()).toBe(400); // Expecting a Bad Request or similar error
  29 |     const jsonResponse = await response.json();
  30 |     expect(jsonResponse.error).toBe('No file uploaded.');
  31 |   });
  32 |
  33 |
  34 |   test('POST /api/process without required data should return error', async ({ request }) => {
  35 |     const response = await request.post(`${BASE_URL}/process`, {
  36 |       data: {},
  37 |     });
> 38 |     expect(response.status()).toBe(400);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  39 |     const jsonResponse = await response.json();
  40 |     expect(jsonResponse.error).toBeDefined(); // Check for any error message
  41 |   });
  42 |
  43 |   test('POST /api/process-audio without required data should return error', async ({ request }) => {
  44 |     const response = await request.post(`${BASE_URL}/process-audio`, {
  45 |       data: {},
  46 |     });
  47 |     expect(response.status()).toBe(400);
  48 |     const jsonResponse = await response.json();
  49 |     expect(jsonResponse.error).toBeDefined(); // Check for any error message
  50 |   });
  51 |
  52 |   // Placeholder for a successful /api/process-audio call (would require mocking or a live Python service)
  53 |   test.skip('POST /api/process-audio with valid data (mocked)', async ({ request }) => {
  54 |     // This test would require mocking the Python service interaction
  55 |     // For now, it's skipped as it depends on external setup or more complex mocking
  56 |     const response = await request.post(`${BASE_URL}/process-audio`, {
  57 |       data: {
  58 |         filePath: '/path/to/mock/audio.mp3', // This path would be on the server
  59 |         language: 'en'
  60 |       },
  61 |     });
  62 |     // expect(response.ok()).toBeTruthy();
  63 |     // const jsonResponse = await response.json();
  64 |     // expect(jsonResponse.transcript).toBeDefined();
  65 |   });
  66 |
  67 | });
  68 |
  69 |
```