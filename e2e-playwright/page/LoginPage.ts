import type { Page } from '@playwright/test';
import { site } from '../data/testData';

let adminDashboard = site.url + '/ghost/#/dashboard';

export class LoginPage {
  readonly page: Page;
  private attempts: number = 3;

  constructor(page: Page) {
    this.page = page;
  }

  async open() {
    await this.page.goto(site.url + '/ghost/#/signin', { waitUntil: 'networkidle' });
  }

  async login(email: string, password: string) {
    let attempts = 0;
    while (attempts < this.attempts) {
      try {
      attempts++;
      await this._login(email, password);
      } catch (e) { }
    }
  }

  async setup(email: string, password: string) {
      // Check if we need to create a new user
    if (this.page.url().includes('setup')) {
      await this.page.waitForSelector('input[id="blog-title"]');
      const input = await this.page.$('input[id="blog-title"]')
      await input?.type(site.blogTitle);
      const name = await this.page.$('input[id="name"]')
      await name?.type(site.ghostTitle);
      const emailInput = await this.page.$('input[id="email"]')
      await emailInput?.type(email);
      const passwordInput = await this.page.$('input[id="password"]')
      await passwordInput?.type(password);
      const submit = await this.page.$('button[type="submit"]')
      let p = this.page.waitForNavigation()
      await submit?.click();
      await p;
    }
  }

  private async _login(email: string, password: string, only_setup: boolean = false) {
    let curr_url = this.page.url();
    if (curr_url.includes('setup')) {
      this.setup(email, password);
    } else if (curr_url.includes('signin')) {
      // Just log in
      if (only_setup) {
        return;
      }
      await this.page.waitForSelector('input[type="email"]');
      await this.page.type('input[type="email"]', email);
      await this.page.type('input[type="password"]', password);
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
    await this.page.goto(adminDashboard, { waitUntil: 'networkidle' });
    return this.page.url().includes('dashboard');
  }
}


