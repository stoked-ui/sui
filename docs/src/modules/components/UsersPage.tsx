import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/AddOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  aliases?: string[];
  active: boolean;
  clientId?: string;
  createdAt: string;
}

interface ClientRecord {
  _id: string;
  name: string;
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

export default function UsersPage() {
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [clients, setClients] = React.useState<ClientRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formName, setFormName] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [formRole, setFormRole] = React.useState<'admin' | 'client'>('client');
  const [formClientId, setFormClientId] = React.useState('');
  const [formPassword, setFormPassword] = React.useState('');
  const [aliasDialogUser, setAliasDialogUser] = React.useState<UserRecord | null>(null);
  const [aliasInput, setAliasInput] = React.useState('');

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, clientsData] = await Promise.all([
        apiFetch('/api/users'),
        apiFetch('/api/clients'),
      ]);
      setUsers(usersData);
      setClients(clientsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    try {
      const body: Record<string, string> = { name: formName, email: formEmail, role: formRole };
      if (formPassword) body.password = formPassword;
      if (formClientId) body.clientId = formClientId;
      await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(body) });
      setDialogOpen(false);
      setFormName('');
      setFormEmail('');
      setFormRole('client');
      setFormClientId('');
      setFormPassword('');
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await apiFetch(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) });
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const openAliasDialog = (user: UserRecord) => {
    setAliasDialogUser(user);
    setAliasInput('');
  };

  const handleAddAlias = async () => {
    if (!aliasDialogUser || !aliasInput.trim()) return;
    const updated = [...(aliasDialogUser.aliases || []), aliasInput.trim().toLowerCase()];
    try {
      await apiFetch(`/api/users/${aliasDialogUser._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ aliases: updated }),
      });
      setAliasInput('');
      const refreshed = await apiFetch(`/api/users/${aliasDialogUser._id}`);
      setAliasDialogUser(refreshed);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add alias');
    }
  };

  const handleRemoveAlias = async (alias: string) => {
    if (!aliasDialogUser) return;
    const updated = (aliasDialogUser.aliases || []).filter((a) => a !== alias);
    try {
      await apiFetch(`/api/users/${aliasDialogUser._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ aliases: updated }),
      });
      const refreshed = await apiFetch(`/api/users/${aliasDialogUser._id}`);
      setAliasDialogUser(refreshed);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove alias');
    }
  };

  const clientNameMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach((c) => { map[c._id] = c.name; });
    return map;
  }, [clients]);

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
        <Typography variant="h4">Users</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Aliases</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" py={2}>No users found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                      {(user.aliases || []).map((alias) => (
                        <Chip key={alias} label={alias} size="small" variant="outlined" />
                      ))}
                      <IconButton size="small" onClick={() => openAliasDialog(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{user.clientId ? clientNameMap[user.clientId] || user.clientId : '-'}</TableCell>
                  <TableCell>
                    <Switch
                      size="small"
                      checked={user.active}
                      onChange={(e) => handleToggleActive(user._id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => handleDelete(user._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Name"
            fullWidth
            margin="normal"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />
          <TextField
            label="Password (optional)"
            fullWidth
            margin="normal"
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
          />
          <TextField
            label="Role"
            select
            fullWidth
            margin="normal"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value as 'admin' | 'client')}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="client">Client</MenuItem>
          </TextField>
          {formRole === 'client' && (
            <TextField
              label="Client Organization"
              select
              fullWidth
              margin="normal"
              value={formClientId}
              onChange={(e) => setFormClientId(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              {clients.map((c) => (
                <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!formName || !formEmail}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!aliasDialogUser} onClose={() => setAliasDialogUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Email Aliases for {aliasDialogUser?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Primary: {aliasDialogUser?.email}
          </Typography>
          {(aliasDialogUser?.aliases || []).length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {(aliasDialogUser?.aliases || []).map((alias) => (
                <Box key={alias} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={alias} variant="outlined" />
                  <IconButton size="small" color="error" onClick={() => handleRemoveAlias(alias)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No aliases yet.
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Add alias email"
              type="email"
              size="small"
              fullWidth
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddAlias(); }}
            />
            <Button variant="contained" onClick={handleAddAlias} disabled={!aliasInput.trim()}>
              Add
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAliasDialogUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
