const { Given, When, Then } = require('@cucumber/cucumber');
const { faker } = require('@faker-js/faker');
const login = require('./login');

const buttons = {
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
  return await login.login(this.driver);
});

When('I go back', async function() {
  return await this.driver.back();
})

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
