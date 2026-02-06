import React, { useEffect, useState } from 'react';
import { Trash2, Shield, ShieldOff, Users as UsersIcon, Search, Pencil, X, Save, CheckSquare, Award, Eye } from 'lucide-react';
import adminAPI from '../../api/admin';
import Pagination from '../../components/Pagination.jsx';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Modals state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Selected data
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUserDetails, setSelectedUserDetails] = useState(null);
    const [userFormData, setUserFormData] = useState({
        name: '',
        email: '',
        phone: '',
        isEmailVerified: false,
        role: 'user'
    });
    const [bulkUpdates, setBulkUpdates] = useState({
        role: '',
        isEmailVerified: ''
    });

    useEffect(() => {
        loadUsers();
    }, [page, roleFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getUsers(page, 20, roleFilter);
            setUsers(result?.data?.users || result?.users || []);
            setTotalPages(result?.data?.pagination?.totalPages || result?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserDetails = async (userId) => {
        try {
            const result = await adminAPI.getUserById(userId);
            setSelectedUserDetails(result?.data?.user);
            setIsDetailsModalOpen(true);
        } catch (error) {
            alert('Failed to load user details: ' + error.message);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setUserFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            isEmailVerified: user.isEmailVerified || false,
            role: user.role || 'user'
        });
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async () => {
        try {
            await adminAPI.updateUser(editingUser._id, userFormData);
            setIsEditModalOpen(false);
            loadUsers();
        } catch (error) {
            alert('Failed to update user: ' + error.message);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
        try {
            await adminAPI.updateUserRole(userId, newRole);
            loadUsers();
        } catch (error) {
            alert('Failed to update role: ' + error.message);
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedUsers.length === 0) {
            alert('Please select users to update');
            return;
        }
        const updates = {};
        if (bulkUpdates.role !== '') updates.role = bulkUpdates.role;
        if (bulkUpdates.isEmailVerified !== '') updates.isEmailVerified = bulkUpdates.isEmailVerified === 'true';

        if (Object.keys(updates).length === 0) {
            alert('Please select at least one field to update');
            return;
        }

        try {
            await adminAPI.bulkUpdateUsers({ userIds: selectedUsers, updates });
            setSelectedUsers([]);
            setBulkUpdates({ role: '', isEmailVerified: '' });
            loadUsers();
            setIsBulkModalOpen(false);
        } catch (error) {
            alert('Failed to update users: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await adminAPI.deleteUser(id);
            loadUsers();
        } catch (error) {
            alert('Failed to delete user: ' + error.message);
        }
    };

    const toggleUserSelection = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u._id));
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTierColor = (tier) => {
        const colors = {
            bronze: '#cd7f32',
            silver: '#c0c0c0',
            gold: '#ffd700',
            platinum: '#e5e4e2'
        };
        return colors[tier] || '#999';
    };

    const filteredUsers = users.filter(user =>
    (!searchTerm || user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title">Users</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {selectedUsers.length > 0 && (
                        <button onClick={() => setIsBulkModalOpen(true)} className="btn-secondary" style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-primary)'
                        }}>
                            <CheckSquare size={18} />
                            Bulk Actions ({selectedUsers.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="admin-card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 10px 10px 40px',
                            width: '100%',
                            background: 'var(--color-bg-primary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)'
                        }}
                    />
                </div>
                <select
                    className="form-select"
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    style={{
                        padding: '10px 12px',
                        background: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text-primary)',
                        minWidth: '150px'
                    }}
                >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="admin-card">
                <div className="card-header">
                    <div className="card-title">
                        <UsersIcon size={20} color="var(--color-primary)" />
                        User Directory
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === users.length && users.length > 0}
                                        onChange={toggleSelectAll}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </th>
                                <th>User</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Loyalty</th>
                                <th>Joined</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user._id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={() => toggleUserSelection(user._id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-bg-secondary)', overflow: 'hidden' }}>
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&color=fff&size=64`}
                                                        alt=""
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{user.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>{user.phone || '-'}</td>
                                        <td>
                                            <span className={`status-badge ${user.role === 'admin' ? 'status-info' : 'status-secondary'}`} style={{ background: user.role === 'admin' ? '' : 'rgba(255,255,255,0.05)', color: user.role === 'admin' ? '' : 'var(--color-text-muted)' }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.isEmailVerified ? 'status-success' : 'status-warning'}`}>
                                                {user.isEmailVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            {user.loyaltyPoints !== undefined ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                                    <Award size={14} color={getTierColor(user.loyaltyTier || 'bronze')} />
                                                    <span>{user.loyaltyPoints}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td>
                                            <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                                <button onClick={() => loadUserDetails(user._id)} className="action-btn" title="View Details">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => handleEdit(user)} className="action-btn" title="Edit">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(user._id)} className="action-btn delete" title="Delete">
                                                    <Trash2 size={16} />
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

            {/* Simple Modals (styling inline for speed, ideally componentized) */}
            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="admin-card" style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
                        <div className="card-header">
                            <span className="card-title">Edit User</span>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input className="form-input" style={{ padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                                value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} placeholder="Name" />
                            <input className="form-input" style={{ padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                                value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} placeholder="Email" />
                            <select style={{ padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                                value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                                <button onClick={() => setIsEditModalOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleSaveUser} style={{ padding: '8px 16px', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#000', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
