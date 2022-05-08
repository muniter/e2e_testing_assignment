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
test('Filter memberX', async ({ page }) => {
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

    // Create member A
    await membersPage.createMember(fakeValues.namea, fakeValues.emailx, fakeValues.notes);
    await membersPage.open();

    // Create member B
    await membersPage.createMember(fakeValues.nameb, fakeValues.emaily, fakeValues.notes);
    await membersPage.open();

    //Validate search member A
    await page.waitForLoadState('networkidle');
<<<<<<< Updated upstream
    await page.locator('input[placeholder="Search members..."]').fill(fakeValues.namea);
    await page.locator('button:has-text("Actions")').click();
    await page.locator('button:has-text("Delete selected members (2)")').click();
    await page.locator('button:has-text(""Download backup & delete members"")').click();
    //await expect(page.locator('h3', { hasText: fakeValues.namea }).isVisible()).toBeTruthy
    expect(page.locator('h3', { hasText: fakeValues.nameb }).isHidden());
    expect(page.locator('h3', { hasText: fakeValues.namea }).isHidden());
});
=======
    await membersPage.search.fill(fakeValues.namea);
    await expect(page.locator('h3', { hasText: fakeValues.namea })).toBeVisible();
    await expect(page.locator('h3', { hasText: fakeValues.nameb })).not.toBeVisible();
});
>>>>>>> Stashed changes
