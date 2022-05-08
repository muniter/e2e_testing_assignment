/*
- Escenario de prueba 5:
Login
Crear miembro con email X
Validar creación
Crear miembro con email Y
Validar creación
Editar miembro con email Y colocando email de X
Intentar guardar
Verificar fallo del guardado por duplicado
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
test('Create member duplicate email', async ({ page }) => {
    // Intances and fakerValues
    const loginPage = new LoginPage(page);
    const membersPage = new MembersPage(page);
    const membersPage2 = new MembersPage(page);
    const fakeValues = {
        namex: faker.name.findName(),
        namey: faker.name.findName(),
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

    // Create member X
    await membersPage.createMember(fakeValues.namex, fakeValues.emailx, fakeValues.notes);

    //Validated Creation X
    await membersPage.open();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3', { hasText: fakeValues.namex })).toHaveCount(1);
    await expect(page.locator('p', { hasText: fakeValues.emailx })).toHaveCount(1);

    // Create member Y
    await membersPage.createMember(fakeValues.namey, fakeValues.emaily, fakeValues.notes);
    
    //Validated Creation Y
    await membersPage.open();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3', { hasText: fakeValues.namey })).toHaveCount(1);
    await expect(page.locator('p', { hasText: fakeValues.emaily })).toHaveCount(1);

    //Edit member Y put email X
    await page.locator('h3', { hasText: fakeValues.namey }).click();
    await page.locator('input[id="member-email"]').fill(fakeValues.emailx);
    await page.locator('button:has-text("Save")').click();

    //Validated error
    await expect(page.locator('button', { hasText: 'Retry' })).toHaveCount(1);
    //await expect(page.locator('div[class="gh-alert-content"] >> text="Validation error, cannot edit member. Member already exists. Attempting to edit member with existing"')).toHaveCount(1);

});