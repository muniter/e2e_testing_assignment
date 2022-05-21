import { writeFileSync, readFileSync } from 'fs';
import { StaffData } from '../page/StaffPage';
import { faker } from '@faker-js/faker';
import { TagData } from '../page/TagPage';

const APRIORI_POOL_FILE = './pool.json';  // Where to save the apriori pool
const DATA_POOL_GEN_PER_SCENARIO = 100;  // How many 'smaller' parametrized data pools per scenario

// Types of data pools
export type DataPoolType = 'apriori' | 'dynamic' | 'random';
export const DataPools: DataPoolType[] = ['apriori', 'dynamic', 'random'];

// Data pool on disk (a priori) and generated at runtime (dynamic)
type DataPool = Record<ScenarioIdentifier, ScenarioDataPool>;
type Model = 'member' | 'staff' | 'tag';
type ScenarioIdentifier = string
type ScenarioDataPool = Member[] | Staff[] | Tag[];

// Fields needed to create a member
type Member = {
  name: string;
  email: string;
  notes: string;
  labels: string[];
};

// Fields needed to create a staff
type Staff = StaffData
type Tag = TagData

// Field options passed to the generator functions
interface FieldOption {
  number?: number,
  length?: number,
  omit?: boolean,
  kind?: string,
  once?: boolean,
  leftadd?: boolean,  // fields like email, cutting and adding at the domain is problemtic
  generator?: () => string,
}

type DataOptions = Partial<Record<keyof Member | keyof Staff | keyof Tag, FieldOption>>

