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
      if (editingId) {
        await apiFetch(`/api/products/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: formName, description: formDescription, url: formUrl }),
        });
      } else {
        await apiFetch('/api/products', {
          method: 'POST',
          body: JSON.stringify({ productId: formProductId, name: formName, description: formDescription, url: formUrl }),
        });
      }
      setDialogOpen(false);
      setEditingId(null);
      setFormProductId('');
      setFormName('');
      setFormDescription('');
      setFormUrl('');
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
      setFormUrl(product.url);
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
            setEditingId(null);
            setFormProductId('');
            setFormName('');
            setFormDescription('');
            setFormUrl('');
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
                onClick={() => router.push(`/consulting/products/${product._id}`)}
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
            label="URL"
            fullWidth
            margin="normal"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
            helperText='e.g. "/flux"'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formName || !formDescription || (!editingId && !formProductId)}
          >
            {editingId ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
