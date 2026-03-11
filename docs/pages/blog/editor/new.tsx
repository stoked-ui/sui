import * as React from 'react';
import Divider from '@mui/material/Divider';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';
import BlogEditor from 'docs/src/modules/components/BlogEditor';

export default function BlogEditorNewPage() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="New Blog Post - SUI"
        description="Create a new blog post"
        disableAlternateLocale
      />
      <AppHeader />
      <main id="main-content">
        <BlogEditor />
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
