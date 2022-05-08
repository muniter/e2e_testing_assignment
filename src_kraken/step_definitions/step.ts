import { Given, When, Then } from '@cucumber/cucumber';
import { faker } from '@faker-js/faker';
import { Login } from './login';
import type { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';
import { Cookie, KrakenWorld } from '../support/support';
import { ElementHandle } from 'puppeteer-core/lib/cjs/puppeteer/common/JSHandle';
const Urls = require('./urls').Urls;

type ValueGeneratorCollection = {
  [key: string]: () => string
}

const ValueGenerators: ValueGeneratorCollection = {
  "|FAKE_NAME|": faker.name.findName,
  "|FAKE_EMAIL|": faker.internet.email,
  "|FAKE_PARAGRAPH|": () => faker.lorem.paragraph(1),
  "|FAKE_LABEL|": faker.word.verb,
  "|FAKE_TITLE|": faker.commerce.productName,
  "|FAKE_CONTENT|": faker.commerce.productDescription,
} as const;

const SavedGeneratedValues: Record<string, string> = {};

type SelectorsCollection = { [key: string]: string };

const Selectors: SelectorsCollection = {
  // Dashboard menu
  "dashborad/menu/member": 'a[href="#/members/"]',
  "dashborad/menu/post": 'a[href="#/posts/"]',

  ///////////////////////////////////
  // Post Fucntionallity

  "post/action/update": "//span[contains(., 'Update')]",
  "post/action/update button": "//button[contains(., 'Update')]",
  "post/action/publish": "//span[contains(., 'Publish')]",
  "post/action/publish button": "//button[contains(., 'Publish')]",
  "post/action/publish confirm": "//button[contains(., 'Publish')]",
  "post/action/open settings": ".settings-menu-toggle",
  // List Fucntionality
  "post/list/new": "//a[@title='New post']",
  "post/list/title": "//h3[contains(., '{}')]",

  // Post Frontend
  "post/frontend/title": ".article-title",
  "post/frontend/404": "//h1[normalize-space()='404']",

  // Edit fill
  "post/edit/fill/title": 'textarea:first-of-type',
  "post/edit/fill/content": '//div[@spellcheck="true"]',

  // Edit settings url
  "post/settings/url": "//p[contains(., 'localhost')]",
  "post/settings/delete": ".settings-menu-delete-button",

  ///////////////////////////////////
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
  // Member Actions
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

async function getElement(page: Page, selector: string, value?: string, hidden: boolean = false, visible: boolean = false): Promise<ElementHandle> {
  let isxpath = selector.startsWith("/");
  let result;
  if (value) {
    value = ValueTransform(value);
    selector = selector.replace(/\{\}/g, value);
  }
  if (true) {
    let props: Record<string, any> = {};
    if (hidden) {
      props.hidden = true;
    }
    if (visible) {
      props.visible = true;
    }
    props.timeout = 5000;
    if (isxpath) {
      result = await page.waitForXPath(selector, props);
    } else {
      result = await page.waitForSelector(selector, props);
    }
  }
  if (result == null) {
    console.log('===============Selector not Found ==================')
    console.log(`Selector: ${selector}`)
    console.log(`Value: ${value}`)
    throw new Error(`Element ${selector} not found`);
  }
  return result;
}

async function TextContens(element: ElementHandle): Promise<string | null> {
  let result = await element.evaluate((element) => {
    return element.textContent;
  }
    , element);
  return result;
}

async function FillElement(page: Page, selector: string, value: string, clear?: boolean, focus?: boolean): Promise<void> {
  let element = await getElement(page, selector, value);
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

async function ClickElement(page: Page, selector: string, value?: string): Promise<void> {
  let element = await getElement(page, selector, value, false, true);
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
  // TODO: Refactor this two (member and post) into one function
  post: async (page: Page) => {
    if (!page.url().includes(Urls["post/list"])) {
      await NavigateTo(page, "dashboard");
      let p = page.waitForNavigation({ waitUntil: 'networkidle0' });
      ClickElement(page, GetSelector("dashborad/menu/post"));
      await p;
    }
  },
  "create post": async (page: Page) => {
    if (page.url().includes(Urls["post/list"])) {
      await ClickElement(page, GetSelector("post/list/new"));
    } else {
      throw new Error("Not on posts list page");
    }
  },
  "edit post": async (page: Page, title: string) => {
    if (page.url().includes(Urls["post/list"])) {
      await ClickElement(page, GetSelector("post/list/title"), title);
    } else {
      throw new Error("Not on posts list page");
    }
  },
  member: async (page: Page) => {
    if (!page.url().includes(Urls["member/list"])) {
      await NavigateTo(page, "dashboard");
      let p = page.waitForNavigation({ waitUntil: 'networkidle0' });
      ClickElement(page, GetSelector("dashborad/menu/member"));
      await p;
    }
  },
  "create member": async (page: Page) => {
    if (page.url().includes(Urls["member/list"])) {
      await ClickElement(page, GetSelector("member/list/new"));
    } else {
      throw new Error("Not on members list page");
    }
  },
  "edit member": async (page: Page, email: string) => {
    if (page.url().includes(Urls["member/list"])) {
      await ClickElement(page, GetSelector("member/list/email"), email);
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
} as const

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
  await NavigateTo(this.page, name, additional);
});

When(/I (fill|set) the ("(.*)?") ("(.*)?") to ("(.*)?")/, async function(this: KrakenWorld, verb: string, scope: string, selectorName: string, value: string) {
  let special = ['label', 'search']
  let key = scope.replace(' ', '/') + '/fill/' + selectorName;
  let selector = GetSelector(key)
  let focus = special.includes(selectorName);
  // Wait for the query to be in the url
  let p = FillElement(this.page, selector, value, verb === 'set', focus);
  if (focus) {
    // Wait for the typing to be done, and then press enter
    await p;
    await this.page.keyboard.press('Enter');
  }
  if (scope === 'post' || selectorName === 'title') {
    // Last post title
    this.cookie.posts.last.title = ValueTransform(value);
  }
  await p;
});

When('I {string} the {string}', async function(this: KrakenWorld, action: string, scope: string) {
  let selector = GetSelector(scope + '/action/' + action)
  if (typeof selector === 'string') {
    await ClickElement(this.page, selector);
  } else if (typeof selector === 'function') {
  }
});


When('I delete the {string}', async function(this: KrakenWorld, scope: string) {
  if (scope === 'member') {
    // Press the action button first
    await ClickElement(this.page, GetSelector("member/action/actions"));
    // Press the delete button now
    await ClickElement(this.page, GetSelector("member/action/actions/delete"));
    // Press enter to confirm the dialog
    let p = this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    this.page.keyboard.press('Enter');
    await p;
  } else if (scope === 'multiple members') {
    let p = this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    // TODO: Fix this timeout
    await this.page.waitForTimeout(1000);
    await ClickElement(this.page, GetSelector("member/action/list actions"));
    await ClickElement(this.page, GetSelector("member/action/list actions/delete"));
    await ClickElement(this.page, GetSelector("member/action/list actions/delete confirm"));
    await ClickElement(this.page, GetSelector("member/action/list actions/delete confirm close"));
    await p;
  } else if (scope === 'post') {
    await saveLastPostUrl(this.page, this.cookie);
    await ClickElement(this.page, GetSelector("post/action/open settings"));
    await ClickElement(this.page, GetSelector("post/settings/delete"));
    await this.page.waitForTimeout(100);
    await this.page.keyboard.press('Enter');
  } else {
    throw new Error(`The given scope: ${scope} is not supported`);
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
    element = await getElement(this.page, selector, value, hidden);
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
  let element = await getElement(this.page, selector);
  if (element === null) throw new Error(`Couldn't find element with selector ${selector}`);
})

When('I remove the label {string} from all the filtered members', async function(this: KrakenWorld, label: string) {
  // TODO: Fix this timeout
  // await this.page.waitForTimeout(1000);
  await ClickElement(this.page, GetSelector("member/action/list actions"));
  await ClickElement(this.page, GetSelector("member/action/list actions/remove label"));

  // Get the select an option to use
  let select = await getElement(this.page, GetSelector("member/action/list actions/remove label select"), label);
  let option = await getElement(this.page, GetSelector("member/action/list actions/remove label select option"), label);
  //@ts-ignore
  let value = await option.evaluate(el => el.value);
  await select.select(value);

  await ClickElement(this.page, GetSelector("member/action/list actions/remove label confirm"));
  this.page.keyboard.press('Enter');
  await ClickElement(this.page, GetSelector("member/action/list actions/remove label confirm close"));
});

When('I save the post', async function(this: KrakenWorld,) {
  let keys = ['Control', 's'];
  keys.forEach(async key => {
    //@ts-ignore
    await this.page.keyboard.down(key);
  })
  await this.page.waitForTimeout(200);
  keys.forEach(async key => {
    //@ts-ignore
    await this.page.keyboard.up(key);
  })
  await this.page.waitForNetworkIdle();
})

async function saveLastPostUrl(page: Page, cookie: Cookie) {
  await ClickElement(page, GetSelector("post/action/open settings"));
  let element = await getElement(page, GetSelector("post/settings/url"));
  let url = await TextContens(element);
  if (url) {
    let post_slug = url.replace(/.*?localhost:\d+?\//, '').replace(/\n/, '').trim();
    cookie.posts.last.url = Urls["main"] + "/" + post_slug;
  }
  await ClickElement(page, GetSelector("post/action/open settings"));
}

When(/I (publish|update) the post/, async function(this: KrakenWorld, verb: string) {
  await saveLastPostUrl(this.page, this.cookie);
  if (verb === 'publish') {
    await ClickElement(this.page, GetSelector("post/action/publish"))
    await ClickElement(this.page, GetSelector("post/action/publish button"))
    await ClickElement(this.page, GetSelector("post/action/publish confirm"))
  } else if (verb === 'update') {
    await ClickElement(this.page, GetSelector("post/action/update"))
    await ClickElement(this.page, GetSelector("post/action/update button"))
  }
})

Then(/I confirm the post (is|is not) published.*$/, async function(this: KrakenWorld, published: string) {
  await this.page.goto(this.cookie.posts.last.url);
  if (published === 'is') {
    let title = await getElement(this.page, GetSelector("post/frontend/title"));
    let text = await TextContens(title);
    // Default title
    this.cookie.posts.last.title === '' ? '(Untitled)' : this.cookie.posts.last.title;
    if (text === this.cookie.posts.last.title || text === '(Untitled)') {
      await this.page.goBack({ waitUntil: 'networkidle0' });
      return;
    }
    throw new Error(`Expected ${this.cookie.posts.last.title} but got ${text}`);
  } else if (published === 'is not') {
    // getEleemnt errors if not found so we can just check if it exists
    await getElement(this.page, GetSelector("post/frontend/404"));
  }
})
