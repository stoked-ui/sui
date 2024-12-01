import * as React from "react";
import Editor, {Controllers, EditorProvider} from "@stoked-ui/editor";

function EditorComponent() {
  return (
    <EditorProvider controllers={Controllers} >
      <Editor id={'stoked-ui-editor-pwa'} fullscreen />
    </EditorProvider>)
}

export default EditorComponent;
