import { Given, When, Then } from '@cucumber/cucumber';
import { faker } from '@faker-js/faker';
import { Login } from './login';
import type { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';
import { KrakenWorld } from '../support/support';
import { ElementHandle } from 'puppeteer-core/lib/cjs/puppeteer/common/JSHandle';
const Urls = require('./urls').Urls;

const buttons: Record<string, string> = {
  "members-menu-item": 'a[href="#/members/"]',
  "members-menu-new": 'a[href="#/members/new/"]',
  "save-member": "//button/span[contains(., 'Save')]",
}

type ValueGeneratorCollection = {
  [key: string]: () => string
}

const ValueGenerators: ValueGeneratorCollection = {
  "|FAKE_NAME|": faker.name.findName,
  "|OBSCURED_NAME|": faker.name.firstName,
  "|FAKE_EMAIL|": faker.internet.email,
  "|FAKE_PARAGRAPH|": () => faker.lorem.paragraph(1),
} as const;
const SavedGeneratedValues: Record<string, string> = {};

type Foo = { [key: string]: string };

const Selectors: Foo = {
  // Dashboard menu
  "dashborad/menu/member": 'a[href="#/members/"]',

  // Member functionality
  "member/list/new": 'a[href="#/members/new/"]',
  "member/list/name": "//h3[contains(., '{}')]",
  "member/list/email": "//p[contains(., '{}')]",
  "member/list/fill/search": "input[placeholder='Search members...']",
  // Edit fill
  "member/edit/fill/name": 'input[id="member-name"]',
  "member/edit/fill/email": 'input[id="member-email"]',
  "member/edit/fill/notes": 'textarea[id="member-note"]',
  // Actions
  "member/action/save": "//button/span[contains(., 'Save')]",
  "member/action/retry save": "//span[normalize-space()='Retry']",
  "member/action/actions": "//button[./span/span[contains(., 'Actions')]]",
  "member/action/actions/delete": "//button/span[contains(., 'Delete member')]",
  // See
  "member/see/save-retry": "//button[contains(., 'Retry')]",
} as const

function GetSelector(selector: string): string {
  let res = Selectors[selector];
  if (!res) {
    throw new Error(`Couldn't find selector for key ${selector}`)
  }
  return res;
}

async function getElement(page: Page, wait: boolean, selector: string, value?: string): Promise<ElementHandle> {
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
  if (result == null) {
    throw new Error(`Element ${selector} not found`);
  } else {
    console.log('=========================================')
    console.log(`Selector: ${selector}`)
    console.log(`Value: ${value}`)
    console.log(`Page: ${page}`)
  }
  console.log(`Found: ${result}`)
  return result;
}

async function FillElement(page: Page, wait: boolean, selector: string, value: string, clear?: boolean) {
  let element = await getElement(page, wait, selector, value);
  value = ValueTransform(value)
  if (clear) {
    // @ts-ignore
    await element.evaluate((el) => { el.value = '' })
  }
  return element.type(value);
}

async function ClickElement(page: Page, wait: boolean, selector: string, value?: string): Promise<void> {
  let element = await getElement(page, wait, selector, value);
  return element.click();
}

function ValueTransform(value: string): string {
  if (value.startsWith('|')) {
    let generated_value = SavedGeneratedValues[value];
    if (generated_value) {
      value = generated_value;
    } else {
      let generator = ValueGenerators[value.replace(/\d+$/, "")]
      if (!generator) {
        throw new Error(`No value generator for ${value}`);
      }
      generated_value = generator();
      SavedGeneratedValues[value] = generated_value;
    }
  }
  return value
}

const Navigators: Record<string, Function> = {
  member: async (page: Page) => {
    if (!page.url().includes(Urls["members/list"])) {
      let p = page.waitForNavigation({ waitUntil: 'networkidle0' });
      NavigateTo(page, "dashboard");
      await p;  // Wait to move tho the dashboard
      p = page.waitForNavigation({ waitUntil: 'networkidle0' });
      ClickElement(page, true, GetSelector("dashborad/menu/member"));
      await p;
    }
  },
  "create member": async (page: Page) => {
    if (page.url().includes(Urls["members/list"])) {
      await ClickElement(page, true, GetSelector("member/list/new"));
    } else {
      throw new Error("Not on members list page");
    }
  },
  "edit member": async (page: Page, email: string) => {
    if (page.url().includes(Urls["members/list"])) {
      await ClickElement(page, true, GetSelector("member/list/email"), email);
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

When(/I navigate to the "(.*?)" functionality(?:$|.*?"(.*?)")/, async function(this: KrakenWorld, name: string, additional?: string) {
  console.log(`Navigate to the ${name} functionality ${additional}`)
  await NavigateTo(this.page, name, additional);
});

When(/I (fill|set) the ("(.*)?") ("(.*)?") to ("(.*)?")/, async function(this: KrakenWorld, verb: string, scope: string, selectorName: string, value: string) {
  let key = scope.replace(' ', '/') + '/fill/' + selectorName;
  let selector = GetSelector(key)
  let p = FillElement(this.page, true, selector, value, verb === 'set');
  if (selectorName === 'search') {
    await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
  }
  await p;
});

When('I {string} the {string}', async function(this: KrakenWorld, action: string, scope: string) {
  let key = scope + '/action/' + action
  await ClickElement(this.page, true, GetSelector(key));
});


When('I delete the {string}', async function(this: KrakenWorld, scope: string) {
  if (scope === 'member') {
    // Press the action button first
    await ClickElement(this.page, true, GetSelector("member/action/actions"));
    // Press the delete button now
    await ClickElement(this.page, true, GetSelector("member/action/actions/delete"));
    // Press enter to confirm the dialog
    let p = this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    this.page.keyboard.press('Enter');
    return p;
  }
  throw new Error("Only member scope is supported");
});


Then('I should see the {string} {string} {string} in the {string}', async function(this: KrakenWorld, scope: string, selector_key: string, value: string, view: string) {
  // Find the actual selector
  let key = scope + '/' + view + '/' + selector_key;
  let selector = GetSelector(key);
  if (selector === undefined) throw new Error(`Couldn't find selector for key ${key}`);

  // TODO: Get element error by default, always return an element
  let element = await getElement(this.page, true, selector, value);
  value = ValueTransform(value);

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
