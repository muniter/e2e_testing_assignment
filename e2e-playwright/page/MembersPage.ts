import { Locator, Page } from '@playwright/test';
import { Urls } from '../shared/SharedConfig';

const listUrl = Urls['member/list']

export class MembersPage {
  readonly page: Page;
  readonly newMember: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly notes: Locator;
  readonly label: Locator;
  readonly save: Locator;
  readonly saved: Locator;
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
    this.label = page.locator("input[type='search']");
    this.save = page.locator('button:has-text("Save")');
    this.saved = page.locator('button:has-text("Saved")');
    this.retry = page.locator('button:has-text("Retry")');
    this.invalidEmail = page.locator('p[class="response"] >> text="Invalid Email."');
    this.actions = page.locator('button:has-text("Actions")');
    this.deleteMember = page.locator('button:has-text("Delete member")');
    this.search = page.locator('input[placeholder="Search members..."]');
  }

  async open() {
    if (!listUrl.includes(this.page.url())) {
      await this.page.goto(listUrl, { waitUntil: 'networkidle' });
    }
  }
  async retryMember({ name, email, notes, label }: { name?: string, email?: string, notes?: string, label?: string }) {
    await this.fillValues({ name, email, notes, label });
    await this.retry.click();
    await this.page.waitForTimeout(1000);
  }

  async fillValues({ name, email, notes, label }: { name?: string, email?: string, notes?: string, label?: string }) {
    if (name) {
      await this.name.fill('');
      await this.name.type(name);
    }
    if (label) {
      await this.label.fill(label);
      await this.label.focus();
      await this.page.keyboard.press('Enter');
    }
    if (email) {
      await this.email.fill('');
      await this.email.type(email);
    }
    if (notes) {
      await this.notes.fill('');
      await this.notes.type(notes);
    }
  }

  async createMember(name: string, email: string, notes: string, back: boolean = true, label?: string) {
    await this.open()
    await this.newMember.click();
    let timer = this.page.waitForTimeout(3000);
    await this.fillValues({ name, email, notes, label });
    let networkidle = this.page.waitForLoadState('networkidle');
    await this.save.click();
    await networkidle;

    await timer;
    // Wait to be saved
    // Go back
    if (back) {
      await this.page.goBack({ waitUntil: 'networkidle' });
    }
  }

  async deleteCurrentMember() {
    let navigation = this.page.waitForNavigation({ waitUntil: 'networkidle' });
    await this.actions.click();
    await this.page.waitForTimeout(200);
    await this.deleteMember.click();
    await this.page.waitForTimeout(200);
    await this.page.keyboard.press('Enter');
    await navigation;
  }


  async creationStatus(): Promise<boolean> {
    if (await this.retry.count() == 1) {
      return false;
    }
    return true;
  }

  containsName(name: string): Locator {
    return this.page.locator('h3', { hasText: name })
  }

  containsEmail(email: string): Locator {
    return this.page.locator('p', { hasText: email })
  }

  containsLabel(label: string): Locator {
    return this.page.locator('.gh-member-label-input').locator('li', { hasText: label })
  }

  async openMember({ name, email }: { name?: string, email?: string }) {
    await this.open()
    if (email) {
      await this.containsEmail(email).click();
    } else if (name) {
      await this.containsName(name).click();
    } else {
      throw new Error('No member data provided to edit');
    }
  }

  async filterMembers(word: string) {
    let navigation = this.page.waitForNavigation({ waitUntil: 'networkidle' });
    await this.search.fill(word);
    await this.page.waitForTimeout(100);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(200);
    await navigation;
  }

  async removeLabelMultiple(label: string) {
    await this.actions.click();
    await this.page.locator('button', { hasText: "Remove label from selected" }).click();
    let option = await this.page.locator('option', { hasText: label }).elementHandle()
    let select = this.page.locator(`//select[./option[contains(., '${label}')]]`)
    await select.selectOption(option)
    this.page.locator("//button/span[normalize-space()='Remove Label']").click()
    await this.page.waitForTimeout(1000);
    await this.page.locator("//button/span[normalize-space()='Close']").click()
    await this.page.waitForTimeout(100);
    await this.page.keyboard.press('Escape');
  }

  async deleteMemberMultiple() {
    await this.actions.click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('button', { hasText: "Delete selected members" }).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('button', { hasText: "Download backup" }).click();
    await this.page.waitForTimeout(100);
    // Close
    await this.page.keyboard.press('Escape');
    await this.open();
  }

  async editMember({ currName, currEmail }: { currName?: string, currEmail?: string }, { name, email, notes, label }: { name?: string, email?: string, notes?: string, label?: string }) {
    await this.openMember({ name: currName, email: currEmail })
    await this.fillValues({ name, email, notes, label });
    await this.save.click();
    // Return false if it finds the retry button else true
    try {
      await this.retry.waitFor({ timeout: 1000 })
      return false;
    } catch (e) {
      return true;
    }
  }
}


