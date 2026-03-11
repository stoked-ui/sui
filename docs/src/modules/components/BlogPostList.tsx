import * as React from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import { Link } from '@stoked-ui/docs';

const BLOG_API_URL = (process.env.NEXT_PUBLIC_BLOG_API_URL || '/api').replace(/\/$/, '');

interface BlogPostItem {
  slug: string;
  title: string;
  description?: string;
  status: string;
  date?: string;
  authors?: string[];
  tags?: string[];
  updatedAt?: string;
}

type TabFilter = 'all' | 'draft' | 'published';

export default function BlogPostList() {
  const router = useRouter();
  const [posts, setPosts] = React.useState<BlogPostItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tabFilter, setTabFilter] = React.useState<TabFilter>('all');
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    let authToken: string | null = null;
    let role: string | null = null;
    try {
      const stored = localStorage.getItem('auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        authToken = parsed.access_token || null;
        role = parsed.user?.role || null;
      }
      if (!authToken) {
        authToken = localStorage.getItem('blog_jwt');
      }
    } catch {
      // ignore
    }

    if (!authToken || role === 'client') {
      router.replace('/consulting/login');
      return;
    }
    setToken(authToken);
  }, [router]);

  const fetchPosts = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const statusParam = tabFilter !== 'all' ? `&status=${tabFilter}` : '';
      const res = await fetch(`${BLOG_API_URL}/blog?limit=100${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
      const json = await res.json();
      setPosts(json.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [token, tabFilter]);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePublishToggle = async (post: BlogPostItem) => {
    if (!token) return;
    const action = post.status === 'published' ? 'unpublish' : 'publish';
    try {
      const res = await fetch(`${BLOG_API_URL}/blog/${post.slug}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message || `${action} failed`);
      }
      setMessage({ type: 'success', text: `Post "${post.title}" ${action === 'publish' ? 'published' : 'unpublished'}.` });
      setTimeout(() => setMessage(null), 4000);
      fetchPosts();
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : `${action} failed` });
    }
  };

  const handleDelete = async (post: BlogPostItem) => {
    if (!token) return;
    if (!window.confirm(`Delete "${post.title}"? This can be undone by an admin.`)) return;
    try {
      const res = await fetch(`${BLOG_API_URL}/blog/${post.slug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status !== 204) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message || 'Delete failed');
      }
      setMessage({ type: 'success', text: `Post "${post.title}" deleted.` });
      setTimeout(() => setMessage(null), 4000);
      fetchPosts();
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed' });
    }
  };

  if (!token) return null;

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Blog Posts
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          href="/blog/editor/new"
          component={Link}
        >
          New Post
        </Button>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Tabs
        value={tabFilter}
        onChange={(_, val) => setTabFilter(val)}
        sx={{ mb: 2 }}
      >
        <Tab label="All" value="all" />
        <Tab label="Drafts" value="draft" />
        <Tab label="Published" value="published" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No {tabFilter !== 'all' ? tabFilter : ''} posts found.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {posts.map((post) => (
            <Paper
              key={post.slug}
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="semiBold"
                    noWrap
                    component={Link}
                    href={`/blog/editor/${post.slug}`}
                    color="text.primary"
                    sx={{ '&:hover': { textDecoration: 'underline' } }}
                  >
                    {post.title}
                  </Typography>
                  <Chip
                    label={post.status}
                    size="small"
                    color={post.status === 'published' ? 'success' : 'warning'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
                {post.description && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {post.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                  {post.date && (
                    <Typography variant="caption" color="text.tertiary">
                      {new Date(post.date).toLocaleDateString()}
                    </Typography>
                  )}
                  {post.authors && post.authors.length > 0 && (
                    <Typography variant="caption" color="text.tertiary">
                      by {post.authors.join(', ')}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <IconButton
                  size="small"
                  title="Edit"
                  onClick={() => router.push(`/blog/editor/${post.slug}`)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                  color={post.status === 'published' ? 'warning' : 'success'}
                  onClick={() => handlePublishToggle(post)}
                >
                  {post.status === 'published' ? <UnpublishedIcon fontSize="small" /> : <PublishIcon fontSize="small" />}
                </IconButton>
                <IconButton
                  size="small"
                  title="Delete"
                  color="error"
                  onClick={() => handleDelete(post)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
