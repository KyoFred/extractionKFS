const settings = require('../data/settings.json');
async function setCookie(driver) {
  const cookie = {
    name: settings.cookieAuthName,
    value: settings.cookieAuthValue,
    domain: settings.cookieAuthDomain,
  };
  await driver.manage().addCookie(cookie);
}
module.exports = {
  setCookie
}; 
