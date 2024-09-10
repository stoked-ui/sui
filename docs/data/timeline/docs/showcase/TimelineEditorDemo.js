import * as React from 'react';
import Showcase from './Showcase';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';

export default function TimelineEditorDemo() {
  return (
    <BrandingCssVarsProvider>
      <Showcase />
    </BrandingCssVarsProvider>
  );
}
