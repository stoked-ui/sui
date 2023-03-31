import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocsV2';
import AppFrame from 'docs/src/modules/components/AppFrame';
import * as pageProps from 'docs/data/base/components/menu/menu.md?@mui/markdown';
import mapApiPageTranslations from 'docs/src/modules/utils/mapApiPageTranslations';
import MenuItemUnstyledApiJsonPageContent from '../../api/menu-item-unstyled.json';
import MenuUnstyledApiJsonPageContent from '../../api/menu-unstyled.json';
import useMenuApiJsonPageContent from '../../api/use-menu.json';
import useMenuItemApiJsonPageContent from '../../api/use-menu-item.json';

export default function Page(props) {
  const { userLanguage, ...other } = props;
  return <MarkdownDocs {...pageProps} {...other} />;
}

Page.getLayout = (page) => {
  return <AppFrame>{page}</AppFrame>;
};

export const getStaticPaths = () => {
  return {
    paths: [{ params: { docsTab: 'components-api' } }, { params: { docsTab: 'hooks-api' } }],
    fallback: false, // can also be true or 'blocking'
  };
};

export const getStaticProps = () => {
  const MenuItemUnstyledApiReq = require.context(
    'docs/translations/api-docs/menu-item-unstyled',
    false,
    /menu-item-unstyled.*.json$/,
  );
  const MenuItemUnstyledApiDescriptions = mapApiPageTranslations(MenuItemUnstyledApiReq);

  const MenuUnstyledApiReq = require.context(
    'docs/translations/api-docs/menu-unstyled',
    false,
    /menu-unstyled.*.json$/,
  );
  const MenuUnstyledApiDescriptions = mapApiPageTranslations(MenuUnstyledApiReq);

  const useMenuApiReq = require.context(
    'docs/translations/api-docs/use-menu',
    false,
    /use-menu.*.json$/,
  );
  const useMenuApiDescriptions = mapApiPageTranslations(useMenuApiReq);

  const useMenuItemApiReq = require.context(
    'docs/translations/api-docs/use-menu-item',
    false,
    /use-menu-item.*.json$/,
  );
  const useMenuItemApiDescriptions = mapApiPageTranslations(useMenuItemApiReq);

  return {
    props: {
      componentsApiDescriptions: {
        MenuItemUnstyled: MenuItemUnstyledApiDescriptions,
        MenuUnstyled: MenuUnstyledApiDescriptions,
      },
      componentsApiPageContents: {
        MenuItemUnstyled: MenuItemUnstyledApiJsonPageContent,
        MenuUnstyled: MenuUnstyledApiJsonPageContent,
      },
      hooksApiDescriptions: {
        useMenu: useMenuApiDescriptions,
        useMenuItem: useMenuItemApiDescriptions,
      },
      hooksApiPageContents: {
        useMenu: useMenuApiJsonPageContent,
        useMenuItem: useMenuItemApiJsonPageContent,
      },
    },
  };
};
