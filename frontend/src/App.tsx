import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import NavBar from './components/NavBar';
import CsvImport from './components/CsvImport';
import GreedySolver from './components/GreedySolver';
import CalendarView from './components/CalendarView';
import theme from './themes/theme';
import './App.css';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavBar currentTab={tabValue} setCurrentTab={setTabValue} />
      <Container maxWidth="lg" sx={{ pt: { xs: 8, sm: 10 } }}>
        <TabPanel value={tabValue} index={0}>
          <CsvImport />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <GreedySolver />
            <CalendarView />
          </Box>
        </TabPanel>
      </Container>
    </ThemeProvider>
  );
}

export default App;
