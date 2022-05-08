/*
- Escenario de prueba 2:
Login
Crear miembro cvon nombre A y email X
Revisar que el miembro fue creado
Crear miembro cvon nombre A y email y
Revisar que el miembro fue creado
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
test('Create Member with same name', async ({ page }) => {
    // Intances and fakerValues
    const loginPage = new LoginPage(page);
    const membersPage = new MembersPage(page);
    const membersPage2 = new MembersPage(page);
    const fakeValues = {
        namea: faker.name.findName(),
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

    // Create member
    await membersPage.createMember(fakeValues.namea, fakeValues.emailx, fakeValues.notes);

    //Validated Creation
    await membersPage.open();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3', { hasText: fakeValues.namea })).toHaveCount(1);

    // Create member
    await membersPage.createMember(fakeValues.namea, fakeValues.emaily, fakeValues.notes);
    
    //Validated Creation
    await membersPage.open();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3', { hasText: fakeValues.namea })).toHaveCount(2);
    await expect(page.locator('p', { hasText: fakeValues.emailx })).toHaveCount(1);
});