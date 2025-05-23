import * as React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import { exactProp } from '@mui/utils';
import GlobalStyles from '@mui/material/GlobalStyles';
import { pathnameToLanguage } from 'docs/src/modules/utils/helpers';
import Head from 'docs/src/modules/components/Head';
import AppFrame from 'docs/src/modules/components/AppFrame';
import AppContainer from 'docs/src/modules/components/AppContainer';
import AppTableOfContents from 'docs/src/modules/components/AppTableOfContents';
import AdManager from 'docs/src/modules/components/AdManager';
import AppLayoutDocsFooter from 'docs/src/modules/components/AppLayoutDocsFooter';
import BackToTop from 'docs/src/modules/components/BackToTop';
import {
  AD_MARGIN_TOP,
  AD_HEIGHT,
  AD_HEIGHT_MOBILE,
  AD_MARGIN_BOTTOM,
} from 'docs/src/modules/components/Ad';

const TOC_WIDTH = 242;

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'disableToc',
})(({ disableToc, theme }) => ({
  minHeight: '100vh',
  display: 'grid',
  width: '100%',
  ...(disableToc
    ? {
        [theme.breakpoints.up('md')]: {
          marginRight: TOC_WIDTH / 2,
        },
      }
    : {
        [theme.breakpoints.up('md')]: {
          gridTemplateColumns: `1fr ${TOC_WIDTH}px`,
        },
      }),
  '& .markdown-body .comment-link': {
    display: 'flex',
  },
}));

const StyledAppContainer = styled(AppContainer, {
  shouldForwardProp: (prop) => prop !== 'disableAd' && prop !== 'hasTabs' && prop !== 'disableToc',
})(({ disableAd, hasTabs, disableToc, theme }) => {
  return {
    position: 'relative',
    // By default, a grid item cannot be smaller than the size of its content.
    // https://stackoverflow.com/questions/43311943/prevent-content-from-expanding-grid-items
    minWidth: 0,
    ...(disableToc
    ? {
        // 105ch ≈ 930px
        maxWidth: `calc(105ch + ${TOC_WIDTH / 2}px)`,
      }
    : {
        // We're mostly hosting text content so max-width by px does not make sense considering font-size is system-adjustable.
        fontFamily: 'Arial',
        // 105ch ≈ 930px
        maxWidth: '105ch',
    }),
    [theme.breakpoints.up('lg')]: {
      paddingLeft: '60px',
      paddingRight: '60px',
    },
  };
});

export default function AppLayoutDocs(props) {
  const router = useRouter();
  const {
    BannerComponent,
    cardOptions,
    children,
    description,
    disableAd = false,
    // TODO, disableLayout should be the default, retaining the layout between pages
    // improves the UX. It's faster to transition, and you don't lose UI states, like scroll.
    disableLayout = false,
    disableToc = false,
    hasTabs = false,
    location,
    title,
    toc,
  } = props;

  if (description === undefined) {
    throw new Error('Missing description in the page');
  }

  const { canonicalAs } = pathnameToLanguage(router.asPath);
  let productName = 'Stoked UI';
  if (canonicalAs.startsWith('/material-ui/')) {
    productName = 'Material UI';
  } else if (canonicalAs.startsWith('/base-ui/')) {
    productName = 'Base UI';
  } else if (canonicalAs.startsWith('/x/')) {
    productName = 'SUI X';
  } else if (canonicalAs.startsWith('/system/')) {
    productName = 'SUI System';
  } else if (canonicalAs.startsWith('/toolpad/')) {
    productName = 'SUI Toolpad';
  } else if (canonicalAs.startsWith('/joy-ui/')) {
    productName = 'Joy UI';
  }

  const Layout = disableLayout ? React.Fragment : AppFrame;
  const layoutProps = disableLayout ? {} : { BannerComponent };

  const card = `/edge-functions/og-image?product=${productName}&title=${cardOptions?.title ?? title}&description=${cardOptions?.description ?? description}`;
  return (
    <Layout {...layoutProps}>
      <GlobalStyles
        styles={{
          ':root': {
            '--MuiDocs-navDrawer-width': '300px',
          },
        }}
      />
        <Main disableToc={disableToc}>
          {/*
            Render the TOCs first to avoid layout shift when the HTML is streamed.
            See https://jakearchibald.com/2014/dont-use-flexbox-for-page-layout/ for more details.
          */}
          <StyledAppContainer disableAd={disableAd} hasTabs={hasTabs} disableToc={disableToc}>
            {children}
            <AppLayoutDocsFooter tableOfContents={toc} location={location} />
          </StyledAppContainer>
          {disableToc ? null : <AppTableOfContents toc={toc} />}
        </Main>
      <BackToTop />
    </Layout>
  );
}

AppLayoutDocs.propTypes = {
  BannerComponent: PropTypes.elementType,
  cardOptions: PropTypes.shape({
    description: PropTypes.string,
    title: PropTypes.string,
  }),
  children: PropTypes.node.isRequired,
  description: PropTypes.string.isRequired,
  disableAd: PropTypes.bool.isRequired,
  disableLayout: PropTypes.bool,
  disableToc: PropTypes.bool.isRequired,
  hasTabs: PropTypes.bool,
  location: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  toc: PropTypes.array.isRequired,
};

if (process.env.NODE_ENV !== 'production') {
  AppLayoutDocs.propTypes = exactProp(AppLayoutDocs.propTypes);
}
