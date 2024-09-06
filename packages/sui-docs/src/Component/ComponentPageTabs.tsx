import * as React from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Tab, { tabClasses } from '@mui/material/Tab';
import { useTranslate } from '../i18n';
import { Link } from '../Link';

export const HEIGHT = 50;
/*
const StyledTab = styled(Tab)(({ theme }) => ({
  // ... (keep existing styles)
}));
*/

interface ComponentPageTabsProps {
  activeTab: string;
  children: React.ReactNode;
  markdown: {
    headers: {
      components?: any[];
      hooks?: any[];
    };
  };
}

function ComponentPageTabs(props: ComponentPageTabsProps): React.ReactElement {
  const { activeTab, children, markdown: { headers } } = props;
  const router = useRouter();
  const t = useTranslate();

  const demosHref = router.pathname.replace('/components-api/', '/');
  const componentsHref = router.pathname.replace('/components-api/', '/components-api/');
  const hooksHref = router.pathname.replace('/components-api/', '/hooks-api/');

  return (
    <Box sx={{ maxWidth: { md: `calc(100% - 240px)` } }}>
      <Tabs
        value={activeTab}
        indicatorColor="secondary"
        sx={(theme) => ({
          position: 'sticky',
          top: 'var(--MuiDocs-header-height)',
          marginTop: -2,
          backgroundColor: theme.palette.background.default,
          zIndex: theme.zIndex.appBar - 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          [`& .${tabClasses.root}`]: {
            overflow: 'visible',
            [`& .${tabsClasses.indicator}`]: {
              top: '39px',
              borderRadius: 0,
            },
          },
        })}
      >
        <Tab component={Link} href={demosHref} label={t('api-docs.demos')} value="" />
        {(headers.components?.length ?? 0) > 0 && (
          <Tab
            className="skip-algolia-crawler"
            component={Link}
            href={componentsHref}
            label={t('api-docs.componentsApi')}
            value="components-api"
          />
        )}
        {headers.hooks && headers.hooks.length > 0 && (
          <Tab
            className="skip-algolia-crawler"
            component={Link}
            href={hooksHref}
            label={t('api-docs.hooksApi')}
            value="hooks-api"
          />
        )}
      </Tabs>
      {children}
    </Box>
  );
}

export default ComponentPageTabs;
