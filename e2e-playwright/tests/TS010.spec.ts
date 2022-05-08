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
        label: faker.lorem.word(),
      }
    // Login
    await loginPage.open();
    await loginPage.login(user.email, user.password);
    expect(await loginPage.userIsLoggedIn()).toBeTruthy();

    // Go to members page
    await membersPage.open();

    // Create member name A email B
    await membersPage.createMember(fakeValues.namea, fakeValues.emaila, fakeValues.notes, true, fakeValues.label);
    await membersPage.open();

    // Create member name A email C
    await membersPage.createMember(fakeValues.namea, fakeValues.emailb, fakeValues.notes, true, fakeValues.label);
    await membersPage.open();

    //Validate search member A
    await page.waitForLoadState('networkidle');
    await page.locator('input[placeholder="Search members..."]').fill(fakeValues.namea);

    //Delete members
    await page.locator('button:has-text("Filter")').click();
    await page.locator('option[value="Label"]').click();
    await page.locator('li', { hasText: fakeValues.label }).click({ timeout: 3000});
    await page.locator('button:has-text("Apply filters")').click();

    //Remove Label
    await page.locator('button:has-text("Actions")').click();
    await page.locator('button:has-text("Remove label from selected members")').click();
    await page.locator('button:has-text("Remove Label")').click();

    //Validate delete
    await membersPage.open();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3', { hasText: fakeValues.emaila })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: fakeValues.emaila })).toHaveCount(0);
});
