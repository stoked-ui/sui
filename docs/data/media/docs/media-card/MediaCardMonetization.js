import * as React from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MediaCard } from '@stoked-ui/media';

const item = {
  _id: 'media-card-paid',
  title: 'Premium director commentary',
  author: 'creator-2',
  mediaType: 'video',
  file: 'https://cdn.stokd.cloud/products/flux/assets/flux-desktop-preview-854x480.mp4',
  url: 'https://cdn.stokd.cloud/products/flux/assets/flux-desktop-preview-854x480.mp4',
  duration: 231,
  price: 250,
  publicity: 'paid',
  views: 77,
};

export default function MediaCardMonetization() {
  const [modeState, setModeState] = React.useState({ mode: 'view' });
  const [status, setStatus] = React.useState('Hover the card, then click play to request access.');

  const payment = React.useMemo(
    () => ({
      requestPayment: async ({ amount, resourceId }) => {
        setStatus(`Requested ${amount} sats for ${resourceId}.`);
        return {
          paymentId: 'demo-payment',
          paymentRequest: 'demo-payment-request',
          expiresAt: new Date(Date.now() + 600000),
        };
      },
      verifyPayment: async () => true,
      onPaymentComplete: () => {},
    }),
    [],
  );

  return (
    <Stack spacing={2} sx={{ maxWidth: 360, width: '100%' }}>
      <MediaCard
        item={item}
        modeState={modeState}
        setModeState={setModeState}
        payment={payment}
        info
      />
      <Alert severity="warning" variant="outlined">
        {status}
      </Alert>
      <Typography color="text.secondary" variant="body2">
        The locked state comes from <code>publicity=&quot;paid&quot;</code> and a non-zero <code>price</code>.
      </Typography>
    </Stack>
  );
}
