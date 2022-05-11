/*
- Escenario de prueba 6:
Login
Crear miembro con email invalido
Intentar guardar
Confirmar que falló por invalidez
Cambiar emaill a email valido
Guardar
Revisar que el miembro aparece en la lista bien creado
*/
import { test, expect } from '@playwright/test';
import { user } from '../data/testData';
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import faker from '@faker-js/faker';
// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test('Create member retry', async ({ page }) => {
  // Intances and fakerValues
  const loginPage = new LoginPage(page);
  const membersPage = new MembersPage(page);
  const fakeValues = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    notes: faker.lorem.sentence(),
  }
  // Login
  await loginPage.open();
  await loginPage.login(user.email, user.password);
  expect(await loginPage.userIsLoggedIn()).toBeTruthy();

  // Go to members page
  await membersPage.open();
  // Create member with invalid email
  await membersPage.createMember(fakeValues.name, fakeValues.email.replace(/@.*$/, ''), fakeValues.notes, false);
  //Validate the creation failed
  expect(await membersPage.creationStatus()).toBeFalsy();
  // Try again with a valid email
  await membersPage.retryMember({ email: fakeValues.email });
  //Validate the creation succeeded
  expect(await membersPage.creationStatus()).toBeTruthy();
});
