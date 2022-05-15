import * as fs from 'fs';
import { Report, ScenarioStep, ScenarioReportFormat, TestSuiteReportFormat } from './types';
import { deleteCreateDir } from '../util';

export function processPlaywright(prev: string, post: string, reportDir: string): Report {
  deleteCreateDir(reportDir);
  const outputFile = reportDir + '/report.json'
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
  let out = {
    prev: generateReport(prev),
    post: generateReport(post),
  }

  fs.writeFileSync(outputFile, JSON.stringify(out, null, 2));
  console.log(`Playwright PRE processing report generated for versions ${prev} and ${post} at ${outputFile}`);
  return out;
}

export function generateReport(version: string): TestSuiteReportFormat {
  // Directory where the screenshots are
  let toProcessDir = `./screenshots/playwright/${version}`;

  // Get all the directories (test scenarios) in the directory
  let dirsScenarios = fs.readdirSync(toProcessDir).sort();


  // The report for this version of playwright
  let report: TestSuiteReportFormat = {
    version: version,
    scenarios: []
  };

  // For each directory, get the screenshots and generate the report
  for (let dirIdx in dirsScenarios) {
    let scenarioName = dirsScenarios[dirIdx]!
    let scenario: ScenarioReportFormat = {
      name: scenarioName,
      steps: [],
      file: 'whatever'  // TODO: add filename
    };
    // Get each step
    let filesSteps = fs.readdirSync(`${toProcessDir}/${scenarioName}`).sort();
    for (let fileIdx in filesSteps) {
      let fileName = filesSteps[fileIdx]!;
      let { name } = fileName.match(/(^\d+)_(?<name>.*?)\.png/)?.groups!

      if (name) {
        name = name.replace('_', ' ');
      } else {
        console.error(`Error parsing step ${fileIdx} with name ${name}`);
        process.exit(1);
      }

      // Push a step of the scenario
      let step: ScenarioStep = {
        name: name,
        image: `${toProcessDir}/${scenarioName}/${fileName}`
      }
      scenario.steps.push(step);

    }
    // Push the whole scenario
    report.scenarios.push(scenario);
  }
  return report;
}
