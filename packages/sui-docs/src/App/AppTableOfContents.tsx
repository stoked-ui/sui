/* eslint-disable react/no-danger */
import * as React from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';
import { styled, alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import NoSsr from '@mui/material/NoSsr';
import { DebouncedFunc } from 'lodash';
import { Link } from '../Link';
import { useTranslate } from '../i18n';
import { samePageLinkNavigation } from '../Markdown/MarkdownLinks';
import TableOfContentsBanner from '../banner/TableOfContentsBanner';
import DiamondSponsors from '../components/DiamondSponsors';

const Nav = styled('nav')(({ theme }) => ({
  top: 'var(--MuiDocs-header-height)',
  marginTop: 'var(--MuiDocs-header-height)',
  paddingLeft: 6,
  position: 'sticky',
  height: 'calc(100vh - var(--MuiDocs-header-height))',
  overflowY: 'auto',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(7),
  paddingRight: theme.spacing(4),
  display: 'none',
  scrollbarWidth: 'thin',
  [theme.breakpoints.up('md')]: {
    display: 'block',
  },
}));

const NavLabel = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 0, 1, 1.4),
  fontSize: theme.typography.pxToRem(11),
  fontWeight: theme.typography.fontWeightBold,
  textTransform: 'uppercase',
  letterSpacing: '.1rem',
  color: theme.palette.text.tertiary,
}));

const NavList = styled('ul')({
  padding: 0,
  margin: 0,
  listStyle: 'none',
});

const NavItem = styled(Link, {
  shouldForwardProp: (prop) =>
    prop !== 'active' && prop !== 'secondary' && prop !== 'secondarySubItem',
})<{ active?: boolean; secondary?: boolean; secondarySubItem?: boolean }>(
  ({ active, secondary, secondarySubItem, theme }) => {
    const activeStyles = {
      borderLeftColor: theme.palette.primary[200],
      color: theme.palette.primary[600],
      '&:hover': {
        borderLeftColor: theme.palette.primary[600],
        color: theme.palette.primary[600],
      },
    };
    const activeDarkStyles = {
      borderLeftColor: theme.palette.primary[600],
      color: theme.palette.primary[300],
      '&:hover': {
        borderLeftColor: theme.palette.primary[400],
        color: theme.palette.primary[400],
      },
    };
    let paddingLeft: string | number = '12px';
    if (secondary) {
      paddingLeft = 3;
    }
    if (secondarySubItem) {
      paddingLeft = 4.5;
    }

    return [
      {
        boxSizing: 'border-box',
        padding: theme.spacing('6px', 0, '6px', paddingLeft),
        borderLeft: `1px solid transparent`,
        display: 'block',
        fontSize: theme.typography.pxToRem(13),
        fontWeight: theme.typography.fontWeightMedium,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        '&:hover': {
          borderLeftColor: theme.palette.grey[400],
          color: theme.palette.grey[600],
        },
        ...(!active && {
          color: theme.palette.text.primary,
        }),
        ...(active && activeStyles),
        '&:active': activeStyles,
      },
      theme.applyDarkStyles({
        '&:hover': {
          borderLeftColor: theme.palette.grey[500],
          color: theme.palette.grey[200],
        },
        ...(!active && {
          color: theme.palette.grey[500],
        }),
        ...(active && activeDarkStyles),
        '&:active': activeDarkStyles,
      }),
    ];
  }
);

const noop = () => {};

function useThrottledOnScroll(callback?: () => void, delay?: number) {
  const throttledCallback = React.useMemo(
    () => (callback ? throttle(callback, delay) : noop),
    [callback, delay]
  );

  React.useEffect(() => {
    if (throttledCallback === noop) {
      return undefined;
    }

    window.addEventListener('scroll', throttledCallback);
    return () => {
      window.removeEventListener('scroll', throttledCallback);
      (throttledCallback as  DebouncedFunc<() => void>).cancel();
    };
  }, [throttledCallback]);
}

interface TocItem {
  hash: string;
  text: string;
  children: TocItem[];
}

interface AppTableOfContentsProps {
  toc: TocItem[];
}

function flatten(headings: TocItem[]): TocItem[] {
  const itemsWithNode: TocItem[] = new Array();

  headings.forEach((item) => {
    itemsWithNode.push(item);

    if (item.children.length > 0) {
      item.children.forEach((subitem) => {
        itemsWithNode.push(subitem);
      });
    }
  });
  return itemsWithNode;
}

function shouldShowJobAd(): boolean {
  const date = new Date();
  const timeZoneOffset = date.getTimezoneOffset();
  if (timeZoneOffset <= -5.5 * 60 || timeZoneOffset >= 8 * 60) {
    return false;
  }
  return true;
}

