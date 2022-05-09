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

// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test('Create post and edit it', async ({ page }) => {
    
    // Intances and fakerValues
    const loginPage = new LoginPage(page);
    const postsPage = new PostsPage(page);
    const fakeValues = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        newTitle:     faker.lorem.sentence()
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
    await expect(postsPage.containsTitle(fakeValues.title)).toHaveCount(1);

    // Edit post
    await postsPage.editPost(fakeValues.title, fakeValues.newTitle);
    // Check if the new member is in the list
    await expect(postsPage.containsTitle(fakeValues.newTitle)).toHaveCount(1, { timeout: 5000 });

});


