import * as React from 'react';
import {
  MergeSignaturesProperty,
  FileExplorerAnyPluginSignature,
  FileExplorerPublicAPI,
} from '@mui/x-file-explorer/internals/models';
import { FileExplorerItemProps } from '@mui/x-file-explorer/FileExplorerItem';

export type DescribeFileExplorerTestRunner<TSignatures extends FileExplorerAnyPluginSignature[]> = (
  params: DescribeFileExplorerTestRunnerParams<TSignatures>,
) => void;

export interface DescribeFileExplorerRendererUtils {
  /**
   * Returns the `root` slot of the Tree View.
   * @returns {HTMLElement} `root` slot of the Tree View.
   */
  getRoot: () => HTMLElement;
  /**
   * Returns the itemId of the focused item.
   * If the focused element is not an item, returns `null`.
   * @returns {string | null} The itemId of the focused item.
   */
  getFocusedItemId: () => string | null;
  /**
   * Returns the item id of all the items currently rendered.
   * @returns {HTMLElement[]} List of the item id of all the items currently rendered.
   */
  getAllFileExplorerItemIds: () => string[];
  /**
   * Returns the `root` slot of the item with the given id.
   * @param {string} id The id of the item to retrieve.
   * @returns {HTMLElement} `root` slot of the item with the given id.
   */
  getItemRoot: (id: string) => HTMLElement;
  /**
   * Returns the `content` slot of the item with the given id.
   * @param {string} id The id of the item to retrieve.
   * @returns {HTMLElement} `content` slot of the item with the given id.
   */
  getItemContent: (id: string) => HTMLElement;
  /**
   * Returns the `checkbox` slot of the item with the given id.
   * @param {string} id The id of the item to retrieve.
   * @returns {HTMLElement} `checkbox` slot of the item with the given id.
   */
  getItemCheckbox: (id: string) => HTMLElement;
  /**
   * Returns the input element inside the `checkbox` slot of the item with the given id.
   * @param {string} id The id of the item to retrieve.
   * @returns {HTMLInputElement} input element inside the `checkbox` slot of the item with the given id.
   */
  getItemCheckboxInput: (id: string) => HTMLInputElement;
  /**
   * Returns the `label` slot of the item with the given id.
   * @param {string} id The id of the item to retrieve.
   * @returns {HTMLElement} `label` slot of the item with the given id.
   */
  getItemName: (id: string) => HTMLElement;
  /**
   * Returns the `iconContainer` slot of the item with the given id.
   * @param {string} id The id of the item to retrieve.
   * @returns {HTMLElement} `iconContainer` slot of the item with the given id.
   */
  getItemIconContainer: (id: string) => HTMLElement;
  /**
   * Checks if an item is expanded.
   * Uses the `aria-expanded` attribute to check the expansion.
   * @param {string} id The id of the item to check.
   * @returns {boolean} `true` if the item is expanded, `false` otherwise.
   */
  isItemExpanded: (id: string) => boolean;
  /**
   * Checks if an item is selected.
   * Uses the `aria-selected` attribute to check the selected.
   * @param {string} id The id of the item to check.
   * @returns {boolean} `true` if the item is selected, `false` otherwise.
   */
  isItemSelected: (id: string) => boolean;
  /**
   * Returns the item id of all the items currently selected.
   * @returns {HTMLElement[]} List of the item id of all the items currently selected.
   */
  getSelectedFileExplorerItems: () => string[];
}

export interface DescribeFileExplorerRendererReturnValue<
  TSignatures extends FileExplorerAnyPluginSignature[],
> extends DescribeFileExplorerRendererUtils {
  /**
   * The ref object that allows Tree View manipulation.
   */
  apiRef: { current: FileExplorerPublicAPI<TSignatures> };
  /**
   * Passes new props to the Tree View.
   * @param {Partial<FileExplorerUsedParams<TSignatures>>} props A subset of the props accepted by the Tree View.
   */
  setProps: (props: Partial<MergeSignaturesProperty<TSignatures, 'params'>>) => void;
  /**
   * Passes new items to the Tree View.
   * @param {readyonly DescribeFileExplorerItem[]} items The new items.
   */
  setItems: (items: readonly DescribeFileExplorerItem[]) => void;
}

export type DescribeFileExplorerRenderer<TSignatures extends FileExplorerAnyPluginSignature[]> = <
  R extends DescribeFileExplorerItem,
>(
  params: {
    items: readonly R[];
    /**
     * If `true`, the Tree View will be wrapped with an error boundary.
     */
    withErrorBoundary?: boolean;
  } & Omit<MergeSignaturesProperty<TSignatures, 'params'>, 'slots' | 'slotProps'> & {
      slots?: MergeSignaturesProperty<TSignatures, 'slots'> & {
        item?: React.ElementType<FileExplorerItemProps>;
      };
      slotProps?: MergeSignaturesProperty<TSignatures, 'slotProps'> & {
        item?: Partial<FileExplorerItemProps>;
      };
    },
) => DescribeFileExplorerRendererReturnValue<TSignatures>;

export type DescribeFileExplorerJSXRenderer = (
  element: React.ReactElement,
) => DescribeFileExplorerRendererUtils;

type FileExplorerComponentName = 'FileExplorer' | 'RichFileExplorerPro' | 'FileExplorerBasic';
type FileExplorerItemComponentName = 'FileExplorerItem';

interface DescribeFileExplorerTestRunnerParams<TSignatures extends FileExplorerAnyPluginSignature[]> {
  /**
   * Render the Tree View with its props and items defined as parameters of the "render" function as follows:
   *
   * ```ts
   * const response = render({
   *   items: [{ id: '1', children: [] }],
   *   defaultExpandedItems: ['1'],
   * });
   * ```
   */
  render: DescribeFileExplorerRenderer<TSignatures>;
  /**
   * Render the Tree View by passing the JSX element to the renderFromJSX function as follows:
   *
   * ```tsx
   * const response = renderFromJSX(
   *   <FileExplorerComponent defaultExpandedItems={['1']}>
   *     <FileExplorerItemComponent itemId={'1'} label={'1'} data-testid={'1'}>
   *   </FileExplorerComponent>
   * );
   * ```
   *
   * `FileExplorerComponent` and `FileExplorerItemComponent` are passed as parameters to the `describeFileExplorer` function.
   * The JSX should be adapted depending on the component being rendered.
   *
   * Warning: This method should only be used if `render` is not compatible with the test being written
   * (most likely to advanced testing of the children rendering aspect on the FileExplorerBasic)
   *
   * Warning: If you want to use the utils returned by the `renderFromJSX` function,
   * each item should receive a `label` and a `data-testid` equal to its `id`.
   */
  renderFromJSX: DescribeFileExplorerJSXRenderer;
  setup: `${FileExplorerComponentName} + ${FileExplorerItemComponentName}`;
  fileListComponentName: FileExplorerComponentName;
  fileListItemComponentName: FileExplorerItemComponentName;
  FileExplorerComponent: React.ElementType<any>;
  FileExplorerItemComponent: React.ElementType<any>;
}

export interface DescribeFileExplorerItem {
  id: string;
  label?: React.ReactNode;
  disabled?: boolean;
  children?: readonly DescribeFileExplorerItem[];
}
