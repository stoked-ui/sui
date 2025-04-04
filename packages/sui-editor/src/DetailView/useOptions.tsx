/**
 * A custom hook that retrieves and updates the search parameters.
 *
 * @param {string} option - The option to retrieve from the search parameters.
 * @returns {object} An object containing the search parameters.
 */
export function useOption(option: string) {
  /**
   * Retrieves and updates the search parameters using the `useSearchParams` hook.
   *
   * @returns {object} An object containing the updated search parameters.
   */
  let [searchParams, setSearchParams] = useSearchParams();
  
  return searchParams;
}