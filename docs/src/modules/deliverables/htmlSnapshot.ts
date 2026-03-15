const SAVED_NEXT_SNAPSHOT_MARKERS = [
  '<!-- saved from url=',
  '__next-build-watcher',
  'react-refresh.js',
  '"buildId":"development"',
];

const BASE_TAG_PATTERN = /<base\b/i;
const HEAD_TAG_PATTERN = /<head(\s[^>]*)?>/i;
const HTML_TAG_PATTERN = /<html(\s[^>]*)?>/i;

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

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function injectBaseHrefIntoHtml(html: string, sourceUrl: string) {
  if (BASE_TAG_PATTERN.test(html)) {
    return html;
  }

  const baseHref = escapeHtmlAttribute(new URL('./', sourceUrl).toString());
  const baseTag = `<base href="${baseHref}">`;

  const headMatch = html.match(HEAD_TAG_PATTERN);
  if (headMatch && typeof headMatch.index === 'number') {
    const insertAt = headMatch.index + headMatch[0].length;
    return `${html.slice(0, insertAt)}${baseTag}${html.slice(insertAt)}`;
  }

  const htmlMatch = html.match(HTML_TAG_PATTERN);
  if (htmlMatch && typeof htmlMatch.index === 'number') {
    const insertAt = htmlMatch.index + htmlMatch[0].length;
    return `${html.slice(0, insertAt)}<head>${baseTag}</head>${html.slice(insertAt)}`;
  }

  return `${baseTag}${html}`;
}

export function prepareDeliverableHtmlForProxy(html: string, sourceUrl: string) {
  const normalizedHtml = isSavedNextSnapshotHtml(html)
    ? sanitizeSavedNextSnapshotHtml(html)
    : html;

  return injectBaseHrefIntoHtml(normalizedHtml, sourceUrl);
}

export function prepareDeliverableHtmlForStorage(html: string, sourceUrl: string) {
  if (!isSavedNextSnapshotHtml(html)) {
    return html;
  }

  return injectBaseHrefIntoHtml(sanitizeSavedNextSnapshotHtml(html), sourceUrl);
}
