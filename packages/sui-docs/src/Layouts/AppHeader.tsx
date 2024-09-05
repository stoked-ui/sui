import * as React from 'react';
import {styled, alpha} from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Link } from '@mui/docs/Link';
import { useTranslate } from '@mui/docs/i18n';
import HeaderNavBar from '../header/HeaderNavBar';
import HeaderNavDropdown from '../header/HeaderNavDropdown';
import ThemeModeToggle from '../header/ThemeModeToggle';
import { DeferredAppSearch } from '../App/AppFrame';
import Products from '../Products';
// import SvgSuiLogomark from "../icon/SvgSuiLogomark";

const Header = styled('header')(({ theme }) => [
  {
    position: 'sticky',
    top: 0,
    transition: theme.transitions.create('top'),
    zIndex: theme.zIndex.appBar,
    backdropFilter: 'blur(8px)',
    boxShadow: `inset 0px -1px 1px ${theme.palette.grey[100]}`,
    backgroundColor: 'rgba(255,255,255,0.8)',
  } as const,
  theme.applyDarkStyles({
    boxShadow: `inset 0px -1px 1px ${theme.palette.primaryDark[700]}`,
    backgroundColor: alpha(theme.palette.primaryDark[900], 0.7),
  }),
]);

const HEIGHT = 60;

interface AppHeaderProps {
  gitHubRepository?: string;
  Logomark: React.JSX.ElementType;
  products: Products;
  routes: Record<string, string>
}

export default function AppHeader(props: AppHeaderProps) {
  const { Logomark, products, routes, gitHubRepository = 'https://github.com/stoked-ui/mono' } = props;
  const t = useTranslate();

  return (
    <Header>
      <GlobalStyles
        styles={{
          ':root': {
            '--MuiDocs-header-height': `${HEIGHT}px`,
          },
        }}
      />
      <Container sx={{ display: 'flex', alignItems: 'center', minHeight: HEIGHT }}>
        <Box component={Link} href="/" aria-label="Go to homepage" sx={{ lineHeight: 0, mr: 2 }}>
          <Logomark width={30} />
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'initial' } }}>
          <HeaderNavBar products={products} routes={routes}/>
        </Box>
        <Box sx={{ ml: 'auto' }} />
        <Stack direction="row" spacing={1}>
          <DeferredAppSearch />
          <Tooltip title={t('appFrame.github')} enterDelay={300}>
            <IconButton
              component="a"
              color="primary"
              href={gitHubRepository}
              target="_blank"
              rel="noopener"
              data-ga-event-category="header"
              data-ga-event-action="github"
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <ThemeModeToggle />
        </Stack>
        <Box sx={{ display: { md: 'none' }, ml: 1 }}>
          <HeaderNavDropdown />
        </Box>
      </Container>
    </Header>
  );
}
