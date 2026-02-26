import * as React from 'react';
import { useRouter } from 'next/router';
import { alpha, keyframes, styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// ---- Pagefind types --------------------------------------------------------

interface PagefindResult {
  id: string;
  data: () => Promise<PagefindResultData>;
}
interface PagefindResultData {
  url: string;
  meta: { title?: string; [key: string]: string | undefined };
  excerpt: string;
  filters: Record<string, string[]>;
  content: string;
  word_count: number;
}
interface PagefindSearchResults {
  results: PagefindResult[];
  unfilteredResultCount: number;
}
interface PagefindFilterCounts {
  [filterName: string]: { [filterValue: string]: number };
}
interface PagefindSearchOptions {
  filters?: Record<string, string>;
}
interface Pagefind {
  init: () => Promise<void>;
  search: (query: string, options?: PagefindSearchOptions) => Promise<PagefindSearchResults>;
  filters: () => Promise<PagefindFilterCounts>;
}

// ---- Helper types ----------------------------------------------------------

interface ResolvedResult {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  product: string;
}
interface ResultGroup {
  product: string;
  results: Array<ResolvedResult & { flatIndex: number }>;
}

// ---- Helper functions ------------------------------------------------------

/** Convert `/media/docs/overview/` to `Media > Docs > Overview` */
function urlToBreadcrumb(url: string): string {
  const segments = url.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  if (!segments.length) return '/';
  return segments
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))
    .join(' > ');
}

/** Group results by product, annotating each with a flat navigation index */
function groupResults(results: ResolvedResult[]): ResultGroup[] {
  const map = new Map<string, ResolvedResult[]>();
  const order: string[] = [];
  results.forEach((r) => {
    const key = r.product || 'Other';
    if (!map.has(key)) { map.set(key, []); order.push(key); }
    map.get(key)!.push(r);
  });
  let idx = 0;
  return order.map((product) => ({
    product,
    results: (map.get(product) ?? []).map((r) => ({ ...r, flatIndex: idx++ })),
  }));
}

const POPULAR_LINKS = [
  { label: 'Media Viewer', url: '/media/docs/media-viewer/' },
  { label: 'File Explorer', url: '/file-explorer/docs/overview/' },
  { label: 'Timeline', url: '/timeline/docs/overview/' },
  { label: 'Flux Overview', url: '/flux/docs/overview/' },
];

// ---- Pagefind loader -------------------------------------------------------

let pagefindInstance: Pagefind | null = null;
let pagefindLoading: Promise<Pagefind> | null = null;

async function loadPagefind(): Promise<Pagefind> {
  if (pagefindInstance) return pagefindInstance;
  if (pagefindLoading) return pagefindLoading;
  pagefindLoading = (async () => {
    // eslint-disable-next-line no-new-func
    const dynamicImport = new Function('url', 'return import(url)') as (url: string) => Promise<Pagefind>;
    const pf = await dynamicImport('/pagefind/pagefind.js');
    await pf.init();
    pagefindInstance = pf;
    return pf;
  })();
  return pagefindLoading;
}

// ---- Styled components -----------------------------------------------------

export const SearchButton = styled('button')(({ theme }) => [
  {
    minHeight: 34, minWidth: 34, display: 'flex', alignItems: 'center', margin: 0,
    paddingLeft: theme.spacing(0.6),
    [theme.breakpoints.only('xs')]: {
      backgroundColor: 'transparent', padding: 0, justifyContent: 'center',
      '& > *:not(.MuiSvgIcon-root)': { display: 'none' },
    },
    fontFamily: theme.typography.fontFamily, position: 'relative',
    backgroundColor: theme.palette.grey[50], color: theme.palette.text.secondary,
    fontSize: theme.typography.pxToRem(14), border: `1px solid ${theme.palette.grey[200]}`,
    borderRadius: theme.shape.borderRadius, cursor: 'pointer',
    transitionProperty: 'all', transitionDuration: '150ms',
    boxShadow: `hsl(200,0%,100%) 0 2px 0 inset, ${alpha(theme.palette.grey[100], 0.5)} 0 -1.5px 0 inset, ${alpha(theme.palette.grey[200], 0.5)} 0 1px 2px 0`,
    '&:hover': { background: theme.palette.grey[100], borderColor: theme.palette.grey[300] },
    '&:focus-visible': { outline: `3px solid ${alpha(theme.palette.primary[500] as string, 0.5)}`, outlineOffset: '2px' },
  },
  theme.applyDarkStyles({
    backgroundColor: alpha(theme.palette.primaryDark[700] as string, 0.4),
    borderColor: theme.palette.primaryDark[700],
    boxShadow: `${alpha(theme.palette.primaryDark[600] as string, 0.1)} 0 2px 0 inset, ${theme.palette.common.black} 0 -2px 0 inset, ${theme.palette.common.black} 0 1px 2px 0`,
    '&:hover': { background: theme.palette.primaryDark[700], borderColor: theme.palette.primaryDark[600] },
  }),
]);

