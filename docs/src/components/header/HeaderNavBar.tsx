/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { unstable_debounce as debounce } from '@mui/utils';
import ROUTES from 'docs/src/route';
import { ProductIds } from '@stoked-ui/docs/Products'
import getProducts from 'docs/src/products';
import { Link } from '@mui/docs/Link';

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

export default function HeaderNavBar() {
  const PRODUCTS = getProducts();
  const [subMenuOpen, setSubMenuOpen] = React.useState<null | 'products' | 'docs'>(null);
  const [subMenuIndex, setSubMenuIndex] = React.useState<number | null>(null);
  const navRef = React.useRef<HTMLUListElement | null>(null);
  const productsMenuRef = React.useRef<HTMLButtonElement>(null);
  const docsMenuRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (typeof subMenuIndex === 'number') {
      document.getElementById(ProductIds[subMenuIndex])?.focus();
    }
  }, [subMenuIndex]);

  function handleKeyDown(event: React.KeyboardEvent) {
    let menuItem;

    if (subMenuOpen === 'products') {
      menuItem = productsMenuRef.current!;
    } else if (subMenuOpen === 'docs') {
      menuItem = docsMenuRef.current!;
    } else {
      return;
    }

    if (event.key === 'ArrowDown' && subMenuOpen === 'products') {
      event.preventDefault();
      setSubMenuIndex((prevValue) => {
        if (prevValue === null) {
          return 0;
        }
        if (prevValue === ProductIds.length - 1) {
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
          return ProductIds.length - 1;
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
    return ProductIds[subMenuIndex];
  }

  const menuProps = {
    handleClickMenu,
    setSubMenuOpenUndebounce,
    setSubMenuOpenDebounced,
    subMenuOpen,
    setSubMenuOpen,
    currentProductId: getCurrentProductId(),
  }
  return (
    <Navigation>
      <ul ref={navRef} onKeyDown={handleKeyDown}>
        {PRODUCTS.menu({ type: 'products', ...menuProps, menuRef: productsMenuRef})}
        {PRODUCTS.menu({ type: 'docs', ...menuProps, menuRef: docsMenuRef})}
        <li>
          <Link href={ROUTES.about}>About us</Link>
        </li>
        <li>
          <Link href={ROUTES.blog}>Blog</Link>
        </li>
      </ul>
    </Navigation>
  );
}
