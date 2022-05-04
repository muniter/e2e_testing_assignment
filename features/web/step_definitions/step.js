const { Given, When, Then } = require('@cucumber/cucumber');
const { faker } = require('@faker-js/faker'); const Login = require('./login').login;
const Urls = require('./urls').Urls;

const buttons = {
  "members-menu-item": 'a[href="#/members/"]',
  "members-menu-new": 'a[href="#/members/new/"]',
  "save-member": "//button/span[contains(., 'Save')]",
}

const ValueGenerators = {
  "|FAKE_NAME|": faker.name.findName,
  "|FAKE_EMAIL|": faker.internet.email,
  "|FAKE_PARAGRAPH|": faker.lorem.paragraph,
}
const SavedGeneratedValues = {}

const Selectors = {
  "member-list-names": "//h3[contains(., '{}')]",
  "member-create-retry": "//button[contains(., 'Retry')]",

  // Member functionality
  "member/dashborad-menu-item": 'a[href="#/members/"]',
  "member/list/new": 'a[href="#/members/new/"]',
  "member/list/name": "//h3[contains(., '{}')]",
  "member/list/email": "//p[contains(., '{}')]",
  // Edit
  "members/edit/save": "//button/span[contains(., 'Save')]",
  "members/edit/save-retry": "//button[contains(., 'Retry')]",
  // Edit fill
  "member/edit/fill/name": 'input[id="member-name"]',
  "member/edit/fill/email": 'input[id="member-email"]',
  "member/edit/fill/notes": 'textarea[id="member-note"]',
  // Actions
  "member/action/save": "//button/span[contains(., 'Save')]",
}

const getElement = async (page, wait, selector, value) => {
  if (page === undefined) throw new Error("No page provided");
  if (selector === undefined) throw new Error("No selector provided");
  let isxpath = selector.startsWith("/");
  let result;
  if (value) {
    // TODO: Maybe this should be done somewhere else ?
    value = ValueTransform(value);
    selector = selector.replace(/\{\}/g, value);
  }
  console.log('=========================================')
  console.log(`Selector: ${selector}`)
  console.log(`Value: ${value}`)
  console.log(`Page: ${page}`)
  if (wait) {
    if (isxpath) {
      await page.waitForXPath(selector, { timeout: 100000 })
    } else {
      await page.waitForSelector(selector, { timeout: 100000 })
    }
  }
  if (isxpath) {
    // Xpath
    result = await page.$x(selector);
    result = result[0];
  } else {
    // CSS
    result = await page.$(selector);
  }
  return result;
}

async function FillElement(page, wait, selector, value) {
  if (page === undefined) throw new Error("No page provided");
  if (selector === undefined) throw new Error("No selector provided");
  if (value === undefined) throw new Error("No value provided");
  let element = await getElement(page, wait, selector, value);
  value = ValueTransform(value)
  if (element) {
    await element.type(value);
  } else {
    throw new Error(`Element not found: ${selector}`);
  }
}

function ValueTransform(value) {
  if (value.startsWith('|')) {
    let generated_value = SavedGeneratedValues[value];
    if (!generated_value) {
      generated_value = ValueGenerators[value.replace(/\d+$/, "")]();
      SavedGeneratedValues[value] = generated_value;
    }
    value = generated_value;
  }
  return value
}

const replaceWithGeneratedValue = (text, generated) => {
  if (!generated) throw new Error("No generated value provided");
  if (!text) throw new Error("No text value provided");
  generated = SavedGeneratedValues[generated];
  if (!generated) throw new Error("No saved generated value for " + generated);
  return text.replace(/\{\}/g, generated);
}

const Navigators = {
  member: async (page) => {
    await NavigateTo("dashboard", page);
    await page.waitForTimeout(1000);
    let element = await getElement(page, true, Selectors["member/dashborad-menu-item"]);
    return element.click();
  },
  "create member": async (page) => {
    if (page.url().includes(Urls["members/list"])) {
      let element = await getElement(page, true, Selectors["member/list/new"]);
      return element.click();
    } else {
      throw new Error("Not on members list page");
    }
  },
  dashboard: async (page) => {
    let url = page.url();
    if (url.includes(Urls.dashboard)) {
      return;
    } else {
      return page.goto(Urls.dashboard);
    }
  }
}

async function NavigateTo(name, page) {
  let target = Navigators[name];
  if (!target) {
    throw new Error(`Unknown section name: ${name}`);
  } else {
    return target(page);
  }
}

Given('I login', async function() {
  return await Login(this.driver);
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

When('I navigate to the {string} functionality', async function(functionalityName) {
  await NavigateTo(functionalityName, this.page);
});

When('I fill the {string} {string} to {string}', async function(scope, selectorName, value) {
  if (scope === undefined) throw new Error("No scope provided");
  if (selectorName === undefined) throw new Error("No selector name provided");
  if (value === undefined) throw new Error("No value provided");
  let key = scope + '/edit/fill/' + selectorName;
  let selector = Selectors[key]
  if (selector === undefined) throw new Error(`Couldn't find selector for key ${key}`);
  await FillElement(this.page, true, selector, value);
});

When('I {string} the {string}', async function(action, scope) {
  if (action === undefined) throw new Error("No scope provided");
  if (action === undefined) throw new Error("No action provided");
  let key = scope + '/action/' + action
  let selector = Selectors[key]
  if (selector === undefined) throw new Error(`Couldn't find selector for key ${key}`);
  let element = await getElement(this.page, true, selector);
  if (element === undefined) throw new Error(`Couldn't find element with selector ${selector}`);
  return await element.click();
});

Then('I should see the {string} {string} {string} in the {string}', async function(scope, selector_key, value, view) {
  // Pre validation
  if (scope === undefined) throw new Error("No scope provided");
  if (selector_key === undefined) throw new Error("No selector_key name provided");
  if (view === undefined) throw new Error("No view provided");

  // Find the actual selector
  let key = scope + '/' + view + '/' + selector_key;
  let selector = Selectors[key];
  if (selector === undefined) throw new Error(`Couldn't find selector for key ${key}`);

  // Find the element
  let element = await getElement(this.page, true, selector, value);
  if (element === undefined) throw new Error(`Couldn't find element with selector ${selector}`);

  // Get the element text and compare with value
  let text = await element.evaluate(element => element.textContent);
  if (!text === SavedGeneratedValues[value]) {
    throw new Error(`Expected ${value} but got ${text}`);
  }
})

Then('I should see {string} in {string}', async function(value, selectorName) {
  console.log('The generated values', SavedGeneratedValues);
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
