import * as React from 'react';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import TimelineShowcase from "../../../../src/components/home/TimelineShowcase";

export default function TimelineEditorDemo() {

  return (
    <BrandingCssVarsProvider>
      <TimelineShowcase />
    </BrandingCssVarsProvider>
  );
};


