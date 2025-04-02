import * as React from 'react';
import Box from '@mui/material/Box';

import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

function getItemDescendantsIds(item) {
  const ids = [];
  item.children?.forEach((child) => {
    ids.push(child.id);
    ids.push(...getItemDescendantsIds(child));
  });

  return ids;
}

export default function ParentChildrenSelectionRelationship() {
  const [selectedItems, setSelectedItems] = React.useState([]);
  const toggledItemRef = React.useRef({});
  const apiRef = useFileExplorerApiRef();

  const handleItemSelectionToggle = (event, itemId, isSelected) => {
    toggledItemRef.current[itemId] = isSelected;
  };

  const handleSelectedItemsChange = (event, newSelectedItems) => {
    setSelectedItems(newSelectedItems);

    // Select / unselect the children of the toggled item
    const itemsToSelect = [];
    const itemsToUnSelect = {};
    Object.entries(toggledItemRef.current).forEach(([itemId, isSelected]) => {
      const item = apiRef.current.getItem(itemId);
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

