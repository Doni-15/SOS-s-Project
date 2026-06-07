import { Navigate, Route, Routes } from "react-router";

import { GuestRoute } from "../features/auth/components/GuestRoute";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { CashierOrdersPage } from "../features/cashier/pages/CashierOrdersPage";
import { CashierOrderDetailPage } from "../features/cashier/pages/CashierOrderDetailPage";
import { CashierPaymentPage } from "../features/cashier/pages/CashierPaymentPage";
import { CashierTransactionSuccessPage } from "../features/cashier/pages/CashierTransactionSuccessPage";
import { CashierReceiptPage } from "../features/cashier/pages/CashierReceiptPage";
import { CashierMenuPage } from "../features/cashier/pages/CashierMenuPage";
import { CashierTransactionsPage } from "../features/cashier/pages/CashierTransactionsPage";
import { OwnerAnalyticsPage } from "../features/owner/pages/OwnerAnalyticsPage";
import { OwnerDashboardPage } from "../features/owner/pages/OwnerDashboardPage";
import { OwnerMenuPage } from "../features/owner/pages/OwnerMenuPage";
import { OwnerTablesPage } from "../features/owner/pages/OwnerTablesPage";
import { OwnerReportsPage } from "../features/owner/pages/OwnerReportsPage";
import { OwnerSettingsPage } from "../features/owner/pages/OwnerSettingsPage";
import { OwnerUsersPage } from "../features/owner/pages/OwnerUsersPage";
import { OwnerUserFormPage } from "../features/owner/pages/OwnerUserFormPage";
import { NotFoundPage } from "../shared/components/NotFoundPage";
import { UnauthorizedPage } from "../shared/components/UnauthorizedPage";
import { ROUTES, USER_ROLES } from "../shared/constants/appConfig";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.login} replace />} />

      <Route
        path={ROUTES.login}
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      <Route path={ROUTES.unauthorized} element={<UnauthorizedPage />} />

      <Route
        path={ROUTES.ownerDashboard}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <OwnerDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ownerReports}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <OwnerReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ownerAnalytics}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <OwnerAnalyticsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ownerMenu}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <OwnerMenuPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ownerTables}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <OwnerTablesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ownerUsers}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <OwnerUsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ownerUserCreate}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <OwnerUserFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ownerUserEdit}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <OwnerUserFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ownerSettings}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <OwnerSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.cashierOrders}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CASHIER, USER_ROLES.OWNER]}>
            <CashierOrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.cashierOrderDetail}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CASHIER, USER_ROLES.OWNER]}>
            <CashierOrderDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.cashierOrderPayment}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CASHIER, USER_ROLES.OWNER]}>
            <CashierPaymentPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.cashierTransactionSuccess}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CASHIER, USER_ROLES.OWNER]}>
            <CashierTransactionSuccessPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.cashierTransactionReceipt}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CASHIER, USER_ROLES.OWNER]}>
            <CashierReceiptPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.cashierTransactions}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CASHIER, USER_ROLES.OWNER]}>
            <CashierTransactionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.cashierMenu}
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CASHIER, USER_ROLES.OWNER]}>
            <CashierMenuPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
