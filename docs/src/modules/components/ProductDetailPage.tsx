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
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import AddIcon from '@mui/icons-material/AddOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import { useRouter } from 'next/router';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

interface Feature {
  name: string;
  description: string;
  id: string;
}

interface ProductData {
  _id: string;
  productId: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  url: string;
  live: boolean;
  managed: boolean;
  hideProductFeatures: boolean;
  prerelease?: 'alpha' | 'beta' | 'none';
  features: Feature[];
}

interface DocPage {
  _id: string;
  productId: string;
  slug: string;
  title: string;
  content: string;
  order: number;
  published: boolean;
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

export default function ProductDetailPage({ productId }: { productId: string }) {
  const router = useRouter();
  const [product, setProduct] = React.useState<ProductData | null>(null);
  const [pages, setPages] = React.useState<DocPage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Feature editor state
  const [featureDialogOpen, setFeatureDialogOpen] = React.useState(false);
  const [editingFeatureIndex, setEditingFeatureIndex] = React.useState<number | null>(null);
  const [featureName, setFeatureName] = React.useState('');
  const [featureDescription, setFeatureDescription] = React.useState('');
  const [featureId, setFeatureId] = React.useState('');

  // Page editor state
  const [pageDialogOpen, setPageDialogOpen] = React.useState(false);
  const [editingPageId, setEditingPageId] = React.useState<string | null>(null);
  const [pageTitle, setPageTitle] = React.useState('');
  const [pageSlug, setPageSlug] = React.useState('');
  const [pageContent, setPageContent] = React.useState('');
  const [pageOrder, setPageOrder] = React.useState(0);
  const [pagePublished, setPagePublished] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [productData, pagesData] = await Promise.all([
        apiFetch(`/api/products/${productId}`),
        apiFetch(`/api/products/${productId}/pages`),
      ]);
      setProduct(productData);
      setPages(pagesData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    if (productId) fetchData();
  }, [productId, fetchData]);

