import * as React from 'react';
import NoSsr from "@mui/material/NoSsr";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import GradientText from 'docs/src/components/typography/GradientText';
import { PRODUCTS } from 'docs/src/products';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import dynamic from 'next/dynamic';
import AppFooter from "../src/layouts/AppFooter";
import Head from "../src/modules/components/Head";
import NewsletterToast from "../src/components/home/NewsletterToast";
import AppHeaderBanner from "../src/components/banner/AppHeaderBanner";
import AppHeader from "../src/layouts/AppHeader";
import { styled } from '@mui/material/styles';

const EditorHero = dynamic(() => import('../src/components/showcase/EditorHero'), {ssr: false });


function randomHome(homePages: string[]) {
  return homePages[Math.floor(Math.random()*homePages.length)];
}

const StyledHead = styled(Head)(({ theme }) => [
  {
    '& body': {
      backgroundColor: '#fff',
    },
  },
  theme.applyDarkStyles({
    '& body': {
      backgroundColor: 'hsl(210, 14%, 7%)',
    },
  }),
]);

const homeUrl = randomHome(PRODUCTS.pages);
const RandomHome = dynamic(() => import(`.${homeUrl}main`), { ssr: false });

export function HomeView({ HomeMain}: { HomeMain: React.ComponentType }){
  const Main: React.ComponentType = HomeMain || RandomHome;

  return <BrandingCssVarsProvider>
    <StyledHead
      title="Stoked UI: React Media Components"
      description="Stoked UI provides a customizable, and accessible library of React media components."
      card="/static/social-previews/home-preview.jpg"
    >
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Stoked UI',
            url: 'https://stoked-ui.com',
            logo: 'https://stoked-ui.com/static/logo.png',
            sameAs: ['https://stokedconsulting.com'],
          }),
        }}
      />
    </StyledHead>
    <NoSsr>
      <NewsletterToast/>
    </NoSsr>
    <AppHeaderBanner/>
    <AppHeader/>
    <main id="main-content">
     <Main/>
      {PRODUCTS.previews()}
    </main>
    <AppFooter/>
  </BrandingCssVarsProvider>;
}

let MainView:  React.ComponentType<{}> = function MainView() {

  return (
    <React.Fragment>
      <EditorHero id={'editor'} sx={{ width: '1080px', mt: '12px' }} />
      <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center', mt: 6, mb: 2 }}>
        <Typography
          component="h2"
          variant="body2"
          fontWeight="bold"
          color="primary.main"
          sx={{ mb: 1 }}
        >
          Rust Video Renderer
        </Typography>
        <Typography variant="h2" sx={{ mb: 1 }}>
          <GradientText>WebAssembly-powered</GradientText> compositing engine built in Rust.
        </Typography>
        <Typography color="text.secondary">
          Hardware-accelerated rendering with zero-copy frame pipelines, real-time blend modes, and layer compositing — all running natively in the browser.
        </Typography>
      </Box>
      <Box sx={{ height: '64px' }}/>
      <Divider/>
    </React.Fragment>
  )
}
export default function Home({ HomeMain }: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={ HomeMain || MainView } />;
}
Home.getInitialProps = async(context: { req: any; query: any; res: any; asPath: any; pathname: any; }) => {

  const { req } = context;
  if (req) {
    console.info('req.headers.host', req.headers.host);
    if (['stoked-ui.com', 'stokedconsulting.com'].includes(req.headers?.host)) {
      MainView = RandomHome;
    }
  }
}
