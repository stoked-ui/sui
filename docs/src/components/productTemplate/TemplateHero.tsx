import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import GradientText from 'docs/src/components/typography/GradientText';
import HeroContainer from 'docs/src/layouts/HeroContainer';
import IconImage from 'docs/src/components/icon/IconImage';
import { Link } from '@stoked-ui/docs';
import {
  StoreTemplatesSet1,
  StoreTemplatesSet2,
} from '../home/CustomerShowcase';

export default function TemplateHero() {
  return (
    <HeroContainer
      linearGradient
      left={
        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography
            fontWeight="bold"
            variant="body2"
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'center', md: 'start' },
              '& > *': { mr: 1 },
              color: 'primary.600',
              ...theme.applyDarkStyles({
                color: 'primary.400',
              }),
            })}
          >
            <IconImage width={28} height={28} loading="eager" name="product-templates" /> Templates
          </Typography>
          <Typography variant="h1" sx={{ my: 2, maxWidth: 500 }}>
            <GradientText>Fully built</GradientText> Material&nbsp;UI templates
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            A collection of 4.5 average rating templates, selected and curated by SUI&apos;s team of
            maintainers to get your projects up and running today.
          </Typography>
          <Button
            component={Link}
            noLinkStyle
            href="https://stokedconsulting.com/store/?utm_source=marketing&utm_medium=referral&utm_campaign=templates-cta#populars"
            variant="contained"
            endIcon={<KeyboardArrowRightRounded />}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Browse templates
          </Button>
        </Box>
      }
      right={
        <Box sx={{ position: 'relative', height: '100%', perspective: '1000px' }}>
          <Box
            sx={{
              left: '40%',
              position: 'absolute',
              display: 'flex',
              transform: 'translateX(-40%) rotateZ(-30deg) rotateX(8deg) rotateY(8deg)',
              transformOrigin: 'center center',
            }}
          >
            <StoreTemplatesSet1
              disableLink
              keyframes={{
                '0%': {
                  transform: 'translateY(-200px)',
                },
                '100%': {
                  transform: 'translateY(-40px)',
                },
              }}
            />
            <StoreTemplatesSet2
              disableLink
              keyframes={{
                '0%': {
                  transform: 'translateY(150px)',
                },
                '100%': {
                  transform: 'translateY(40px)',
                },
              }}
              sx={{ ml: { xs: 2, sm: 4, md: 8 } }}
            />
          </Box>
        </Box>
      }
    />
  );
}
