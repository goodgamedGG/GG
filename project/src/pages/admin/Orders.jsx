import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import { ShoppingCart, Search, Eye, Filter } from 'lucide-react';
import Pagination from '../../components/Pagination.jsx';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getOrders(page, 10, statusFilter !== 'all' ? statusFilter : undefined);
            setOrders(data.orders || []);
            setTotalPages(data.pages || 1);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title">Orders</h1>
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
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="admin-card">
                <div className="card-header">
                    <div className="card-title">
                        <ShoppingCart size={20} color="var(--color-primary)" />
                        Recent Orders
                    </div>
                </div>

                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-bg-secondary)' }}>
                                <th style={{ padding: '16px', textAlign: 'left', minWidth: '120px' }}>Order ID</th>
                                <th style={{ padding: '16px', textAlign: 'left', minWidth: '200px' }}>Customer</th>
                                <th style={{ padding: '16px', textAlign: 'left', minWidth: '140px' }}>Date</th>
                                <th style={{ padding: '16px', textAlign: 'left', minWidth: '100px' }}>Total</th>
                                <th style={{ padding: '16px', textAlign: 'left', minWidth: '120px' }}>Payment</th>
                                <th style={{ padding: '16px', textAlign: 'left', minWidth: '140px' }}>Status</th>
                                <th style={{ padding: '16px', textAlign: 'right', minWidth: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px', fontFamily: 'monospace', color: 'var(--color-cyan-primary)', fontWeight: 'bold' }}>
                                            #{order.orderNumber}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>
                                                {order.customerInfo?.name || order.user?.name || 'Guest'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={order.customerInfo?.email || order.user?.email}>
                                                {order.customerInfo?.email || order.user?.email}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>{formatDate(order.createdAt)}</td>
                                        <td style={{ padding: '16px', fontWeight: 'bold', color: 'white' }}>{formatCurrency(order.total)}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                background: order.paymentStatus === 'confirmed' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                                                color: order.paymentStatus === 'confirmed' ? '#4ade80' : '#facc15',
                                                border: `1px solid ${order.paymentStatus === 'confirmed' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(250, 204, 21, 0.3)'}`
                                            }}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <select
                                                value={order.orderStatus}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    // Optimistic update
                                                    const updatedOrders = orders.map(o => o._id === order._id ? { ...o, orderStatus: newStatus } : o);
                                                    setOrders(updatedOrders);

                                                    try {
                                                        await adminAPI.updateOrderStatus(order._id, newStatus);
                                                        // Ideally generic toast or reliable notification
                                                    } catch (err) {
                                                        console.error('Update failed', err);
                                                        fetchOrders(); // Revert
                                                    }
                                                }}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--color-border)',
                                                    background: 'var(--color-bg-primary)',
                                                    color: 'white',
                                                    fontSize: '13px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="new">New</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="icon-btn"
                                                    title="View Details"
                                                    style={{ padding: '6px', background: 'var(--color-bg-secondary)', borderRadius: '6px' }}
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <Eye size={16} color="var(--color-text-secondary)" />
                                                </button>
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

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={fetchOrders}
                />
            )}
        </div>
    );
};

export default Orders;
