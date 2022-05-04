const UserPassword = process.env.GHOST_PASSWORD || 'Very_Strong1!';
const UserEmail = process.env.GHOST_EMAIL || 'tester@tester.com';

const getPuppeteerPage = async (driver) => {
  let browser = await driver.getPuppeteer();
  let pages = await browser.pages();
  return pages[0];
}

async function firstLogin(driver) {
  let page = await getPuppeteerPage(driver);
  await page.goto('http://localhost:9333/ghost/#/signin');
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
  await element.click();
  page.waitForNavigation();
  console.log('Ghost site setup complete');
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
  await page.goto('http://localhost:9333/ghost/#/signin');
  let watchdog = [
    page.waitForSelector('#login'),
    page.waitForSelector('input[id="blog-title"]')
  ]
  await Promise.race(watchdog)
  let title = await page.$('title')
  title = await title.evaluate(element => element.textContent);
  console.log('LOGIN The page url is: ' + page.url());
  console.log('LOGIN The page title is: ' + title);
  if (title.includes('Setup')) {
    console.log('first LOGIN');
    firstLogin(driver);
    await page.goto('http://localhost:9333/ghost/#/dashboard');
    await page.waitForNavigation();
    return;
  } else if (title.includes('Sign In')) {
    console.log('Normal LOGIN');
    return normalLogin(driver);
  } else {
    throw new Error('Already logged in');
  }
}

module.exports = {
  login,
}
