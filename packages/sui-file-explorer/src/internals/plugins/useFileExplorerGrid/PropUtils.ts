/**
 * Converts a number of bytes to a human-readable size string.
 *
 * @param {number} bytes The number of bytes to convert.
 * @returns {string} A string representing the size in human-readable format (e.g. "1.2 KB").
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
 * Calculates the total size of an item's children.
 *
 * @param {any & { children: any[]}} item The item to calculate the size for.
 * @param {string} propName The property name to use as a fallback if the 'size' property is missing.
 * @param {number} [current=0] The current total size. Defaults to 0.
 * @returns {number} The total size of the item's children.
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
 * Converts a date to a relative time string using Intl.RelativeTimeFormat.
 *
 * @param {number} [timeMs] The number of milliseconds since the epoch. If missing, returns undefined.
 * @returns {string | undefined} A string representing the relative time.
 */
export function getRelativeTimeString(timeMs?: number): string | undefined {
  if (!timeMs) {
    return undefined;
  }
  let lang = 'en-US';
  if (typeof window !== "undefined") {
    lang = navigator.language;
  }
  
  // Get the amount of seconds between the given date and now
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

  // Array representing one minute, hour, day, week, month, etc in seconds
  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];

  // Array equivalent to the above but in the string representation of the units
  const units: Intl.RelativeTimeFormatUnit[] = ["second", "minute", "hour", "day", "week", "month", "year"];

  // Grab the ideal cutoff unit
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));

  // Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
  // is one day in seconds, so we can divide our seconds by this to get the # of days
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

  // Intl.RelativeTimeFormat do its magic
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  try {
    return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
  } catch (ex) {
    throw new Error(`relative time format err: ${ex} - ${timeMs} ${deltaSeconds} ${lang} ${new Date(timeMs)} ${new Date()}`);
  }
}