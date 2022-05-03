import faker from '@faker-js/faker';
import { test, expect, Page } from '@playwright/test';

let url = process.env.GHOST_URL || 'http://localhost:9333';
url = url.replace(/\/$/, '')
let adminDashboard = url + '/ghost/#/dashboard';

const login = async (page: Page) => {
  const password = process.env.GHOST_PASSWORD || 'Very_Strong1!';
  const email = process.env.GHOST_EMAIL || 'tester@tester.com';
  // Determine if we need to create a new user or not
  await page.goto(url + '/ghost/#/signin', { waitUntil: 'networkidle' });

  let curr_url = page.url();
  if (curr_url.includes('setup')) {
    // Check if we need to create a new user
    const input = await page.$('input[id="blog-title"]')
    await input.type(process.env.GHOST_TITLE || 'Ghost Testing');
    const name = await page.$('input[id="name"]')
    await name.type(process.env.GHOST_NAME || 'Ghost Testing');
    const emailInput = await page.$('input[id="email"]')
    await emailInput.type(email);
    const passwordInput = await page.$('input[id="password"]')
    await passwordInput.type(password);
    const submit = await page.$('button[type="submit"]')
    await submit.click();
    // Sleep 5 seconds
  } else if (curr_url.includes('signin')) {
    // Just log in
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    await emailInput.type(email);
    await passwordInput.type(password);
    const submit = await page.$('button[type="submit"]');
    await submit.click();
  } else if (curr_url.includes('dashboard')) {
    return
  }
  await page.goto(adminDashboard, { waitUntil: 'networkidle' });
}

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.describe('member', () => {
  // Find the navigation bar
  // Additional beforeEAch
  test.beforeEach(async ({ page }) => {
    await page.locator('css=li:has(a[href="#/members/"]) >> visible=true').click();
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
    // Should have failed
    await expect(page.locator('aside', { hasText: 'existing email address' })).toHaveCount(1);
    await expect(page.locator('button', { hasText: 'Retry' })).toHaveCount(1);
  });

  test('should edit members', async ({ page }) => {
    const member = await createmember(page);
    await page.locator('h3', { hasText: member.name }).click();
    // Get input contents
    let newName = faker.name.findName();
    await page.locator(selectors.name).type(newName);
    await page.locator(selectors.save).click();
    await page.waitForLoadState('networkidle');
    await page.goBack();
    await page.reload();
    // Check if the new member is in the list
    await expect(page.locator('h3', { hasText: newName })).toHaveCount(1);
  });

  test('should delete members', async ({ page }) => {
    const member = await createmember(page);
    await page.locator('h3', { hasText: member.name }).click();
    await page.locator('button:has-text("Actions")').click();
    await page.locator('button:has-text("Delete member")').click();
    let modal = page.locator('.modal-footer');
    await modal.locator('button:has-text("Delete member") >> nth=1').click();
    // Get input contents
    await page.waitForLoadState('networkidle');
    await page.reload();
    // Check that the new member is not in the list
    await expect(page.locator('p', { hasText: member.email })).toHaveCount(0);
  });
});
