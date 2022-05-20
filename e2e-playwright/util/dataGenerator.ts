import { writeFileSync, readFileSync } from 'fs';
import { StaffData } from '../page/StaffPage';
import { faker } from '@faker-js/faker';

const APRIORI_POOL_FILE = './pool.json';  // Where to save the apriori pool
const DATA_POOL_GEN_PER_SCENARIO = 100;  // How many 'smaller' parametrized data pools per scenario

// Types of data pools
export type DataPoolType = 'apriori' | 'dynamic' | 'random';
export const DataPools: DataPoolType[] = ['apriori', 'dynamic', 'random'];

// Data pool on disk (a priori) and generated at runtime (dynamic)
type DataPool = Record<ScenarioIdentifier, ScenarioDataPool>;
type Model = 'member' | 'staff';
type ScenarioIdentifier = string
type ScenarioDataPool = Member[] | Staff[];

// Fields needed to create a member
type Member = {
  name: string;
  email: string;
  notes: string;
  labels: string[];
};

// Fields needed to create a staff
type Staff = StaffData

// Field options passed to the generator functions
interface FieldOption {
  number?: number,
  length?: number,
  omit?: boolean,
  kind?: string,
  once?: boolean,
  generator?: () => string,
}

// Description of an scenario with it's data
export interface ScenarioConfig {
  title: string,
  oracle: boolean,  // Wether the scenarios should pass or not
  data: Record<string, FieldOption>,
  model: Model,
  pool?: DataPoolType,  // Used after the fact, chosen randomly
}

