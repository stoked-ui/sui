export function randomBytes(length: number): string {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
  .map(byte => byte.toString(16).padStart(2, '0'))
  .join('').substring(0, length);
}
interface namedIdProps {id?: string, length?: number, prefix?: string, suffix?: string};
export default function namedId(props?: namedIdProps) {
  if (!props) {
    props = { id: 'id', length: 7 };
  }
  const {
    id = 'id',
    length = 7,
    prefix,
    suffix
  } = props;
  let start = prefix ? `${prefix}-${id}` : id;
  start = suffix ? `${start}-${suffix}` : start;
  return `${start}-${randomBytes(length!)}`;
}

