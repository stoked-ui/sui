import * as React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

// Site palette values (from brandingTheme)
const SITE_PRIMARY = 'hsl(210, 100%, 45%)';   // blue.main
const SITE_BG = 'hsl(210, 14%, 7%)';           // blueDark.900
const SITE_SURFACE = 'hsl(210, 14%, 9%)';      // blueDark.800
const SITE_BORDER = 'hsl(210, 14%, 22%)';      // blueDark.600
const SITE_TEXT = 'hsl(215, 15%, 92%)';        // grey.100
const SITE_TEXT_SECONDARY = 'hsl(215, 15%, 65%)'; // grey.500
const SITE_ERROR = 'hsl(355, 98%, 66%)';       // error.main
const SITE_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

let stripePromise: ReturnType<typeof loadStripe> | null = null;

function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

export interface StripeEmbeddedCheckoutProps {
  productId: string;
  email: string;
  /** URL Stripe will redirect to on completion (appends ?session_id={id}) */
  returnUrl: string;
}

export default function StripeEmbeddedCheckout({
  productId,
  email,
  returnUrl,
}: StripeEmbeddedCheckoutProps) {
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch('/api/licenses/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        email,
        returnUrl,
        uiMode: 'embedded',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) {return;}
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.message ?? 'Failed to initialize checkout');
        }
      })
      .catch(() => {
        if (!cancelled) {setError('Network error — please try again');}
      })
      .finally(() => {
        if (!cancelled) {setLoading(false);}
      });

    return () => { cancelled = true; };
  }, [productId, email, returnUrl]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }

  if (!clientSecret) {return null;}

  const stripe = getStripe();

  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: SITE_PRIMARY,
        colorBackground: SITE_BG,
        colorSurface: SITE_SURFACE,
        colorText: SITE_TEXT,
        colorTextSecondary: SITE_TEXT_SECONDARY,
        colorDanger: SITE_ERROR,
        colorIconTab: SITE_TEXT,
        colorIconTabSelected: SITE_PRIMARY,
        colorLogo: 'light',
        fontFamily: SITE_FONT,
        borderRadius: '8px',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': {
          backgroundColor: SITE_SURFACE,
          border: `1px solid ${SITE_BORDER}`,
          color: SITE_TEXT,
        },
        '.Input:focus': {
          border: `1px solid ${SITE_PRIMARY}`,
          boxShadow: `0 0 0 3px hsl(210 100% 45% / 0.25)`,
        },
        '.Label': {
          color: SITE_TEXT_SECONDARY,
          fontWeight: '500',
        },
        '.Tab': {
          backgroundColor: SITE_SURFACE,
          border: `1px solid ${SITE_BORDER}`,
        },
        '.Tab:hover': {
          backgroundColor: 'hsl(210, 14%, 13%)',
        },
        '.Tab--selected': {
          border: `1px solid ${SITE_PRIMARY}`,
        },
        '.Block': {
          backgroundColor: SITE_SURFACE,
          border: `1px solid ${SITE_BORDER}`,
        },
        '.PickerItem': {
          backgroundColor: SITE_SURFACE,
          border: `1px solid ${SITE_BORDER}`,
        },
        '.PickerItem--selected': {
          border: `1px solid ${SITE_PRIMARY}`,
          backgroundColor: 'hsl(210, 14%, 13%)',
        },
      },
    },
  };

  return (
    <Box
      sx={{
        '& #stripe-embedded-checkout': {
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      <EmbeddedCheckoutProvider stripe={stripe} options={options}>
        <EmbeddedCheckout id="stripe-embedded-checkout" />
      </EmbeddedCheckoutProvider>
    </Box>
  );
}
