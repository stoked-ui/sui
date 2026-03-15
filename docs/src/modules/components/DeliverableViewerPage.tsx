import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNewOutlined';
import { useRouter } from 'next/router';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

interface Deliverable {
  _id: string;
  title: string;
  type: 'download' | 'link' | 'ux' | 'html';
  url: string;
  version?: string;
  createdAt?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = localStorage.getItem('auth');
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored).access_token;
  } catch {
    return null;
  }
}

async function apiFetch(url: string) {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(getApiUrl(url), {
    credentials: 'include',
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

function appendTokenParam(url: string, token: string | null) {
  if (!token) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

function isHtmlDeliverable(deliverable: Deliverable) {
  return deliverable.type === 'html' || deliverable.url.endsWith('.html');
}

export default function DeliverableViewerPage({ deliverableId }: { deliverableId: string }) {
  const router = useRouter();
  const [deliverable, setDeliverable] = React.useState<Deliverable | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/deliverables/${deliverableId}`);
        if (active) {
          setDeliverable(data);
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load deliverable');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [deliverableId]);

  const token = getToken();
  const authenticatedUrl = React.useMemo(() => {
    if (!deliverable) {
      return '';
    }

    const url = deliverable.url;

    if (isHtmlDeliverable(deliverable) && !url.startsWith('/api/')) {
      return appendTokenParam(
        getApiUrl(`/api/deliverables/render?url=${encodeURIComponent(url)}`),
        token,
      );
    }

    if (url.startsWith('/api/')) {
      return appendTokenParam(url, token);
    }

    return url;
  }, [deliverable, token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!deliverable) {
    return <Alert severity="error">Deliverable not found</Alert>;
  }

  const isHtml = isHtmlDeliverable(deliverable);

  if (isHtml) {
    return (
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {/* Navigation Overlay (Sticky/Fixed) */}
        <Box sx={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 2000,
          display: 'flex',
          gap: 1
        }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{
              borderRadius: '20px',
              bgcolor: 'rgba(255,255,255,0.9)',
              color: 'text.primary',
              backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: '#fff' },
              boxShadow: 3
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            size="small"
            endIcon={<OpenInNewIcon />}
            component="a"
            href={authenticatedUrl}
            target="_blank"
            sx={{
              borderRadius: '20px',
              bgcolor: 'primary.main',
              boxShadow: 3
            }}
          >
            Direct Link
          </Button>
        </Box>

        <iframe
          src={authenticatedUrl}
          title={deliverable.title}
          style={{
            width: '100%',
            flex: 1,
            border: 'none',
            display: 'block',
            backgroundColor: 'transparent'
          }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Back to Client
        </Button>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={deliverable.type.toUpperCase()} size="small" variant="outlined" />
          {deliverable.version && <Chip label={`v${deliverable.version}`} size="small" />}
        </Stack>
      </Stack>

      <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h4" gutterBottom>{deliverable.title}</Typography>
        <Button
          variant="contained"
          endIcon={<OpenInNewIcon />}
          component="a"
          href={authenticatedUrl}
          target="_blank"
          sx={{ mt: 2 }}
        >
          Open Deliverable
        </Button>
      </Box>
    </Box>
  );
}
