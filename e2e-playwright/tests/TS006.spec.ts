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

    // Create member X
    await membersPage.createMember(fakeValues.name, fakeValues.email.replace(/@.*$/, ''), fakeValues.notes, false);

    //Validated Creation
    await expect(page.locator('button', { hasText: 'Retry' })).toHaveCount(1);
    await expect(page.locator('p[class="response"] >> text="Invalid Email."')).toHaveCount(1);

    //Change email
    await page.waitForLoadState('networkidle');
    await page.locator('input[id="member-email"]').fill(fakeValues.email);
    await page.locator('button:has-text("Retry")').click();

    //Validated Creation
    await membersPage.open();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3', { hasText: fakeValues.name })).toHaveCount(1);
    await expect(page.locator('p', { hasText: fakeValues.email })).toHaveCount(1);
});
