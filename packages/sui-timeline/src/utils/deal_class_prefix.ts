/**
 * Prefixes a list of class names with a specified prefix.
 * @param {...string} classNames - The class names to prefix.
 * @returns {string} The prefixed class names.
 */
export function prefix(...classNames: string[]) {
  return prefixNames(`${PREFIX}-`, ...classNames);
}