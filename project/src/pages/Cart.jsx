import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag, Shield } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const Cart = () => {
    const { t, isRTL } = useLanguage();
    const { isAuthenticated } = useAuth();
    const { cart, loading, updateCartItem, removeFromCart, clearCart, total } = useCart();
    const navigate = useNavigate();

    // Helper to format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

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

    if (loading) {
        return (
            <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Empty State
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="container" style={{ minHeight: '60vh', padding: 'var(--spacing-xl) 0', direction: isRTL ? 'rtl' : 'ltr' }}>
                <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '32px', color: 'var(--color-cyan-primary)', marginBottom: 'var(--spacing-xl)' }}>
                    {t('cartTitle')}
                </h1>
                <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <ShoppingBag size={64} style={{ color: 'var(--color-text-muted)', marginBottom: '20px', opacity: 0.5 }} />
                    <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '10px' }}>{t('emptyCart')}</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>
                        {isRTL ? 'ابدأ بإضافة الألعاب إلى سلة التسوق!' : 'Start adding games to your cart!'}
                    </p>
                    <Link to="/games" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                        {t('browseGames')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ minHeight: '80vh', padding: '40px 0', direction: isRTL ? 'rtl' : 'ltr' }}>
            <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '32px', color: 'var(--color-cyan-primary)', marginBottom: '40px' }}>
                {t('cartTitle')}
            </h1>

            <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '40px', alignItems: 'start' }}>

                {/* Cart Items List */}
                <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {cart.items.map((item) => (
                        <div key={item._id} style={{
                            display: 'grid',
                            gridTemplateColumns: '100px 1fr auto',
                            gap: '20px',
                            background: 'var(--color-bg-card)',
                            padding: '20px',
                            borderRadius: '16px',
                            border: '1px solid var(--color-border)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Product Image */}
                            <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
                                <img
                                    src={getImageUrl(item.product?.images?.[0])}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>

                            {/* Product Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)', fontSize: '18px' }}>
                                        <Link to={`/product/${item.product?._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            {item.name}
                                        </Link>
                                    </h3>
                                    {item.variant && (
                                        <span style={{
                                            background: 'rgba(0, 217, 255, 0.1)',
                                            color: 'var(--color-cyan-primary)',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase'
                                        }}>
                                            {item.variant.type}
                                        </span>
                                    )}
                                </div>
                                <div style={{ color: 'var(--color-cyan-primary)', fontWeight: 'bold', fontSize: '18px' }}>
                                    {formatPrice(item.price * item.quantity)}
                                </div>
                            </div>

                            {/* Actions (Quantity & Delete) */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        transition: 'opacity 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                    title={t('remove')}
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'var(--color-bg-primary)',
                                    padding: '5px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)'
                                }}>
                                    <button
                                        onClick={() => updateCartItem(item._id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-text-primary)',
                                            cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                            opacity: item.quantity <= 1 ? 0.3 : 1,
                                            padding: '4px',
                                            display: 'flex'
                                        }}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span style={{ color: 'var(--color-text-primary)', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateCartItem(item._id, item.quantity + 1)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-text-primary)',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex'
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={clearCart}
                        style={{
                            alignSelf: 'flex-start',
                            background: 'none',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-muted)',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {t('clearCart')}
                    </button>
                </div>

                {/* Order Summary */}
                <div style={{ position: 'sticky', top: '100px' }}>
                    <div style={{
                        background: 'var(--color-bg-card)',
                        padding: '30px',
                        borderRadius: '16px',
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}>
                        <h2 style={{ fontSize: '24px', fontFamily: 'Orbitron, sans-serif', color: 'var(--color-text-primary)', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px' }}>
                            {t('summary')}
                        </h2>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--color-text-secondary)' }}>
                            <span>{t('subtotal')}</span>
                            <span>{formatPrice(total)}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '20px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                            <span>{t('total')}</span>
                            <span>{formatPrice(total)}</span>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                padding: '16px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            {t('checkout')}
                        </button>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                            <Shield size={14} />
                            <span>Secure Checkout</span>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .cart-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Cart;
