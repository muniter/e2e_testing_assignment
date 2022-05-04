const { After, Before } = require('@cucumber/cucumber');
const { WebClient } = require('kraken-node');


Before(async function() {
  this.deviceClient = new WebClient('chrome', {}, this.userId);
  this.driver = await this.deviceClient.startKrakenForUserId(this.userId);
  this.testId = this.userId;
  let browser = await this.driver.getPuppeteer();
  let pages = await browser.pages();
  this.page = pages[0];
  this.page.setDefaultTimeout(10000);
})

After(async function() {
  await this.deviceClient.stopKrakenForUserId(this.userId);
});
