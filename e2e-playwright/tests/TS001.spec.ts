/* Create member 01
Login
Crear miembro
Revisar que el miembro fue creado
*/

import { test, expect } from '@playwright/test';
import { user } from '../data/testData';
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import faker from '@faker-js/faker';

// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })

test('Create member', async ({ page }) => {

  // Intances and fakerValues
  const loginPage = new LoginPage(page);
  const membersPage = new MembersPage(page);
  const fakeValues = {
    name: faker.name.firstName(),
    email: faker.internet.email(),
    notes: faker.lorem.sentence(),
  }
  // Login
  await loginPage.open();
  await loginPage.login(user.email, user.password);
  expect(await loginPage.userIsLoggedIn()).toBeTruthy();

  // Go to members page
  await membersPage.open();

  // Create member
  await membersPage.createMember(fakeValues.name, fakeValues.email, fakeValues.notes);

  // Validate member
  await membersPage.open();
  await page.waitForLoadState('networkidle');
  await expect(membersPage.containsName(fakeValues.name)).toHaveCount(1);
});

