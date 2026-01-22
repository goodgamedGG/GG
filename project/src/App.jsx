import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';

// Components
import Header from './components/Header';
import Hero from './components/Hero';
import CTAButtons from './components/CTAButtons';
import GameGrid from './components/GameGrid';
import Footer from './components/Footer';

// Pages
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/admin/Dashboard';
import Games from './pages/admin/Games';
import Users from './pages/admin/Users';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" />;

    if (requireAdmin && user.role !== 'ADMIN') {
        return <Navigate to="/" />;
    }

    return children;
};

// Home Page Component
const Home = () => (
    <>
        <Header />
        <Hero />
        <CTAButtons />
        <GameGrid />
        <Footer />
    </>
);

function App() {
    return (
        <AuthProvider>
            <GameProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />

                        {/* Auth Routes */}
                        <Route element={<AuthLayout />}>
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route path="/forgot-password" element={<div style={{ color: 'white', textAlign: 'center' }}>Feature coming soon</div>} />
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <ProtectedRoute requireAdmin>
                                <AdminLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="games" element={<Games />} />
                            <Route path="users" element={<Users />} />
                        </Route>
                    </Routes>
                </Router>
            </GameProvider>
        </AuthProvider>
    );
}

export default App;
