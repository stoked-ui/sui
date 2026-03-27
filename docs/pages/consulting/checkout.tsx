import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { BrandingCssVarsProvider } from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import GradientText from 'docs/src/components/typography/GradientText';
import Section from 'docs/src/layouts/Section';

// Load checkout client-side only (requires Stripe JS)
const StripeEmbeddedCheckout = dynamic(
  () => import('docs/src/modules/license/StripeEmbeddedCheckout'),
  { ssr: false },
);

// Load success page client-side only
const CheckoutSuccess = dynamic(
  () => import('docs/src/modules/license/CheckoutSuccess'),
  { ssr: false },
);

export default function CheckoutPage() {
  const router = useRouter();
  const { product: productId, email, session_id: sessionId } = router.query;

  const isSuccess = Boolean(sessionId);

  const returnUrl = React.useMemo(() => {
    if (typeof window === 'undefined') return '';
    const base = `${window.location.origin}/consulting/checkout`;
    return `${base}?product=${productId ?? ''}&session_id={CHECKOUT_SESSION_ID}`;
  }, [productId]);

  if (isSuccess) {
    return (
      <BrandingCssVarsProvider>
        <Head
          title="Checkout Complete — Stoked Consulting"
          description="Your subscription is now active."
        />
        <AppHeader />
        <main id="main-content">
          <Container maxWidth="md" sx={{ py: 4 }}>
            <CheckoutSuccess />
          </Container>
        </main>
        <Section bg="gradient" cozy />
        <Divider />
        <AppFooter />
      </BrandingCssVarsProvider>
    );
  }

  if (!productId || !email) {
    return (
      <BrandingCssVarsProvider>
        <Head
          title="Checkout — Stoked Consulting"
          description="Complete your subscription"
        />
        <AppHeader />
        <main id="main-content">
          <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Missing checkout parameters
            </Typography>
            <Typography color="text.secondary">
              Please navigate here from a product page.
            </Typography>
          </Container>
        </main>
        <Section bg="gradient" cozy />
        <Divider />
        <AppFooter />
      </BrandingCssVarsProvider>
    );
  }

  return (
    <BrandingCssVarsProvider>
      <Head
        title="Complete Your Subscription — Stoked Consulting"
        description="Complete your subscription to get started."
      />
      <AppHeader />
      <main id="main-content">
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom>
              <GradientText>Complete Your Subscription</GradientText>
            </Typography>
            <Typography color="text.secondary">
              Secure checkout powered by Stripe
            </Typography>
          </Box>

          <StripeEmbeddedCheckout
            productId={String(productId)}
            email={String(email)}
            returnUrl={returnUrl}
          />
        </Container>
      </main>
      <Section bg="gradient" cozy />
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
