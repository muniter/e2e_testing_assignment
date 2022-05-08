/* 
- Escenario de prueba 14:
Login
Crear Post
Publicar Post
Editar Post

*/

import { test, expect } from '@playwright/test';
import { user } from '../data/testData';
import { LoginPage } from '../page/LoginPage';
import { PostsPage } from '../page/PostsPage';
import faker from '@faker-js/faker';
import setup from '../setup';

// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })

  
test.beforeAll(async ({ browser }) => {
    // The first login guarantees that we have a valid session
    // and then we can parallelize the tests
    const page = await browser.newPage();
    await setup(page);
    await page.close();
})

test('Create post and edit it', async ({ page }) => {
    
    // Intances and fakerValues
    const loginPage = new LoginPage(page);
    const postsPage = new PostsPage(page);
    const fakeValues = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
    }
    // Login
    await loginPage.open();
    await loginPage.login(user.email, user.password);
    expect(await loginPage.userIsLoggedIn()).toBeTruthy();

    // Create post
    await postsPage.createPost(fakeValues.title, fakeValues.content);
    expect(await postsPage.isPublished()).toBeTruthy();

    //ValidatedPost
    await postsPage.open();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3', { hasText: fakeValues.title })).toHaveCount(1, { timeout: 5000 });

    // Edit post
    await page.goto('http://localhost:9333/ghost/#/posts');
    await page.waitForLoadState('networkidle');
    await page.locator('li', { hasText: fakeValues.title }).click();

    let newTitle = faker.lorem.sentence();
    await page.locator('textarea[placeholder="Post title"]').fill(newTitle);
    await page.waitForTimeout(1000);
    await page.locator('span:has-text("Update")').click();
    await page.locator('button:has-text("Update")').click({ timeout: 3000});
    await page.goto('http://localhost:9333/ghost/#/posts');
    await page.waitForLoadState('networkidle');
    // Check if the new member is in the list
    await expect(page.locator('h3', { hasText: newTitle })).toHaveCount(1, { timeout: 5000 });

});