const SearchLabel = styled('span')(({ theme }) => ({ marginLeft: theme.spacing(1), marginRight: 'auto' }));

const Shortcut = styled('div')(({ theme }) => ({
  fontSize: theme.typography.pxToRem(12), fontWeight: 'bold', lineHeight: '20px',
  marginLeft: theme.spacing(0.5), border: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: '#FFF', padding: theme.spacing(0, 0.5), borderRadius: 7,
  ...theme.applyDarkStyles({ borderColor: theme.palette.primaryDark[600], backgroundColor: theme.palette.primaryDark[800] }),
}));

const SearchInputRoot = styled(Box)(({ theme }) => [
  { display: 'flex', alignItems: 'center', padding: theme.spacing(0.5, 1), borderBottom: `1px solid ${theme.palette.grey[200]}` },
  theme.applyDarkStyles({ borderColor: theme.palette.primaryDark[700] }),
]);

const ResultItem = styled(ListItemButton)(({ theme }) => [
  {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    gap: theme.spacing(0.5), padding: theme.spacing(1, 2), margin: theme.spacing(0.25, 1),
    borderRadius: theme.shape.borderRadius, border: '1px solid transparent',
    backgroundColor: alpha(theme.palette.grey[50], 0.4), borderColor: alpha(theme.palette.grey[100], 0.5),
    '&:hover': { backgroundColor: theme.palette.primary[50], borderColor: theme.palette.primary[300] },
    '&.Mui-selected': { backgroundColor: theme.palette.primary[50], borderColor: theme.palette.primary[300] },
    '& mark': { backgroundColor: 'transparent', color: theme.palette.primary[600], fontWeight: theme.typography.fontWeightBold },
  },
  theme.applyDarkStyles({
    backgroundColor: alpha(theme.palette.primaryDark[800] as string, 0.5),
    borderColor: alpha(theme.palette.primaryDark[700] as string, 0.8),
    '&:hover': { backgroundColor: alpha(theme.palette.primary[900] as string, 0.4), borderColor: alpha(theme.palette.primary[700] as string, 0.6) },
    '&.Mui-selected': { backgroundColor: alpha(theme.palette.primary[900] as string, 0.4), borderColor: alpha(theme.palette.primary[700] as string, 0.6) },
    '& mark': { color: theme.palette.primary[300] },
  }),
]);

const shimmer = keyframes`0%{background-position:-400px 0}100%{background-position:400px 0}`;

const SkeletonLine = styled(Box)(({ theme }) => [
  {
    height: 12, borderRadius: 6,
    background: `linear-gradient(90deg,${theme.palette.grey[200]} 25%,${theme.palette.grey[100]} 50%,${theme.palette.grey[200]} 75%)`,
    backgroundSize: '800px 100%', animation: `${shimmer} 1.4s ease-in-out infinite`,
  },
  theme.applyDarkStyles({
    background: `linear-gradient(90deg,${theme.palette.primaryDark[700] as string} 25%,${theme.palette.primaryDark[600] as string} 50%,${theme.palette.primaryDark[700] as string} 75%)`,
    backgroundSize: '800px 100%',
  }),
]);

// ---- Skeleton loader -------------------------------------------------------

function ResultSkeleton() {
  return (
    <Box sx={{ px: 2, py: 1 }}>
      {[0, 1, 2].map((i) => (
        <Box key={i} sx={(theme) => ({
          display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, mb: 0.5,
          borderRadius: `${theme.shape.borderRadius}px`,
          border: `1px solid ${theme.palette.grey[100]}`,
          backgroundColor: alpha(theme.palette.grey[50], 0.4),
          ...theme.applyDarkStyles({
            borderColor: theme.palette.primaryDark[700] as string,
            backgroundColor: alpha(theme.palette.primaryDark[800] as string, 0.4),
          }),
        })}>
          <SkeletonLine sx={{ width: `${65 + i * 8}%` }} />
          <SkeletonLine sx={{ width: '40%', height: 10 }} />
          <SkeletonLine sx={{ width: '80%', height: 10 }} />
        </Box>
      ))}
    </Box>
  );
}

