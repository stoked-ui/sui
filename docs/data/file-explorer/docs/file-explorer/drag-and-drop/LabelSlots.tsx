import * as React from 'react';
import Box from '@mui/material/Box';
import {
  File,
  FileLabel,
  FileProps,
} from '@stoked-ui/file-explorer/File';
import { MediaFile, namedId } from '@stoked-ui/media-selector';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { UseFileContentSlotOwnProps } from '@stoked-ui/file-explorer/useFile';
import { useFileUtils } from '@stoked-ui/file-explorer/hooks';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

interface CustomLabelProps {
  children: string;
  className: string;
  onChange: (value: string) => void;
}

function CustomLabel(props: CustomLabelProps) {
  const { children, onChange, ...other } = props;

  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [value, setValue] = React.useState('');
  const editingLabelRef = React.useRef<HTMLInputElement>(null);

  const handleLabelDoubleClick = () => {
    setIsEditing(true);
    setValue(children);
  };

  const handleEditingLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleEditingLabelKeyDown = (event: React.KeyboardEvent) => {
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

const TreeItemContext = React.createContext<{
  onLabelValueChange: (itemId: string, label: string) => void;
}>({ onLabelValueChange: () => {} });

const CustomTreeItem = React.forwardRef(
  (props: FileProps, ref: React.Ref<HTMLLIElement>) => {
    const { interactions } = useFileUtils({
      itemId: props.itemId ?? props.id ?? namedId('treeItem'),
      children: props.children,
      status: null
    });

    const { onLabelValueChange } = React.useContext(TreeItemContext);

    const handleLabelValueChange = (newLabel: string) => {
      onLabelValueChange(props.itemId ?? props.id ?? namedId('treeItem'), newLabel);
    };

    const handleContentClick: UseFileContentSlotOwnProps['onClick'] = (
      event,
    ) => {
      event.defaultMuiPrevented = true;
      interactions.handleSelection(event);
    };

    const handleIconContainerClick = (event: React.MouseEvent) => {
      interactions.handleExpansion(event);
    };

    return (
      <File
        ref={ref}
        {...props}
        slots={{
          name: CustomLabel,
        }}
        slotProps={{
          content: { onClick: handleContentClick },
          iconContainer: { onClick: handleIconContainerClick },
          name: {
            onChange: handleLabelValueChange,
          } as any,
        }}
      />
    );
  },
);


const DEFAULT_EXPANDED_ITEMS = ['Docs'];

export default function LabelSlots() {
  const [products, setProducts] = React.useState(NestedFiles);

  const context = React.useMemo(
    () => ({
      onLabelValueChange: (itemId: string, name: string) =>
        setProducts((prev) => {
          const walkTree = (item: MediaFile): MediaFile => {
            if (item.id === itemId) {
              return { ...item, name };
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
