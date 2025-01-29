import * as React from 'react';
import Script from 'next/script';
import { documentGetInitialProps } from '@mui/material-nextjs/v13-pagesRouter';
import { ServerStyleSheets as JSSServerStyleSheets } from '@mui/styles';
import { ServerStyleSheet } from 'styled-components';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import GlobalStyles from '@mui/material/GlobalStyles';
import { getInitColorSchemeScript as getMuiInitColorSchemeScript } from '@mui/material/styles';
import { getInitColorSchemeScript as getJoyInitColorSchemeScript } from '@mui/joy/styles';
import { pathnameToLanguage } from 'docs/src/modules/utils/helpers';
import createEmotionCache from 'docs/src/createEmotionCache';
import { getMetaThemeColor } from '@mui/docs/branding';

// You can find a benchmark of the available CSS minifiers under
// https://github.com/GoalSmashers/css-minification-benchmark
// We have found that clean-css is faster than cssnano but the output is larger.
// Waiting for https://github.com/cssinjs/jss/issues/279
// 4% slower but 12% smaller output than doing it in a single step.
//
// It's using .browserslistrc
let prefixer;
let cleanCSS;
if (process.env.NODE_ENV === 'production') {
  /* eslint-disable global-require */
  const postcss = require('postcss');
  const autoprefixer = require('autoprefixer');
  const CleanCSS = require('clean-css');
  /* eslint-enable global-require */

  prefixer = postcss([autoprefixer]);
  cleanCSS = new CleanCSS();
}

// const PRODUCTION_GA = process.env.DEPLOY_ENV === 'production' || process.env.DEPLOY_ENV === 'staging';

// const GOOGLE_ANALYTICS_ID_V4 = PRODUCTION_GA ? 'G-5NXDQLC2ZK' : 'G-XJ83JQEK7J';

