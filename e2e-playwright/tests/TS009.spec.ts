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
test('Filter member delete', async ({ page }) => {
    // Intances and fakerValues
    const loginPage = new LoginPage(page);
    const membersPage = new MembersPage(page);
    const membersPage2 = new MembersPage(page);
    const fakeValues = {
        namea: faker.name.findName(),
        emaila: faker.internet.email(),
        emailb: faker.internet.email(),
        notes: faker.lorem.sentence(),
      }
    // Login
    await loginPage.open();
    await loginPage.login(user.email, user.password);
    expect(await loginPage.userIsLoggedIn()).toBeTruthy();

    // Go to members page
    await membersPage.open();

    // Create member name A email B
    await membersPage.createMember(fakeValues.namea, fakeValues.emaila, fakeValues.notes);
    await membersPage.open();

    // Create member name A email C
    await membersPage.createMember(fakeValues.namea, fakeValues.emailb, fakeValues.notes);
    await membersPage.open();

    //Validate search member A
    await page.waitForLoadState('networkidle');
    await page.locator('input[placeholder="Search members..."]').fill(fakeValues.namea);

    //Delete members
    await page.locator('button:has-text("Actions")').click();
    await page.locator('button:has-text("Delete selected members (2)")').click();
    await page.locator('button:has-text(""Download backup & delete members"")').click();

    //Validate delete
    await membersPage.open();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3', { hasText: fakeValues.emaila })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: fakeValues.emaila })).toHaveCount(0);
});