import { Given, When, Then } from '@cucumber/cucumber';
import { faker } from '@faker-js/faker';
import { Login } from './login';
import type { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';
import { KrakenWorld } from '../support/support';
const Urls = require('./urls').Urls;

const buttons: Record<string, string> = {
  "members-menu-item": 'a[href="#/members/"]',
  "members-menu-new": 'a[href="#/members/new/"]',
  "save-member": "//button/span[contains(., 'Save')]",
}

const ValueGenerators: Record<string, Function> = {
  "|FAKE_NAME|": faker.name.findName,
  "|FAKE_EMAIL|": faker.internet.email,
  "|FAKE_PARAGRAPH|": () => faker.lorem.paragraph(1),
}
const SavedGeneratedValues: Record<string, string> = {};

type Foo = { [key: string]: string };

const Selectors: Foo = {
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

function GetSelector (selector: string): string {
  let res = Selectors[selector];
  if (!res) {
    throw new Error(`Selector ${selector} not found`);
  }
  return res;
}

const getElement = async (page: Page, wait: boolean, selector: string, value?: string) => {
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

async function FillElement(page: Page, wait: boolean, selector: string, value?: string, clear?: boolean) {
  if (page === undefined) throw new Error("No page provided");
  if (selector === undefined) throw new Error("No selector provided");
  if (value === undefined || value === null) throw new Error("No value provided");
  let element = await getElement(page, wait, selector, value);
  value = ValueTransform(value)
  if (element) {
    if (clear) {
      // @ts-ignore
      await element.evaluate((el) => { el.value = '' })
    }
    await element.type(value);
  } else {
    throw new Error(`Element not found: ${selector}`);
  }
}

function ValueTransform(value: string): string {
  // Return if the value is not a string
  if (typeof value !== 'string') return value;
  // Check if value is a string
  if (value.startsWith('|')) {
    let generated_value: string|undefined = SavedGeneratedValues[value];
    if (!generated_value) {
      let generator = ValueGenerators[value.replace(/\d+$/, "")]
      if (!generator) {
        throw new Error(`No value generator for ${value}`);
      }
      generated_value = generator();
      if (generated_value) {
        SavedGeneratedValues[value] = generated_value;
        value = generated_value;
      }
    }
  }
  return value
}

const Navigators: Record<string, Function> = {
  member: async (page: Page) => {
    await NavigateTo(page, "dashboard");
    await page.waitForTimeout(1000);
    let element = await getElement(page, true, GetSelector("dashborad/menu/member"));
    if (element) {
      await element.click();
    }
  },
  "create member": async (page: Page) => {
    if (page.url().includes(Urls["members/list"])) {
      let element = await getElement(page, true, GetSelector("member/list/new"));
      if (element) {
        await element.click();
      }
    } else {
      throw new Error("Not on members list page");
    }
  },
  "edit member": async (page: Page, email: string) => {
    if (page.url().includes(Urls["members/list"])) {
      let element = await getElement(page, true, GetSelector("member/list/email"), email);
      if (element) {
        return element.click();
      }
    } else {
      throw new Error("Not on members list page");
    }
  },
  dashboard: async (page: Page) => {
    let url = page.url();
    if (url.includes(Urls.dashboard)) {
      return;
    } else {
      return page.goto(Urls.dashboard);
    }
  }
}

async function NavigateTo(page: Page, name: string, additional?: string) {
  let target = Navigators[name];
  if (!target) {
    throw new Error(`Unknown section name: ${name}`);
  } else {
    return target(page, additional);
  }
}

Given('I login', async function(this: KrakenWorld,) {
  return await Login(this.page);
});

When('I go back', async function(this: KrakenWorld,) {
  return this.driver.back();
})

When('I click {string}', async function(this: KrakenWorld, selectorName: string) {
  let selector = buttons[selectorName];
  if (!selector) {
    throw new Error(`Unknown selectorName key: ${selectorName}`);
  }
  let element;
  if (selectorName.startsWith('/')) {
    let elements = await this.page.$x(selector);
    if (elements.length > 0) {
      element = elements[0];
    }
  } else {
    element = await this.page.$(selector);
  }
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element.click();
});

When(/I navigate to the "(.*?)" functionality(?:$|.*?"(.*?)")/, async function(this: KrakenWorld, name: string, additional?: string) {
  console.log(`Navigate to the ${name} functionality ${additional}`)
  await NavigateTo(this.page, name, additional);
});

When(/I (fill|set) the ("(.*)?") ("(.*)?") to ("(.*)?")/, async function(this: KrakenWorld, verb: string, scope: string, selectorName: string, value: string) {
  if (scope === undefined) throw new Error("No scope provided");
  if (selectorName === undefined) throw new Error("No selector name provided");
  if (value === undefined) throw new Error("No value provided");
  let key = scope + '/edit/fill/' + selectorName;
  let selector = GetSelector(key)
  if (selector === undefined) throw new Error(`Couldn't find selector for key ${key}`);
  await FillElement(this.page, true, selector, value, verb === 'set');
});

When('I {string} the {string}', async function(this: KrakenWorld, action: string, scope: string) {
  if (action === undefined) throw new Error("No scope provided");
  if (action === undefined) throw new Error("No action provided");
  let key = scope + '/action/' + action
  let selector = GetSelector(key)
  if (selector === undefined) throw new Error(`Couldn't find selector for key ${key}`);
  let element = await getElement(this.page, true, selector);
  if (element === undefined) throw new Error(`Couldn't find element with selector ${selector}`);
  if (element) {
    return await element.click();
  }
});


When('I delete the {string}', async function(this: KrakenWorld, scope: string) {
  if (scope === 'member') {
    // Press the action button first
    let selector = GetSelector("member/action/actions")
    let element = await getElement(this.page, true, selector);
    if (element) {
      await element.click();
    }
    // Press the delete button now
    selector = GetSelector("member/action/actions/delete")
    element = await getElement(this.page, true, selector);
    if (element) {
      await element.click();
    }
    // Press enter to confirm the dialog
    return await this.page.keyboard.press('Enter');
  }
  throw new Error("Only member scope is supported");
});


Then('I should see the {string} {string} {string} in the {string}', async function(this: KrakenWorld, scope: string, selector_key: string, value: string, view: string) {
  // Find the actual selector
  let key = scope + '/' + view + '/' + selector_key;
  let selector = GetSelector(key);
  if (selector === undefined) throw new Error(`Couldn't find selector for key ${key}`);

  // Find the element
  let element = await getElement(this.page, true, selector, value);
  if (element === undefined) throw new Error(`Couldn't find element with selector ${selector}`);

  // Get the element text and compare with value
  if (element) {
    let text = await element.evaluate(element => element.textContent);
    if (text !== value) {
      throw new Error(`Expected ${value} but got ${text}`);
    }
  } else {
    throw new Error(`Couldn't find element with selector ${selector}`);
  }
})

Then('I should see member saving failed', async function(this: KrakenWorld,) {
  let selector = GetSelector("member/see/save-retry");
  let element = await getElement(this.page, true, selector);
  if (element === null) throw new Error(`Couldn't find element with selector ${selector}`);
})

Then('I should not see the member with email {string} in the list', async function(this: KrakenWorld, email: string) {
  // NOTE: Page should be fully loaded before this step
  let selector = GetSelector("member/list/email");
  selector = selector.replace(/\{\}/g, email);
  // Wait for the element to be removed/hidden, it throws an exception if it's not
  await this.page.waitForXPath(selector, { hidden: true, timeout: 2000 });
})
