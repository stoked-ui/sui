import * as React from 'react';
import Showcase from './Showcase';
import BrandingCssVarsProvider from '@stoked-ui/docs/branding/BrandingCssVarsProvider';

export default function TimelineEditorDemo() {

  return (
    <BrandingCssVarsProvider>
      <Showcase />
    </BrandingCssVarsProvider>
  );
};