  // --- Feature handlers ---
  const handleSaveFeature = async () => {
    if (!product) return;
    const features = [...product.features];
    const feature: Feature = { name: featureName, description: featureDescription, id: featureId };
    if (editingFeatureIndex !== null) {
      features[editingFeatureIndex] = feature;
    } else {
      features.push(feature);
    }
    try {
      await apiFetch(`/api/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ features }),
      });
      setFeatureDialogOpen(false);
      setEditingFeatureIndex(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save feature');
    }
  };

  const handleDeleteFeature = async (index: number) => {
    if (!product) return;
    if (!window.confirm('Remove this feature?')) return;
    const features = product.features.filter((_, i) => i !== index);
    try {
      await apiFetch(`/api/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ features }),
      });
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove feature');
    }
  };

  // --- Page handlers ---
  const handleSavePage = async () => {
    try {
      if (editingPageId) {
        await apiFetch(`/api/products/${productId}/pages/${editingPageId}`, {
          method: 'PATCH',
          body: JSON.stringify({ title: pageTitle, slug: pageSlug, content: pageContent, order: pageOrder, published: pagePublished }),
        });
      } else {
        await apiFetch(`/api/products/${productId}/pages`, {
          method: 'POST',
          body: JSON.stringify({ title: pageTitle, slug: pageSlug, content: pageContent, order: pageOrder }),
        });
      }
      setPageDialogOpen(false);
      setEditingPageId(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save page');
    }
  };

  const handleEditPage = (page: DocPage) => {
    setEditingPageId(page._id);
    setPageTitle(page.title);
    setPageSlug(page.slug);
    setPageContent(page.content);
    setPageOrder(page.order);
    setPagePublished(page.published);
    setPageDialogOpen(true);
  };

  const handleDeletePage = async (pageIdToDelete: string) => {
    if (!window.confirm('Delete this page?')) return;
    try {
      await apiFetch(`/api/products/${productId}/pages/${pageIdToDelete}`, { method: 'DELETE' });
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleToggleLive = async (live: boolean) => {
    try {
      await apiFetch(`/api/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ live }),
      });
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handlePrereleaseChange = async (prerelease: string) => {
    try {
      await apiFetch(`/api/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ prerelease }),
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

  if (!product) {
    return <Alert severity="error">Product not found</Alert>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/consulting/products')}
        sx={{ mb: 2 }}
      >
        Back to Products
      </Button>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Section 1: Product Metadata */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h4">{product.name}</Typography>
              {product.prerelease && product.prerelease !== 'none' && (
                <Chip
                  label={product.prerelease.toUpperCase()}
                  size="small"
                  color={product.prerelease === 'alpha' ? 'error' : 'warning'}
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>
            <Typography color="text.secondary">{product.description}</Typography>
            <Typography variant="body2" color="text.secondary">Product ID: {product.productId}</Typography>
            <Typography variant="body2" color="text.secondary">URL: {product.url}</Typography>
            {product.fullName && product.fullName !== product.name && (
              <Typography variant="body2" color="text.secondary">Full Name: {product.fullName}</Typography>
            )}
          </Box>
          <Stack alignItems="center" spacing={1}>
            <Chip
              label={product.live ? 'Live' : 'Hidden'}
              color={product.live ? 'success' : 'default'}
              variant="outlined"
            />
            <Switch
              checked={product.live}
              onChange={(e) => handleToggleLive(e.target.checked)}
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Prerelease</InputLabel>
              <Select
                value={product.prerelease || 'none'}
                label="Prerelease"
                onChange={(e) => handlePrereleaseChange(e.target.value)}
              >
                <MenuItem value="alpha">Alpha</MenuItem>
                <MenuItem value="beta">Beta</MenuItem>
                <MenuItem value="none">None</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      {/* Features Section */}
      <Box mb={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Features</Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingFeatureIndex(null);
              setFeatureName('');
              setFeatureDescription('');
              setFeatureId('');
              setFeatureDialogOpen(true);
            }}
          >
            Add Feature
          </Button>
        </Stack>

        {product.features.length === 0 ? (
          <Typography color="text.secondary" py={2}>No features defined yet.</Typography>
        ) : (
          <Paper variant="outlined">
            <List disablePadding>
              {product.features.map((f, i) => (
                <React.Fragment key={f.id}>
                  {i > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <span>{f.name}</span>
                          <Chip label={f.id} size="small" variant="outlined" />
                        </Stack>
                      }
                      secondary={f.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingFeatureIndex(i);
                          setFeatureName(f.name);
                          setFeatureDescription(f.description);
                          setFeatureId(f.id);
                          setFeatureDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteFeature(i)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* Section 2: Doc Pages */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Documentation Pages</Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingPageId(null);
              setPageTitle('');
              setPageSlug('');
              setPageContent('');
              setPageOrder(pages.length);
              setPagePublished(true);
              setPageDialogOpen(true);
            }}
          >
            Add Page
          </Button>
        </Stack>

        {pages.length === 0 ? (
          <Typography color="text.secondary" py={2}>No documentation pages yet.</Typography>
        ) : (
          <Paper variant="outlined">
            <List disablePadding>
              {pages.map((page, i) => (
                <React.Fragment key={page._id}>
                  {i > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <span>{page.title}</span>
                          <Chip label={`/${page.slug}`} size="small" variant="outlined" />
                          {!page.published && <Chip label="Draft" size="small" color="warning" />}
                        </Stack>
                      }
                      secondary={`Order: ${page.order}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => handleEditPage(page)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeletePage(page._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* Feature Dialog */}
      <Dialog open={featureDialogOpen} onClose={() => setFeatureDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFeatureIndex !== null ? 'Edit Feature' : 'Add Feature'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Feature Name"
            fullWidth
            margin="normal"
            value={featureName}
            onChange={(e) => setFeatureName(e.target.value)}
          />
          <TextField
            label="Feature ID"
            fullWidth
            margin="normal"
            value={featureId}
            onChange={(e) => setFeatureId(e.target.value)}
            helperText="Used in URL routing, e.g. 'overview'"
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={featureDescription}
            onChange={(e) => setFeatureDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeatureDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveFeature}
            disabled={!featureName || !featureId}
          >
            {editingFeatureIndex !== null ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Page Dialog */}
      <Dialog open={pageDialogOpen} onClose={() => setPageDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingPageId ? 'Edit Page' : 'Add Page'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Title"
            fullWidth
            margin="normal"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
          />
          <TextField
            label="Slug"
            fullWidth
            margin="normal"
            value={pageSlug}
            onChange={(e) => setPageSlug(e.target.value)}
            helperText="URL slug, e.g. 'overview'"
          />
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1, mb: 1 }}>
            <TextField
              label="Order"
              type="number"
              value={pageOrder}
              onChange={(e) => setPageOrder(parseInt(e.target.value, 10) || 0)}
              sx={{ width: 120 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={pagePublished}
                  onChange={(e) => setPagePublished(e.target.checked)}
                />
              }
              label="Published"
            />
          </Stack>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Content (Markdown)
          </Typography>
          <Box
            component="textarea"
            value={pageContent}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPageContent(e.target.value)}
            sx={(theme) => ({
              width: '100%',
              minHeight: 300,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              padding: theme.spacing(1.5),
              borderRadius: 0,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              resize: 'vertical',
              outline: 'none',
              '&:focus': {
                borderColor: theme.palette.primary.main,
              },
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPageDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSavePage}
            disabled={!pageTitle || !pageSlug || !pageContent}
          >
            {editingPageId ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
