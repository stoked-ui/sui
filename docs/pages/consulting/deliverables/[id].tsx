import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { GetStaticPaths, GetStaticProps } from 'next';

const DeliverableViewerPage = dynamic(() => import('docs/src/modules/components/DeliverableViewerPage'), { ssr: false });

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

function useAuth() {
  const [user, setUser] = React.useState<{ name: string; role: 'admin' | 'client'; id: string; clientId?: string } | null>(null);
  React.useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
      } catch { /* ignore */ }
    }
  }, []);
  return user;
}

export default function DeliverableViewerRoute() {
  const router = useRouter();
  const { id } = router.query;
  const user = useAuth();

  return (
    <BrandingCssVarsProvider>
      <Head title="Deliverable Viewer - Stoked Consulting" description="View client deliverables" />
      <AppHeader />
      <main id="main-content">
        <Box sx={{ width: '100%' }}>
          {user && typeof id === 'string' ? (
            <DeliverableViewerPage deliverableId={id} />
          ) : (
            <Container sx={{ py: 8, textAlign: 'center' }}>
              Please log in to view this deliverable.
            </Container>
          )}
        </Box>
      </main>
      {/* Footer only if not loading an HTML deliverable or showing a login message */}
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
