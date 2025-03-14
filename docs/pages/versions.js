import * as React from 'react';
import sortedUniqBy from 'lodash/sortedUniqBy';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import VersionsContext from 'docs/src/pages/versions/VersionsContext';
import * as pageProps from 'docs/src/pages/versions/versions.md?muiMarkdown';

export default function Page(props) {
  const { versions } = props;
  return (
    <VersionsContext.Provider value={versions}>
      <MarkdownDocs {...pageProps} />
    </VersionsContext.Provider>
  );
}

function formatVersion(version) {
  return version
    .replace('v', '')
    .split('.')
    .map((n) => +n + 1000)
    .join('.');
}

async function getBranches() {
  const result = await fetch('https://api.github.com/repos/stoked-ui/sui/branches', {
    headers: {
      Authorization: process.env.GH_AUTH,
    },
  });
  const text = await result.text();

  if (result.status !== 200) {
    throw new Error(text);
  }

  return JSON.parse(text);
}

Page.getInitialProps = async () => {
  try {
    const FILTERED_BRANCHES = ['main', 'l10n', 'next', 'migration', 'material-ui.com'];

    const branches = await getBranches();

    const versions = [];
    if (branches.length) {
      branches.forEach((branch) => {
        if (FILTERED_BRANCHES.indexOf(branch?.name) === -1 && branch?.name.startsWith('v')) {
          const version = branch?.name;
          versions.push({
            version,
            // Replace dot with dashes for Netlify branch subdomains
            url: `https://${version.replace(/\./g, '-')}.stoked-ui.com`,
          });
        }
      });
    }
    // Current version.

    versions.push(
      {
        version: `v${process.env.LIB_VERSION}`,
        url: 'https://stoked-ui.com',
      });
    // Legacy documentation.
    versions.push({
      version: 'v0',
      url: 'https://v0.stoked-ui.com',
    });
    versions.sort((a, b) => formatVersion(b.version).localeCompare(formatVersion(a.version)));
    if (
      branches.length > 0 && branches.find((branch) => branch?.name === 'next') &&
      !versions.find((version) => /beta|alpha/.test(version.version))
    ) {
      versions.unshift({
        version: `v${Number(versions[0].version[1]) + 1} pre-release`,
        url: 'https://next.stoked-ui.com',
      });
    }

    return {versions: sortedUniqBy(versions, 'version')};
  } catch (ex) {
    console.error(`VERSIONS Error: ${ex.message}`);
  }
  return {versions: []};
};
