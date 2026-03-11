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
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined';
import KeyIcon from '@mui/icons-material/KeyOutlined';
import AccountPageShell from './AccountPageShell';
import { accountApiFetch, formatShortDate, getStoredAuth } from './accountClient';

interface AccountLicenseResponse {
  id: string;
  key: string;
  productId: string;
  productName: string;
  productDescription: string;
  productUrl?: string;
  status: 'pending' | 'active' | 'expired' | 'revoked';
  subscriptionStatus: string;
  expiresAt: string | null;
  activatedAt: string | null;
  renewsAt: string | null;
  timeLeftDays: number | null;
  machineName: string | null;
  supportLabel: string;
  features: Array<{ id?: string; name: string; description?: string }>;
  activations: number;
  maxActivations: number;
}

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  active: 'success',
  pending: 'warning',
  expired: 'error',
  revoked: 'error',
};

function formatTimeLeft(days: number | null): string {
  if (days === null) {
    return 'No scheduled expiration';
  }

  if (days < 0) {
    return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  }

  if (days === 0) {
    return 'Expires today';
  }

  return `${days} day${days === 1 ? '' : 's'} left`;
}

export default function LicensesPage() {
  const auth = React.useMemo(() => getStoredAuth(), []);
  const [licenses, setLicenses] = React.useState<AccountLicenseResponse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const response = await accountApiFetch<AccountLicenseResponse[]>('/api/account/licenses');
        setLicenses(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load licenses');
      } finally {
        setLoading(false);
      }
    })();
  }, [auth]);

  const activeLicenses = licenses.filter((license) => license.status === 'active' || license.status === 'pending').length;

  return (
    <AccountPageShell
      title="Licenses"
      description="Review your plans, subscription state, support coverage, and the product features attached to each active license."
    >
      {!auth && (
        <Alert severity="info">
          Please log in to view your licenses.
        </Alert>
      )}

      {auth && loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {auth && !loading && (
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">Plans</Typography>
                <Typography variant="h4">{licenses.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total licenses linked to {auth.user.email}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">Active</Typography>
                <Typography variant="h4">{activeLicenses}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Licenses currently usable or pending activation
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">Billing</Typography>
                <Button
                  variant="outlined"
                  startIcon={<ReceiptIcon />}
                  href="/consulting/billing"
                  sx={{ mt: 1 }}
                >
                  Open Billing
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {licenses.length === 0 ? (
            <Alert severity="info">
              No licenses are attached to this account yet.
            </Alert>
          ) : (
            licenses.map((license) => (
              <Paper key={license.id} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={1}
                  >
                    <div>
                      <Typography variant="h5">{license.productName}</Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        {license.productDescription || license.productId}
                      </Typography>
                    </div>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={license.status}
                        color={STATUS_COLOR[license.status] || 'default'}
                        size="small"
                      />
                      <Chip label={`Subscription: ${license.subscriptionStatus}`} variant="outlined" size="small" />
                      <Chip label={formatTimeLeft(license.timeLeftDays)} variant="outlined" size="small" />
                    </Stack>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" color="text.secondary">
                          License
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <KeyIcon fontSize="small" color="primary" />
                          <Typography sx={{ fontFamily: 'monospace' }}>{license.key}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Activated: {formatShortDate(license.activatedAt)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expires: {formatShortDate(license.expiresAt)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Renews: {formatShortDate(license.renewsAt)}
                        </Typography>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Activation
                        </Typography>
                        <Typography variant="body2">
                          Device: {license.machineName || 'Not activated on a device'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Seats in use: {license.activations} / {license.maxActivations}
                        </Typography>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Support
                        </Typography>
                        <Typography variant="body2">{license.supportLabel}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Divider />

                  <div>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Included Features
                    </Typography>
                    {license.features.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Feature details have not been published for this plan yet.
                      </Typography>
                    ) : (
                      <List disablePadding>
                        {license.features.map((feature) => (
                          <ListItem key={feature.id || feature.name} disableGutters sx={{ py: 0.5 }}>
                            <div>
                              <Typography fontWeight={600}>{feature.name}</Typography>
                              {feature.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {feature.description}
                                </Typography>
                              )}
                            </div>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </div>
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      )}
    </AccountPageShell>
  );
}
