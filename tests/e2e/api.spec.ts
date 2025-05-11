// tests/e2e/api.spec.ts
import { test, expect } from '@playwright/test';

test.describe('API Endpoint Tests', () => {
  const BASE_URL = 'http://localhost:3000/api';

  test('GET /api/download/[documentId] should return 404 for non-existent document', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/download/nonexistentdoc123`);
    expect(response.status()).toBe(404);
    const jsonResponse = await response.json();
    expect(jsonResponse.error).toBe('Document not found or expired.');
  });

  // Test for /api/upload (requires form-data, more complex to mock fully without a running app)
  // This test will check if the endpoint exists and returns an expected error for a GET request (as it expects POST)
  test('GET /api/upload should return method not allowed or specific error', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/upload`);
    expect(response.status()).toBe(405); // Or 400/500 depending on implementation if GET is not handled
  });

  test('POST /api/upload without file should return error', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/upload`, {
      // Sending an empty form data or incorrect data to trigger error handling
      multipart: {
        // no file part
      }
    });
    expect(response.status()).toBe(400); // Expecting a Bad Request or similar error
    const jsonResponse = await response.json();
    expect(jsonResponse.error).toBe('No file uploaded.');
  });


  test('POST /api/process without required data should return error', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/process`, {
      data: {},
    });
    expect(response.status()).toBe(400);
    const jsonResponse = await response.json();
    expect(jsonResponse.error).toBeDefined(); // Check for any error message
  });

  test('POST /api/process-audio without required data should return error', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/process-audio`, {
      data: {},
    });
    expect(response.status()).toBe(400);
    const jsonResponse = await response.json();
    expect(jsonResponse.error).toBeDefined(); // Check for any error message
  });

  // Placeholder for a successful /api/process-audio call (would require mocking or a live Python service)
  test.skip('POST /api/process-audio with valid data (mocked)', async ({ request }) => {
    // This test would require mocking the Python service interaction
    // For now, it's skipped as it depends on external setup or more complex mocking
    const response = await request.post(`${BASE_URL}/process-audio`, {
      data: {
        filePath: '/path/to/mock/audio.mp3', // This path would be on the server
        language: 'en'
      },
    });
    // expect(response.ok()).toBeTruthy();
    // const jsonResponse = await response.json();
    // expect(jsonResponse.transcript).toBeDefined();
  });

});

