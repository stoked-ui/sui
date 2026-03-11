import * as React from 'react';
import Head from 'docs/src/modules/components/Head';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

// Use dynamic import for Swagger to ensure it only loads on the client
// and doesn't interfere with React's initial hydration.
export default function ApiDocsPage() {
  const [loading, setLoading] = React.useState(true);
  const [authorized, setAuthorized] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (!stored) {
      router.push('/consulting/login');
      return;
    }

    try {
      const { user, access_token } = JSON.parse(stored);
      if (user.role !== 'admin') {
        router.push('/consulting/login');
        return;
      }
      setAuthorized(true);
      setAccessToken(access_token);
    } catch (e) {
      router.push('/consulting/login');
    }
  }, [router]);

  React.useEffect(() => {
    if (!authorized || !accessToken) return;

    // We use a manual script injection but wait for the component to be mounted
    // and the DOM element to be available.
    const initSwagger = () => {
      const apiUrl = getApiUrl('/api/openapi').replace(/\/$/, '');
      const specUrl = `${apiUrl}?token=${accessToken}`;

      // @ts-ignore
      if (window.SwaggerUIBundle) {
        // @ts-ignore
        window.ui = window.SwaggerUIBundle({
          url: specUrl,
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            // @ts-ignore
            window.SwaggerUIBundle.presets.apis,
            // @ts-ignore
            window.SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "BaseLayout",
          requestInterceptor: (req: any) => {
            req.headers.Authorization = `Bearer ${accessToken}`;
            return req;
          }
        });
        setLoading(false);
      }
    };

    if (!document.getElementById('swagger-ui-css')) {
      const link = document.createElement('link');
      link.id = 'swagger-ui-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('swagger-ui-js')) {
      const script = document.createElement('script');
      script.id = 'swagger-ui-js';
      script.src = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js';
      script.async = true;
      script.onload = initSwagger;
      document.body.appendChild(script);
    } else {
      // If scripts are already there, just try to init
      initSwagger();
    }
  }, [authorized, accessToken]);

  if (!authorized) {
    return null;
  }

  return (
    <BrandingCssVarsProvider>
      <Head title="API Reference - Stoked Consulting" description="API Documentation for Stoked Consulting" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            API Reference
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Explore and test the Stoked Consulting API endpoints. Authentication is handled automatically.
          </Typography>
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}
          
          {/* Always render the container, but hidden while loading */}
          <Box 
            id="swagger-ui" 
            sx={{ 
              display: loading ? 'none' : 'block',
              bgcolor: '#fff', 
              borderRadius: 1, 
              overflow: 'hidden',
              '& .swagger-ui': {
                fontFamily: 'inherit',
              },
              '& .scheme-container': {
                display: 'none'
              }
            }} 
          />
        </Container>
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
