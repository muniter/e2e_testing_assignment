import { writeFileSync } from 'fs';
import faker from '@faker-js/faker';

type DataPoolType = 'apriori' | 'dynamic' | 'random';

// Data pool on disk (a priori) and generated at runtime (dynamic)
type DataPool = Record<Model, Record<ScenarioIdentifier, ScenarioDataPool>>;
type Model = 'member' | 'profile';
type ScenarioIdentifier = string
type ScenarioDataPool = Member[]|Profile[];

type Member = {
  name: string;
  email: string;
  notes: string;
  labels: string[];
};

type Profile = Member


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
  profile: {},
} as const

export function generateMember({ pool, config }: { pool: DataPoolType, config: ScenarioConfig }): Member {
  if (pool === 'random') {
    let member: Member = {
      name: genName(config.data.name || { once: true }),
      email: genEmail(config.data.email || { once: true }),
      notes: genNotes(config.data.notes || { once: true }),
      labels: genlabels(config.data.labels || { omit: true }),
    }
    // console.log(member);

    return member;
  } else {
    throw new Error('Not implemented');
  }
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

function generatePool() {
  // @ts-ignore
  let pool: DataPool = { member: {}, profile: {} };
  let number = 100
  Object.entries(Scenarios).forEach(([model, scenarios]) => {
    if (model === 'member') {
      let modelData: Record<string, Member[] | Profile[]> = {};
      Object.entries(scenarios).forEach(([identifier, config]) => {
        let scenarioData: Member[] | Profile[] = [];
        for (let i = 0; i < number; i++) {
          scenarioData.push(generateMember({ pool: 'random', config }));
        }
        modelData[identifier] = scenarioData;
      });
      pool.member = modelData;
    } else if (model === 'profile') {
      pool.profile = {};
    } else {
      throw new Error('Not implemented');
    }
  });
  writeFileSync('./pool.json', JSON.stringify(pool, null, 2));
}

generatePool();
