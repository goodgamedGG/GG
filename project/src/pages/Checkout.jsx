import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Checkout = () => {
    const { t, isRTL } = useLanguage();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        return (
            <>
                <Header />
                <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', direction: isRTL ? 'rtl' : 'ltr' }}>
                    <h2 style={{ color: 'var(--color-text-primary)' }}>
                        {isRTL ? 'يرجى تسجيل الدخول للمتابعة' : 'Please sign in to continue'}
                    </h2>
                    <Link to="/login" className="auth-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        {t('signIn')}
                    </Link>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="container" style={{ minHeight: '60vh', padding: 'var(--spacing-xl) 0', maxWidth: '800px', direction: isRTL ? 'rtl' : 'ltr' }}>
                <h1 style={{ 
                    fontFamily: 'Orbitron, sans-serif', 
                    fontSize: '32px', 
                    color: 'var(--color-cyan-primary)',
                    marginBottom: 'var(--spacing-xl)'
                }}>
                    {t('checkoutTitle')}
                </h1>

                <div style={{
                    background: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    padding: 'var(--spacing-xl)'
                }}>
                    <h2 style={{
                        fontFamily: 'Orbitron, sans-serif',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--spacing-lg)'
                    }}>
                        {t('orderInformation')}
                    </h2>

                    <div style={{ 
                        textAlign: 'center', 
                        padding: 'var(--spacing-2xl)',
                        color: 'var(--color-text-muted)'
                    }}>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL ? 'سلة التسوق فارغة' : 'Your cart is empty'}
                        </p>
                        <Link to="/cart" className="auth-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            {isRTL ? 'العودة إلى السلة' : 'Back to Cart'}
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Checkout;
