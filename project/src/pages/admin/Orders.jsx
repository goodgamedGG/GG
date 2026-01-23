import React, { useState, useEffect } from 'react';
import { Eye, Package, X } from 'lucide-react';
import adminAPI from '../../api/admin';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadOrders();
    }, [page, statusFilter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getOrders(page, 10, statusFilter);
            setOrders(result?.orders || []);
            setTotalPages(result?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await adminAPI.updateOrderStatus(orderId, newStatus);
            loadOrders();
            if (selectedOrder?._id === orderId) {
                setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
            }
        } catch (error) {
            alert('Failed to update order status: ' + error.message);
        }
    };

    const getStatusClass = (status) => {
        const classes = {
            pending: 'status-pending',
            processing: 'status-processing',
            completed: 'status-completed',
            cancelled: 'status-cancelled',
            refunded: 'status-inactive'
        };
        return classes[status] || 'status-pending';
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
                    <h1 className="page-title">Orders</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Manage customer orders
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
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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
            {selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Order #{selectedOrder.orderNumber}</h2>
                            <button onClick={() => setSelectedOrder(null)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>CUSTOMER</h4>
                                <p style={{ fontWeight: 500 }}>{selectedOrder.customerInfo?.name}</p>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{selectedOrder.customerInfo?.email}</p>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{selectedOrder.customerInfo?.phone}</p>
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
                                        <span>{item.name} x{item.quantity}</span>
                                        <span style={{ color: 'var(--color-cyan-primary)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', marginTop: '8px', borderTop: '1px solid var(--color-border)', fontWeight: 'bold' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--color-cyan-primary)' }}>${selectedOrder.total?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '12px' }}>UPDATE STATUS</h4>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['pending', 'processing', 'completed', 'cancelled'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusUpdate(selectedOrder._id, status)}
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
            )}
        </div>
    );
};

export default Orders;
