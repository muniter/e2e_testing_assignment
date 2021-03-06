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
test('Create multiple post with the same title', async ({ page }, testinfo) => {

  // Intances and fakerValues
  const loginPage = new LoginPage(page, testinfo);
  const postsPage = new PostsPage(page, testinfo);
  const postsPage2 = new PostsPage(page, testinfo);
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

  // Create post
  await postsPage2.createPost(fakeValues.title, fakeValues.content);

  //ValidatedPost
  await postsPage2.open();
  await page.waitForLoadState('networkidle');
  await expect(postsPage.containsTitle(fakeValues.title)).toHaveCount(2);
});