// Schema of scenarios
type ScenarioSchema = Record<string, ScenarioConfig>
export const Scenarios: ScenarioSchema = {
  // Exmaple:
  // Scenario on the member creation form:
  // With title 'no name'
  // With oracle true, meaning it should pass creation
  // With data: name (omitted), all other fields default value
  noname: {
    title: 'No name',
    model: 'member',
    oracle: true,
    data: {
      name: { omit: true }
    },
  },
  longname: {
    title: 'Long name',
    model: 'member',
    oracle: true,
    data: {
      name: { length: 100 }
    }
  },
  maxlongname: {
    title: 'Max long name (191)',
    model: 'member',
    oracle: true,
    data: { name: { length: 191 } },
  },
  overmaxlongname: {
    title: 'Over max long name (192)',
    model: 'member',
    oracle: false,
    data: { name: { length: 192 } },
  },
  shortname: {
    title: 'Very short name',
    model: 'member',
    oracle: true,
    data: { name: { length: 2 } },
  },
  noemail: {
    title: 'No email',
    model: 'member',
    oracle: false,
    data: { email: { omit: true } },
  },
  longemail: {
    title: 'Long email: 60',
    model: 'member',
    oracle: false,
    data: { email: { length: 60 } },
  },
  verylongemail: {
    title: 'Very long email: 100',
    model: 'member',
    oracle: false,
    data: { email: { length: 100 } },
  },
  shortemail: {
    title: 'Short email',
    model: 'member',
    oracle: true,
    data: { email: { kind: 'short' } },
  },
  invalidemail: {
    title: 'Invalid email',
    model: 'member',
    oracle: false,
    data: { email: { kind: 'invalid' } },
  },
  notldemail: {
    title: 'No TLD email',
    model: 'member',
    oracle: false,
    data: { email: { kind: 'notld' } },
  },
  normalnote: {
    title: 'Normal note',
    model: 'member',
    oracle: true,
    data: { notes: { length: 50 } },
  },
  nonote: {
    title: 'No note',
    model: 'member',
    oracle: true,
    data: { notes: { omit: true } },
  },
  notelessfrontier: {
    title: 'Long note (near frontier 499 vs 500)',
    model: 'member',
    oracle: true,
    data: { notes: { length: 499 } },
  },
  notemorefrontier: {
    title: 'Long note (over frontier 501 vs 500)',
    model: 'member',
    oracle: false,
    data: { notes: { length: 501 } },
  },
  noteinfrontier: {
    title: 'Long note (in frontier 500 vs 500)',
    model: 'member',
    oracle: true,
    data: { notes: { length: 500 } },
  },
  label: {
    title: 'label (1, normal)',
    model: 'member',
    oracle: true,
    data: { labels: { number: 1, length: 5 } },
  },
  nolabel: {
    title: 'No label',
    model: 'member',
    oracle: true,
    data: { labels: { omit: true } },
  },
  onfrontierlabel: {
    title: 'Long label (in frontier 191 vs 191)',
    model: 'member',
    oracle: true,
    data: { labels: { length: 191 } },
  },
  outofboundslabel: {
    title: 'Long label (over frontier 192 vs 191)',
    model: 'member',
    oracle: false,
    data: { labels: { length: 192 } },
  },
  manylabels: {
    title: 'Many labels (50, normal length)',
    model: 'member',
    oracle: true,
    data: { labels: { number: 50, length: 5 } },
  },
  snoname: {
    title: 'No name',
    model: 'staff',
    oracle: false,
    data: { name: { omit: true } },
  },
  slongname: {
    title: 'Long name',
    model: 'staff',
    oracle: true,
    data: { name: { length: 100 } }
  },
  smaxlongname: {
    title: 'Max long name (191)',
    model: 'staff',
    oracle: true,
    data: { name: { length: 191 } },
  },
  sovermaxlongname: {
    title: 'Over max long name (192)',
    model: 'staff',
    oracle: false,
    data: { name: { length: 192 } },
  },
  snoemail: {
    title: 'No email',
    model: 'staff',
    oracle: false,
    data: { email: { omit: true } },
  },
  slongemail: {
    title: 'Long email: 60',
    model: 'staff',
    oracle: false,
    data: { email: { length: 60 } },
  },
  sverylongemail: {
    title: 'Very long email: 100',
    model: 'staff',
    oracle: false,
    data: { email: { length: 100 } },
  },
  sinvalidemail: {
    title: 'Invalid email',
    model: 'staff',
    oracle: false,
    data: { email: { kind: 'invalid' } },
  },
  biolessfrontier: {
    title: 'Long bio (near frontier 199 vs 200)',
    model: 'staff',
    oracle: true,
    data: { bio: { length: 199 } },
  },
  biomorefrontier: {
    title: 'Long bio (over frontier 201 vs 200)',
    model: 'staff',
    oracle: false,
    data: { bio: { length: 201 } },
  },
  bioinfrontier: {
    title: 'Long bio (in frontier 200 vs 200)',
    model: 'staff',
    oracle: true,
    data: { bio: { length: 200 } },
  },
  websitevalid: {
    title: 'Regular website',
    model: 'staff',
    oracle: true,
    data: { website: { kind: 'regular' } },
  },
  emptywebsite: {
    title: 'Website without tld (e.g. no .com)',
    model: 'staff',
    oracle: true,
    data: { website: { omit: true } },
  },
  websitenotld: {
    title: 'Website without tld (e.g. no .com)',
    model: 'staff',
    oracle: false,
    data: { website: { kind: 'notld' } },
  },
  websitenearfrontier: {
    title: 'Long website (near frontier 1999 vs 2000)',
    model: 'staff',
    oracle: true,
    data: { website: { length: 1999 } },
  },
  websitemorefrontier: {
    title: 'Long website (over frontier 2001 vs 2000)',
    model: 'staff',
    oracle: false,
    data: { website: { length: 2001 } },
  },
  websiteinfrontier: {
    title: 'Long website (in frontier 2000 vs 2000)',
    model: 'staff',
    oracle: true,
    data: { website: { length: 2000 } },
  },
} as const

