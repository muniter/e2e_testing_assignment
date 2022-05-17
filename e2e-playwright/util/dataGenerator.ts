import { writeFileSync, readFileSync } from 'fs';
import { StaffData } from '../page/StaffPage';
import faker from '@faker-js/faker';

const APRIORI_POOL_FILE = './pool.json';

export type DataPoolType = 'apriori' | 'dynamic' | 'random';

// Data pool on disk (a priori) and generated at runtime (dynamic)
type DataPool = Record<Model, Record<ScenarioIdentifier, ScenarioDataPool>>;
type Model = 'member' | 'staff';
type ScenarioIdentifier = string
type ScenarioDataPool = Member[] | Staff[];

type Member = {
  name: string;
  email: string;
  notes: string;
  labels: string[];
};

type Staff = StaffData


interface FieldOption {
  number?: number,
  length?: number,
  omit?: boolean,
  kind?: string,
  once?: boolean,
  generator?: () => string,
}

interface ScenarioConfig {
  title: string,
  oracle: boolean,
  data: Record<string, FieldOption>,
}

type ScenarioSchema = Record<Model, Record<string, ScenarioConfig>>

export const Scenarios: ScenarioSchema = {
  member: {
    noname: {
      title: 'No name',
      oracle: true,
      data: {
        name: { omit: true }
      },
    },
    longname: {
      title: 'Long name',
      oracle: true,
      data: {
        name: { length: 100 }
      }
    },
    maxlongname: {
      title: 'Max long name (191)',
      oracle: true,
      data: { name: { length: 191 } },
    },
    overmaxlongname: {
      title: 'Over max long name (192)',
      oracle: false,
      data: { name: { length: 192 } },
    },
    shortname: {
      title: 'Very short name',
      oracle: true,
      data: { name: { length: 2 } },
    },
    noemail: {
      title: 'No email',
      oracle: false,
      data: { email: { omit: true } },
    },
    longemail: {
      title: 'Long email: 60',
      oracle: false,
      data: { email: { length: 60 } },
    },
    verylongemail: {
      title: 'Very long email: 100',
      oracle: false,
      data: { email: { length: 100 } },
    },
    shortemail: {
      title: 'Short email',
      oracle: true,
      data: { email: { kind: 'short' } },
    },
    invalidemail: {
      title: 'Invalid email',
      oracle: false,
      data: { email: { kind: 'invalid' } },
    },
    notldemail: {
      title: 'No TLD email',
      oracle: false,
      data: { email: { kind: 'notld' } },
    },
    normalnote: {
      title: 'Normal note',
      oracle: true,
      data: { notes: { length: 50 } },
    },
    nonote: {
      title: 'No note',
      oracle: true,
      data: { notes: { omit: true } },
    },
    notelessfrontier: {
      title: 'Long note (near frontier 499 vs 500)',
      oracle: true,
      data: { notes: { length: 499 } },
    },
    notemorefrontier: {
      title: 'Long note (over frontier 501 vs 500)',
      oracle: false,
      data: { notes: { length: 501 } },
    },
    noteinfrontier: {
      title: 'Long note (in frontier 500 vs 500)',
      oracle: true,
      data: { notes: { length: 500 } },
    },
    label: {
      title: 'label (1, normal)',
      oracle: true,
      data: { labels: { number: 1, length: 5 } },
    },
    nolabel: {
      title: 'No label',
      oracle: true,
      data: { labels: { omit: true } },
    },
    onfrontierlabel: {
      title: 'Long label (in frontier 191 vs 191)',
      oracle: true,
      data: { labels: { length: 191 } },
    },
    outofboundslabel: {
      title: 'Long label (over frontier 192 vs 191)',
      oracle: false,
      data: { labels: { length: 192 } },
    },
    manylabels: {
      title: 'Many labels (50, normal length)',
      oracle: true,
      data: { labels: { number: 50, length: 5 } },
    }
  },
  staff: {
    noname: {
      title: 'No name',
      oracle: false,
      data: {
        name: { omit: true }
      },
    },
    longname: {
      title: 'Long name',
      oracle: true,
      data: {
        name: { length: 100 }
      }
    },
    maxlongname: {
      title: 'Max long name (191)',
      oracle: true,
      data: { name: { length: 191 } },
    },
    overmaxlongname: {
      title: 'Over max long name (192)',
      oracle: false,
      data: { name: { length: 192 } },
    },
    noemail: {
      title: 'No email',
      oracle: false,
      data: { email: { omit: true } },
    },
    longemail: {
      title: 'Long email: 60',
      oracle: false,
      data: { email: { length: 60 } },
    },
    verylongemail: {
      title: 'Very long email: 100',
      oracle: false,
      data: { email: { length: 100 } },
    },
    invalidemail: {
      title: 'Invalid email',
      oracle: false,
      data: { email: { kind: 'invalid' } },
    },
    biolessfrontier: {
      title: 'Long bio (near frontier 199 vs 200)',
      oracle: true,
      data: { bio: { length: 199 } },
    },
    biomorefrontier: {
      title: 'Long bio (over frontier 201 vs 200)',
      oracle: false,
      data: { bio: { length: 201 } },
    },
    bioinfrontier: {
      title: 'Long bio (in frontier 200 vs 200)',
      oracle: true,
      data: { bio: { length: 200 } },
    },
  },
} as const

