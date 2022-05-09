/*
- Escenario de prueba 7:
Login
Crear miembro
Revisar que el miembro fue creado
Entrar a vista de edición de miembro
Eliminar miembro
Revisar que no aparece y ha sido eliminado correctamente
*/
import { test, expect } from '@playwright/test';
import { user } from '../data/testData';
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import faker from '@faker-js/faker';
// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test('Delete member', async ({ page }) => {
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

  // Create member X
  await membersPage.createMember(fakeValues.name, fakeValues.email, fakeValues.notes, false);
  // Check it was created
  expect(membersPage.creationStatus).toBeTruthy();
  await membersPage.deleteCurrentMember();
  // Now that we are on the list after deletion check it's not there
  await expect(membersPage.containsEmail(fakeValues.email)).toHaveCount(0);
});
