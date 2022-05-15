import type { Page, TestInfo } from '@playwright/test';
import { Urls, SiteConfig } from '../../shared/SharedConfig';
import { takeScreenshot } from '../util/util';

export class LoginPage {
  readonly page: Page;
  private attempts: number = 3;
  private testInfo: TestInfo|undefined;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
  }

  async open() {
    await this.page.goto(Urls.signin, { waitUntil: 'networkidle' });
    await takeScreenshot(this.page, this.testInfo, 'open_login_page');
  }

  async login() {
    let attempts = 0;
    while (attempts < this.attempts) {
      try {
        attempts++;
        await this._login();
      } catch (e) { }
    }
  }

  async setup() {
    // Check if we need to create a new user
    await this.page.waitForLoadState('networkidle');
    let curr_url = this.page.url();
    if (curr_url.includes('one')) {
      await this.page.locator("section > a[href='#/setup/two/']").click();
    }
    if (this.page.url().includes('setup')) {
      await this.page.waitForSelector('input[id="blog-title"]');
      await takeScreenshot(this.page, this.testInfo, 'setup_page');
      const input = await this.page.$('input[id="blog-title"]')
      await input?.type(SiteConfig.siteTitle);
      const name = await this.page.$('input[id="name"]')
      await name?.type(SiteConfig.name);
      const emailInput = await this.page.$('input[id="email"]')
      await emailInput?.type(SiteConfig.email);
      const passwordInput = await this.page.$('input[id="password"]')
      await passwordInput?.type(SiteConfig.password);
      const submit = await this.page.$('button[type="submit"]')
      let p = this.page.waitForNavigation()
      await submit?.click();
      await p;
    }
  }

  private async _login(only_setup: boolean = false) {
    let curr_url = this.page.url();
    if (curr_url.includes('setup')) {
      this.setup();
    } else if (curr_url.includes('signin')) {
      // Just log in
      if (only_setup) {
        return;
      }
      await this.page.waitForSelector('input[type="email"]');
      await this.page.type('input[type="email"]', SiteConfig.email);
      await this.page.type('input[type="password"]', SiteConfig.password);
      let p = this.page.waitForNavigation()
      await this.page.click('button[type="submit"]');
      await p;
    } else if (curr_url.includes('dashboard')) {
      return
    } else {
      throw new Error('Failed logging in');
    }
  }

  async userIsLoggedIn(): Promise<boolean> {
    await this.page.goto(Urls.dashboard, { waitUntil: 'networkidle' });
    return this.page.url().includes('dashboard');
  }
}


