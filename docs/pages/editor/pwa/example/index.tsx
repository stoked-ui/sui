import * as React from 'react';
import {EditorProvider} from "@stoked-ui/editor";
import Editor, { Controllers } from "@stoked-ui/editor";
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';

export default function Index() {
  React.useEffect(() => {
    const manifest = document.querySelector("link [rel='manifest']") as HTMLLinkElement;
    if (manifest) {
      manifest.href = ''
    }
  }, [])
  return (
    <BrandingCssVarsProvider>
      <React.Fragment>
        <Head title="Stoked UI Editor - Editor Commercial"
              description="Create videos, on the web, without uploading anything, go!"
              card="/static/social-previews/editor-preview.png"
        >
          <link rel="manifest" href="/static/manifest.editor.pwa.example.json" key={'manifest'}/>
        </Head>
        <EditorProvider id={'pwa-example'} controllers={Controllers} >
          <Editor
            record
            /* file={EditorExample}
  */            /* fileUrl={'/static/editor/stoked-ui.sue'} */
            fileUrl={'/static/editor/stoked-ui-3.suer'}
          />
        </EditorProvider>
    </React.Fragment>
    </BrandingCssVarsProvider>
  )
}
