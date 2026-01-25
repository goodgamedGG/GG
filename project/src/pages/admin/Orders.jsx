import React, { useState, useEffect } from 'react';
import { Eye, Package, X, BarChart3, Calendar, MessageSquare } from 'lucide-react';
import adminAPI from '../../api/admin';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderStats, setOrderStats] = useState(null);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadOrders();
    }, [page, statusFilter, paymentStatusFilter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getOrders(page, 20, statusFilter, paymentStatusFilter);
            setOrders(result?.data?.orders || result?.orders || []);
            setTotalPages(result?.data?.pagination?.totalPages || result?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadOrderStats = async () => {
        try {
            const result = await adminAPI.getOrderStats(30);
            setOrderStats(result?.data);
            setIsStatsModalOpen(true);
        } catch (error) {
            alert('Failed to load statistics: ' + error.message);
        }
    };

    const handleStatusUpdate = async (orderId, status, message = '') => {
        try {
            await adminAPI.updateOrderStatus(orderId, status, message);
            loadOrders();
            if (selectedOrder?._id === orderId) {
                const updatedOrder = orders.find(o => o._id === orderId);
                if (updatedOrder) {
                    setSelectedOrder({ ...updatedOrder, orderStatus: status });
                }
            }
            setIsStatusModalOpen(false);
            setStatusMessage('');
            setNewStatus('');
        } catch (error) {
            alert('Failed to update order status: ' + error.message);
        }
    };

    const handleDeliveryUpdate = async () => {
        if (!selectedOrder || !deliveryDate) {
            alert('Please select a delivery date');
            return;
        }
        try {
            await adminAPI.updateEstimatedDelivery(selectedOrder._id, deliveryDate);
            loadOrders();
            setIsDeliveryModalOpen(false);
            setDeliveryDate('');
            const updatedOrder = orders.find(o => o._id === selectedOrder._id);
            if (updatedOrder) {
                setSelectedOrder({ ...updatedOrder, estimatedDelivery: deliveryDate });
            }
        } catch (error) {
            alert('Failed to update delivery date: ' + error.message);
        }
    };

    const openStatusModal = (order, status) => {
        setSelectedOrder(order);
        setNewStatus(status);
        setStatusMessage('');
        setIsStatusModalOpen(true);
    };

    const openDeliveryModal = (order) => {
        setSelectedOrder(order);
        setDeliveryDate(order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : '');
        setIsDeliveryModalOpen(true);
    };

    const getStatusClass = (status) => {
        const classes = {
            new: 'status-pending',
            pending: 'status-pending',
            processing: 'status-processing',
            completed: 'status-completed',
            cancelled: 'status-cancelled',
            refunded: 'status-inactive'
        };
        return classes[status] || 'status-pending';
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

    const formatDateInput = (date) => {
        if (!date) return '';
        return new Date(date).toISOString().split('T')[0];
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Orders</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Manage customer orders
                    </p>
                </div>
                <button onClick={loadOrderStats} className="btn-secondary">
                    <BarChart3 size={18} />
                    Statistics
                </button>
            </header>

            {/* Filters */}
            <div className="filter-bar" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    style={{ minWidth: '150px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select
                    className="form-select"
                    value={paymentStatusFilter}
                    onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(1); }}
                    style={{ minWidth: '150px' }}
                >
                    <option value="">All Payment Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {loading ? (
                <div className="empty-state">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <Package size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No orders found.</p>
                </div>
            ) : (
                <>
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Delivery</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id}>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', color: 'var(--color-cyan-primary)' }}>
                                                {order.orderNumber}
                                            </span>
                                        </td>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{order.customerInfo?.name || order.user?.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                    {order.customerInfo?.email || order.user?.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{order.items?.length || 0} items</td>
                                        <td style={{ fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                            ${order.total?.toFixed(2)}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${order.paymentStatus === 'confirmed' ? 'status-confirmed' : order.paymentStatus === 'pending' ? 'status-pending' : 'status-rejected'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                            {order.estimatedDelivery ? formatDate(order.estimatedDelivery) : '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td>
                                            <button onClick={() => setSelectedOrder(order)} className="icon-btn" title="View Details">
                                                <Eye size={18} />
                                            </button>
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

            {/* Order Details Modal */}
            {selectedOrder && !isStatusModalOpen && !isDeliveryModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Order #{selectedOrder.orderNumber}</h2>
                            <button onClick={() => setSelectedOrder(null)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>CUSTOMER</h4>
                                    <p style={{ fontWeight: 500 }}>{selectedOrder.customerInfo?.name || selectedOrder.user?.name}</p>
                                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{selectedOrder.customerInfo?.email || selectedOrder.user?.email}</p>
                                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{selectedOrder.customerInfo?.phone || '-'}</p>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>PAYMENT</h4>
                                    <p style={{ fontWeight: 500 }}>{selectedOrder.paymentMethod}</p>
                                    <span className={`status-badge ${selectedOrder.paymentStatus === 'confirmed' ? 'status-confirmed' : 'status-pending'}`}>
                                        {selectedOrder.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '12px' }}>ORDER ITEMS</h4>
                                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '12px' }}>
                                    {selectedOrder.items?.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < selectedOrder.items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                            <span>{item.name || item.product?.name} x{item.quantity}</span>
                                            <span style={{ color: 'var(--color-cyan-primary)' }}>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {selectedOrder.discount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: 'var(--color-text-muted)' }}>
                                            <span>Discount</span>
                                            <span>-${selectedOrder.discount?.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', marginTop: '8px', borderTop: '1px solid var(--color-border)', fontWeight: 'bold' }}>
                                        <span>Total</span>
                                        <span style={{ color: 'var(--color-cyan-primary)' }}>${selectedOrder.total?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tracking History */}
                            {selectedOrder.trackingHistory && selectedOrder.trackingHistory.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '12px' }}>TRACKING HISTORY</h4>
                                    <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '12px' }}>
                                        {selectedOrder.trackingHistory.map((entry, idx) => (
                                            <div key={idx} style={{ padding: '8px 0', borderBottom: idx < selectedOrder.trackingHistory.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span className={`status-badge ${getStatusClass(entry.status)}`} style={{ fontSize: '11px' }}>
                                                        {entry.status}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                                        {formatDate(entry.updatedAt)}
                                                    </span>
                                                </div>
                                                {entry.message && (
                                                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                                        {entry.message}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>ESTIMATED DELIVERY</h4>
                                    <p style={{ fontSize: '14px' }}>
                                        {selectedOrder.estimatedDelivery ? formatDate(selectedOrder.estimatedDelivery) : 'Not set'}
                                    </p>
                                    <button 
                                        onClick={() => openDeliveryModal(selectedOrder)} 
                                        className="btn-secondary" 
                                        style={{ marginTop: '8px', fontSize: '12px', padding: '6px 12px' }}
                                    >
                                        <Calendar size={14} style={{ marginRight: '4px' }} />
                                        {selectedOrder.estimatedDelivery ? 'Update' : 'Set'} Delivery
                                    </button>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>DELIVERED AT</h4>
                                    <p style={{ fontSize: '14px' }}>
                                        {selectedOrder.deliveredAt ? formatDate(selectedOrder.deliveredAt) : 'Not delivered'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '12px' }}>UPDATE STATUS</h4>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {['new', 'pending', 'processing', 'completed', 'cancelled'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => openStatusModal(selectedOrder, status)}
                                            className={selectedOrder.orderStatus === status ? 'btn-primary' : 'btn-secondary'}
                                            style={{ textTransform: 'capitalize' }}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {isStatusModalOpen && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Update Order Status</h2>
                            <button onClick={() => { setIsStatusModalOpen(false); setSelectedOrder(null); }} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">New Status</label>
                                <select
                                    className="form-select"
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                >
                                    <option value="">Select Status</option>
                                    <option value="new">New</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status Message (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    value={statusMessage}
                                    onChange={e => setStatusMessage(e.target.value)}
                                    placeholder="Add a custom message for this status update..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => { setIsStatusModalOpen(false); setSelectedOrder(null); }} className="btn-secondary">
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleStatusUpdate(selectedOrder._id, newStatus, statusMessage)} 
                                className="btn-primary"
                                disabled={!newStatus}
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Date Modal */}
            {isDeliveryModalOpen && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Set Estimated Delivery</h2>
                            <button onClick={() => { setIsDeliveryModalOpen(false); setSelectedOrder(null); }} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">Estimated Delivery Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={deliveryDate}
                                    onChange={e => setDeliveryDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => { setIsDeliveryModalOpen(false); setSelectedOrder(null); }} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleDeliveryUpdate} className="btn-primary" disabled={!deliveryDate}>
                                Save Delivery Date
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics Modal */}
            {isStatsModalOpen && orderStats && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Order Statistics</h2>
                            <button onClick={() => setIsStatsModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            {orderStats.overview && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Orders</div>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{orderStats.overview.totalOrders || 0}</div>
                                    </div>
                                    <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Revenue</div>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                            ${(orderStats.overview.totalRevenue || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Confirmed Revenue</div>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff80' }}>
                                            ${(orderStats.overview.confirmedRevenue || 0).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {orderStats.statusDistribution && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ marginBottom: '16px' }}>Status Distribution</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {Object.entries(orderStats.statusDistribution).map(([status, count]) => (
                                            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                                <span style={{ textTransform: 'capitalize' }}>{status}</span>
                                                <span style={{ fontWeight: 'bold' }}>{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {orderStats.paymentStatusDistribution && (
                                <div>
                                    <h3 style={{ marginBottom: '16px' }}>Payment Status Distribution</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {Object.entries(orderStats.paymentStatusDistribution).map(([status, count]) => (
                                            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                                <span style={{ textTransform: 'capitalize' }}>{status}</span>
                                                <span style={{ fontWeight: 'bold' }}>{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsStatsModalOpen(false)} className="btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
