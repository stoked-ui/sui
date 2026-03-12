import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptIcon from '@mui/icons-material/ReceiptOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import ArticleIcon from '@mui/icons-material/ArticleOutlined';
import VpnKeyIcon from '@mui/icons-material/VpnKeyOutlined';
import Section from 'docs/src/layouts/Section';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import { useRouter } from 'next/router';

function useAuth() {
  const [user, setUser] = React.useState<{ name: string; role: string; id: string } | null>(null);
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

const navItems = [
  { label: 'Clients', href: '/consulting/clients', icon: <PeopleIcon />, description: 'Manage consulting clients and their deliverables' },
  { label: 'Products', href: '/consulting/products', icon: <InventoryIcon />, description: 'Manage products, pricing, and pages' },
  { label: 'Users', href: '/consulting/users', icon: <PersonIcon />, description: 'Manage user accounts and roles' },
  { label: 'Invoices', href: '/consulting/invoices', icon: <ReceiptIcon />, description: 'View and manage invoices' },
  { label: 'Licenses', href: '/consulting/licenses', icon: <VpnKeyIcon />, description: 'Manage software licenses' },
  { label: 'Blog', href: '/blog', icon: <ArticleIcon />, description: 'Manage blog posts' },
  { label: 'API Docs', href: '/consulting/api-docs', icon: <ArticleIcon />, description: 'API documentation and testing' },
  { label: 'Settings', href: '/consulting/settings', icon: <SettingsIcon />, description: 'Application settings' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/consulting/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <BrandingCssVarsProvider>
        <Head title="Admin - Stoked Consulting" description="Admin dashboard" />
        <AppHeader />
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      </BrandingCssVarsProvider>
    );
  }

  return (
    <BrandingCssVarsProvider>
      <Head title="Admin - Stoked Consulting" description="Admin dashboard" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Welcome back, {user.name}.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {navItems.map((item) => (
              <Paper
                key={item.href}
                variant="outlined"
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}`,
                  },
                }}
                onClick={() => router.push(item.href)}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  {item.icon}
                  <Typography variant="h6" fontWeight="bold">{item.label}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </main>
      <Section bg="gradient" cozy />
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
