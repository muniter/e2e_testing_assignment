const Url = process.env.GHOST_URL || 'http://localhost:9333';
Url.replace(/\/$/, '');  // Remove trailing slash
const Urls = {
  "signin": Url + "/ghost/#/signin",
  "setup": Url + "/ghost/#/setup",
  "dashboard": Url + "/ghost/#/dashboard",
  "members/list": Url + "/ghost/#/members",
}

module.exports = {
  Url,
  Urls,
}
