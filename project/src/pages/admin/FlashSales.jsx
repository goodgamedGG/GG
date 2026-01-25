import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Trash2, Clock, Zap } from 'lucide-react';
import adminAPI from '../../api/admin';

const FlashSales = () => {
    const [flashSales, setFlashSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        discountPrice: '',
        endsAt: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [salesRes, productsRes] = await Promise.all([
                adminAPI.getFlashSales(),
                adminAPI.getProducts(1, 1000)
            ]);
            setFlashSales(salesRes?.data?.flashSales || []);
            setProducts(productsRes?.products || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setFormData({
            productId: '',
            discountPrice: '',
            endsAt: ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to end this flash sale?')) {
            try {
                await adminAPI.endFlashSale(productId);
                loadData();
            } catch (error) {
                alert('Failed to end flash sale: ' + error.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createFlashSale({
                productId: formData.productId,
                discountPrice: parseFloat(formData.discountPrice),
                endsAt: formData.endsAt
            });
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            alert('Failed to create flash sale: ' + error.message);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeRemaining = (endDate) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;

        if (diff <= 0) return 'Expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const calculateDiscount = (originalPrice, discountPrice) => {
        if (!originalPrice || !discountPrice) return 0;
        return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Flash Sales</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {flashSales.length} active flash sale(s)
                    </p>
                </div>
                <button onClick={handleAdd} className="btn-primary">
                    <Plus size={18} />
                    Create Flash Sale
                </button>
            </header>

            {loading ? (
                <div className="empty-state">Loading flash sales...</div>
            ) : flashSales.length === 0 ? (
                <div className="empty-state">
                    <Zap size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No active flash sales.</p>
                    <button onClick={handleAdd} className="btn-primary" style={{ marginTop: '16px' }}>
                        Create Your First Flash Sale
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {flashSales.map(sale => {
                        const product = sale.product || sale;
                        const discount = calculateDiscount(product.price, product.discountPrice || product.flashSalePrice);
                        const timeRemaining = getTimeRemaining(product.flashSaleEndsAt);

                        return (
                            <div key={product._id} style={{
                                background: 'var(--color-bg-card)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {product.flashSaleEndsAt && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        padding: '6px 12px',
                                        background: timeRemaining === 'Expired' ? '#ff6464' : '#ffc800',
                                        borderRadius: '16px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        zIndex: 1
                                    }}>
                                        <Clock size={12} />
                                        {timeRemaining}
                                    </div>
                                )}
                                {product.images?.[0] && (
                                    <div style={{ height: '200px', background: 'var(--color-bg-secondary)', position: 'relative' }}>
                                        <img 
                                            src={product.images[0]} 
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {discount > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                left: '12px',
                                                padding: '8px 12px',
                                                background: '#ff6464',
                                                color: '#fff',
                                                borderRadius: '6px',
                                                fontWeight: 'bold',
                                                fontSize: '14px'
                                            }}>
                                                -{discount}%
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div style={{ padding: '16px' }}>
                                    <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '16px', marginBottom: '8px' }}>
                                        {product.name}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                            ${product.discountPrice || product.flashSalePrice}
                                        </span>
                                        {product.price && product.price !== (product.discountPrice || product.flashSalePrice) && (
                                            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                                                ${product.price}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                                        <div>Ends: {formatDate(product.flashSaleEndsAt)}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(product._id)} 
                                        className="btn-secondary"
                                        style={{ width: '100%', background: '#ff6464', borderColor: '#ff6464' }}
                                    >
                                        <Trash2 size={18} />
                                        End Flash Sale
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Flash Sale Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create Flash Sale</h2>
                            <button onClick={() => setIsModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Product *</label>
                                <select
                                    className="form-select"
                                    value={formData.productId}
                                    onChange={e => {
                                        const product = products.find(p => p._id === e.target.value);
                                        setFormData({ 
                                            ...formData, 
                                            productId: e.target.value,
                                            discountPrice: product ? (product.price * 0.8).toFixed(2) : ''
                                        });
                                    }}
                                    required
                                >
                                    <option value="">Select Product</option>
                                    {products.filter(p => !p.isFlashSale).map(product => (
                                        <option key={product._id} value={product._id}>
                                            {product.name} - ${product.price}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Discount Price ($) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={formData.discountPrice}
                                    onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                                    required
                                    placeholder="0.00"
                                />
                                {formData.productId && (() => {
                                    const product = products.find(p => p._id === formData.productId);
                                    if (product && formData.discountPrice) {
                                        const discount = calculateDiscount(product.price, parseFloat(formData.discountPrice));
                                        return (
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                                {discount > 0 ? `${discount}% discount` : 'Invalid discount price'}
                                            </p>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                            <div className="form-group">
                                <label className="form-label">End Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    value={formData.endsAt}
                                    onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                                    required
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    <Save size={18} />
                                    Create Flash Sale
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlashSales;
