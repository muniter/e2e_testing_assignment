const getPuppeteerPage = async (driver) => {
  let browser = await driver.getPuppeteer();
  let pages = await browser.pages();
  return pages[0];
}

module.exports = {
  getPuppeteerPage
}