export default class MyDocument extends Document {
  render() {
    const { canonicalAsServer, userLanguage } = this.props;

    return (
      <Html lang={userLanguage} data-mui-color-scheme="light" data-joy-color-scheme="light">
        <Head>
          <meta name="algolia-site-verification"  content="5102D7E9170A3450" />

          {/*
          <meta charSet="utf-8"/>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
           Web App Config
          <meta name="viewport"
                content="width=device-width, initial-scale=1.0, user-scalable=no"/>
          <meta name="theme-color" content="#3367d6"/>
          <meta name="color-scheme" content="dark light"/>
          <meta name="apple-mobile-web-app-capable" content="yes"/>
          <meta name="apple-mobile-web-app-title" content="Stoked UI"/>

          Descriptions
          <meta name="description"
                content="Instantly share images, videos, PDFs, and links with people nearby. Peer2Peer and Open Source. No Setup, No Signup."/>
          <meta name="keywords" content="File, Transfer, Share, Peer2Peer"/>
          <meta name="author" content="RobinLinus"/>
          <meta property="og:title" content="Snapdrop"/>
          <meta property="og:type" content="article"/>
          <meta property="og:url" content="https://snapdrop.net/"/>
          <meta property="og:author" content="https://facebook.com/RobinLinus"/>
          <meta name="twitter:author" content="@RobinLinus"/>
          <meta name="twitter:card" content="summary_large_image"/>
          <meta name="twitter:description"
                content="Instantly share images, videos, PDFs, and links with people nearby. Peer2Peer and Open Source. No Setup, No Signup."/>
          <meta name="og:description"
                content="Instantly share images, videos, PDFs, and links with people nearby. Peer2Peer and Open Source. No Setup, No Signup."/>
         Icons
          */}
          <link rel="icon" sizes="96x96" href="/static/icons/96x96.png"/>
          <link rel="shortcut icon" href="/static/icons/96x96.png"/>
          {/* <meta name="msapplication-TileImage" content="images/mstile-150x150.png"/> */}
          <link rel="fluid-icon" type="image/png" href="/static/icons/192x192.png"/>
        {/*   <meta name="twitter:image" content="https://snapdrop.net/images/twitter-stream.jpg"/>
          <meta property="og:image" content="https://snapdrop.net/images/twitter-stream.jpg"/> */}
          {/*  Resources */}
          {/*
            manifest.json provides metadata used when your web app is added to the
            homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
          */}
          <link rel="manifest" href="/static/web-app/manifest.json" key={"manifest"}/>
          {/* PWA primary color */}
          <meta
            name="theme-color"
            content={getMetaThemeColor('light')}
            media="(prefers-color-scheme: light)"
          />
          <meta
            name="theme-color"
            content={getMetaThemeColor('dark')}
            media="(prefers-color-scheme: dark)"
          />
          <link rel="shortcut icon" href="/favicon.ico"/>
          {/* iOS Icon */}
          <link rel="apple-touch-icon" sizes="180x180" href="/static/icons/180x180.png"/>
          {/* SEO */}
          <link
            rel="canonical"
            href={`https://stoked-ui.com${canonicalAsServer}`}
          />
          <link rel="alternate" href={`https://stokedconsulting.com${canonicalAsServer}`} hrefLang="x-default"/>
          {/*
            Preconnect allows the browser to setup early connections before an HTTP request
            is actually sent to the server.
            This includes DNS lookups, TLS negotiations, TCP handshakes.
          */}
          <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous"/>
          <link rel="preconnect" href="https://fonts.googleapis.com"/>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap"
            rel="stylesheet"
          />
          {/* ========== Font preload (prevent font flash) ============= */}
          <link
            rel="preload"
            // optimized for english characters (40kb -> 6kb)
            href="/static/fonts/GeneralSans-Semibold-subset.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <style
            // the above <link> does not work in mobile device, this inline <style> fixes it without blocking resources
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `@font-face{font-family:'General Sans';font-style:normal;font-weight:600;font-display:swap;src:url('/static/fonts/GeneralSans-Semibold-subset.woff2') format('woff2');}`,
            }}
          />
          <link
            rel="preload"
            // optimized for english characters (40kb -> 6kb)
            href="/static/fonts/ArchivoBlack-Regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <style
            // the above <link> does not work in mobile device, this inline <style> fixes it without blocking resources
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `@font-face{font-family:'Archivo Black';font-style:normal;font-weight:400;font-display:swap;src:url('/static/fonts/ArchivoBlack-Regular.woff2') format('woff2');}`,
            }}
          />
          <link
            rel="preload"
            // optimized for english characters (40kb -> 6kb)
            href="/static/fonts/IBMPlexSans-Regular-subset.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <style
            // the above <link> does not work in mobile device, this inline <style> fixes it without blocking resources
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:400;font-display:swap;src:url('/static/fonts/IBMPlexSans-Regular-subset.woff2') format('woff2');}`,
            }}
          />
          {/* =========================================================== */}
          <style
            // Load Archivo Black: Regular (400), Medium (500), SemiBold (600), Bold (700)
            // Typeface documentation: https://www.fontshare.com/fonts/general-sans
            // use https://cssminifier.com/ to minify
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `@font-face{font-family:'Archivo Black Medium';src:url(/static/fonts/ArchivoBlack-Regular.woff2) format('woff2'),url(/static/fonts/ArchivoBlack-Regular.ttf) format('truetype');font-weight:500;font-style:normal;font-display:swap;}@font-face{font-family:'Archivo Black SemiBold';src:url(/static/fonts/ArchivoBlack-Regular.woff2) format('woff2'),url(/static/fonts/ArchivoBlack-Regular.ttf) format('truetype');font-weight:600;font-style:normal;font-display:swap;}@font-face{font-family:'Archivo Black Bold';src:url(/static/fonts/ArchivoBlack-Regular.woff2) format('woff2'),url(/static/fonts/ArchivoBlack-Regular.ttf) format('truetype');font-weight:700;font-style:normal;font-display:swap;}`,
            }}
          />
          <style
            // Loads Archivo Black: LatinExt (400) and Latin (400)
            // Typeface documentation: https://www.fontshare.com/fonts/general-sans
            // use https://cssminifier.com/ to minify
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{/* latin-ext */
              __html: `@font-face {font-family:'Archivo Black Latin-Ext';font-style: normal;font-weight: 400;font-display: swap;src: url(/static/fonts/ArchivoBlack-LatinExt.woff2) format('woff2');unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;}@font-face {font-family: 'Archivo Black Latin';font-style: normal;font-weight: 400;font-display: swap;src: url(/static/fonts/ArchivoBlack-Latin.woff2) format('woff2');unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}`,
            }}
          />
          <style
            // Loads General Sans: Regular (400), Medium (500), SemiBold (600), Bold (700)
            // Typeface documentation: https://www.fontshare.com/fonts/general-sans
            // use https://cssminifier.com/ to minify
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `@font-face{font-family:'General Sans';src:url(/static/fonts/GeneralSans-Regular.woff2) format('woff2'),url(/static/fonts/GeneralSans-Regular.ttf) format('truetype');font-weight:400;font-style:normal;font-display:swap;}@font-face{font-family:'General Sans';src:url(/static/fonts/GeneralSans-Medium.woff2) format('woff2'),url(/static/fonts/GeneralSans-Medium.ttf) format('truetype');font-weight:500;font-style:normal;font-display:swap;}@font-face{font-family:'General Sans';src:url(/static/fonts/GeneralSans-SemiBold.woff2) format('woff2'),url(/static/fonts/GeneralSans-SemiBold.ttf) format('truetype');font-weight:600;font-style:normal;font-display:swap;}@font-face{font-family:'General Sans';src:url(/static/fonts/GeneralSans-Bold.woff2) format('woff2'),url(/static/fonts/GeneralSans-Bold.ttf) format('truetype');font-weight:700;font-style:normal;font-display:swap;}`,
            }}
          />
          <style
            // Loads IBM Plex Sans: 400,500,700 & IBM Plex Mono: 400, 600
            // use https://cssminifier.com/ to minify
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `@font-face{font-family:'IBM Plex Sans';src:url(/static/fonts/IBMPlexSans-Regular.woff2) format('woff2'),url(/static/fonts/IBMPlexSans-Regular.woff) format('woff'),url(/static/fonts/IBMPlexSans-Regular.ttf) format('truetype');font-weight:400;font-style:normal;font-display:swap}@font-face{font-family:'IBM Plex Sans';src:url(/static/fonts/IBMPlexSans-Medium.woff2) format('woff2'),url(/static/fonts/IBMPlexSans-Medium.woff) format('woff'),url(/static/fonts/IBMPlexSans-Medium.ttf) format('truetype');font-weight:500;font-style:normal;font-display:swap}@font-face{font-family:'IBM Plex Sans';src:url(/static/fonts/IBMPlexSans-SemiBold.woff2) format('woff2'),url(/static/fonts/IBMPlexSans-SemiBold.woff) format('woff'),url(/static/fonts/IBMPlexSans-SemiBold.ttf) format('truetype');font-weight:600;font-style:normal;font-display:swap}@font-face{font-family:'IBM Plex Sans';src:url(/static/fonts/IBMPlexSans-Bold.woff2) format('woff2'),url(/static/fonts/IBMPlexSans-Bold.woff) format('woff'),url(/static/fonts/IBMPlexSans-Bold.ttf) format('truetype');font-weight:700;font-style:normal;font-display:swap}`,
            }}
          />
          <GlobalStyles
            styles={{
              // First SSR paint
              '.only-light-mode': {
                display: 'block',
              },
              '.only-dark-mode': {
                display: 'none',
              },
              // Post SSR Hydration
              '.mode-dark .only-light-mode': {
                display: 'none',
              },
              '.mode-dark .only-dark-mode': {
                display: 'block',
              },
              // TODO migrate to .only-dark-mode to .only-dark-mode-v2
              '[data-mui-color-scheme="light"] .only-dark-mode-v2': {
                display: 'none',
              },
              '[data-mui-color-scheme="dark"] .only-light-mode-v2': {
                display: 'none',
              },
              '.plan-pro, .plan-premium': {
                display: 'inline-block',
                height: '1em',
                width: '1em',
                verticalAlign: 'middle',
                marginLeft: '0.3em',
                marginBottom: '0.08em',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              },
              '.plan-pro': {
                backgroundImage: 'url(/static/x/pro.svg)',
              },
              '.plan-premium': {
                backgroundImage: 'url(/static/x/premium.svg)',
              },
            }}
          />

        </Head>
        <body>
        {getMuiInitColorSchemeScript({defaultMode: 'system'})}
        {getJoyInitColorSchemeScript({defaultMode: 'system'})}
        <Main/>
        {/*
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GOOGLE_ANALYTICS_ID_V4}', {
  send_page_view: false,
});
`,
            }}
          />
          *
           * A better alternative to <script async>, to delay its execution
           * https://developer.chrome.com/blog/script-component/

          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID_V4}`}
          />
          */}
        <NextScript/>
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx) => {
  const jssSheets = new JSSServerStyleSheets();
  const styledComponentsSheet = new ServerStyleSheet();

  try {
    const finalProps = await documentGetInitialProps(ctx, {
      emotionCache: createEmotionCache(),
      plugins: [
        {
          // styled-components
          enhanceApp: (App) => (props) => styledComponentsSheet.collectStyles(<App {...props} />),
          resolveProps: async (initialProps) => ({
            ...initialProps,
            styles: [styledComponentsSheet.getStyleElement(), ...initialProps.styles],
          }),
        },
        {
          // JSS
          enhanceApp: (App) => (props) => jssSheets.collect(<App {...props} />),
          resolveProps: async (initialProps) => {
            let css = jssSheets.toString();
            // It might be undefined, for example after an error.
            if (css && process.env.NODE_ENV === 'production') {
              const result1 = await prefixer.process(css, {from: undefined});
              css = result1.css;
              css = cleanCSS.minify(css).styles;
            }

            return {
              ...initialProps,
              styles: [
                ...initialProps.styles,
                <style
                  id="jss-server-side"
                  key="jss-server-side"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{__html: css}}
                />,
                <style id="insertion-point-jss" key="insertion-point-jss"/>,
              ],
            };
          },
        },
      ],
    });

    // All the URLs should have a leading /.
    // This is missing in the Next.js static export.
    let url = ctx.req.url;
    if (url[url.length - 1] !== '/') {
      url += '/';
    }
    console.info('pathnameToLanguage(url).canonicalAsServer', url, pathnameToLanguage(url).canonicalAsServer);

    return {
      ...finalProps,
      canonicalAsServer: pathnameToLanguage(url).canonicalAsServer,
      userLanguage: ctx.query.userLanguage || 'en',
      styles: [
        <style id="material-icon-font" key="material-icon-font"/>,
        <style id="font-awesome-css" key="font-awesome-css" />,
        ...finalProps.emotionStyleTags,
        <style id="app-search" key="app-search" />,
        <style id="prismjs" key="prismjs" />,
        ...React.Children.toArray(finalProps.styles),
      ],
    };
  } finally {
    styledComponentsSheet.seal();
  }
};
