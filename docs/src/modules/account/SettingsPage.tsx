import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import AccountPageShell from './AccountPageShell';
import { accountApiFetch, getStoredAuth } from './accountClient';

interface AccountSettingsResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  notificationPreferences: {
    ownedProductUpdates: boolean;
    otherProductUpdates: boolean;
  };
}

export default function SettingsPage() {
  const auth = React.useMemo(() => getStoredAuth(), []);
  const [settings, setSettings] = React.useState<AccountSettingsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  React.useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const response = await accountApiFetch<AccountSettingsResponse>('/api/account/settings');
        setSettings(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, [auth]);

  const handlePreferenceChange = (key: 'ownedProductUpdates' | 'otherProductUpdates') => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        notificationPreferences: {
          ...current.notificationPreferences,
          [key]: event.target.checked,
        },
      };
    });
    setSuccess('');
  };

  const handleSave = async () => {
    if (!settings) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      const response = await accountApiFetch<AccountSettingsResponse>('/api/account/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          notificationPreferences: settings.notificationPreferences,
        }),
      });
      setSettings(response);
      setSuccess('Settings updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountPageShell
      title="Settings"
      description="Manage the contact information and notification preferences tied to your account."
    >
      {!auth && (
        <Alert severity="info">
          Please log in to manage your account settings.
        </Alert>
      )}

      {auth && loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {auth && !loading && settings && (
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Stack spacing={2}>
                  <Typography variant="h6">Profile</Typography>
                  <TextField label="Name" value={settings.name} disabled fullWidth />
                  <TextField label="Email address" value={settings.email} disabled fullWidth />
                  <TextField label="Role" value={settings.role} disabled fullWidth />
                  <Typography variant="body2" color="text.secondary">
                    Your account email is used for license delivery, billing updates, and support contact.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Stack spacing={2}>
                  <div>
                    <Typography variant="h6">Notifications</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      Choose which email updates you want tied to this account.
                    </Typography>
                  </div>

                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={settings.notificationPreferences.ownedProductUpdates}
                        onChange={handlePreferenceChange('ownedProductUpdates')}
                      />
                    )}
                    label={(
                      <div>
                        <Typography fontWeight={600}>Updates about products you own</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Renewal reminders, release notes, fixes, and plan-specific announcements.
                        </Typography>
                      </div>
                    )}
                    sx={{ alignItems: 'flex-start', m: 0 }}
                  />

                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={settings.notificationPreferences.otherProductUpdates}
                        onChange={handlePreferenceChange('otherProductUpdates')}
                      />
                    )}
                    label={(
                      <div>
                        <Typography fontWeight={600}>Updates about other products</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Occasional launch notes, roadmap highlights, and broader product news.
                        </Typography>
                      </div>
                    )}
                    sx={{ alignItems: 'flex-start', m: 0 }}
                  />

                  <Box pt={1}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      )}
    </AccountPageShell>
  );
}
