import React from "react";
import { MuiFileInput } from "mui-file-input";
import { MediaProvider } from "../../src";

export const MuiDemo: React.FC = () => {
  const [files, setFiles] = React.useState<File[]>([])

  const handleChange = (newFiles: File[]) => {
    setFiles(newFiles)
  }

  return (
    <MediaProvider>
      <MuiFileInput value={files} multiple onChange={handleChange} />
    </MediaProvider>
  )
}
