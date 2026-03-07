import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import { useRouter } from 'next/router';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

interface InvoiceLineItem {
  hours: number;
  description: string;
}

interface InvoiceWeek {
  weekStart: string;
  weekEnd: string;
  lineItems: InvoiceLineItem[];
  weekTotalHours: number;
}

interface Invoice {
  _id: string;
  clientId: string;
  invoiceDate: string;
  periodStart: string;
  periodEnd: string;
  weeks: InvoiceWeek[];
  totalHours: number;
  status: 'draft' | 'sent' | 'paid';
  notes?: string;
}

interface Client {
  _id: string;
  name: string;
  contactEmail: string;
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
    month: 'long',
    day: 'numeric',
  });
}

function formatWeekRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const startStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

const statusColors: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
  draft: 'default',
  sent: 'info',
  paid: 'success',
};

export default function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [client, setClient] = React.useState<Client | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!invoiceId) return;
    (async () => {
      try {
        setLoading(true);
        const inv = await apiFetch(`/api/invoices/${invoiceId}`);
        // Fetch client name separately — don't block invoice display on it
        let cli: Client | null = null;
        try {
          cli = await apiFetch(`/api/clients/${inv.clientId}`);
        } catch {
          // Client name is optional for display
        }
        setInvoice(inv);
        setClient(cli);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    })();
  }, [invoiceId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !invoice) {
    return <Alert severity="error">{error || 'Invoice not found'}</Alert>;
  }

  const clientId = typeof invoice.clientId === 'string' ? invoice.clientId : String(invoice.clientId);

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(`/consulting/invoices?clientId=${clientId}`)}
        sx={{ mb: 2 }}
      >
        Back to Invoices
      </Button>

      {/* Dark header box */}
      <Paper
        sx={(theme) => ({
          p: 3,
          mb: 3,
          bgcolor: 'grey.900',
          color: 'common.white',
          ...theme.applyDarkStyles({
            bgcolor: 'primaryDark.800',
          }),
        })}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Invoice
            </Typography>
            {client && (
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {client.name}
              </Typography>
            )}
          </Box>
          <Chip
            label={invoice.status.toUpperCase()}
            color={statusColors[invoice.status]}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        <Box display="flex" gap={4} flexWrap="wrap">
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>Invoice Date</Typography>
            <Typography>{formatDate(invoice.invoiceDate)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>Period</Typography>
            <Typography>
              {formatDate(invoice.periodStart)} &ndash; {formatDate(invoice.periodEnd)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Weekly sections */}
      {invoice.weeks.map((week, idx) => (
        <Paper key={idx} variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
          {/* Teal date header */}
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {formatWeekRange(week.weekStart, week.weekEnd)}
            </Typography>
          </Box>
          {/* Line items */}
          <Box sx={{ px: 2.5, py: 2 }}>
            <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { mb: 1 } }}>
              {week.lineItems.map((item, liIdx) => (
                <li key={liIdx}>
                  <Typography variant="body2">
                    <strong>{item.hours}h</strong> &mdash; {item.description}
                  </Typography>
                </li>
              ))}
            </Box>
            <Box
              sx={{
                mt: 2,
                pt: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Typography variant="body2" color="primary" fontWeight="bold">
                Week Total: {week.weekTotalHours} hours
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}

      {/* Total hours */}
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          mb: 3,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" color="primary" fontWeight="bold">
          Total: {invoice.totalHours} hours
        </Typography>
      </Paper>

      {/* Notes / footer */}
      {invoice.notes && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            {invoice.notes}
          </Typography>
        </Paper>
      )}

      <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
        Thank you for your business. Please reach out with any questions about this invoice.
      </Typography>
    </Box>
  );
}
