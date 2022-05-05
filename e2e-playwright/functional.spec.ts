import faker from '@faker-js/faker';
import { test, expect, Page } from '@playwright/test';

let Url = process.env.GHOST_URL || 'http://localhost:9333';
Url = Url.replace(/\/$/, '')
let adminDashboard = Url + '/ghost/#/dashboard';
const UserPassword = process.env.GHOST_PASSWORD || 'Very_Strong1!';
const UserEmail = process.env.GHOST_EMAIL || 'tester@tester.com';

// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })

const setup = async (page: Page) => {
  await page.goto(Url + '/ghost/#/signin', { waitUntil: 'networkidle' });
  let curr_url = page.url();
  if (curr_url.includes('setup')) {
    // Check if we need to create a new user
    await page.waitForSelector('input[id="blog-title"]');
    const input = await page.$('input[id="blog-title"]')
    await input.type(process.env.GHOST_TITLE || 'Ghost Testing');
    const name = await page.$('input[id="name"]')
    await name.type(process.env.GHOST_NAME || 'Ghost Testing');
    const emailInput = await page.$('input[id="email"]')
    await emailInput.type(UserEmail);
    const passwordInput = await page.$('input[id="password"]')
    await passwordInput.type(UserPassword);
    const submit = await page.$('button[type="submit"]')
    await submit.click();
  } else if (curr_url.includes('signin') || curr_url.includes('dashboard')) {
    return;
  } else {
    throw new Error('Failed setting up Ghost');
  }
};

const login = async (page: Page) => {
  // Determine if we need to create a new user or not
  await page.goto(Url + '/ghost/#/signin', { waitUntil: 'networkidle' });

  let curr_url = page.url();
  if (curr_url.includes('signin')) {
    // Just log in
    await page.waitForSelector('input[type="email"]');
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    await emailInput.type(UserEmail);
    await passwordInput.type(UserPassword);
    const submit = await page.$('button[type="submit"]');
    await submit.click();
  } else if (curr_url.includes('dashboard')) {
    return
  } else {
    throw new Error('Failed logging in');
  }
  await page.goto(adminDashboard, { waitUntil: 'networkidle' });
}


test.beforeAll(async ({ browser }) => {
  // The first login guarantees that we have a valid session
  // and then we can parallelize the tests
  const page = await browser.newPage();
  await setup(page);
  await page.close();
})

test.describe('member', () => {
  // Find the navigation bar
  // Additional beforeEAch
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('.gh-nav').locator('li:has(a[href="#/members/"])').click({ timeout: 5000 });
  });

  const selectors = {
    newMember: 'a:has-text("New Member")',
    name: 'input[id="member-name"]',
    email: 'input[id="member-email"]',
    notes: 'textarea[id="member-note"]',
    save: 'button:has-text("Save")',
  }

  async function createmember(page: Page, email?: string, goback: boolean = true) {
    const values = {
      name: faker.name.findName(),
      email: email || faker.internet.email(),
      notes: faker.lorem.sentence(),
    }
    await page.locator(selectors.newMember).click();
    await page.locator(selectors.name).type(values.name);
    await page.locator(selectors.email).type(values.email);
    await page.locator(selectors.notes).type(values.notes);
    await page.locator(selectors.save).click();
    // Wait to be saved
    await page.waitForLoadState('networkidle');
    // Go back
    if (goback) {
      await page.goBack();
      await page.reload();
    }

    return values;
  }

  test('should create a new member', async ({ page }) => {
    const member = await createmember(page);
    // Check if the new member is in the list
    await expect(page.locator('h3', { hasText: member.name })).toHaveCount(1);
    await expect(page.locator('p', { hasText: member.email })).toHaveCount(1);
  });

  test('should not create a new member with the same email', async ({ page }) => {
    const member = await createmember(page);
    await createmember(page, member.email, false);
    // Should have failed now button has retry text
    await expect(page.locator('button', { hasText: 'Retry' })).toHaveCount(1);
  });

  test('should not create a new member with an invalid email', async ({ page }) => {
    await createmember(page, faker.internet.email().replace(/@.*$/, ''), false);
    // Should have failed now button has retry text
    await expect(page.locator('button', { hasText: 'Retry' })).toHaveCount(1);
    await expect(page.locator('p[class="response"] >> text="Invalid Email."')).toHaveCount(1);
  });

  test('should edit members', async ({ page }) => {
    const member = await createmember(page);
    await page.locator('h3', { hasText: member.name }).click();
    // Get input contents
    let newName = faker.name.findName();
    await page.locator(selectors.name).fill(newName);
    await page.locator(selectors.save).click();
    await page.waitForLoadState('networkidle');
    await page.goBack();
    // Check if the new member is in the list
    await expect(page.locator('h3', { hasText: newName })).toHaveCount(1, { timeout: 5000 });
  });

  test('should not accept edit of members with duplicate email', async ({ page }) => {
    const member = await createmember(page);
    const anotherMember = await createmember(page);
    await page.locator('h3', { hasText: member.name }).click();
    await page.locator(selectors.email).fill(anotherMember.email);
    await page.locator(selectors.save).click();
    // Wait for the warning to appear
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button', { hasText: 'Retry' })).toHaveCount(1);
  });

  test('should delete members', async ({ page }) => {
    const member = await createmember(page);
    await page.locator('h3', { hasText: member.name }).click();
    await page.locator('button:has-text("Actions")').click();
    await page.locator('button:has-text("Delete member")').click();
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    // Check that the new member is not in the list
    await expect(page.locator('p', { hasText: member.email })).toHaveCount(0);
  });
}); 

