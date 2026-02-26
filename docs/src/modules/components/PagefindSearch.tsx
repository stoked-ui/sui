import * as React from 'react';
import { useRouter } from 'next/router';
import { alpha, styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

// ---- Pagefind types --------------------------------------------------------

interface PagefindResult {
  id: string;
  data: () => Promise<PagefindResultData>;
}

interface PagefindResultData {
  url: string;
  meta: {
    title?: string;
    [key: string]: string | undefined;
  };
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
  [filterName: string]: {
    [filterValue: string]: number;
  };
}

interface PagefindSearchOptions {
  filters?: Record<string, string>;
}

interface Pagefind {
  init: () => Promise<void>;
  search: (query: string, options?: PagefindSearchOptions) => Promise<PagefindSearchResults>;
  filters: () => Promise<PagefindFilterCounts>;
}

// ---- Styled components -----------------------------------------------------

export const SearchButton = styled('button')(({ theme }) => [
  {
    minHeight: 34,
    minWidth: 34,
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    paddingLeft: theme.spacing(0.6),
    [theme.breakpoints.only('xs')]: {
      backgroundColor: 'transparent',
      padding: 0,
      justifyContent: 'center',
      '& > *:not(.MuiSvgIcon-root)': {
        display: 'none',
      },
    },
    fontFamily: theme.typography.fontFamily,
    position: 'relative',
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.text.secondary,
    fontSize: theme.typography.pxToRem(14),
    border: `1px solid ${theme.palette.grey[200]}`,
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: '150ms',
    boxShadow: `hsl(200, 0%, 100%) 0 2px 0 inset, ${alpha(theme.palette.grey[100], 0.5)} 0 -1.5px 0 inset, ${alpha(theme.palette.grey[200], 0.5)} 0 1px 2px 0`,
    '&:hover': {
      background: theme.palette.grey[100],
      borderColor: theme.palette.grey[300],
    },
    '&:focus-visible': {
      outline: `3px solid ${alpha(theme.palette.primary[500] as string, 0.5)}`,
      outlineOffset: '2px',
    },
  },
  theme.applyDarkStyles({
    backgroundColor: alpha(theme.palette.primaryDark[700] as string, 0.4),
    borderColor: theme.palette.primaryDark[700],
    boxShadow: `${alpha(theme.palette.primaryDark[600] as string, 0.1)} 0 2px 0 inset, ${theme.palette.common.black} 0 -2px 0 inset, ${theme.palette.common.black} 0 1px 2px 0`,
    '&:hover': {
      background: theme.palette.primaryDark[700],
      borderColor: theme.palette.primaryDark[600],
    },
  }),
]);

const SearchLabel = styled('span')(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginRight: 'auto',
}));

const Shortcut = styled('div')(({ theme }) => ({
  fontSize: theme.typography.pxToRem(12),
  fontWeight: 'bold',
  lineHeight: '20px',
  marginLeft: theme.spacing(0.5),
  border: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: '#FFF',
  padding: theme.spacing(0, 0.5),
  borderRadius: 7,
  ...theme.applyDarkStyles({
    borderColor: theme.palette.primaryDark[600],
    backgroundColor: theme.palette.primaryDark[800],
  }),
}));

const SearchInputRoot = styled(Box)(({ theme }) => [
  {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1),
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
  theme.applyDarkStyles({
    borderColor: theme.palette.primaryDark[700],
  }),
]);

const ResultItem = styled(ListItemButton)(({ theme }) => [
  {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1, 2),
    margin: theme.spacing(0.25, 1),
    borderRadius: theme.shape.borderRadius,
    border: '1px solid transparent',
    backgroundColor: alpha(theme.palette.grey[50], 0.4),
    borderColor: alpha(theme.palette.grey[100], 0.5),
    '&:hover': {
      backgroundColor: theme.palette.primary[50],
      borderColor: theme.palette.primary[300],
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary[50],
      borderColor: theme.palette.primary[300],
    },
    '& mark': {
      backgroundColor: 'transparent',
      color: theme.palette.primary[600],
      fontWeight: theme.typography.fontWeightBold,
    },
  },
  theme.applyDarkStyles({
    backgroundColor: alpha(theme.palette.primaryDark[800] as string, 0.5),
    borderColor: alpha(theme.palette.primaryDark[700] as string, 0.8),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary[900] as string, 0.4),
      borderColor: alpha(theme.palette.primary[700] as string, 0.6),
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary[900] as string, 0.4),
      borderColor: alpha(theme.palette.primary[700] as string, 0.6),
    },
    '& mark': {
      color: theme.palette.primary[300],
    },
  }),
]);

// ---- Helper types -----------------------------------------------------------

