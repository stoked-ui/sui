/**
 * File Explorer Grid Headers Component
 * 
 * This component is responsible for rendering the header cells of the file explorer grid.
 * It uses the `useFileExplorerContext` hook to retrieve the necessary data and context,
 * including the headers, instance, and grid state.
 */

import * as React from 'react';
import { useFileExplorerContext } from "../../FileExplorerProvider/useFileExplorerContext";
import { GridColumns, UseFileExplorerGridSignature } from "./useFileExplorerGrid.types";
import type {
  UseFileExplorerFilesSignature
} from "../useFileExplorerFiles/useFileExplorerFiles.types";
import type {
  UseFileExplorerExpansionSignature
} from "../useFileExplorerExpansion/useFileExplorerExpansion.types";
import { useFileExplorerGridHeaders } from "./useFileExplorerGridHeaders";
import { UseFileExplorerGridHeadersParameters } from "./useFileExplorerGridHeaders.types";
import { UseFileMinimalPlugins } from "../../models";
import { UseFileExplorerDndSignature } from '../useFileExplorerDnd/useFileExplorerDnd.types';
import { styled } from '@mui/material/styles';
import { HeaderCell } from "../../../File/FileLabel";

/**
 * Styled component for the File Explorer headers root.
 */
const FileExplorerHeadersRoot = styled('li', {
  name: 'MuiHeader',
  slot: 'Root',
})(() => {
  return {}
});

/**
 * File Explorer Grid Headers Component Props
 * 
 * This interface defines the props expected by the `FileExplorerGridHeaders` component.
 * It includes the `UseFileMinimalPlugins` type, as well as React HTML attributes.
 */
export interface FileExplorerGridHeadersProps extends UseFileExplorerGridHeadersParameters & React.HTMLAttributes<HTMLDivElement> & React.HTMLProps<HTMLDivElement>, UseFileMinimalPlugins {}

/**
 * File Explorer Grid Headers Component
 * 
 * This component is responsible for rendering the header cells of the file explorer grid.
 * It uses the `useFileExplorerContext` hook to retrieve the necessary data and context,
 * including the headers, instance, and grid state.
 */
export const FileExplorerGridHeaders = React.forwardRef(function (props: FileExplorerGridHeadersProps, ref: React.Ref<HTMLDivElement>) {
  /**
   * Context from the file explorer provider.
   */
  const { instance } = useFileExplorerContext<[UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature, UseFileExplorerGridSignature, UseFileExplorerDndSignature], readonly []>();

  /**
   * Data for rendering the header cells.
   */
  const headerData = useFileExplorerGridHeaders<UseFileMinimalPlugins>({
    id: 'header-row',
    rootRef: ref,
  })

  /**
   * Get the headers from the instance.
   */
  const headers = instance.getHeaders();

  if (!headerData || !instance.gridEnabled() || Object.values(headers).length <= 1) {
    return <React.Fragment/>
  }

  /**
   * Get the root props for rendering the header cells.
   */
  const { getRootProps } = headerData;

  /**
   * Map over the headers and render a `HeaderCell` component for each one.
   */
  const headerCells = Object.entries(headers).map(([columnName], index) => {
    return <HeaderCell id={props.id} columnName={`${columnName}`} key={`${columnName}-${index}`} className={`column-${columnName} col-${index}`} />;
  });

  return (
    <FileExplorerHeadersRoot style={{
      display: 'flex',
      width: '100%',
      borderBottom: '1px solid #444',
    }} {...getRootProps()}>
      {headerCells}
    </FileExplorerHeadersRoot>
  )
});