/* 
- Escenario de prueba 11:
Login
Crear Post
Validar creación del Post
*/

import { test, expect } from '@playwright/test';
import { LoginPage } from '../page/LoginPage';
import { PostsPage } from '../page/PostsPage';
import faker from '@faker-js/faker';
import { VRTBeforeAll } from '../util/util';

test.beforeAll(VRTBeforeAll);

// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test('Create post without content', async ({ page }, testinfo) => {

  // Intances and fakerValues
  const loginPage = new LoginPage(page, testinfo);
  const postsPage = new PostsPage(page, testinfo);
  const fakeValues = {
    title: faker.lorem.sentence(),
  }
  // Login
  await loginPage.open();
  await loginPage.login();
  expect(await loginPage.userIsLoggedIn()).toBeTruthy();

  // Create post
  await postsPage.createPost(fakeValues.title, null);

  //ValidatedPost
  await postsPage.open();
  await page.waitForLoadState('networkidle');
  await expect(postsPage.containsTitle(fakeValues.title)).toHaveCount(1);
});
