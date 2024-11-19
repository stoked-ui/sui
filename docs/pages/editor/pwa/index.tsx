import * as React from 'react';
import Editor, { Controllers, EditorProvider } from "@stoked-ui/editor";
import EditorExample from 'docs/src/components/showcase/EditorExample';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';

export default function Index() {
  React.useEffect(() => {
    const manifest = document.querySelector("link [rel='manifest']") as HTMLLinkElement;
    if (manifest) {
      manifest.href = '/static/manifest.editor.pwa.json'
    }
  }, [])
  return (
    <BrandingCssVarsProvider>
      <EditorProvider id={'stoked-ui-editor-example'} controllers={Controllers}>
        <Editor  file={EditorExample} allControls />
      </EditorProvider>
    </BrandingCssVarsProvider>
  )
}
