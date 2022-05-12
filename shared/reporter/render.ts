import * as fs from 'fs';
import { Report } from './types';
// import mustache from 'mustache';
const Mustache = require('mustache');

export function render(report: Report, destination: string) {
  let view = {
    process: 'kraken',
    prev: report.prev.version,
    post: report.prev.version,
  }
  // Render an html file
  let html = Mustache.render(fs.readFileSync(`${process.cwd()}/shared/reporter/template.html`, 'utf8'), view);
  fs.writeFileSync(`${destination}/index.html`, html);
}