// Get a member or staff from any of the pools given a scenario configuration
export function getData({ pool, identifier }: { pool: DataPoolType, identifier: string }): Member | Staff {
  let config = Scenarios[identifier]
  let data: Member | Staff | undefined = undefined;
  if (!config) {
    throw new Error(`Unknown scenario: ${identifier}`)
  }

  switch (pool) {
    case 'apriori':
    case 'dynamic':
      data = getFromPool(identifier, pool)
      break;
    case 'random':
      if (config.model === 'member') {
        data = {
          name: genName(config.data.name || { once: true }),
          email: genEmail(config.data.email || { once: true }),
          notes: genNotes(config.data.notes || { once: true }),
          labels: genlabels(config.data.labels || { omit: true }),
        } as Member
      } else if (config.model === 'staff') {
        data = {
          name: config.data.name && genName(config.data.name),
          email: config.data.email && genEmail(config.data.email),
          bio: config.data.bio && genNotes(config.data.bio),
          website: genWebsite(config.data.website || { omit: true }),
        } as Staff
        data = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      }
      break;
    default:
      throw new Error('Unknown pool');
  }
  if (data) {
    return data
  } else {
    throw new Error('No data found')
  }
}

// Generate an email given a field option
function genEmail(options: FieldOption): string {
  let email = '';
  if (options.kind === 'short') {
    email = faker.random.alphaNumeric(2) + '@' + faker.random.alphaNumeric(2) + '.co'
  } else if (options.kind === 'invalid') {
    email = 'invalid'
  } else if (options.kind === 'notld') {
    email = 'a@a'
  } else {
    // yeeeeet partial :p
    let gengen = () => { let i = 0; return () => { i++; return i <= 1 ? faker.internet.email() : faker.internet.domainWord() } }
    let generator = gengen();
    email = stringGenerator({
      ...options,
      generator,
    });
  };
  return email;
}

// Generate a name given a field option
function genName(options: FieldOption): string {
  let generator = () => faker.name.findName();
  return stringGenerator({
    ...options,
    generator,
  });
}

// Generate an array of labels given a field option
function genlabels(options: FieldOption): string[] {
  let labels: string[] = [];
  let { number } = options;
  number = number || 1; // Default to 1 label
  number = options.omit ? 0 : number;  // Omit is true, return empty
  let generator = () => faker.word.verb();
  for (let i = 0; i < number; i++) {
    labels.push(stringGenerator({
      ...options,
      generator,
    }));
  }
  return labels;
}

function genWebsite(options: FieldOption): string {
  let res: string = '';
  if (options.kind === 'regular') {
    res = faker.internet.url();
  } else if (options.kind === 'notld') {
    res = faker.word.verb();
  } else {
    let generator = () => faker.random.alphaNumeric();
    res = stringGenerator({
      ...options,
      generator,
    })
    if (options.length) {
      res = res.slice(0, options.length - 4) + '.com'
    }
  }
  return res;
}

// Generate a note|bio given a field option
function genNotes(options: FieldOption): string {
  let generator = () => faker.lorem.paragraph(1);
  return stringGenerator({
    ...options,
    generator,
  });
}

// Generates a string from a given generator function matching the given
// options. For example generate a name using faker.name.findName, if the name
// needs to be 100 character longs keep string concatenating or slicing until
// it's 100 characters long.
function stringGenerator({ length, generator, omit, once }: FieldOption):
  string {
  let res = '';

  if (length) {
    while (res.length < length) {
      if (!generator) {
        throw new Error('generator is not defined');
      }
      res += generator();
    }
    if (res.length > length) {
      // Slice from the start
      res = res.slice(0, length);
    }
  }

  if (once === true) {
    // Once it's the default value, meaning one call to the generaotr
    if (!generator) {
      throw new Error('generator is not defined');
    }
    return generator();
  } else if (omit === true) {
    // Omit is true, return empty string
    return res
  }

  // If it ends with a space, change it for a random alphaNumeric, since ghost
  // removes trailing whitespaces in some fileds
  if (res.endsWith(' ')) {
    res = res.slice(0, -1) + faker.random.alphaNumeric(1);
  }

  // Return a random string from the generator function compying with the given characteristics.
  return res;
}

