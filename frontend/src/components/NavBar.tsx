import React from 'react';
import { AppBar, Toolbar, Tabs, Tab, Typography } from '@mui/material';

interface NavBarProps {
  currentTab: number;
  setCurrentTab: (value: number) => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentTab, setCurrentTab }) => {
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleLogoClick = () => {
    setCurrentTab(0);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: '100%',
        background: 'linear-gradient(90deg, #00c853 0%, #00aaff 100%)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 1100, // Ensure navbar stays above content
      }}
    >
      <Toolbar sx={{ padding: { xs: '0 10px', sm: '0 20px' } }}>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 'bold',
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            color: '#ffffff',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
          }}
          onClick={handleLogoClick}
        >
          Shift Scheduler
        </Typography>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: '#ffffff',
              fontWeight: 'medium',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              transition: 'all 0.3s',
              borderRadius: '4px',
              margin: '0 4px',
              padding: { xs: '6px 8px', sm: '8px 12px' },
              '&:hover': {
                color: '#e0f7fa',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            },
            '& .Mui-selected': {
              color: '#ffffff !important',
              backgroundColor: '#00aaff',
              fontWeight: 'bold',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
              borderRadius: '4px',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#ffffff',
              height: '3px',
            },
          }}
        >
          <Tab label="Upload CSVs" />
          <Tab label="Schedule" />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
