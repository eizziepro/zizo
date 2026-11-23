import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IdleTimerProvider } from './context/IdleTimerContext';
import { NotificationProvider } from './context/NotificationContext';
import { usePermissions } from './hooks/usePermissions';
import { AppShell } from './components/layout/AppShell';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { InquiriesPage } from './pages/InquiriesPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { BookingsPage } from './pages/BookingsPage';
import { ConsultationTypesPage } from './pages/ConsultationTypesPage';
import { ServicesPage } from './pages/ServicesPage';
import { BlogPage } from './pages/BlogPage';
import { FAQsPage } from './pages/FAQsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { SubscribersPage } from './pages/SubscribersPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { LoginPage } from './pages/LoginPage';
import { ForbiddenPage } from './pages/ForbiddenPage';

// Settings Tabs
import { SettingsLayout } from './pages/settings/SettingsLayout';
import { ProfileTab } from './pages/settings/ProfileTab';
import { SecurityTab } from './pages/settings/SecurityTab';
import { SiteSettingsTab } from './pages/settings/SiteSettingsTab';
import { AvailabilityTab } from './pages/settings/AvailabilityTab';
import { IntegrationsTab } from './pages/settings/IntegrationsTab';
import { NotificationsTab } from './pages/settings/NotificationsTab';
import { TeamTab } from './pages/settings/TeamTab';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('owner' | 'coordinator' | 'editor')[];
  permission?: string;
}> = ({ children, allowedRoles, permission }) => {
  const { user, loading } = useAuth();
  const { canAccess } = usePermissions();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-2 border-[#17645F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#5D5E5F]">Loading staff workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !canAccess(permission)) {
    return <ForbiddenPage />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (permission && canAccess(permission)) {
      return <>{children}</>;
    }
    return <ForbiddenPage />;
  }

  return <>{children}</>;
};

export const AdminApp: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <IdleTimerProvider>
            <BrowserRouter basename="/admin">
            <Routes>
              {/* Public Staff Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Authenticated Staff Shell */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                {/* 1. Overview */}
                <Route index element={<OverviewPage />} />

                {/* 2. Clients */}
                <Route
                  path="inquiries"
                  element={
                    <ProtectedRoute permission="inquiries">
                      <InquiriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="applications"
                  element={
                    <ProtectedRoute permission="applications">
                      <ApplicationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 3. Scheduling */}
                <Route
                  path="bookings"
                  element={
                    <ProtectedRoute permission="bookings">
                      <BookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="consultation-types"
                  element={
                    <ProtectedRoute permission="consultation-types">
                      <ConsultationTypesPage />
                    </ProtectedRoute>
                  }
                />

                {/* 4. Website Content */}
                <Route
                  path="services"
                  element={
                    <ProtectedRoute permission="services">
                      <ServicesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="blog"
                  element={
                    <ProtectedRoute permission="blog">
                      <BlogPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="faqs"
                  element={
                    <ProtectedRoute permission="faqs">
                      <FAQsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reviews"
                  element={
                    <ProtectedRoute permission="reviews">
                      <ReviewsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 5. Audience */}
                <Route
                  path="subscribers"
                  element={
                    <ProtectedRoute permission="subscribers">
                      <SubscribersPage />
                    </ProtectedRoute>
                  }
                />

                {/* 6. Settings with Tabs */}
                <Route path="settings" element={<SettingsLayout />}>
                  <Route index element={<Navigate to="profile" replace />} />
                  <Route path="profile" element={<ProfileTab />} />
                  <Route path="security" element={<SecurityTab />} />
                  <Route
                    path="site"
                    element={
                      <ProtectedRoute permission="settings:site">
                        <SiteSettingsTab />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="availability"
                    element={
                      <ProtectedRoute permission="settings:availability">
                        <AvailabilityTab />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="integrations"
                    element={
                      <ProtectedRoute permission="settings:integrations">
                        <IntegrationsTab />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="notifications" element={<NotificationsTab />} />
                  <Route
                    path="team"
                    element={
                      <ProtectedRoute permission="settings:team" allowedRoles={['owner']}>
                        <TeamTab />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* 7. Audit Log (Owner Only) */}
                <Route
                  path="audit-log"
                  element={
                    <ProtectedRoute permission="audit-log" allowedRoles={['owner']}>
                      <AuditLogPage />
                    </ProtectedRoute>
                  }
                />

                {/* 403 Forbidden Catch */}
                <Route path="403" element={<ForbiddenPage />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </IdleTimerProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
