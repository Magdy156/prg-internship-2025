import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#ffffff',
    },
    text: {
      primary: '#212121',
    },
    primary: {
      main: '#00c853',
    },
    secondary: {
      main: '#00aaff',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#f5f5f5',
          borderRadius: 8,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          '@keyframes fadeInScale': {
            '0%': { opacity: 0, transform: 'scale(0.8)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#212121',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #00c853 0%, #00aaff 100%)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
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
        },
      },
    },
  },
});

export default theme;