interface ResolvedResult {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  product: string;
}

// ---- Pagefind loader -------------------------------------------------------

let pagefindInstance: Pagefind | null = null;
let pagefindLoading: Promise<Pagefind> | null = null;

async function loadPagefind(): Promise<Pagefind> {
  if (pagefindInstance) {
    return pagefindInstance;
  }
  if (pagefindLoading) {
    return pagefindLoading;
  }
  pagefindLoading = (async () => {
    // Pagefind is served as a static file alongside the site build.
    // We use a dynamic Function-based import to avoid TypeScript module resolution
    // and webpack bundling — pagefind.js is a runtime-only static asset.
    // eslint-disable-next-line no-new-func
    const dynamicImport = new Function('url', 'return import(url)') as (
      url: string,
    ) => Promise<Pagefind>;
    const pf = await dynamicImport('/pagefind/pagefind.js');
    await pf.init();
    pagefindInstance = pf;
    return pf;
  })();
  return pagefindLoading;
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

  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<ResolvedResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [productFilters, setProductFilters] = React.useState<string[]>([]);
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  // Detect macOS for keyboard shortcut display
  const macOS =
    typeof window !== 'undefined' && window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const onOpen = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = React.useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    setActiveFilter(null);
  }, []);

  // Load product filter list once when dialog opens
  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const pf = await loadPagefind();
        const filterData = await pf.filters();
        if (!cancelled && filterData.product) {
          setProductFilters(Object.keys(filterData.product).sort());
        }
      } catch {
        // If pagefind isn't available (e.g. dev without index), silently ignore
      }
    })();
    // eslint-disable-next-line consistent-return
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Focus input when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      // Small delay to allow dialog animation to complete
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  // Perform search when query or filter changes
  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let cancelled = false;

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setSelectedIndex(0);

    (async () => {
      try {
        const pf = await loadPagefind();
        const searchOptions: PagefindSearchOptions = {};
        if (activeFilter) {
          searchOptions.filters = { product: activeFilter };
        }
        const searchResult = await pf.search(query.trim(), searchOptions);
        if (cancelled) {
          return;
        }

        // Resolve first 10 results eagerly
        const topResults = searchResult.results.slice(0, 10);
        const resolved = await Promise.all(
          topResults.map(async (r) => {
            const data = await r.data();
            const productArr = data.filters?.product;
            const product = Array.isArray(productArr) && productArr.length > 0 ? productArr[0] : '';
            return {
              id: r.id,
              url: data.url,
              title: data.meta?.title ?? data.url,
              excerpt: data.excerpt,
              product,
            } satisfies ResolvedResult;
          }),
        );

        if (!cancelled) {
          setResults(resolved);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, activeFilter, isOpen]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          onOpen();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onOpen]);

  const handleResultSelect = React.useCallback(
    (url: string) => {
      onClose();
      router.push(url);
    },
    [onClose, router],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          handleResultSelect(selected.url);
        }
      }
    },
    [results, selectedIndex, handleResultSelect],
  );

  // Scroll selected result into view
  React.useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) {
      return;
    }
    const selectedEl = listEl.querySelector(`[data-result-index="${selectedIndex}"]`);
    if (selectedEl) {
      (selectedEl as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <React.Fragment>
      <SearchButton
        ref={searchButtonRef}
        onClick={onOpen}
        aria-label="Search documentation"
        sx={sx}
      >
        <SearchIcon
          fontSize="small"
          sx={(theme) => ({
            color: 'primary.500',
            ...theme.applyDarkStyles({
              color: 'primary.300',
            }),
          })}
        />
        <SearchLabel>Search...</SearchLabel>
        <Shortcut aria-hidden="true">{macOS ? '⌘' : 'Ctrl+'}K</Shortcut>
      </SearchButton>

      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: [
            (theme) => ({
              maxWidth: 640,
              borderRadius: `${theme.shape.borderRadius}px`,
              border: `1px solid ${theme.palette.grey[300]}`,
              boxShadow: `0px 4px 16px ${alpha(theme.palette.common.black, 0.2)}`,
              overflow: 'hidden',
            }),
            (theme) =>
              theme.applyDarkStyles({
                backgroundColor: theme.palette.primaryDark[900],
                borderColor: theme.palette.primaryDark[700],
                boxShadow: `0px 4px 16px ${alpha(theme.palette.common.black, 0.8)}`,
              }),
          ],
        }}
        sx={(theme) => ({
          '& .MuiDialog-container': {
            alignItems: 'flex-start',
            pt: { xs: 4, sm: 8 },
          },
          '& .MuiBackdrop-root': {
            backgroundColor: alpha(theme.palette.grey[700], 0.5),
            backdropFilter: 'blur(2px)',
          },
        })}
      >
        {/* Search input */}
        <SearchInputRoot>
          <SearchIcon
            fontSize="small"
            sx={(theme) => ({
              mr: 1,
              color: theme.palette.text.secondary,
              flexShrink: 0,
            })}
          />
          <InputBase
            inputRef={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documentation..."
            fullWidth
            inputProps={{ 'aria-label': 'search documentation' }}
            sx={(theme) => ({
              fontSize: theme.typography.pxToRem(16),
              fontWeight: theme.typography.fontWeightMedium,
              '& input': {
                padding: 0,
              },
            })}
          />
          {query && (
            <IconButton
              size="small"
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              sx={{ ml: 0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Close search"
            sx={(theme) => ({
              ml: 0.5,
              fontSize: theme.typography.pxToRem(12),
              fontWeight: theme.typography.fontWeightBold,
              px: 0.8,
              py: 0.3,
              borderRadius: '6px',
              border: `1px solid ${theme.palette.grey[200]}`,
              backgroundColor: theme.palette.grey[50],
              color: theme.palette.text.secondary,
              fontFamily: theme.typography.fontFamilyCode,
              ...theme.applyDarkStyles({
                borderColor: theme.palette.primaryDark[600],
                backgroundColor: theme.palette.primaryDark[800],
              }),
            })}
          >
            esc
          </IconButton>
        </SearchInputRoot>

        {/* Product filter chips */}
        {productFilters.length > 0 && (
          <Box
            sx={(theme) => ({
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              p: 1,
              px: 2,
              borderBottom: `1px solid ${theme.palette.grey[200]}`,
              ...theme.applyDarkStyles({
                borderColor: theme.palette.primaryDark[700],
              }),
            })}
          >
            <Chip
              label="All"
              size="small"
              variant={activeFilter === null ? 'filled' : 'outlined'}
              onClick={() => setActiveFilter(null)}
              color={activeFilter === null ? 'primary' : 'default'}
            />
            {productFilters.map((product) => (
              <Chip
                key={product}
                label={product}
                size="small"
                variant={activeFilter === product ? 'filled' : 'outlined'}
                onClick={() => setActiveFilter(product === activeFilter ? null : product)}
                color={activeFilter === product ? 'primary' : 'default'}
              />
            ))}
          </Box>
        )}

        {/* Results */}
        <DialogContent
          sx={{
            p: 0,
            minHeight: 200,
            maxHeight: '60vh',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': (theme) => ({
              borderRadius: 3,
              backgroundColor: theme.palette.grey[400],
            }),
          }}
        >
          {loading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 120,
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}

          {!loading && query && results.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 120,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No results for &ldquo;{query}&rdquo;
              </Typography>
            </Box>
          )}

          {!loading && !query && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 120,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Start typing to search documentation...
              </Typography>
            </Box>
          )}

          {!loading && results.length > 0 && (
            <List ref={listRef} disablePadding sx={{ py: 1 }}>
              {results.map((result, index) => (
                <ResultItem
                  key={result.id}
                  selected={index === selectedIndex}
                  onClick={() => handleResultSelect(result.url)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  data-result-index={index}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      width: '100%',
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {result.title}
                    </Typography>
                    {result.product && (
                      <Chip label={result.product} size="small" variant="outlined" />
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                    }}
                  >
                    {result.url}
                  </Typography>
                  {result.excerpt && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="div"
                      sx={(theme) => ({
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                        '& mark': {
                          backgroundColor: 'transparent',
                          color: theme.palette.primary[600],
                          fontWeight: theme.typography.fontWeightBold,
                          ...theme.applyDarkStyles({
                            color: theme.palette.primary[300],
                          }),
                        },
                      })}
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: result.excerpt }}
                    />
                  )}
                </ResultItem>
              ))}
            </List>
          )}
        </DialogContent>

        {/* Footer */}
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 1,
            borderTop: `1px solid ${theme.palette.grey[200]}`,
            ...theme.applyDarkStyles({
              borderColor: theme.palette.primaryDark[700],
            }),
          })}
        >
          <Typography variant="caption" color="text.secondary">
            <Box component="kbd" sx={{ fontFamily: 'inherit', fontWeight: 'bold' }}>
              ↑↓
            </Box>{' '}
            navigate
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <Box component="kbd" sx={{ fontFamily: 'inherit', fontWeight: 'bold' }}>
              ↵
            </Box>{' '}
            open
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <Box component="kbd" sx={{ fontFamily: 'inherit', fontWeight: 'bold' }}>
              esc
            </Box>{' '}
            close
          </Typography>
        </Box>
      </Dialog>
    </React.Fragment>
  );
}
