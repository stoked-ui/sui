import 'docs/src/modules/components/bootstrap';
// --- Post bootstrap -----
import * as React from 'react';
import { loadCSS } from 'fg-loadcss/src/loadCSS';
import NextHead from 'next/head';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { mapTranslations } from '@stoked-ui/docs/i18n';
import fileExplorerPkgJson from 'packages/sui-file-explorer/package.json';
import PageContext from 'docs/src/modules/components/PageContext';
import { CodeCopyProvider } from 'docs/src/modules/utils/CodeCopy';
import { ThemeProvider } from 'docs/src/modules/components/ThemeContext';
import { CodeVariantProvider } from 'docs/src/modules/utils/codeVariant';
import { CodeStylingProvider } from 'docs/src/modules/utils/codeStylingSolution';
import DocsStyledEngineProvider from 'docs/src/modules/utils/StyledEngineProvider';
import createEmotionCache from 'docs/src/createEmotionCache';
import findActivePage from 'docs/src/modules/utils/findActivePage';
import { pathnameToLanguage } from 'docs/src/modules/utils/helpers';
import getProductInfoFromUrl from 'docs/src/modules/utils/getProductInfoFromUrl';
import { DocsProvider as DocsProviderStoked } from '@stoked-ui/docs/DocsProvider';
import fileExplorerPages from '../data/pages';
import './global.css';
import "plyr-react/plyr.css"
import '../public/static/components-gallery/base-theme.css';
import config from '../config';
import {styled} from "@mui/material/styles";
import Head from "../src/modules/components/Head";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

let reloadInterval;

const StyledHead = styled(Head)(({ theme }) => ({
  '& body': {
    backgroundColor: theme.palette.mode === 'dark' ? 'hsl(210, 14%, 7%);' : '#fff',
  }
}));
// Avoid infinite loop when "Upload on reload" is set in the Chrome sw dev tools.
function lazyReload() {
  clearInterval(reloadInterval);
  reloadInterval = setInterval(() => {
    if (document.hasFocus()) {
      /* window.location.reload(); */
      console.warn('reload not called check here');
    }
  }, 100);
}

// Inspired by
// https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
function forcePageReload(registration) {
  // console.log('already controlled?', Boolean(navigator.serviceWorker.controller));

  if (!navigator.serviceWorker.controller) {
    // The window client isn't currently controlled so it's a new service
    // worker that will activate immediately.
    return;
  }

  // console.log('registration waiting?', Boolean(registration.waiting));
  if (registration.waiting) {
    // SW is waiting to activate. Can occur if multiple clients open and
    // one of the clients is refreshed.
    registration.waiting.postMessage('skipWaiting');
    return;
  }

  function listenInstalledStateChange() {
    registration.installing.addEventListener('statechange', (event) => {
      // console.log('statechange', event.target.state);
      if (event.target.state === 'installed' && registration.waiting) {
        // A new service worker is available, inform the user
        registration.waiting.postMessage('skipWaiting');
      } else if (event.target.state === 'activated') {
        // Force the control of the page by the activated service worker.
        lazyReload();
      }
    });
  }

  if (registration.installing) {
    listenInstalledStateChange();
    return;
  }

  // We are currently controlled so a new SW may be found...
  // Add a listener in case a new SW is found,
  registration.addEventListener('updatefound', listenInstalledStateChange);
}

async function registerServiceWorker() {
  if (
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
    /*
    window.location.host.indexOf('github.io') !== -1
     */
  ) {
    // register() automatically attempts to refresh the sw.js.
    const registration = await navigator.serviceWorker.register('/sw.js');
    // Force the page reload for users.
    forcePageReload(registration);
  }
}

let dependenciesLoaded = false;

