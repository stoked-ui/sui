import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LaunchRounded from '@mui/icons-material/LaunchRounded';
import Slide from '@stoked-ui/docs/animation/Slide';
import FadeDelay from '@stoked-ui/docs/animation/FadeDelay';

const ratio = 900 / 494;

// 'transparent' is interpreted as transparent black in Safari
// See https://css-tricks.com/thing-know-gradients-transparent-black/
const transparent = 'rgba(255,255,255,0)';

const Image = styled('img')(({ theme }) => ({
  display: 'block',
  width: 200,
  height: 200 / ratio,
  [theme.breakpoints.up('sm')]: {
    width: 300,
    height: 300 / ratio,
  },
  [theme.breakpoints.up('md')]: {
    width: 450,
    height: 450 / ratio,
  },
  border: '4px solid',
  borderColor: theme.palette.grey[400],
  borderRadius: theme.shape.borderRadius,
  objectFit: 'cover',
  objectPosition: 'top',
  boxShadow: '0px 4px 20px rgba(61, 71, 82, 0.25)',
  ...theme.applyDarkStyles({
    borderColor: theme.palette.grey[800],
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.6)',
  }),
}));

const Anchor = styled('a')({
  display: 'inline-block',
  position: 'relative',
  transition: '0.3s',
  '&:hover, &:focus': {
    '& > div': {
      opacity: 1,
    },
  },
});

const linkMapping = {
  'Argos Health': { image: 'argos-health.png', url: 'https://enablecomp.com'},
  'Texas Auto': { image: 'texas-auto.png', url: 'https://texasauto.com'},
  'Phaser Lock': { image: 'phaser-lock.gif', url: 'https://www.phaserlock.com/'},
  'Aristocrat': {image: 'aristocrat.png', url: 'https://aristocrat.com' },
  'Map Health': { image: 'map_health.png', url: 'https://thisismap.com/'},
  '911 Inform': { image: '911-inform.gif', url: 'https://911inform.com'},
};

const brands = Object.keys(linkMapping) as Array<keyof typeof linkMapping>;

type TemplateBrand = (typeof brands)[number];

const StoreTemplateLink = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithChildren<{
    brand: TemplateBrand;
  }>
>(function StoreTemplateLink({ brand, ...props }, ref) {
  return (
    <Anchor
      ref={ref}
      aria-label="Go to Site"
      href={`${linkMapping[brand].url}`}
      target="_blank"
      {...props}
      style={{backgroundColor: 'white', borderRadius: '16px', display: 'grid', alignContent: 'center', border: '4px solid hsl(215, 15%, 22%)', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.6)', minHeight: 150, height:'max-content'}}
    >
        {props.children}
        <Box
          sx={{
            transition: '0.3s',
            borderRadius: 1,
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0,
            top: 0,
            left: 0,
            bgcolor: (theme) => alpha(theme.palette.primaryDark[500], 0.8),
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography fontWeight="bold">Go to site: {linkMapping[brand].url}</Typography>
          <LaunchRounded fontSize="small" sx={{ ml: 1 }} />
        </Box>
    </Anchor>
  );
});

const StoreTemplateImage = React.forwardRef<
  HTMLImageElement,
  { brand: TemplateBrand } & Omit<JSX.IntrinsicElements['img'], 'ref'>
>(function StoreTemplateImage({ brand, ...props }, ref) {
  return (
    <Image
      ref={ref}
      src={`/static/branding/about/group-photo/${linkMapping[brand].image}`}
      alt=""
      loading="lazy"
      style={{height: '100%', objectFit: 'contain', border: 'unset', boxShadow: 'unset'}}
      {...props}
    />
  );
});

export function PrefetchStoreTemplateImages() {
  function makeImg( num: number) {

    return {
      loading: 'lazy' as const,
      src: `/static/branding/about/group-photo/${Object.values(linkMapping)[num].image}`,
    };
  }
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'fixed',
        zIndex: -1,
        top: -1000,
        background: 'red',
        '& > img': {
          position: 'absolute',
          width: 'fit-content'
        },
        display: 'flex',
        alignContent: 'center'

      }}
    >
      {[...Array(6)].map((_, index) => (
        <React.Fragment key={index}>
          <img alt="" {...makeImg(index )} style={{objectFit: 'contain', alignSelf: 'center'}}/>
        </React.Fragment>
      ))}
    </Box>
  );
}

