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
  "|FAKE_PARAGRAPH|": () => faker.lorem.paragraph(1),
}
const SavedGeneratedValues = {}

const Selectors = {
  // Dashboard menu
  "dashborad/menu/member": 'a[href="#/members/"]',

  // Member functionality
  "member/list/new": 'a[href="#/members/new/"]',
  "member/list/name": "//h3[contains(., '{}')]",
  "member/list/email": "//p[contains(., '{}')]",
  // Edit fill
  "member/edit/fill/name": 'input[id="member-name"]',
  "member/edit/fill/email": 'input[id="member-email"]',
  "member/edit/fill/notes": 'textarea[id="member-note"]',
  // Actions
  "member/action/save": "//button/span[contains(., 'Save')]",
  "member/action/actions": "//button[./span/span[contains(., 'Actions')]]",
  "member/action/actions/delete": "//button/span[contains(., 'Delete member')]",
  // See
  "member/see/save-retry": "//button[contains(., 'Retry')]",
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
      await page.waitForXPath(selector, { timeout: 5000 })
    } else {
      await page.waitForSelector(selector, { timeout: 5000 })
    }
  }
  if (isxpath) {
    // Xpath
    result = await page.$x(selector);
    result = result.length > 0 ? result[0] : null;
  } else {
    // CSS
    result = await page.$(selector);
  }
  return result;
}

async function FillElement(page, wait, selector, value, clear) {
  if (page === undefined) throw new Error("No page provided");
  if (selector === undefined) throw new Error("No selector provided");
  if (value === undefined || value === null) throw new Error("No value provided");
  let element = await getElement(page, wait, selector, value);
  value = ValueTransform(value)
  if (element) {
    if (clear) {
      // Clear the element for later typing
      await element.evaluate((el) => { el.value = '' })
    }
    await element.type(value);
  } else {
    throw new Error(`Element not found: ${selector}`);
  }
}

function ValueTransform(value) {
  // Return if the value is not a string
  if (typeof value !== 'string') return value;
  // Check if value is a string
  if (value.startsWith('|')) {
    let generated_value = SavedGeneratedValues[value];
    if (!generated_value) {
      generator = ValueGenerators[value.replace(/\d+$/, "")]
      generated_value = generator();
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
    await NavigateTo(page, "dashboard");
    await page.waitForTimeout(1000);
    let element = await getElement(page, true, Selectors["dashborad/menu/member"]);
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
  "edit member": async (page, email) => {
    if (page.url().includes(Urls["members/list"])) {
      let element = await getElement(page, true, Selectors["member/list/email"], email);
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

async function NavigateTo(page, name, additional) {
  let target = Navigators[name];
  if (!target) {
    throw new Error(`Unknown section name: ${name}`);
  } else {
    return target(page, additional);
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

When(/I navigate to the "(.*?)" functionality(?:$|.*?"(.*?)")/, async function(name, additional) {
  console.log(`Navigate to the ${name} functionality ${additional}`)
  await NavigateTo(this.page, name, additional);
});

When(/I (fill|set) the ("(.*)?") ("(.*)?") to ("(.*)?")/, async function(verb, scope, selectorName, value) {
  if (scope === undefined) throw new Error("No scope provided");
  if (selectorName === undefined) throw new Error("No selector name provided");
  if (value === undefined) throw new Error("No value provided");
  let key = scope + '/edit/fill/' + selectorName;
  let selector = Selectors[key]
  if (selector === undefined) throw new Error(`Couldn't find selector for key ${key}`);
  await FillElement(this.page, true, selector, value, verb === 'set');
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


When('I delete the {string}', async function(scope) {
  if (scope === 'member') {
    // Press the action button first
    let selector = Selectors['member/action/actions']
    let element = await getElement(this.page, true, selector);
    element.click();
    // Press the delete button now
    selector = Selectors['member/action/actions/delete']
    element = await getElement(this.page, true, selector);
    await element.click();
    // Press enter to confirm the dialog
    return await this.page.keyboard.press('Enter');
  }
  throw new Error("Only member scope is supported");
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

Then('I should see member saving failed', async function() {
  let selector = Selectors["member/see/save-retry"];
  let element = await getElement(this.page, true, selector);
  if (element === null) throw new Error(`Couldn't find element with selector ${selector}`);
})

Then('I should not see the member with email {string} in the list', async function(email) {
  // NOTE: Page should be fully loaded before this step
  let selector = Selectors["member/list/email"];
  selector = ValueTransform(selector, email);
  // Wait for the element to be removed/hidden, it throws an exception if it's not
  await this.page.waitForXPath(selector, { hidden: true, timeout: 2000 });
})
