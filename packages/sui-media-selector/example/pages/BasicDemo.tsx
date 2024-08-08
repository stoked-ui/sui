import * as React from 'react';
import { useMediaFileContext } from "../../src";

export const BasicDemo = () => {
  const editorCtx = useMediaFileContext();
  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      editorCtx.addFiles(event.target.files).catch((error) => {
        console.error('Failed to add files', error);
      });
    }
  }
  return (
    <div>
      <h1>Material UI Demo</h1>
      <input color="primary" type={'file'} onChange={(event) => onFileInputChange(event)}>
        Hello World
      </input>
    </div>
  );
}
