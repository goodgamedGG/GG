import React, { useEffect, useState } from 'react';
import { Trash2, Shield, ShieldOff, Users as UsersIcon, Search, Pencil, X, Save, CheckSquare, Award, Eye } from 'lucide-react';
import adminAPI from '../../api/admin';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
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
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Users</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Manage registered users
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {selectedUsers.length > 0 && (
                        <button onClick={() => setIsBulkModalOpen(true)} className="btn-secondary">
                            <CheckSquare size={18} />
                            Bulk Actions ({selectedUsers.length})
                        </button>
                    )}
                </div>
            </header>

            {/* Filters */}
            <div className="filter-bar" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
                <select
                    className="form-select"
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    style={{ minWidth: '150px' }}
                >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {loading ? (
                <div className="empty-state">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
                <div className="empty-state">
                    <UsersIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>{searchTerm ? 'No users found matching your search.' : 'No users found.'}</p>
                </div>
            ) : (
                <>
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === users.length && users.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>User</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Email Verified</th>
                                    <th>Loyalty</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user._id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={() => toggleUserSelection(user._id)}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0a0e14&color=00d9ff`}
                                                    alt=""
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--color-text-muted)' }}>{user.phone || '-'}</td>
                                        <td>
                                            <span className={`status-badge ${user.role === 'admin' ? 'status-active' : ''}`} style={{
                                                background: user.role === 'admin' ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                                color: user.role === 'admin' ? 'var(--color-cyan-primary)' : 'var(--color-text-muted)'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.isEmailVerified ? 'status-confirmed' : 'status-pending'}`}>
                                                {user.isEmailVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            {user.loyaltyPoints !== undefined ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Award size={16} style={{ color: getTierColor(user.loyaltyTier || 'bronze') }} />
                                                    <span style={{ fontSize: '12px' }}>
                                                        {user.loyaltyPoints || 0} pts
                                                    </span>
                                                    {user.loyaltyTier && (
                                                        <span style={{ 
                                                            fontSize: '10px', 
                                                            padding: '2px 6px', 
                                                            background: `rgba(${getTierColor(user.loyaltyTier)}, 0.2)`,
                                                            color: getTierColor(user.loyaltyTier),
                                                            borderRadius: '4px',
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {user.loyaltyTier}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button
                                                    onClick={() => loadUserDetails(user._id)}
                                                    className="icon-btn"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="icon-btn"
                                                    title="Edit User"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                {user.role === 'admin' ? (
                                                    <button
                                                        onClick={() => handleRoleUpdate(user._id, 'user')}
                                                        className="icon-btn"
                                                        title="Remove Admin"
                                                    >
                                                        <ShieldOff size={18} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRoleUpdate(user._id, 'admin')}
                                                        className="icon-btn"
                                                        title="Make Admin"
                                                    >
                                                        <Shield size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="icon-btn danger"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
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
                    )}
                </>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && editingUser && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Edit User</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={userFormData.name}
                                    onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={userFormData.email}
                                    onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={userFormData.phone}
                                    onChange={e => setUserFormData({ ...userFormData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-select"
                                    value={userFormData.role}
                                    onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={userFormData.isEmailVerified}
                                        onChange={e => setUserFormData({ ...userFormData, isEmailVerified: e.target.checked })}
                                    />
                                    <span>Email Verified</span>
                                </label>
                            </div>
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsEditModalOpen(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleSaveUser} className="btn-primary">
                                <Save size={18} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {isDetailsModalOpen && selectedUserDetails && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">User Details</h2>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>NAME</h4>
                                    <p style={{ fontWeight: 500 }}>{selectedUserDetails.name}</p>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>EMAIL</h4>
                                    <p style={{ fontWeight: 500 }}>{selectedUserDetails.email}</p>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>PHONE</h4>
                                    <p style={{ fontWeight: 500 }}>{selectedUserDetails.phone || '-'}</p>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>ROLE</h4>
                                    <span className={`status-badge ${selectedUserDetails.role === 'admin' ? 'status-active' : ''}`}>
                                        {selectedUserDetails.role}
                                    </span>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>EMAIL VERIFIED</h4>
                                    <span className={`status-badge ${selectedUserDetails.isEmailVerified ? 'status-confirmed' : 'status-pending'}`}>
                                        {selectedUserDetails.isEmailVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>JOINED</h4>
                                    <p style={{ fontWeight: 500 }}>{formatDate(selectedUserDetails.createdAt)}</p>
                                </div>
                            </div>
                            {selectedUserDetails.ordersCount !== undefined && (
                                <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '12px' }}>STATISTICS</h4>
                                    <div style={{ display: 'flex', gap: '24px' }}>
                                        <div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                                {selectedUserDetails.ordersCount || 0}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Orders</div>
                                        </div>
                                        {selectedUserDetails.loyaltyPoints !== undefined && (
                                            <div>
                                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: getTierColor(selectedUserDetails.loyaltyTier || 'bronze') }}>
                                                    {selectedUserDetails.loyaltyPoints || 0}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                    Loyalty Points
                                                    {selectedUserDetails.loyaltyTier && (
                                                        <span style={{ 
                                                            marginLeft: '8px',
                                                            padding: '2px 6px',
                                                            background: `rgba(${getTierColor(selectedUserDetails.loyaltyTier)}, 0.2)`,
                                                            color: getTierColor(selectedUserDetails.loyaltyTier),
                                                            borderRadius: '4px',
                                                            textTransform: 'capitalize',
                                                            fontSize: '10px'
                                                        }}>
                                                            {selectedUserDetails.loyaltyTier}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="btn-secondary">
                                Close
                            </button>
                            <button onClick={() => { setIsDetailsModalOpen(false); handleEdit(selectedUserDetails); }} className="btn-primary">
                                <Pencil size={18} />
                                Edit User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions Modal */}
            {isBulkModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Bulk Actions</h2>
                            <button onClick={() => setIsBulkModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <p style={{ marginBottom: '20px' }}>
                                {selectedUsers.length} user(s) selected
                            </p>
                            <div className="form-group">
                                <label className="form-label">Update Role</label>
                                <select
                                    className="form-select"
                                    value={bulkUpdates.role}
                                    onChange={e => setBulkUpdates({ ...bulkUpdates, role: e.target.value })}
                                >
                                    <option value="">No Change</option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Update Email Verification</label>
                                <select
                                    className="form-select"
                                    value={bulkUpdates.isEmailVerified}
                                    onChange={e => setBulkUpdates({ ...bulkUpdates, isEmailVerified: e.target.value })}
                                >
                                    <option value="">No Change</option>
                                    <option value="true">Verified</option>
                                    <option value="false">Not Verified</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsBulkModalOpen(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleBulkUpdate} className="btn-primary">
                                Update Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
