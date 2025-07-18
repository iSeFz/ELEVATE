import { FC } from "react";
import { CssBaseline, IconButton } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Router from "./features/router/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { closeSnackbar, SnackbarProvider } from "notistack";
import CloseIcon from "@mui/icons-material/Close"; // Add this line

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15,
    },
  },
});

const theme = createTheme({
  typography: {
    fontFamily: "Poppins, Arial, sans-serif",
  },
  palette: {
    text: {
      primary: "#000000",
      secondary: "#737791",
    },
    primary: {
      main: "#FAFBFC",
    },
    secondary: {
      main: "#A51930",
    },
  },
});

const App: FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          autoHideDuration={4000}
          action={(snackbarId) => (
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => closeSnackbar(snackbarId)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        >
          <CssBaseline />
          <Router />
        </SnackbarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
