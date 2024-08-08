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
 * Convert a date to a relative time string, such as
 * "a minute ago", "in 2 hours", "yesterday", "3 months ago", etc.
 * using Intl.RelativeTimeFormat
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

  // Array reprsenting one minute, hour, day, week, month, etc in seconds
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
