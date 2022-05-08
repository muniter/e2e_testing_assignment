import { Page, expect } from '@playwright/test';

const selectors = {
    newMember: 'a:has-text("New Member")',
    name: 'input[id="member-name"]',
    email: 'input[id="member-email"]',
    notes: 'textarea[id="member-note"]',
    save: 'button:has-text("Save")',
  }

const membersUrl = 'http://localhost:2368/ghost/#/members';

export class membersPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async open() {
        await this.page.goto(membersUrl);
        await this.page.waitForLoadState('networkidle');
    }
    



}


