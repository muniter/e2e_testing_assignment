/* 
- Escenario de prueba 15:
Login
Crear Post
Publicar Post
Eliminar Post

*/

import { test, expect } from '@playwright/test';
import { LoginPage } from '../page/LoginPage';
import { PostsPage } from '../page/PostsPage';
import faker from '@faker-js/faker';
import { VRTBeforeAll } from '../util/util';
import { VISUAL_REGRESSION_TESTING } from '../../shared/SharedConfig';
test.beforeAll(VRTBeforeAll);
if (VISUAL_REGRESSION_TESTING) {
  faker.seed(12345);
}
// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test('Create post and delete it', async ({ page }, testinfo) => {
  // Intances and fakerValues
  const loginPage = new LoginPage(page, testinfo);
  const postsPage = new PostsPage(page, testinfo);
  const fakeValues = {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
  }
  // Login
  await loginPage.open();
  await loginPage.login();
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


