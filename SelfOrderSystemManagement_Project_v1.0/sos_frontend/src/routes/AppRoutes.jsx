import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";

import { GuestRoute } from "../features/auth/components/GuestRoute";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { PageLoader } from "../shared/components/PageLoader";
import { NotFoundPage } from "../shared/components/NotFoundPage";
import { UnauthorizedPage } from "../shared/components/UnauthorizedPage";
import { ROUTES, USER_ROLES } from "../shared/constants/appConfig";

const lazyNamed = (loader, exportName) =>
  lazy(() =>
    loader().then((module) => ({
      default: module[exportName],
    })),
  );

const LoginPage = lazyNamed(
  () => import("../features/auth/pages/LoginPage"),
  "LoginPage",
);

const CustomerOrderPage = lazyNamed(
  () => import("../features/customer/pages/CustomerOrderPage"),
  "CustomerOrderPage",
);

const CashierOrdersPage = lazyNamed(
  () => import("../features/cashier/pages/CashierOrdersPage"),
  "CashierOrdersPage",
);

const CashierOrderDetailPage = lazyNamed(
  () => import("../features/cashier/pages/CashierOrderDetailPage"),
  "CashierOrderDetailPage",
);

const CashierPaymentPage = lazyNamed(
  () => import("../features/cashier/pages/CashierPaymentPage"),
  "CashierPaymentPage",
);

const CashierTransactionSuccessPage = lazyNamed(
  () => import("../features/cashier/pages/CashierTransactionSuccessPage"),
  "CashierTransactionSuccessPage",
);

const CashierReceiptPage = lazyNamed(
  () => import("../features/cashier/pages/CashierReceiptPage"),
  "CashierReceiptPage",
);

const CashierTransactionsPage = lazyNamed(
  () => import("../features/cashier/pages/CashierTransactionsPage"),
  "CashierTransactionsPage",
);

const CashierMenuPage = lazyNamed(
  () => import("../features/cashier/pages/CashierMenuPage"),
  "CashierMenuPage",
);

const OwnerDashboardPage = lazyNamed(
  () => import("../features/owner/pages/OwnerDashboardPage"),
  "OwnerDashboardPage",
);

const OwnerReportsPage = lazyNamed(
  () => import("../features/owner/pages/OwnerReportsPage"),
  "OwnerReportsPage",
);

const OwnerAnalyticsPage = lazyNamed(
  () => import("../features/owner/pages/OwnerAnalyticsPage"),
  "OwnerAnalyticsPage",
);

const OwnerMenuPage = lazyNamed(
  () => import("../features/owner/pages/OwnerMenuPage"),
  "OwnerMenuPage",
);

const OwnerTablesPage = lazyNamed(
  () => import("../features/owner/pages/OwnerTablesPage"),
  "OwnerTablesPage",
);

const OwnerUsersPage = lazyNamed(
  () => import("../features/owner/pages/OwnerUsersPage"),
  "OwnerUsersPage",
);

const OwnerUserFormPage = lazyNamed(
  () => import("../features/owner/pages/OwnerUserFormPage"),
  "OwnerUserFormPage",
);

const OwnerSettingsPage = lazyNamed(
  () => import("../features/owner/pages/OwnerSettingsPage"),
  "OwnerSettingsPage",
);

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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

        <Route path={ROUTES.publicOrder} element={<CustomerOrderPage />} />

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
    </Suspense>
  );
}
