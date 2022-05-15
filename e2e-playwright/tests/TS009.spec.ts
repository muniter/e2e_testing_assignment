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
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import faker from '@faker-js/faker';
import { VRTBeforeAll } from '../util/util';

test.beforeAll(VRTBeforeAll);
faker.seed(123);
// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test('Filter member delete', async ({ page }, testinfo) => {
  // Intances and fakerValues
  const loginPage = new LoginPage(page, testinfo);
  const membersPage = new MembersPage(page, testinfo);
  const fakeValues = {
    namea: faker.name.findName(),
    nameb: faker.name.findName(),
    emailx: faker.internet.email(),
    emaily: faker.internet.email(),
    notes: faker.lorem.sentence(),
  }
  // Login
  await loginPage.open();
  await loginPage.login();
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
