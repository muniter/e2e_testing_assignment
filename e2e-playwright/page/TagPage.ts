import { Locator, Page, TestInfo } from '@playwright/test';
import { Urls } from '../../shared/SharedConfig';

export interface TagData {
  name?: string,
  slug?: string,
  color?: string,
  description?: string,
  metaTitle?: string,
  metaDescription?: string,
  canonicalUrl?: string,
  twitterTitle?: string,
  twitterDescription?: string,
  facebookTitle?: string,
  facebookDescription?: string,
}

export class TagPage {
  readonly page: Page;
  readonly testInfo: TestInfo;
  readonly name: Locator;
  readonly slug: Locator;
  readonly color: Locator;
  readonly description: Locator;
  readonly expandButtons: Locator;
  readonly twitterTitle: Locator;
  readonly twitterDescription: Locator;
  readonly facebookTitle: Locator;
  readonly facebookDescription: Locator;
  readonly metaTitle: Locator
  readonly metaDescription: Locator
  readonly canonicalUrl: Locator
  readonly save: Locator;
  readonly saved: Locator;
  readonly retry: Locator;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;

    this.name = page.locator('#tag-name');
    this.slug = page.locator('#tag-slug');
    this.color = page.locator('.input-color').locator('input[type="text"]');
    this.description = page.locator('#tag-description');
    this.twitterTitle = page.locator('#twitter-title');
    this.twitterDescription = page.locator('#twitter-description');
    this.facebookTitle = page.locator('#meta-title');
    this.facebookDescription = page.locator('#og-description');
    this.metaDescription = page.locator('#meta-description');
    this.metaTitle = page.locator('#og-title');
    this.canonicalUrl = page.locator('#canonical-url');
    this.save = page.locator('button:has-text("Save")');
    this.saved = page.locator('button:has-text("Saved")');
    this.retry = page.locator('button:has-text("Retry")');
    this.expandButtons = page.locator('.gh-btn-expand');
  }

  async open() {
    await this.page.reload({ waitUntil: 'networkidle' });
    await this.page.goto(Urls.main + "/ghost/#/tags/new", { waitUntil: 'networkidle' });
  }

  async createTag(fields: TagData): Promise<boolean> {
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

  async fillValues(fields: TagData): Promise<void> {
    let entries = Object.entries(fields);
    console.log('The data', JSON.stringify(fields));
    let buttons = await this.page.$$('.gh-btn-expand');
    for (const button of buttons) {
      await button.click();
    }
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
