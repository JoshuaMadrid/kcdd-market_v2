/**
 * Application Routes
 * 
 * Documentation:
 * - React Router v6: https://reactrouter.com/en/main
 * - Clerk Protected Routes: https://clerk.com/docs/components/protect
 */

import { Routes, Route } from 'react-router-dom'
import { SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { routes } from '@/config'

// Layouts
import { MainLayout } from '@/layouts/MainLayout'

// Guards
import { AdminRoute } from '@/components/AdminRoute'

// Pages
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { RequestsPage } from '@/pages/RequestsPage'
import { RequestDetailPage } from '@/pages/RequestDetailPage'
import { OrganizationProfilePage } from '@/pages/organizations/OrganizationProfilePage'
import { DonorDashboard } from '@/pages/donor/DashboardPage'
import { DonorProfile } from '@/pages/donor/ProfilePage'
import { CBODashboard } from '@/pages/cbo/DashboardPage'
import { CBOSetup } from '@/pages/cbo/SetupPage'
import { CBOProfile } from '@/pages/cbo/ProfilePage'
import { CBOProfileEdit } from '@/pages/cbo/ProfileEditPage'
import { CBORequests } from '@/pages/cbo/RequestsPage'
import { NewRequestPage } from '@/pages/cbo/NewRequestPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { PaymentSuccessPage } from '@/pages/PaymentSuccessPage'
import { PaymentCancelPage } from '@/pages/PaymentCancelPage'
import { DonationsPage } from '@/pages/donor/DonationsPage'
import { AdminDashboard } from '@/pages/admin/DashboardPage'
import { AdminVettingPage } from '@/pages/admin/VettingPage'
import { AdminRequestsPage } from '@/pages/admin/RequestsPage'
import { AdminAuditPage } from '@/pages/admin/AuditPage'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.about} element={<AboutPage />} />
        <Route path={routes.requests} element={<RequestsPage />} />
        <Route path="/requests/:id" element={<RequestDetailPage />} />
        <Route path="/organizations/:id" element={<OrganizationProfilePage />} />
      </Route>

      {/* Auth routes */}
      <Route path={routes.signIn} element={<SignIn routing="path" path={routes.signIn} />} />
      <Route path={routes.signUp} element={<SignUp routing="path" path={routes.signUp} />} />

      {/* Donor routes (protected) */}
      <Route element={<MainLayout />}>
        <Route
          path={routes.donor.dashboard}
          element={
            <ProtectedRoute>
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.donor.profile}
          element={
            <ProtectedRoute>
              <DonorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.donor.donations}
          element={
            <ProtectedRoute>
              <DonationsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* CBO routes (protected) */}
      <Route element={<MainLayout />}>
        <Route
          path={routes.cbo.dashboard}
          element={
            <ProtectedRoute>
              <CBODashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.cbo.setup}
          element={
            <ProtectedRoute>
              <CBOSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.cbo.profile}
          element={
            <ProtectedRoute>
              <CBOProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.cbo.profileEdit}
          element={
            <ProtectedRoute>
              <CBOProfileEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.cbo.requests}
          element={
            <ProtectedRoute>
              <CBORequests />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.cbo.newRequest}
          element={
            <ProtectedRoute>
              <NewRequestPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Payment routes */}
      <Route element={<MainLayout />}>
        <Route
          path="/checkout/:requestId"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path={routes.paymentSuccess} element={<PaymentSuccessPage />} />
        <Route path={routes.paymentCancel} element={<PaymentCancelPage />} />
      </Route>

      {/* Admin routes */}
      <Route element={<MainLayout />}>
        <Route
          path={routes.admin.dashboard}
          element={<AdminRoute><AdminDashboard /></AdminRoute>}
        />
        <Route
          path={routes.admin.vetting}
          element={<AdminRoute><AdminVettingPage /></AdminRoute>}
        />
        <Route
          path={routes.admin.requests}
          element={<AdminRoute><AdminRequestsPage /></AdminRoute>}
        />
        <Route
          path={routes.admin.audit}
          element={<AdminRoute><AdminAuditPage /></AdminRoute>}
        />
      </Route>
    </Routes>
  )
}

