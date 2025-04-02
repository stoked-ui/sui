import * as React from 'react';
import Box from '@mui/material/Box';
import {MediaFile} from "@stoked-ui/media-selector";
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';



function getItemDescendantsIds(item: MediaFile) {
  const ids: string[] = [];
  item.children?.forEach((child) => {
    ids.push(child.id);
    ids.push(...getItemDescendantsIds(child));
  });

  return ids;
}

export default function ParentChildrenSelectionRelationship() {
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const toggledItemRef = React.useRef<{ [itemId: string]: boolean }>({});
  const apiRef = useFileExplorerApiRef();

  const handleItemSelectionToggle = (
    event: React.SyntheticEvent,
    itemId: string,
    isSelected: boolean,
  ) => {
    toggledItemRef.current[itemId] = isSelected;
  };

  const handleSelectedItemsChange = (
    event: React.SyntheticEvent,
    newSelectedItems: string[],
  ) => {
    setSelectedItems(newSelectedItems);

    // Select / unselect the children of the toggled item
    const itemsToSelect: string[] = [];
    const itemsToUnSelect: { [itemId: string]: boolean } = {};
    Object.entries(toggledItemRef.current).forEach(([itemId, isSelected]) => {
      const item = apiRef.current!.getItem(itemId);
      if (isSelected) {
        itemsToSelect.push(...getItemDescendantsIds(item));
      } else {
        getItemDescendantsIds(item).forEach((descendantId) => {
          itemsToUnSelect[descendantId] = true;
        });
      }
    });

    const newSelectedItemsWithChildren = Array.from(
      new Set(
        [...newSelectedItems, ...itemsToSelect].filter(
          (itemId) => !itemsToUnSelect[itemId],
        ),
      ),
    );

    setSelectedItems(newSelectedItemsWithChildren);

    toggledItemRef.current = {};
  };

  return (
    <Box sx={{ minHeight: 352, minWidth: 290 }}>
      <FileExplorer
        multiSelect
        checkboxSelection
        apiRef={apiRef}
        items={NestedFiles}
        selectedItems={selectedItems}
        onSelectedItemsChange={handleSelectedItemsChange}
        onItemSelectionToggle={handleItemSelectionToggle}
      />
    </Box>
  );
}

