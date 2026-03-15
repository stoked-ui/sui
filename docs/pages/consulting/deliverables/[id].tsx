import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import DeliverableViewerPage from 'docs/src/modules/components/DeliverableViewerPage';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';
import { useRouter } from 'next/router';

interface ViewerUser {
  id: string;
  name: string;
  role: string;
  clientId?: string;
}

interface SessionResponse {
  authenticated: boolean;
  user: ViewerUser;
}

function readStoredUser(): ViewerUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem('auth');
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as { user?: ViewerUser };
    return parsed.user || null;
  } catch {
    return null;
  }
}

function useAuth() {
  const router = useRouter();
  const [user, setUser] = React.useState<ViewerUser | null>(null);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (!router.isReady) {
      return undefined;
    }

    const storedUser = readStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setChecked(true);
      return undefined;
    }

    let active = true;

    (async () => {
      try {
        const response = await fetch(getApiUrl('/api/auth/session'), {
          credentials: 'include',
        });

        if (!active) {
          return;
        }

        if (response.ok) {
          const session = (await response.json()) as SessionResponse;
          if (session.authenticated) {
            setUser(session.user);
            setChecked(true);
            return;
          }
        }
      } catch {
        // Fall through to the login redirect when the session check fails.
      }

      if (!active) {
        return;
      }

      router.replace({
        pathname: '/consulting/login',
        query: { redirect: router.asPath },
      }).catch(() => {});
    })();

    return () => {
      active = false;
    };
  }, [router]);

  return { user, checked };
}

export default function DeliverableViewerRoute() {
  const router = useRouter();
  const { id } = router.query;
  const { user, checked } = useAuth();
  let content: React.ReactNode;

  if (!checked) {
    content = (
      <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
        <CircularProgress />
      </Box>
    );
  } else if (user && typeof id === 'string') {
    content = <DeliverableViewerPage deliverableId={id} />;
  } else {
    content = null;
  }

  return (
    <BrandingCssVarsProvider>
      <Head title="Deliverable Viewer - Stoked Consulting" description="View client deliverables" />
      <main id="main-content">
        <Box sx={{
          width: '100%',
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {content}
        </Box>
      </main>
    </BrandingCssVarsProvider>
  );
}
