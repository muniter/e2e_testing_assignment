/*
- Escenario de prueba 9:
Login
Crear miembro con nombre A y email B
Crear miembro con nombre A y email C
Filtrar miembros usando el nombre A 
Hacer una operación eliminar filtrados
Volver a la lista general
Filtrar nuevamente con nombre A
Validar que ninguno de los miembros con correo B y C aparecen
*/
import { test, expect } from '@playwright/test';
import { user } from '../data/testData';
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import faker from '@faker-js/faker';
// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test('Filter member delete', async ({ page }) => {
  // Intances and fakerValues
  const loginPage = new LoginPage(page);
  const membersPage = new MembersPage(page);
  const fakeValues = {
    namea: faker.name.findName(),
    nameb: faker.name.findName(),
    emailx: faker.internet.email(),
    emaily: faker.internet.email(),
    notes: faker.lorem.sentence(),
  }
  // Login
  await loginPage.open();
  await loginPage.login(user.email, user.password);
  expect(await loginPage.userIsLoggedIn()).toBeTruthy();

  // Go to members page
  await membersPage.open();
  await membersPage.createMember('Im going to be deleted', fakeValues.emailx, fakeValues.notes);
  await membersPage.createMember('Im going to be deleted', fakeValues.emaily, fakeValues.notes);

  // Search for both members
  await membersPage.filterMembers('Im going to be deleted');
  await membersPage.deleteMemberMultiple();

  await expect(membersPage.containsEmail(fakeValues.emailx)).toHaveCount(0);
  await expect(membersPage.containsEmail(fakeValues.emaily)).toHaveCount(0);
});
