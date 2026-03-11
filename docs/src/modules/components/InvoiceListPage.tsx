import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptOutlined';
import { useRouter } from 'next/router';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

interface Invoice {
  _id: string;
  clientId: string;
  invoiceDate: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  status: 'draft' | 'sent' | 'paid';
  weeks: Array<{ weekTotalHours: number }>;
}

interface Client {
  _id: string;
  name: string;
  slug?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('auth');
  if (!stored) return null;
  try {
    return JSON.parse(stored).access_token;
  } catch {
    return null;
  }
}

async function apiFetch(url: string) {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(getApiUrl(url), { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPeriod(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

const statusColors: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
  draft: 'default',
  sent: 'info',
  paid: 'success',
};

export default function InvoiceListPage({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [client, setClient] = React.useState<Client | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const isAdmin = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('auth');
    if (!stored) return false;
    try {
      return JSON.parse(stored).user?.role === 'admin';
    } catch {
      return false;
    }
  }, []);

  React.useEffect(() => {
    if (!clientId) return;
    (async () => {
      try {
        setLoading(true);
        const [invoicesData, clientData] = await Promise.all([
          apiFetch(`/api/invoices?clientId=${clientId}`),
          apiFetch(`/api/clients/${clientId}`),
        ]);
        setInvoices(invoicesData);
        setClient(clientData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    })();
  }, [clientId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {isAdmin && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/consulting/clients/${client?.slug || clientId}`)}
          sx={{ mb: 2 }}
        >
          Back to Client
        </Button>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <ReceiptIcon color="primary" />
        <Typography variant="h4">
          Invoices{client ? ` – ${client.name}` : ''}
        </Typography>
      </Stack>

      {invoices.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No invoices found.
        </Typography>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {invoices.map((inv, i) => (
              <React.Fragment key={inv._id}>
                {i > 0 && <Divider />}
                <ListItem
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => router.push(`/consulting/invoices/${inv._id}`)}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold">
                          {formatDate(inv.invoiceDate)}
                        </Typography>
                        <Chip
                          label={inv.status}
                          color={statusColors[inv.status]}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                        <Typography variant="body2" component="span" color="text.secondary">
                          Period: {formatPeriod(inv.periodStart, inv.periodEnd)}
                        </Typography>
                        <Typography variant="body2" component="span" color="primary" fontWeight="bold" sx={{ ml: 2 }}>
                          {inv.totalHours} hours
                        </Typography>
                        <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 2 }}>
                          ({inv.weeks.length} week{inv.weeks.length !== 1 ? 's' : ''})
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
