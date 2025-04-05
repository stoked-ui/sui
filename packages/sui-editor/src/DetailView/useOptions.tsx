/**
 * Custom hook to retrieve a specific option from the search params using react-router-dom.
 * @param {string} option - The option to retrieve from the search params.
 * @returns {URLSearchParams} - The search params object containing the specified option.
 * @example
 * const optionValue = useOption('exampleOption');
 */
import { useSearchParams } from "react-router-dom";

export function useOption(option: string) {
  let [searchParams, setSearchParams] = useSearchParams();
  return searchParams;
}