function loadDependencies() {
  if (dependenciesLoaded) {
    return;
  }

  dependenciesLoaded = true;

  loadCSS(
    'https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Two+Tone',
    document.querySelector('#material-icon-font'),
  );
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.log(
    `%c

███████╗ ██╗   ██╗ ██████╗
██╔════╝ ██║   ██║   ██╔═╝
███████║ ██║   ██║   ██║
     ██║ ██║   ██║   ██║
███████║ ╚██████╔╝ ██████╗
╚══════╝  ╚═════╝  ╚═════╝

Tip: you can access the documentation \`theme\` object directly in the console.
`,
    'font-family:monospace;color:#1976d2;font-size:12px;',
  );
}
function AppWrapper(props) {
  const { children, emotionCache, pageProps } = props;

  const router = useRouter();
  // TODO move productId & productCategoryId resolution to page layout.
  // We should use the productId field from the markdown and fallback to getProductInfoFromUrl()
  // if not present
  const { productId, productCategoryId } = getProductInfoFromUrl(router.asPath);

  console.log('productId', productId, router.asPath);
  console.log('productCategoryId', productCategoryId);

  React.useEffect(() => {
    loadDependencies();
    registerServiceWorker().catch(console.error);

    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  const productIdentifier = React.useMemo(() => {
    const languagePrefix = pageProps.userLanguage === 'en' ? '' : `/${pageProps.userLanguage}`;

    const productMap = {
      'github': {
        metadata: 'Stoked UI',
        name: 'Github',
      },
      'editor': {
        metadata: 'Stoked UI',
        name: 'Editor',
      },
      'file-explorer': {
        metadata: 'Stoked UI',
        name: 'File Explorer',
      },
      'media-selector': {
        metadata: 'Stoked UI',
        name: 'Media Selector',
      },
      'timeline': {
        metadata: 'Stoked UI',
        name: 'Timeline',
      },
      'stoked-ui': {
        metadata: 'Stoked UI',
        name: 'Stoked UI',
      },
      'docs': {
        metadata: 'Docs',
        name: 'Stoked UI',
      },
    };

    return {
      ...productMap[productId ?? 'stoked-ui'],
      versions: [
        {
          text: 'v1 (next)',
          href: `${languagePrefix}/v1/${productId}/`,
        },
        {text: `v${fileExplorerPkgJson.version}`, current: true},
        {
          text: 'View all versions',
          href: `${languagePrefix}/versions/${productId}`,
        },
      ],
    }
  }, [pageProps.userLanguage, productId]);


  const pageContextValue = React.useMemo(() => {
    const pages = fileExplorerPages;
    const { activePage, activePageParents } = findActivePage(pages, router.pathname);

    return {
      activePage,
      activePageParents,
      pages,
      productIdentifier,
      productId,
      productCategoryId,
    };
  }, [productId, productCategoryId, productIdentifier, router.pathname]);

  let fonts = [];
  if (pathnameToLanguage(router.asPath).canonicalAs.match(/onepirate/)) {
    fonts = [
      'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&family=Work+Sans:wght@300;400&display=swap',
    ];
  }

  return (
    <React.Fragment>
      <NextHead>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        {fonts.map((font) => (
          <link rel="stylesheet" href={font} key={font} />
        ))}
        <meta name="mui:productId" content={productId} />
        <meta name="mui:productCategoryId" content={productCategoryId} />
        {productIdentifier?.metadata ? <title>{`${productIdentifier.metadata} - ${productIdentifier.name}`}</title> : null}
      </NextHead>
      <DocsProviderStoked
        config={config}
        defaultUserLanguage={pageProps.userLanguage}
        translations={pageProps.translations}
      >

          <CodeCopyProvider>
            <CodeStylingProvider>
              <CodeVariantProvider>
                <PageContext.Provider value={pageContextValue}>
                  <ThemeProvider>
                    <DocsStyledEngineProvider cacheLtr={emotionCache} injectFirst>
                      {children}
                      {/*
                      <GoogleAnalytics />
                      */}
                    </DocsStyledEngineProvider>
                  </ThemeProvider>
                </PageContext.Provider>
              </CodeVariantProvider>
            </CodeStylingProvider>
          </CodeCopyProvider>
      </DocsProviderStoked>
    </React.Fragment>
  );
}

AppWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  emotionCache: PropTypes.object.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <AppWrapper emotionCache={emotionCache} pageProps={pageProps}>
      {getLayout(<Component {...pageProps} />)}
    </AppWrapper>
  );
}
MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};

MyApp.getInitialProps = async ({ ctx, Component }) => {
  let pageProps = {};

  const req = require.context('docs/translations', false, /translations.*\.json$/);
  const translations = mapTranslations(req);

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  return {
    pageProps: {
      userLanguage: ctx.query.userLanguage || 'en',
      translations,
      ...pageProps,
    },
  };
};

