import { Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { useAppInit } from "@/hooks/useAppInit";
import { HomePage } from "@/pages/Home";
import { CategoryPage } from "@/pages/CategoryPage";
import { SearchPage } from "@/pages/SearchPage";
import { ArticlePage } from "@/pages/ArticlePage";
import { TrendingPage } from "@/pages/TrendingPage";
import { ForYouPage } from "@/pages/ForYou";
import { BookmarksPage } from "@/pages/Bookmarks";
import { SourcesPage } from "@/pages/Sources";
import { ProfilePage } from "@/pages/Profile";
import { SettingsPage } from "@/pages/Settings";
import { AboutPage } from "@/pages/About";
import { PrivacyPage } from "@/pages/Privacy";
import { TermsPage } from "@/pages/Terms";
import { LoginPage } from "@/pages/Login";
import { RegisterPage } from "@/pages/Register";
import { NotFoundPage } from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
});

function AppRoutes() {
  useAppInit();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route
          path="/for-you"
          element={
            <ProtectedRoute>
              <ForYouPage />
            </ProtectedRoute>
          }
        />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster>
        <AppRoutes />
      </Toaster>
    </QueryClientProvider>
  );
}