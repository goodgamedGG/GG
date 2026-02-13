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
    const { cart, clearCart, fetchCart } = useCart();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); // Sender's number
    const [paymentProof, setPaymentProof] = useState(null);
    const [contactPhone, setContactPhone] = useState(user?.phone || '');

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
            <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', direction: isRTL ? 'rtl' : 'ltr' }}>
                <h2 style={{ color: 'var(--color-text-primary)' }}>
                    {isRTL ? 'يرجى تسجيل الدخول للمتابعة' : 'Please sign in to continue'}
                </h2>
                <Link to="/login" className="auth-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    {t('signIn')}
                </Link>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container" style={{ minHeight: '60vh', padding: 'var(--spacing-xl) 0', maxWidth: '800px', direction: isRTL ? 'rtl' : 'ltr' }}>
                <div style={{
                    background: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    padding: 'var(--spacing-xl)',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)'
                }}>
                    <p style={{ marginBottom: 'var(--spacing-md)' }}>
                        {isRTL ? 'سلة التسوق فارغة' : 'Your cart is empty'}
                    </p>
                    <Link to="/products" className="auth-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
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
                <form onSubmit={handleSubmit}>
                    {/* Contact Info */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-primary)' }}>Contact Phone</label>
                        <input
                            type="text"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="form-input"
                            placeholder="01xxxxxxxxx"
                            required
                            style={{ width: '100%', padding: '12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }}
                        />
                    </div>

                    {/* Loyalty Points Redemption */}
                    {loyalty && loyalty.settings && loyalty.loyalty && (
                        <div style={{ marginBottom: '32px', padding: '20px', background: 'rgba(255, 215, 0, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                            <h3 style={{ marginBottom: '16px', color: '#FFD700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>💎</span> Loyalty Points
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Available: {loyalty.loyalty.points} points</span>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Value: EGP {(loyalty.loyalty.points / loyalty.settings.pointsToMoneyRatio).toFixed(2)}</span>
                            </div>

                            {cart.pointsUsed > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '6px' }}>
                                    <div>
                                        <div style={{ color: '#FFD700', fontWeight: 'bold' }}>{cart.pointsUsed} Points Applied</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Discount: -EGP {cart.pointsDiscount}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemovePoints}
                                        disabled={redeemLoading}
                                        style={{ background: 'transparent', border: '1px solid #FFD700', color: '#FFD700', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="number"
                                        value={pointsInput}
                                        onChange={(e) => setPointsInput(e.target.value)}
                                        placeholder={`Min ${loyalty.settings.minPointsToRedeem} points`}
                                        style={{ flex: 1, padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '6px', color: 'white' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRedeemPoints}
                                        disabled={redeemLoading || !pointsInput}
                                        style={{ background: '#FFD700', color: 'black', border: 'none', padding: '0 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: (redeemLoading || !pointsInput) ? 0.5 : 1 }}
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                            {loyalty.settings.minPointsToRedeem > 0 && (
                                <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                    Minimum redemption: {loyalty.settings.minPointsToRedeem} points. Rate: {loyalty.settings.pointsToMoneyRatio} points = 1 EGP.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Payment Methods */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ marginBottom: '16px', color: 'var(--color-text-primary)' }}>Payment Method</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {Object.values(PAYMENT_METHODS).map(method => (
                                <label key={method.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '16px',
                                    background: paymentMethod === method.id ? 'rgba(0, 255, 255, 0.1)' : 'var(--color-bg-secondary)',
                                    border: `1px solid ${paymentMethod === method.id ? 'var(--color-cyan-primary)' : 'var(--color-border)'}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.id}
                                        checked={paymentMethod === method.id}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        style={{ accentColor: 'var(--color-cyan-primary)' }}
                                    />
                                    <span style={{ color: 'white', fontWeight: '500' }}>{method.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Manual Payment Details */}
                    {paymentMethod && PAYMENT_METHODS[Object.keys(PAYMENT_METHODS).find(k => PAYMENT_METHODS[k].id === paymentMethod)] && (
                        <div style={{
                            padding: '20px',
                            background: 'rgba(0, 255, 255, 0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(0, 255, 255, 0.2)',
                            marginBottom: '24px'
                        }}>
                            <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                                Please transfer <strong>EGP {cart.total}</strong> to:
                                <br />
                                <span style={{ fontSize: '18px', color: 'var(--color-cyan-primary)', fontWeight: 'bold' }}>
                                    {Object.values(PAYMENT_METHODS).find(m => m.id === paymentMethod).number}
                                </span>
                            </p>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                                    Sender Phone Number (Your wallet number)
                                </label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="01xxxxxxxxx"
                                    className="form-input"
                                    style={{ width: '100%', padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '6px', color: 'white' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                                    Upload Transfer Receipt
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ color: 'var(--color-text-muted)' }}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '32px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                <span>Subtotal</span>
                                <span>EGP {cart.subtotal}</span>
                            </div>
                            {cart.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#4CAF50' }}>
                                    <span>Discount (Promo)</span>
                                    <span>-EGP {cart.discount}</span>
                                </div>
                            )}
                            {cart.pointsDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#FFD700' }}>
                                    <span>Loyalty Discount</span>
                                    <span>-EGP {cart.pointsDiscount}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--color-cyan-primary)' }}>EGP {cart.total}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', padding: '16px', fontSize: '16px', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
