import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { KrakenReportFormat, Report, ScenarioInformation, ScenarioReportFormat, TestSuiteReportFormat } from './types';
import { deleteCreateDir } from './util';

export function processKraken(prev: string, post: string, reportDir: string): Report {
  deleteCreateDir(reportDir);
  const outputFile = reportDir + '/report.json'
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
  let out = {
    prev: generateReport(prev),
    post: generateReport(post),
  }

  // Process to move the image from base64 to file
  let versions = [prev, post]
  versions.forEach(version => {
    let dir = `${process.cwd()}/screenshots/kraken/${version}/images`
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir);
  })

  // Replace images for paths and write the to file
  Object.values(out).forEach((report) => {
    report.scenarios.forEach(scenario => {
      scenario.steps.forEach(step => {
        if (step.base64) {
          let imageName = `${process.cwd()}/screenshots/kraken/${report.version}/images/${randomUUID()}.png`
          writeBase64toFile(step.image, imageName);
          step.image = imageName;
        }
      })
    })
  })

  fs.writeFileSync(outputFile, JSON.stringify(out, null, 2));
  console.log(`Kraken PRE processing report generated for versions ${prev} and ${post} at ${outputFile.replace(process.cwd(), '')}`);
  return out;
}

export function generateReport(version: string): TestSuiteReportFormat {
  let toProcessFile = `${process.cwd()}/screenshots/kraken/${version}/toProcess.json`;
  // Try opening the file, and error if it doesn't exist
  try {
    fs.accessSync(toProcessFile);
  } catch (err) {
    throw new Error(`File ${toProcessFile} does not exist`);
  }
  // Read the file, array of ScenarioInformation
  let toProcess: Array<ScenarioInformation> = JSON.parse(fs.readFileSync(toProcessFile, 'utf8'));
  let report: TestSuiteReportFormat = {
    version,
    scenarios: [],
  }
  // Loop through the array calling process
  toProcess.forEach(scenario => {
    report.scenarios.push(processKrakenOriginalReport(scenario.report));
  })
  // Write the report to a file
  return report;
}

export function processKrakenOriginalReport(reportPath: string): ScenarioReportFormat {
  let file = fs.readFileSync(reportPath, 'utf8')
  let report = JSON.parse(file) as Array<KrakenReportFormat>
  if (report.length < 1) {
    throw new Error('No report found')
  }
  let cwd = process.cwd()
  let rep = report.shift()
  let scenario = rep?.elements?.shift()!
  // Filter only the steps
  let reg = /(Given|When|Then|And)\s?/
  let steps = scenario.steps.filter(step => step.keyword.match(reg))
  // Prepare the output
  let output: ScenarioReportFormat = {
    // @ts-ignore
    name: rep.uri.replace(/(.feature|^.*?\/)/g, ''),
    // @ts-ignore
    file: cwd + '/' + rep.uri,
    steps: [],
  }

  steps.map(step => {
    output.steps.push({
      name: step.name || '',
      image: step.embeddings?.[0]?.data || '',
      base64: Boolean(step.embeddings),
    })
  })

  return output
}

function writeBase64toFile(base64: string, file: string) {
  let data = Buffer.from(base64, 'base64');
  fs.writeFileSync(file, data);
}
