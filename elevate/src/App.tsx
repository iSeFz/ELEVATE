import { FC } from "react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Router from "./router/router";

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
      main: "#1E1E1",
    },
    secondary: {
      main: "#A51930",
    },
  },
});

const App: FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router />
    </ThemeProvider>
  );
};

export default App;
