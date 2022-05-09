/* 
- Escenario de prueba 13:
Login
Crear Post #1
Publicar Post #1
Crear nuevo Post #2
Publicar Post #2
Validar los 2 posts publicados

*/

import { test, expect } from '@playwright/test';
import { user } from '../data/testData';
import { LoginPage } from '../page/LoginPage';
import { PostsPage } from '../page/PostsPage';
import faker from '@faker-js/faker';

// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test('Create multiple post with the same title', async ({ page }) => {
    
    // Intances and fakerValues
    const loginPage = new LoginPage(page);
    const postsPage = new PostsPage(page);
    const postsPage2 = new PostsPage(page);
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
    await expect(postsPage.containsTitle(fakeValues.title)).toHaveCount(1);

    // Create post
    await postsPage2.createPost(fakeValues.title, fakeValues.content);

    //ValidatedPost
    await postsPage2.open();
    await page.waitForLoadState('networkidle');
    await expect(postsPage.containsTitle(fakeValues.title)).toHaveCount(2);
});



      
    
