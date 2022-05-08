/*
- Escenario de prueba 10:
Login
Crear miembro A con label X
Crear miembro B con label X
Filtrar miembros
Hacer una operación múltiple eliminar label X
Entrar a vista miembro A y verificar que no tiene label X
Entrar a vista miembro B y verificar que no tiene label X
*/
import { test, expect } from '@playwright/test';
import { user } from '../data/testData';
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import faker from '@faker-js/faker';
import setup from '../setup';
// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test.beforeAll(async ({ browser }) => {
    // The first login guarantees that we have a valid session
    // and then we can parallelize the tests
    const page = await browser.newPage();
    await setup(page);
    await page.close();
})
test('Filter member remove label', async ({ page }) => {
    // Intances and fakerValues
    const loginPage = new LoginPage(page);
    const membersPage = new MembersPage(page);
    const fakeValues = {
        namea: faker.name.findName(),
        emaila: faker.internet.email(),
        emailb: faker.internet.email(),
        notes: faker.lorem.sentence(),
        label: faker.lorem.word(7),
      }
    // Login
    await loginPage.open();
    await loginPage.login(user.email, user.password);
    expect(await loginPage.userIsLoggedIn()).toBeTruthy();

    // Go to members page
    await membersPage.open();
    await membersPage.createMember(fakeValues.namea, fakeValues.emaila, fakeValues.notes, true, fakeValues.label);
    await membersPage.createMember(fakeValues.namea, fakeValues.emailb, fakeValues.notes, true, fakeValues.label);

    // Filter members and remove the label
    await membersPage.filterMembers(fakeValues.namea);
    await membersPage.removeLabelMultiple(fakeValues.label);

    // Check that the members don't have the label
    await membersPage.openMember({ email: fakeValues.emaila });
    await expect(membersPage.containsLabel(fakeValues.label)).toHaveCount(0);
    await membersPage.openMember({ email: fakeValues.emailb });
    await expect(membersPage.containsLabel(fakeValues.label)).toHaveCount(0);
});
