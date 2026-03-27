import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { BrandingCssVarsProvider } from '@stoked-ui/docs';
import { Link } from '@stoked-ui/docs';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import Section from 'docs/src/layouts/Section';
import Head from 'docs/src/modules/components/Head';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import GradientText from 'docs/src/components/typography/GradientText';
import { useAllProducts } from 'docs/src/products';

export default function ProductsOverview() {
  const products = useAllProducts();

  return (
    <BrandingCssVarsProvider>
      <Head
        title="Products – Stoked Consulting"
        description="Explore all products offered by Stoked Consulting."
      />
      <AppHeader />
      <main id="main-content">
        <Section bg="gradient" cozy>
          <SectionHeadline
            overline="Products"
            title={
              <Typography variant="h2">
                Everything we <GradientText>build and ship</GradientText>
              </Typography>
            }
            description="Tools, platforms, and components crafted by Stoked Consulting."
          />
        </Section>
        <Section bg="white">
          <Container>
            <Grid container spacing={3}>
              {products.live.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card
                    variant="outlined"
                    sx={(theme) => ({
                      height: '100%',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 1px ${theme.palette.primary.main}22`,
                      },
                    })}
                  >
                    <CardActionArea
                      component={Link}
                      href={`/products/${product.id}`}
                      sx={{ height: '100%', alignItems: 'flex-start', display: 'flex', flexDirection: 'column' }}
                    >
                      <CardContent sx={{ flex: 1 }}>
                        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 32, height: 32, flexShrink: 0 }}>
                            {product.icon}
                          </Box>
                          <Typography variant="h6" fontWeight={700}>
                            {product.name}
                          </Typography>
                          {product.data.prerelease && product.data.prerelease !== 'none' && (
                            <Chip
                              label={product.data.prerelease.toUpperCase()}
                              size="small"
                              color={product.data.prerelease === 'alpha' ? 'error' : 'warning'}
                              sx={{ fontWeight: 700 }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                          {product.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Section>
      </main>
      <Section bg="gradient" cozy />
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
