// global-setup.ts
import * as fs from 'fs';
import { FullConfig } from '@playwright/test';
import { VISUAL_REGRESSION_TESTING, VERSION } from './shared/SharedConfig';
import { VRTBeforeAll } from './e2e-playwright/util/util';

async function globalSetup(config: FullConfig) {
  if (VISUAL_REGRESSION_TESTING) {
    try {
      fs.rmSync(`./screenshots/playwright/${VERSION}`, { recursive: true, force: true });
    } catch (e) { }
  } else {
    // Setup ghost once only when not on VRT
    await VRTBeforeAll()
  }
}

export default globalSetup;
