import { Locator, Page } from '@playwright/test';

const membersUrl = 'http://localhost:9333/ghost/#/members';

export class MembersPage {
    readonly page: Page;
    readonly newMember: Locator;
    readonly name: Locator;
    readonly email: Locator;
    readonly notes: Locator;
    readonly label: Locator;
    readonly save: Locator;
    readonly retry: Locator;
    readonly invalidEmail: Locator;
    readonly actions: Locator;
    readonly deleteMember: Locator;
    readonly search: Locator;

    constructor(page: Page) {
        this.page = page;
        this.newMember = page.locator('a:has-text("New Member")');
        this.name = page.locator('input[id="member-name"]');
        this.email = page.locator('input[id="member-email"]');
        this.notes = page.locator('textarea[id="member-note"]');
        this.label = page.locator('input[id="ember-power-select-trigger-multiple-input-ember1308"]');
        this.save = page.locator('button:has-text("Save")');
        this.retry = page.locator('button:has-text("Retry")');
        this.invalidEmail = page.locator('p[class="response"] >> text="Invalid Email."');
        this.actions = page.locator('button:has-text("Actions")');
        this.deleteMember = page.locator('button:has-text("Delete member")');
        this.search = page.locator('input[placeholder="Search members..."]');
    }

    async open() {
        await this.page.goto(membersUrl, { waitUntil: 'networkidle' });
    }

    async createMember(name: string, email: string, notes: string, back: boolean = true, label: string = "label") {
        await this.newMember.click();
        await this.name.type(name);
        await this.email.type(email);
        await this.notes.type(notes);
        //await this.label.type(label);
        await this.save.click();


        // Wait to be saved
        await this.page.waitForLoadState('networkidle');
        // Go back
        if (back) {
            await this.page.goBack();
        }
    }
    async containsName(name: string): Promise<Boolean> {
        //return (await this.page.locator('h3', { hasText: name })).isVisible();
        return await this.page.locator('h3', { hasText: name }).isVisible();
    }
}


