import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useUserLanguage } from '@mui/docs/i18n';
import { useRouter } from 'next/router';
import { useNoSsrCodeStyling } from '../utils/codeStylingSolution';

function handleClick(event: MouseEvent): void {
  let element: HTMLElement | null = event.target as HTMLElement;

  while (element && element !== document.body) {
    const category = element.getAttribute('data-ga-event-category');

    if (category) {
      const split = parseFloat(element.getAttribute('data-ga-event-split') || '1');

      if (split && split < Math.random()) {
        return;
      }

      window.gtag('event', category, {
        eventAction: element.getAttribute('data-ga-event-action'),
        eventLabel: element.getAttribute('data-ga-event-label'),
      });
      break;
    }

    element = element.parentElement;
  }
}

let boundDataGaListener = false;

function GoogleAnalytics(): null {
  React.useEffect(() => {
    if (!boundDataGaListener) {
      boundDataGaListener = true;
      document.addEventListener('click', handleClick);
    }
  }, []);

  const router = useRouter();
  React.useEffect(() => {
    const handleRouteChange = (url: string) => {
      window.gtag('config', process.env.GA_MEASUREMENT_ID ?? '', {
        page_path: url,
      });
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const userLanguage = useUserLanguage();
  React.useEffect(() => {
    window.gtag('set', 'user_properties', {
      userLanguage,
    });
  }, [userLanguage]);

  React.useEffect(() => {
    function trackDevicePixelRation() {
      const devicePixelRatio = Math.round(window.devicePixelRatio * 10) / 10;
      window.gtag('set', 'user_properties', {
        devicePixelRatio,
      });
    }

    trackDevicePixelRation();

    const matchMedia = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    matchMedia.addListener(trackDevicePixelRation);
    return () => {
      matchMedia.removeListener(trackDevicePixelRation);
    };
  }, []);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const colorSchemeOS = prefersDarkMode ? 'dark' : 'light';

  const theme = useTheme();
  const colorScheme = theme.palette.mode;

  React.useEffect(() => {
    window.gtag('set', 'user_properties', {
      colorSchemeOS,
    });
  }, [colorSchemeOS]);
  React.useEffect(() => {
    window.gtag('set', 'user_properties', {
      colorScheme,
    });
  }, [colorScheme]);

  const codeStylingVariant = useNoSsrCodeStyling();
  React.useEffect(() => {
    window.gtag('set', 'user_properties', {
      codeStylingVariant,
    });
  }, [codeStylingVariant]);

  return null;
}

export default React.memo(GoogleAnalytics);
