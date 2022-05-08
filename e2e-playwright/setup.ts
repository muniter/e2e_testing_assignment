import { Page } from '@playwright/test';
import { site, user } from './data/testData';

const setup = async (page: Page) => {
    await page.goto(site.url + '/ghost/#/signin', { waitUntil: 'networkidle' });
    let curr_url = page.url();
    if (curr_url.includes('setup')) {
      // Check if we need to create a new user
      await page.waitForSelector('input[id="blog-title"]');
      const input = await page.$('input[id="blog-title"]')
      await input?.type(site.blogTitle);
      const name = await page.$('input[id="name"]')
      await name?.type(site.ghostTitle);
      const emailInput = await page.$('input[id="email"]')
      await emailInput?.type(user.email);
      const passwordInput = await page.$('input[id="password"]')
      await passwordInput?.type(user.password);
      const submit = await page.$('button[type="submit"]')
      await submit?.click();
    } else if (curr_url.includes('signin') || curr_url.includes('dashboard')) {
      return;
    } else {
      throw new Error('Failed setting up Ghost');
    }
};
  
export default setup;
