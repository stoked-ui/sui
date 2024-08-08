# FileWithPath

<p class="description">The FileWithPath object replaces the File object returned from file input controls and drop targets.</p>

:::info
If this is your first time encountering the FileWithPath object, you should check out the original code it was modified from in [@react-dropzone's file-selector library](https://github.com/react-dropzone/file-selector), in the [file.ts file](https://github.com/react-dropzone/file-selector/blob/master/src/file.ts).
:::

## Usage

### File Input Control

```js
import { FileWithPath } from "@stoked-ui/media-selector";

const input = document.getElementById('myInput');
input.addEventListener('change', async evt => {
  const files = await FileWithPath.from(evt);
  console.log(files);
});
```

### React Component

```js
import React, { useState } from 'react';
import { FileWithPath } from "@stoked-ui/media-selector";

const FileComponent = () => {
  const [files, setFiles] = useState(null);
  const [fileName, setFileName] = useState('')

  const handleChange = (event) => {
    const newFiles = FileWithPath(event);
    if(newFiles.length) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      const name = Array.from(updatedFiles) .map((f) => { return f.name; }) .join(", ");
      setFileName(name);
    }
  }

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <label class="custom-file-label" for="customFile">{fileName || 'Choose File' }</label>
    </div>
  )
}
```

## What's next

- Check the Media Selector Roadmap (soon) to see what's coming next for this library.
- Check the Video Editor Roadmap to see the larger context.
