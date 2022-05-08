import { Page } from '@playwright/test';

const selectors = {
  newMember: 'a:has-text("New Member")',
  name: 'input[id="member-name"]',
  email: 'input[id="member-email"]',
  notes: 'textarea[id="member-note"]',
  label: 'input[id="member-email"]',
  save: 'button:has-text("Save")',
  retry: 'button:has-text("Retry")',
}

const membersUrl = 'http://localhost:9333/ghost/#/members';

export class MembersPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open() {
    await this.page.goto(membersUrl, { waitUntil: 'networkidle' });
  }

  async createMember(name: string, email: string, notes: string, back: boolean = true, label?: string) {
    await this.page.locator(selectors.newMember).click();
    await this.page.locator(selectors.name).type(name);
    await this.page.locator(selectors.email).type(email);
    await this.page.locator(selectors.notes).type(notes);
    if (label) {
        await this.page.locator(selectors.label).type(label);
    }
    await this.page.locator(selectors.save).click();


    // Wait to be saved
    await this.page.waitForLoadState('networkidle');
    // Go back
    if (back) {
      await this.page.goBack();
    }
  }
}


