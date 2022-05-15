// global-setup.ts
import * as fs from 'fs';
import { LoginPage } from './e2e-playwright/page/LoginPage';
import { chromium, FullConfig } from '@playwright/test';
import { startGhost } from './shared/runner';
import { VISUAL_REGRESSION_TESTING, VERSION } from './shared/SharedConfig';

async function globalSetup(config: FullConfig) {
  if (VISUAL_REGRESSION_TESTING) {
    try {
      fs.rmSync(`./screenshots/playwright/${VERSION}`, { recursive: true, force: true });
    } catch (e) { }
  } else {
    // Setup ghost once only when not on VRT
    await startGhost();
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.setup();
    await browser.close();
  }
}

export default globalSetup;