// ---- ResultContent sub-component -------------------------------------------

interface ResultContentProps {
  result: ResolvedResult & { flatIndex: number };
}

function ResultContent({ result }: ResultContentProps) {
  return (
    <React.Fragment>
      <Typography variant="body2" fontWeight="medium" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
        {result.title}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', opacity: 0.75 }}>
        {urlToBreadcrumb(result.url)}
      </Typography>
      {result.excerpt && (
        <Typography
          variant="caption" color="text.secondary" component="div"
          sx={(theme) => ({
            display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden',
            '& mark': {
              backgroundColor: 'transparent', color: theme.palette.primary[600], fontWeight: theme.typography.fontWeightBold,
              ...theme.applyDarkStyles({ color: theme.palette.primary[300] }),
            },
          })}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: result.excerpt }}
        />
      )}
    </React.Fragment>
  );
}

// ---- Main component --------------------------------------------------------

interface PagefindSearchProps {
  sx?: object;
}

export default function PagefindSearch(props: PagefindSearchProps) {
  const { sx } = props;
  const router = useRouter();

  const searchButtonRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const liveRegionRef = React.useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<ResolvedResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [indexLoading, setIndexLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [productFilters, setProductFilters] = React.useState<string[]>([]);
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  const macOS = typeof window !== 'undefined' && window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const onOpen = React.useCallback(() => setIsOpen(true), []);

  const onClose = React.useCallback(() => {
    setIsOpen(false); setQuery(''); setResults([]); setSelectedIndex(0); setActiveFilter(null); setIndexLoading(false);
  }, []);

  // Load product filters when dialog opens
  React.useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    setIndexLoading(true);
    (async () => {
      try {
        const pf = await loadPagefind();
        const filterData = await pf.filters();
        if (!cancelled) {
          setIndexLoading(false);
          if (filterData.product) setProductFilters(Object.keys(filterData.product).sort());
        }
      } catch {
        if (!cancelled) setIndexLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  // Focus input when dialog opens
  React.useEffect(() => {
    if (!isOpen) return undefined;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Perform search
  React.useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    if (!query.trim()) { setResults([]); setLoading(false); return undefined; }
    setLoading(true); setSelectedIndex(0);
    (async () => {
      try {
        const pf = await loadPagefind();
        const searchOptions: PagefindSearchOptions = activeFilter ? { filters: { product: activeFilter } } : {};
        const searchResult = await pf.search(query.trim(), searchOptions);
        if (cancelled) return;
        const topResults = searchResult.results.slice(0, 10);
        const resolved = await Promise.all(
          topResults.map(async (r) => {
            const data = await r.data();
            const productArr = data.filters?.product;
            return {
              id: r.id, url: data.url, title: data.meta?.title ?? data.url,
              excerpt: data.excerpt,
              product: Array.isArray(productArr) && productArr.length > 0 ? productArr[0] : '',
            } satisfies ResolvedResult;
          }),
        );
        if (!cancelled) { setResults(resolved); setLoading(false); }
      } catch {
        if (!cancelled) { setResults([]); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [query, activeFilter, isOpen]);

  // Announce result count to screen readers
  React.useEffect(() => {
    if (!loading && query && liveRegionRef.current) {
      liveRegionRef.current.textContent = results.length > 0
        ? `${results.length} result${results.length === 1 ? '' : 's'} found for ${query}`
        : `No results found for ${query}`;
    }
  }, [loading, results, query]);

  // Global Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); isOpen ? onClose() : onOpen(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose, onOpen]);

  const handleResultSelect = React.useCallback((url: string) => { onClose(); router.push(url); }, [onClose, router]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setSelectedIndex((p) => Math.min(p + 1, results.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setSelectedIndex((p) => Math.max(p - 1, 0)); }
    else if (event.key === 'Enter') { event.preventDefault(); const s = results[selectedIndex]; if (s) handleResultSelect(s.url); }
  }, [results, selectedIndex, handleResultSelect]);

  // Scroll selected item into view
  React.useEffect(() => {
    const el = listRef.current?.querySelector(`[data-result-index="${selectedIndex}"]`);
    if (el) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const resultGroups = React.useMemo(() => groupResults(results), [results]);
  const hasMultipleProducts = resultGroups.length > 1;

  return (
    <React.Fragment>
      <SearchButton ref={searchButtonRef} onClick={onOpen} aria-label="Search documentation" sx={sx}>
        <SearchIcon fontSize="small" sx={(t) => ({ color: 'primary.500', ...t.applyDarkStyles({ color: 'primary.300' }) })} />
        <SearchLabel>Search...</SearchLabel>
        <Shortcut aria-hidden="true">{macOS ? '⌘' : 'Ctrl+'}K</Shortcut>
      </SearchButton>

      {/* Hidden live region for screen reader announcements */}
      <Box ref={liveRegionRef} role="status" aria-live="polite" aria-atomic="true"
        sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }} />

      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: [
          (t) => ({ maxWidth: 640, borderRadius: `${t.shape.borderRadius}px`, border: `1px solid ${t.palette.grey[300]}`, boxShadow: `0px 4px 16px ${alpha(t.palette.common.black, 0.2)}`, overflow: 'hidden' }),
          (t) => t.applyDarkStyles({ backgroundColor: t.palette.primaryDark[900], borderColor: t.palette.primaryDark[700], boxShadow: `0px 4px 16px ${alpha(t.palette.common.black, 0.8)}` }),
        ] }}
        sx={(t) => ({
          '& .MuiDialog-container': { alignItems: 'flex-start', pt: { xs: 4, sm: 8 } },
          '& .MuiBackdrop-root': { backgroundColor: alpha(t.palette.grey[700], 0.5), backdropFilter: 'blur(2px)' },
        })}
      >
        {/* Search input */}
        <SearchInputRoot>
          <SearchIcon fontSize="small" sx={(t) => ({ mr: 1, color: t.palette.text.secondary, flexShrink: 0 })} />
          <InputBase
            inputRef={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown} placeholder="Search documentation..." fullWidth
            inputProps={{
              'aria-label': 'Search documentation', 'aria-autocomplete': 'list',
              'aria-controls': 'search-results-listbox',
              'aria-activedescendant': results.length > 0 ? `search-result-${selectedIndex}` : undefined,
              role: 'combobox', 'aria-expanded': results.length > 0,
            }}
            sx={(t) => ({ fontSize: t.typography.pxToRem(16), fontWeight: t.typography.fontWeightMedium, '& input': { padding: 0 } })}
          />
          {query && (
            <IconButton size="small" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }} aria-label="Clear search" sx={{ ml: 0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" onClick={onClose} aria-label="Close search"
            sx={(t) => ({
              ml: 0.5, fontSize: t.typography.pxToRem(12), fontWeight: t.typography.fontWeightBold,
              px: 0.8, py: 0.3, borderRadius: '6px', border: `1px solid ${t.palette.grey[200]}`,
              backgroundColor: t.palette.grey[50], color: t.palette.text.secondary,
              fontFamily: t.typography.fontFamilyCode,
              ...t.applyDarkStyles({ borderColor: t.palette.primaryDark[600], backgroundColor: t.palette.primaryDark[800] }),
            })}
          >esc</IconButton>
        </SearchInputRoot>

        {/* Product filter chips */}
        {productFilters.length > 0 && (
          <Box sx={(t) => ({ display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 1, px: 2, borderBottom: `1px solid ${t.palette.grey[200]}`, ...t.applyDarkStyles({ borderColor: t.palette.primaryDark[700] }) })}>
            <Chip label="All" size="small" variant={activeFilter === null ? 'filled' : 'outlined'} onClick={() => setActiveFilter(null)} color={activeFilter === null ? 'primary' : 'default'} />
            {productFilters.map((product) => (
              <Chip key={product} label={product} size="small"
                variant={activeFilter === product ? 'filled' : 'outlined'}
                onClick={() => setActiveFilter(product === activeFilter ? null : product)}
                color={activeFilter === product ? 'primary' : 'default'} />
            ))}
          </Box>
        )}

        {/* Results */}
        <DialogContent sx={{ p: 0, minHeight: 200, maxHeight: '60vh', overflowY: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': (t) => ({ borderRadius: 3, backgroundColor: t.palette.grey[400] }) }}>

          {(indexLoading && !query) || loading ? <ResultSkeleton /> : null}

          {/* No results state */}
          {!loading && query && results.length === 0 && (
            <Box sx={{ px: 2, py: 3 }}>
              <Typography variant="body2" color="text.secondary" fontWeight="medium" gutterBottom>
                No results for &ldquo;{query}&rdquo;
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Try different keywords, or browse one of these sections:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {POPULAR_LINKS.map((link) => (
                  <Box key={link.url} component="button" onClick={() => handleResultSelect(link.url)}
                    sx={(t) => ({
                      display: 'flex', alignItems: 'center', gap: 1, background: 'none',
                      border: `1px solid ${t.palette.grey[200]}`, borderRadius: `${t.shape.borderRadius}px`,
                      px: 1.5, py: 1, cursor: 'pointer', color: t.palette.text.primary,
                      fontFamily: t.typography.fontFamily, fontSize: t.typography.pxToRem(13),
                      textAlign: 'left', transition: 'all 150ms',
                      '&:hover': { backgroundColor: t.palette.primary[50], borderColor: t.palette.primary[300], color: t.palette.primary[700] },
                      ...t.applyDarkStyles({
                        borderColor: t.palette.primaryDark[700] as string,
                        '&:hover': { backgroundColor: alpha(t.palette.primary[900] as string, 0.3), borderColor: t.palette.primary[700] as string, color: t.palette.primary[300] as string },
                      }),
                    })}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                    {link.label}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Initial empty state */}
          {!loading && !indexLoading && !query && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
              <Typography variant="body2" color="text.secondary">Start typing to search documentation...</Typography>
            </Box>
          )}

          {/* Results list */}
          {!loading && results.length > 0 && (
            <List ref={listRef} disablePadding id="search-results-listbox" role="listbox" aria-label="Search results" sx={{ py: 1 }}>
              {hasMultipleProducts
                ? resultGroups.map((group) => (
                  <Box key={group.product} component="li" sx={{ listStyle: 'none', p: 0, m: 0 }} role="group" aria-label={group.product}>
                    {/* Group header */}
                    <Box sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 1, pl: 2, pr: 2, pt: 1, pb: 0.5 })}>
                      <Typography variant="caption" sx={(t) => ({ fontWeight: t.typography.fontWeightBold, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.palette.text.secondary, fontSize: t.typography.pxToRem(10) })}>
                        {group.product}
                      </Typography>
                      <Box sx={(t) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: 9, backgroundColor: t.palette.grey[200], color: t.palette.text.secondary, fontSize: t.typography.pxToRem(10), fontWeight: t.typography.fontWeightBold, px: 0.75, ...t.applyDarkStyles({ backgroundColor: t.palette.primaryDark[700] as string }) })}>
                        {group.results.length}
                      </Box>
                      <Box sx={(t) => ({ flex: 1, height: 1, backgroundColor: t.palette.grey[200], ...t.applyDarkStyles({ backgroundColor: t.palette.primaryDark[700] as string }) })} />
                    </Box>
                    {group.results.map((result) => (
                      <ResultItem key={result.id} selected={result.flatIndex === selectedIndex}
                        onClick={() => handleResultSelect(result.url)} onMouseEnter={() => setSelectedIndex(result.flatIndex)}
                        data-result-index={result.flatIndex} id={`search-result-${result.flatIndex}`}
                        role="option" aria-selected={result.flatIndex === selectedIndex}>
                        <ResultContent result={result} />
                      </ResultItem>
                    ))}
                  </Box>
                ))
                : resultGroups.flatMap((group) =>
                  group.results.map((result) => (
                    <ResultItem key={result.id} selected={result.flatIndex === selectedIndex}
                      onClick={() => handleResultSelect(result.url)} onMouseEnter={() => setSelectedIndex(result.flatIndex)}
                      data-result-index={result.flatIndex} id={`search-result-${result.flatIndex}`}
                      role="option" aria-selected={result.flatIndex === selectedIndex}>
                      <ResultContent result={result} />
                    </ResultItem>
                  )),
                )}
            </List>
          )}
        </DialogContent>

        {/* Footer with keyboard hints */}
        <Box sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1, borderTop: `1px solid ${t.palette.grey[200]}`, ...t.applyDarkStyles({ borderColor: t.palette.primaryDark[700] }) })}>
          {[['↑↓', 'to navigate'], ['↵', 'to select'], ['esc', 'to close']].map(([key, label]) => (
            <Typography key={key} variant="caption" color="text.secondary">
              <Box component="kbd" sx={{ fontFamily: 'inherit', fontWeight: 'bold' }}>{key}</Box> {label}
            </Typography>
          ))}
        </Box>
      </Dialog>
    </React.Fragment>
  );
}
