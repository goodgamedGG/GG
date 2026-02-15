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

                <div className="users-grid-container">
                    {/* Sticky Header */}
                    <div className="users-grid-header">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={selectedUsers.length === users.length && users.length > 0}
                                onChange={toggleSelectAll}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                        <div>User</div>
                        <div>Phone</div>
                        <div>Role</div>
                        <div>Status</div>
                        <div>Loyalty</div>
                        <div>Joined</div>
                        <div style={{ textAlign: 'right' }}>Actions</div>
                    </div>

                    {/* Grid Body */}
                    <div className="users-grid-body">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
                                Loading users...
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
                                No users found.
                            </div>
                        ) : (
                            filteredUsers.map((user, index) => (
                                <div
                                    key={user._id}
                                    className="users-grid-row"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Checkbox */}
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user._id)}
                                            onChange={() => toggleUserSelection(user._id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>

                                    {/* User Profile */}
                                    <div className="user-profile-col">
                                        <div className="user-avatar">
                                            {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                                        </div>
                                        <div className="user-info">
                                            <div className="user-name">{user.name || 'Anonymous'}</div>
                                            <div className="user-email">{user.email}</div>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="phone-col">
                                        {user.phone || '-'}
                                    </div>

                                    {/* Role */}
                                    <div className="role-col">
                                        <span className={`role-badge ${user.role}`}>
                                            {user.role}
                                        </span>
                                    </div>

                                    {/* Status */}
                                    <div className="status-col">
                                        <span className={`status-text ${user.isEmailVerified ? 'verified' : 'pending'}`}>
                                            {user.isEmailVerified ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </div>

                                    {/* Loyalty */}
                                    <div className="loyalty-col">
                                        {user.loyaltyPoints !== undefined ? (
                                            <div className="loyalty-info">
                                                <Award size={14} color={getTierColor(user.loyaltyTier || 'bronze')} />
                                                <span>{user.loyaltyPoints}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                                        )}
                                    </div>

                                    {/* Joined */}
                                    <div className="joined-col">
                                        {formatDate(user.createdAt)}
                                    </div>

                                    {/* Actions */}
                                    <div className="actions-col">
                                        <button onClick={() => loadUserDetails(user._id)} className="action-btn" title="View Details">
                                            <Eye size={16} />
                                        </button>
                                        <button onClick={() => handleEdit(user)} className="action-btn" title="Edit">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(user._id)} className="action-btn danger" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .users-grid-container {
                        background: #0f172a;
                        border: 1px solid #1e293b;
                        border-radius: 12px;
                        overflow: visible;
                    }

                    .users-grid-header {
                        display: grid;
                        grid-template-columns: 40px 3fr 1.5fr 1fr 1fr 1fr 1.5fr 150px;
                        padding: 16px 20px;
                        background: #1e293b;
                        color: #94a3b8;
                        font-size: 13px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        border-bottom: 2px solid #334155;
                        position: sticky;
                        top: 0;
                        z-index: 10;
                        border-radius: 12px 12px 0 0;
                    }

                    .users-grid-row {
                        display: grid;
                        grid-template-columns: 40px 3fr 1.5fr 1fr 1fr 1fr 1.5fr 150px;
                        padding: 12px 20px;
                        align-items: center;
                        border-bottom: 1px solid #1e293b;
                        transition: all 0.2s ease;
                        animation: fadeIn 0.3s ease forwards;
                    }

                    .users-grid-row:hover {
                        background: rgba(30, 41, 59, 0.5);
                    }

                    .users-grid-row:last-child {
                        border-bottom: none;
                        border-radius: 0 0 12px 12px;
                    }

                    .user-profile-col {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }

                    .user-avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 10px;
                        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                        border: 1px solid #334155;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #ffffff;
                        font-weight: 700;
                        font-size: 14px;
                    }

                    .user-info {
                        display: flex;
                        flex-direction: column;
                    }

                    .user-name {
                        font-weight: 700;
                        font-size: 15px;
                        color: #ffffff;
                    }

                    .user-email {
                        font-size: 12px;
                        color: #94a3b8;
                    }

                    .phone-col {
                        font-size: 13px;
                        color: #94a3b8;
                    }

                    .role-badge {
                        display: inline-flex;
                        padding: 4px 10px;
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.03em;
                    }

                    .role-badge.admin {
                        background: rgba(0, 217, 255, 0.1);
                        color: #00d9ff;
                        border: 1px solid rgba(0, 217, 255, 0.2);
                    }

                    .role-badge.user {
                        background: rgba(148, 163, 184, 0.1);
                        color: #94a3b8;
                        border: 1px solid rgba(148, 163, 184, 0.2);
                    }

                    .status-text {
                        font-size: 12px;
                        font-weight: 800;
                        letter-spacing: 0.02em;
                    }

                    .status-text.verified {
                        color: #10b981;
                    }

                    .status-text.pending {
                        color: #f59e0b;
                    }

                    .loyalty-info {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 13px;
                        color: #ffffff;
                    }

                    .joined-col {
                        font-size: 13px;
                        color: #64748b;
                    }

                    .actions-col {
                        display: flex;
                        gap: 8px;
                        justify-content: flex-end;
                    }

                    .action-btn {
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #1e293b;
                        color: #94a3b8;
                        border-radius: 8px;
                        border: 1px solid #334155;
                        transition: all 0.2s;
                        cursor: pointer;
                    }

                    .action-btn:hover {
                        color: #ffffff;
                        background: #334155;
                        transform: translateY(-2px);
                        border-color: #475569;
                    }

                    .action-btn.danger:hover {
                        background: rgba(239, 68, 68, 0.1);
                        color: #ef4444;
                        border-color: rgba(239, 68, 68, 0.2);
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                ` }} />

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
