/*
- Escenario de prueba 2:
Login
Crear miembro cvon nombre A y email X
Revisar que el miembro fue creado
Crear miembro cvon nombre A y email y
Revisar que el miembro fue creado
*/
import { test, expect } from '@playwright/test';
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import faker from '@faker-js/faker';
// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test('Create Member with same name', async ({ page }, testinfo) => {
  // Intances and fakerValues
  const loginPage = new LoginPage(page);
  const membersPage = new MembersPage(page);
  const fakeValues = {
    name: faker.name.findName(),
    email_1: faker.internet.email(),
    email_2: faker.internet.email(),
    notes: faker.lorem.sentence(),
  }
  // Login
  await loginPage.open();
  await loginPage.login();
  expect(await loginPage.userIsLoggedIn()).toBeTruthy();

  // Go to members page
  await membersPage.open();

  // Create member
  await membersPage.createMember(fakeValues.name, fakeValues.email_1, fakeValues.notes);

  //Validated Creation
  await membersPage.open();
  await expect(membersPage.containsName(fakeValues.name)).toHaveCount(1);

  // Create member
  await membersPage.createMember(fakeValues.name, fakeValues.email_2, fakeValues.notes);

  //Validated Creation
  await membersPage.open();
  await expect(membersPage.containsName(fakeValues.name)).toHaveCount(2);
  await expect(membersPage.containsEmail(fakeValues.email_1)).toHaveCount(1);
  await expect(membersPage.containsEmail(fakeValues.email_2)).toHaveCount(1);
});
