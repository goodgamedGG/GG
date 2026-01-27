import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { GameProvider } from './context/GameContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';

// Components
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Hero from './components/Hero';
import CTAButtons from './components/CTAButtons';
import GameGrid from './components/GameGrid';
import Footer from './components/Footer';

// Pages
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProductDetails from './pages/ProductDetails';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Payments from './pages/admin/Payments';
import Categories from './pages/admin/Categories';
import PromoCodes from './pages/admin/PromoCodes';
import Users from './pages/admin/Users';
import Reviews from './pages/admin/Reviews';
import Content from './pages/admin/Content';
import FlashSales from './pages/admin/FlashSales';
import PriceAlerts from './pages/admin/PriceAlerts';
import Loyalty from './pages/admin/Loyalty';
import Settings from './pages/admin/Settings';
import Analytics from './pages/admin/Analytics';
import EmailQueue from './pages/admin/EmailQueue';
import AuditLogs from './pages/admin/AuditLogs';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" />;

    if (requireAdmin && user.role !== 'admin' && user.role !== 'ADMIN') {
        return <Navigate to="/" />;
    }

    return children;
};

// Home Page Component
const Home = () => (
    <>
        <Header />
        <SearchBar />
        <Hero />
        <CTAButtons />
        <GameGrid />
        <Footer />
    </>
);

function App() {
    return (
        <ErrorBoundary>
            <LanguageProvider>
                <AuthProvider>
                    <CartProvider>
                        <GameProvider>
                            <Router>
                                <ErrorBoundary>
                                    <Routes>
                                        {/* Public Routes */}
                                        <Route path="/" element={<Home />} />
                                        <Route path="/cart" element={<Cart />} />
                                        <Route path="/checkout" element={<Checkout />} />
                                        <Route path="/about" element={<About />} />
                                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                                        <Route path="/product/:id" element={<ProductDetails />} />

                                        {/* Auth Routes */}
                                        <Route element={<AuthLayout />}>
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/signup" element={<SignUp />} />
                                            <Route path="/verify-email" element={<VerifyEmail />} />
                                            <Route path="/forgot-password" element={<ForgotPassword />} />
                                        </Route>

                                        {/* Admin Routes */}
                                        <Route path="/admin" element={
                                            <ProtectedRoute requireAdmin>
                                                <AdminLayout />
                                            </ProtectedRoute>
                                        }>
                                            <Route index element={<Dashboard />} />
                                            <Route path="products" element={<Products />} />
                                            <Route path="orders" element={<Orders />} />
                                            <Route path="payments" element={<Payments />} />
                                            <Route path="categories" element={<Categories />} />
                                            <Route path="promo-codes" element={<PromoCodes />} />
                                            <Route path="users" element={<Users />} />
                                            <Route path="reviews" element={<Reviews />} />
                                            <Route path="content" element={<Content />} />
                                            <Route path="flash-sales" element={<FlashSales />} />
                                            <Route path="price-alerts" element={<PriceAlerts />} />
                                            <Route path="loyalty" element={<Loyalty />} />
                                            <Route path="settings" element={<Settings />} />
                                            <Route path="analytics" element={<Analytics />} />
                                            <Route path="email-queue" element={<EmailQueue />} />
                                            <Route path="audit-logs" element={<AuditLogs />} />
                                        </Route>
                                    </Routes>
                                </ErrorBoundary>
                            </Router>
                        </GameProvider>
                    </CartProvider>
                </AuthProvider>
            </LanguageProvider>
        </ErrorBoundary>
    );
}

export default App;
