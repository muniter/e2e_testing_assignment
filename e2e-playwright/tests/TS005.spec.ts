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
// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })
test('Create member duplicate email', async ({ page }) => {
    // Intances and fakerValues
    const loginPage = new LoginPage(page);
    const membersPage = new MembersPage(page);
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
    await expect(membersPage.containsName(fakeValues.namex)).toHaveCount(1);
    await expect(membersPage.containsEmail(fakeValues.emailx)).toHaveCount(1);

    // Create member Y
    await membersPage.createMember(fakeValues.namey, fakeValues.emaily, fakeValues.notes);
    //Validated Creation Y
    await expect(membersPage.containsName(fakeValues.namey)).toHaveCount(1);
    await expect(membersPage.containsEmail(fakeValues.emaily)).toHaveCount(1);

    //Edit member Y put email X, edit member returns false if it failed saving
    expect(await membersPage.editMember({ currEmail: fakeValues.emaily }, { email: fakeValues.emailx })).toBeFalsy()
});
