export const Url = (process.env.GHOST_URL || 'http://localhost:9333').replace(/\/$/, '');
export const Urls = {
  "signin": Url + "/ghost/#/signin",
  "setup": Url + "/ghost/#/setup",
  "dashboard": Url + "/ghost/#/dashboard",
  "members/list": Url + "/ghost/#/members",
} as const

