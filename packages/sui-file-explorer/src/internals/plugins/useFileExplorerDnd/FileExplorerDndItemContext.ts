/**
 * Context for File Explorer Drag and Drop Item
 * Provides access to DropIndicator, attachInstruction, and extractInstruction
 */
export type TFileListItemContext = {
  DropIndicator: typeof DropIndicator;
  attachInstruction: typeof attachInstruction;
  extractInstruction: typeof extractInstruction;
};

/**
 * Context provider for File Explorer Drag and Drop Item
 * Initializes context with DropIndicator, attachInstruction, and extractInstruction
 */
export const FileExplorerDndItemContext = React.createContext<TFileListItemContext>({
  DropIndicator,
  attachInstruction,
  extractInstruction,
});