/**
 * Format bytes as human-readable text.
 *
 * @param {number} bytes Number of bytes.
 * @param {boolean} [si=false] True to use metric (SI) units, aka powers of 1000. False to use binary (IEC), aka powers of 1024.
 * @param {number} [dp=1] Number of decimal places to display.
 *
 * @returns {string} Formatted string.
 */
export function humanFileSize(bytes: number, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    /**
     * Check if the byte value is less than the threshold for unit change
     */
    if (Math.abs(bytes) < thresh) {
        return `${bytes} B`;
    }

    /**
     * Define the units array, which contains metric and binary units.
     * The index of the selected unit corresponds to the number of times the bytes have been divided by the threshold.
     */
    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

    let u = -1;
    const r = 10**dp;

    /**
     * Calculate the number of times the bytes have been divided by the threshold.
     */
    do {
        bytes /= thresh;
        // eslint-disable-next-line no-plusplus
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return `${bytes.toFixed(dp)} ${units[u]}`;
}