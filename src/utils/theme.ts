import localFont from "next/font/local";
import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

// Nanum_Pen_Script 400

export const geologicaFont = localFont({
  src: [
    {
      path: "../fonts/Geologica-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/Geologica-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Geologica-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

export const handjetFont = localFont({
  src: [
    {
      path: "../fonts/Handjet-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
});

declare module "@mui/material/styles" {
  interface Palette {
    backgroundSecondary?: {
      default?: string;
    };
  }
  interface PaletteOptions {
    backgroundSecondary?: {
      default?: string;
    };
  }
}

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#000",
    },
    secondary: {
      main: "#ccc",
    },
    error: {
      main: red[700],
      light: red[200],
    },
    success: {
      main: "#2caa00",
    },
    warning: {
      main: "#ffab00",
      light: "#ffd683",
    },
    background: {
      default: "#fff",
      paper: "#f5f5f5",
    },
    backgroundSecondary: {
      default: "#f5f5f5",
    },
    text: {
      primary: "#000",
      secondary: "#555",
    },
  },
  typography: {
    fontFamily: `${geologicaFont.style.fontFamily}, "Helvetica", "Arial", sans-serif`,
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      fontSize: "60px",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      fontSize: "80px",
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingLeft: '10px',
            paddingRight: '10px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fill: "#000",
        },
      },
    },
  },
});

export default theme;
