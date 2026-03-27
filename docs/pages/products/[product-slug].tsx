import * as React from 'react';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import { Link } from '@stoked-ui/docs';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import Section from 'docs/src/layouts/Section';
import Head from 'docs/src/modules/components/Head';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: process.env.OPEN_NEXT_BUILD === 'true' ? 'blocking' : false,
  };
};

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};

interface Feature {
  name: string;
  description: string;
  id: string;
}

interface PublicProduct {
  _id: string;
  productId: string;
  name: string;
  fullName?: string;
  description: string;
  url: string;
  features: Feature[];
  icon: string;
  hideProductFeatures?: boolean;
  prerelease?: 'alpha' | 'beta' | 'none';
}

interface PublicPage {
  _id: string;
  slug: string;
  title: string;
  order: number;
}

export default function PublicProductDetail() {
  const router = useRouter();
  const productSlug = router.query['product-slug'];
  const [product, setProduct] = React.useState<PublicProduct | null>(null);
  const [pages, setPages] = React.useState<PublicPage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!productSlug || typeof productSlug !== 'string') return;

    setLoading(true);
    fetch(getApiUrl(`/api/products/public/${productSlug}`))
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Product not found' : 'Failed to load product');
        return res.json();
      })
      .then((data) => {
        setProduct(data.product);
        setPages(data.pages || []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [productSlug]);

  return (
    <BrandingCssVarsProvider>
      <Head
        title={product ? `${product.name} – Products` : 'Product – Stoked Consulting'}
        description={product?.description ?? ''}
      />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          <Button
            component={Link}
            href="/products"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 3 }}
          >
            All Products
          </Button>

          {loading && (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && (
            <Alert severity="error">{error}</Alert>
          )}

          {!loading && !error && product && (
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                <Typography variant="h3" component="h1" fontWeight={700}>
                  {product.fullName || product.name}
                </Typography>
                {product.prerelease && product.prerelease !== 'none' && (
                  <Chip
                    label={product.prerelease.toUpperCase()}
                    size="small"
                    color={product.prerelease === 'alpha' ? 'error' : 'warning'}
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 640, whiteSpace: 'pre-line' }}>
                {product.description}
              </Typography>

              {!product.hideProductFeatures && product.features.length > 0 && (
                <Box mb={4}>
                  <Typography variant="h5" fontWeight={700} mb={2}>Features</Typography>
                  <Paper variant="outlined">
                    <List disablePadding>
                      {product.features.map((feature, i) => (
                        <React.Fragment key={feature.id}>
                          {i > 0 && <Divider />}
                          <ListItem>
                            <ListItemText
                              primary={
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <span>{feature.name}</span>
                                  <Chip label={feature.id} size="small" variant="outlined" />
                                </Stack>
                              }
                              secondary={feature.description}
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Box>
              )}

              {pages.length > 0 && (
                <Box>
                  <Typography variant="h5" fontWeight={700} mb={2}>Documentation</Typography>
                  <Paper variant="outlined">
                    <List disablePadding>
                      {pages.map((page, i) => (
                        <React.Fragment key={page._id}>
                          {i > 0 && <Divider />}
                          <ListItem
                            component={Link}
                            href={`/products/${productSlug}/${page.slug}`}
                            sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                          >
                            <ListItemText primary={page.title} />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Box>
              )}
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
