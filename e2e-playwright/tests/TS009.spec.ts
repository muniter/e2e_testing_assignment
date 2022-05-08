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
    await membersPage.createMember('Im going to be deleted', fakeValues.emailx, fakeValues.notes);
    await membersPage.createMember('Im going to be deleted', fakeValues.emaily, fakeValues.notes);

    //Validate search member A
    await membersPage.search.fill('Im going to be deleted');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    await membersPage.actions.click();
    await page.locator('button', { hasText: "Delete selected members" }).click();
    await page.locator('button', { hasText: "Download backup" }).click();

    await expect(membersPage.containsEmail(fakeValues.emailx)).toHaveCount(0);
    await expect(membersPage.containsEmail(fakeValues.emaily)).toHaveCount(0);
});
