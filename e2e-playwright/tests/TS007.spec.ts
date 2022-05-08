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
    await membersPage.createMember(fakeValues.name, fakeValues.email, fakeValues.notes);

    //Validated Creation
    await membersPage.open();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3', { hasText: fakeValues.name })).toHaveCount(1);
    await expect(page.locator('p', { hasText: fakeValues.email })).toHaveCount(1);

    //Delete member
    await page.locator('h3', { hasText: fakeValues.name }).click();
    await page.locator('button:has-text("Actions")').click();
    await page.locator('button:has-text("Delete member")').click();
    await page.keyboard.press('Enter');

    //Validated error
    await expect(page.locator('p', { hasText: fakeValues.email })).toHaveCount(0);

});
