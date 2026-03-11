import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import OpenInNewIcon from '@mui/icons-material/OpenInNewOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import AccountPageShell from './AccountPageShell';
import {
  accountApiFetch,
  formatCurrency,
  formatShortDate,
  getStoredAuth,
} from './accountClient';

interface BillingInvoice {
  id: string;
  number: string | null;
  status: string;
  description: string;
  amountDue: number;
  amountPaid: number;
  amountRemaining: number;
  currency: string;
  dueDate: string | null;
  createdAt: string | null;
  paidAt: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface BillingSummary {
  customerId: string | null;
  billingEmail: string | null;
  hasBillingPortal: boolean;
  activeSubscriptions: number;
  amountDue: number;
  invoicesDue: BillingInvoice[];
  paymentHistory: BillingInvoice[];
  paymentMethods: PaymentMethod[];
}

function formatCardLabel(paymentMethod: PaymentMethod): string {
  return `${paymentMethod.brand.toUpperCase()} ending in ${paymentMethod.last4}`;
}

export default function BillingPage() {
  const auth = React.useMemo(() => getStoredAuth(), []);
  const [billing, setBilling] = React.useState<BillingSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [launchingPortal, setLaunchingPortal] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const response = await accountApiFetch<BillingSummary>('/api/account/billing');
        setBilling(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load billing');
      } finally {
        setLoading(false);
      }
    })();
  }, [auth]);

  const handleOpenPortal = async () => {
    try {
      setLaunchingPortal(true);
      setError('');
      const response = await accountApiFetch<{ url: string }>('/api/account/billing/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      window.location.assign(response.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
      setLaunchingPortal(false);
    }
  };

  return (
    <AccountPageShell
      title="Billing"
      description="See payments due, review previous charges, and open the Stripe billing portal to update your active card or subscription details."
    >
      {!auth && (
        <Alert severity="info">
          Please log in to view billing details.
        </Alert>
      )}

      {auth && loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {auth && !loading && billing && (
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">Payments Due</Typography>
                <Typography variant="h4">
                  {billing.invoicesDue[0]
                    ? formatCurrency(billing.amountDue, billing.invoicesDue[0].currency)
                    : '$0.00'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Outstanding across {billing.invoicesDue.length} invoice{billing.invoicesDue.length === 1 ? '' : 's'}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">Subscriptions</Typography>
                <Typography variant="h4">{billing.activeSubscriptions}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Active or collectible subscriptions on this account
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">Payment Method</Typography>
                <Button
                  variant="contained"
                  startIcon={<CreditCardIcon />}
                  endIcon={<OpenInNewIcon />}
                  onClick={handleOpenPortal}
                  disabled={!billing.hasBillingPortal || launchingPortal}
                  sx={{ mt: 1 }}
                >
                  {launchingPortal ? 'Opening...' : 'Manage Cards'}
                </Button>
                {!billing.hasBillingPortal && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Billing portal access is not available for this account yet.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Stack spacing={2}>
                  <div>
                    <Typography variant="h6">Saved Payment Methods</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      {billing.billingEmail || auth.user.email}
                    </Typography>
                  </div>
                  {billing.paymentMethods.length === 0 ? (
                    <Alert severity="info">No saved card is available on this account.</Alert>
                  ) : (
                    <List disablePadding>
                      {billing.paymentMethods.map((paymentMethod, index) => (
                        <React.Fragment key={paymentMethod.id}>
                          {index > 0 && <Divider />}
                          <ListItem disableGutters sx={{ py: 1.5 }}>
                            <ListItemText
                              primary={formatCardLabel(paymentMethod)}
                              secondary={`Expires ${paymentMethod.expMonth}/${paymentMethod.expYear}`}
                            />
                            {paymentMethod.isDefault && (
                              <Chip label="Default" color="primary" size="small" />
                            )}
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Stack spacing={2}>
                  <div>
                    <Typography variant="h6">Payments Due</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      Open invoices waiting for payment.
                    </Typography>
                  </div>
                  {billing.invoicesDue.length === 0 ? (
                    <Alert severity="success">No open payments are due right now.</Alert>
                  ) : (
                    <List disablePadding>
                      {billing.invoicesDue.map((invoice, index) => (
                        <React.Fragment key={invoice.id}>
                          {index > 0 && <Divider />}
                          <ListItem
                            disableGutters
                            secondaryAction={invoice.hostedInvoiceUrl ? (
                              <Button href={invoice.hostedInvoiceUrl} target="_blank" endIcon={<OpenInNewIcon />}>
                                View
                              </Button>
                            ) : undefined}
                            sx={{ py: 1.5 }}
                          >
                            <ListItemText
                              primary={invoice.number || invoice.description}
                              secondary={`Due ${formatShortDate(invoice.dueDate)} • ${formatCurrency(invoice.amountRemaining, invoice.currency)}`}
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <div>
                <Typography variant="h6">Previous Payments</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Recent invoices that have already been paid.
                </Typography>
              </div>

              {billing.paymentHistory.length === 0 ? (
                <Alert severity="info">No completed payments have been recorded yet.</Alert>
              ) : (
                <List disablePadding>
                  {billing.paymentHistory.slice(0, 12).map((invoice, index) => (
                    <React.Fragment key={invoice.id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        disableGutters
                        secondaryAction={invoice.invoicePdf ? (
                          <Button href={invoice.invoicePdf} target="_blank" endIcon={<OpenInNewIcon />}>
                            PDF
                          </Button>
                        ) : undefined}
                        sx={{ py: 1.5 }}
                      >
                        <ListItemText
                          primary={invoice.number || invoice.description}
                          secondary={`Paid ${formatShortDate(invoice.paidAt || invoice.createdAt)} • ${formatCurrency(invoice.amountPaid, invoice.currency)}`}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Stack>
          </Paper>
        </Stack>
      )}
    </AccountPageShell>
  );
}
