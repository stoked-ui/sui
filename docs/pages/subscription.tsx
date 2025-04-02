import * as React from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import Head from 'docs/src/modules/components/Head';
import { useTranslate } from '@stoked-ui/docs/i18n';
import Alert from '@mui/material/Alert';
import redirect from 'next/router';
import { Link } from '@stoked-ui/docs';
import { useSearchParams } from 'next/navigation';
import AppHeader from '../src/layouts/AppHeader';
import AppFooter from '../src/layouts/AppFooter';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Section from '../src/layouts/Section';
import { pageToTitleI18n } from '../src/modules/utils/helpers';
import type { MuiPage } from '../src/MuiPage';
import materialPages from '../data/pages';

export default function Components() {
  const t = useTranslate();
  const pages = materialPages;
  const componentPageData = pages.find(({ title }) => title === 'Components');
  function renderItem(aPage: MuiPage) {
    return (
      <ListItem key={aPage.pathname} disablePadding>
        <ListItemButton
          component={Link}
          noLinkStyle
          href={aPage.pathname}
          sx={{
            px: 1,
            py: 0.5,
            fontSize: '0.84375rem',
            fontWeight: 500,
            '&:hover, &:focus': { '& svg': { opacity: 1 } },
          }}
        >
          {pageToTitleI18n(aPage, t) || ''}
          <KeyboardArrowRightRounded
            sx={{
              ml: 'auto',
              fontSize: '1.125rem',
              opacity: 0,
              color: 'primary.main',
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  }
  const [alert, setAlert] = React.useState<React.JSX.Element | null>(null);

  const query = useSearchParams()
  const code = query.get('code');
  const token = query.get('token');
  const email = decodeURIComponent(query.get('email'));

  React.useEffect(() => {



    // 402: 'DB_NAME not available'
    // 401: 'Invalid token or Email'
    // 404: 'Email not found'
    // 201: 'Email already verified'
    // 200: 'Email verified'
    // 401: 'Invalid token'
    // 500: 'Error'

    const getCodeStatus = (statusCode: string) => {
      switch (statusCode) {
        case '402':
          return (<Alert
              severity="error"
              sx={{
                fontWeight: 'medium',
                bgcolor: 'error.50',
                border: '1px solid',
                borderColor: 'error.200',
                color: 'error.900',
                display: 'flex',
                width: '100%'
              }}
            >
              System error occurred staff has been notified.
            </Alert>);
        case '401':
          return (<Alert
              severity="error"
              sx={{
                fontWeight: 'medium',
                bgcolor: 'error.50',
                border: '1px solid',
                borderColor: 'error.200',
                color: 'error.900',
                display: 'flex',
                width: '100%'
              }}
            >
              Invalid token or Email
            </Alert>);
        case '404':
          return (<Alert
              severity="error"
              sx={{
                fontWeight: 'medium',
                bgcolor: 'error.50',
                border: '1px solid',
                borderColor: 'error.200',
                color: 'error.900',
                display: 'flex',
                width: '100%'
              }}
            >
              Email not found: {email}
            </Alert>);
        case '201':
          return (<Alert
              severity="success"
              sx={{
                fontWeight: 'medium',
                bgcolor: 'success.50',
                border: '1px solid',
                borderColor: 'success.200',
                color: 'success.900',
                display: 'flex',
                width: '100%'
              }}
            >
              Email already verified: {email}
            </Alert>);
        case '200':
          return (<Alert
              severity="success"
              sx={{
                fontWeight: 'medium',
                bgcolor: 'success.50',
                border: '1px solid',
                borderColor: 'success.200',
                color: 'success.900',
                display: 'flex',
                width: '100%'
              }}
            >
              Email verified: {email}
            </Alert>);
        case '500':
        default:
          return (<Alert
              severity="error"
              sx={{
                fontWeight: 'medium',
                bgcolor: 'error.50',
                border: '1px solid',
                borderColor: 'error.200',
                color: 'error.900',
                display: 'flex',
                width: '100%'
              }}
            >
            System error occurred staff has been notified.
          </Alert>);
      }
    }
    if (!code) {
      redirect('/404');
      return;
    }
    setAlert(getCodeStatus(code));
  }, [])


  return (
    <BrandingCssVarsProvider>
      <Head
        title="Subscription - SUI"
        description="Email Verification."
      />
      <AppHeader />
      <main id="main-content">
        <Section bg="gradient" sx={{ py: { xs: 2, sm: 4 } }}>
          <Typography component="h1" variant="h2" sx={{ mb: 4, pl: 1 }}>
            Subscription
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            }}
          >
            {alert}
          </Box>
        </Section>
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}

