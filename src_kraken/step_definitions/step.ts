import { Given, When, Then } from '@cucumber/cucumber';
import { faker } from '@faker-js/faker';
import { Login } from './login';
import type { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';
import { KrakenWorld } from '../support/support';
import { ElementHandle } from 'puppeteer-core/lib/cjs/puppeteer/common/JSHandle';
const Urls = require('./urls').Urls;

type ValueGeneratorCollection = {
  [key: string]: () => string
}

const ValueGenerators: ValueGeneratorCollection = {
  "|FAKE_NAME|": faker.name.findName,
  "|OBSCURED_NAME|": faker.name.firstName,
  "|FAKE_EMAIL|": faker.internet.email,
  "|FAKE_PARAGRAPH|": () => faker.lorem.paragraph(1),
  "|FAKE_LABEL|": faker.word.verb,
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
  "member/edit/fill/label": "input[type='search']",
  // Edit list
  // For searching a label
  "member/edit/label": "//li[normalize-space()='{}']",
  // Actions
  "member/action/save": "//button/span[contains(., 'Save')]",
  "member/action/retry save": "//span[normalize-space()='Retry']",
  "member/action/actions": "//button[./span/span[contains(., 'Actions')]]",
  "member/action/actions/delete": "//button/span[contains(., 'Delete member')]",
  "member/action/list actions": "//button[./span/span[contains(., 'Actions')]]",
  "member/action/list actions/delete": "//button[./span[contains(., 'Delete selected members')]]",
  "member/action/list actions/delete confirm": "//button[./span[contains(., 'Download backup')]]",
  "member/action/list actions/delete confirm close": "//button[./span[contains(., 'Close')]]",
  "member/action/list actions/remove label": "//button/span[contains(., 'Remove label')]",
  "member/action/list actions/remove label select": "//select[./option[contains(., '{}')]]",
  "member/action/list actions/remove label select option": "//option[contains(., '{}')]",
  "member/action/list actions/remove label confirm": "//span[normalize-space()='Remove Label']",
  "member/action/list actions/remove label confirm close": "button[class='gh-btn gh-btn-black'] span",
  "member/see/save-retry": "//button[contains(., 'Retry')]",
} as const

function GetSelector(selector: string): string {
  let res = Selectors[selector];
  if (!res) {
    throw new Error(`Couldn't find selector for key ${selector}`)
  }
  return res;
}

async function getElement(page: Page, wait: boolean, selector: string, value?: string, hidden: boolean = false, visible: boolean = false): Promise<ElementHandle> {
  let isxpath = selector.startsWith("/");
  let result;
  if (value) {
    value = ValueTransform(value);
    selector = selector.replace(/\{\}/g, value);
  }
  console.log('=========================================')
  console.log(`Selector: ${selector}`)
  console.log(`Value: ${value}`)
  console.log(`Page: ${page}`)
  if (wait) {
    let props: Record<string, any> = {};
    if (hidden) {
      props.hidden = true;
    }
    if (visible) {
      props.visible = true;
    }
    props.timeout = 5000;
    if (isxpath) {
      await page.waitForXPath(selector, props);
    } else {
      await page.waitForSelector(selector, props);
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

async function FillElement(page: Page, wait: boolean, selector: string, value: string, clear?: boolean, focus?: boolean): Promise<void> {
  let element = await getElement(page, wait, selector, value);
  value = ValueTransform(value)
  if (focus) {
    await element.focus();
  }
  if (clear) {
    // @ts-ignore
    await element.evaluate((el) => { el.value = '' })
  }
  return element.type(value);
}

async function ClickElement(page: Page, wait: boolean, selector: string, value?: string): Promise<void> {
  let element = await getElement(page, wait, selector, value, false, true);
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
      await NavigateTo(page, "dashboard");
      let p = page.waitForNavigation({ waitUntil: 'networkidle0' });
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
      await page.goto(Urls.dashboard, { waitUntil: 'networkidle0' });
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

When(/I (?:navigate|go) to the "(.*?)" functionality(?:$|.*?"(.*?)")/, async function(this: KrakenWorld, name: string, additional?: string) {
  console.log(`Navigate to the ${name} functionality ${additional}`)
  await NavigateTo(this.page, name, additional);
});

When(/I (fill|set) the ("(.*)?") ("(.*)?") to ("(.*)?")/, async function(this: KrakenWorld, verb: string, scope: string, selectorName: string, value: string) {
  let special = ['label', 'search']
  let key = scope.replace(' ', '/') + '/fill/' + selectorName;
  let selector = GetSelector(key)
  let focus = special.includes(selectorName);
  // Wait for the query to be in the url
  let p = FillElement(this.page, true, selector, value, verb === 'set', focus);
  if (focus) {
    // Wait for the typing to be done, and then press enter
    await p;
    await this.page.keyboard.press('Enter');
    await this.page.waitForNetworkIdle();
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
    await p;
  } else if (scope === 'multiple members') {
    let p = this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    // TODO: Fix this timeout
    await this.page.waitForTimeout(1000);
    await ClickElement(this.page, true, GetSelector("member/action/list actions"));
    await ClickElement(this.page, true, GetSelector("member/action/list actions/delete"));
    await ClickElement(this.page, true, GetSelector("member/action/list actions/delete confirm"));
    await ClickElement(this.page, true, GetSelector("member/action/list actions/delete confirm close"));
    await p;
  } else {
    throw new Error("Only member scope is supported");
  }
});


//    I should   "see"  the "member"  "email" "|FAKE_EMAIL|1" in the "list"
Then('I should {string} the {string} {string} {string} in the {string}', async function(this: KrakenWorld, verb: string, scope: string, selector_key: string, value: string, view: string) {
  let hidden = verb === 'not see';
  // Find the actual selector
  let key = scope + '/' + view + '/' + selector_key;
  let selector = GetSelector(key);
  let element: ElementHandle

  // Find the element, if using "not see" then return on error from getElement this is good because
  // we are already waiting
  try {
    element = await getElement(this.page, true, selector, value, hidden);
    value = ValueTransform(value);
  } catch (e) {
    if (hidden) {
      return;
    }
    throw e;
  }

  // Get the element text and compare with value
  let text = await element.evaluate(element => element.textContent);
  if (text === null) {
    throw new Error(`Element ${selector} text content is null`);
  }
  if (!(value === text || value === text.trim())) {
    throw new Error(`Expected ${value} but got ${text.trim()}`);
  }
})

Then('I should see member saving failed', async function(this: KrakenWorld,) {
  let selector = GetSelector("member/see/save-retry");
  let element = await getElement(this.page, true, selector);
  if (element === null) throw new Error(`Couldn't find element with selector ${selector}`);
})

When('I remove the label {string} from all the filtered members', async function(this: KrakenWorld, label: string) {
  // TODO: Fix this timeout
  // await this.page.waitForTimeout(1000);
  await ClickElement(this.page, true, GetSelector("member/action/list actions"));
  await ClickElement(this.page, true, GetSelector("member/action/list actions/remove label"));

  // Get the select an option to use
  let select = await getElement(this.page, true, GetSelector("member/action/list actions/remove label select"), label);
  let option = await getElement(this.page, true, GetSelector("member/action/list actions/remove label select option"), label);
  //@ts-ignore
  let value = await option.evaluate(el => el.value);
  await select.select(value);

  await ClickElement(this.page, true, GetSelector("member/action/list actions/remove label confirm"));
  this.page.keyboard.press('Enter');
  await ClickElement(this.page, true, GetSelector("member/action/list actions/remove label confirm close"));
});
