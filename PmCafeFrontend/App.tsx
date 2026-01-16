import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OrderProvider, useOrders } from './shared/contexts/OrderContext';
import { AuthProvider, useAuth } from './shared/contexts/AuthContext';
import { KioskPage } from './pages/KioskPage';
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
  const { nextOrderNumber, updateOrderStatus, resetOrderNumber } = useOrders();
  const { isAdminLoggedIn, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Kiosk */}
        <Route path="/" element={<KioskPage />} />

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
              <AdminDashboardPage onLogout={logout} />
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
              <AdminSettlementsPage onLogout={logout} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/admin/statistics"
          element={
            isAdminLoggedIn ? (
              <AdminStatisticsPage onLogout={logout} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <OrderProvider>
        <AppRoutes />
      </OrderProvider>
    </AuthProvider>
  );
};

export default App;
