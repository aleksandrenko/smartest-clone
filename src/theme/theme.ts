import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1dc198',
      light: 'rgba(29, 193, 152, 0.15)',
      dark: '#17a583',
      contrastText: '#fff',
    },
    secondary: {
      main: '#394da8',
      light: '#5a85de',
      dark: '#272364',
      contrastText: '#fff',
    },
    error: {
      main: '#ff397e',
      light: '#ffadad',
    },
    success: {
      main: '#00c500',
      light: '#ccfdc5',
    },
    warning: {
      main: '#ffb921',
    },
    background: {
      default: '#f0f4ff',
      paper: '#fff',
    },
    text: {
      primary: '#36363f',
      secondary: '#8c8c8c',
    },
  },
  typography: {
    fontFamily: '"Nunito", Helvetica, Arial, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f0f4ff',
          fontFamily: '"Nunito", Helvetica, Arial, sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 16,
          padding: '8px 24px',
          '&:hover': {
            filter: 'brightness(110%)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        containedPrimary: {
          backgroundColor: '#1dc198',
          '&:hover': {
            backgroundColor: '#17a583',
          },
        },
        outlinedPrimary: {
          borderColor: '#1dc198',
          color: '#1dc198',
          '&:hover': {
            backgroundColor: 'rgba(29, 193, 152, 0.15)',
            borderColor: '#1dc198',
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          border: '1px solid #cedaf3',
          borderRadius: 10,
          '&:hover': {
            backgroundColor: '#fff',
          },
          '&.Mui-focused': {
            backgroundColor: '#fff',
            border: '1px solid #1dc198',
          },
          '&::before, &::after': {
            display: 'none',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#8c8c8c',
          '&.Mui-focused': {
            color: '#1dc198',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#cedaf3',
          '&.Mui-checked': {
            color: '#1dc198',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#cedaf3',
          '&.Mui-checked': {
            color: '#1dc198',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 10,
          backgroundColor: 'rgba(29, 193, 152, 0.15)',
        },
        bar: {
          borderRadius: 6,
          backgroundColor: '#1dc198',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
  },
});

export default theme;
