import { Urls, SiteConfig } from '../../SharedConfig';
import type { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';

async function firstLogin(page: Page) {
  // Setup ghost for the first time, and log in.
  await page.goto(Urls.signin);
  let element;
  await page.waitForSelector('input[id="blog-title"]');
  element = await page.$('input[id="blog-title"]')
  await element!.type(SiteConfig.siteTitle);
  element = await page.$('input[id="name"]')
  await element!.type('Ghost Testing');
  element = await page.$('input[id="email"]')
  await element!.type(SiteConfig.email);
  element = await page.$('input[id="password"]')
  await element!.type(SiteConfig.password);
  element = await page.$('button[type="submit"]')
  element!.click()
  let p = page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('Ghost site setup complete');
  await p;
  page.goto(Urls.dashboard);
}

async function normalLogin(page: Page) {
  let element;
  element = await page.$('input[type="email"]');
  // @ts-ignore
  await element!.type(SiteConfig.username);
  element = await page.$('input[type="password"]');
  // @ts-ignore
  await element!.type(SiteConfig.password);
  element = await page.$('button[type="submit"]');
  return element!.click();
}

export async function Login(page: Page) {
  let loginId = 'login'
  let SetupId = 'blog-title'
  await page.goto(Urls.signin);
  let watchdog = [
    page.waitForSelector("#" + loginId),
    page.waitForSelector("#" + SetupId),
  ]
  let relement = await Promise.race(watchdog)
  let idProp = await relement!.getProperty('id')
  let id = await idProp.jsonValue()
  if (id === SetupId) {
    return firstLogin(page);
  } else if (id === loginId) {
    return normalLogin(page);
  } else {
    throw new Error('Already logged in');
  }
}
