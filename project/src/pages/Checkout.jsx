import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import client from '../api/client'; // Import client for API calls

const Checkout = () => {
    const { t, isRTL } = useLanguage();
    const { isAuthenticated, user } = useAuth();
    const { cart, clearCart, fetchCart, applyPromoCode } = useCart();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); // Sender's number
    const [paymentProof, setPaymentProof] = useState(null);
    const [contactPhone, setContactPhone] = useState(user?.phone || '');
    const [promoCode, setPromoCode] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);

    // Helper to format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };
    // Loyalty State
    const [loyalty, setLoyalty] = useState(null);
    const [pointsInput, setPointsInput] = useState('');
    const [redeemLoading, setRedeemLoading] = useState(false);

    React.useEffect(() => {
        const fetchLoyalty = async () => {
            try {
                const res = await client.get('/loyalty');
                if (res.data.success) {
                    setLoyalty(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching loyalty:', error);
            }
        };
        fetchLoyalty();
    }, []);

    const handleRedeemPoints = async () => {
        if (!pointsInput || isNaN(pointsInput) || parseInt(pointsInput) <= 0) {
            addToast('Please enter a valid points amount', 'error');
            return;
        }

        try {
            setRedeemLoading(true);
            const res = await client.post('/cart/redeem-points', { points: parseInt(pointsInput) });
            if (res.data.success) {
                addToast('Points applied successfully', 'success');
                fetchCart(); // Refresh cart to show discount
                setPointsInput('');
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to redeem points';
            addToast(msg, 'error');
        } finally {
            setRedeemLoading(false);
        }
    };

    const handleRemovePoints = async () => {
        try {
            setRedeemLoading(true);
            const res = await client.delete('/cart/redeem-points');
            if (res.data.success) {
                addToast('Points removed', 'success');
                fetchCart(); // Refresh cart
            }
        } catch (error) {
            addToast('Failed to remove points', 'error');
        } finally {
            setRedeemLoading(false);
        }
    };

    const PAYMENT_METHODS = {
        INSTAPAY: { id: 'InstaPay', name: 'InstaPay', number: '01000000000' },
        VODAFONE_CASH: { id: 'Vodafone Cash', name: 'Vodafone Cash', number: '01000000000' },
        TELDA: { id: 'Telda', name: 'Telda', number: '01500000000' }
    };

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        try {
            setPromoLoading(true);
            await applyPromoCode(promoCode);
            addToast('Promo code applied!', 'success');
            setPromoCode('');
        } catch (error) {
            addToast(error.response?.data?.message || 'Invalid promo code', 'error');
        } finally {
            setPromoLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentProof(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!paymentMethod) {
            addToast('Please select a payment method', 'error');
            return;
        }

        if (!contactPhone) {
            addToast('Please enter your contact phone number', 'error');
            return;
        }

        if (['InstaPay', 'Vodafone Cash', 'Telda'].includes(paymentMethod) && (!paymentProof || !phoneNumber)) {
            addToast('Please upload payment proof and enter the sender number', 'error');
            return;
        }

        try {
            setLoading(true);

            // Upload proof if exists
            let proofUrl = null;
            if (paymentProof) {
                const formData = new FormData();
                formData.append('file', paymentProof);

                const response = await client.post('/upload', formData, {
                    headers: {
                        'Content-Type': undefined
                    }
                });

                const uploadRes = response.data;

                if (!uploadRes.success) throw new Error(uploadRes.message || 'Upload failed');
                proofUrl = uploadRes.data.url;
            }

            // Create Order
            const orderData = {
                phone: contactPhone,
                paymentMethod,
                paymentProof: proofUrl,
                phoneNumber
            };

            const response = await client.post('/orders', orderData);
            const orderRes = response.data;

            if (orderRes.success) {
                addToast('Order placed successfully!', 'success');
                clearCart();
                // Redirect to success page or orders list
                // Since we don't have a success page, go to cart (empty) or home
                // User requirement: "user can do checkout... then upload message and order not confirmed until photo... products does not appear for admin"
                // Actually user said "add to cart open automatic... checkout". 
                // Redirecting to home or orders is standard.
                navigate('/');
            }

        } catch (error) {
            console.error('Checkout Error:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Order failed';
            addToast(errorMessage, 'error');
            alert(`Order Failed: ${errorMessage}`); // Force alert for immediate visibility
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="checkout-auth-boundary container">
                <h2 className="auth-message">
                    {t('pleaseSignIn')}
                </h2>
                <Link to="/login" className="auth-btn">
                    {t('signIn')}
                </Link>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="checkout-empty-boundary container">
                <div className="empty-card">
                    <p className="empty-message">
                        {isRTL ? 'سلة التسوق فارغة' : 'Your cart is empty'}
                    </p>
                    <Link to="/products" className="auth-btn underline-none">
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page-root" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="container" style={{ padding: '0 clamp(16px, 4vw, 24px)', maxWidth: '1440px', margin: '0 auto' }}>
                <header className="checkout-header" style={{ padding: 'clamp(32px, 6vw, 48px) 0' }}>
                    <h1 className="checkout-title" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--color-cyan-primary)', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 30px rgba(0, 217, 255, 0.3)' }}>
                        {t('checkoutTitle')}
                    </h1>
                </header>

                <div className="checkout-main-grid">
                    {/* 1. Visual Confirmation (Product Summary) */}
                    <section className="product-summary-section">
                        <div className="section-card">
                            <h2 className="section-title">Visual Confirmation</h2>
                            <div className="summary-items-list">
                                {cart.items.map((item) => (
                                    <div key={item._id} className="summary-item-row">
                                        <div className="summary-item-image">
                                            <img src={getImageUrl(item.product?.images?.[0])} alt={item.name} />
                                        </div>
                                        <div className="summary-item-info">
                                            <div className="summary-item-name">{item.name}</div>
                                            <div className="summary-item-meta">
                                                {item.product?.platform} | {item.variant?.type}
                                            </div>
                                            <div className="summary-item-qty">
                                                Qty: {item.quantity}
                                            </div>
                                        </div>
                                        <div className="summary-item-price">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 2. Order Details Form */}
                    <div className="checkout-form-container">
                        <form onSubmit={handleSubmit} className="elite-checkout-form">
                            {/* Contact Info */}
                            <section className="form-section">
                                <div className="section-card">
                                    <h2 className="section-title">Contact Information</h2>
                                    <div className="input-group">
                                        <label className="input-label">Communication Number</label>
                                        <input
                                            type="text"
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            className="elite-input"
                                            placeholder="01xxxxxxxxx"
                                            required
                                        />
                                        <p className="input-hint">We'll use this for delivery updates via WhatsApp/Call.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Loyalty Points Redemption */}
                            {loyalty && loyalty.settings && loyalty.loyalty && (
                                <section className="form-section loyalty-section">
                                    <div className="section-card loyalty-card">
                                        <h2 className="section-title loyalty-title">
                                            <span className="diamond-icon">💎</span> Loyalty Rewards
                                        </h2>

                                        <div className="loyalty-status">
                                            <div className="status-row">
                                                <span className="status-label">Available Balance</span>
                                                <span className="status-value">{loyalty.loyalty.points} pts</span>
                                            </div>
                                            <div className="status-row">
                                                <span className="status-label">Estimated Value</span>
                                                <span className="status-value">EGP {(loyalty.loyalty.points / loyalty.settings.pointsToMoneyRatio).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {cart.pointsUsed > 0 ? (
                                            <div className="loyalty-applied-box">
                                                <div className="applied-info">
                                                    <span className="applied-label">{cart.pointsUsed} Points Redeemed</span>
                                                    <span className="applied-discount">-EGP {cart.pointsDiscount} Saved</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemovePoints}
                                                    disabled={redeemLoading}
                                                    className="loyalty-remove-btn"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="loyalty-input-stack">
                                                <div className="stack-row">
                                                    <input
                                                        type="number"
                                                        value={pointsInput}
                                                        onChange={(e) => setPointsInput(e.target.value)}
                                                        placeholder={`Min: ${loyalty.settings.minPointsToRedeem}`}
                                                        className="elite-input points-input"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleRedeemPoints}
                                                        disabled={redeemLoading || !pointsInput}
                                                        className="loyalty-apply-btn"
                                                    >
                                                        {redeemLoading ? '...' : 'Redeem Now'}
                                                    </button>
                                                </div>
                                                <p className="loyalty-hint">
                                                    *Ratio: {loyalty.settings.pointsToMoneyRatio} pts = 1 EGP
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Payment Methods */}
                            <section className="form-section">
                                <div className="section-card">
                                    <h2 className="section-title">Payment Architecture</h2>
                                    <div className="payment-grid">
                                        {Object.values(PAYMENT_METHODS).map(method => (
                                            <label key={method.id} className={`payment-card ${paymentMethod === method.id ? 'active' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method.id}
                                                    checked={paymentMethod === method.id}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="payment-radio"
                                                />
                                                <div className="payment-card-content">
                                                    <div className="radio-circle"></div>
                                                    <span className="method-name">{method.name}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Manual Payment Details */}
                            {paymentMethod && (
                                <section className="form-section payment-details-section">
                                    <div className="section-card details-card">
                                        <div className="transfer-instructions">
                                            <p className="instruction-head">Transfer Requirement</p>
                                            <div className="amount-display">
                                                <span className="currency">EGP</span>
                                                <span className="value">{formatPrice(cart.total).replace(/[^0-9.]/g, '')}</span>
                                            </div>
                                            <p className="transfer-to">Send to wallet:</p>
                                            <div className="wallet-number-box">
                                                {Object.values(PAYMENT_METHODS).find(m => m.id === paymentMethod).number}
                                            </div>
                                        </div>

                                        <div className="sender-info-fields">
                                            <div className="input-group">
                                                <label className="input-label">Sender Wallet Number</label>
                                                <input
                                                    type="text"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    placeholder="01xxxxxxxxx"
                                                    className="elite-input"
                                                />
                                            </div>

                                            <div className="input-group">
                                                <label className="input-label">Transfer Receipt (Screenshot)</label>
                                                <div className="file-upload-wrapper">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="hidden-file-input"
                                                        id="payment-proof"
                                                    />
                                                    <label htmlFor="payment-proof" className="custom-file-btn">
                                                        {paymentProof ? paymentProof.name : 'Select File'}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </form>
                    </div>

                    {/* 3. Order Summary Sidebar */}
                    <aside className="checkout-summary-sidebar">
                        <div className="summary-sticky-card">
                            <h2 className="summary-heading">Order Confirmation</h2>

                            <div className="promo-code-section">
                                <div className="promo-input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Promo Code"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="elite-input promo-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyPromo}
                                        disabled={promoLoading || !promoCode}
                                        className="promo-apply-btn"
                                    >
                                        {promoLoading ? '...' : 'Apply'}
                                    </button>
                                </div>
                            </div>

                            <div className="fare-breakdown">
                                <div className="fare-row">
                                    <span>Subtotal</span>
                                    <span>EGP {cart.subtotal}</span>
                                </div>
                                {cart.discount > 0 && (
                                    <div className="fare-row discount">
                                        <span>Promo Discount</span>
                                        <span>-EGP {cart.discount}</span>
                                    </div>
                                )}
                                {cart.pointsDiscount > 0 && (
                                    <div className="fare-row loyalty">
                                        <span>Loyalty Discount</span>
                                        <span>-EGP {cart.pointsDiscount}</span>
                                    </div>
                                )}
                                <div className="fare-row total-row">
                                    <span>Final Total</span>
                                    <span className="total-price">EGP {cart.total}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="checkout-power-cta"
                            >
                                {loading ? 'Securing Order...' : 'Confirm & Place Order'}
                            </button>

                            <div className="trust-badges">
                                <div className="badge">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                    Encrypted Checkout
                                </div>
                                <div className="badge">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    Buyer Protection Enabled
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <style>{`
                .checkout-page-root {
                    background-color: var(--color-bg-primary);
                    min-height: 100vh;
                    color: var(--color-text-primary);
                    direction: var(--dir);
                }

                .checkout-auth-boundary, .checkout-empty-boundary {
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    gap: 32px;
                }

                .auth-message, .empty-message {
                    color: var(--color-text-primary);
                    font-family: Orbitron, sans-serif;
                    text-align: center;
                }

                .empty-card {
                    background: var(--color-bg-card);
                    border-radius: 24px;
                    border: 1px solid var(--color-border);
                    padding: 48px;
                    text-align: center;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                }

                .underline-none { text-decoration: none; }

                .checkout-main-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 32px;
                    padding-bottom: 64px;
                    align-items: start;
                }

                @media (min-width: 1024px) {
                    .checkout-main-grid {
                        grid-template-columns: 1fr 400px;
                    }
                }

                .section-card {
                    background: linear-gradient(145deg, rgba(22, 22, 26, 0.8) 0%, rgba(18, 18, 20, 0.9) 100%);
                    padding: clamp(24px, 4vw, 32px);
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(20px);
                }

                .section-title {
                    font-family: Orbitron, sans-serif;
                    font-size: 1.25rem;
                    color: var(--color-text-primary);
                    margin-bottom: 24px;
                }

                .summary-items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .summary-item-row {
                    display: flex;
                    gap: 20px;
                    align-items: center;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .summary-item-image {
                    width: 70px;
                    height: 90px;
                    border-radius: 8px;
                    overflow: hidden;
                    flex-shrink: 0;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .summary-item-image img { width: 100%; height: 100%; object-fit: cover; }
                .summary-item-info { flex: 1; }
                .summary-item-name { font-weight: 700; font-size: 1.1rem; margin-bottom: 4px; color: var(--color-text-primary); }
                .summary-item-meta { font-size: 0.85rem; color: var(--color-text-muted); font-family: "JetBrains Mono", monospace; }
                .summary-item-qty { font-size: 0.9rem; color: var(--color-cyan-primary); margin-top: 4px; font-weight: 600; }
                .summary-item-price { font-family: Orbitron, sans-serif; font-weight: 800; color: #fff; font-size: 1.1rem; }

                .form-section { margin-bottom: 32px; }
                .input-group { margin-bottom: 20px; }
                .input-label { display: block; font-size: 0.9rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 10px; }

                .elite-input {
                    width: 100%;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    outline: none;
                }

                .elite-input:focus {
                    border-color: var(--color-cyan-primary);
                    background: rgba(0, 217, 255, 0.05);
                }

                .input-hint { font-size: 0.8rem; color: var(--color-text-muted); margin-top: 8px; }

                .payment-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
                @media (min-width: 640px) { .payment-grid { grid-template-columns: repeat(3, 1fr); } }

                .payment-card { cursor: pointer; position: relative; }
                .payment-radio { position: absolute; opacity: 0; }
                .payment-card-content {
                    padding: 24px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.3s ease;
                }

                .payment-card.active .payment-card-content {
                    background: rgba(0, 217, 255, 0.08);
                    border-color: var(--color-cyan-primary);
                }

                .radio-circle { width: 24px; height: 24px; border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
                .payment-card.active .radio-circle { border-color: var(--color-cyan-primary); }
                .payment-card.active .radio-circle::after { content: ''; width: 12px; height: 12px; background: var(--color-cyan-primary); border-radius: 50%; }

                .transfer-instructions { text-align: center; margin-bottom: 32px; padding: 24px; background: rgba(0, 217, 255, 0.05); border-radius: 20px; border: 1px dashed rgba(0, 217, 255, 0.3); }
                .amount-display { display: flex; align-items: baseline; justify-content: center; gap: 8px; margin: 12px 0; }
                .amount-display .value { font-size: 2.5rem; font-family: Orbitron, sans-serif; font-weight: 900; color: var(--color-cyan-primary); }
                .wallet-number-box { font-size: 1.5rem; font-family: "JetBrains Mono", monospace; background: #1a1a1e; padding: 12px 24px; border-radius: 12px; display: inline-block; margin-top: 12px; letter-spacing: 2px; }

                .loyalty-card { background: linear-gradient(145deg, rgba(255, 215, 0, 0.05) 0%, rgba(184, 134, 11, 0.02) 100%); border-color: rgba(255, 215, 0, 0.2); }
                .loyalty-title { color: #FFD700; }
                .loyalty-status { display: flex; justify-content: space-around; margin-bottom: 24px; background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 16px; }
                .status-value { font-weight: 800; color: #FFD700; font-family: Orbitron, sans-serif; }

                .loyalty-applied-box { display: flex; align-items: center; justify-content: space-between; background: rgba(255, 215, 0, 0.1); padding: 20px; border-radius: 16px; }
                .loyalty-input-stack { display: flex; flex-direction: column; gap: 12px; }
                .stack-row { display: flex; gap: 12px; }
                @media (max-width: 480px) { .stack-row { flex-direction: column; } }
                .loyalty-apply-btn { background: #FFD700; color: #000; border: none; padding: 0 24px; border-radius: 12px; font-weight: 800; cursor: pointer; min-height: 52px; }

                .promo-code-section { margin: 24px 0; }
                .promo-input-wrapper { display: flex; gap: 8px; }
                .promo-input { flex: 1; height: 52px; }
                .promo-apply-btn { 
                    background: rgba(255, 255, 255, 0.1); 
                    color: #fff; 
                    border: 1px solid rgba(255, 255, 255, 0.2); 
                    padding: 0 20px; 
                    border-radius: 12px; 
                    cursor: pointer; 
                    transition: all 0.3s; 
                    font-weight: 600;
                    height: 52px;
                }
                .promo-apply-btn:hover:not(:disabled) { background: var(--color-cyan-primary); color: #000; border-color: var(--color-cyan-primary); }

                .checkout-summary-sidebar { position: sticky; top: 100px; }
                .summary-sticky-card { background: rgba(30, 30, 35, 0.95); padding: 32px; border-radius: 28px; border: 1px solid rgba(0, 217, 255, 0.2); backdrop-filter: blur(40px); }
                .fare-breakdown { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
                .total-row { margin-top: 12px; padding-top: 20px; border-top: 2px solid rgba(255, 255, 255, 0.1); }
                .total-price { font-size: 1.75rem; font-family: Orbitron, sans-serif; font-weight: 900; color: var(--color-cyan-primary); }

                .checkout-power-cta {
                    width: 100%;
                    height: 64px;
                    background: var(--color-cyan-primary);
                    color: #000;
                    border: none;
                    border-radius: 18px;
                    font-size: 1.1rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    box-shadow: 0 0 30px rgba(0, 217, 255, 0.4);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .checkout-power-cta:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(0, 217, 255, 0.6);
                }

                .trust-badges { margin-top: 32px; display: flex; flex-direction: column; gap: 12px; }
                .badge { display: flex; align-items: center; gap: 10px; font-size: 0.75rem; color: var(--color-text-muted); }

                .custom-file-btn {
                    display: inline-block;
                    padding: 12px 24px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .custom-file-btn:hover { background: rgba(255, 255, 255, 0.1); }
                .hidden-file-input { display: none; }

                /* RTL Specifics */
                [dir="rtl"] .summary-item-price { text-align: left; }
                [dir="rtl"] .summary-item-info { text-align: right; }
                [dir="rtl"] .fare-row { flex-direction: row-reverse; }
                [dir="rtl"] .status-row { flex-direction: row-reverse; }
                [dir="rtl"] .applied-info { text-align: right; }
            `}</style>
        </div>
    );
};

export default Checkout;
