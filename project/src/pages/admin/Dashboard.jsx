import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Gamepad2, ShoppingCart, DollarSign, TrendingUp, CreditCard, Package, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminAPI from '../../api/admin';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="stat-card">
        <div className="stat-icon" style={{ background: `rgba(${color}, 0.1)`, color: `rgb(${color})` }}>
            <Icon size={24} />
        </div>
        <div>
            <div className="stat-label">{title}</div>
            <div className="stat-value">{value}</div>
            {subtitle && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{subtitle}</div>}
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        products: 0,
        users: 0,
        orders: 0,
        revenue: 0,
        pendingOrders: 0,
        pendingPayments: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [productsRes, usersRes, ordersRes, paymentsRes] = await Promise.all([
                adminAPI.getProducts(1, 1000).catch(() => ({ products: [] })),
                adminAPI.getUsers(1, 1000).catch(() => ({ users: [] })),
                adminAPI.getOrders(1, 10).catch(() => ({ orders: [] })),
                adminAPI.getPayments(1, 100, 'pending').catch(() => ({ payments: [] }))
            ]);

            const products = productsRes?.products || [];
            const users = usersRes?.users || [];
            const orders = ordersRes?.orders || [];
            const pendingPayments = paymentsRes?.payments || [];

            // Calculate stats
            const totalRevenue = orders
                .filter(o => o.paymentStatus === 'confirmed')
                .reduce((sum, o) => sum + (o.total || 0), 0);

            const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;

            setStats({
                products: products.length,
                users: users.length,
                orders: orders.length,
                revenue: totalRevenue,
                pendingOrders,
                pendingPayments: pendingPayments.length
            });

            setRecentOrders(orders.slice(0, 5));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
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
                    <h1 className="page-title">Dashboard</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
                        Welcome back, {user?.name}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link to="/admin/products" className="btn-primary">
                        + Add Product
                    </Link>
                </div>
            </header>

            {loading ? (
                <div className="empty-state">Loading dashboard...</div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <StatCard
                            title="Total Products"
                            value={stats.products}
                            icon={Gamepad2}
                            color="0, 217, 255"
                        />
                        <StatCard
                            title="Total Users"
                            value={stats.users}
                            icon={Users}
                            color="0, 255, 128"
                        />
                        <StatCard
                            title="Total Orders"
                            value={stats.orders}
                            icon={ShoppingCart}
                            color="255, 200, 0"
                        />
                        <StatCard
                            title="Revenue"
                            value={formatCurrency(stats.revenue)}
                            icon={DollarSign}
                            color="0, 255, 200"
                        />
                    </div>

                    {/* Alerts */}
                    {(stats.pendingOrders > 0 || stats.pendingPayments > 0) && (
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '30px', flexWrap: 'wrap' }}>
                            {stats.pendingOrders > 0 && (
                                <Link to="/admin/orders" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '16px 20px',
                                    background: 'rgba(255, 200, 0, 0.1)',
                                    border: '1px solid rgba(255, 200, 0, 0.3)',
                                    borderRadius: 'var(--radius-md)',
                                    color: '#ffc800',
                                    textDecoration: 'none'
                                }}>
                                    <Clock size={20} />
                                    <span><strong>{stats.pendingOrders}</strong> pending orders need attention</span>
                                </Link>
                            )}
                            {stats.pendingPayments > 0 && (
                                <Link to="/admin/payments" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '16px 20px',
                                    background: 'rgba(255, 100, 100, 0.1)',
                                    border: '1px solid rgba(255, 100, 100, 0.3)',
                                    borderRadius: 'var(--radius-md)',
                                    color: '#ff6464',
                                    textDecoration: 'none'
                                }}>
                                    <CreditCard size={20} />
                                    <span><strong>{stats.pendingPayments}</strong> payments awaiting confirmation</span>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Recent Orders */}
                    <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '16px' }}>Recent Orders</h3>
                            <Link to="/admin/orders" style={{ color: 'var(--color-cyan-primary)', fontSize: '14px' }}>View All →</Link>
                        </div>
                        {recentOrders.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                No orders yet.
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order._id}>
                                            <td>
                                                <span style={{ fontFamily: 'monospace', color: 'var(--color-cyan-primary)' }}>
                                                    {order.orderNumber}
                                                </span>
                                            </td>
                                            <td>{order.customerInfo?.name || order.user?.name || '-'}</td>
                                            <td style={{ fontWeight: 'bold' }}>${order.total?.toFixed(2)}</td>
                                            <td>
                                                <span className={`status-badge status-${order.orderStatus}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                                                {formatDate(order.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '30px' }}>
                        <Link to="/admin/products" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '20px',
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}>
                            <Package size={24} style={{ color: 'var(--color-cyan-primary)' }} />
                            <span>Manage Products</span>
                        </Link>
                        <Link to="/admin/categories" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '20px',
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}>
                            <TrendingUp size={24} style={{ color: '#00ff80' }} />
                            <span>Categories</span>
                        </Link>
                        <Link to="/admin/promo-codes" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '20px',
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}>
                            <CreditCard size={24} style={{ color: '#ffc800' }} />
                            <span>Promo Codes</span>
                        </Link>
                        <Link to="/admin/users" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '20px',
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}>
                            <Users size={24} style={{ color: '#ff6464' }} />
                            <span>Manage Users</span>
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