export default function AppTableOfContents({ toc }: AppTableOfContentsProps) {
  const t = useTranslate();

  const items = React.useMemo(() => flatten(toc), [toc]);
  const [activeState, setActiveState] = React.useState<string | null>(null);
  const clickedRef = React.useRef(false);
  const unsetClickedRef = React.useRef<number | null>(null);

  const findActiveIndex = React.useCallback(() => {
    if (clickedRef.current) {
      return;
    }

    let active: TocItem | null = null;
    for (let i = items.length - 1; i >= 0; i -= 1) {
      if (document.documentElement.scrollTop < 200) {
        active = { hash: '', text: '', children: [] };
        break;
      }

      const item = items[i];
      const node = document.getElementById(item.hash);

      if (process.env.NODE_ENV !== 'production') {
        if (!node) {
          console.error(`Missing node on the item ${JSON.stringify(item, null, 2)}`);
        }
      }

      if (
        node &&
        node.offsetTop <
        document.documentElement.scrollTop + document.documentElement.clientHeight / 8
      ) {
        active = item;
        break;
      }
    }

    if (active && activeState !== active.hash) {
      setActiveState(active.hash);
    }
  }, [activeState, items]);

  useThrottledOnScroll(items.length > 0 ? findActiveIndex : undefined, 166);

  const handleClick = (hash: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (samePageLinkNavigation(event)) {
      return;
    }

    clickedRef.current = true;
    unsetClickedRef.current = window.setTimeout(() => {
      clickedRef.current = false;
    }, 1000);

    if (activeState !== hash) {
      setActiveState(hash);
    }
  };

  React.useEffect(() => {
    return () => {
      if (unsetClickedRef.current) {
        clearTimeout(unsetClickedRef.current);
      }
    };
  }, []);

  const itemLink = (item: TocItem, secondary = false, secondarySubItem = false) => (
    <NavItem
      display="block"
      href={`#${item.hash}`}
      underline="none"
      onClick={handleClick(item.hash)}
      active={activeState === item.hash}
      secondary={secondary}
      secondarySubItem={secondarySubItem}
    >
      <span dangerouslySetInnerHTML={{ __html: item.text }} />
    </NavItem>
  );

  return (
    <Nav aria-label={t('pageTOC')}>
      <TableOfContentsBanner />
      <NoSsr>
        {shouldShowJobAd() && (
          <Link
            href="https://jobs.ashbyhq.com/SUI?utm_source=2vOWXNv1PE"
            target="_blank"
            sx={[
              (theme) => ({
                mb: 2,
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                backgroundColor: alpha(theme.palette.grey[50], 0.4),
                border: '1px solid',
                borderColor: theme.palette.grey[200],
                borderRadius: 1,
                transitionProperty: 'all',
                transitionTiming: 'cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDuration: '150ms',
                '&:hover, &:focus-visible': {
                  borderColor: theme.palette.primary[200],
                },
              }),
              (theme) =>
                theme.applyDarkStyles({
                  backgroundColor: alpha(theme.palette.primary[900], 0.2),
                  borderColor: theme.palette.primary[800],
                }),
            ]}
          >
            <Typography
              component="span"
              variant="body2"
              sx={{ mt: 0.5 }}
            >
              {'We\'re looking for React Engineers and other amazing roles－come find out more!'}
            </Typography>
          </Link>
        )}
      </NoSsr>
      {toc.length > 0 ? (
        <React.Fragment>
          <NavLabel>{t('tableOfContents')}</NavLabel>
          <NavList>
            {toc.map((item) => (
              <li key={item.text}>
                {itemLink(item)}
                {item.children.length > 0 ? (
                  <NavList>
                    {item.children.map((subitem) => (
                      <li key={subitem.text}>
                        {itemLink(subitem, true)}
                        {subitem.children?.length > 0 ? (
                          <NavList>
                            {subitem.children.map((nestedSubItem) => (
                              <li key={nestedSubItem.text}>
                                {itemLink(nestedSubItem, false, true)}
                              </li>
                            ))}
                          </NavList>
                        ) : null}
                      </li>
                    ))}
                  </NavList>
                ) : null}
              </li>
            ))}
          </NavList>
        </React.Fragment>
      ) : null}
      <DiamondSponsors />
    </Nav>
  );
}

AppTableOfContents.propTypes = {
  toc: PropTypes.arrayOf(
    PropTypes.shape({
      children: PropTypes.array,
      hash: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
} as any;
