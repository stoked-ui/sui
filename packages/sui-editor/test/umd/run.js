/**
 * Required modules
 */
const http = require('http');
const path = require('path');
const playwright = require('playwright');
const fse = require('fs-extra');
const express = require('express');
const { expect } = require('chai');

const port = 3090;
const host = '0.0.0.0';

/**
 * Starts a server
 * @param {express.Express} app - The Express app instance
 * @returns {Promise<{ close: Function }>} A promise that resolves with a function to close the server
 */
function startServer(app) {
  const server = http.createServer(app);

  /**
   * Closes the server
   * @returns {Promise<void>}
   */
  function close() {
    console.info('http: server is stopping');

    return new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  return new Promise((resolve, reject) => {
    server.listen(port, host, (error) => {
      if (error) {
        reject(error);
      } else {
        console.info(`http: ready on http://${server.address().address}:${server.address().port}`);
        resolve({ close });
      }
    });
  });
}

/**
 * Creates an Express app
 * @returns {Promise<express.Express>} A promise that resolves with the Express app instance
 */
async function createApp() {
  const app = express();
  const rootPath = path.join(__dirname, '../../../../');
  const umdPath = '/umd.js';

  let index = await fse.readFile(
    path.join(rootPath, 'examples/material-ui-via-cdn/index.html'),
    'utf8',
  );
  index = index.replace(
    'https://unpkg.com/@mui/material@latest/umd/material-ui.development.js',
    umdPath,
  );
  index = index.replace(
    'function App() {',
    `
const {
  Button,
  Dialog,
} = MaterialUI;

function App() {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <Button onClick={() => setOpen(true)}>Super Secret Password</Button>
      <Dialog open={open}>
        1-2-3-4-5
      </Dialog>
    </React.Fragment>
  );
     `,
  );
  app.get('/', (req, res) => {
    res.send(index);
  });

  const umd = await fse.readFile(
    path.join(rootPath, 'packages/mui-material/build/umd/material-ui.development.js'),
    'utf8',
  );
  app.get(umdPath, (req, res) => {
    res.send(umd);
  });

  return app;
}

/**
 * Starts a browser
 * @returns {Promise<{ page: playwright.Page, close: Function }>} A promise that resolves with the browser page and a function to close the browser
 */
async function startBrowser() {
  console.info('browser: start');
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (err) => {
    throw err;
  });

  /**
   * Closes the browser
   * @returns {Promise<void>}
   */
  function close() {
    console.info('browser:server is stopping');
    return browser.close();
  }

  return { page, close };
}

/**
 * Runs the application
 */
async function run() {
  let server = { close() {} };
  let closeBrowser = () => {};
  try {
    const app = await createApp();
    server = await startServer(app);

    const { page, close } = await startBrowser();
    closeBrowser = close;

    await page.goto(`http://${host}:${port}`);
    const button = await page.$('button');
    expect(await button.textContent()).to.equal('Super Secret Password');
    await button.click();
    expect(await page.textContent('body')).to.include('1-2-3-4-5');
  } finally {
    await Promise.all([closeBrowser(), server.close()]);
  }
}

run().catch((error) => {
  console.error('test: ', error);
  process.exit(1);
});