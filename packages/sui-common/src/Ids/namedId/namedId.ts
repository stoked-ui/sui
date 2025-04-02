/**
 * Implementation of a named identifier.
 * @file sui/packages/sui-common/src/Ids/namedId/namedId.ts
 */

export function randomBytes(length: number): string {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
  .map(byte => byte.toString(16).padStart(2, '0'))
  .join('').substring(0, length);
}

/**
 * Interface representing the props for the namedId component.
 */
interface NamedIdProps {
  /**
   * The identifier to use as the prefix.
   */
  id?: string;
  /**
   * The length of the random bytes to generate.
   */
  length?: number;
  /**
   * An optional prefix to append to the identifier.
   */
  prefix?: string;
  /**
   * An optional suffix to append to the identifier.
   */
  suffix?: string;
}

/**
 * Generates a named identifier with the given props.
 *
 * @param {NamedIdProps | string} props - The props to use for generating the identifier,
 *     or a single identifier string as an alternative.
 * @returns {string} A unique, generated identifier.
 */
export default function namedId(props?: NamedIdProps | string) {
  let id = 'id';
  let length = 7;
  let prefix: string | undefined;
  let suffix: string | undefined;

  if (props) {
    if (typeof props === 'string') {
      id = props as string;
    } else if (props && props as NamedIdProps) {
      const namedProps = props as NamedIdProps;
      if (namedProps.id) {
        id = namedProps.id;
      }
      if (namedProps.length) {
        length = namedProps.length;
      }
      prefix = namedProps.prefix;
      suffix = namedProps.suffix;
    }
  }

  let start = prefix ? `${prefix}-${id}` : id;
  start = suffix ? `${start}-${suffix}` : start;

  /**
   * Generates a random bytes string of the specified length.
   */
  return `${start}-${randomBytes(length!)}`;
}