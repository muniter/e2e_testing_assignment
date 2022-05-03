const { Given, When, Then } = require('@cucumber/cucumber');
const { faker } = require('@faker-js/faker');
const UserPassword = process.env.GHOST_PASSWORD || 'Very_Strong1!';
const UserEmail = process.env.GHOST_EMAIL || 'tester@tester.com';

const getPuppeteerPage = async (driver) => {
  let browser = await driver.getPuppeteer();
  let pages = await browser.pages();
  return pages[0];
}

const buttons = {
  "sign-in": 'button[type="submit"]',
  "members-menu-item": 'a[href="#/members/"]',
  "members-menu-new": 'a[href="#/members/new/"]',
  "save-member": "//button/span[contains(., 'Save')]",
}

const generators = {
  "|FAKE_NAME|": faker.name.findName,
  "|FAKE_EMAIL|": faker.internet.email,
  "|FAKE_PARAGRAPH|": faker.lorem.paragraph,
}

const savedGenerators = {
}

const replaceWithGeneratedValue = (text, generated) => {
  if (!generated) throw new Error("No generated value provided");
  if (!text) throw new Error("No text value provided");
  generated = savedGenerators[generated];
  if (!generated) throw new Error("No saved generated value for " + generated);
  return text.replace(/\{\}/g, generated);
}

const Selectors = {
  "member-list-names": "//h3[contains(., '{}')]",
  "member-create-retry": "//button[contains(., 'Retry')]",
}

When('I login', async function() {
  let page = await getPuppeteerPage(this.driver);
  await page.goto('http://localhost:9333/ghost/#/signin');
  let element;
  element = await this.driver.$('input[type="email"]');
  await element.setValue(UserEmail);
  element = await this.driver.$('input[type="password"]');
  await element.setValue(UserPassword);
  element = await this.driver.$(buttons["sign-in"]);
  return await element.click();
});

When('I go back', async function() {
  return await this.driver.back();
})

When('I enter the email', async function() {
  let element = await this.driver.$('input[type="email"]');
  return await element.setValue(UserEmail);
});

When('I enter the password', async function() {
  let element = await this.driver.$('input[type="password"]');
  return await element.setValue(UserPassword);
});

When('I click {string}', async function(selectorName) {
  let selector = buttons[selectorName];
  if (!selector) {
    throw new Error(`Unknown selectorName key: ${selectorName}`);
  }
  let element;
  if (selectorName.startsWith('/')) {
    element = await this.driver.$x(selector);
  } else {
    element = await this.driver.$(selector);
  }
  return await element.click();
});

When('I enter the member {string} {string}', async function(selectorName, value) {
  const selectors = {
    newMember: 'a:has-text("New Member")',
    name: 'input[id="member-name"]',
    email: 'input[id="member-email"]',
    notes: 'textarea[id="member-note"]',
  }
  let selector = selectors[selectorName];
  if (!selector) {
    throw new Error(`Unknown selectorName key: ${selectorName}`);
  }
  let element;
  if (selectorName.startsWith('/')) {
    element = await this.driver.$x(selector);
  }
  else {
    element = await this.driver.$(selector);
  }
  if (value.startsWith('|')) {
    // Extract the numbers from the end of value
    // Check if it exists in savedGenerators
    // If not, generate a new value
    let genValue = savedGenerators[value];
    if (!genValue) {
      genValue = generators[value.replace(/\d+$/, "")]();
      savedGenerators[value] = genValue;
    }
    value = genValue;
  }
  return await element.setValue(value);
});

Then('I should see {string} in {string}', async function(value, selectorName) {
  console.log('The generated values', savedGenerators);
  let selector = Selectors[selectorName];
  if (!selector) {
    throw new Error(`Unknown selectorName key: ${selectorName}`);
  }
  let element;
  if (selector.includes('{}')) {
    selector = replaceWithGeneratedValue(selector, value);
  }
  if (selectorName.startsWith('/')) {
    element = await this.driver.$x(selector);
  } else {
    element = await this.driver.$(selector);
  }
  return await element.isDisplayed();
});

Then('I should see {string}', async function(selectorName) {
  let selector = Selectors[selectorName];
  if (!selector) {
    throw new Error(`Unknown selectorName key: ${selectorName}`);
  }
  let element;
  if (selectorName.startsWith('/')) {
    element = await this.driver.$x(selector);
  } else {
    element = await this.driver.$(selector);
  }
  return await element.isDisplayed();
})
