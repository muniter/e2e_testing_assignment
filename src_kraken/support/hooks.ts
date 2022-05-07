import { KrakenWorld } from "./support";
import { After, Before } from '@cucumber/cucumber';
import { WebClient } from 'kraken-node';
import type { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';


Before(async function(this: KrakenWorld) {
  this.deviceClient = new WebClient('chrome', {}, this.userId);
  this.driver = await this.deviceClient.startKrakenForUserId(this.userId);
  this.testId = this.userId;
  let browser = await this.driver.getPuppeteer();
  let pages = await browser.pages();
  this.browser = browser;
  if (pages.length > 0) {
    this.page = pages.pop() as Page;
  } else {
    throw new Error('No pages found');
  }
  this.page.setDefaultTimeout(10000);
})

After(async function(this: KrakenWorld) {
  await this.deviceClient.stopKrakenForUserId(this.userId);
});
