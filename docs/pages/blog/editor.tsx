import * as React from 'react';
import Divider from '@mui/material/Divider';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';
import BlogPostList from 'docs/src/modules/components/BlogPostList';

export default function BlogEditorPage() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Manage Blog Posts - SUI"
        description="Manage your blog posts"
        disableAlternateLocale
      />
      <AppHeader />
      <main id="main-content">
        <BlogPostList />
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