const defaultSlideDown = {
  '0%': {
    transform: 'translateY(-300px)',
  },
  '100%': {
    transform: 'translateY(-60px)',
  },
};
export function StoreTemplatesSet1({
  keyframes = defaultSlideDown,
  disableLink,
  ...props
}: { disableLink?: boolean; keyframes?: Record<string, object> } & BoxProps) {
  function renderTemplate(brand: TemplateBrand) {
    if (disableLink) {
      return <StoreTemplateImage brand={brand} />;
    }
    return (
      <StoreTemplateLink brand={brand}>
        <StoreTemplateImage brand={brand} />
      </StoreTemplateLink>
    );
  }
  return (
    <Slide animationName="template-slidedown" {...props} keyframes={keyframes}>
      <FadeDelay delay={400}>{renderTemplate(brands[4])}</FadeDelay>
      <FadeDelay delay={200}>{renderTemplate(brands[2])}</FadeDelay>
      <FadeDelay delay={0}>{renderTemplate(brands[0])}</FadeDelay>
    </Slide>
  );
}

const defaultSlideUp = {
  '0%': {
    transform: 'translateY(150px)',
  },
  '100%': {
    transform: 'translateY(-20px)',
  },
};
export function StoreTemplatesSet2({
  keyframes = defaultSlideUp,
  disableLink,
  ...props
}: { disableLink?: boolean; keyframes?: Record<string, object> } & BoxProps) {
  function renderTemplate(brand: TemplateBrand) {
    if (disableLink) {
      return <StoreTemplateImage brand={brand} />;
    }
    return (
      <StoreTemplateLink brand={brand}>
        <StoreTemplateImage brand={brand} />
      </StoreTemplateLink>
    );
  }
  return (
    <Slide animationName="template-slidedup" {...props} keyframes={keyframes}>
      <FadeDelay delay={100}>{renderTemplate(brands[1])}</FadeDelay>
      <FadeDelay delay={300}>{renderTemplate(brands[3])}</FadeDelay>
      <FadeDelay delay={500}>{renderTemplate(brands[5])}</FadeDelay>
    </Slide>
  );
}

export default function CustomerShowcase() {
  return (
    <Box
      sx={{
        mx: { xs: -2, sm: -3, md: 0 },
        my: { md: -18 },
        height: { xs: 300, sm: 360, md: 'calc(100% + 320px)' },
        overflow: 'hidden',
        position: 'relative',
        width: { xs: '100vw', md: '50vw' },
      }}
    >
      <Box
        sx={(theme) => ({
          display: { xs: 'block', md: 'none' },
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
          ...theme.applyDarkStyles({
            background: `linear-gradient(to bottom, ${
              theme.palette.primaryDark[900]
            } 0%, ${alpha(theme.palette.primaryDark[900], 0)} 30%, ${alpha(
              theme.palette.primaryDark[900],
              0,
            )} 70%, ${theme.palette.primaryDark[900]} 100%)`,
          }),
        })}
      />
      <Box
        sx={{
          // need perspective on this wrapper to work in Safari
          height: '100%',
          position: 'relative',
          perspective: '1000px',
        }}
      >
        <Box
          sx={{
            left: { xs: '45%', md: '40%' },
            position: 'absolute',
            zIndex: -1,
            display: 'flex',
            transform: 'translateX(-40%) rotateZ(-30deg) rotateX(8deg) rotateY(8deg)',
            transformOrigin: 'center center',
          }}
        >
          <StoreTemplatesSet1 />
          <StoreTemplatesSet2 sx={{ ml: { xs: 2, sm: 4, md: 8 } }} />
        </Box>
      </Box>
      <Box
        sx={(theme) => ({
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          top: 0,
          left: 0,
          width: 400,
          height: '150%',
          pointerEvents: 'none',
          zIndex: 10,
          background: `linear-gradient(to right, ${
            theme.palette.primary[50]
          }, ${transparent})`,
          ...theme.applyDarkStyles({
            background: `linear-gradient(to right, ${
              theme.palette.primaryDark[900]
            }, ${alpha(theme.palette.primary[900], 0)})`,
          }),
        })}
      />
    </Box>
  );
}
