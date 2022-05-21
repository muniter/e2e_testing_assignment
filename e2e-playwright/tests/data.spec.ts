import { test, expect, TestInfo, Page } from '@playwright/test';
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import { Cookie, nameDataScenario } from '../util/util'
import { Scenarios, ScenarioConfig, DataPools, getData, generateCombinations } from '../util/dataGenerator';
import { StaffPage } from '../page/StaffPage';
import { SiteConfig } from '../../shared/SharedConfig';
import { TagPage } from '../page/TagPage';

// Run this tests in parallel
test.describe.configure({ mode: 'parallel' })

type ScenarioTestConfig = {
  page: Page,
  testinfo: TestInfo,
  identifier: string,
  scenario: ScenarioConfig,
}

let poolcounter = 0;
function oneDataPool() {
  poolcounter++;
  return DataPools[poolcounter % DataPools.length];
}

async function runScenario(config: ScenarioTestConfig, cookie: Cookie) {
  const { page, testinfo, identifier, scenario } = config;
  const { oracle } = scenario
  // This method generates the member using the provided pool configuration
  const data = getData({ identifier: identifier, pool: cookie.pool })
  let res: boolean;

  // Login
  if (!cookie.loggedIn) {
    const loginPage = new LoginPage(page, testinfo);
    await loginPage.open();
    await loginPage.login();
    expect(await loginPage.userIsLoggedIn()).toBeTruthy();
    cookie.loggedIn = true;
  }
  if (scenario.model === 'member') {
    // Go to members page
    const membersPage = new MembersPage(page, testinfo);
    // Create member with the given data, returns true if created successfully or false if the creation faileed
    res = await membersPage.CreateMember(data);

  } else if (scenario.model === 'staff') {
    // Go to the staff edit page
    const staffPage = new StaffPage(page, testinfo);
    await staffPage.open();
    // Edit the staff with the given data, returns true if saved successfully or false if the edition failed
    res = await staffPage.editStaff(data);

  } else if (scenario.model === 'tag') {
    const tagPage = new TagPage(page, testinfo);
    await tagPage.open();
    // Edit the staff with the given data, returns true if saved successfully or false if the edition failed
    res = await tagPage.createTag(data);

  } else {
    throw new Error(`Unknown model: ${scenario.model}`);
  }
  // The scenarios data comes from the data pool and the oracles is defined with the data
  expect(res).toBe(oracle);
}

let scenariosRun: Cookie[] = []
let counter = 1
Object.entries(Scenarios).forEach(([identifier, scenario]) => {
  // Run each scenario individually
  let pool = oneDataPool();
  let cookie: Cookie = { loggedIn: false, scenarios: [scenario], pool: pool }
  test(nameDataScenario(cookie, counter), async ({ page }, testinfo) => {
    await runScenario({ page, testinfo, identifier, scenario }, cookie);
    scenariosRun.push(cookie);
  });
  counter++;
})

// let numberOfCombinations = 90 - 15 + 1 - counter
// console.log('Number of combination scenarios: ', numberOfCombinations)
// let combinations = generateCombinations(numberOfCombinations)
// combinations.forEach((combination) => {
//   let identifier_1 = combination[0]
//   let scenario_1 = Scenarios[identifier_1]
//   let identifier_2 = combination[1]
//   let scenario_2 = Scenarios[identifier_2]
//   let pool = oneDataPool();
//   let cookie: Cookie = { loggedIn: false, scenarios: [scenario_1, scenario_2], pool }
//   test(nameDataScenario(cookie, counter), async ({ page }, testinfo) => {
//     await runScenario({ page, testinfo, identifier: identifier_1, scenario: scenario_1 }, cookie);
//     await runScenario({ page, testinfo, identifier: identifier_2, scenario: scenario_2 }, cookie);
//   });
//   counter++;
// })
