import * as fs from 'fs';
import { LoginPage } from '../page/LoginPage';
import { chromium, FullConfig } from '@playwright/test';
import { startGhost } from '../shared/runner';

export function deleteCreateDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir);
}

export async function siteSetup() {
  await startGhost();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.setup();
  await browser.close();
}
