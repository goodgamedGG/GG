import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { User, Package, Award, Settings, LogOut, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout, checkAuth } = useAuth(); // checkAuth to refresh profile
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, name: user.name, phone: user.phone || '' }));
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            const res = await client.get('/orders');
            if (res.data.success) {
                setOrders(res.data.data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await client.put('/users/profile', {
                name: formData.name,
                phone: formData.phone
            });
            if (res.data.success) {
                addToast('Profile updated successfully', 'success');
                setIsEditing(false);
                checkAuth(); // Refresh user context
            }
        } catch (error) {
            addToast(error.response?.data?.message || 'Update failed', 'error');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const res = await client.put('/users/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            if (res.data.success) {
                addToast('Password changed successfully', 'success');
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
            }
        } catch (error) {
            addToast(error.response?.data?.message || 'Password change failed', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-400 border-green-400/30 bg-green-400/10';
            case 'processing': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
            case 'cancelled': return 'text-red-400 border-red-400/30 bg-red-400/10';
            default: return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', minHeight: '80vh', maxWidth: '1200px' }}>
            {/* Header Section */}
            <div style={{
                background: 'linear-gradient(145deg, rgba(22, 22, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid var(--color-border)',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'var(--color-bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--color-cyan-primary)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
                }}>
                    <User size={48} className="text-cyan-primary" />
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '32px', fontFamily: 'Orbitron, sans-serif', color: 'white', marginBottom: '8px' }}>
                        {user?.name}
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>{user?.email}</p>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{
                            background: 'rgba(0, 255, 255, 0.1)',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            border: '1px solid rgba(0, 255, 255, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--color-cyan-primary)',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>
                            <Award size={16} />
                            {user?.loyaltyTier ? user.loyaltyTier.toUpperCase() : 'BRONZE'} TIER
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)'
                    }}>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Loyalty Points</p>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                            {user?.loyaltyPoints || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
                {/* Sidebar Navigation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={() => setActiveTab('overview')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            background: activeTab === 'overview' ? 'var(--color-cyan-primary)' : 'var(--color-bg-card)',
                            color: activeTab === 'overview' ? 'black' : 'var(--color-text-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            textAlign: 'left'
                        }}
                    >
                        <User size={20} />
                        Profile Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            background: activeTab === 'orders' ? 'var(--color-cyan-primary)' : 'var(--color-bg-card)',
                            color: activeTab === 'orders' ? 'black' : 'var(--color-text-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            textAlign: 'left'
                        }}
                    >
                        <Package size={20} />
                        My Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            background: activeTab === 'settings' ? 'var(--color-cyan-primary)' : 'var(--color-bg-card)',
                            color: activeTab === 'settings' ? 'black' : 'var(--color-text-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            textAlign: 'left'
                        }}
                    >
                        <Settings size={20} />
                        Settings
                    </button>
                    <button
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            background: 'rgba(255, 50, 50, 0.1)',
                            color: '#ff4d4d',
                            border: '1px solid rgba(255, 50, 50, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            marginTop: 'auto',
                            textAlign: 'left'
                        }}
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>

                {/* Content Area */}
                <div>
                    {activeTab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ background: 'var(--color-bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Personal Information</h2>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        style={{ color: 'var(--color-cyan-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                                    >
                                        {isEditing ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="form-input"
                                                style={{ width: '100%', padding: '12px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Phone Number</label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="form-input"
                                                style={{ width: '100%', padding: '12px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }}
                                            />
                                        </div>
                                        <button type="submit" className="btn-primary" style={{ padding: '12px', marginTop: '8px' }}>Save Changes</button>
                                    </form>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>Full Name</label>
                                            <p style={{ color: 'white', fontSize: '16px' }}>{user?.name}</p>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>Email Address</label>
                                            <p style={{ color: 'white', fontSize: '16px' }}>{user?.email}</p>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>Phone Number</label>
                                            <p style={{ color: 'white', fontSize: '16px' }}>{user?.phone || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>Member Since</label>
                                            <p style={{ color: 'white', fontSize: '16px' }}>{new Date(user?.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Order History</h2>
                            {loadingOrders ? (
                                <p style={{ color: 'var(--color-text-muted)' }}>Loading orders...</p>
                            ) : orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--color-bg-card)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                                    <Package size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }} />
                                    <p style={{ color: 'var(--color-text-secondary)' }}>No orders found.</p>
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div key={order._id} style={{
                                        background: 'var(--color-bg-card)',
                                        padding: '24px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--color-border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 'bold', color: 'white' }}>{order.orderNumber}</span>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    ...(() => {
                                                        const style = getStatusColor(order.orderStatus);
                                                        // Extract classes to style object manually since we used Tailwind classes in string
                                                        // Mapping tailwind-like logic to inline styles for consistency
                                                        if (order.orderStatus === 'completed') return { background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)' };
                                                        if (order.orderStatus === 'processing') return { background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.3)' };
                                                        if (order.orderStatus === 'cancelled') return { background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)' };
                                                        return { background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.3)' };
                                                    })()
                                                }}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                                                {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} Items
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 'bold', color: 'var(--color-cyan-primary)', fontSize: '18px', marginBottom: '4px' }}>
                                                EGP {order.total}
                                            </p>
                                            {/* Could add View Details button here */}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ background: 'var(--color-bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>Security Settings</h2>
                            <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '20px', maxWidth: '400px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Current Password</label>
                                    <input
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="form-input"
                                        style={{ width: '100%', padding: '12px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>New Password</label>
                                    <input
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="form-input"
                                        style={{ width: '100%', padding: '12px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" style={{ padding: '12px' }}>Update Password</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
