/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { unstable_debounce as debounce } from '@mui/utils';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ROUTES from 'docs/src/route';
import { PRODUCTS, ALL_PRODUCTS, CONSULTING } from 'docs/src/products';
import { Link } from '@stoked-ui/docs';
import type { AuthUser, ManagedProduct } from 'docs/src/layouts/AppHeader';

const Navigation = styled('nav')(({ theme }) => [
  {
    '& > div': {
      cursor: 'default',
    },
    '& ul': {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      display: 'flex',
    },
    '& li': {
      ...theme.typography.body2,
      color: theme.palette.text.secondary,
      fontWeight: theme.typography.fontWeightSemiBold,
      '& > a, & > button': {
        display: 'inline-block',
        color: 'hsl(215 15% 22% / 1)',
        font: 'inherit',
        textDecoration: 'none',
        padding: theme.spacing('6px', '8px'),
        borderRadius: theme.shape.borderRadius,
        border: '1px solid transparent',
        '&:hover': {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.grey[50],
          borderColor: theme.palette.grey[100],
          '@media (hover: none)': {
            backgroundColor: 'initial',
            // Reset on touch devices, it doesn't add specificity
          },
        },
        '&:focus-visible': {
          outline: `3px solid ${alpha(theme.palette.primary[500], 0.5)}`,
          outlineOffset: '2px',
        },
      },
    },
  },
  theme.applyDarkStyles({
    '& li': {
      '& > a, & > button': {
        color: 'rgb(182, 190, 201)',
        '&:hover': {
          color: theme.palette.primary[50],
          backgroundColor: alpha(theme.palette.primaryDark[700], 0.8),
          borderColor: theme.palette.divider,
        },
      },
    },
  }),
]);

const PRODUCT_IDS = Object.keys(PRODUCTS);

type SubMenuType = 'products' | 'docs' | 'consulting' | null;

interface HeaderNavBarProps {
  auth?: AuthUser | null;
  managedProducts?: ManagedProduct[];
}

