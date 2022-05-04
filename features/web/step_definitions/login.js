const UserPassword = process.env.GHOST_PASSWORD || 'Very_Strong1!';
const UserEmail = process.env.GHOST_EMAIL || 'tester@tester.com';
const Url = process.env.GHOST_URL || 'http://localhost:9333';
const Urls = {
  "signin": Url + "/ghost/#/signin/",
  "setup": Url + "/ghost/#/setup/",
  "dashboard": Url + "/ghost/#/dashboard/",
}

const getPuppeteerPage = async (driver) => {
  let browser = await driver.getPuppeteer();
  let pages = await browser.pages();
  return pages[0];
}

async function firstLogin(driver) {
  // Setup ghost for the first time, and log in.
  let page = await getPuppeteerPage(driver);
  await page.goto(Urls.signin);
  let element;
  await page.waitFor('input[id="blog-title"]');
  element = await page.$('input[id="blog-title"]')
  await element.type('Ghost Testing');
  element = await page.$('input[id="name"]')
  await element.type('Ghost Testing');
  element = await page.$('input[id="email"]')
  await element.type(UserEmail);
  element = await page.$('input[id="password"]')
  await element.type(UserPassword);
  element = await page.$('button[type="submit"]')
  await Promise.all([
    element.click(),
    page.waitForNavigation(),
  ]);
  console.log('Ghost site setup complete');
  page.goto(Urls.dashboard);
}

async function normalLogin(driver) {
  let element;
  element = await driver.$('input[type="email"]');
  await element.setValue(UserEmail);
  element = await driver.$('input[type="password"]');
  await element.setValue(UserPassword);
  element = await driver.$('button[type="submit"]');
  return element.click();
}

async function login(driver) {
  let page = await getPuppeteerPage(driver);
  let loginId = 'login'
  let SetupId = 'blog-title'
  await page.goto(Urls.signin);
  let watchdog = [
    page.waitForSelector("#" + loginId),
    page.waitForSelector("#" + SetupId),
  ]
  let relement = await Promise.race(watchdog)
  let idProp = await relement.getProperty('id')
  let id = await idProp.jsonValue()
  if (id === SetupId) {
    return firstLogin(driver);
  } else if (id === loginId) {
    return normalLogin(driver);
  } else {
    throw new Error('Already logged in');
  }
}

module.exports = {
  login,
}
