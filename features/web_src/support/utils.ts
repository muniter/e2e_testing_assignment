import fs from 'fs';
import { VERSION } from '../../../shared/SharedConfig';

export interface ScenarioInformation {
  name: string,
  path: string,
  step: number,
  report: string,
}

export function getCurrentScenario(): ScenarioInformation {
  let args = process.argv
  // Feature file path is number 6 and the json reoprt is number 5
  return {
    name: args[6]?.match(/features\/(?<name>.*)\.feature/)?.groups?.name!,
    path: args[6]!,
    step: 0,
    report: args[5]?.split(':', 2)[1]!
  }
}

export function saveScenarioReportInfo(scenario: ScenarioInformation) {
  // Create the directory
  let dir = `screenshots/kraken/${VERSION}`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log('\nCreating VRT report directory for the first time:', dir)
  }
  let data: ScenarioInformation[] = []
  let fname = dir + '/toProcess.json'
  // Read first
  if (fs.existsSync(fname)) {
    data = JSON.parse(fs.readFileSync(fname, 'utf8')) as ScenarioInformation[]
    // If this scenarios is in the json file, it's out of date and belongs to
    // a previous run, detele it. This relies on same ordering of the scenarios
    if (data.findIndex(d => d.name === scenario.name) !== -1) {
      data = []
    }
  }

  data.push(scenario)
  fs.writeFileSync(fname, JSON.stringify(data))
}
