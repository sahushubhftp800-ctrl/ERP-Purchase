import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Vendors } from './pages/Vendors';
import { Products } from './pages/Products';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { CreateOrder } from './pages/CreateOrder';
import { OrderDetails } from './pages/OrderDetails';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Purchase Orders */}
              <Route path="orders" element={<PurchaseOrders />} />
              <Route
                path="orders/create"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'purchaser']}>
                    <CreateOrder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'purchaser']}>
                    <CreateOrder isEditMode={true} />
                  </ProtectedRoute>
                }
              />
              <Route path="orders/:id" element={<OrderDetails />} />

              {/* Master Catalogs */}
              <Route path="vendors" element={<Vendors />} />
              <Route path="products" element={<Products />} />

              {/* Reports */}
              <Route path="reports" element={<Reports />} />

              {/* User Administration */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Users />
                  </ProtectedRoute>
                }
              />

              {/* 404 inside layout */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Global Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
