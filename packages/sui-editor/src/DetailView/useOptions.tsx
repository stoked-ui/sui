import { useSearchParams } from "react-router-dom";

export function useOption(option: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  return searchParams;
}
