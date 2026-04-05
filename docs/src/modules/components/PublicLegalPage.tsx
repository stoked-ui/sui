import * as React from 'react';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { BrandingCssVarsProvider, Link } from '@stoked-ui/docs';
import { useRouter } from 'next/router';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import Section from 'docs/src/layouts/Section';
import Head from 'docs/src/modules/components/Head';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

interface LegalData {
  productName: string;
  productUrl: string;
  title: string;
  content: string;
}

function parseBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  if (parts.length === 1) return text;
  return (
    <React.Fragment>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </React.Fragment>
  );
}

function renderContent(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      nodes.push(
        <Typography key={key++} variant="h3" fontWeight={700} mt={4} mb={1.5} component="h1">
          {line.slice(2)}
        </Typography>,
      );
    } else if (line.startsWith('## ')) {
      nodes.push(
        <Typography key={key++} variant="h5" fontWeight={600} mt={3} mb={1} component="h2">
          {line.slice(3)}
        </Typography>,
      );
    } else if (line.startsWith('### ')) {
      nodes.push(
        <Typography key={key++} variant="h6" fontWeight={600} mt={2} mb={0.5} component="h3">
          {line.slice(4)}
        </Typography>,
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      nodes.push(
        <Typography key={key++} component="li" variant="body1" sx={{ ml: 3, mb: 0.5 }}>
          {parseBold(line.slice(2))}
        </Typography>,
      );
    } else if (line.trim() === '') {
      nodes.push(<Box key={key++} mb={1} />);
    } else {
      nodes.push(
        <Typography key={key++} variant="body1" mb={0.5}>
          {parseBold(line)}
        </Typography>,
      );
    }
  }

  return nodes;
}

export default function PublicLegalPage({
  productSlug,
  type,
  backHref,
  staticContent,
  staticTitle,
}: {
  productSlug?: string;
  type: 'privacy' | 'terms';
  backHref: string;
  staticContent?: string;
  staticTitle?: string;
}) {
  const router = useRouter();
  const [data, setData] = React.useState<LegalData | null>(null);
  const [loading, setLoading] = React.useState(!staticContent);
  const [error, setError] = React.useState('');
  const requestedLanguage = React.useMemo(
    () => (Array.isArray(router.query.l) ? router.query.l[0] : router.query.l),
    [router.query.l],
  );

  React.useEffect(() => {
    if (!productSlug || staticContent) return;
    setLoading(true);
    setError('');

    const searchParams = new URLSearchParams();
    if (type === 'privacy' && requestedLanguage) {
      searchParams.set('l', requestedLanguage);
    }

    const url = `/api/products/public/${productSlug}/${type}${searchParams.size ? `?${searchParams.toString()}` : ''}`;

    fetch(getApiUrl(url))
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Page not found' : 'Failed to load page');
        }
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [productSlug, requestedLanguage, staticContent, type]);

  const resolvedContent = staticContent ?? data?.content;

  const pageTitle =
    staticTitle ??
    (data
      ? `${data.title} – ${data.productName}`
      : type === 'privacy'
        ? 'Privacy Policy'
        : 'Terms and Conditions');

  return (
    <BrandingCssVarsProvider>
      <Head title={pageTitle} description={data ? `${data.title} for ${data.productName}` : ''} />
      <AppHeader />
      <main id="main-content">
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Button component={Link} href={backHref} startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
            {data ? `Back to ${data.productName}` : 'Back'}
          </Button>

          {loading && (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && resolvedContent && (
            <Box component="article" sx={{ maxWidth: 720 }}>
              {renderContent(resolvedContent)}
            </Box>
          )}
        </Container>
      </main>
      <Section bg="gradient" cozy />
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
