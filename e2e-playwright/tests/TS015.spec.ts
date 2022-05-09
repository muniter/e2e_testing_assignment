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

// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
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
  await expect(postsPage.containsTitle(fakeValues.title)).toHaveCount(1);


  // Delete post
  await postsPage.deletePost(fakeValues.title);
  // Check that the new member is not in the list
  await expect(postsPage.containsTitle(fakeValues.title)).toHaveCount(0);

});


