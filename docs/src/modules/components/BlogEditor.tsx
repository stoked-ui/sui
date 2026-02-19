import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlogEditorForm, { BlogPostFormData } from 'docs/src/modules/components/BlogEditorForm';
import BlogMarkdownEditor from 'docs/src/modules/components/BlogMarkdownEditor';

const BLOG_API_URL = process.env.NEXT_PUBLIC_BLOG_API_URL || 'http://localhost:3001';

export interface BlogEditorProps {
  initialSlug?: string;
}

interface AuthState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

const DEFAULT_FORM_DATA: BlogPostFormData = {
  title: '',
  description: '',
  slug: '',
  tags: [],
  authors: '',
  targetSites: ['stoked-ui.com'],
  image: '',
};

function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BLOG_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message || `Login failed (${res.status})`);
      }
      const json = await res.json() as { access_token?: string; token?: string };
      const token = json.access_token || json.token;
      if (!token) {
        throw new Error('No token returned from login endpoint');
      }
      try {
        localStorage.setItem('blog_jwt', token);
      } catch {
        // localStorage may be unavailable in some environments
      }
      onLogin(token);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Paper
        variant="outlined"
        sx={{ p: 4, width: '100%', maxWidth: 400 }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Blog Editor Login
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to create and edit blog posts.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="small"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default function BlogEditor({ initialSlug }: BlogEditorProps) {
  const isEditing = Boolean(initialSlug);

  // Auth state
  const [auth, setAuth] = React.useState<AuthState>({ token: null, loading: true, error: null });

  // Editor state
  const [formData, setFormData] = React.useState<BlogPostFormData>(DEFAULT_FORM_DATA);
  const [body, setBody] = React.useState('');
  const [status, setStatus] = React.useState<'draft' | 'published'>('draft');
  const [currentSlug, setCurrentSlug] = React.useState<string | undefined>(initialSlug);
  const [activeTab, setActiveTab] = React.useState(0);

  // Operation state
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [saveMessage, setSaveMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [initialLoading, setInitialLoading] = React.useState(isEditing);

  // Auto-save timer ref
  const autoSaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirty = React.useRef(false);

  // Load token from localStorage on mount
  React.useEffect(() => {
    let token: string | null = null;
    try {
      token = localStorage.getItem('blog_jwt');
    } catch {
      // localStorage unavailable
    }
    setAuth({ token, loading: false, error: null });
  }, []);

  // Load existing post when editing
  React.useEffect(() => {
    if (!initialSlug || !auth.token) {
      return;
    }
    const loadPost = async () => {
      setInitialLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${BLOG_API_URL}/blog/${initialSlug}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) {
          throw new Error(`Failed to load post (${res.status})`);
        }
        const post = await res.json() as {
          title?: string;
          description?: string;
          slug?: string;
          tags?: string[];
          authors?: string[];
          targetSites?: string[];
          image?: string;
          body?: string;
          status?: string;
        };
        setFormData({
          title: post.title || '',
          description: post.description || '',
          slug: post.slug || initialSlug,
          tags: post.tags || [],
          authors: (post.authors || []).join(', '),
          targetSites: post.targetSites || ['stoked-ui.com'],
          image: post.image || '',
        });
        setBody(post.body || '');
        setStatus(post.status === 'published' ? 'published' : 'draft');
        setCurrentSlug(post.slug || initialSlug);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load post';
        setLoadError(message);
      } finally {
        setInitialLoading(false);
      }
    };
    loadPost();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug, auth.token]);

  // Auto-save every 30 seconds when dirty
  React.useEffect(() => {
    if (!auth.token) {
      return undefined;
    }
    const handleAutoSave = () => {
      if (isDirty.current && formData.title && formData.slug) {
        isDirty.current = false;
        performSave(false);
      }
    };
    autoSaveTimer.current = setInterval(handleAutoSave, 30000);
    return () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token, formData, body]);

  const buildPayload = React.useCallback(() => {
    return {
      title: formData.title,
      description: formData.description,
      slug: formData.slug,
      tags: formData.tags,
      authors: formData.authors
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      targetSites: formData.targetSites,
      image: formData.image || undefined,
      body,
      status: 'draft',
    };
  }, [formData, body]);

  const performSave = React.useCallback(async (showMessage = true) => {
    if (!auth.token) {
      return;
    }
    if (!formData.title.trim()) {
      if (showMessage) {
        setSaveMessage({ type: 'error', text: 'Title is required before saving.' });
      }
      return;
    }
    if (!formData.slug.trim()) {
      if (showMessage) {
        setSaveMessage({ type: 'error', text: 'Slug is required before saving.' });
      }
      return;
    }

    setSaving(true);
    if (showMessage) {
      setSaveMessage(null);
    }

    const payload = buildPayload();

    try {
      let res: Response;
      if (currentSlug) {
        // Update existing post
        res = await fetch(`${BLOG_API_URL}/blog/${currentSlug}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new post
        res = await fetch(`${BLOG_API_URL}/blog`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message || `Save failed (${res.status})`);
      }

      const saved = await res.json() as { slug?: string };
      if (saved.slug && !currentSlug) {
        setCurrentSlug(saved.slug);
      }

      if (showMessage) {
        setSaveMessage({ type: 'success', text: `Draft saved successfully.` });
        setTimeout(() => setSaveMessage(null), 4000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Save failed';
      if (showMessage) {
        setSaveMessage({ type: 'error', text: message });
      }
    } finally {
      setSaving(false);
    }
  }, [auth.token, formData, body, buildPayload, currentSlug]);

  const handlePublish = async () => {
    if (!auth.token || !currentSlug) {
      setSaveMessage({ type: 'error', text: 'Please save the draft first before publishing.' });
      return;
    }
    setPublishing(true);
    setSaveMessage(null);
    try {
      const endpoint = status === 'published'
        ? `${BLOG_API_URL}/blog/${currentSlug}/unpublish`
        : `${BLOG_API_URL}/blog/${currentSlug}/publish`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message || `Operation failed (${res.status})`);
      }
      const newStatus = status === 'published' ? 'draft' : 'published';
      setStatus(newStatus);
      setSaveMessage({
        type: 'success',
        text: newStatus === 'published' ? 'Post published successfully!' : 'Post unpublished (set to draft).',
      });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      setSaveMessage({ type: 'error', text: message });
    } finally {
      setPublishing(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('blog_jwt');
    } catch {
      // localStorage unavailable
    }
    setAuth({ token: null, loading: false, error: null });
  };

  const handleFormChange = (data: BlogPostFormData) => {
    isDirty.current = true;
    setFormData(data);
  };

  const handleBodyChange = (value: string) => {
    isDirty.current = true;
    setBody(value);
  };

  // Loading auth
  if (auth.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Not authenticated
  if (!auth.token) {
    return (
      <LoginForm
        onLogin={(token) => setAuth({ token, loading: false, error: null })}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh' }}>
      {/* Editor Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            href="/blog"
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{ color: 'text.secondary' }}
          >
            Blog
          </Button>
          <Divider orientation="vertical" flexItem />
          <Typography variant="subtitle1" fontWeight="semiBold">
            {isEditing ? `Editing: ${formData.title || initialSlug}` : 'New Post'}
          </Typography>
          <Box
            sx={(theme) => ({
              px: 1,
              py: 0.25,
              borderRadius: 1,
              backgroundColor:
                status === 'published'
                  ? theme.palette.success.light
                  : theme.palette.warning.light,
              color:
                status === 'published'
                  ? theme.palette.success.dark
                  : theme.palette.warning.dark,
            })}
          >
            <Typography variant="caption" fontWeight="medium">
              {status}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            onClick={() => performSave(true)}
            disabled={saving || publishing}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            variant="contained"
            size="small"
            color={status === 'published' ? 'warning' : 'success'}
            startIcon={
              publishing
                ? <CircularProgress size={14} color="inherit" />
                : status === 'published'
                  ? <UnpublishedIcon />
                  : <PublishIcon />
            }
            onClick={handlePublish}
            disabled={saving || publishing}
          >
            {/* eslint-disable-next-line no-nested-ternary */}
            {publishing ? 'Processing...' : status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
          <Button size="small" variant="text" color="inherit" onClick={handleLogout} sx={{ color: 'text.secondary' }}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* Save message */}
      {saveMessage && (
        <Alert severity={saveMessage.type} sx={{ mx: 3, mt: 1 }} onClose={() => setSaveMessage(null)}>
          {saveMessage.text}
        </Alert>
      )}

      {/* Load error */}
      {loadError && (
        <Alert severity="error" sx={{ mx: 3, mt: 1 }}>
          {loadError}
        </Alert>
      )}

      {/* Loading post */}
      {initialLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Tabs for mobile */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} aria-label="Editor tabs">
              <Tab label="Post Details" />
              <Tab label="Content" />
            </Tabs>
          </Box>

          {/* Two-panel layout */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '380px 1fr' },
              flex: 1,
              overflow: 'hidden',
            }}
          >
            {/* Left panel: Post metadata form */}
            <Box
              sx={{
                borderRight: { md: '1px solid' },
                borderColor: { md: 'divider' },
                overflowY: 'auto',
                p: 3,
                display: {
                  xs: activeTab === 0 ? 'block' : 'none',
                  md: 'block',
                },
              }}
            >
              <Typography variant="subtitle2" fontWeight="semiBold" color="text.secondary" gutterBottom>
                Post Details
              </Typography>
              <BlogEditorForm
                formData={formData}
                onChange={handleFormChange}
                isEditing={isEditing}
              />
            </Box>

            {/* Right panel: Markdown editor */}
            <Box
              sx={{
                overflowY: 'auto',
                p: 3,
                display: {
                  xs: activeTab === 1 ? 'block' : 'none',
                  md: 'block',
                },
              }}
            >
              <Typography variant="subtitle2" fontWeight="semiBold" color="text.secondary" gutterBottom>
                Content
              </Typography>
              <BlogMarkdownEditor value={body} onChange={handleBodyChange} />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
