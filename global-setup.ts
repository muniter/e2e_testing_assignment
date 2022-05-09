// global-setup.ts
import { LoginPage } from './e2e-playwright/page/LoginPage';
import { user } from './e2e-playwright/data/testData';
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.setup(user.email, user.password);
  await browser.close();
}

export default globalSetup;
