/**
 * 리팩토링된 App.tsx
 * - ErrorBoundary 추가
 * - 개선된 구조
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OrderProvider, useOrders } from './shared/contexts/OrderContext';
import { AuthProvider, useAuth } from './shared/contexts/AuthContext';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { KioskPageRefactored } from './features/kiosk/KioskPageRefactored';
import { BaristaPage } from './pages/BaristaPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminMenusPage } from './pages/admin/AdminMenusPage';
import { AdminCellsPage } from './pages/admin/AdminCellsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSettlementsPage } from './pages/admin/AdminSettlementsPage';
import { AdminStatisticsPage } from './pages/admin/AdminStatisticsPage';

const AppRoutes = () => {
  const { orders, nextOrderNumber, updateOrderStatus, resetOrderNumber } = useOrders();
  const { isAdminLoggedIn, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Kiosk - 리팩토링된 버전 */}
        <Route path="/" element={<KioskPageRefactored />} />

        {/* Barista */}
        <Route path="/barista" element={<BaristaPage />} />

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={
            isAdminLoggedIn ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLoginPage />
            )
          }
        />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            isAdminLoggedIn ? (
              <AdminDashboardPage orders={orders} onLogout={logout} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/admin/orders"
          element={
            isAdminLoggedIn ? (
              <AdminOrdersPage
                orders={orders}
                onUpdateStatus={updateOrderStatus}
                onLogout={logout}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/admin/menus"
          element={
            isAdminLoggedIn ? (
              <AdminMenusPage onLogout={logout} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/admin/cells"
          element={
            isAdminLoggedIn ? (
              <AdminCellsPage onLogout={logout} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/admin/settings"
          element={
            isAdminLoggedIn ? (
              <AdminSettingsPage
                currentOrderNumber={nextOrderNumber}
                onResetOrderNumber={resetOrderNumber}
                onLogout={logout}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/admin/categories"
          element={
            isAdminLoggedIn ? (
              <AdminCategoriesPage onLogout={logout} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/admin/settlements"
          element={
            isAdminLoggedIn ? (
              <AdminSettlementsPage orders={orders} onLogout={logout} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/admin/statistics"
          element={
            isAdminLoggedIn ? (
              <AdminStatisticsPage orders={orders} onLogout={logout} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const AppRefactored = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <OrderProvider>
          <AppRoutes />
        </OrderProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default AppRefactored;
