export function randomBytes(length: number): string {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
  .map(byte => byte.toString(16).padStart(2, '0'))
  .join('').substring(0, length);
}

interface NamedIdProps {id?: string, length?: number, prefix?: string, suffix?: string}

export default function namedId(props?: NamedIdProps | string) {
  let id = 'id';
  let length = 7;
  let prefix: string | undefined;
  let suffix: string | undefined;
  if (props as string) {
    id = props as string;
  } else if (props && props as NamedIdProps) {
    const namedProps = props as NamedIdProps;
    if (namedProps.id) {
      id = namedProps.id
    }
    if (namedProps.length) {
      length = namedProps.length
    }
    prefix = namedProps.prefix;
    suffix = namedProps.suffix;
  }

  let start = prefix ? `${prefix}-${id}` : id;
  start = suffix ? `${start}-${suffix}` : start;
  return `${start}-${randomBytes(length!)}`;
}

