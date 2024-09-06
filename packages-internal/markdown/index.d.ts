interface TableOfContentsEntry {
  children: TableOfContentsEntry;
  hash: string;
  level: number;
  text: string;
}

export function createRender(context: {
  headingHashes: Record<string, string>;
  toc: TableOfContentsEntry[];
  location: string[];
  userLanguage: string;
  ignoreLanguagePages?: (path: string) => boolean;
  options: object;
}): (markdown: string) => string;

export function getHeaders(markdown: string): Record<string, string | string[]>;

export function getTitle(markdown: string): string;

export function renderMarkdown(markdown: string): string;
