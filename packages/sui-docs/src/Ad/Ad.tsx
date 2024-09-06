import * as React from 'react';
import Box from '@mui/material/Box';
import { GA_ADS_DISPLAY_RATIO } from '../components/constants';
import { AdContext, adShape } from './AdManager';
import AdErrorBoundary from './AdErrorBoundary';

const disableAd = process.env.NODE_ENV !== 'production' && process.env.ENABLE_AD_IN_DEV_MODE !== 'true';

export const AD_MARGIN_TOP = 3;
export const AD_MARGIN_BOTTOM = 3;
export const AD_HEIGHT = 126;
export const AD_HEIGHT_MOBILE = 126 + 16;

function isBot() {
  return /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
}

export default function Ad() {
  const [adblock, setAdblock] = React.useState<boolean | null>(null);
  const [carbonOut, setCarbonOut] = React.useState<boolean | null>(null);

  const { current: randomAdblock } = React.useRef(Math.random());

  let children;
  let label;
  if ((typeof window !== 'undefined' && isBot()) || disableAd) {
    children = <span />;
  } else if (adblock) {
    if (randomAdblock < 0.2) {
      children = <React.Fragment />;
      label = 'in-house-adblock';
    } else {
      children = <React.Fragment />;
      label = 'in-house';
    }
  } else if (carbonOut) {
    children = <React.Fragment />;
    label = 'in-house-carbon';
  } else {
    children = <React.Fragment />;
    label = 'carbon';
  }

  const ad = React.useContext(AdContext);
  const eventLabel = label ? `${label}-${ad.placement}-${adShape}` : undefined;

  const timerAdblock = React.useRef<NodeJS.Timeout | null>(null);

  const checkAdblock = React.useCallback(
    (attempt = 1) => {
      if (
        document.querySelector('.ea-placement') ||
        document.querySelector('#carbonads') ||
        document.querySelector('.carbonads') ||
        carbonOut
      ) {
        if (
          document.querySelector('#carbonads a') &&
          document.querySelector('#carbonads a')?.getAttribute('href') ===
          'https://material-ui-next.com/discover-more/backers'
        ) {
          setCarbonOut(true);
        }

        setAdblock(false);
        return;
      }

      if (attempt < 30) {
        timerAdblock.current = setTimeout(() => {
          checkAdblock(attempt + 1);
        }, 500);
      }

      if (attempt > 6) {
        setAdblock(true);
      }
    },
    [carbonOut],
  );

  React.useEffect(() => {
    if (disableAd) {
      return undefined;
    }
    checkAdblock();

    return () => {
      if (timerAdblock.current) {
        clearTimeout(timerAdblock.current);
      }
    };
  }, [checkAdblock]);

  React.useEffect(() => {
    if (Math.random() > GA_ADS_DISPLAY_RATIO || !eventLabel) {
      return undefined;
    }

    const delay = setTimeout(() => {
      window.gtag('event', 'ad', {
        eventAction: 'display',
        eventLabel,
      });
    }, 2500);

    return () => {
      clearTimeout(delay);
    };
  }, [eventLabel]);

  return (
    <Box
      component="span"
      sx={(theme) => ({
        position: 'relative',
        display: 'block',
        mt: AD_MARGIN_TOP,
        mb: AD_MARGIN_BOTTOM,
        minHeight: AD_HEIGHT_MOBILE,
        [theme.breakpoints.up('sm')]: {
          minHeight: AD_HEIGHT,
        },
        ...(adShape === 'image' && {}),
        ...(adShape === 'inline' && {
          display: 'flex',
          alignItems: 'flex-end',
        }),
        ...(adShape === 'inline' && {
          display: 'flex',
          alignItems: 'flex-end',
        }),
      })}
      data-ga-event-category="ad"
      data-ga-event-action="click"
      data-ga-event-label={eventLabel}
      className="Ad-root"
    >
      <AdErrorBoundary eventLabel={eventLabel}>{children}</AdErrorBoundary>
    </Box>
  );
}
