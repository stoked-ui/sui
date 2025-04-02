import * as React from 'react';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import dynamic from "next/dynamic";

const EditorComponent = dynamic(() => import('./EditorComponent'), {ssr: false });

export default function Index() {
  React.useEffect(() => {
    const manifest = document.querySelector("link [rel='manifest']") as HTMLLinkElement;
    if (manifest) {
      manifest.href = '/static/manifest.editor.pwa.json'
    }
  }, [])
  return (
    <BrandingCssVarsProvider>
      <EditorComponent />
    </BrandingCssVarsProvider>
  )
}

