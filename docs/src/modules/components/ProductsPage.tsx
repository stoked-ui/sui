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
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';
import ProductCard from './ProductCard';

interface Product {
  _id: string;
  productId: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  url: string;
  live: boolean;
  keyPrefix?: string;
  price?: number;
  currency?: string;
  subscriptions?: SubscriptionPlan[];
  licenseDurationDays?: number;
  gracePeriodDays?: number;
  trialDurationDays?: number;
}

interface SubscriptionPlan {
  label?: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  stripePriceId?: string;
}

function createEmptySubscription(): SubscriptionPlan {
  return {
    label: '',
    price: 0,
    currency: 'usd',
    interval: 'year',
  };
}

function normalizeSubscriptions(product?: Product): SubscriptionPlan[] {
  if (product?.subscriptions && product.subscriptions.length > 0) {
    return product.subscriptions.map((subscription) => ({
      label: subscription.label || '',
      price: subscription.price,
      currency: subscription.currency || 'usd',
      interval: subscription.interval || 'year',
      stripePriceId: subscription.stripePriceId,
    }));
  }

  if (product?.price !== undefined) {
    return [{
      label: '',
      price: product.price,
      currency: product.currency || 'usd',
      interval: 'year',
      stripePriceId: undefined,
    }];
  }

  return [createEmptySubscription()];
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

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [pageCounts, setPageCounts] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formProductId, setFormProductId] = React.useState('');
  const [formName, setFormName] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [formUrl, setFormUrl] = React.useState('');
  const [formKeyPrefix, setFormKeyPrefix] = React.useState('');
  const [formSubscriptions, setFormSubscriptions] = React.useState<SubscriptionPlan[]>([createEmptySubscription()]);
  const [formLicenseDays, setFormLicenseDays] = React.useState('365');
  const [formGraceDays, setFormGraceDays] = React.useState('14');
  const [formTrialDays, setFormTrialDays] = React.useState('30');

  const resetForm = React.useCallback(() => {
    setEditingId(null);
    setFormProductId('');
    setFormName('');
    setFormDescription('');
    setFormUrl('');
    setFormKeyPrefix('');
    setFormSubscriptions([createEmptySubscription()]);
    setFormLicenseDays('365');
    setFormGraceDays('14');
    setFormTrialDays('30');
  }, []);

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/products');
      setProducts(data);
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (p: Product) => {
          try {
            const pages = await apiFetch(`/api/products/${p._id}/pages`);
            counts[p._id] = pages.length;
          } catch {
            counts[p._id] = 0;
          }
        }),
      );
      setPageCounts(counts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSave = async () => {
    try {
      const subscriptions = formSubscriptions
        .map((subscription) => ({
          ...subscription,
          label: subscription.label?.trim() || undefined,
          currency: subscription.currency.trim().toLowerCase(),
        }))
        .filter((subscription) => Number.isFinite(subscription.price) && subscription.price > 0 && !!subscription.currency);

      if (subscriptions.length === 0) {
        throw new Error('At least one valid subscription is required');
      }

      if (editingId) {
        await apiFetch(`/api/products/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: formName,
            description: formDescription,
            url: formUrl,
            keyPrefix: formKeyPrefix,
            subscriptions,
            licenseDurationDays: Number(formLicenseDays),
            gracePeriodDays: Number(formGraceDays),
            trialDurationDays: Number(formTrialDays),
          }),
        });
      } else {
        await apiFetch('/api/products', {
          method: 'POST',
          body: JSON.stringify({
            productId: formProductId,
            name: formName,
            description: formDescription,
            url: formUrl,
            keyPrefix: formKeyPrefix,
            subscriptions,
            licenseDurationDays: Number(formLicenseDays),
            gracePeriodDays: Number(formGraceDays),
            trialDurationDays: Number(formTrialDays),
          }),
        });
      }
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleEdit = (id: string) => {
    const product = products.find((p) => p._id === id);
    if (product) {
      setEditingId(id);
      setFormProductId(product.productId);
      setFormName(product.name);
      setFormDescription(product.description);
      setFormUrl(product.url || '');
      setFormKeyPrefix(product.keyPrefix || '');
      setFormSubscriptions(normalizeSubscriptions(product));
      setFormLicenseDays(String(product.licenseDurationDays || 365));
      setFormGraceDays(String(product.gracePeriodDays || 14));
      setFormTrialDays(String(product.trialDurationDays || 30));
      setDialogOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product and all its pages? This cannot be undone.')) return;
    try {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleToggleLive = async (id: string, live: boolean) => {
    try {
      await apiFetch(`/api/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ live }),
      });
      fetchProducts();
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
        <Typography variant="h4">Products</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          Add Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {products.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No products yet. Click &quot;Add Product&quot; to create one.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <ProductCard
                product={product}
                pageCount={pageCounts[product._id] || 0}
                onClick={() => router.push(`/consulting/products/${product.productId}`)}
                onToggleLive={handleToggleLive}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Product ID (slug)"
            fullWidth
            margin="normal"
            value={formProductId}
            onChange={(e) => setFormProductId(e.target.value)}
            disabled={!!editingId}
            helperText={editingId ? 'Product ID cannot be changed' : 'e.g. "flux" — used in URLs'}
          />
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />
          <TextField
            label="Key Prefix"
            fullWidth
            margin="normal"
            value={formKeyPrefix}
            onChange={(e) => setFormKeyPrefix(e.target.value.toUpperCase())}
            helperText='e.g. "FLUX" — prefix for license keys'
          />
          <TextField
            label="URL"
            fullWidth
            margin="normal"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
            helperText='e.g. "/flux"'
          />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Subscriptions
          </Typography>
          {formSubscriptions.map((subscription, index) => (
            <Box key={`${index}-${subscription.stripePriceId || 'new'}`} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 1.5 }}>
              <TextField
                label="Label"
                margin="normal"
                value={subscription.label || ''}
                onChange={(e) => {
                  const next = [...formSubscriptions];
                  next[index] = { ...next[index], label: e.target.value };
                  setFormSubscriptions(next);
                }}
                helperText="Optional plan label"
                sx={{ flex: 2 }}
              />
              <TextField
                label="Price"
                type="number"
                margin="normal"
                value={subscription.price || ''}
                onChange={(e) => {
                  const next = [...formSubscriptions];
                  next[index] = { ...next[index], price: Number(e.target.value) };
                  setFormSubscriptions(next);
                }}
                helperText="Amount in dollars"
                sx={{ flex: 1.5 }}
              />
              <TextField
                label="Currency"
                margin="normal"
                value={subscription.currency}
                onChange={(e) => {
                  const next = [...formSubscriptions];
                  next[index] = { ...next[index], currency: e.target.value.toLowerCase() };
                  setFormSubscriptions(next);
                }}
                helperText="e.g. usd"
                sx={{ flex: 1 }}
              />
              <TextField
                select
                SelectProps={{ native: true }}
                label="Interval"
                margin="normal"
                value={subscription.interval}
                onChange={(e) => {
                  const next = [...formSubscriptions];
                  next[index] = { ...next[index], interval: e.target.value as 'month' | 'year' };
                  setFormSubscriptions(next);
                }}
                sx={{ flex: 1 }}
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </TextField>
              <Button
                sx={{ mt: 2 }}
                color="inherit"
                disabled={formSubscriptions.length === 1}
                onClick={() => {
                  setFormSubscriptions(formSubscriptions.filter((_, subscriptionIndex) => subscriptionIndex !== index));
                }}
              >
                Remove
              </Button>
            </Box>
          ))}
          <Button
            onClick={() => setFormSubscriptions([...formSubscriptions, createEmptySubscription()])}
            sx={{ mt: 0.5 }}
          >
            Add Subscription
          </Button>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Subscription Settings
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="License (days)"
              type="number"
              margin="normal"
              value={formLicenseDays}
              onChange={(e) => setFormLicenseDays(e.target.value)}
              fullWidth
            />
            <TextField
              label="Grace Period (days)"
              type="number"
              margin="normal"
              value={formGraceDays}
              onChange={(e) => setFormGraceDays(e.target.value)}
              fullWidth
            />
            <TextField
              label="Trial (days)"
              type="number"
              margin="normal"
              value={formTrialDays}
              onChange={(e) => setFormTrialDays(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formName || !formDescription || (!editingId && (!formProductId || !formKeyPrefix))}
          >
            {editingId ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
