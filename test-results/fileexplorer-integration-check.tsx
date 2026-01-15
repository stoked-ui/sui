/**
 * FileExplorer Integration Type Check
 *
 * This file validates that all FileExplorer imports used by sui-editor
 * compile successfully with the migrated FileExplorer implementation.
 */

import * as React from "react";
import {
  ExplorerPanelProps,
  FileBase,
  FileExplorerTabs,
  FileExplorerTabsProps,
  FileExplorerProps,
} from "@stoked-ui/file-explorer";

// Validate FileExplorerTabsProps type compatibility
const testProps: FileExplorerTabsProps = {
  role: 'file-explorer-tabs',
  id: 'editor-file-explorer-tabs',
  setTabName: (name: string) => {},
  tabNames: ['Projects', 'Track Files'],
  tabData: {},
  currentTab: { name: '', files: [] },
  variant: 'drawer',
};

// Validate FileBase type for event handlers
const testHandler = (clickedFile: FileBase) => {
  console.log(clickedFile.id, clickedFile.name, clickedFile.mediaType);
};

// Validate ExplorerPanelProps structure
const testPanelProps: ExplorerPanelProps = {
  name: 'Projects',
  items: [],
  gridColumns: {
    version: (item: FileBase) => item?.version?.toString() || '',
    type: (item: FileBase) => item?.mediaType || '',
  },
  onItemDoubleClick: testHandler,
};

// Validate component can be rendered
const TestComponent: React.FC = () => {
  return (
    <FileExplorerTabs
      {...testProps}
    />
  );
};

export default TestComponent;
