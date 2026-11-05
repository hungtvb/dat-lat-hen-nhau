import {defineConfig,devices} from '@playwright/test';

const baseURL=process.env.STAGING_WEB_ORIGIN;
if(!baseURL || !/^https:\/\//.test(baseURL)) throw new Error('STAGING_WEB_ORIGIN must be an HTTPS origin');
export default defineConfig({
  testDir:'./tests/remote',
  timeout:60000,
  retries:0,
  workers:1,
  use:{...devices['Desktop Chrome'],baseURL,trace:'off',screenshot:'off'}
});
