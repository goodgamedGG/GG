import React, { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from token on mount
        loadUser();
    }, []);

    const loadUser = async () => {
        const token = authAPI.getAuthToken?.() || localStorage.getItem('token');
        if (token) {
            try {
                const userData = await authAPI.getProfile();
                setUser(userData);
            } catch (error) {
                console.error('Failed to load user:', error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const data = await authAPI.login(email, password);
        setUser(data.user);
        return data;
    };

    const signup = async (name, email, password, phone) => {
        const data = await authAPI.signup(name, email, password, phone);
        return data;
    };

    const verifyEmail = async (email, code) => {
        const data = await authAPI.verifyEmail(email, code);
        setUser(data.user);
        return data;
    };

    const resendVerification = async (email) => {
        return await authAPI.resendVerification(email);
    };

    const forgotPassword = async (email) => {
        return await authAPI.forgotPassword(email);
    };

    const resetPassword = async (token, newPassword) => {
        return await authAPI.resetPassword(token, newPassword);
    };

    const updateProfile = async (data) => {
        const updatedUser = await authAPI.updateProfile(data);
        setUser(updatedUser);
        return updatedUser;
    };

    const changePassword = async (currentPassword, newPassword) => {
        return await authAPI.changePassword(currentPassword, newPassword);
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        signup,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        logout,
        isAuthenticated: !!user,
        isEmailVerified: user?.isEmailVerified || false,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
