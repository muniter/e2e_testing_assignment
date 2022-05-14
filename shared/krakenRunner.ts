import { VERSION, VISUAL_REGRESSION_TESTING } from './SharedConfig';
import { spawnSync } from 'child_process';
import * as fs from 'fs';


export function runKraken() {
  try {
    if (VISUAL_REGRESSION_TESTING) {
      fs.rmdirSync(`screenshots/kraken/${VERSION}`, { recursive: true });
    }
  } catch (e) { }
  let featuresDir = './features';
  // Get all the files in the features directory
  let files = fs.readdirSync(featuresDir).filter(f => f.endsWith('.feature') || f.endsWith('.commented'))
  console.log('Files on first filter', files)
  files = files.map(f => f.replace('.commented', '')).sort();;  // Remove commented and sort
  console.log('Files on removing comment', files, files.length)

  let file = files.shift();
  if (!file) {
    console.error('No features found');
    process.exit(1);
  }
  // Leaves only one file, the one that is being tested
  leaveOnlyOneFile(featuresDir, file);
  let attempts = 0;
  // Compile kraken source
  let res = spawnSync('npm', ['run', 'kraken-compile'], { stdio: 'inherit' });
  if (res.status != 0) {
    console.error('Kraken compilation failed');
    process.exit(1);
  }
  while (files.length > 0) {
    let args = ['kraken-node', 'run']
    res = spawnSync('npx', args, { stdio: 'inherit' });
    attempts++;
    if (res.status === 0) {
      console.log(`Kraken test ${file} passed`);
      file = files.shift();
      leaveOnlyOneFile(featuresDir, file!);
      attempts = 0;
    } else {
      if (attempts > 3) {
        console.error(`Kraken test ${file} failed 3 times in a row. Aborting.`);
        process.exit(1);
      } else {
        console.log(`Kraken test ${file} failed, retrying`);
      }
    }
  }
}

function leaveOnlyOneFile(dir: string, fname: string) {
  // Find the file that starts with the file name
  let files = fs.readdirSync(dir).filter(f => f.endsWith('.feature') || f.endsWith('.commented'))
  let onlyfile = files.find(f => f == fname || f == fname + '.commented');
  if (!onlyfile) {
    console.error(`Could not find file ${fname} in ${dir}`);
    process.exit(1);
  }

  // Rename the file, it might have the '.commented' suffix, which this call removes
  fs.renameSync(`${dir}/${onlyfile}`, `${dir}/${fname}`);

  // Leave only the files that need renaming
  files = files.filter(f => !f.startsWith(fname) && !f.endsWith('.commented'));

  // Rename the rest of the files to add the commented
  files.forEach(f => {
    fs.renameSync(`${dir}/${f}`, `${dir}/${f}.commented`);
  })
}

runKraken();
