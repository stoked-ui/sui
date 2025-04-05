/**
 * Interface for the state of a draggable item in a file explorer.
 * @typedef {Object} DndItemState
 * @property {DndState} dndState - The state of the drag and drop operation.
 * @property {HTMLElement | null} dndContainer - The container element for the draggable item.
 * @property {any | null} dndInstruction - The instruction for the drag and drop operation.
 */

/**
 * Interface for the payload of a draggable element.
 * @typedef {Object} ElementDragPayload
 * @property {HTMLElement} element - The HTML element being dragged.
 * @property {Element | null} dragHandle - The handle element for dragging.
 * @property {Record<string, unknown>} data - Additional data related to the drag operation.
 */

/**
 * Type representing a draggable element.
 * @typedef {Object} ElementDragType
 * @property {'element'} type - The type of draggable element.
 * @property {'internal'} startedFrom - The origin of the drag operation.
 * @property {ElementDragPayload} payload - The payload of the draggable element.
 */

/**
 * Interface for the data related to an internal drop operation in a file explorer.
 * @typedef {Object} DropInternalData
 * @property {FileBase} item - The file item that was dropped.
 * @property {ElementDragPayload} dnd - The drag payload.
 * @property {FileBase} target - The target file item where the drop occurred.
 * @property {DragLocation} dnd - The location of the drop.
 * @property {Instruction} instruction - The instruction for the drop operation.
 */

/**
 * Type representing the different modes of trash functionality in drag and drop.
 * @typedef {'remove' | 'collect-remove-restore' | 'collect-restore' | 'collect'} DndTrashMode
 */

/**
 * Interface for the instance of file list items in a file explorer with drag and drop functionality.
 * @interface UseFileListItemsInstance
 * @property {Function} dndConfig - Retrieves the drag and drop configuration.
 * @property {Function} dndEnabled - Checks if drag and drop functionality is enabled.
 * @property {Function} dndInternalEnabled - Checks if internal drag and drop functionality is enabled.
 * @property {Function} dndExternalEnabled - Checks if external drag and drop functionality is enabled.
 * @property {Function} dndExternalFileTypes - Retrieves the allowed file types for external drag and drop.
 * @property {Function} dndTrash - Checks if drag and drop trash functionality is enabled.
 * @property {Function} getDndContext - Retrieves the drag and drop context value.
 * @property {Function} dropInternal - Handles internal drop events.
 * @property {Function} createChildren - Creates child items in the file explorer.
 * @property {Function} createChild - Creates a child item in the file explorer.
 * @property {Function} removeItem - Removes an item from the file explorer.
 */

/**
 * Interface for the parameters used in configuring file explorer drag and drop functionality.
 * @interface UseFileExplorerDndParameters
 * @property {boolean} [dndInternal] - Enable internal drag and drop.
 * @property {boolean} [dndExternal] - Enable external drag and drop.
 * @property {string[]} [dndFileTypes] - Allowed file types for drag and drop.
 * @property {boolean} [dndTrash] - Enable drag and drop trash functionality.
 * @property {Function} [onAddFiles] - Callback function for adding files.
 */

/**
 * Type representing the defaultized parameters for file explorer drag and drop functionality.
 * @typedef {UseFileExplorerDndParameters} UseFileExplorerDndDefaultizedParameters
 */

/**
 * Interface for the context value of file explorer drag and drop functionality.
 * @interface UseFileExplorerDndContextValue
 * @property {Object} dnd - The drag and drop configuration settings.
 */

/**
 * Type representing the signature of file explorer drag and drop functionality.
 * @typedef {Object} UseFileExplorerDndSignature
 * @property {UseFileExplorerDndParameters} params - The parameters for drag and drop functionality.
 * @property {UseFileExplorerDndDefaultizedParameters} defaultizedParams - The defaultized parameters for drag and drop functionality.
 * @property {UseFileListItemsInstance} instance - The instance of file list items with drag and drop functionality.
 * @property {UseFileExplorerFilesSignature[]} dependencies - The dependencies required for drag and drop functionality.
 * @property {UseFileExplorerDndContextValue} contextValue - The context value for file explorer drag and drop.
 */

*/