import { Page } from '@playwright/test';

const selectors = {
    newPost: 'a:has-text("New Post")',
    posts: 'li:has(a[href="#/posts/"])',
    title: 'textarea[placeholder="Post title"]',
    settingsButton: 'main .settings-menu-toggle',
    content: 'div[data-placeholder="Begin writing your post..."]',
    publishDrowndown: 'span:has-text("Publish") >> nth=0',
    publishButton: 'button:has-text("Publish") >> nth=0',
    publishConfirm: 'button:has-text("Publish") >> nth=0',
    publishedMessage: 'span:has-text("Published")',
/*     publishedMessage: 'div[role="button"]:has-text("Publish")', */
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

    async open() {
        await this.page.goto(postsUrl);
        await this.page.waitForLoadState('networkidle');
    }

    async createPost(title: string, content:any) {

        await this.page.locator('.gh-nav').locator('li:has(a[href="#/posts/"])').click({ timeout: 5000 });

        await this.page.locator(selectors.newPost).click();
        await this.page.locator(selectors.title).type(title);
        if (content !== null) {
            await this.page.locator(selectors.content).type(content);
            // Select publish
        } else {
            await this.page.keyboard.press('Enter');
        }

        await this.page.locator(selectors.publishDrowndown).click();
        await this.page.locator(selectors.publishButton).click();
        await this.page.waitForLoadState('networkidle');
        await this.page.locator(selectors.publishConfirm).click();
        await this.page.waitForLoadState('networkidle');
        
    }

    async isPublished(): Promise<boolean> {
        await this.page.waitForSelector(selectors.publishedMessage);
        return await this.page.isVisible(selectors.publishedMessage);
    }

}