test.describe('post', () => {
  // Find the navigation bar
  // Additional beforeEAch
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('.gh-nav').locator('li:has(a[href="#/posts/"])').click({ timeout: 5000 });
  });

  const selectors = {
    newPost: 'a:has-text("New Post")',
    posts: 'span:has-text("Posts")',
    title: 'textarea[placeholder="Post title"]',
    settingsButton: 'main .settings-menu-toggle',
    content: 'div[data-placeholder="Begin writing your post..."]',
    publishDrowndown: 'span:has-text("Publish")',
    publishButton: 'button:has-text("Publish")',
    publishConfirm: 'button:has-text("Publish")',
    publishedMessage: 'span:has-text("Published")',
    updateDrowndown: 'span:has-text("Update")',
    updateButton: 'button:has-text("Update")',
    deleteButton: 'form .settings-menu-delete-button',
    deleteConfirm: 'div .modal-content button:has-text("Delete")',
  }

  async function createpost(page: Page, goback: boolean = true) {
    const values = {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      confirm: 'Published',
    }
    await page.locator(selectors.newPost).click();
    await page.locator(selectors.title).type(values.title);
    await page.locator(selectors.content).type(values.content);

    // Select publish
    await page.locator(selectors.publishDrowndown).click();
    await page.locator(selectors.publishButton).click({ timeout: 3000});
    await page.locator(selectors.publishConfirm).click();
        // Wait for the publish to be confirmed
    await page.waitForLoadState('networkidle');

    // Go back
    if (goback) {
      await page.goBack();
      await page.reload();
    }

    return values;
  }

  test('should create a new post', async ({ page }) => {
    const post = await createpost(page);
    await page.waitForLoadState('networkidle');
    // Check if the new member is in the list
    await expect(page.locator('span', { hasText: post.confirm })).toHaveCount(1);
  });

  test('should edit posts', async ({ page }) => {
    const post = await createpost(page);
    await page.locator(selectors.posts).click();
    await page.locator('h3', { hasText: post.title }).click({ timeout: 3000});
    // Get input contents
    
    let newTitle = faker.lorem.sentence();
    await page.locator(selectors.title).fill(newTitle);
    await page.locator(selectors.updateDrowndown).click();
    await page.locator(selectors.updateButton).click({ timeout: 3000});
    await page.locator(selectors.posts).click();
    await page.waitForLoadState('networkidle');
    // Check if the new member is in the list
    await expect(page.locator('h3', { hasText: newTitle })).toHaveCount(1, { timeout: 5000 });
  }
  );

  test('should delete posts', async ({ page }) => {
    const post = await createpost(page);
    await page.locator(selectors.posts).click();
    await page.locator('h3', { hasText: post.title }).click({ timeout: 3000});
    await page.locator(selectors.settingsButton).click();
    await page.locator(selectors.deleteButton).click({ timeout: 3000 });
    await page.locator(selectors.deleteConfirm).click();
    await page.locator(selectors.posts).click();
    await page.waitForLoadState('networkidle');
    // Check that the new member is not in the list
    await expect(page.locator('h3', { hasText: post.title })).toHaveCount(0);
  });

 });