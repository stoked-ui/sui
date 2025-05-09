import * as React from 'react';
import PropTypes from 'prop-types';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import composeClasses from '@mui/utils/composeClasses';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { FileExplorer } from '../FileExplorer/FileExplorer';
import { createUseThemeProps } from '../internals/zero-styled';
import {
  ExplorerPanelProps,
  FileExplorerTabsProps,
} from './FileExplorerTabs.types';
import { getFileExplorerTabsUtilityClass } from './fileExplorerTabsClasses';
import { FileBase } from '../models';

const useThemeProps = createUseThemeProps('MuiFileExplorerTabs');

const useUtilityClasses = (ownerState: FileExplorerTabsProps) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getFileExplorerTabsUtilityClass, classes);
};

/**
 * File Explorer Standard Component
 * 
 * Demos:
 * - [FileExplorerTabs](https://stoked-ui.github.io/file-explorer/docs/)
 * 
 * API:
 * - [FileExplorerTabs API](https://stoked-ui.github.io/file-explorer/api/)
 */
const FileExplorerStandard = React.forwardRef(
  /**
   * @param {FileExplorerTabsProps} inProps - The props for the FileExplorerStandard component
   * @param {React.Ref<HTMLDivElement>} ref - Reference to the HTMLDivElement
   * @returns {JSX.Element}
   */
  (inProps: FileExplorerTabsProps, ref: React.Ref<HTMLDivElement>) => {
    const { tabNames, currentTab, drawerOpen, setTabName, tabSx, sx } = useThemeProps({
      props: inProps,
      name: 'MuiFileExplorer',
    });
    const classes = useUtilityClasses(inProps);

    /**
     * Handle change event for TabList
     * @param {React.SyntheticEvent} event - The event object
     * @param {string} tabName - The name of the tab to switch to
     */
    const handleChange = (event: React.SyntheticEvent, tabName: string) => {
      setTabName(tabName);
    };

    console.info('console.name', currentTab?.name);
    return (
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={currentTab?.name || ''}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="editor file tabs">
              {tabNames?.map((name, index) => (
                <Tab key={index} label={name} value={name} onClick={drawerOpen} />
              ))}
            </TabList>
          </Box>
          {(currentTab?.name || '') !== '' && (
            <React.Fragment>
              {tabNames.map((name, index) => (
                <TabPanel sx={{ padding: 0 }} value={name} key={`${name}-${index}`}>
                  <FileExplorer
                    grid
                    role={'file-explorer'}
                    id={'editor-task-file-explorer'}
                    items={currentTab?.files as FileBase[] || []}
                    dndInternal
                    dndExternal
                    alternatingRows
                    gridColumns={inProps.tabData[currentTab.name].gridColumns}
                    selectedItems={inProps.tabData[currentTab.name].selectedId || undefined}
                    expandedItems={inProps.tabData[currentTab.name].expandedItems || []}
                    /* onAddFiles={onAddFiles} */
                  />
                </TabPanel>
              ))}
            </React.Fragment>
          )}
        </TabContext>
      </Box>
    );
  },
);

FileExplorerStandard.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  currentTab: PropTypes.any,
  drawerOpen: PropTypes.func,
  onItemDoubleClick: PropTypes.func,
  setTabName: PropTypes.func,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  tabData: PropTypes.any,
  tabNames: PropTypes.any,
  tabSx: PropTypes.any,
  variant: PropTypes.oneOf(['drawer', 'standard']),
} as any;

const miniHeight = 49; // Height of the drawer in the collapsed state
const fullHeight = 300; // Height of the drawer in the expanded state

const openedMixin = (theme: Theme): CSSObject => ({
  height: fullHeight,
  transition: theme.transitions.create('height', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowY: 'auto',
});

const closedMixin = (theme: Theme): CSSObject => ({
  height: miniHeight,
  transition: theme.transitions.create('height', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowY: 'hidden',
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1, 0),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar)<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }: { theme: Theme; open: boolean }) => ({
    position: 'absolute',
    flexShrink: 0,
    boxSizing: 'border-box',
    width: '100%',
    bottom: 0,
    variants: [
      {
        props: { open },
        style: open
          ? { ...openedMixin(theme), '& .MuiDrawer-paper': openedMixin(theme) }
          : { ...closedMixin(theme), '& .MuiDrawer-paper': closedMixin(theme) },
      },
    ],
  }),
);

/**
 * Explorer Panel Component
 * @param {ExplorerPanelProps} params - The props for the ExplorerPanel component
 * @returns {JSX.Element}
 */
function ExplorerPanel(params: ExplorerPanelProps) {
  const { name, items, onItemDoubleClick, gridColumns, expandedItems, selectedId } = params;
  console.info('@@@@@@@@@@@@@@@@@@@', params);
  // eslint-disable-next-line jsx-a11y/aria-role
  return (
    <TabPanel sx={{ padding: 0 }} value={name}>
      {items.length && <FileExplorer
        grid
        role={'file-explorer'}
        id={`editor-task-file-explorer-${name}`}
        items={items || []}
        dndInternal
        dndExternal
        alternatingRows
        onItemDoubleClick={onItemDoubleClick}
        gridColumns={gridColumns}
        defaultExpandedItems={expandedItems || []}
        defaultSelectedItems={selectedId || undefined}
      />}
    </TabPanel>
  );
}

