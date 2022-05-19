import { Locator, Page, TestInfo } from '@playwright/test';
import { Urls } from '../../shared/SharedConfig';

export interface StaffData {
  name?: string,
  email?: string,
  bio?: string,
  website?: string,
  location?: string,
  slug?: string
}

export class StaffPage {
  readonly page: Page;
  readonly testInfo: TestInfo;
  readonly settings: Locator;
  readonly yourProfile: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly location: Locator;
  readonly website: Locator;
  readonly bio: Locator;
  readonly save: Locator;
  readonly saved: Locator;
  readonly retry: Locator;
  readonly twitter: Locator;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
    this.settings = page.locator('div[class="flex-auto flex items-center"]');
    this.yourProfile = page.locator('a:has-text("Your Profile")');
    this.name = page.locator('input[id="user-name"]');
    this.email = page.locator('input[id="user-email"]');
    this.location = page.locator('input[id="user-location"]');
    this.website = page.locator('input[id="user-website"]');
    this.bio = page.locator('textarea[id="user-bio"]');
    this.save = page.locator('button:has-text("Save")');
    this.saved = page.locator('button:has-text("Saved")');
    this.retry = page.locator('button:has-text("Retry")');
    this.twitter = page.locator('input[id="user-twitter"]');
  }

  async open() {
    await this.page.goto(Urls.dashboard, { waitUntil: 'networkidle' });
    await this.settings.click();
    await this.yourProfile.click();
  }

  async editStaff(fields: StaffData): Promise<boolean> {
    await this.fillValues(fields);
    let watchdog = [
      this.retry.elementHandle({ timeout: 5000 }),
      this.saved.elementHandle({ timeout: 5000 }),
    ]
    await this.save.click();
    let result = await Promise.race(watchdog)
    let text = await result?.innerText()
    if (text) {
      if (text.includes('Saved')) {
        return true;
      } else if (text.includes('Retry')) {
        return false;
      } else {
        throw new Error('Unknown error');
      }
    } else {
      throw new Error('Timeout, not saved nor retry');
    }
  }

  async fillValues(fields: StaffData): Promise<void> {
    let entries = Object.entries(fields);
    for (let [key, value] of entries) {
      // @ts-ignore
      let locator = this[key];
      if (locator) {
        await locator.fill('');
        await locator.fill(value);
      }
    }
  }
}
