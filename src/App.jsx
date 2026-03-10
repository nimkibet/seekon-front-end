import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import toast from 'react-hot-toast';

// Pages - Lazy loaded for code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const VerifyOtp = lazy(() => import('./pages/auth/VerifyOtp'));
const Collection = lazy(() => import('./pages/Collection'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const CartPage = lazy(() => import('./pages/CartPage'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminTransactions = lazy(() => import('./pages/AdminTransactions'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminInventory = lazy(() => import('./pages/AdminInventory'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminCarts = lazy(() => import('./pages/AdminCarts'));
const AdminFlashSale = lazy(() => import('./pages/AdminFlashSale'));
const WebSettings = lazy(() => import('./pages/admin/WebSettings'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const Contact = lazy(() => import('./pages/Contact'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Returns = lazy(() => import('./pages/Returns'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Cookies = lazy(() => import('./pages/Cookies'));
const CorporatePage = lazy(() => import('./pages/CorporatePage'));
const Logo3DPage = lazy(() => import('./pages/Logo3DPage'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const AllFootwear = lazy(() => import('./pages/AllFootwear'));
const AllApparel = lazy(() => import('./pages/AllApparel'));
const AllAccessories = lazy(() => import('./pages/AllAccessories'));
const FlashSale = lazy(() => import('./pages/FlashSale'));
const MyOrders = lazy(() => import('./pages/MyOrders'));

// Components
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatAssistant from './components/AIChatAssistant';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show a blank screen or a spinner while checking the token on refresh
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00A676]"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A676] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                  </div>
                </div>
              }>
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
              
              <Route path="/verify-otp" element={<VerifyOtp />} />
              
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
                <AppLayout>
                  <CartPage />
                </AppLayout>
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

              <Route path="/my-orders" element={
                <ProtectedRoute>
                  <AppLayout>
                    <MyOrders />
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
              
              <Route path="/admin/add-product" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AddProduct />
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
              
              <Route path="/admin/web-settings" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <WebSettings />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/orders" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminOrders />
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

              <Route path="/faq" element={
                <AppLayout>
                  <FAQ />
                </AppLayout>
              } />

              <Route path="/privacy" element={
                <AppLayout>
                  <Privacy />
                </AppLayout>
              } />

              <Route path="/terms" element={
                <AppLayout>
                  <Terms />
                </AppLayout>
              } />

              <Route path="/cookies" element={
                <AppLayout>
                  <Cookies />
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
            </Suspense>
          </div>
        </Router>
        </SettingsProvider>
      </AuthProvider>
    </Provider>
    </ErrorBoundary>
  );
};

export default App;

