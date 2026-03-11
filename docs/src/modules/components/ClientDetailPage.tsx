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
import HtmlIcon from '@mui/icons-material/HtmlOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptOutlined';
import MuiLink from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import { useRouter } from 'next/router';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';
import DeliverableForm from './DeliverableForm';

interface Deliverable {
  _id: string;
  title: string;
  type: 'download' | 'link' | 'ux' | 'html';
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
  html: <HtmlIcon fontSize="small" />,
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  return `${months}mo ago`;
}

interface DeliverableGroup {
  title: string;
  type: Deliverable['type'];
  latest: Deliverable;
  older: Deliverable[];
}

function groupDeliverables(items: Deliverable[]): DeliverableGroup[] {
  const map = new Map<string, Deliverable[]>();
  for (const d of items) {
    const key = d.title.toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(d);
  }
  const groups: DeliverableGroup[] = [];
  for (const [, versions] of map) {
    // Sort newest first
    versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    groups.push({
      title: versions[0].title,
      type: versions[0].type,
      latest: versions[0],
      older: versions.slice(1),
    });
  }
  return groups;
}

function DeliverableRow({ group, index, isAdmin, onEdit, onDelete }: {
  group: DeliverableGroup;
  index: number;
  isAdmin: boolean;
  onEdit: (d: Deliverable) => void;
  onDelete: (id: string) => void;
}) {
  const [historyAnchor, setHistoryAnchor] = React.useState<null | HTMLElement>(null);
  const [deleteAnchor, setDeleteAnchor] = React.useState<null | HTMLElement>(null);
  const d = group.latest;
  const allVersions = [d, ...group.older];
  const href = d.type === 'html' ? `/consulting/deliverables/${d._id}` : d.url;
  const isExternal = d.type !== 'html';

  return (
    <React.Fragment>
      {index > 0 && <Divider />}
      <ListItem>
        <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
          {typeIcons[d.type]}
        </Box>
        <ListItemText
          primary={
            <Stack direction="row" spacing={1} alignItems="center">
              <MuiLink
                href={href}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                underline="hover"
                color="text.primary"
                fontWeight={600}
              >
                {d.title}
              </MuiLink>
              <Chip label={d.type} size="small" variant="outlined" />
              {d.version && <Chip label={`v${d.version}`} size="small" />}
            </Stack>
          }
          secondary={
            <Stack direction="row" spacing={1} alignItems="center" component="span" sx={{ mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary" component="span">
                {relativeTime(d.createdAt)}
              </Typography>
              {group.older.length > 0 && (
                <React.Fragment>
                  <Chip
                    icon={<HistoryIcon sx={{ fontSize: 14 }} />}
                    label={`${group.older.length} older`}
                    size="small"
                    variant="outlined"
                    onClick={(e) => setHistoryAnchor(e.currentTarget)}
                    sx={{ height: 20, cursor: 'pointer', '& .MuiChip-label': { px: 0.5, fontSize: '0.7rem' } }}
                  />
                  <Menu
                    anchorEl={historyAnchor}
                    open={Boolean(historyAnchor)}
                    onClose={() => setHistoryAnchor(null)}
                  >
                    {group.older.map((old) => (
                      <MenuItem
                        key={old._id}
                        component="a"
                        href={old.type === 'html' ? `/consulting/deliverables/${old._id}` : old.url}
                        {...(old.type !== 'html' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        onClick={() => setHistoryAnchor(null)}
                        sx={{ fontSize: '0.85rem' }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <span>{old.version ? `v${old.version}` : 'version'}</span>
                          <Typography variant="caption" color="text.secondary">
                            {relativeTime(old.createdAt)}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Menu>
                </React.Fragment>
              )}
            </Stack>
          }
        />
        {isAdmin && (
          <ListItemSecondaryAction>
            <IconButton size="small" onClick={() => onEdit(d)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                if (allVersions.length === 1) {
                  onDelete(d._id);
                } else {
                  setDeleteAnchor(e.currentTarget);
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={deleteAnchor}
              open={Boolean(deleteAnchor)}
              onClose={() => setDeleteAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setDeleteAnchor(null);
                  allVersions.forEach((v) => onDelete(v._id));
                }}
                sx={{ color: 'error.main', fontWeight: 600, fontSize: '0.85rem' }}
              >
                Delete all versions
              </MenuItem>
              <Divider />
              {allVersions.map((v) => (
                <MenuItem
                  key={v._id}
                  onClick={() => {
                    setDeleteAnchor(null);
                    onDelete(v._id);
                  }}
                  sx={{ fontSize: '0.85rem' }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DeleteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                    <span>{v.version ? `v${v.version}` : 'version'}</span>
                    <Typography variant="caption" color="text.secondary">
                      {relativeTime(v.createdAt)}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Menu>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    </React.Fragment>
  );
}

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
              {groupDeliverables(deliverables).map((group, i) => (
                <DeliverableRow
                  key={group.latest._id}
                  group={group}
                  index={i}
                  isAdmin={isAdmin}
                  onEdit={setEditingDeliverable}
                  onDelete={handleDeleteDeliverable}
                />
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
