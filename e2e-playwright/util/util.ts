import type { Page } from '@playwright/test'
import { VERSION, VISUAL_REGRESSION_TESTING } from '../../shared/SharedConfig';
import * as fs from 'fs';
import { LoginPage } from '../page/LoginPage';
import { chromium } from '@playwright/test';
import { startGhost } from '../../shared/runner';


let counter = 0;
let baseDir = `./screenshots/playwright/${VERSION}`
export async function takeScreenshot(page: Page, scenarioName: string, stepName?: string) {
  if (VISUAL_REGRESSION_TESTING) {
    counter++;
    await page.screenshot({ path: `${baseDir}/scenarios/${scenarioName}/steps/${String(counter).padStart(2, '0')}_${stepName}.png`, fullPage: true });
  }
}
export function deleteCreateDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir);
}

export async function VRTBeforeAll() {
  if (VISUAL_REGRESSION_TESTING) {
    await startGhost();
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.setup();
    await browser.close();
  }
}
