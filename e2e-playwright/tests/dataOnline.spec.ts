import { test, expect } from '@playwright/test';
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import { VRTBeforeAll } from '../util/util';
import { generateMember, ScenariosSchema } from '../util/dataGenerator';

test.beforeAll(VRTBeforeAll);

// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })

let scenarios = Object.values(ScenariosSchema.member);

scenarios.forEach(scenario => {
  const { title, oracle } = scenario;
  let oracleType = oracle ? 'positive' : 'negative'
  test(`Member creation: ${title}. (Oracle:  ${oracleType})`, async ({ page }, testinfo) => {
    // This method generates the member using the provided pool configuration
    const member = generateMember({ pool: 'random', config: scenario })

    // Login
    const loginPage = new LoginPage(page, testinfo);
    await loginPage.open();
    await loginPage.login();
    expect(await loginPage.userIsLoggedIn()).toBeTruthy();

    // Go to members page
    const membersPage = new MembersPage(page, testinfo);
    // Create member with the given data, returns true if created successfully
    // or false if the creation faileed
    let res = await membersPage.CreateMember(member);
    // The scenarios data comes from the data pool and the oracles is defined with the data
    expect(res).toBe(oracle);
  });
})
