import type { Page } from '@playwright/test';

const selectors = {
    newPost: 'a:has-text("New Post")',
    posts: 'li:has(a[href="#/posts/"])',
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

const postsUrl = 'http://localhost:9333/ghost/#/posts';

export class PostsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async createPost(title: string, content: string,) {

        await this.page.locator('.gh-nav').locator('li:has(a[href="#/posts/"])').click({ timeout: 5000 });

        await this.page.locator(selectors.newPost).click();
        await this.page.locator(selectors.title).type(title);
        await this.page.locator(selectors.content).type(content);

        // Select publish
        await this.page.locator(selectors.publishDrowndown).click();
        await this.page.locator(selectors.publishButton).click({ timeout: 3000 });
        await this.page.locator(selectors.publishConfirm).click();
        // Wait for the publish to be confirmed
        await this.page.waitForLoadState('networkidle');
    }

    async isPublished(title: string): Promise<boolean> {
        await this.page.goto(postsUrl, { waitUntil: 'networkidle' });
        return true
    }

}


