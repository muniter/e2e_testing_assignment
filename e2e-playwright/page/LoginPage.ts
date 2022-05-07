import type { Page } from '@playwright/test';
import { site } from '../data/testData';

let adminDashboard = site.url + '/ghost/#/dashboard';

export class LoginPage {
    readonly page: Page;

    constructor(page: Page) {
      this.page = page;
    }

  async login(email: string, password: string) {

    await this.page.goto(site.url + '/ghost/#/signin', { waitUntil: 'networkidle' });
    let curr_url = this.page.url();
  if (curr_url.includes('signin')) {
    // Just log in
    await this.page.waitForSelector('input[type="email"]');
    await this.page.type('input[type="email"]', email);
    await this.page.type('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
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
    

