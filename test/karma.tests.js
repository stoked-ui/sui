import '@stoked-ui/internal-test-utils/init';
import '@stoked-ui/internal-test-utils/setupKarma';

const editorIntegrationContext = require.context(
  '../packages/sui-editor/test/integration',
  true,
  /\.test\.(js|ts|tsx)$/,
);
editorIntegrationContext.keys().forEach(editorIntegrationContext);

const editorUnitContext = require.context(
  '../packages/sui-editor/src/',
  true,
  /\.test\.(js|ts|tsx)$/,
);
editorUnitContext.keys().forEach(editorUnitContext);


const githubIntegrationContext = require.context(
  '../packages/sui-github/test/integration',
  true,
  /\.test\.(js|ts|tsx)$/,
);
githubIntegrationContext.keys().forEach(githubIntegrationContext);

const githubUnitContext = require.context(
  '../packages/sui-github/src/',
  true,
  /\.test\.(js|ts|tsx)$/,
);
githubUnitContext.keys().forEach(githubUnitContext);
