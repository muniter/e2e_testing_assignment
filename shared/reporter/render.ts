import * as fs from 'fs';
import { Report } from './types';
import * as nunjucks from 'nunjucks';

export function render(report: Report, program: string, destination: string, live: boolean = false): boolean {
  let FAILED_VALUE = 2; // 8%
  let should_exit = true; // Used to tell the caller to not exit the program

  // Pass the template which scenarios failed
  let diff = report.diff;
  diff?.scenarios?.map((scenario) => {
    let scenfailed = false
    scenario?.steps.map((step) => {
      let stepfailed = step?.data?.rawMisMatchPercentage > FAILED_VALUE;
      // @ts-ignore YOLOOOOO
      step.failed = stepfailed;
      if (stepfailed) {
        scenfailed = true;
      }
      return step;
    })
    // @ts-ignore YOLOOOOO
    scenario.failed = scenfailed;
    return scenario;
  });

  let nunjucksConfig: nunjucks.ConfigureOptions = {
    autoescape: true,
    noCache: true,
    watch: true,
    throwOnUndefined: true,
  }

  let view = {
    process: program,
    prev: report.prev.version,
    post: report.post.version,
    scenarios: diff?.scenarios,
  }

  if (live) {
    should_exit = false;
    const express = require('express');
    let app = express();
    nunjucksConfig.express = app;
    nunjucks.configure(nunjucksConfig)
    app.use(express.static('.'));
    // Render an html file
    app.get('/', function(_: any, res: any) {
      res.render('./shared/reporter/template.html', view)
    });
    app.listen(3000, function() {
      console.log('Listening on port 3000');
    })
  }
  nunjucks.configure(nunjucksConfig)
  let out = nunjucks.render('./shared/reporter/template.html', view);
  fs.writeFileSync(`./${program}.html`, out);
  console.log(`Report rendered to ${destination}/${program}.html`);
  return should_exit
}
