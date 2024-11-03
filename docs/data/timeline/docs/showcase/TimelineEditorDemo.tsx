import * as React from 'react';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';
import TimelineShowcase from "../../../../src/components/home/TimelineShowcase";

export default function TimelineEditorDemo() {

  return (
    <BrandingCssVarsProvider>
      <TimelineShowcase />
    </BrandingCssVarsProvider>
  );
};

