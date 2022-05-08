import { setWorldConstructor, setDefaultTimeout, World } from '@cucumber/cucumber';
import { WebClient } from 'kraken-node';
import { Browser } from 'webdriverio';
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

export class KrakenWorld {
  deviceClient!: WebClient;
  driver!: Browser<'async'>;
  browser!: PuppeteerBrowser;
  page!: Page;
  testId!: number;
  userId: any;
  device: any;
  testScenarioId: any;
  attach: any;
  cookie = {
    posts: {
      last: {
        title: '',
        url: '',
      }
    }
  } as Cookie;
  constructor(input: any) {
    let params = input.parameters;
    this.userId = params.id;
    this.device = params.device || {};
    this.testScenarioId = params.testScenarioId;
    this.attach = input.attach;
  }
}

setWorldConstructor(KrakenWorld);
setDefaultTimeout(30 * 1000);
