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
import { DashboardLayout } from '@/layouts/DashboardLayout'

// Pages
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { FaqPage } from '@/pages/FaqPage'
import { ContactPage } from '@/pages/ContactPage'
import { RequestsPage } from '@/pages/RequestsPage'
import { RequestDetailPage } from '@/pages/RequestDetailPage'
import { OrganizationProfilePage } from '@/pages/organizations/OrganizationProfilePage'
import { WelcomePage } from '@/pages/WelcomePage'
import { DonorDashboard } from '@/pages/donor/DashboardPage'
import { DonorProfile } from '@/pages/donor/ProfilePage'
import { DonorImpact } from '@/pages/donor/ImpactPage'
import { DonorDocuments } from '@/pages/donor/DocumentsPage'
import { DonorSupport } from '@/pages/donor/SupportPage'
import { DonationsPage } from '@/pages/donor/DonationsPage'
import { CBODashboard } from '@/pages/cbo/DashboardPage'
import { CBOSetup } from '@/pages/cbo/SetupPage'
import { CBOProfile } from '@/pages/cbo/ProfilePage'
import { CBOProfileEdit } from '@/pages/cbo/ProfileEditPage'
import { CBORequests } from '@/pages/cbo/RequestsPage'
import { NewRequestPage } from '@/pages/cbo/NewRequestPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { PaymentSuccessPage } from '@/pages/PaymentSuccessPage'
import { PaymentCancelPage } from '@/pages/PaymentCancelPage'
import { CampaignPage } from '@/pages/CampaignPage'
import { CampaignDonatePage } from '@/pages/CampaignDonatePage'
import { AdminDashboard } from '@/pages/admin/DashboardPage'
import { AdminUsersPage } from '@/pages/admin/UsersPage'
import { AdminVettingPage } from '@/pages/admin/VettingPage'
import { AdminRequestsPage } from '@/pages/admin/RequestsPage'
import { AdminAuditPage } from '@/pages/admin/AuditPage'
import { useRealUserType } from '@/hooks/useClerkSupabase'

// Legal Pages
import {
  PrivacyStatementPage,
  DoNotSellPage,
  AccessibilityStatementPage,
  TermsAndConditionsPage,
  CPSIACompliancePage,
  SiteMapPage,
} from '@/pages/legal'

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

// Admin-Only Route Component
// Uses useRealUserType to check actual user role (ignores impersonation)
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { userType, loading } = useRealUserType()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#ea580c]" />
      </div>
    )
  }

  if (userType !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-[#0a0a0a]">Access Denied</h1>
          <p className="text-[#737373]">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.about} element={<AboutPage />} />
        <Route path={routes.faq} element={<FaqPage />} />
        <Route path={routes.contact} element={<ContactPage />} />
        <Route path={routes.requests} element={<RequestsPage />} />
        {/* Canonical request detail path (ours) */}
        <Route path="/requests/:id" element={<RequestDetailPage />} />
        {/* Legacy path alias (theirs) */}
        <Route path="/request/:id" element={<RequestDetailPage />} />
        <Route path="/organizations/:id" element={<OrganizationProfilePage />} />
      </Route>

      {/* Legal routes (public) */}
      <Route element={<MainLayout />}>
        <Route path={routes.legal.privacy} element={<PrivacyStatementPage />} />
        <Route path={routes.legal.doNotSell} element={<DoNotSellPage />} />
        <Route path={routes.legal.accessibility} element={<AccessibilityStatementPage />} />
        <Route path={routes.legal.terms} element={<TermsAndConditionsPage />} />
        <Route path={routes.legal.cpsia} element={<CPSIACompliancePage />} />
        <Route path={routes.legal.sitemap} element={<SiteMapPage />} />
      </Route>

      {/* Auth routes */}
      <Route path={`${routes.signIn}/*`} element={<SignIn routing="path" path={routes.signIn} />} />
      <Route
        path={`${routes.signUp}/*`}
        element={
          <SignUp
            routing="path"
            path={routes.signUp}
            afterSignUpUrl={routes.welcome}
            afterSignInUrl={routes.home}
          />
        }
      />

      {/* Welcome (post-signup role chooser) */}
      <Route element={<MainLayout />}>
        <Route
          path={routes.welcome}
          element={
            <ProtectedRoute>
              <WelcomePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Donor routes (protected) */}
      <Route element={<DashboardLayout />}>
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
        <Route
          path="/donor/impact"
          element={
            <ProtectedRoute>
              <DonorImpact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/documents"
          element={
            <ProtectedRoute>
              <DonorDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/support"
          element={
            <ProtectedRoute>
              <DonorSupport />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* CBO routes (protected) */}
      <Route element={<DashboardLayout />}>
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

      {/* Campaign routes (public) */}
      <Route element={<MainLayout />}>
        <Route path="/campaign/:slug" element={<CampaignPage />} />
        <Route path="/user/campaign/:slug" element={<CampaignPage />} />
        <Route
          path="/campaign/:slug/donate"
          element={
            <ProtectedRoute>
              <CampaignDonatePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin routes (protected, admin-only) */}
      <Route element={<DashboardLayout />}>
        <Route
          path={routes.admin.dashboard}
          element={
            <ProtectedRoute>
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.admin.users}
          element={
            <ProtectedRoute>
              <ProtectedAdminRoute>
                <AdminUsersPage />
              </ProtectedAdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.admin.vetting}
          element={
            <ProtectedRoute>
              <ProtectedAdminRoute>
                <AdminVettingPage />
              </ProtectedAdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.admin.requests}
          element={
            <ProtectedRoute>
              <ProtectedAdminRoute>
                <AdminRequestsPage />
              </ProtectedAdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.admin.audit}
          element={
            <ProtectedRoute>
              <ProtectedAdminRoute>
                <AdminAuditPage />
              </ProtectedAdminRoute>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}
