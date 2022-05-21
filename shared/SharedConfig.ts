export const VERSION = process.env.GHOST_VERSION || '4.41';
export const PORT = parseInt(process.env.GHOST_PORT || '9333')
export const VISUAL_REGRESSION_TESTING = Boolean(process.env.GHOST_VRT || false);
export const CI = Boolean(process.env.CI || false);
export const URL = (process.env.GHOST_URL || 'http://localhost:' + PORT.toString()).replace(/\/$/, '');
export const IMAGE = `ghost:${VERSION}`;
export const CNAME = `ghost-testing`;

export const Urls = {
  main: URL,
  signin: URL + "/ghost/#/signin",
  setup: URL + "/ghost/#/setup",
  dashboard: URL + "/ghost/#/dashboard",
  "member/list": URL + "/ghost/#/members",
  "member/new": URL + "/ghost/#/members/new",
  "post/list": URL + "/ghost/#/posts",
  "tag/new": URL + "/ghost/#/tags/new",
} as const

export const SiteConfig = {
  siteTitle: process.env.GHOST_SITE_NAME || 'Testing Site',
  password: process.env.GHOST_PASSWORD || 'Very_Strong1!',
  email: process.env.GHOST_EMAIL || 'tester@tester.com',
  name: process.env.GHOST_SITE_NAME || 'Testing Site',
} as const