ExplorerPanel.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  items: PropTypes.arrayOf(
    PropTypes.shape({
      children: PropTypes.arrayOf(
        PropTypes.shape({
          children: PropTypes.arrayOf(PropTypes.object),
          created: PropTypes.number,
          expanded: PropTypes.bool,
          id: PropTypes.string,
          lastModified: PropTypes.number,
          media: PropTypes.any,
          mediaType: PropTypes.string,
          name: PropTypes.string,
          path: PropTypes.string,
          selected: PropTypes.bool,
          size: PropTypes.number,
          type: PropTypes.string,
          visibleIndex: PropTypes.number,
        }),
      ),
      created: PropTypes.number,
      expanded: PropTypes.bool,
      id: PropTypes.string,
      lastModified: PropTypes.number,
      media: PropTypes.any,
      mediaType: PropTypes.string,
      name: PropTypes.string,
      path: PropTypes.string,
      selected: PropTypes.bool,
      size: PropTypes.number,
      type: PropTypes.string,
      visibleIndex: PropTypes.number,
    }),
  ),
  name: PropTypes.string,
  onItemDoubleClick: PropTypes.func,
} as any;

const FileExplorerDrawer = React.forwardRef(
  /**
   * @param {FileExplorerTabsProps} inProps - The props for the FileExplorerDrawer component
   * @param {React.Ref<HTMLDivElement>} ref - Reference to the HTMLDivElement
   * @returns {JSX.Element}
   */
  (inProps: FileExplorerTabsProps, ref: React.Ref<HTMLDivElement>) => {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const { tabNames, currentTab, tabData, setTabName, tabSx, sx } = useThemeProps({
      props: inProps,
      name: 'MuiFileExplorer',
    });
    const classes = useUtilityClasses(inProps);

    /**
     * Toggle the drawer open/close state
     */
    const handleDrawerToggle = () => {
      setOpen((prev) => !prev);
      if (!currentTab?.name || currentTab?.name === 'none') {
        setTabName(tabNames[0]);
      }
    };

    const [tabState, setTabState] = React.useState<Record<string, ExplorerPanelProps>>(tabData);
    React.useEffect(() => {
      setTabState(tabData);
    }, [tabData]);

    /**
     * Handle change event for TabList
     * @param {React.SyntheticEvent} event - The event object
     * @param {string} tabName - The name of the tab to switch to
     */
    const handleChange = (event: React.SyntheticEvent, tabName: string) => {
      setTabName(tabName);
      if (!open) {
        setOpen(true);
      }
    };
    return (
      <Box
        sx={[
          {
            display: 'flex',
            position: 'relative',
            flexDirection: 'column',
            gridArea: 'explorer-tabs',
            zIndex: 1100,
            '&:focus-within': {
              display: 'flex!important',
            },
          },
          {},
        ]}
      >
        <TabContext value={currentTab?.name || 'none'}>
          <CssBaseline />
          <Drawer
            theme={theme}
            variant="permanent"
            hideBackdrop={false}
            open={open}
            anchor="bottom"
            PaperProps={{
              style: {
                position: 'absolute',
              },
            }}
          >
            <DrawerHeader sx={{ justifyContent: 'flex-start', padding: 0, height: '49px' }}>
              <TabList
                onChange={handleChange}
                aria-label="editor file tabs"
                sx={{ margin: '0 8px' }}
              >
                <Tab
                  key={'none'}
                  label={''}
                  value={'none'}
                  sx={{ position: 'absolute', left: -2000 }}
                />
                {tabNames?.map((name, index) => (
                  <Tab key={index} label={name} value={name} onClick={() => setOpen(true)} />
                ))}
              </TabList>
              <IconButton onClick={handleDrawerToggle} sx={{ margin: '0 8px' }}>
                {open ? <ChevronDownIcon /> : <ChevronUpIcon />}
              </IconButton>
            </DrawerHeader>
            <Divider />
            {(currentTab?.name || 'none') !== 'none' &&
              tabNames?.map((name, index) => <ExplorerPanel key={`panel-${index}`} {...tabState[name]} />)}
          </Drawer>
        </TabContext>
      </Box>
    );
  },
);

FileExplorerDrawer.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  currentTab: PropTypes.any,
  drawerOpen: PropTypes.func,
  onItemDoubleClick: PropTypes.func,
  setTabName: PropTypes.func,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  tabData: PropTypes.any,
  tabNames: PropTypes.any,
  variant: PropTypes.oneOf(['drawer', 'standard']),
} as any;

const FileExplorerTabs = React.forwardRef(
  /**
   * @param {FileExplorerTabsProps} inProps - The props for the FileExplorerTabs component
   * @param {React.Ref<HTMLDivElement>} ref - Reference to the HTMLDivElement
   * @returns {JSX.Element}
   */
  (inProps: FileExplorerTabsProps, ref: React.Ref<HTMLDivElement>) => {
    if (inProps.variant === 'standard' || !inProps.variant) {
      return <FileExplorerStandard {...inProps} ref={ref} />;
    }
    return <FileExplorerDrawer {...inProps} ref={ref} />;
  },
);

FileExplorerTabs.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  currentTab: PropTypes.any,
  drawerOpen: PropTypes.func,
  onItemDoubleClick: PropTypes.func,
  setTabName: PropTypes.func,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  tabData: PropTypes.any,
  tabNames: PropTypes.any,
  tabSx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  variant: PropTypes.oneOf(['drawer', 'standard']),
} as any;

export { FileExplorerTabs };