import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import client from '../../api/client';
import { DollarSign, Filter, Eye, CheckCircle, XCircle, Search } from 'lucide-react';
import Pagination from '../../components/Pagination.jsx';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUtils';

const Payments = () => {
    const { addToast } = useToast();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, [page, statusFilter]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getAllPayments(page, 10, statusFilter);
            setPayments(data.payments || []);
            setTotalPages(data.pagination?.pages || 1);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            addToast('Failed to load payments', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (payment) => {
        if (!payment?._id) return;
        try {
            await adminAPI.confirmPayment(payment._id);
            addToast('Payment confirmed', 'success');
            fetchPayments();
        } catch (error) {
            addToast(error.response?.data?.message || 'Confirmation failed', 'error');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title">Payments</h1>
            </div>

            {/* Controls */}
            <div className="admin-card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <Filter size={18} color="var(--color-text-muted)" />
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            background: 'var(--color-bg-primary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)',
                            minWidth: '200px'
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Payments Table */}
            <div className="admin-card">
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-bg-secondary)' }}>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>User</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Order</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Method</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Amount</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Proof</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading payments...</td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No payments found.</td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                            {formatDate(payment.createdAt)}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: '500', color: 'white' }}>{payment.user?.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{payment.user?.email}</div>
                                        </td>
                                        <td style={{ padding: '16px', fontFamily: 'monospace', color: 'var(--color-cyan-primary)' }}>
                                            #{payment.order?.orderNumber}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: '500', textTransform: 'uppercase', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                                {payment.method}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                {payment.phoneNumber}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 'bold', color: 'white' }}>
                                            ${payment.order?.total}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {payment.proofImage && (
                                                <img
                                                    src={getImageUrl(payment.proofImage)}
                                                    alt="Proof"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        border: '1px solid var(--color-border)',
                                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                                    }}
                                                    onClick={() => window.open(getImageUrl(payment.proofImage), '_blank')}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'scale(1.1)';
                                                        e.target.style.boxShadow = '0 4px 12px rgba(0, 255, 255, 0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'scale(1)';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                    title="Click to view full image"
                                                />
                                            )}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                background: payment.status === 'confirmed' ? 'rgba(74, 222, 128, 0.1)' : payment.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                                                color: payment.status === 'confirmed' ? '#4ade80' : payment.status === 'rejected' ? '#ef4444' : '#facc15',
                                                border: `1px solid ${payment.status === 'confirmed' ? 'rgba(74, 222, 128, 0.3)' : payment.status === 'rejected' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(250, 204, 21, 0.3)'}`
                                            }}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="icon-btn"
                                                    title="View Details"
                                                    style={{ padding: '6px', background: 'var(--color-bg-secondary)', borderRadius: '6px' }}
                                                    onClick={async () => {
                                                        if (!payment.order?._id) {
                                                            addToast('Order ID not found', 'error');
                                                            return;
                                                        }

                                                        try {
                                                            // Fetch full order details with items
                                                            const response = await client.get(`/orders/${payment.order._id}`);
                                                            const fullOrder = response.data.data.order;

                                                            // Attach payment info to the order
                                                            setSelectedOrder({ ...fullOrder, payment });
                                                        } catch (e) {
                                                            console.error('Failed to fetch order:', e);
                                                            addToast('Failed to load order details', 'error');
                                                        }
                                                    }}
                                                >
                                                    <Eye size={16} color="var(--color-text-secondary)" />
                                                </button>
                                                {payment.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="icon-btn"
                                                            title="Confirm"
                                                            style={{ padding: '6px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '6px' }}
                                                            onClick={() => handleConfirm(payment)}
                                                        >
                                                            <CheckCircle size={16} color="#4ade80" />
                                                        </button>
                                                        <button
                                                            className="icon-btn"
                                                            title="Reject"
                                                            style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}
                                                            onClick={async () => {
                                                                if (window.confirm('Reject this payment?')) {
                                                                    await adminAPI.rejectPayment(payment._id);
                                                                    fetchPayments();
                                                                }
                                                            }}
                                                        >
                                                            <XCircle size={16} color="#ef4444" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalPages > 1 && (
                    <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>

            {/* Reusing the Modal, but note: payment.order in the list might not have 'Items' populated from getAllPayments backend! 
                So products list might be empty. This is an acceptable tradeoff for now to speed up payment review. 
            */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={fetchPayments}
                />
            )}
        </div>
    );
};

export default Payments;

