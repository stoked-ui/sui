import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled, keyframes } from '@mui/material/styles';
import Section from 'docs/src/layouts/Section';
import GradientText from 'docs/src/components/typography/GradientText';
import TeamStatistics from 'docs/src/components/about/TeamStatistics';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';

const teamPhotos = [
  {
    img: '/static/branding/about/group-photo/aristocrat.png',
    title: '',
  },
  {
    img: 'https://cenv-public.s3.amazonaws.com/phaser-lock.gif',
    title: '',
  },
  {
    img: 'https://stokedconsulting.com/img/texas-auto.png',
    title: '',
  },
  {
    img: 'https://stokedconsulting.com/img/argos-health.png',
    title: '',
  },
  {
    img: 'https://stokedconsulting.com/img/map_health.jpg',
    title: '',
  },
];

const ImageContainer = styled('div')(() => ({
  display: 'flex',
  gap: 16,
  justifyContent: 'center',
}));

const Image = styled('img')(({ theme }) => ({
  width: 400,
  height: 300,
  boxSizing: 'content-box',
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid',
  borderColor: theme.palette.divider,
  boxShadow: `0px 2px 8px ${theme.palette.grey[200]}`,
  transition: 'all 100ms ease',
  ...theme.applyDarkStyles({
    borderColor: theme.palette.primaryDark[600],
    boxShadow: `0px 2px 8px ${theme.palette.common.black}`,
  }),
}));

const scroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%)
  }
`;

function PhotoGallery() {
  return (
    <Box
      sx={(theme) => ({
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        minWidth: '100%',
        display: 'flex',
        gap: 2,
        my: 5,
        '& > div': {
          animation: `${scroll} 120s linear infinite`,
        },
        '&::before, &::after': {
          background: `linear-gradient(to right, #FFF 0%, rgba(255, 255, 255, 0) 100%)`,
          content: "''",
          height: '100%',
          position: 'absolute',
          width: 200,
          zIndex: 1,
          pointerEvents: 'none',
        },
        '&::before': {
          right: { xs: -64, sm: -20 },
          top: 0,
          transform: 'rotateZ(180deg)',
        },
        '&::after': {
          left: { xs: -64, sm: -20 },
          top: 0,
        },
        ...theme.applyDarkStyles({
          '&::before, &::after': {
            background: `linear-gradient(to right, ${
              theme.palette.primaryDark[900]
            } 0%, rgba(0, 0, 0, 0) 100%)`,
          },
        }),
      })}
    >
      <ImageContainer>
        {teamPhotos.map((item, index) => (
          <Image
            key={index}
            src={item.img}
            alt={item.title}
            loading={index > 2 ? 'lazy' : undefined}
            fetchPriority={index > 2 ? undefined : 'high'}
          />
        ))}
      </ImageContainer>
      <ImageContainer aria-hidden="true">
        {/* aria-hidden is used here because this element is a copy from the above, meaning we want to hide it from screen readers. */}
        {teamPhotos.map((item, index) => (
          <Image key={index} src={item.img} alt={item.title} loading="lazy" />
        ))}
      </ImageContainer>
    </Box>
  );
}

export default function AboutHero() {
  return (
    <Section cozy bg="gradient">
      <SectionHeadline
        alwaysCenter
        overline="About us"
        title={
          <Typography variant="h2" component="h1">
            It was high time we contribute to the <br />{' '}
            <GradientText>open source community</GradientText>
          </Typography>
        }
        description="Our goal is to provide open source components that will enable the community to build sophisticated media tools easily."
      />
      <PhotoGallery />
      <TeamStatistics />
    </Section>
  );
}
