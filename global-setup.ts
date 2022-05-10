// global-setup.ts
import { LoginPage } from './e2e-playwright/page/LoginPage';
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.setup();
  await browser.close();
}

export default globalSetup;
