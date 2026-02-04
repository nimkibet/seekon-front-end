import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import toast from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminTransactions from './pages/AdminTransactions';
import AdminUsers from './pages/AdminUsers';
import AdminProducts from './pages/AdminProducts';
import AdminInventory from './pages/AdminInventory';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import AdminCarts from './pages/AdminCarts';
import AdminFlashSale from './pages/AdminFlashSale';
import Contact from './pages/Contact';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import CorporatePage from './pages/CorporatePage';
import Logo3DPage from './pages/Logo3DPage';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import AllFootwear from './pages/AllFootwear';
import AllApparel from './pages/AllApparel';
import AllAccessories from './pages/AllAccessories';
import FlashSale from './pages/FlashSale';

// Components
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AIChatAssistant from './components/AIChatAssistant';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { isAuthenticated, user } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

// Protected Flash Sale Route - Uses SettingsContext for global state
const ProtectedFlashSaleRoute = ({ children }) => {
  const { flashSaleSettings, isLoading } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !flashSaleSettings?.isActive) {
      toast.error('Flash Sale is currently inactive');
      navigate('/');
    }
  }, [flashSaleSettings, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!flashSaleSettings?.isActive) {
    return null;
  }

  return children;
};

// Main App Layout
const AppLayout = ({ children }) => {
  return (
    <Layout>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <AIChatAssistant />
    </Layout>
  );
};

// App Component
const App = () => {
  console.log('🏗️ App component rendering...');
  
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <SettingsProvider>
            <Router>
            <div className="App">
              <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />

              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } />

              <Route path="/reset-password/:token" element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              } />

              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <AppLayout>
                  <Home />
                </AppLayout>
              } />

              <Route path="/collection" element={
                <AppLayout>
                  <Collection />
                </AppLayout>
              } />

              <Route path="/all-footwear" element={
                <AppLayout>
                  <AllFootwear />
                </AppLayout>
              } />

              <Route path="/all-apparel" element={
                <AppLayout>
                  <AllApparel />
                </AppLayout>
              } />

              <Route path="/all-accessories" element={
                <AppLayout>
                  <AllAccessories />
                </AppLayout>
              } />

              <Route path="/flash-sale" element={
                <ProtectedFlashSaleRoute>
                  <AppLayout>
                    <FlashSale />
                  </AppLayout>
                </ProtectedFlashSaleRoute>
              } />

              <Route path="/logo-3d" element={
                <Logo3DPage />
              } />

              <Route path="/product/:id" element={
                <AppLayout>
                  <ProductDetail />
                </AppLayout>
              } />

              <Route path="/cart" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Cart />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/checkout" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Checkout />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/orders" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Orders />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/orders/:orderId" element={
                <ProtectedRoute>
                  <AppLayout>
                    <OrderDetails />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Wishlist />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/transactions" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminTransactions />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              
              <Route path="/admin/products" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminProducts />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/flash-sale" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminFlashSale />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/orders" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminTransactions />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/inventory" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminInventory />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/analytics" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminAnalytics />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/reports" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminReports />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/settings" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminSettings />
                  </AdminLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/carts" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminCarts />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              {/* Redirect /admin to /admin/dashboard */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

              {/* Footer Pages */}
              <Route path="/contact" element={
                <AppLayout>
                  <Contact />
                </AppLayout>
              } />

              <Route path="/shipping" element={
                <AppLayout>
                  <Shipping />
                </AppLayout>
              } />

              <Route path="/returns" element={
                <AppLayout>
                  <Returns />
                </AppLayout>
              } />

              {/* Corporate Pages */}
              <Route path="/about" element={
                <AppLayout>
                  <CorporatePage />
                </AppLayout>
              } />

              <Route path="/careers" element={
                <AppLayout>
                  <CorporatePage />
                </AppLayout>
              } />

              <Route path="/press" element={
                <AppLayout>
                  <CorporatePage />
                </AppLayout>
              } />

              <Route path="/sustainability" element={
                <AppLayout>
                  <CorporatePage />
                </AppLayout>
              } />

              <Route path="/investors" element={
                <AppLayout>
                  <CorporatePage />
                </AppLayout>
              } />

              {/* Catch all route */}
              <Route path="*" element={
                <AppLayout>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        404 - Page Not Found
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 mb-8">
                        The page you're looking for doesn't exist.
                      </p>
                      <a
                        href="/"
                        className="btn-primary"
                      >
                        Go Home
                      </a>
                    </div>
                  </div>
                </AppLayout>
              } />
            </Routes>
          </div>
        </Router>
        </SettingsProvider>
      </AuthProvider>
    </Provider>
    </ErrorBoundary>
  );
};

export default App;

