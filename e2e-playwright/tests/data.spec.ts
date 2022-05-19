import { test, expect } from '@playwright/test';
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import { VRTBeforeAll } from '../util/util';
import { getMember, getStaff, Scenarios, DataPoolType } from '../util/dataGenerator';
import { StaffPage } from '../page/StaffPage';

const DataPools: DataPoolType[] = ['apriori', 'dynamic', 'random'];

test.beforeAll(VRTBeforeAll);

// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })

let memberScenarios = Object.entries(Scenarios.member);

let counter = 1;
DataPools.forEach(pool => {
  memberScenarios.forEach(([identifier, scenario]) => {
    const { title, oracle } = scenario;
    let oracleType = oracle ? 'positive' : 'negative'
    test(`${counter}. Pool (${pool}): Member creation: ${title}. (Oracle: ${oracleType})`, async ({ page }, testinfo) => {
      // This method generates the member using the provided pool configuration
      const member = getMember({ pool: 'random', identifier: identifier, config: scenario })

      // Login
      const loginPage = new LoginPage(page, testinfo);
      await loginPage.open();
      await loginPage.login();
      expect(await loginPage.userIsLoggedIn()).toBeTruthy();

      // Go to members page
      const membersPage = new MembersPage(page, testinfo);
      // Create member with the given data, returns true if created successfully
      // or false if the creation failed
      // console.log(member);
      let res = await membersPage.CreateMember(member);
      // The scenarios data comes from the data pool and the oracles is defined with the data
      expect(res).toBe(oracle);
    });
    counter = counter + 1;
  })

  let staffScenarios = Object.entries(Scenarios.staff);
  staffScenarios.forEach(([identifier, scenario]) => {
    const { title, oracle } = scenario;
    let oracleType = oracle ? 'positive' : 'negative'
    test(`${counter}. Pool (${pool}): Staff edition: ${title}. (Oracle: ${oracleType})`, async ({ page }, testinfo) => {
      // This method generates the member using the provided pool configuration
      const staffEdit = getStaff({ pool: 'random', identifier: identifier, config: scenario })

      // Login
      const loginPage = new LoginPage(page, testinfo);
      await loginPage.open();
      await loginPage.login();
      expect(await loginPage.userIsLoggedIn()).toBeTruthy();

      // Go to the staff edit page
      const staffPage = new StaffPage(page, testinfo);
      await staffPage.open();
      // Edit the staff with the given data, returns true if saved successfully
      // or false if the edition failed
      // console.log(staffEdit)
      let res = await staffPage.editStaff(staffEdit);
      // The scenarios data comes from the data pool and the oracles is defined with the data
      expect(res).toBe(oracle);
    });
    counter = counter + 1;
  })
})
