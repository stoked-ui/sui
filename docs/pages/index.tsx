import * as React from 'react';
import NoSsr from "@mui/material/NoSsr";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { PRODUCTS } from 'docs/src/products';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import dynamic from 'next/dynamic';
import AppFooter from "../src/layouts/AppFooter";
import Head from "../src/modules/components/Head";
import NewsletterToast from "../src/components/home/NewsletterToast";
import AppHeaderBanner from "../src/components/banner/AppHeaderBanner";
import AppHeader from "../src/layouts/AppHeader";

const EditorHero = dynamic(() => import('../src/components/showcase/EditorHero'), {ssr: false });


function randomHome(homePages: string[]) {
  return homePages[Math.floor(Math.random()*homePages.length)];
}

const homeUrl = randomHome(PRODUCTS.pages);
const RandomHome = dynamic(() => import((`.${homeUrl}main`)), { ssr: false });

export function HomeView({ HomeMain}: { HomeMain: React.ComponentType }){
  const Main: React.ComponentType = HomeMain || RandomHome;

  return <BrandingCssVarsProvider>
    <Head
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
    </Head>
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
  if (process.env.DEV_DISPLAY === '1') {
    return <EditorHero id={'editor'} sx={{ width: '1080px' }} />
    // return <EditorFileTestHero id={'editor'} sx={{ width: '1080px' }} />
  }
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
    if (req.headers?.host?.indexOf('stoked-ui.com')) {
      MainView = RandomHome;
    }
  }
}
