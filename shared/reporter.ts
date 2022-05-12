// Takes care of generating the reports
import { processKraken } from './krakenProcess';
import { Command, Option, program } from 'commander';


// ================ Kraken =================== //
function main(command: Command) {
  let opts = command.opts();
  console.log(opts);
  switch (opts?.process) {
    case 'kraken':
      processKraken(opts.prev, opts.post);
      break;
    case 'playwright':
      // processPlaywright(opts);
      break;
  }
}


// Entrypoint

program
  .addOption(new Option('--process <tool>', 'Process the report data from plawyright or kraken').choices(['kraken', 'plawright']))
  // .option('--kraken', 'Process the report data from kraken')
  // .option('--plawyright', 'Process the report data from playwright')
  .option('--report', 'Generate the report')
  .requiredOption('--prev <string>', 'Version to take as prev')
  .requiredOption('--post <string>', 'Version to taskes as post')

main(program.parse(process.argv));
