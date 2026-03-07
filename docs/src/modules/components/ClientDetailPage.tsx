import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/AddOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import LinkIcon from '@mui/icons-material/LinkOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import DesignServicesIcon from '@mui/icons-material/DesignServicesOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptOutlined';
import { useRouter } from 'next/router';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';
import DeliverableForm from './DeliverableForm';

interface Deliverable {
  _id: string;
  title: string;
  type: 'download' | 'link' | 'ux';
  url: string;
  version?: string;
  createdAt: string;
}

interface InvoiceSummary {
  _id: string;
  invoiceDate: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  status: 'draft' | 'sent' | 'paid';
}

interface ClientUser {
  _id: string;
  name: string;
  email: string;
  active: boolean;
  role: string;
}

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
  const res = await fetch(getApiUrl(url), { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

const typeIcons: Record<string, React.ReactElement> = {
  link: <LinkIcon fontSize="small" />,
  download: <DownloadIcon fontSize="small" />,
  ux: <DesignServicesIcon fontSize="small" />,
};

export default function ClientDetailPage({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [client, setClient] = React.useState<Client | null>(null);
  const [deliverables, setDeliverables] = React.useState<Deliverable[]>([]);
  const [invoices, setInvoices] = React.useState<InvoiceSummary[]>([]);
  const [users, setUsers] = React.useState<ClientUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showDeliverableForm, setShowDeliverableForm] = React.useState(false);
  const [editingDeliverable, setEditingDeliverable] = React.useState<Deliverable | null>(null);
  const [userDialogOpen, setUserDialogOpen] = React.useState(false);
  const [userName, setUserName] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');

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

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [clientData, deliverablesData, invoicesData] = await Promise.all([
        apiFetch(`/api/clients/${clientId}`),
        apiFetch(`/api/deliverables?clientId=${clientId}`),
        apiFetch(`/api/invoices?clientId=${clientId}`),
      ]);
      setClient(clientData);
      setDeliverables(deliverablesData);
      setInvoices(invoicesData);
      if (isAdmin) {
        const usersData = await apiFetch(`/api/users?clientId=${clientId}`);
        setUsers(usersData);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [clientId, isAdmin]);

  React.useEffect(() => {
    if (clientId) fetchData();
  }, [clientId, fetchData]);

  const handleAddDeliverable = async (values: { title: string; type: string; url: string; version?: string }) => {
    try {
      await apiFetch('/api/deliverables', {
        method: 'POST',
        body: JSON.stringify({ ...values, clientId }),
      });
      setShowDeliverableForm(false);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add deliverable');
    }
  };

  const handleEditDeliverable = async (values: { title: string; type: string; url: string; version?: string }) => {
    if (!editingDeliverable) return;
    try {
      await apiFetch(`/api/deliverables/${editingDeliverable._id}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      setEditingDeliverable(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update deliverable');
    }
  };

  const handleDeleteDeliverable = async (id: string) => {
    if (!window.confirm('Delete this deliverable?')) return;
    try {
      await apiFetch(`/api/deliverables/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleAddUser = async () => {
    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ name: userName, email: userEmail, role: 'client', clientId }),
      });
      setUserDialogOpen(false);
      setUserName('');
      setUserEmail('');
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
    }
  };

  const handleToggleUserActive = async (userId: string, active: boolean) => {
    try {
      await apiFetch(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ active }),
      });
      fetchData();
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

  if (!client) {
    return (
      <Alert severity="error">Client not found</Alert>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/consulting/clients')}
        sx={{ mb: 2 }}
      >
        Back to Clients
      </Button>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">{client.name}</Typography>
            <Typography color="text.secondary">{client.contactEmail}</Typography>
            <Typography variant="body2" color="text.secondary">Slug: {client.slug}</Typography>
          </Box>
          <Chip
            label={client.active ? 'Active' : 'Inactive'}
            color={client.active ? 'success' : 'default'}
            variant="outlined"
          />
        </Stack>
      </Paper>

      {/* Deliverables Section */}
      <Box mb={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Deliverables</Typography>
          {isAdmin && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => { setShowDeliverableForm(true); setEditingDeliverable(null); }}
            >
              Add Deliverable
            </Button>
          )}
        </Stack>

        {showDeliverableForm && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <DeliverableForm
              onSubmit={handleAddDeliverable}
              onCancel={() => setShowDeliverableForm(false)}
            />
          </Paper>
        )}

        {editingDeliverable && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Editing: {editingDeliverable.title}</Typography>
            <DeliverableForm
              initialValues={editingDeliverable}
              onSubmit={handleEditDeliverable}
              onCancel={() => setEditingDeliverable(null)}
              submitLabel="Save"
            />
          </Paper>
        )}

        {deliverables.length === 0 ? (
          <Typography color="text.secondary" py={2}>No deliverables yet.</Typography>
        ) : (
          <Paper variant="outlined">
            <List disablePadding>
              {deliverables.map((d, i) => (
                <React.Fragment key={d._id}>
                  {i > 0 && <Divider />}
                  <ListItem>
                    <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                      {typeIcons[d.type]}
                    </Box>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <span>{d.title}</span>
                          <Chip label={d.type} size="small" variant="outlined" />
                          {d.version && <Chip label={`v${d.version}`} size="small" />}
                        </Stack>
                      }
                      secondary={
                        <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                          <a href={d.url} target="_blank" rel="noopener noreferrer">{d.url}</a>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    {isAdmin && (
                      <ListItemSecondaryAction>
                        <IconButton size="small" onClick={() => setEditingDeliverable(d)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteDeliverable(d._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* Invoices Section */}
      <Box mb={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ReceiptIcon color="primary" />
            <Typography variant="h5">Invoices</Typography>
          </Stack>
          {invoices.length > 0 && (
            <Button
              size="small"
              onClick={() => router.push(`/consulting/invoices?clientId=${clientId}`)}
            >
              View All
            </Button>
          )}
        </Stack>

        {invoices.length === 0 ? (
          <Typography color="text.secondary" py={2}>No invoices yet.</Typography>
        ) : (
          <Paper variant="outlined">
            <List disablePadding>
              {invoices.slice(0, 5).map((inv, i) => (
                <React.Fragment key={inv._id}>
                  {i > 0 && <Divider />}
                  <ListItem
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => router.push(`/consulting/invoices/${inv._id}`)}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <span>{new Date(inv.invoiceDate).toLocaleDateString()}</span>
                          <Chip label={inv.status} size="small" variant="outlined" color={inv.status === 'paid' ? 'success' : inv.status === 'sent' ? 'info' : 'default'} />
                        </Stack>
                      }
                      secondary={
                        <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                          {new Date(inv.periodStart).toLocaleDateString()} – {new Date(inv.periodEnd).toLocaleDateString()}
                          {' · '}
                          <Box component="span" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            {inv.totalHours} hours
                          </Box>
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

      {/* Users Section */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Users</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => setUserDialogOpen(true)}>
            Add User
          </Button>
        </Stack>

        {users.length === 0 ? (
          <Typography color="text.secondary" py={2}>No users assigned to this client.</Typography>
        ) : (
          <Paper variant="outlined">
            <List disablePadding>
              {users.map((u, i) => (
                <React.Fragment key={u._id}>
                  {i > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={u.name}
                      secondary={u.email}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        size="small"
                        checked={u.active}
                        onChange={(e) => handleToggleUserActive(u._id, e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Name"
            fullWidth
            margin="normal"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddUser} disabled={!userName || !userEmail}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
