import { Locator, Page, TestInfo } from '@playwright/test';
import { Urls } from '../../shared/SharedConfig';
import { takeScreenshot } from '../util/util';

export class StaffPage {
  readonly page: Page;
  readonly testInfo: TestInfo;
  readonly settings: Locator;
  readonly yourProfile: Locator;
  readonly userName: Locator;
  readonly userEmail: Locator;
  readonly userLocation: Locator;
  readonly userWebsite: Locator;
  readonly userBio: Locator;
  readonly userPasswordOld: Locator;
  readonly userPasswordNew: Locator;
  readonly userNewPasswordVerification: Locator;
  readonly changePassword: Locator;
  readonly save: Locator;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
    this.settings = page.locator('div[class="flex-auto flex items-center"]');
    this.yourProfile = page.locator('a:has-text("Your Profile")');
    this.userName = page.locator('input[id="user-name"]');
    this.userEmail = page.locator('input[id="user-email"]');
    this.userLocation = page.locator('input[id="user-location"]');
    this.userWebsite = page.locator('input[id="user-website"]');
    this.userBio = page.locator('textarea[id="user-bio"]');
    this.userPasswordOld = page.locator('input[id="user-password-old"]');
    this.userPasswordNew = page.locator('input[id="user-password-new"]');
    this.userNewPasswordVerification = page.locator('input[id="user-new-password-verification"]');
    this.changePassword = page.locator('button:has-text("Change Password")');
    this.save = page.locator('button:has-text("Save")');
  }

  containsTitle(title: string): Locator {
    return this.page.locator('h3', { hasText: title });
  }

  async open() {
    await this.page.goto(Urls.dashboard);
    await this.page.waitForLoadState('networkidle');
    await this.settings.click();
    await this.yourProfile.click();
  }
}

