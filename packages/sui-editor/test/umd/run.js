/**
 * @fileoverview Main entry point of the test
 */

const port = 3090;
const host = '0.0.0.0';

/**
 * Starts an HTTP server with the given application.
 *
 * @param {Express.Application} app - The Express application to use.
 * @returns {Promise<Object>} A promise that resolves when the server is ready,
 * or rejects if an error occurs.
 */
function startServer(app) {
  const server = http.createServer(app);

  /**
   * Closes the HTTP server and returns a resolved promise.
   *
   * @returns {Promise<void>}
   */
  function close() {
    // eslint-disable-next-line no-console
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

  /**
   * Listens for a connection on the given port and returns a resolved promise.
   *
   * @returns {Promise<Object>} A promise that resolves when the server is ready,
   * or rejects if an error occurs.
   */
  return new Promise((resolve, reject) => {
    server.listen(port, host, (error) => {
      if (error) {
        reject(error);
      } else {
        // eslint-disable-next-line no-console
        console.info(`http: ready on http://${server.address().address}:${server.address().port}`);

        resolve({ close });
      }
    });
  });
}

/**
 * Creates a new Express application with the given root path and material-ui UMD file.
 *
 * @returns {Promise<Express.Application>} A promise that resolves with the created application.
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
 * Starts a new browser instance and returns a promise that resolves with the page object.
 *
 * @returns {Promise<{ page: Page; close: () => void }>} A promise that resolves with the created page object.
 */
async function startBrowser() {
  // eslint-disable-next-line no-console
  console.info('browser: start');
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (err) => {
    throw err;
  });

  /**
   * Closes the browser and returns a resolved promise.
   *
   * @returns {Promise<void>}
   */
  function close() {
    // eslint-disable-next-line no-console
    console.info('browser:server is stopping');
    return browser.close();
  }

  return { page, close };
}

/**
 * Runs the test by starting the server, opening a new browser instance,
 * navigating to the application and verifying that everything works as expected.
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