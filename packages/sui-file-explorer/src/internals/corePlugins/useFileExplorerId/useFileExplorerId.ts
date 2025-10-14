/**
 * Custom hook to generate unique IDs for File Explorer components.
 * @param {object} params - Parameters for generating the unique ID.
 * @param {string} params.id - The base ID to use for generating unique IDs.
 * @returns {object} - Object containing functions for handling unique IDs.
 */
export const useFileExplorerId: FileExplorerPlugin<UseFileExplorerIdSignature> = ({ params }) => {
  const fileExplorerId = useId(params.id);

  /**
   * Retrieves the ID attribute for a file based on the provided ID.
   * @param {string} id - The ID of the file.
   * @returns {string} - The ID attribute for the file.
   */
  const getFileIdAttribute = React.useCallback(
    (id: string) => id ?? `${fileExplorerId}-${id}`,
    [fileExplorerId],
  );

  return {
    /**
     * Returns the root props for the File Explorer component.
     * @returns {object} - The root props object.
     */
    getRootProps: () => ({
      id: fileExplorerId,
    }),
    instance: {
      getFileIdAttribute,
    },
  };
};

useFileExplorerId.params = {
  id: true,
};