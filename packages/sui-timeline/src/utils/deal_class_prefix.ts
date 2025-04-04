/**
 * Prefixes class names with the given prefix.
 *
 * @param {...string} classNames - Class names to be prefixed
 * @returns {string} Prefixed class name
 */
export function prefix(...classNames: string[]) {
  return prefixNames(`${PREFIX}-`, ...classNames);
}