import * as React from 'react';
import { styled } from '@mui/material/styles';
import { adShape } from './AdManager';
import { GA_ADS_DISPLAY_RATIO } from '../components/constants';
import getAdStylesObject from './ad.styles';

interface Ad {
  label?: string;
  link: string;
  img: string;
  name: string;
  description: string;
  poweredby: string;
}

interface AdDisplayProps {
  ad: Ad;
  className?: string;
  shape?: 'inline' | 'auto';
}

const Root = styled('span', { shouldForwardProp: (prop) => prop !== 'shape' })<{
  shape: 'inline' | string;
}>(({ theme, shape }) => {
  const styles = getAdStylesObject(theme, shape);

  return {
    ...styles.root,
    '& img': styles.img,
    '& a, & a:hover': styles.a,
    '& .AdDisplay-imageWrapper': styles.imgWrapper,
    '& .AdDisplay-description': styles.description,
    '& .AdDisplay-poweredby': styles.poweredby,
  };
});

function AdDisplay({ ad, className, shape = 'auto' }: AdDisplayProps) {
  React.useEffect(() => {
    // Avoid exceeding the Google Analytics quotas.
    if (Math.random() > GA_ADS_DISPLAY_RATIO || !ad.label) {
      return;
    }

    window.gtag('event', 'ad', {
      eventAction: 'display',
      eventLabel: ad.label,
    });
  }, [ad.label]);

  return (
    <Root shape={shape === 'inline' ? 'inline' : adShape} className={className}>
      <a
        href={ad.link}
        target="_blank"
        rel="noopener sponsored"
        {...(ad.label && {
          'data-ga-event-category': 'ad',
          'data-ga-event-action': 'click',
          'data-ga-event-label': ad.label,
        })}
      >
        <span className="AdDisplay-imageWrapper">
          <img height="100" width="130" src={ad.img} alt={ad.name} />
        </span>
        <span
          className="AdDisplay-description"
          dangerouslySetInnerHTML={{ __html: ad.description }}
        />
      </a>
      <span className="AdDisplay-poweredby">ad by {ad.poweredby}</span>
    </Root>
  );
}

export default AdDisplay;
