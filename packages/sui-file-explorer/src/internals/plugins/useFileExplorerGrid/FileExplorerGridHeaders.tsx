import * as React from 'react';
import { useFileExplorerContext } from "../../FileExplorerProvider/useFileExplorerContext";
import { GridColumns, UseFileExplorerGridSignature } from "./useFileExplorerGrid.types";
import type { UseFileExplorerFilesSignature } from "../useFileExplorerFiles/useFileExplorerFiles.types";
import type { UseFileExplorerExpansionSignature } from "../useFileExplorerExpansion/useFileExplorerExpansion.types";
import { useFileExplorerGridHeaders } from "./useFileExplorerGridHeaders";
import { UseFileExplorerGridHeadersParameters } from "./useFileExplorerGridHeaders.types";
import { UseFileMinimalPlugins } from "../../models";
import { UseFileExplorerDndSignature } from '../useFileExplorerDnd/useFileExplorerDnd.types';
import { styled } from '@mui/material/styles';
import { HeaderCell } from "../../../File/FileLabel";

/**
 * Component for rendering grid headers in the file explorer.
 * @description Renders the headers of the file explorer grid.
 * @param {UseFileExplorerGridHeadersParameters} inProps - The props for the component.
 * @param {React.Ref<HTMLDivElement>} ref - Reference to the HTML div element.
 * @returns {JSX.Element} The grid headers component.
 * @example
 * <FileExplorerGridHeaders inProps={{ id: 'header-row' }} ref={divRef} />
 */
export const FileExplorerGridHeaders = React.forwardRef(function FileExplorerGridHeaders(inProps, ref) {
  const {
    instance,
  } = useFileExplorerContext<[UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature, UseFileExplorerGridSignature, UseFileExplorerDndSignature], readonly []>();

  const headerData = useFileExplorerGridHeaders<UseFileMinimalPlugins>({
    id: 'header-row',
    rootRef: ref,
  });
  const headers = instance.getHeaders();

  if (!headerData || !instance.gridEnabled() || Object.values(headers).length <= 1) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <React.Fragment />;
  }

  const { getRootProps } = headerData;
  const headerCells = Object.entries(headers).map(([columnName], index) => {
    return <HeaderCell id={inProps.id} columnName={`${columnName}`} key={`${columnName}-${index}`} className={`column-${columnName} col-${index}`} />;
  });
  return (
    <FileExplorerHeadersRoot style={{
      display: 'flex',
      width: '100%',
      borderBottom: '1px solid #444',
    }} {...getRootProps()}>
      {headerCells}
    </FileExplorerHeadersRoot>
  );
});

/**
 * Styled component for the root element of the file explorer grid headers.
 * @property {string} name - Name of the styled component.
 * @property {string} slot - Slot of the styled component.
 */
const FileExplorerHeadersRoot = styled('li', {
  name: 'MuiHeader',
  slot: 'Root',
})(() => {
  return {};
});