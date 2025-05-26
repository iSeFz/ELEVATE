import { FC } from "react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Router from "./features/router/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./context/userContext";
import { SnackbarProvider } from "notistack";
import { BrandProvider } from "./context/BrandContext";

const queryClient = new QueryClient();

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
      <UserProvider>
        <BrandProvider>
          <QueryClientProvider client={queryClient}>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
              <CssBaseline />
              <Router />
            </SnackbarProvider>
          </QueryClientProvider>
        </BrandProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
