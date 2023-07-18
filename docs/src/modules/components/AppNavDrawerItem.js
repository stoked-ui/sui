import * as React from 'react';
import PropTypes from 'prop-types';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { alpha, styled } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import { shouldHandleLinkClick } from 'docs/src/modules/components/MarkdownLinks';
import Link from 'docs/src/modules/components/Link';
import standardNavIcons from './AppNavIcons';

const Item = styled(
  function Item({ component: Component = 'div', ...props }) {
    return <Component {...props} />;
  },
  {
    shouldForwardProp: (prop) => prop !== 'depth' && prop !== 'hasIcon' && prop !== 'subheader',
  },
)(({ theme, hasIcon, depth, subheader }) => {
  const color = {
    color: (theme.vars || theme).palette.text.secondary,
    ...(depth === 0 && {
      color: (theme.vars || theme).palette.text.primary,
    }),
    ...(subheader && {
      color: (theme.vars || theme).palette.grey[600],
    }),
  };

  return [
    {
      ...theme.typography.body2,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      borderRadius: 6,
      outline: 0,
      width: '100%',
      padding: 6,
      justifyContent: 'flex-start',
      fontWeight:
        depth === 0 ? theme.typography.fontWeightSemiBold : theme.typography.fontWeightMedium,
      transition: theme.transitions.create(['color', 'background-color'], {
        duration: theme.transitions.duration.shortest,
      }),
      fontSize: theme.typography.pxToRem(14),
      textDecoration: 'none',
      paddingLeft: 31 + (depth > 1 ? (depth - 1) * 10 : 0),
      '&:before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: 1,
        left: 11.5,
        height: '100%',
        width: 1,
        opacity: depth === 0 ? 0 : 1,
        background: (theme.vars || theme).palette.grey[100],
      },
      ...color,
      ...(subheader && {
        marginTop: theme.spacing(1),
        textTransform: 'uppercase',
        letterSpacing: '.08rem',
        fontWeight: theme.typography.fontWeightBold,
        fontSize: theme.typography.pxToRem(11),
        '&:before': {
          content: '""',
          display: 'block',
          position: 'absolute',
          zIndex: 1,
          left: 11.5,
          height: '55%',
          top: 16,
          width: 1,
          opacity: depth === 0 ? 0 : 1,
          background: (theme.vars || theme).palette.grey[100],
        },
        '&:after': {
          content: '""',
          display: 'block',
          position: 'absolute',
          zIndex: 5,
          left: 8,
          height: 8,
          width: 8,
          borderRadius: 2,
          opacity: depth === 0 ? 0 : 1,
          background: alpha(theme.palette.grey[50], 0.5),
          border: '1px solid',
          borderColor: (theme.vars || theme).palette.grey[200],
        },
      }),
      ...(hasIcon && {
        paddingLeft: 2,
      }),
      '&.app-drawer-active': {
        // To match browserUrlPreviewMarge
        scrollMarginBottom: 120,
        color: (theme.vars || theme).palette.primary[600],
        backgroundColor: (theme.vars || theme).palette.primary[50],
        '&:hover': {
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.hoverOpacity}))`
            : alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
              ),
          '@media (hover: none)': {
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.selectedOpacity})`
              : alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
          },
        },
        '&.Mui-focusVisible': {
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.focusOpacity}))`
            : alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity + theme.palette.action.focusOpacity,
              ),
        },
        '&:before': {
          background: (theme.vars || theme).palette.primary[400],
        },
      },
      '& .MuiChip-root': {
        marginTop: '2px',
      },
      ...(!subheader && {
        '&:hover': {
          color: (theme.vars || theme).palette.common.black,
          backgroundColor: (theme.vars || theme).palette.grey[50],
          '@media (hover: none)': {
            color: color.color,
            backgroundColor: 'transparent',
          },
        },
      }),
      '&.Mui-focusVisible': {
        backgroundColor: (theme.vars || theme).palette.action.focus,
      },
      [theme.breakpoints.up('md')]: {
        paddingTop: 4,
        paddingBottom: 4,
      },
      '& .ItemButtonIcon': {
        marginRight: '5px',
        color: (theme.vars || theme).palette.primary.main,
      },
      '&:hover .ItemButtonIcon': {
        color: (theme.vars || theme).palette.text.primary,
        '@media (hover: none)': {
          color: (theme.vars || theme).palette.primary.main,
        },
      },
    },
    theme.applyDarkStyles({
      ...color,
      '&:before': {
        background: alpha(theme.palette.primaryDark[700], 0.6),
      },
      '&.app-drawer-active': {
        color: (theme.vars || theme).palette.primary[300],
        backgroundColor: (theme.vars || theme).palette.primaryDark[700],
        '&:before': {
          background: (theme.vars || theme).palette.primary[400],
        },
      },
      ...(subheader && {
        '&:before': {
          background: alpha(theme.palette.primaryDark[700], 0.6),
        },
        '&:after': {
          background: alpha(theme.palette.primaryDark[700], 0.8),
          borderColor: alpha(theme.palette.primaryDark[600], 0.6),
        },
      }),
      ...(!subheader && {
        '&:hover': {
          color: '#fff',
          backgroundColor: alpha(theme.palette.primaryDark[700], 0.4),
          '@media (hover: none)': {
            color: color.color,
            backgroundColor: 'transparent',
          },
        },
      }),
    }),
  ];
});

const ItemButtonIcon = styled(KeyboardArrowRightRoundedIcon, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ open }) => ({
  fontSize: '1rem',
  transform: open && 'rotate(90deg)',
}));

const StyledLi = styled('li', { shouldForwardProp: (prop) => prop !== 'depth' })(
  ({ theme, depth }) => ({
    display: 'block',
    padding: depth === 0 ? theme.spacing(1, '10px', 0, '10px') : 0,
  }),
);

export const sxChip = (color) => [
  (theme) => ({
    ml: 1.5,
    fontSize: theme.typography.pxToRem(10),
    fontWeight: 'semiBold',
    textTransform: 'uppercase',
    letterSpacing: '.04rem',
    height: '16px',
    border: 1,
    borderColor: (theme.vars || theme).palette[color][300],
    bgcolor: alpha(theme.palette[color][100], 0.5),
    color: (theme.vars || theme).palette[color][700],
    '&:hover': {
      bgcolor: alpha(theme.palette[color][100], 0.5),
    },
    '& .MuiChip-label': {
      px: 0.6,
    },
  }),
  (theme) =>
    theme.applyDarkStyles({
      borderColor: alpha(theme.palette[color][800], 0.5),
      bgcolor: alpha(theme.palette[color][800], 0.5),
      color: (theme.vars || theme).palette[color][300],
      '&:hover': {
        bgcolor: alpha(theme.palette[color][900], 0.5),
      },
    }),
];

function DeadLink(props) {
  const { activeClassName, href, noLinkStyle, prefetch, ...other } = props;
  return <div {...other} />;
}

DeadLink.propTypes = {
  activeClassName: PropTypes.any,
  href: PropTypes.any,
  noLinkStyle: PropTypes.any,
  prefetch: PropTypes.any,
};

export default function AppNavDrawerItem(props) {
  const {
    children,
    depth,
    href,
    icon,
    legacy,
    newFeature,
    comingSoon,
    linkProps,
    onClick,
    openImmediately,
    plan = 'community',
    subheader,
    title,
    topLevel = false,
    ...other
  } = props;
  const expandable = openImmediately != null;
  const [open, setOpen] = React.useState(openImmediately);
  const handleClick = (event) => {
    // Ignore the action if opening the link in a new tab
    if (shouldHandleLinkClick(event)) {
      return;
    }

    if (onClick) {
      onClick(event);
    }

    if (expandable && !subheader) {
      event.preventDefault();
      setOpen((oldOpen) => !oldOpen);
    }
  };

  const hasIcon = icon && (typeof icon !== 'string' || !!standardNavIcons[icon]);

  return (
    <StyledLi {...other} depth={depth}>
      {/* Fix overloading with prefetch={false}, only prefetch on hover */}
      <Item
        component={subheader ? DeadLink : Link}
        depth={depth}
        hasIcon={hasIcon}
        href={href}
        prefetch={false}
        subheader={subheader}
        activeClassName={expandable ? null : 'app-drawer-active'}
        className={topLevel ? 'algolia-lvl0' : null}
        onClick={handleClick}
        {...linkProps}
      >
        {expandable && !subheader && <ItemButtonIcon className="ItemButtonIcon" open={open} />}
        {title}
        {plan === 'pro' && <span className="plan-pro" title="Pro plan" />}
        {plan === 'premium' && <span className="plan-premium" title="Premium plan" />}
        {legacy && <Chip label="Legacy" sx={sxChip('warning')} />}
        {newFeature && <Chip label="New" sx={sxChip('success')} />}
        {comingSoon && <Chip label="Coming soon" sx={sxChip('grey')} />}
      </Item>
      {expandable ? (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {children}
        </Collapse>
      ) : (
        children
      )}
    </StyledLi>
  );
}

AppNavDrawerItem.propTypes = {
  children: PropTypes.node,
  comingSoon: PropTypes.bool,
  depth: PropTypes.number.isRequired,
  href: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  icon: PropTypes.elementType,
  legacy: PropTypes.bool,
  linkProps: PropTypes.object,
  newFeature: PropTypes.bool,
  onClick: PropTypes.func,
  openImmediately: PropTypes.bool,
  plan: PropTypes.oneOf(['community', 'pro', 'premium']),
  subheader: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  topLevel: PropTypes.bool,
};
