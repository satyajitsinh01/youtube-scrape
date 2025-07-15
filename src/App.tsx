import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import SearchPage from "./components/SearchPage";


const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366F1",
      contrastText: "#fff",
    },
    secondary: {
      main: "#EC4899",
      contrastText: "#fff",
    },
    background: {
      default: "#FEFEFE",
      paper: "#FFFFFF",
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f59e42",
    },
    info: {
      main: "#3b82f6",
    },
    success: {
      main: "#10b981",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    divider: "#e5e7eb",
  },
  typography: {
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont",
    h4: {
      fontWeight: 700,
      fontSize: "2.2rem",
      letterSpacing: "-0.5px",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.1rem",
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.98rem",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 24px rgba(124,58,237,0.08)",
          borderRadius: 10,
          transition: "transform 0.2s cubic-bezier(.4,2,.6,1)",
          "&:hover": {
            transform: "translateY(-6px) scale(1.01)",
            boxShadow: "0 8px 32px rgba(124,58,237,0.12)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "0 2px 16px 0 rgba(124,58,237,0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          textTransform: "none",
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SearchPage />
    </ThemeProvider>
  );
}

export default App;
