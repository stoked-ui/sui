import * as React from 'react';
import { useFileExplorerContext } from "../../FileExplorerProvider/useFileExplorerContext";
import { UseFileExplorerGridSignature } from "./useFileExplorerGrid.types";
import type{
  UseFileExplorerFilesSignature
} from "../useFileExplorerFiles/useFileExplorerFiles.types";
import type {
  UseFileExplorerExpansionSignature
} from "../useFileExplorerExpansion/useFileExplorerExpansion.types";
import { useFileExplorerGridHeaders } from "./useFileExplorerGridHeaders";
import { UseFileExplorerGridHeadersParameters } from "./useFileExplorerGridHeaders.types";
import { UseFileMinimalPlugins } from "../../models";
import { UseFileExplorerDndSignature } from '../useFileExplorerDnd/useFileExplorerDnd.types';
import { styled } from '../../zero-styled';
import { HeaderCell } from "../../../File/FileLabel";


export const FileExplorerHeadersRoot = styled('li', {
  name: 'MuiFile',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({

}));

export const FileExplorerGridHeaders = React.forwardRef(function FileExplorerGridHeaders(inProps: UseFileExplorerGridHeadersParameters & React.HTMLAttributes<HTMLDivElement> & React.HTMLProps<HTMLDivElement>, ref: React.Ref<HTMLDivElement>) {
  const {
    instance,
  } = useFileExplorerContext<[UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature, UseFileExplorerGridSignature, UseFileExplorerDndSignature], readonly []>();

  const headerData = useFileExplorerGridHeaders<UseFileMinimalPlugins>({
    id: 'header-row',
    rootRef: ref,
  })
  const headers = instance.getHeaders();
  if (!headerData || !instance.gridEnabled() || Object.values(headers).length <= 1)  {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <React.Fragment/>
  }

  const { getRootProps } = headerData;
  const headerCells = Object.entries(headers).map(([columnName], index) => {
    return <HeaderCell id={inProps.id} columnName={columnName} key={`${columnName}-${index}`} className={`column-${columnName} col-${index}`}/>;
  });
  return (
    <FileExplorerHeadersRoot style={{display: 'flex', width: '100%', borderBottom: '1px solid #444',}} {...getRootProps()}>
      {headerCells}
    </FileExplorerHeadersRoot>
  )
});
