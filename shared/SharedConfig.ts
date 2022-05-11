const Url = (process.env.GHOST_URL || 'http://localhost:9333').replace(/\/$/, '');

export const Urls = {
  main: Url,
  signin: Url + "/ghost/#/signin",
  setup: Url + "/ghost/#/setup",
  dashboard: Url + "/ghost/#/dashboard",
  "member/list": Url + "/ghost/#/members",
  "post/list": Url + "/ghost/#/posts",
} as const

export const SiteConfig = {
  siteTitle: process.env.GHOST_SITE_NAME || 'Testing Site',
  password: process.env.GHOST_PASSWORD || 'Very_Strong1!',
  email: process.env.GHOST_EMAIL || 'tester@tester.com',
  name: process.env.GHOST_SITE_NAME || 'Testing Site',
} as const