export function getMember({ pool, identifier, config }: { pool: DataPoolType, identifier: string, config: ScenarioConfig }): Member {
  let member: Member
  if (pool === 'random') {
    member = {
      name: genName(config.data.name || { once: true }),
      email: genEmail(config.data.email || { once: true }),
      notes: genNotes(config.data.notes || { once: true }),
      labels: genlabels(config.data.labels || { omit: true }),
    }
  } else if (pool == 'apriori') {
    member = getFromPool('member', identifier, 'apriori') as Member
  } else if (pool == 'dynamic') {
    member = getFromPool('member', identifier, 'dynamic') as Member
  } else {
    throw new Error('Unknown pool');
  }
  return member;
}

export function getStaff({ pool, identifier, config }: { pool: DataPoolType, identifier: string, config: ScenarioConfig }): Staff {
  let staff: Staff
  if (pool === 'random') {
    staff = {
      name: config.data.name && genName(config.data.name),
      email: config.data.email && genEmail(config.data.email),
      bio: config.data.bio && genNotes(config.data.bio),
    }
    staff = Object.fromEntries(Object.entries(staff).filter(([_, v]) => v !== undefined));

  } else if (pool == 'apriori') {
    staff = getFromPool('staff', identifier, 'apriori') as Staff
  } else if (pool == 'dynamic') {
    staff = getFromPool('staff', identifier, 'dynamic') as Staff
  } else {
    throw new Error('Unknown pool');
  }
  return staff;
}

function genEmail(options: FieldOption): string {
  let email = '';
  if (options.kind === 'short') {
    email = faker.random.alphaNumeric(2) + '@' + faker.random.alphaNumeric(2) + '.co'
  } else if (options.kind === 'invalid') {
    email = 'invalid'
  } else if (options.kind === 'notld') {
    email = 'a@a'
  } else {
    // yeeeeet :p
    let gengen = () => { let i = 0; return () => { i++; return i <= 1 ? faker.internet.email() : faker.internet.domainWord() } }
    let generator = gengen();
    email = stringGenerator({
      ...options,
      generator,
    });
  };
  return email;
}


function genName(options: FieldOption): string {
  let generator = () => faker.name.findName();
  return stringGenerator({
    ...options,
    generator,
  });
}

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

function genNotes(options: FieldOption): string {
  let generator = () => faker.lorem.paragraph(1);
  return stringGenerator({
    ...options,
    generator,
  });
}

function stringGenerator({ length, generator, omit, once }: FieldOption): string {
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
    // Omit is false, just generate once
    if (!generator) {
      throw new Error('generator is not defined');
    }
    return generator();
  } else if (omit === true) {
    // Omit is true, return empty
    return res
  }

  return res;
}

let DynamicPool: DataPool;
let LoadedDynamicPool = false;
let AprioriPool: DataPool;
let LoadedAprioriPool = false;

// Load a scenario data from a data pool type.
// @param model: Model the scenario belongs to
// @param scenario: Scenario identifier to get the data for
// @param poolType: Data pool type to get the data froma (apriori, dynamic)
// @returns Scenario data, picked at random from the pool
function getFromPool(model: Model, identifier: string, poolType: DataPoolType): Member | Staff {
  let pool: DataPool;
  if (poolType === 'apriori') {
    if (!LoadedAprioriPool) {
      AprioriPool = JSON.parse(readFileSync(APRIORI_POOL_FILE, 'utf8')) as DataPool;
      LoadedDynamicPool = true;
    }
    pool = AprioriPool;
  } else if (poolType === 'dynamic') {
    if (!LoadedDynamicPool) {
      DynamicPool = generatePool(false);
      LoadedDynamicPool = true;
    }
    pool = DynamicPool;
  } else {
    throw new Error('Unknown pool type');
  }

  // Filter the pool to get the data for this specific scenario
  let scenarioPool = pool[model][identifier];
  // Get one at random from the available data
  let data = scenarioPool[Math.floor(Math.random() * scenarioPool.length)];
  return data;
}

function generatePool(write: boolean = true): DataPool {
  // @ts-ignore
  let pool: DataPool = { member: {}, staff: {} };
  let number = 100
  Object.entries(Scenarios).forEach(([model, scenarios]) => {
    if (model === 'member') {
      let modelData: Record<string, Member[] | Staff[]> = {};
      Object.entries(scenarios).forEach(([identifier, config]) => {
        let scenarioData: Member[] = [];
        for (let i = 0; i < number; i++) {
          scenarioData.push(getMember({ pool: 'random', identifier: identifier, config }));
        }
        modelData[identifier] = scenarioData;
      });
      pool.member = modelData;
    } else if (model === 'staff') {

      let modelData: Record<string, Member[] | Staff[]> = {};
      Object.entries(scenarios).forEach(([identifier, config]) => {
        let scenarioData: Staff[] = [];
        for (let i = 0; i < number; i++) {
          scenarioData.push(getStaff({ pool: 'random', identifier: identifier, config }));
        }
        modelData[identifier] = scenarioData;
      });
      pool.staff = modelData;

    } else {
      throw new Error('Not implemented');
    }
  });
  if (write) {
    writeFileSync('./pool.json', JSON.stringify(pool, null, 2));
  }
  return pool;
}
