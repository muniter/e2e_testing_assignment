import { Locator, Page } from '@playwright/test';
import { Urls } from '../shared/SharedConfig';

const listUrl = Urls['post/list']
export class PostsPage {
  readonly page: Page;
  readonly newPost: Locator;
  readonly posts: Locator;
  readonly title: Locator;
  readonly settingsButton: Locator;
  readonly content: Locator;
  readonly publishDrowndown: Locator;
  readonly publishButton: Locator;
  readonly publishConfirm: Locator;
  readonly publishedMessage: Locator;
  readonly updateDrowndown: Locator;
  readonly updateButton: Locator;
  readonly deleteButton: Locator;
  readonly deleteConfirm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newPost = page.locator('a:has-text("New Post")');
    this.posts = page.locator('li:has(a[href="#/posts/"])');
    this.title = page.locator('textarea[placeholder="Post title"]');
    this.settingsButton = page.locator('main .settings-menu-toggle');
    this.content = page.locator('div[data-placeholder="Begin writing your post..."]');
    this.publishDrowndown = page.locator('span:has-text("Publish") >> nth=0');
    this.publishButton = page.locator('button:has-text("Publish") >> nth=0');
    this.publishConfirm = page.locator('button:has-text("Publish") >> nth=0');
    this.publishedMessage = page.locator('span:has-text("Published")');
    this.updateDrowndown = page.locator('span:has-text("Update")');
    this.updateButton = page.locator('button:has-text("Update")');
    this.deleteButton = page.locator('form .settings-menu-delete-button');
    this.deleteConfirm = page.locator('div .modal-content button:has-text("Delete")');
  }

  containsTitle(title: string): Locator {
    return this.page.locator('h3', { hasText: title });
  }

  async open() {
    await this.page.goto(listUrl);
    await this.page.waitForLoadState('networkidle');
  }

  async createPost(title: string, content: any) {

    await this.page.locator('.gh-nav').locator('li:has(a[href="#/posts/"])').click({ timeout: 5000 });

    await this.newPost.click();
    await this.title.type(title);
    if (content !== null) {
      await this.content.type(content);
      // Select publish
    } else {
      await this.page.keyboard.press('Enter');
    }

    await this.publishDrowndown.click();
    await this.publishButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.publishConfirm.click();
    await this.page.waitForLoadState('networkidle');

  }

  async isPublished(): Promise<boolean> {
    await this.page.waitForSelector('span:has-text("Published")');
    return await this.page.isVisible('span:has-text("Published")');
  }

  async editPost(oldTitle: string, newTitle: string) {
    await this.page.goto(listUrl);
    await this.page.waitForLoadState('networkidle');
    await this.page.locator('li', { hasText: oldTitle }).click();

    await this.title.fill(newTitle);
    await this.page.waitForTimeout(1000);
    await this.updateDrowndown.click();
    await this.updateButton.click({ timeout: 3000 });
    await this.page.goto(listUrl);
    await this.page.waitForLoadState('networkidle');

  }

  async deletePost(title: string) {
    await this.page.goto(listUrl);
    await this.page.waitForLoadState('networkidle');
    await this.page.locator('li', { hasText: title }).click({ timeout: 3000 });
    await this.settingsButton.click();
    await this.deleteButton.click({ timeout: 3000 });
    await this.deleteConfirm.click();
    await this.page.goto(listUrl);
    await this.page.waitForLoadState('networkidle');
  }
}

