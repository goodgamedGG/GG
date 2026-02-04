import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
    const { t, isRTL } = useLanguage();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', direction: isRTL ? 'rtl' : 'ltr' }}>
                <h2 style={{ color: 'var(--color-text-primary)' }}>
                    {isRTL ? 'يرجى تسجيل الدخول لعرض سلة التسوق' : 'Please sign in to view your cart'}
                </h2>
                <Link to="/login" className="auth-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    {t('signIn')}
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ minHeight: '60vh', padding: 'var(--spacing-xl) 0', direction: isRTL ? 'rtl' : 'ltr' }}>
            <h1 style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '32px',
                color: 'var(--color-cyan-primary)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                {t('cartTitle')}
            </h1>

            <div style={{
                textAlign: 'center',
                padding: 'var(--spacing-3xl)',
                background: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)'
            }}>
                <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                    {t('emptyCart')}
                </h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>
                    {isRTL ? 'ابدأ بإضافة الألعاب إلى سلة التسوق!' : 'Start adding games to your cart!'}
                </p>
                <Link to="/" className="auth-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    {t('browseGames')}
                </Link>
            </div>
        </div>
    );
};

export default Cart;
