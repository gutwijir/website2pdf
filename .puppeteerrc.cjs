// eslint-disable-next-line @typescript-eslint/no-require-imports
const { join } = require('path');

/** @type {import("puppeteer").Configuration} */
module.exports = {
  // Changes the cache location for Puppeteer to be project-local.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};