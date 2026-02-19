import * as React from 'react';
import { useRouter } from 'next/router';
import Divider from '@mui/material/Divider';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';
import BlogEditor from 'docs/src/modules/components/BlogEditor';

export default function BlogEditorSlugPage() {
  const router = useRouter();
  const { slug } = router.query;
  const slugStr = typeof slug === 'string' ? slug : undefined;

  return (
    <BrandingCssVarsProvider>
      <Head
        title={slugStr ? `Edit: ${slugStr} - SUI` : 'Edit Blog Post - SUI'}
        description="Edit an existing blog post"
        disableAlternateLocale
      />
      <AppHeader />
      <main id="main-content">
        <BlogEditor initialSlug={slugStr} />
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
