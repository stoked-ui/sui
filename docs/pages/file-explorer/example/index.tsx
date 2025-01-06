import * as React from "react";
import { NoSsr } from "@mui/material";
import {FileBase, FileExplorer} from "@stoked-ui/file-explorer";
import BrandingCssVarsProvider from "../../../src/BrandingCssVarsProvider";
import {getDynamicFiles} from "../../../src/components/fileExplorer/data";

export default function Index() {
  return (
    <BrandingCssVarsProvider>
      <NoSsr>
        <FileExplorer
          items={getDynamicFiles()}
          defaultExpandedItems={['1', '1.1']}
          defaultSelectedItems="1.1"
          id={'file-explorer-hero'}
          alternatingRows
          dndInternal
          dndExternal
          dndTrash
          grid
          gridColumns={{
            duration: (item: FileBase) => item?.media?.duration || '',
            type: (item: FileBase) => item?.mediaType || '',
          }}
        />
      </NoSsr>
    </BrandingCssVarsProvider>
  )
}
