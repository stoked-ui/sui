/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { unstable_debounce as debounce } from '@mui/utils';
import Tooltip from '@mui/material/Tooltip';
import AdminPanelSettingsRounded from '@mui/icons-material/AdminPanelSettingsRounded';
import ROUTES from 'docs/src/route';
import { PRODUCTS, CONSULTING, useAllProducts } from 'docs/src/products';
import { Link } from '@stoked-ui/docs';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';
import { toAbsoluteSitePath } from 'docs/src/modules/utils/siteRouting';
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
  const allProducts = useAllProducts();
  const [subMenuOpen, setSubMenuOpen] = React.useState<SubMenuType>(null);
  const [subMenuIndex, setSubMenuIndex] = React.useState<number | null>(null);
  const navRef = React.useRef<HTMLUListElement | null>(null);
  const productsMenuRef = React.useRef<HTMLButtonElement>(null);
  const docsMenuRef = React.useRef<HTMLButtonElement>(null);
  const consultingMenuRef = React.useRef<HTMLButtonElement>(null);
  const isAdmin = auth?.role === 'admin';
  const adminIcon = (adminHref: string, label: string) => (
    <Tooltip title={label} placement="bottom">
      <Link
        href={adminHref}
        sx={{
          display: 'inline-flex !important',
          alignItems: 'center',
          padding: '3px !important',
          ml: 0.25,
          opacity: 0.45,
          '&:hover': { opacity: 1 },
        }}
      >
        <AdminPanelSettingsRounded sx={{ fontSize: 14 }} />
      </Link>
    </Tooltip>
  );
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
    if (!auth || auth.role !== 'client' || !auth.clientId) {return;}
    const stored = localStorage.getItem('auth');
    if (!stored) {return;}
    let token: string | null = null;
    try {
      token = JSON.parse(stored).access_token;
    } catch { /* ignore */ }
    if (!token) {return;}
    fetch(getApiUrl(`/api/invoices/has-invoices?clientId=${auth.clientId}`), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.hasInvoices) {setHasInvoices(true);}
      })
      .catch(() => {});
  }, [auth]);

  return (
    <Navigation>
      <ul ref={navRef} onKeyDown={handleKeyDown}>
        {allProducts.menu({
          type: 'products',
          ...menuProps,
          menuRef: productsMenuRef,
          linkType: isAdmin ? 'admin' : 'product',
          adminHref: isAdmin ? toAbsoluteSitePath('consulting', '/consulting/admin/products') : undefined,
        })}
        {CONSULTING.menu({ type: 'consulting', ...menuProps, menuRef: consultingMenuRef })}
        <li>
          <Link href={ROUTES.about}>About us</Link>
        </li>
        {auth && isAdmin && (
          <React.Fragment>
            <li>
              <Link href={toAbsoluteSitePath('consulting', '/consulting/clients')}>Clients</Link>
            </li>
            <li>
              <Link href={toAbsoluteSitePath('consulting', '/consulting/users')}>Users</Link>
            </li>
          </React.Fragment>
        )}
        {auth && !isAdmin && (
          <React.Fragment>
            <li>
              <Link href={toAbsoluteSitePath('consulting', `/consulting/clients/${auth.clientSlug || auth.clientId}`)}>Deliverables</Link>
            </li>
            {hasInvoices && (
              <li>
                <Link href={toAbsoluteSitePath('consulting', `/consulting/invoices?clientId=${auth.clientId}`)}>Invoices</Link>
              </li>
            )}
            <li>
              <Link href={toAbsoluteSitePath('consulting', '/consulting/users')}>Users</Link>
            </li>
          </React.Fragment>
        )}
        <li>
          <Link href={ROUTES.blog}>Blog</Link>
          {isAdmin && adminIcon('/blog/editor', 'Blog admin')}
        </li>
        {isAdmin && (
          <li>
            <Link href={toAbsoluteSitePath('consulting', '/consulting/api-docs')}>API</Link>
          </li>
        )}
        {allProducts.menu({ type: 'docs', ...menuProps, menuRef: docsMenuRef, adminHref: isAdmin ? toAbsoluteSitePath('consulting', '/consulting/api-docs') : undefined })}
      </ul>
    </Navigation>
  );
}