// Dyanmic data pool, this will be generated on the fly, in memory when running
// dynamic data scenarios
let DynamicPool: DataPool;
let LoadedDynamicPool = false;

// Apriori data pool, this will be loaded from disk when running apriori data
let AprioriPool: DataPool;
let LoadedAprioriPool = false;

// Load a scenario data "tuple" from a data pool type.
// @param model: Model the scenario belongs to
// @param scenario: Scenario identifier to get the data for
// @param poolType: Data pool type to get the data froma (apriori, dynamic)
// @returns Scenario data, picked at random from the pool
function getFromPool(identifier: string, poolType: DataPoolType): Member | Staff {
  let pool: DataPool;
  if (poolType === 'apriori') {
    if (!LoadedAprioriPool) {
      // Using apriori therefor reading form file
      AprioriPool = JSON.parse(readFileSync(APRIORI_POOL_FILE, 'utf8')) as DataPool;
      LoadedAprioriPool = true;
    }
    pool = AprioriPool;
  } else if (poolType === 'dynamic') {
    // Using dynamic therefor generating on the fly on the first time this
    // method is called
    if (!LoadedDynamicPool) {
      DynamicPool = generatePool(false);
      LoadedDynamicPool = true;
    }
    pool = DynamicPool;
  } else {
    throw new Error('Unknown pool type');
  }

  // Filter the pool to get the data for this specific scenario
  // This is a pool of 100
  let scenarioPool = pool[identifier];
  if (!scenarioPool) {
    throw new Error(`Scenario identifier ${identifier} not found in pool, make sure to update the apriori pool`);
  }
  // Get one at random from the available data
  let random = Math.floor(Math.random() * scenarioPool.length);
  let data = scenarioPool[random];
  // Remove it to avoid duplicates
  scenarioPool.splice(random, 1);
  return data;
}


// Data pool generator.
//
// This is done by creating a "smaller" data pool for each of the scenarios stated
// at the start of this file, this "smaller" data pool is of size DATA_POOL_GEN_PER_SCENARIO
// for each of the scenarios.
export function generatePool(write: boolean = true, seed?: number): DataPool {
  if (seed) {
    faker.seed(seed);
  }
  let pool: DataPool = {};
  Object.entries(Scenarios).forEach(([identifier, _]) => {
    // For each of the member scenarios let's create a "smaller" "inner" pool
    // of size DATA_POOL_GEN_PER_SCENARIO
    let scenarioData: Array<Staff | Member> = [];
    for (let i = 0; i < DATA_POOL_GEN_PER_SCENARIO; i++) {
      scenarioData.push(getData({ pool: 'random', identifier: identifier }));
    }
    pool[identifier] = scenarioData;
  });

  if (write) {
    // Only pass write when we want to update the apriori data pool
    writeFileSync('./pool.json', JSON.stringify(pool, null, 2));
  }
  return pool;
}

if (require.main === module) {
  generatePool(true, 12345);
}

function permute(input: any): Array<Array<string>> {
  var out = [];

  (function permute_r(input, current) {
    if (input.length === 0) {
      out.push(current);
      return;
    }

    var next = input.slice(1);

    for (var i = 0, n = input[0].length; i != n; ++i) {
      // @ts-ignore
      permute_r(next, current.concat([input[0][i]]));
    }
  }(input, []));

  return out;
}
// Combine staff and member scenarios to create new scenarios
export function generateCombinations(n: number) {
  let scenarios = Object.entries(Scenarios);
  let members = scenarios.filter(s => s[1].model === 'member').map(s => s[0]);
  let staffs = scenarios.filter(s => s[1].model === 'staff').map(s => s[0]);
  let combinations = permute([members, staffs]);
  // Get n random items from the combinations
  let result: Array<Array<string>> = [];
  let prevSeed = faker.seed();
  faker.seed(12345);
  for (let i = 0; i < n; i++) {
    let random = faker.datatype.number({ min: 0, max: combinations.length - 1 });
    result.push(combinations[random]);
  }
  faker.seed(prevSeed);
  return result;
}
