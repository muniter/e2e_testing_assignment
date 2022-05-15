/*
- Escenario de prueba 8:
"Login
Crear miembro con nombre A
Crear miembro con nombre B
Filtrar miembro usando parte distintiva del nombre de A
Asegurar que aparezca en la lista el miembro A
Asegurar que no aparezca en la lista el miembro B"
*/
import { test, expect } from '@playwright/test';
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import faker from '@faker-js/faker';
// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test('Filter member', async ({ page }, testinfo) => {
  // Intances and fakerValues
  const loginPage = new LoginPage(page);
  const membersPage = new MembersPage(page);
  const fakeValues = {
    namea: faker.name.findName(),
    nameb: 'ZZZ' + faker.name.findName(),  // Distinctive name won't show up by chance
    emailx: faker.internet.email(),
    emaily: faker.internet.email(),
    notes: faker.lorem.sentence(),
    filter: faker.random.alpha(7),
  }
  // Login
  await loginPage.open();
  await loginPage.login();
  expect(await loginPage.userIsLoggedIn()).toBeTruthy();

  // Go to members page
  await membersPage.open();

  let only_name = fakeValues.namea
  // Create member A with email x and special name to match the filter
  await membersPage.createMember(fakeValues.namea, fakeValues.emailx, fakeValues.notes);
  // Create member B
  await membersPage.createMember(fakeValues.nameb, fakeValues.emaily, fakeValues.notes);

  //Validate by searching for the first member name
  await membersPage.filterMembers(fakeValues.namea);
  await expect(membersPage.containsName(only_name)).toHaveCount(1);
  await expect(membersPage.containsName(fakeValues.nameb)).toHaveCount(0);
});
