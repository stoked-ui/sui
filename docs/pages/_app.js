import '@stoked-ui/docs/components/bootstrap';
// --- Post bootstrap -----
import * as React from 'react';
import { loadCSS } from 'fg-loadcss/src/loadCSS';
import { DocsProvider } from '@mui/docs/DocsProvider';
import { DocsProvider as SUIDocsProvider } from '@stoked-ui/docs/DocsProvider/DocsProvider';
import { mapTranslations } from '@mui/docs/i18n';
import NextHead from 'next/head';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { ProductIds } from '@stoked-ui/docs/Products';
import getProducts from 'docs/src/products';
import PageContext from '@stoked-ui/docs/components/PageContext';
import { CodeCopyProvider } from '@stoked-ui/docs/utils/CodeCopy';
import { ThemeProvider } from '@stoked-ui/docs/components/ThemeContext';
import { CodeVariantProvider } from '@stoked-ui/docs/utils/codeVariant';
import { CodeStylingProvider } from '@stoked-ui/docs/utils/codeStylingSolution';
import DocsStyledEngineProvider from '@stoked-ui/docs/utils/StyledEngineProvider';
import createEmotionCache from 'docs/src/createEmotionCache';
import findActivePage from '@stoked-ui/docs/utils/findActivePage';
import { pathnameToLanguage } from '@stoked-ui/docs/utils/helpers';
import ROUTES from 'docs/src/route';
import featureToggle from 'docs/src/featureToggle';
import fileExplorerPages from '../data/pages';
import './global.css';
import '../public/static/components-gallery/base-theme.css';
import config, {LANGUAGES_SSR} from '../config';
import SvgSuiLogomark from "../src/icons/SvgSuiLogomark";


// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();
let reloadInterval;

// Avoid infinite loop when "Upload on reload" is set in the Chrome sw dev tools.
function lazyReload() {
  clearInterval(reloadInterval);
  reloadInterval = setInterval(() => {
    if (document.hasFocus()) {
      window.location.reload();
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
    process.env.NODE_ENV === 'production' &&
    window.location.host.indexOf('github.io') !== -1
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

███╗   ███╗ ██╗   ██╗ ██████╗
████╗ ████║ ██║   ██║   ██╔═╝
██╔████╔██║ ██║   ██║   ██║
██║╚██╔╝██║ ██║   ██║   ██║
██║ ╚═╝ ██║ ╚██████╔╝ ██████╗
╚═╝     ╚═╝  ╚═════╝  ╚═════╝

Tip: you can access the documentation \`theme\` object directly in the console.
`,
    'font-family:monospace;color:#1976d2;font-size:12px;',
  );
}

const PRODUCTS = getProducts();
function AppWrapper(props) {
  const { children, emotionCache, pageProps } = props;

  const router = useRouter();
  // TODO move productId & productCategoryId resolution to page layout.
  // We should use the productId field from the markdown and fallback to getProductInfoFromUrl()
  // if not present
  const asPathWithoutLang = pathnameToLanguage(router.asPath).canonicalAsServer;
  const firstFolder = asPathWithoutLang.replace(/^\/+([^/]+)\/.*/, '$1');
  let product = PRODUCTS?.index['stoked-ui'];
  if (ProductIds.indexOf(firstFolder) !== -1) {
    product = PRODUCTS.index[firstFolder]
  }

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
    return {
      ...product,
      versions: [
        {
          text: 'v1 (next)',
          href: `${languagePrefix}/v1/${product?.id}/`,
        },
        {text: `v${product?.version}`, current: true},
        {
          text: 'View all versions',
          href: `${languagePrefix}/versions/${product?.id}`,
        },
      ],
    }
  }, [product, pageProps.userLanguage]);

  const pageContextValue = React.useMemo(() => {
    const pages = fileExplorerPages;
    const { activePage, activePageParents } = findActivePage(pages, router.pathname);

    return {
      featureToggle,
      routes: ROUTES,
      languages: LANGUAGES_SSR,
      Logomark: SvgSuiLogomark,
      products: PRODUCTS,
      activePage,
      activePageParents,
      pages,
      productIdentifier,
      productId: product?.id,
      productCategoryId: product?.category,
    };
  }, [product, router.pathname, productIdentifier]);

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
        <meta name="mui:productId" content={product?.id} />
        <meta name="mui:productCategoryId" content={product?.category} />
      </NextHead>
        <SUIDocsProvider
          config={config}
          defaultUserLanguage={pageProps.userLanguage}
          translations={pageProps.translations}
        >
          <DocsProvider
            config={config}
            defaultUserLanguage={pageProps.userLanguage}
            translations={pageProps.translations}
          >
          <CodeCopyProvider>
            <CodeStylingProvider>
              <CodeVariantProvider>
                <PageContext.Provider value={pageContextValue}>
                  <ThemeProvider>
                    <DocsStyledEngineProvider cacheLtr={emotionCache}>
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
        </DocsProvider>
      </SUIDocsProvider>
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

// Track fraction of actual events to prevent exceeding event quota.
// Filter sessions instead of individual events so that we can track multiple metrics per device.
// See https://github.com/GoogleChromeLabs/web-vitals-report to use this data
const disableWebVitalsReporting = Math.random() > 0.0001;
export function reportWebVitals({ id, name, label, delta, value }) {
  if (disableWebVitalsReporting) {
    return;
  }

  window.gtag('event', name, {
    value: delta,
    metric_label: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
    metric_value: value,
    metric_delta: delta,
    metric_id: id, // id unique to current page load
  });
}
