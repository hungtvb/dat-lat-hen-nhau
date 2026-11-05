import {test, expect} from '@playwright/test';

const API = 'http://127.0.0.1:2567/api/rooms';
const ALLOWED = 'https://staging.example.test';
const BLOCKED = 'https://untrusted.example.test';

test('room creation preflight accepts only the configured frontend origin', async ({request}) => {
  const allowed = await request.fetch(API, {
    method:'OPTIONS', headers:{Origin:ALLOWED,'Access-Control-Request-Method':'POST'}
  });
  expect(allowed.status()).toBe(204);
  expect(allowed.headers()['access-control-allow-origin']).toBe(ALLOWED);
  expect(allowed.headers()['access-control-allow-methods']).toContain('POST');

  const denied = await request.fetch(API, {
    method:'OPTIONS', headers:{Origin:BLOCKED,'Access-Control-Request-Method':'POST'}
  });
  expect(denied.status()).toBe(403);
  expect(denied.headers()['access-control-allow-origin']).toBeUndefined();
});

test('room creation HTTP endpoint blocks untrusted browser origins', async ({request}) => {
  const denied = await request.post(API,{headers:{Origin:BLOCKED}});
  expect(denied.status()).toBe(403);
  const allowed = await request.post(API,{headers:{Origin:ALLOWED}});
  expect(allowed.status()).toBe(201);
  expect(allowed.headers()['access-control-allow-origin']).toBe(ALLOWED);
  // Do not print invite credentials in CI output.
});
