// Takes care of generating the reports
import * as fs from 'fs';
import { processKraken } from './krakenProcess';
import { randomUUID } from 'crypto';
import { Command, Option, program } from 'commander';
import { Report, ScenarioReportFormat, ScenarioStep } from '../types';
import { deleteCreateDir } from '../util';
const compareImages = require("resemblejs/compareImages");
import { ComparisonOptions } from 'resemblejs';
import { render } from './render';

async function main(command: Command) {
  let opts = command.opts();
  let reportDir: string
  let imagesDir: string
  let reportFile: string
  let report: Report
  // Fisrt thing is processing
  let toprocess = opts?.process;
  if (toprocess == 'kraken') {

    // Process kraken
    reportDir = `screenshots/kraken/report_${opts.prev}_${opts.post}`;
    imagesDir = reportDir + '/images';
    reportFile = reportDir + '/report.json';
    if (!opts.onlyrender) {
      report = processKraken(opts.prev, opts.post, reportDir);
    } else {
      // Only rendering, load the existing one
      if (!fs.existsSync(reportFile)) {
        throw new Error('No report file found: ' + reportFile);
      }
      report = JSON.parse(fs.readFileSync(reportFile).toString()) as Report;
    }

  } else if (toprocess = 'playwright') {

    // Process playwright
    reportDir = `screenshots/playwright/report_${opts.prev}_${opts.post}`;
    reportFile = reportDir + '/report.json';
    imagesDir = reportDir + 'images';
    deleteCreateDir(reportDir);
    deleteCreateDir(imagesDir);
    if (!opts.onlyrender) {
      // TODO: Implement
      // result = processPlaywright(opts.prev, opts.post);
    } else {
      // Only rendering, load the existing one
      if (!fs.existsSync(reportFile)) {
        throw new Error('No report file found: ' + reportFile);
      }
      report = JSON.parse(fs.readFileSync(reportFile).toString()) as Report;
    }
    throw new Error('Playwright not implemented yet');

  } else {
    throw new Error('No process specified');
  }


  // Then when everything is processed we can do image comparison
  if (!opts.onlyrender && report) {
    // Make sure we are comparing the same thing
    if (report.prev.scenarios.length != report.post.scenarios.length) {
      throw new Error('Scenarios count does not match');
    }

    // Geneerate the diff item in the report
    report.diff = { version: 'combined', scenarios: [] };
    // Create the images directory, remove an old one
    deleteCreateDir(imagesDir);
    console.log('Starting diff report, image comparison will take some time...');
    // Now by looping through the scenarios for each of the ghost verison, we
    // prodcuce a third "test suite" named diff, which is a comparison of
    // images of prev and post steps
    for (let i = 0; i < report.prev.scenarios.length; i++) {
      let prev_scenario = report.prev.scenarios[i]!;
      let post_scenario = report.post.scenarios[i]!;
      // Generate the steps
      let scenario_diff = {
        name: prev_scenario.name,
        file: prev_scenario.file,
        steps: await diffScenariosSteps(prev_scenario, post_scenario, imagesDir)
      }
      report.diff.scenarios.push(scenario_diff);
    }
  }
  // Finally we can write the report which will be used for the HTML
  console.log(`Kraken report generated for versions ${opts.prev} and ${opts.post} at ${reportFile.replace(process.cwd(), '')}`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  // Render the report
  let should_exit = render(report, toprocess, reportDir, opts.live);
  console.log('Report generated in: ' + reportDir);
  if (should_exit) {
    process.exit(0);
  }
  // Wait forever
}

// Pass two scenarios (the same scenario in two ghost versions) and return the
// steps of the third "diff" scenario by running the images over ressemblejs
async function diffScenariosSteps(prev: ScenarioReportFormat, post: ScenarioReportFormat, imagesDir: string): Promise<ScenarioStep[]> {
  let steps: ScenarioStep[] = []
  if (prev.steps.length != post.steps.length) {
    throw new Error('Steps count does not match');
  }
  for (let i = 0; i < prev.steps.length; i++) {
    let prev_step = prev.steps[i]!;
    let post_step = post.steps[i]!;
    // Generate the diff
    let data = await getDiff(prev_step.image, post_step.image, imagesDir + '/' + randomUUID() + '.png');
    let image = data.image
    data.image = undefined;
    // Move the prev and post images to the images dir and change it's path
    steps.push({
      name: prev_step.name,
      image: image,
      data: data
    });
  }
  return steps;
}

// Run resemblejso over two paths (scenario step images) and return the data from ressemble
async function getDiff(prev: string, post: string, output: string): Promise<Record<string, any>> {
  const options: ComparisonOptions = {
    output: {
      errorColor: {
        red: 255,
        green: 0,
        blue: 255
      },
      errorType: "movement",
      transparency: 0.3,
      largeImageThreshold: 1200,
      useCrossOrigin: false,
    },
    scaleToSameSize: true,
    ignore: "antialiasing"
  };

  // Call resemblejs get the diff and save it at the expected location
  const data = await compareImages(fs.readFileSync(prev), fs.readFileSync(post), options)!;
  if (data && data.getBuffer) {
    let buffer = data.getBuffer(false)
    fs.writeFileSync(output, buffer);
    return {
      image: output,
      prev: prev,
      post: post,
      isSameDimensions: data.isSameDimensions,
      dimensionDifference: data.dimensionDifference,
      rawMisMatchPercentage: data.rawMisMatchPercentage,
      misMatchPercentage: data.misMatchPercentage,
      diffBounds: data.diffBounds,
      analysisTime: data.analysisTime
    };
  } else {
    throw new Error('No data from resemblejs, or no buffer');
  }
}



// Entrypoint

program
  .addOption(new Option('--process <tool>', 'Process the report data from plawyright or kraken').choices(['kraken', 'plawright']))
  // .option('--kraken', 'Process the report data from kraken')
  // .option('--plawyright', 'Process the report data from playwright')
  .option('--report', 'Generate the report')
  .option('--onlyrender', 'Render the report only')
  .option('--live', 'Live render the report')
  .requiredOption('--prev <string>', 'Version to take as prev')
  .requiredOption('--post <string>', 'Version to taskes as post')

main(program.parse(process.argv));
