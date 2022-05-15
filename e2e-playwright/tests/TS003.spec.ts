/*
- Escenario de prueba 3:
Login
Crear miembro con email inválido
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
test('Create member invalid email', async ({ page }, testinfo) => {
  // Intances and fakerValues
  const loginPage = new LoginPage(page, testinfo);
  const membersPage = new MembersPage(page, testinfo);
  const fakeValues = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    notes: faker.lorem.sentence(),
  }
  // Login
  await loginPage.open();
  await loginPage.login();
  expect(await loginPage.userIsLoggedIn()).toBeTruthy();

  // Go to members page
  await membersPage.open();

  // Create member
  await membersPage.createMember(fakeValues.name, fakeValues.email.replace(/@.*$/, ''), fakeValues.notes);

  //Validated that the member was not created by checking for the retry buttton
  await expect(membersPage.retry).toHaveCount(1);
  await expect(membersPage.invalidEmail).toHaveCount(1);
});
