const SAVED_NEXT_SNAPSHOT_MARKERS = [
  '<!-- saved from url=',
  '__next-build-watcher',
  'react-refresh.js',
  '"buildId":"development"',
];

export function isSavedNextSnapshotHtml(html: string): boolean {
  return (
    html.includes('<div id="__next">') &&
    html.includes('__NEXT_DATA__') &&
    SAVED_NEXT_SNAPSHOT_MARKERS.some((marker) => html.includes(marker))
  );
}

export function sanitizeSavedNextSnapshotHtml(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}
