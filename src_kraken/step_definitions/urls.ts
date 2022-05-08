export const Url = (process.env.GHOST_URL || 'http://localhost:9333').replace(/\/$/, '');
export const Urls = {
  "main": Url,
  "signin": Url + "/ghost/#/signin",
  "setup": Url + "/ghost/#/setup",
  "dashboard": Url + "/ghost/#/dashboard",
  "member/list": Url + "/ghost/#/members",
  "post/list": Url + "/ghost/#/posts",
} as const

