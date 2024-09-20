import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Link } from '../Link';
import PageContext from "../components/PageContext";

function getSurveyMessage() {
  return (
    <React.Fragment>
      {`🚀 Influence SUI's 2024 roadmap! Participate in the latest`}
      &nbsp;
      <Link
        href="https://tally.so/r/3Ex4PN?source=website"
        target="_blank"
        color="inherit"
        underline="always"
        sx={{
          '&:hover': {
            opacity: 0.9,
          },
        }}
      >
        Developer Survey →
      </Link>
    </React.Fragment>
  );
}

function DefaultHiringMessage() {
  const { routes } = React.useContext(PageContext);
  return (
    <React.Fragment>
      🚀&#160;&#160;We&apos;re hiring a Designer, Full-stack Engineer, React Community Engineer, and
      more!&nbsp;&#160;
      <Link
        href={routes.careers} // Fix me!
        target="_blank"
        color="inherit"
        underline="always"
        sx={{
          '&:hover': {
            opacity: 0.9,
          },
        }}
      >
        Check the careers page →
      </Link>
    </React.Fragment>
  );
}

export default function AppHeaderBanner({featureToggle }: {featureToggle: Record<string, boolean>}) {
  const showSurveyMessage = false;
  const bannerMessage = showSurveyMessage ? getSurveyMessage() : DefaultHiringMessage();

  return featureToggle.enable_website_banner ? (
    <Typography
      fontWeight="medium"
      sx={(theme) => ({
        color: '#fff',
        p: '12px',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'start', sm: 'center' },
        justifyContent: 'center',
        fontSize: theme.typography.pxToRem(13),
        background: `linear-gradient(-90deg, ${theme.palette.primary[700]}, ${
          theme.palette.primary[500]
        } 120%)`,
        ...theme.applyDarkStyles({
          background: `linear-gradient(90deg, ${theme.palette.primary[900]}, ${
            theme.palette.primary[600]
          } 120%)`,
        }),
      })}
    >
      {bannerMessage}
    </Typography>
  ) : null;
}
