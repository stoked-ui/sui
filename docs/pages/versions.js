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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout so one slow GitHub call never bricks a deploy

  try {
    const result = await fetch('https://api.github.com/repos/stoked-ui/sui/branches', {
      headers: {
        Authorization: process.env.GH_AUTH,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (result.status !== 200) {
      console.warn(`[versions] GitHub branches fetch failed with ${result.status}, falling back`);
      return [];
    }

    const text = await result.text();
    return JSON.parse(text);
  } catch (err) {
    clearTimeout(timeout);
    console.warn('[versions] GitHub branches fetch error (non-fatal):', err.message || err);
    return []; // graceful fallback so production builds never hang on this
  }
}

export const getStaticProps = async () => {
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
            url: `https://${version.replace(/\./g, '-')}.sui.stokd.cloud`,
          });
        }
      });
    }
    // Current version.

    versions.push(
      {
        version: `v${process.env.LIB_VERSION}`,
        url: 'https://sui.stokd.cloud',
      });
    // Legacy documentation.
    versions.push({
      version: 'v0',
      url: 'https://v0.sui.stokd.cloud',
    });
    versions.sort((a, b) => formatVersion(b.version).localeCompare(formatVersion(a.version)));
    if (
      branches.length > 0 && branches.find((branch) => branch?.name === 'next') &&
      !versions.find((version) => /beta|alpha/.test(version.version))
    ) {
      versions.unshift({
        version: `v${Number(versions[0].version[1]) + 1} pre-release`,
        url: 'https://next.sui.stokd.cloud',
      });
    }

    return {
      props: {
        versions: sortedUniqBy(versions, 'version'),
      },
    };
  } catch (ex) {
    console.error(`VERSIONS Error: ${ex.message}`);
  }
  return {
    props: {
      versions: [],
    },
  };
};
