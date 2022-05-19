// global-setup.ts
import * as fs from 'fs';
import { chromium, FullConfig, TestInfo } from '@playwright/test';
import { VISUAL_REGRESSION_TESTING, VERSION } from './shared/SharedConfig';
import { startGhostAndSetup } from './e2e-playwright/util/util';
import { LoginPage } from './e2e-playwright/page/LoginPage';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const loginPage = new LoginPage(page, { title: '__ignore__' } as TestInfo);
      await loginPage.open();
      await loginPage.login();
      await page.context().storageState({ path: 'storageState.json' });

  if (VISUAL_REGRESSION_TESTING) {
    try {
      fs.rmSync(`./screenshots/playwright/${VERSION}`, { recursive: true, force: true });
    } catch (e) { }
  } else {
    // Setup ghost once only when not on VRT
    await startGhostAndSetup();
  }
}

export default globalSetup;
