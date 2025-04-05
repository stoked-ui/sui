/**
 * Convert bytes to a human-readable size string.
 * @param {number} bytes - The number of bytes to convert.
 * @returns {string} A human-readable size string.
 */
export function bytesToSize(bytes: number): string {
  const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if ((bytes ?? 0) === 0) {
    return ''
  }
  const i: number = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10)
  if (i === 0) {
    return `${bytes} ${sizes[i]}`
  }
  return `${(bytes / 1024**i).toFixed(1)} ${sizes[i]}`
}

/**
 * Calculate total size recursively from items with children.
 * @param {any & { children: any[] }} item - The item to calculate size for.
 * @param {string} propName - The property name to access size values.
 * @param {number} current - The current total size (default: 0).
 * @returns {number} The total calculated size.
 */
export function calcSize(item: any & { children: any[]}, propName: string, current: number = 0): number {
  if (item === undefined) {
    return current;
  }
  if (item[propName]) {
    return item[propName];
  }

  if (!item.children?.length) {
    return current;
  }

  item.children.forEach((child: any) => {
    current += calcSize(child.props, propName);
  });

  return current;
}

/**
 * Convert a given timestamp to a relative time string.
 * @param {number} timeMs - The timestamp in milliseconds.
 * @returns {string | undefined} A relative time string or undefined if timeMs is not provided.
 */
export function getRelativeTimeString(timeMs?: number): string | undefined {
  if (!timeMs) {
    return undefined;
  }
  let lang = 'en-US';
  if (typeof window !== "undefined") {
    lang = navigator.language;
  }
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units: Intl.RelativeTimeFormatUnit[] = ["second", "minute", "hour", "day", "week", "month", "year"];
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  try {
    return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
  } catch (ex) {
    throw new Error(`relative time format err: ${ex} - ${timeMs} ${deltaSeconds} ${lang} ${new Date(timeMs)} ${new Date()}`);
  }
}