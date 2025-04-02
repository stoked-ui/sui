import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { File, FileLabel } from '@stoked-ui/file-explorer/File';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';

import { useFileUtils } from '@stoked-ui/file-explorer/hooks';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

function CustomLabel(props) {
  const { children, onChange, ...other } = props;

  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState('');
  const editingLabelRef = React.useRef(null);

  const handleLabelDoubleClick = () => {
    setIsEditing(true);
    setValue(children);
  };

  const handleEditingLabelChange = (event) => {
    setValue(event.target.value);
  };

  const handleEditingLabelKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.stopPropagation();
      setIsEditing(false);
      onChange(value);
    } else if (event.key === 'Escape') {
      event.stopPropagation();
      setIsEditing(false);
    }
  };

  React.useEffect(() => {
    if (isEditing) {
      editingLabelRef.current?.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <input
        value={value}
        onChange={handleEditingLabelChange}
        onKeyDown={handleEditingLabelKeyDown}
        ref={editingLabelRef}
      />
    );
  }

  return (
    <FileLabel {...other} onDoubleClick={handleLabelDoubleClick}>
      {children}
    </FileLabel>
  );
}

CustomLabel.propTypes = {
  children: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const TreeItemContext = React.createContext({ onLabelValueChange: () => {} });

const CustomTreeItem = React.forwardRef((props, ref) => {
  const { interactions } = useFileUtils({
    itemId: props.itemId,
    children: props.children,
  });

  const { onLabelValueChange } = React.useContext(TreeItemContext);

  const handleLabelValueChange = (newLabel) => {
    onLabelValueChange(props.itemId, newLabel);
  };

  const handleContentClick = (event) => {
    event.defaultMuiPrevented = true;
    interactions.handleSelection(event);
  };

  const handleIconContainerClick = (event) => {
    interactions.handleExpansion(event);
  };

  return (
    <File
      ref={ref}
      {...props}
      slots={{
        label: CustomLabel,
      }}
      slotProps={{
        content: { onClick: handleContentClick },
        iconContainer: { onClick: handleIconContainerClick },
        label: {
          onChange: handleLabelValueChange,
        },
      }}
    />
  );
});

CustomTreeItem.propTypes = {
  /**
   * The content of the component.
   */
  children: PropTypes.node,
};

const DEFAULT_EXPANDED_ITEMS = ['Docs'];

export default function LabelSlots() {
  const [products, setProducts] = React.useState(NestedFiles);

  const context = React.useMemo(
    () => ({
      onLabelValueChange: (itemId, label) =>
        setProducts((prev) => {
          const walkTree = (item) => {
            if (item.id === itemId) {
              return { ...item, label };
            }
            if (item.children) {
              return { ...item, children: item.children.map(walkTree) };
            }

            return item;
          };

          return prev.map(walkTree);
        }),
    }),
    [],
  );

  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <TreeItemContext.Provider value={context}>
        <FileExplorer
          items={products}
          aria-label="customized"
          defaultExpandedItems={DEFAULT_EXPANDED_ITEMS}
          slots={{ item: CustomTreeItem }}
        />
      </TreeItemContext.Provider>
    </Box>
  );
}

