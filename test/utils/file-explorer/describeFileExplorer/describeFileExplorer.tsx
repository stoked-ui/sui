import * as React from 'react';
import createDescribe from '@stoked-ui/internal-test-utils/createDescribe';
import { createRenderer, ErrorBoundary } from '@stoked-ui/internal-test-utils';
import { FileExplorer } from '@mui/x-file-explorer/FileExplorer';
import { FileExplorerBasic } from '@mui/x-file-explorer/FileExplorerBasic';
import { FileExplorerItem, fileListItemClasses } from '@mui/x-file-explorer/FileExplorerItem';
import { FileExplorerAnyPluginSignature, FileExplorerPublicAPI } from '@mui/x-file-explorer/internals/models';
import { MuiRenderResult } from '@stoked-ui/internal-test-utils/createRenderer';
import {
  DescribeFileExplorerTestRunner,
  DescribeFileExplorerRenderer,
  DescribeFileExplorerJSXRenderer,
  DescribeFileExplorerItem,
  DescribeFileExplorerRendererUtils,
} from './describeFileExplorer.types';

const innerDescribeFileExplorer = <TSignatures extends FileExplorerAnyPluginSignature[]>(
  message: string,
  testRunner: DescribeFileExplorerTestRunner<TSignatures>,
): void => {
  const { render } = createRenderer();

  const getUtils = (result: MuiRenderResult): DescribeFileExplorerRendererUtils => {
    const getRoot = () => result.getByRole('tree');

    const getAllFileExplorerItemIds = () =>
      result.queryAllByRole('treeitem').map((item) => item.dataset.testid!);

    const getFocusedItemId = () => {
      const activeElement = document.activeElement;
      if (!activeElement || !activeElement.classList.contains(fileListItemClasses.root)) {
        return null;
      }

      return (activeElement as HTMLElement).dataset.testid!;
    };

    const getItemRoot = (id: string) => result.getByTestId(id);

    const getItemContent = (id: string) =>
      getItemRoot(id).querySelector<HTMLElement>(`.${fileListItemClasses.content}`)!;

    const getItemCheckbox = (id: string) =>
      getItemRoot(id).querySelector<HTMLElement>(`.${fileListItemClasses.checkbox}`)!;

    const getItemCheckboxInput = (id: string) =>
      getItemCheckbox(id).querySelector<HTMLInputElement>(`input`)!;

    const getItemLabel = (id: string) =>
      getItemRoot(id).querySelector<HTMLElement>(`.${fileListItemClasses.label}`)!;

    const getItemIconContainer = (id: string) =>
      getItemRoot(id).querySelector<HTMLElement>(`.${fileListItemClasses.iconContainer}`)!;

    const isItemExpanded = (id: string) => getItemRoot(id).getAttribute('aria-expanded') === 'true';

    const isItemSelected = (id: string) => getItemRoot(id).getAttribute('aria-selected') === 'true';

    const getSelectedFileExplorerItems = () =>
      result
        .queryAllByRole('treeitem')
        .filter((item) => item.getAttribute('aria-selected') === 'true')
        .map((item) => item.dataset.testid!);

    return {
      getRoot,
      getAllFileExplorerItemIds,
      getFocusedItemId,
      getItemRoot,
      getItemContent,
      getItemCheckbox,
      getItemCheckboxInput,
      getItemLabel,
      getItemIconContainer,
      isItemExpanded,
      isItemSelected,
      getSelectedFileExplorerItems,
    };
  };

  const jsxRenderer: DescribeFileExplorerJSXRenderer = (element) => {
    const result = render(element);
    return getUtils(result);
  };

  const createRendererForComponentWithItemsProp = (
    FileExplorerComponent: typeof FileExplorer,
    FileExplorerItemComponent: typeof FileExplorerItem,
  ) => {
    const objectRenderer: DescribeFileExplorerRenderer<TSignatures> = ({
      items: rawItems,
      withErrorBoundary,
      slotProps,
      ...other
    }) => {
      const items = rawItems as readonly DescribeFileExplorerItem[];
      const apiRef = { current: undefined };

      const jsx = (
        <FileExplorerComponent
          items={items}
          apiRef={apiRef}
          slots={{ item: FileExplorerItemComponent }}
          slotProps={{
            ...slotProps,
            item: (ownerState) =>
              ({
                ...slotProps?.item,
                'data-testid': ownerState.itemId,
              }) as any,
          }}
          getItemLabel={(item) => {
            if (item.label) {
              if (typeof item.label !== 'string') {
                throw new Error('Only use string labels when testing FileExplorer(Pro)');
              }

              return item.label;
            }

            return item.id;
          }}
          isItemDisabled={(item) => !!item.disabled}
          {...other}
        />
      );

      const result = render(withErrorBoundary ? <ErrorBoundary>{jsx}</ErrorBoundary> : jsx);

      return {
        setProps: result.setProps,
        setItems: (newItems) => result.setProps({ items: newItems }),
        apiRef: apiRef as unknown as { current: FileExplorerPublicAPI<TSignatures> },
        ...getUtils(result),
      };
    };

    return {
      render: objectRenderer,
      renderFromJSX: jsxRenderer,
    };
  };

  const createRenderersForComponentWithJSXItems = (
    FileExplorerComponent: typeof FileExplorerBasic,
    FileExplorerItemComponent: typeof FileExplorerItem,
  ) => {
    const objectRenderer: DescribeFileExplorerRenderer<TSignatures> = ({
      items: rawItems,
      withErrorBoundary,
      slots,
      slotProps,
      ...other
    }) => {
      const items = rawItems as readonly DescribeFileExplorerItem[];
      const Item = slots?.item ?? FileExplorerItemComponent;
      const apiRef = { current: undefined };

      const renderItem = (item: DescribeFileExplorerItem) => (
        <Item
          itemId={item.id}
          label={item.label ?? item.id}
          disabled={item.disabled}
          data-testid={item.id}
          key={item.id}
          {...slotProps?.item}
        >
          {item.children?.map(renderItem)}
        </Item>
      );

      const jsx = (
        <FileExplorerComponent slots={slots} slotProps={slotProps} apiRef={apiRef} {...other}>
          {items.map(renderItem)}
        </FileExplorerComponent>
      );

      const result = render(withErrorBoundary ? <ErrorBoundary>{jsx}</ErrorBoundary> : jsx);

      return {
        setProps: result.setProps,
        setItems: (newItems) => result.setProps({ children: newItems.map(renderItem) }),
        apiRef: apiRef as unknown as { current: FileExplorerPublicAPI<TSignatures> },
        ...getUtils(result),
      };
    };

    return {
      render: objectRenderer,
      renderFromJSX: jsxRenderer,
    };
  };

  describe(message, () => {
    describe('FileExplorer + FileExplorerItem', () => {
      testRunner({
        ...createRendererForComponentWithItemsProp(FileExplorer, FileExplorerItem),
        setup: 'FileExplorer + FileExplorerItem',
        fileListComponentName: 'FileExplorer',
        fileListItemComponentName: 'FileExplorerItem',
        FileExplorerComponent: FileExplorer,
        FileExplorerItemComponent: FileExplorerItem,
      });
    });

    describe('FileExplorer + FileExplorerItem', () => {
      testRunner({
        ...createRendererForComponentWithItemsProp(FileExplorer, FileExplorerItem),
        setup: 'FileExplorer + FileExplorerItem',
        fileListComponentName: 'FileExplorer',
        fileListItemComponentName: 'FileExplorerItem',
        FileExplorerComponent: FileExplorer,
        FileExplorerItemComponent: FileExplorerItem,
      });
    });

    describe('FileExplorerBasic + FileExplorerItem', () => {
      testRunner({
        ...createRenderersForComponentWithJSXItems(FileExplorerBasic, FileExplorerItem),
        setup: 'FileExplorerBasic + FileExplorerItem',
        fileListComponentName: 'FileExplorerBasic',
        fileListItemComponentName: 'FileExplorerItem',
        FileExplorerComponent: FileExplorerBasic,
        FileExplorerItemComponent: FileExplorerItem,
      });
    });

    describe('FileExplorerBasic + FileExplorerItem', () => {
      testRunner({
        ...createRenderersForComponentWithJSXItems(FileExplorerBasic, FileExplorerItem),
        setup: 'FileExplorerBasic + FileExplorerItem',
        fileListComponentName: 'FileExplorerBasic',
        fileListItemComponentName: 'FileExplorerItem',
        FileExplorerComponent: FileExplorerBasic,
        FileExplorerItemComponent: FileExplorerItem,
      });
    });
  });
};

