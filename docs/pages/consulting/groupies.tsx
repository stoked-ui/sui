import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActiveOutlined';
import ArticleIcon from '@mui/icons-material/ArticleOutlined';
import CodeIcon from '@mui/icons-material/CodeOutlined';
import Section from 'docs/src/layouts/Section';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import { useRouter } from 'next/router';

function useAuth() {
  const [user, setUser] = React.useState<{ name: string; role: string; id: string; email: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        setUser(JSON.parse(stored).user);
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);
  return { user, loading };
}

export default function GroupiesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/consulting/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <BrandingCssVarsProvider>
        <Head title="Totally Stoked - Stoked Consulting" description="Stay in the loop" />
        <AppHeader />
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      </BrandingCssVarsProvider>
    );
  }

  return (
    <BrandingCssVarsProvider>
      <Head title="Totally Stoked - Stoked Consulting" description="Stay in the loop" />
      <AppHeader />
      <main id="main-content">
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <Box textAlign="center" mb={4}>
            <NotificationsActiveIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              You're Totally Stoked
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome, {user.name}! You're on the list for updates, releases, and announcements.
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <ArticleIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">Blog</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Read the latest posts about engineering, product updates, and behind-the-scenes.
              </Typography>
              <Button variant="outlined" size="small" onClick={() => router.push('/blog')}>
                Read the blog
              </Button>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <CodeIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">Stoked UI</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Check out the open-source component library — file explorers, timelines, editors, and more.
              </Typography>
              <Button variant="outlined" size="small" onClick={() => router.push('/stoked-ui/')}>
                Explore components
              </Button>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Want access to premium tools and products?
              </Typography>
              <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={() => router.push('/consulting/products')}>
                View products
              </Button>
            </Paper>
          </Stack>
        </Container>
      </main>
      <Section bg="gradient" cozy />
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
