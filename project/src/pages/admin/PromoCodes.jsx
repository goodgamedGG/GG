import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Save, Eye, EyeOff, Tag, Copy } from 'lucide-react';
import adminAPI from '../../api/admin';

const PromoCodes = () => {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
                setPromoCodes(promoCodes.filter(p => p._id !== id));
            } catch (error) {
                alert('Failed to delete promo code: ' + error.message);
            }
        }
    };

    const handleToggle = async (id) => {
        try {
            const result = await adminAPI.togglePromoCode(id);
            setPromoCodes(promoCodes.map(p => 
                p._id === id ? { ...p, isActive: result.promoCode.isActive } : p
            ));
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

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Promo Codes</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {promoCodes.length} promo codes
                    </p>
                </div>
                <button onClick={handleAdd} className="btn-primary">
                    <Plus size={18} />
                    Add Promo Code
                </button>
            </header>

            {loading ? (
                <div className="empty-state">Loading promo codes...</div>
            ) : promoCodes.length === 0 ? (
                <div className="empty-state">
                    <Tag size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No promo codes found.</p>
                    <button onClick={handleAdd} className="btn-primary" style={{ marginTop: '16px' }}>
                        Create Your First Promo Code
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
                                        {promo.usedCount || 0} / {promo.usageLimit || '∞'}
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
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
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
            )}
        </div>
    );
};

export default PromoCodes;