type Params<TSignatures extends FileExplorerAnyPluginSignature[]> = [
  string,
  DescribeFileExplorerTestRunner<TSignatures>,
];

type DescribeFileExplorer = {
  <TSignatures extends FileExplorerAnyPluginSignature[]>(...args: Params<TSignatures>): void;
  skip: <TSignatures extends FileExplorerAnyPluginSignature[]>(...args: Params<TSignatures>) => void;
  only: <TSignatures extends FileExplorerAnyPluginSignature[]>(...args: Params<TSignatures>) => void;
};

/**
 * Describe tests for the Tree View that will be executed with the following setups:
 * - FileExplorer + FileExplorerItem
 * - FileExplorer + FileExplorerItem
 * - RichFileExplorerPro + FileExplorerItem
 * - RichFileExplorerPro + FileExplorerItem
 * - FileExplorerBasic + FileExplorerItem
 * - FileExplorerBasic + FileExplorerItem
 *
 * Is used as follows:
 *
 * ```
 * describeFileExplorer('Title of the suite', ({ render }) => {
 *   it('should do something', () => {
 *     const { getItemRoot } = render({
 *       items: [{ id: '1', children: [{ id: '1.1' }] }],
 *       defaultExpandedItems: ['1'],
 *     });
 *   });
 * });
 * ```
 *
 * Several things to note:
 * - The `render` function takes an array of items, even for `FileExplorerBasic`
 * - Except for `items`, all the other properties passed to `render` will be forwarded to the Tree View as props
 * - If an item has no label, its `id` will be used as the label
 */
export const describeFileExplorer = createDescribe(
  'describeFileExplorer',
  innerDescribeFileExplorer,
) as DescribeFileExplorer;
