/*
- Escenario de prueba 4:
Login
Crear miembro sin nombre
Intentar guardar
Ver que guardar falla
*/
import { test, expect } from '@playwright/test';
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import faker from '@faker-js/faker';
import { VRTBeforeAll } from '../util/util';

test.beforeAll(VRTBeforeAll);
faker.seed(123);
// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test('Create member without name', async ({ page }, testinfo) => {
  // Intances and fakerValues
  const loginPage = new LoginPage(page, testinfo);
  const membersPage = new MembersPage(page, testinfo);

  const fakeValues = {
    email: faker.internet.email(),
    notes: faker.lorem.sentence(),
  }
  // Login
  await loginPage.open();
  await loginPage.login();
  expect(await loginPage.userIsLoggedIn()).toBeTruthy();

  // Create member
  await membersPage.createMember("", fakeValues.email, fakeValues.notes);

  // In the list view when there's no name, the email is set as the name
  // therefore we check for name
  await expect(membersPage.containsName(fakeValues.email)).toHaveCount(1);
});
