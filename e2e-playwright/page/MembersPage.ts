import { Page } from '@playwright/test';

const selectors = {
    newMember: 'a:has-text("New Member")',
    name: 'input[id="member-name"]',
    email: 'input[id="member-email"]',
    notes: 'textarea[id="member-note"]',
    save: 'button:has-text("Save")',
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

    async createMember(name: string, email: string, notes: string) {
        await this.page.locator(selectors.newMember).click();
        await this.page.locator(selectors.name).type(name);
        await this.page.locator(selectors.email).type(email);
        await this.page.locator(selectors.notes).type(notes);
        await this.page.locator(selectors.save).click();


        // Wait to be saved
        await this.page.waitForLoadState('networkidle');
        // Go back
        await this.page.goBack();


    }
    



}


