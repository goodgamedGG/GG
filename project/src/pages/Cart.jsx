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
    const { cart, loading, updateCartItem, removeFromCart, clearCart, total, applyPromoCode } = useCart();
    const [promoCode, setPromoCode] = React.useState('');
    const [promoLoading, setPromoLoading] = React.useState(false);
    const [promoError, setPromoError] = React.useState('');
    const navigate = useNavigate();

    const handleApplyPromoCode = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoError('');
        try {
            await applyPromoCode(promoCode);
            setPromoCode('');
        } catch (error) {
            setPromoError(error.response?.data?.message || 'Invalid promo code');
        } finally {
            setPromoLoading(false);
        }
    };

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
                            gridTemplateColumns: '120px 1fr auto',
                            gap: '40px',
                            background: 'linear-gradient(145deg, rgba(22, 22, 26, 0.8) 0%, rgba(18, 18, 20, 0.9) 100%)',
                            padding: '30px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            position: 'relative',
                            overflow: 'hidden',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                        }}>
                            {/* Product Image */}
                            <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <img
                                    src={getImageUrl(item.product?.images?.[0])}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--color-text-primary)', fontSize: '22px', fontFamily: 'Orbitron, sans-serif' }}>
                                        <Link to={`/product/${item.product?._id}`} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} className="product-title-link">
                                            {item.name}
                                        </Link>
                                    </h3>

                                    <div className="product-details-grid" style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '12px 40px',
                                        maxWidth: '750px',
                                        fontSize: '12px',
                                        fontFamily: '"JetBrains Mono", monospace'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px' }}>
                                            <span style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Platform:</span>
                                            <span style={{ color: '#ffffff' }}>{item.product?.platform || 'PC'}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px' }}>
                                            <span style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Edition:</span>
                                            <span style={{ color: '#ffffff' }}>{item.variant?.type || 'Standard Edition'}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px' }}>
                                            <span style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Developer:</span>
                                            <span style={{ color: '#ffffff' }}>{item.product?.developer || 'Official Game'}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px' }}>
                                            <span style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Release:</span>
                                            <span style={{ color: '#ffffff' }}>{item.product?.releaseDate ? new Date(item.product.releaseDate).toLocaleDateString() : 'Now Available'}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px', gridColumn: 'span 2' }}>
                                            <span style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Format:</span>
                                            <span style={{ color: '#ffffff', textTransform: 'capitalize' }}>{item.product?.type || 'Digital'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    color: 'var(--color-cyan-primary)',
                                    fontWeight: '800',
                                    fontSize: '28px',
                                    fontFamily: 'Orbitron, sans-serif',
                                    textShadow: '0 0 15px rgba(0, 217, 255, 0.5)',
                                    marginTop: '8px'
                                }}>
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
                        background: 'linear-gradient(145deg, rgba(22, 22, 26, 0.8) 0%, rgba(18, 18, 20, 0.9) 100%)',
                        padding: '30px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(10px)',
                        position: 'relative'
                    }}>
                        <h2 style={{ fontSize: '24px', fontFamily: 'Orbitron, sans-serif', color: 'var(--color-text-primary)', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px' }}>
                            {t('summary')}
                        </h2>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{isRTL ? 'لديك رمز ترويجي؟' : 'Have a promo code?'}</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder={isRTL ? 'أدخل الرمز' : 'Enter code'}
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="promo-input"
                                    style={{
                                        flex: 1,
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={handleApplyPromoCode}
                                    disabled={!promoCode || promoLoading}
                                    className="promo-apply-btn"
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        borderRadius: '8px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid var(--color-cyan-primary)',
                                        color: 'var(--color-cyan-primary)',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {promoLoading ? '...' : (isRTL ? 'تطبيق' : 'Apply')}
                                </button>
                            </div>
                            {promoError && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontFamily: 'Inter, sans-serif' }}>{promoError}</div>}
                            {cart.discount > 0 && (
                                <div style={{ color: '#10b981', fontSize: '12px', marginTop: '4px' }}>
                                    Applied: {cart.promoCode} (-{formatPrice(cart.discount)})
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--color-text-secondary)' }}>
                            <span>{t('subtotal')}</span>
                            <span>{formatPrice(total)}</span>
                        </div>

                        {cart.discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#10b981' }}>
                                <span>Discount</span>
                                <span>-{formatPrice(cart.discount)}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '20px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                            <span>{t('total')}</span>
                            <span>{formatPrice(total - (cart.discount || 0))}</span>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn-primary checkout-btn"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                padding: '18px',
                                fontSize: '16px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                borderRadius: '12px',
                                boxShadow: '0 4px 15px rgba(0, 217, 255, 0.2)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center'
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

                @media (max-width: 768px) {
                    .product-details-grid {
                        grid-template-columns: 1fr !important;
                        gap: 12px 0 !important;
                    }
                }

                .promo-input {
                    transition: all 0.3s ease;
                }

                .promo-input:focus {
                    border-color: var(--color-cyan-primary) !important;
                    box-shadow: 0 0 10px rgba(0, 217, 255, 0.2) !important;
                    background: rgba(255, 255, 255, 0.08) !important;
                }

                .promo-apply-btn:hover:not(:disabled) {
                    background: var(--color-cyan-primary) !important;
                    color: #000 !important;
                    box-shadow: 0 0 15px rgba(0, 217, 255, 0.4);
                }

                .product-title-link:hover {
                    color: var(--color-cyan-primary) !important;
                }

                .checkout-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0, 217, 255, 0.4) !important;
                    filter: brightness(1.1);
                }

                .checkout-btn:active {
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
};

export default Cart;
