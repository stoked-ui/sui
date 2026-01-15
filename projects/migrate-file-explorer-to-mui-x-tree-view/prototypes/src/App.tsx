import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CssBaseline, Tabs, Tab, Typography, Paper } from '@mui/material';
import GridLayoutPrototype from './prototypes/GridLayoutPrototype';
import DragDropPrototype from './prototypes/DragDropPrototype';
import PerformancePrototype from './prototypes/PerformancePrototype';
import PluginArchitecturePrototype from './prototypes/PluginArchitecturePrototype';
import TypeScriptGenericsPrototype from './prototypes/TypeScriptGenericsPrototype';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`prototype-tabpanel-${index}`}
      aria-labelledby={`prototype-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ borderRadius: 0 }}>
          <Typography variant="h4" sx={{ p: 2 }}>
            MUI X RichTreeView Capability Assessment
          </Typography>
          <Tabs value={tabValue} onChange={handleChange} aria-label="prototype tabs">
            <Tab label="Grid Layout" />
            <Tab label="Drag & Drop" />
            <Tab label="Performance" />
            <Tab label="Plugin Architecture" />
            <Tab label="TypeScript Generics" />
          </Tabs>
        </Paper>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <TabPanel value={tabValue} index={0}>
            <GridLayoutPrototype />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <DragDropPrototype />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <PerformancePrototype />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <PluginArchitecturePrototype />
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            <TypeScriptGenericsPrototype />
          </TabPanel>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
