import React, { useState, useEffect } from 'react';
import { Check, X, Eye, CreditCard, Image } from 'lucide-react';
import adminAPI from '../../api/admin';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadPayments();
    }, [page, statusFilter]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getPayments(page, 10, statusFilter);
            setPayments(result?.payments || []);
            setTotalPages(result?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (paymentId) => {
        if (!window.confirm('Confirm this payment?')) return;
        try {
            await adminAPI.confirmPayment(paymentId);
            loadPayments();
            if (selectedPayment?._id === paymentId) {
                setSelectedPayment({ ...selectedPayment, status: 'confirmed' });
            }
        } catch (error) {
            alert('Failed to confirm payment: ' + error.message);
        }
    };

    const handleReject = async () => {
        if (!selectedPayment) return;
        try {
            await adminAPI.rejectPayment(selectedPayment._id, rejectReason);
            loadPayments();
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedPayment(null);
        } catch (error) {
            alert('Failed to reject payment: ' + error.message);
        }
    };

    const openRejectModal = (payment) => {
        setSelectedPayment(payment);
        setShowRejectModal(true);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Payments</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Review and manage payment confirmations
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="filter-bar">
                <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {loading ? (
                <div className="empty-state">Loading payments...</div>
            ) : payments.length === 0 ? (
                <div className="empty-state">
                    <CreditCard size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No payments found.</p>
                </div>
            ) : (
                <>
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(payment => (
                                    <tr key={payment._id}>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', color: 'var(--color-cyan-primary)' }}>
                                                {payment.order?.orderNumber || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{payment.user?.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                    {payment.phoneNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{payment.method}</td>
                                        <td style={{ fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                            ${payment.order?.total?.toFixed(2) || '0.00'}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${payment.status === 'confirmed' ? 'status-confirmed' : payment.status === 'pending' ? 'status-pending' : 'status-rejected'}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                            {formatDate(payment.createdAt)}
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                {payment.proofImage && (
                                                    <button onClick={() => setSelectedPayment(payment)} className="icon-btn" title="View Proof">
                                                        <Image size={18} />
                                                    </button>
                                                )}
                                                {payment.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleConfirm(payment._id)} className="icon-btn" title="Confirm" style={{ color: '#00ff80' }}>
                                                            <Check size={18} />
                                                        </button>
                                                        <button onClick={() => openRejectModal(payment)} className="icon-btn danger" title="Reject">
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="pagination">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                            Previous
                        </button>
                        <span style={{ padding: '8px 16px', color: 'var(--color-text-muted)' }}>
                            Page {page} of {totalPages}
                        </span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                            Next
                        </button>
                    </div>
                </>
            )}

            {/* Payment Proof Modal */}
            {selectedPayment && !showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Payment Proof</h2>
                            <button onClick={() => setSelectedPayment(null)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <p><strong>Order:</strong> {selectedPayment.order?.orderNumber}</p>
                            <p><strong>Method:</strong> {selectedPayment.method}</p>
                            <p><strong>Phone:</strong> {selectedPayment.phoneNumber}</p>
                            <p><strong>Status:</strong> <span className={`status-badge ${selectedPayment.status === 'confirmed' ? 'status-confirmed' : selectedPayment.status === 'pending' ? 'status-pending' : 'status-rejected'}`}>{selectedPayment.status}</span></p>
                        </div>

                        {selectedPayment.proofImage && (
                            <div style={{ marginBottom: '20px' }}>
                                <img 
                                    src={selectedPayment.proofImage} 
                                    alt="Payment proof" 
                                    style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                />
                            </div>
                        )}

                        {selectedPayment.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => handleConfirm(selectedPayment._id)} className="btn-success" style={{ flex: 1 }}>
                                    <Check size={18} /> Confirm Payment
                                </button>
                                <button onClick={() => { setShowRejectModal(true); }} className="btn-danger" style={{ flex: 1 }}>
                                    <X size={18} /> Reject Payment
                                </button>
                            </div>
                        )}

                        {selectedPayment.rejectionReason && (
                            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,68,68,0.1)', borderRadius: '8px', color: '#ff4444' }}>
                                <strong>Rejection Reason:</strong> {selectedPayment.rejectionReason}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Reject Payment</h2>
                            <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Rejection Reason</label>
                            <textarea
                                className="form-textarea"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter reason for rejection..."
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} className="btn-secondary" style={{ flex: 1 }}>
                                Cancel
                            </button>
                            <button onClick={handleReject} className="btn-danger" style={{ flex: 1 }} disabled={!rejectReason.trim()}>
                                Reject Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
