import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import {
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@suid/material";
import AuthProvider from "~/components/AuthProvider";
import NavBar from "~/components/NavBar";

const theme = createTheme();

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Todo App</Title>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <NavBar />
              <Container maxWidth="md" sx={{ py: 3 }}>
                <Suspense
                  fallback={
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                      <CircularProgress />
                    </Box>
                  }
                >
                  {props.children}
                </Suspense>
              </Container>
            </AuthProvider>
          </ThemeProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}