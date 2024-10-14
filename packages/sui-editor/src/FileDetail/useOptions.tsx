import { useSearchParams } from "react-router-dom";

export function useOption(option: string) {
  let [searchParams, setSearchParams] = useSearchParams();
  return searchParams;
}
