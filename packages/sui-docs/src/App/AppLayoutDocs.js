import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { exactProp } from '@mui/utils';
import GlobalStyles from '@mui/material/GlobalStyles';
import AppFrame from './AppFrame';
import AppContainer from './AppContainer';
import AppTableOfContents from './AppTableOfContents';
import AppLayoutDocsFooter from './AppLayoutDocsFooter';
import BackToTop from '../components/BackToTop';

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
})(({  disableToc, theme }) => {
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
  const {
    BannerComponent,
    children,
    description,
    disableAd = false,
    // TODO, disableLayout should be the default, retaining the layout between pages
    // improves the UX. It's faster to transition, and you don't lose UI states, like scroll.
    disableLayout = false,
    disableToc = false,
    hasTabs = false,
    location,
    toc,
  } = props;

  if (description === undefined) {
    throw new Error('Missing description in the page');
  }

  const Layout = disableLayout ? React.Fragment : AppFrame;
  const layoutProps = disableLayout ? {} : { BannerComponent };

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
