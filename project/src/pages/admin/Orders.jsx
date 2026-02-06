import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import { ShoppingCart, Search, Eye, Filter } from 'lucide-react';
import Pagination from '../../components/Pagination.jsx';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');

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

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id}>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                                            #{order.orderNumber}
                                        </td>
                                        <td className="col-primary">
                                            {order.customerInfo?.name || order.user?.name || 'Guest'}
                                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                                                {order.customerInfo?.email || order.user?.email}
                                            </div>
                                        </td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td style={{ fontWeight: '600' }}>{formatCurrency(order.total)}</td>
                                        <td>
                                            <span className={`status-badge ${order.paymentStatus === 'confirmed' ? 'status-success' : 'status-warning'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${order.orderStatus}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                                <button className="action-btn" title="View Details">
                                                    <Eye size={16} />
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
        </div>
    );
};

export default Orders;
