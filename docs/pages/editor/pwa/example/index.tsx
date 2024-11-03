import * as React from 'react';
import {EditorProvider} from "@stoked-ui/editor";
import Editor, { Controllers } from "@stoked-ui/editor";
import EditorExample from 'docs/src/components/showcase/EditorExample';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';
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
        <EditorProvider id={'stoked-ui-editor-example'} controllers={Controllers}
                        file={EditorExample}>
          <Editor/>
        </EditorProvider>
    </React.Fragment>
    </BrandingCssVarsProvider>
  )
}
