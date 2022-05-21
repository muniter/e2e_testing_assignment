import type { Page, TestInfo } from '@playwright/test'
import { VERSION, VISUAL_REGRESSION_TESTING } from '../../shared/SharedConfig';
import { LoginPage } from '../page/LoginPage';
import { chromium } from '@playwright/test';
import { startGhost } from '../../shared/runner';
import { DataPoolType, ScenarioConfig } from './dataGenerator';


let counter = 0;
let baseDir = `./screenshots/playwright/${VERSION}`
export async function takeScreenshot(page: Page, testInfo?: TestInfo, stepName?: string) {
  if (!testInfo) {
    throw new Error('testInfo not provided');
  }

  let scenarioName = testInfo.title;
  if (VISUAL_REGRESSION_TESTING && testInfo.title !== '__ignore__') {
    let stepNumber = String(counter).padStart(3, '0')
    counter++;
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${baseDir}/${scenarioName}/${stepNumber}_${stepName}.png`, fullPage: true });
  }
}

export async function VRTBeforeAll() {
  if (VISUAL_REGRESSION_TESTING) {
    await startGhostAndSetup();
  }
}

export async function startGhostAndSetup() {
    await startGhost();
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const loginPage = new LoginPage(page, { title: '__ignore__' } as TestInfo);
    await loginPage.open();
    await loginPage.setup();
    await browser.close();
}

export type Cookie = {
  loggedIn: boolean,
  scenarios: ScenarioConfig[],
  pool: DataPoolType,
}

export function nameDataScenario(cookie: Cookie, counter: number) {
  let parts: string[] = []
  let multiple = cookie.scenarios.length > 1;
  let icounter = 1
  cookie.scenarios.forEach(scenario => {
    if (multiple) {
      parts.push(`S.${icounter}`)
      icounter++
    }
    parts.push(scenario.model.charAt(0).toUpperCase() + scenario.model.slice(1) + ':')
    parts.push(scenario.title)
    parts.push(`(${scenario.oracle ? '+' : '-'})`)
    parts.push('|')
  });
  if (parts[parts.length - 1] === '|') {
    parts.pop();
  }
  return `${counter}. [${cookie.pool}]: ${parts.join(' ')}`
}
