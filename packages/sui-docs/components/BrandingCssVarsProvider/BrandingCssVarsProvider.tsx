import * as React from 'react';
import { deepmerge } from '@mui/utils';
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  extendTheme as extendTheme,
  PaletteColorOptions,
} from '@mui/material/styles';

import { debounce } from "@mui/material/utils";
import NProgress from "nprogress";
import { useRouter } from 'next/router.js';
import CssBaseline from '@mui/material/CssBaseline';
import { getDesignTokens, getThemedComponents } from '../../components/../components/../components/../src/branding.js';
import NProgressBar from '../../components/../components/../components/../src/NProgressBar/NProgressBar.js';
import SkipLink from '@stoked-ui/docs/BrandingCssVarsProvider/SkipLink.js';
import MarkdownLinks from '@stoked-ui/docs/BrandingCssVarsProvider/MarkdownLinks.js';

declare module '@mui/material/styles' {
  interface PaletteOptions {
    primaryDark?: PaletteColorOptions;
  }
}

const { palette: lightPalette, typography, ...designTokens } = getDesignTokens('light');
const { palette: darkPalette } = getDesignTokens('dark');


const nProgressStart = debounce(() => {
  NProgress.start();
}, 200);

function nProgressDone() {
  nProgressStart.clear();
  NProgress.done();
}

export function NextNProgressBar() {
  const router = useRouter();
  React.useEffect(() => {
    const handleRouteChangeStart = (url: string, someVar: { shallow: boolean }) => {
      if (!someVar.shallow) {
        nProgressStart();
      }
    };

    const handleRouteChangeDone = (url: string, someVar: { shallow: boolean }) => {
      if (!someVar.shallow) {
        nProgressDone();
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeDone);
    router.events.on('routeChangeError', handleRouteChangeDone);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeDone);
      router.events.off('routeChangeError', handleRouteChangeDone);
    };
  }, [router]);

  return <NProgressBar />;
}

const theme = extendTheme({
  cssVarPrefix: 'muidocs',
  colorSchemes: {
    light: {
      palette: lightPalette,
    },
    dark: {
      palette: darkPalette,
    },
  },
  ...designTokens,
  typography: deepmerge(typography, {
    h1: {
      ':where([data-mui-color-scheme="dark"]) &': {
        color: 'var(--muidocs-palette-common-white)',
      },
    },
    h2: {
      ':where([data-mui-color-scheme="dark"]) &': {
        color: 'var(--muidocs-palette-grey-100)',
      },
    },
    h5: {
      ':where([data-mui-color-scheme="dark"]) &': {
        color: 'var(--muidocs-palette-primary-300)',
      },
    },
  }),
  ...getThemedComponents(),
});

function BrandingCssVarsProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <CssVarsProvider theme={theme} defaultMode="system" disableTransitionOnChange>
      <NextNProgressBar />
      <CssBaseline />
      <SkipLink />
      <MarkdownLinks />
      {children}
    </CssVarsProvider>
  );
}

export default BrandingCssVarsProvider;

