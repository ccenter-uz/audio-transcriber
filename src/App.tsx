import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "@/shared/lib/auth.tsx";
import { RequireAuth } from "@/shared/lib/RequireAuth";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { notification } from "antd";

// Layout and Pages imports
import Layout from "@/widgets/Layout";
import LoginPage from "@/pages/LoginPage";
import RootPage from "@/pages/RootPage";
import DashboardPage from "@/pages/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import TranscriptEditorPage from "@/pages/TranscriptPage/TranscriptEditorPage";
import UserDetailsPage from "@/pages/DashboardPage/UserDetailsPage";

// Initialize React Query client with global error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error: Error) => {
      notification.error({
        message: "Error",
        description: error.message,
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: Error) => {
      notification.error({
        message: "Error",
        description: error.message,
      });
    },
  }),
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#3b82f6",
            borderRadius: 4,
          },
        }}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes */}
              <Route element={<Layout />}>
                {/* Root path now uses RootPage */}
                <Route
                  path="/"
                  element={
                    <RequireAuth role="transcriber">
                      <RootPage />
                    </RequireAuth>
                  }
                />

                {/* Admin only routes */}
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth role="admin">
                      <DashboardPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/dashboard/:userId"
                  element={
                    <RequireAuth>
                      <UserDetailsPage />
                    </RequireAuth>
                  }
                />

                {/* Transcriber only routes */}
                <Route path="/transcribe" element={
                  <RequireAuth role="transcriber">
                    <TranscriptEditorPage />
                  </RequireAuth>
                } />

                {/* 404 page for authenticated users */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
