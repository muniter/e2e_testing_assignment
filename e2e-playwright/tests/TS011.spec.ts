/* 
- Escenario de prueba 11:
11.1 Login
11.2 Crear Post
11.3 Validar creación del Post
*/

import { test, expect } from '@playwright/test';
import { user } from '../data/testdata';
import { LoginPage } from '../page/LoginPage';
import { PostsPage } from '../page/PostsPage';
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

test('User can login and post once', async ({ page }) => {
    
    // Intances and fakerValues
    const loginPage = new LoginPage(page);
    const postsPage = new PostsPage(page);
    const fakeValues = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
    }
    
    await loginPage.login(user.email, user.password);
    expect(await loginPage.userIsLoggedIn()).toBeTruthy();

    await postsPage.createPost(fakeValues.title, fakeValues.content);
    expect(await postsPage.isPublished(fakeValues.title)).toBeTruthy();
});



      
    


  

