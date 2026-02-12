import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Save, Eye, EyeOff, Tag, Copy, BarChart3, TrendingUp } from 'lucide-react';
import adminAPI from '../../api/admin';

const PromoCodes = () => {
    const [promoCodes, setPromoCodes] = useState([]);
    const [promoStats, setPromoStats] = useState(null);
    const [selectedPromoStats, setSelectedPromoStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchaseAmount: '',
        usageLimit: '',
        expirationDate: ''
    });

    useEffect(() => {
        loadPromoCodes();
        loadPromoStats();
    }, []);

    const loadPromoCodes = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getPromoCodes();
            setPromoCodes(result?.promoCodes || []);
        } catch (error) {
            console.error('Failed to load promo codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPromoStats = async () => {
        try {
            const result = await adminAPI.getPromoCodeStats();
            setPromoStats(result?.data);
        } catch (error) {
            console.error('Failed to load promo stats:', error);
        }
    };

    const loadPromoDetails = async (promoId) => {
        try {
            const result = await adminAPI.getPromoCodeStats(promoId);
            setSelectedPromoStats(result?.data);
            setIsDetailsModalOpen(true);
        } catch (error) {
            alert('Failed to load promo code details: ' + error.message);
        }
    };

    const handleEdit = (promo) => {
        setEditingPromo(promo);
        setFormData({
            code: promo.code || '',
            discountType: promo.discountType || 'percentage',
            discountValue: promo.discountValue || '',
            minPurchaseAmount: promo.minPurchaseAmount || '',
            usageLimit: promo.usageLimit || '',
            expirationDate: promo.expirationDate ? new Date(promo.expirationDate).toISOString().split('T')[0] : ''
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingPromo(null);
        setFormData({
            code: '',
            discountType: 'percentage',
            discountValue: '',
            minPurchaseAmount: '',
            usageLimit: '',
            expirationDate: ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this promo code?')) {
            try {
                await adminAPI.deletePromoCode(id);
                loadPromoCodes();
                loadPromoStats();
            } catch (error) {
                alert('Failed to delete promo code: ' + error.message);
            }
        }
    };

    const handleToggle = async (id) => {
        try {
            await adminAPI.togglePromoCode(id);
            loadPromoCodes();
        } catch (error) {
            alert('Failed to toggle promo code: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                code: formData.code.toUpperCase(),
                discountType: formData.discountType,
                discountValue: parseFloat(formData.discountValue),
            };
            if (formData.minPurchaseAmount) data.minPurchaseAmount = parseFloat(formData.minPurchaseAmount);
            if (formData.usageLimit) data.usageLimit = parseInt(formData.usageLimit);
            if (formData.expirationDate) data.expirationDate = formData.expirationDate;

            if (editingPromo) {
                await adminAPI.updatePromoCode(editingPromo._id, data);
            } else {
                await adminAPI.createPromoCode(data);
            }
            setIsModalOpen(false);
            loadPromoCodes();
            loadPromoStats();
        } catch (error) {
            alert('Failed to save promo code: ' + error.message);
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert('Code copied to clipboard!');
    };

    const formatDate = (date) => {
        if (!date) return 'No expiry';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isExpired = (date) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="promo-codes-page">
            <header className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Promo Codes</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px', fontSize: '14px' }}>
                        Manage your discount codes and coupons ({promoCodes.length})
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setIsStatsModalOpen(true)}
                        className="btn-secondary"
                        title="View Statistics"
                    >
                        <BarChart3 size={18} />
                        <span>Statistics</span>
                    </button>
                    <button onClick={handleAdd} className="btn-primary">
                        <Plus size={18} />
                        <span>Add Promo Code</span>
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="empty-state">
                    <div className="spinner" style={{ border: '2px solid var(--color-bg-card)', borderTop: '2px solid var(--color-primary)', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ marginTop: '16px' }}>Loading promo codes...</p>
                </div>
            ) : promoCodes.length === 0 ? (
                <div className="empty-state">
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(0, 217, 255, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        color: 'var(--color-primary)'
                    }}>
                        <Tag size={32} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-primary)' }}>No Promo Codes Yet</h3>
                    <p style={{ maxWidth: '400px', marginBottom: '24px' }}>Create discount codes to boost sales and reward your loyal customers.</p>
                    <button onClick={handleAdd} className="btn-primary">
                        <Plus size={18} />
                        Create First Code
                    </button>
                </div>
            ) : (
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Min Purchase</th>
                                <th>Usage</th>
                                <th>Revenue</th>
                                <th>Expires</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promoCodes.map(promo => (
                                <tr key={promo._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <code style={{
                                                background: 'var(--color-bg-secondary)',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontFamily: 'monospace',
                                                color: 'var(--color-cyan-primary)',
                                                fontWeight: 'bold'
                                            }}>
                                                {promo.code}
                                            </code>
                                            <button onClick={() => copyCode(promo.code)} className="icon-btn" title="Copy">
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 'bold', color: '#00ff80' }}>
                                        {promo.discountType === 'percentage'
                                            ? `${promo.discountValue}%`
                                            : `$${promo.discountValue}`
                                        }
                                    </td>
                                    <td>
                                        {promo.minPurchaseAmount ? `$${promo.minPurchaseAmount}` : '-'}
                                    </td>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>
                                                {promo.usedCount || 0} / {promo.usageLimit || '∞'}
                                            </div>
                                            {promo.usageLimit && (
                                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                                    {Math.round(((promo.usedCount || 0) / promo.usageLimit) * 100)}% used
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => loadPromoDetails(promo._id)}
                                            className="icon-btn"
                                            title="View Revenue Details"
                                            style={{ color: 'var(--color-cyan-primary)' }}
                                        >
                                            <TrendingUp size={16} />
                                        </button>
                                    </td>
                                    <td style={{ color: isExpired(promo.expirationDate) ? '#ff4444' : 'var(--color-text-muted)' }}>
                                        {formatDate(promo.expirationDate)}
                                        {isExpired(promo.expirationDate) && ' (Expired)'}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${promo.isActive && !isExpired(promo.expirationDate) ? 'status-active' : 'status-inactive'}`}>
                                            {promo.isActive && !isExpired(promo.expirationDate) ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button onClick={() => loadPromoDetails(promo._id)} className="icon-btn" title="View Details">
                                                <Eye size={18} />
                                            </button>
                                            <button onClick={() => handleToggle(promo._id)} className="icon-btn" title={promo.isActive ? 'Deactivate' : 'Activate'}>
                                                {promo.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            <button onClick={() => handleEdit(promo)} className="icon-btn" title="Edit">
                                                <Pencil size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(promo._id)} className="icon-btn danger" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Promo Code *</label>
                                    <input
                                        className="form-input"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        required
                                        placeholder="e.g., SAVE20"
                                        style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Discount Type *</label>
                                        <select
                                            className="form-select"
                                            value={formData.discountType}
                                            onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount ($)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Discount Value *</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            step="0.01"
                                            value={formData.discountValue}
                                            onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                                            required
                                            placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Min Purchase ($)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            step="0.01"
                                            value={formData.minPurchaseAmount}
                                            onChange={e => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Usage Limit</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={formData.usageLimit}
                                            onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Expiration Date</label>
                                    <input
                                        className="form-input"
                                        type="date"
                                        value={formData.expirationDate}
                                        onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                        <Save size={18} />
                                        {editingPromo ? 'Save Changes' : 'Create Code'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics Modal */}
            {isStatsModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Promo Code Statistics</h2>
                            <button onClick={() => setIsStatsModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {promoStats ? (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Codes</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{promoStats.totalCodes || 0}</div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Active Codes</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff80' }}>{promoStats.activeCodes || 0}</div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Expired Codes</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6464' }}>{promoStats.expiredCodes || 0}</div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Usage</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>{promoStats.totalUsage || 0}</div>
                                        </div>
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setIsStatsModalOpen(false)} className="btn-secondary">
                                            Close
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state" style={{ padding: '40px 0' }}>
                                    <div className="spinner" style={{ border: '2px solid var(--color-bg-card)', borderTop: '2px solid var(--color-primary)', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
                                    <p>Loading statistics...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Promo Code Details Modal */}
            {isDetailsModalOpen && selectedPromoStats && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Promo Code Details - {selectedPromoStats.promoCode?.code}</h2>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            {selectedPromoStats.promoCode && (
                                <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Discount</div>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff80' }}>
                                                {selectedPromoStats.promoCode.discountType === 'percentage'
                                                    ? `${selectedPromoStats.promoCode.discountValue}%`
                                                    : formatCurrency(selectedPromoStats.promoCode.discountValue)
                                                }
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Status</div>
                                            <span className={`status-badge ${selectedPromoStats.promoCode.isActive ? 'status-active' : 'status-inactive'}`}>
                                                {selectedPromoStats.promoCode.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {selectedPromoStats.usage && (
                                <div>
                                    <h3 style={{ marginBottom: '16px' }}>Usage Statistics</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Orders</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedPromoStats.usage.totalOrders || 0}</div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Discount</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff80' }}>
                                                {formatCurrency(selectedPromoStats.usage.totalDiscount || 0)}
                                            </div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Revenue</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                                {formatCurrency(selectedPromoStats.usage.totalRevenue || 0)}
                                            </div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Avg Discount</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                                {formatCurrency(selectedPromoStats.usage.averageDiscount || 0)}
                                            </div>
                                        </div>
                                    </div>
                                    {selectedPromoStats.recentOrders && selectedPromoStats.recentOrders.length > 0 && (
                                        <div>
                                            <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>Recent Orders</h4>
                                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                <table className="data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Order #</th>
                                                            <th>Total</th>
                                                            <th>Discount</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedPromoStats.recentOrders.map((order, idx) => (
                                                            <tr key={idx}>
                                                                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                                    {order.orderNumber || '-'}
                                                                </td>
                                                                <td>{formatCurrency(order.total || 0)}</td>
                                                                <td style={{ color: '#00ff80' }}>{formatCurrency(order.discount || 0)}</td>
                                                                <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                                    {formatDate(order.createdAt)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoCodes;
