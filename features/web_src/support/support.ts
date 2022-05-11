import { setWorldConstructor, setDefaultTimeout, World } from '@cucumber/cucumber';
import { WebClient } from './WebClient'
import { Browser } from 'webdriverio';
import { ScenarioInformation, getCurrentScenario } from './utils';
import type { Browser as PuppeteerBrowser } from 'puppeteer-core/lib/cjs/puppeteer/common/Browser';
import type { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';
// Source maps
require('source-map-support').install();

export interface Cookie {
  posts: {
    last: {
      title: string,
      url: string,
    }
  }
}


export class KrakenWorld extends World {
  deviceClient!: WebClient;
  driver!: Browser<'async'>;
  browser!: PuppeteerBrowser;
  page!: Page;
  testId!: number;
  userId: any;
  device: any;
  testScenarioId: any;
  attach: any;
  scenario: ScenarioInformation;
  cookie: Cookie;
  constructor(input: any) {
    super(input);
    let params = input.parameters;
    this.userId = params.id;
    this.device = params.device || {};
    this.testScenarioId = params.testScenarioId;
    this.attach = input.attach;
    this.scenario = getCurrentScenario();
    this.cookie = {
      posts: {
        last: {
          title: '',
          url: '',
        }
      }
    }
  }
}

setWorldConstructor(KrakenWorld);
setDefaultTimeout(30 * 1000);
