/* 
- Escenario de prueba 15:
Login
Crear Post
Publicar Post
Eliminar Post

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

test('Create post and delete it', async ({ page }) => {
    
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

    // Delete post
    await page.goto('http://localhost:9333/ghost/#/posts');
    await page.waitForLoadState('networkidle');
    await page.locator('li', { hasText: fakeValues.title }).click({ timeout: 3000});
    await page.locator('main .settings-menu-toggle').click();
    await page.locator('form .settings-menu-delete-button').click({ timeout: 3000 });
    await page.locator('div .modal-content button:has-text("Delete")').click();
    await page.goto('http://localhost:9333/ghost/#/posts');
    await page.waitForLoadState('networkidle');
    // Check that the new member is not in the list
    await expect(page.locator('h3', { hasText: fakeValues.title })).toHaveCount(0);

});


