import {defineConfig, devices} from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 0,
  use: {...devices['Desktop Chrome'], baseURL:'http://127.0.0.1:5173'},
  webServer: [
    {command:'npm run dev:server', url:'http://127.0.0.1:2567/health',env:{ALLOWED_ORIGINS:'http://127.0.0.1:5173,https://staging.example.test'},reuseExistingServer:!process.env.CI,timeout:35000},
    {command:'npm run dev:web',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI,timeout:35000}
  ]
});
