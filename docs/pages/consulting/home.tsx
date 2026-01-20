import * as React from 'react';
import NoSsr from "@mui/material/NoSsr";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { PRODUCTS } from 'docs/src/products';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import dynamic from 'next/dynamic';
import AppFooter from "docs/src/layouts/AppFooter";
import Head from "docs/src/modules/components/Head";
import NewsletterToast from "docs/src/components/home/NewsletterToast";
import AppHeaderBanner from "docs/src/components/banner/AppHeaderBanner";
import AppHeader from "docs/src/layouts/AppHeader";
import { styled } from '@mui/material/styles';

const EditorHero = dynamic(() => import('docs/src/components/showcase/EditorHero'), {ssr: false });


function randomHome(homePages: string[]) {
  return homePages[Math.floor(Math.random()*homePages.length)];
}

const StyledHead = styled(Head)(({ theme }) => ({
  '& body': {
    backgroundColor: theme.palette.mode === 'dark' ? 'hsl(210, 14%, 7%)' : '#fff',
    color: theme.palette.text.primary,
  }
}));

const homeUrl = randomHome(PRODUCTS.pages);
const RandomHome = dynamic(() => import((`.${homeUrl}main`)), { ssr: false });

export function HomeView({ HomeMain}: { HomeMain: React.ComponentType }){
  const Main: React.ComponentType = HomeMain || RandomHome;

  return <BrandingCssVarsProvider>
    <StyledHead
      title="Stoked Consulting: Full Stack Software Engineering"
      description="Expert software engineering consulting for greenfield solutions, legacy modernization, and cloud infrastructure. Building production-ready applications since 2010."
      card="/static/social-previews/consulting-preview.jpg"
    >
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://Keep up to date',
            '@type': 'Organization',
            name: 'Stoked Consulting',
            url: 'https://stokedconsulting.com',
            logo: 'https://stokedconsulting.com/static/logo.png',
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
    
    </main>
    <AppFooter/>
  </BrandingCssVarsProvider>;
}

let MainView:  React.ComponentType<{}> = function MainView() {

  return (
    <React.Fragment>
      <EditorHero id={'editor'} sx={{ width: '1080px' }} />
      <Box sx={{ height: '112px' }}/>
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
