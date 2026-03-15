import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import AddIcon from '@mui/icons-material/AddOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useRouter } from 'next/router';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';
import ClientCard from './ClientCard';

type ContactMode = 'existing' | 'new' | 'legacy';

interface ContactUserSummary {
  _id: string;
  name: string;
  email: string;
  active: boolean;
  role: string;
  clientId?: string;
}

interface Client {
  _id: string;
  name: string;
  slug: string;
  contactEmail: string;
  contactUserId?: string;
  contactUser?: ContactUserSummary;
  active: boolean;
}

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'agent';
  active: boolean;
  clientId?: string;
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
  const res = await fetch(getApiUrl(url), { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [deliverableCounts, setDeliverableCounts] = React.useState<Record<string, number>>({});
  const [invoiceCounts, setInvoiceCounts] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formName, setFormName] = React.useState('');
  const [contactMode, setContactMode] = React.useState<ContactMode>('new');
  const [legacyContactEmail, setLegacyContactEmail] = React.useState('');
  const [formExistingUserId, setFormExistingUserId] = React.useState('');
  const [formNewContactName, setFormNewContactName] = React.useState('');
  const [formNewContactEmail, setFormNewContactEmail] = React.useState('');

  const fetchClients = React.useCallback(async () => {
    try {
      setLoading(true);
      const [data, usersData] = await Promise.all([
        apiFetch('/api/clients'),
        apiFetch('/api/users'),
      ]);
      setClients(data);
      setUsers(usersData);
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

  const assignableUsers = React.useMemo(() => users.filter((user) => {
    if (user.role !== 'client') {
      return false;
    }

    if (!editingId) {
      return !user.clientId;
    }

    return !user.clientId || user.clientId === editingId;
  }), [users, editingId]);

  const resetDialogState = React.useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
    setFormName('');
    setContactMode('new');
    setLegacyContactEmail('');
    setFormExistingUserId('');
    setFormNewContactName('');
    setFormNewContactEmail('');
  }, []);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSave = async () => {
    try {
      const payload: Record<string, unknown> = { name: formName };
      if (contactMode === 'existing') {
        payload.contactUserId = formExistingUserId;
      } else if (contactMode === 'new') {
        payload.contactUser = {
          name: formNewContactName,
          email: formNewContactEmail,
        };
      }

      if (editingId) {
        await apiFetch(`/api/clients/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/clients', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      resetDialogState();
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
      setLegacyContactEmail(client.contactEmail);
      setFormExistingUserId(client.contactUserId || '');
      setFormNewContactName(client.contactUser?.name || '');
      setFormNewContactEmail(client.contactUser?.email || client.contactEmail || '');
      setContactMode(client.contactUserId ? 'existing' : client.contactEmail ? 'legacy' : 'new');
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

  const isSaveDisabled = !formName
    || (contactMode === 'existing' && !formExistingUserId)
    || (contactMode === 'new' && (!formNewContactName || !formNewContactEmail))
    || (contactMode === 'legacy' && !editingId && !legacyContactEmail);

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
            setContactMode('new');
            setLegacyContactEmail('');
            setFormExistingUserId('');
            setFormNewContactName('');
            setFormNewContactEmail('');
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
                onClick={() => router.push(`/consulting/clients/${client.slug || client._id}`)}
                onToggleActive={handleToggleActive}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={resetDialogState} maxWidth="sm" fullWidth>
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
          <FormControl margin="normal">
            <RadioGroup
              value={contactMode}
              onChange={(e) => setContactMode(e.target.value as ContactMode)}
            >
              <FormControlLabel value="existing" control={<Radio />} label="Assign Existing User" />
              <FormControlLabel value="new" control={<Radio />} label="Create New Contact User" />
              {editingId && legacyContactEmail && !clients.find((client) => client._id === editingId)?.contactUserId && (
                <FormControlLabel value="legacy" control={<Radio />} label="Keep Legacy Contact Email" />
              )}
            </RadioGroup>
          </FormControl>

          {contactMode === 'existing' && (
            <TextField
              label="Contact User"
              select
              fullWidth
              margin="normal"
              value={formExistingUserId}
              onChange={(e) => setFormExistingUserId(e.target.value)}
              helperText={editingId
                ? 'Shows unassigned client users and users already assigned to this client.'
                : 'Only unassigned client users can be attached to a new client.'}
            >
              <MenuItem value="" disabled>
                {assignableUsers.length ? 'Select a contact user' : 'No eligible users available'}
              </MenuItem>
              {assignableUsers.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </TextField>
          )}

          {contactMode === 'new' && (
            <React.Fragment>
              <TextField
                label="Contact Name"
                fullWidth
                margin="normal"
                value={formNewContactName}
                onChange={(e) => setFormNewContactName(e.target.value)}
              />
              <TextField
                label="Contact Email"
                fullWidth
                margin="normal"
                type="email"
                value={formNewContactEmail}
                onChange={(e) => setFormNewContactEmail(e.target.value)}
              />
            </React.Fragment>
          )}

          {contactMode === 'legacy' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This client still uses a legacy contact email. You can keep it for now or switch to an assigned contact user.
            </Alert>
          )}

          {contactMode === 'legacy' && (
            <TextField
              label="Legacy Contact Email"
              fullWidth
              margin="normal"
              value={legacyContactEmail}
              disabled
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDialogState}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaveDisabled}>
            {editingId ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