export default function HeaderNavBar({ auth, managedProducts = [] }: HeaderNavBarProps) {
  const [subMenuOpen, setSubMenuOpen] = React.useState<SubMenuType>(null);
  const [subMenuIndex, setSubMenuIndex] = React.useState<number | null>(null);
  const navRef = React.useRef<HTMLUListElement | null>(null);
  const productsMenuRef = React.useRef<HTMLButtonElement>(null);
  const docsMenuRef = React.useRef<HTMLButtonElement>(null);
  const consultingMenuRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (typeof subMenuIndex === 'number') {
      document.getElementById(PRODUCT_IDS[subMenuIndex])?.focus();
    }
  }, [subMenuIndex]);

  function handleKeyDown(event: React.KeyboardEvent) {
    let menuItem;

    if (subMenuOpen === 'products') {
      menuItem = productsMenuRef.current!;
    } else if (subMenuOpen === 'docs') {
      menuItem = docsMenuRef.current!;
    } else if (subMenuOpen === 'consulting') {
      menuItem = consultingMenuRef.current!;
    } else {
      return;
    }

    if (event.key === 'ArrowDown' && subMenuOpen === 'products') {
      event.preventDefault();
      setSubMenuIndex((prevValue) => {
        if (prevValue === null) {
          return 0;
        }
        if (prevValue === PRODUCT_IDS.length - 1) {
          return 0;
        }
        return prevValue + 1;
      });
    }
    if (event.key === 'ArrowUp' && subMenuOpen === 'products') {
      event.preventDefault();
      setSubMenuIndex((prevValue) => {
        if (prevValue === null) {
          return 0;
        }
        if (prevValue === 0) {
          return PRODUCT_IDS.length - 1;
        }
        return prevValue - 1;
      });
    }
    if (event.key === 'Escape' || event.key === 'Tab') {
      menuItem.focus();
      setSubMenuOpen(null);
      setSubMenuIndex(null);
    }
  }

  const setSubMenuOpenDebounced = React.useMemo(
    () => debounce(setSubMenuOpen, 40),
    [setSubMenuOpen],
  );

  const setSubMenuOpenUndebounce = (value: typeof subMenuOpen) => () => {
    setSubMenuOpenDebounced.clear();
    setSubMenuOpen(value);
  };

  const handleClickMenu = (value: typeof subMenuOpen) => () => {
    setSubMenuOpenDebounced.clear();
    setSubMenuOpen(subMenuOpen ? null : value);
  };

  React.useEffect(() => {
    return () => {
      setSubMenuOpenDebounced.clear();
    };
  }, [setSubMenuOpenDebounced]);

  const getCurrentProductId = () => {
    if (subMenuIndex === null) {
      return undefined;
    }
    return PRODUCT_IDS[subMenuIndex];
  }

  const menuProps = {
    handleClickMenu,
    setSubMenuOpenUndebounce,
    setSubMenuOpenDebounced,
    subMenuOpen,
    setSubMenuOpen,
    currentProductId: getCurrentProductId(),
  }

  // Check if client has invoices (for conditional nav link)
  const [hasInvoices, setHasInvoices] = React.useState(false);
  React.useEffect(() => {
    if (!auth || auth.role !== 'client' || !auth.clientId) return;
    const stored = localStorage.getItem('auth');
    if (!stored) return;
    let token: string | null = null;
    try {
      token = JSON.parse(stored).access_token;
    } catch { /* ignore */ }
    if (!token) return;
    fetch(`/api/invoices/has-invoices?clientId=${auth.clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.hasInvoices) setHasInvoices(true);
      })
      .catch(() => {});
  }, [auth]);

  // Admin: fetch all products (including non-live)
  const [adminProducts, setAdminProducts] = React.useState<ManagedProduct[]>([]);
  const adminProductsMenuRef = React.useRef<HTMLButtonElement>(null);
  const clientProductsMenuRef = React.useRef<HTMLButtonElement>(null);
  const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);
  const [clientMenuOpen, setClientMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!auth || auth.role !== 'admin') return;
    const stored = localStorage.getItem('auth');
    if (!stored) return;
    let token: string | null = null;
    try {
      token = JSON.parse(stored).access_token;
    } catch { /* ignore */ }
    if (!token) return;
    fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { if (Array.isArray(data)) setAdminProducts(data); })
      .catch(() => {});
  }, [auth]);

  // Authenticated nav
  if (auth) {
    const isAdmin = auth.role === 'admin';
    return (
      <Navigation>
        <ul ref={navRef}>
          {isAdmin ? (
            <React.Fragment>
              <li
                onMouseEnter={() => setAdminMenuOpen(true)}
                onFocus={() => setAdminMenuOpen(true)}
                onMouseLeave={() => setAdminMenuOpen(false)}
                onBlur={() => setAdminMenuOpen(false)}
              >
                <Link
                  ref={adminProductsMenuRef}
                  href="/consulting/products"
                >
                  Products
                </Link>
                <Popper
                  open={adminMenuOpen}
                  anchorEl={adminProductsMenuRef.current}
                  transition
                  placement="bottom-start"
                  style={{ zIndex: 1200, pointerEvents: adminMenuOpen ? undefined : 'none' }}
                >
                  {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={250}>
                      <Paper
                        variant="outlined"
                        sx={(theme) => ({
                          mt: 1,
                          minWidth: 220,
                          overflow: 'hidden',
                          borderColor: 'grey.200',
                          bgcolor: 'background.paper',
                          boxShadow: `0px 4px 16px ${alpha(theme.palette.grey[200], 0.8)}`,
                          '& ul': { margin: 0, padding: 0, listStyle: 'none' },
                          '& li:not(:last-of-type)': { borderBottom: '1px solid', borderColor: theme.palette.divider },
                          '& a': { textDecoration: 'none' },
                          ...theme.applyDarkStyles({
                            borderColor: 'primaryDark.700',
                            bgcolor: 'primaryDark.900',
                            boxShadow: `0px 4px 16px ${alpha(theme.palette.common.black, 0.8)}`,
                            '& li:not(:last-of-type)': { borderColor: 'primaryDark.700' },
                          }),
                        })}
                      >
                        <ul>
                          {adminProducts.map((p) => (
                            <Box component="li" role="none" key={p._id} sx={(theme) => ({ p: 1.5, '&:hover': { bgcolor: 'grey.50' }, ...theme.applyDarkStyles({ '&:hover': { bgcolor: 'primaryDark.700' } }) })}>
                              <Box component={Link} href={`/consulting/products/${p._id}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography color="text.primary" variant="body2" fontWeight="700">
                                  {p.name}
                                </Typography>
                                {p.prerelease && p.prerelease !== 'none' && (
                                  <Chip label={p.prerelease.toUpperCase()} size="small" color={p.prerelease === 'alpha' ? 'error' : 'warning'} sx={{ fontWeight: 700, height: 20, '& .MuiChip-label': { px: 0.75, fontSize: '0.625rem' } }} />
                                )}
                              </Box>
                            </Box>
                          ))}
                        </ul>
                      </Paper>
                    </Fade>
                  )}
                </Popper>
              </li>
              <li>
                <Link href="/consulting/clients">Clients</Link>
              </li>
              <li>
                <Link href="/consulting/users">Users</Link>
              </li>
              <li>
                <Link href="/blog/editor">Blog</Link>
              </li>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {managedProducts.length > 0 && (
                <li
                  onMouseEnter={() => setClientMenuOpen(true)}
                  onFocus={() => setClientMenuOpen(true)}
                  onMouseLeave={() => setClientMenuOpen(false)}
                  onBlur={() => setClientMenuOpen(false)}
                >
                  <ButtonBase
                    ref={clientProductsMenuRef}
                    aria-haspopup
                    aria-expanded={clientMenuOpen ? 'true' : 'false'}
                    onClick={() => setClientMenuOpen((v) => !v)}
                  >
                    Products
                  </ButtonBase>
                  <Popper
                    open={clientMenuOpen}
                    anchorEl={clientProductsMenuRef.current}
                    transition
                    placement="bottom-start"
                    style={{ zIndex: 1200, pointerEvents: clientMenuOpen ? undefined : 'none' }}
                  >
                    {({ TransitionProps }) => (
                      <Fade {...TransitionProps} timeout={250}>
                        <Paper
                          variant="outlined"
                          sx={(theme) => ({
                            mt: 1,
                            minWidth: 220,
                            overflow: 'hidden',
                            borderColor: 'grey.200',
                            bgcolor: 'background.paper',
                            boxShadow: `0px 4px 16px ${alpha(theme.palette.grey[200], 0.8)}`,
                            '& ul': { margin: 0, padding: 0, listStyle: 'none' },
                            '& li:not(:last-of-type)': { borderBottom: '1px solid', borderColor: theme.palette.divider },
                            '& a': { textDecoration: 'none' },
                            ...theme.applyDarkStyles({
                              borderColor: 'primaryDark.700',
                              bgcolor: 'primaryDark.900',
                              boxShadow: `0px 4px 16px ${alpha(theme.palette.common.black, 0.8)}`,
                              '& li:not(:last-of-type)': { borderColor: 'primaryDark.700' },
                            }),
                          })}
                        >
                          <ul>
                            {managedProducts.map((p) => (
                              <Box component="li" role="none" key={p._id} sx={(theme) => ({ p: 1.5, '&:hover': { bgcolor: 'grey.50' }, ...theme.applyDarkStyles({ '&:hover': { bgcolor: 'primaryDark.700' } }) })}>
                                <Box component={Link} href={p.url} sx={{ display: 'block' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography color="text.primary" variant="body2" fontWeight="700">
                                      {p.name}
                                    </Typography>
                                    {p.prerelease && p.prerelease !== 'none' && (
                                      <Chip label={p.prerelease.toUpperCase()} size="small" color={p.prerelease === 'alpha' ? 'error' : 'warning'} sx={{ fontWeight: 700, height: 20, '& .MuiChip-label': { px: 0.75, fontSize: '0.625rem' } }} />
                                    )}
                                  </Box>
                                  <Typography color="text.secondary" variant="caption">
                                    {p.description}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </ul>
                        </Paper>
                      </Fade>
                    )}
                  </Popper>
                </li>
              )}
              <li>
                <Link href={`/consulting/clients/${auth.clientId}`}>Deliverables</Link>
              </li>
              {hasInvoices && (
                <li>
                  <Link href={`/consulting/invoices?clientId=${auth.clientId}`}>Invoices</Link>
                </li>
              )}
              <li>
                <Link href="/consulting/users">Users</Link>
              </li>
              <li>
                <Link href={ROUTES.blog}>Blog</Link>
              </li>
            </React.Fragment>
          )}
          <li>
            <Link href={ROUTES.documentation}>Docs</Link>
          </li>
        </ul>
      </Navigation>
    );
  }

  // Unauthenticated nav
  return (
    <Navigation>
      <ul ref={navRef} onKeyDown={handleKeyDown}>
        {ALL_PRODUCTS.menu({ type: 'products', ...menuProps, menuRef: productsMenuRef})}
        {CONSULTING.menu({ type: 'consulting', ...menuProps, menuRef: consultingMenuRef})}
        <li>
          <Link href={ROUTES.about}>About us</Link>
        </li>
        <li>
          <Link href={ROUTES.blog}>Blog</Link>
        </li>
        {ALL_PRODUCTS.menu({ type: 'docs', ...menuProps, menuRef: docsMenuRef})}
      </ul>
    </Navigation>
  );
}