// Description of an scenario with it's data
export interface ScenarioConfig {
  title: string,
  oracle: boolean,  // Wether the scenarios should pass or not
  data: DataOptions,
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
  emptyallfields: {
    title: 'Empty all fields',
    model: 'member',
    oracle: false,
    data: {
      name: { omit: true },
      email: { omit: true },
      labels: { omit: true },
      notes: { omit: true },
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
  normalemail: {
    title: 'Email normal (40)',
    model: 'member',
    oracle: true,
    data: { email: { length: 40 } },
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
  // Failure ov email validations
  // Source: https://www.netmeister.org/blog/email.html
  emojiemail: {
    title: '[BUG] Emoji email',
    model: 'member',
    oracle: false,
    data: { email: { kind: 'emoji' } },
  },
  multiplesarrobas: {
    title: '[BUG] Email should allow multiple "@"',
    model: 'member',
    oracle: false,
    data: { email: { kind: 'mutiple@' } },
  },
  multiplepunctuationchars: {
    title: 'Email should allow multiple punctuation characters',
    model: 'member',
    oracle: true,
    data: { email: { kind: 'mutiple_punctuation' } },
  },
  ipaddressasdomain: {
    title: '[BUG] Email should allow IP address as domain "whatever@[166.84.7.99]"',
    model: 'member',
    oracle: false,
    data: { email: { kind: 'ip_domain' } },
  },
  specialdot: {
    title: 'Email should not allow consecutive dots "."',
    model: 'member',
    oracle: false,
    data: { email: { kind: 'special_dot' } },
  },
  speciaquoteddot: {
    title: 'Email should allow consecutive dots ".." if they are quoted " "',
    model: 'member',
    oracle: true,
    data: { email: { kind: 'special_quoted_dot' } },
  },
  // End of email validation
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
  // STAFF
  snoname: {
    title: 'No name',
    model: 'staff',
    oracle: false,
    data: { name: { omit: true } },
  },
  semptyallfields: {
    title: 'Empty all fields',
    model: 'staff',
    oracle: false,
    data: {
      name: { omit: true },
      email: { omit: true },
      website: { omit: true },
      bio: { omit: true },
    },
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
  semojiemail: {
    title: '[BUG] Emoji email',
    model: 'staff',
    oracle: false,
    data: { email: { kind: 'emoji' } },
  },
  smultiplesarrobas: {
    title: '[BUG] Email should allow multiple "@"',
    model: 'staff',
    oracle: false,
    data: { email: { kind: 'mutiple@' } },
  },
  sipaddressasdomain: {
    title: '[BUG] Email should allow IP address as domain "whatever@[166.84.7.99]"',
    model: 'staff',
    oracle: false,
    data: { email: { kind: 'ip_domain' } },
  },
  sspecialdot: {
    title: 'Email should not allow consecutive dots "."',
    model: 'staff',
    oracle: false,
    data: { email: { kind: 'special_dot' } },
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
  // Tags
  normal: {
    title: 'Normal, valid data in all fields',
    model: 'tag',
    oracle: true,
    data: {},
  },
  withoutname: {
    title: 'Without name tag',
    model: 'tag',
    oracle: false,
    data: { name: { omit: true } },
  },
  withoutcolor: {
    title: 'without color tag',
    model: 'tag',
    oracle: true,
    data: {
      color: { omit: true }
    },
  },
  colorwithhash: {
    title: 'Color including the pound sign (#)',
    model: 'tag',
    oracle: false,
    data: { color: { kind: 'with_pound' } },
  },
  colorwithpound: {
    title: 'Invalid color (a string)',
    model: 'tag',
    oracle: false,
    data: { color: { kind: 'invalid' } },
  },
  onelettercolor: {
    title: 'Fail tag',
    model: 'tag',
    oracle: false,
    data: { color: { kind: 'one_letter' } },
  },
  temptyall: {
    title: 'Empty all fields',
    model: 'tag',
    oracle: false,
    data: {
      name: { omit: true },
      slug: { omit: true },
      color: { omit: true },
      description: { omit: true },
      twitterTitle: { omit: true },
      twitterDescription: { omit: true },
      facebookTitle: { omit: true },
      facebookDescription: { omit: true },
      metaDescription: { omit: true },
      metaTitle: { omit: true },
      canonicalUrl: { omit: true },
    },
  },
  justname: {
    title: 'Only provide a name',
    model: 'tag',
    oracle: true,
    data: {
      slug: { omit: true },
      color: { omit: true },
      description: { omit: true },
      twitterTitle: { omit: true },
      twitterDescription: { omit: true },
      facebookTitle: { omit: true },
      facebookDescription: { omit: true },
      metaDescription: { omit: true },
      metaTitle: { omit: true },
      canonicalUrl: { omit: true },
    },
  },
  descriptionlessfrontier: {
    title: 'Description less than frontier (499 vs 500)',
    model: 'tag',
    oracle: true,
    data: { description: { length: 499 } },
  },
  descriptionmorefrontier: {
    title: 'Description more than frontier (501 vs 500)',
    model: 'tag',
    oracle: false,
    data: { description: { length: 501 } },
  },
  descriptioninfrontier: {
    title: 'Description in frontier (500 vs 500)',
    model: 'tag',
    oracle: true,
    data: { description: { length: 500 } },
  },
  metatitlelessfrontier: {
    title: 'Meta title less than frontier (299 vs 300)',
    model: 'tag',
    oracle: true,
    data: { metaTitle: { length: 299 } },
  },
  metatitleinfrontier: {
    title: 'Meta title in frontier (300 vs 300)',
    model: 'tag',
    oracle: true,
    data: { metaTitle: { length: 300 } },
  },
  metatitleoverfrontier: {
    title: 'Meta title over frontier (301 vs 300)',
    model: 'tag',
    oracle: false,
    data: { metaTitle: { length: 301 } },
  },
  metadescriptionlessfrontier: {
    title: 'Meta description less than frontier (499 vs 500)',
    model: 'tag',
    oracle: true,
    data: { metaDescription: { length: 499 } },
  },
  metadescriptioninfrontier: {
    title: 'Meta description in frontier (500 vs 500)',
    model: 'tag',
    oracle: true,
    data: { metaDescription: { length: 500 } },
  },
  metadescriptionoverfrontier: {
    title: 'Meta description over frontier (501 vs 500)',
    model: 'tag',
    oracle: false,
    data: { metaDescription: { length: 501 } },
  },
  twittertitlelessfrontier: {
    title: 'Twitter title less than frontier (299 vs 300)',
    model: 'tag',
    oracle: true,
    data: { twitterTitle: { length: 299 } },
  },
  twittertitleinfrontier: {
    title: 'Twitter title in frontier (300 vs 300)',
    model: 'tag',
    oracle: true,
    data: { twitterTitle: { length: 300 } },
  },
  twittertitleoverfrontier: {
    title: 'Twitter title over frontier (301 vs 300)',
    model: 'tag',
    oracle: false,
    data: { twitterTitle: { length: 301 } },
  },
  twitterdescriptionlessfrontier: {
    title: 'Twitter description less than frontier (499 vs 500)',
    model: 'tag',
    oracle: true,
    data: { twitterDescription: { length: 499 } },
  },
  twitterdescriptioninfrontier: {
    title: 'Twitter description in frontier (500 vs 500)',
    model: 'tag',
    oracle: true,
    data: { twitterDescription: { length: 500 } },
  },
  twitterdescriptionoverfrontier: {
    title: 'Twitter description over frontier (501 vs 500)',
    model: 'tag',
    oracle: false,
    data: { twitterDescription: { length: 501 } },
  },
  facebooktitlelessfrontier: {
    title: 'Facebook title less than frontier (299 vs 300)',
    model: 'tag',
    oracle: true,
    data: { facebookTitle: { length: 299 } },
  },
  facebooktitleinfrontier: {
    title: 'Facebook title in frontier (300 vs 300)',
    model: 'tag',
    oracle: true,
    data: { facebookTitle: { length: 300 } },
  },
  facebooktitleoverfrontier: {
    title: 'Facebook title over frontier (301 vs 300)',
    model: 'tag',
    oracle: false,
    data: { facebookTitle: { length: 301 } },
  },
  facebookdescriptionlessfrontier: {
    title: 'Facebook description less than frontier (499 vs 500)',
    model: 'tag',
    oracle: true,
    data: { facebookDescription: { length: 499 } },
  },
  facebookdescriptioninfrontier: {
    title: 'Facebook description in frontier (500 vs 500)',
    model: 'tag',
    oracle: true,
    data: { facebookDescription: { length: 500 } },
  },
  facebookdescriptionoverfrontier: {
    title: 'Facebook description in frontier (501 vs 500)',
    model: 'tag',
    oracle: false,
    data: { facebookDescription: { length: 501 } },
  },
} as const

// Get a member or staff from any of the pools given a scenario configuration
export function getData({ pool, identifier }: { pool: DataPoolType, identifier: string }): Member | Staff | Tag {
  let config = Scenarios[identifier]
  let data: Member | Staff | Tag | undefined = undefined;
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
      } else if (config.model === 'tag') {
        data = {
          name: genName(config.data.name || { once: true }),
          slug: genName(config.data.slug || { once: true }),
          color: genHex(config.data.color || { once: true }),
          description: genNotes(config.data.description || { once: true }),
          metaTitle: genName(config.data.metaTitle || { once: true }),
          metaDescription: genNotes(config.data.metaDescription || { once: true }),
          canonicalUrl: genWebsite(config.data.canonicalUrl || { kind: 'regular' }),
          twitterTitle: genName(config.data.twitterTitle || { once: true }),
          twitterDescription: genNotes(config.data.twitterDescription || { once: true }),
          facebookTitle: genName(config.data.facebookTitle || { once: true }),
          facebookDescription: genNotes(config.data.facebookDescription || { once: true }),
        }
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
  } else if (options.kind === 'emoji') {
    email = 'hola💩@' + faker.internet.domainName()
  } else if (options.kind === 'mutiple@') {
    email = '@1st.relay,@2nd.relay:user@' + faker.internet.domainName()
  } else if (options.kind === 'mutiple_punctuation') {
    email = '*+-/=?^_`{|}~#$@' + faker.internet.domainName()
  } else if (options.kind === 'special_dot') {
    email = 'jd..oe@' + faker.internet.domainName()
  } else if (options.kind === 'special_quoted_dot') {
    email = '"jd..oe"@' + faker.internet.domainName()
  } else if (options.kind === 'ip_domain') {
    email = faker.random.word() + "@[166.84.7.99]"
  } else {
    // yeeeeet partial :p
    let gengen = () => { let i = 0; return () => { i++; return i <= 1 ? faker.internet.email() : faker.internet.domainWord() } }
    let generator = gengen();
    email = stringGenerator({
      ...options,
      leftadd: true,
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

// Generate a hexadecimal color
function genHex(options: FieldOption): string {
  let res = '';
  if (options.omit) {
    res = ''
  } else if (options.kind === 'with_pound') {
    res = '#' + faker.internet.color();
  } else if (options.kind === 'invalid') {
    res = faker.name.findName();
  } else if (options.kind === 'one_letter') {
    res = faker.random.alpha(1);
  }
  else {
    res = faker.internet.color();
  }
  if (res.startsWith('#')) {
    res = res.slice(1);
  }
  return res;
}

// Generates a string from a given generator function matching the given
// options. For example generate a name using faker.name.findName, if the name
// needs to be 100 character longs keep string concatenating or slicing until
// it's 100 characters long.
function stringGenerator({ length, generator, omit, once, leftadd }: FieldOption):
  string {
  let res = '';

  if (length) {
    while (res.length < length) {
      if (!generator) {
        throw new Error('generator is not defined');
      }
      if (leftadd) {
        res = generator() + res;
      } else {
        res += generator();
      }
    }
    if (res.length > length) {
      if (leftadd) {
        // Slice from the left
        res = res.slice(res.length - length);
      } else {
        // Slice from the right
        res = res.slice(0, length);
      }
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
