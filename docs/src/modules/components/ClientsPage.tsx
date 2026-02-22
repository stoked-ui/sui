import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AddIcon from '@mui/icons-material/AddOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useRouter } from 'next/router';
import ClientCard from './ClientCard';

interface Client {
  _id: string;
  name: string;
  slug: string;
  contactEmail: string;
  active: boolean;
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

async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [deliverableCounts, setDeliverableCounts] = React.useState<Record<string, number>>({});
  const [invoiceCounts, setInvoiceCounts] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formName, setFormName] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');

  const fetchClients = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/clients');
      setClients(data);
      // Fetch deliverable and invoice counts
      const dCounts: Record<string, number> = {};
      const iCounts: Record<string, number> = {};
      await Promise.all(
        data.map(async (c: Client) => {
          try {
            const deliverables = await apiFetch(`/api/deliverables?clientId=${c._id}`);
            dCounts[c._id] = deliverables.length;
          } catch {
            dCounts[c._id] = 0;
          }
          try {
            const inv = await apiFetch(`/api/invoices/has-invoices?clientId=${c._id}`);
            iCounts[c._id] = inv.count;
          } catch {
            iCounts[c._id] = 0;
          }
        }),
      );
      setDeliverableCounts(dCounts);
      setInvoiceCounts(iCounts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSave = async () => {
    try {
      if (editingId) {
        await apiFetch(`/api/clients/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: formName, contactEmail: formEmail }),
        });
      } else {
        await apiFetch('/api/clients', {
          method: 'POST',
          body: JSON.stringify({ name: formName, contactEmail: formEmail }),
        });
      }
      setDialogOpen(false);
      setEditingId(null);
      setFormName('');
      setFormEmail('');
      fetchClients();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleEdit = (id: string) => {
    const client = clients.find((c) => c._id === id);
    if (client) {
      setEditingId(id);
      setFormName(client.name);
      setFormEmail(client.contactEmail);
      setDialogOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this client? This cannot be undone.')) return;
    try {
      await apiFetch(`/api/clients/${id}`, { method: 'DELETE' });
      fetchClients();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await apiFetch(`/api/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active }),
      });
      fetchClients();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Clients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingId(null);
            setFormName('');
            setFormEmail('');
            setDialogOpen(true);
          }}
        >
          Add Client
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {clients.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No clients yet. Click &quot;Add Client&quot; to create one.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {clients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client._id}>
              <ClientCard
                client={client}
                deliverableCount={deliverableCounts[client._id] || 0}
                invoiceCount={invoiceCounts[client._id] || 0}
                onClick={() => router.push(`/consulting/clients/${client._id}`)}
                onToggleActive={handleToggleActive}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Client' : 'Add Client'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Client Name"
            fullWidth
            margin="normal"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <TextField
            label="Contact Email"
            fullWidth
            margin="normal"
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formName || !formEmail}>
            {editingId ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
