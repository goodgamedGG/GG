import React, { useEffect, useState } from 'react';
import { Trash2, Shield, ShieldOff, Users as UsersIcon, Search } from 'lucide-react';
import adminAPI from '../../api/admin';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, [page]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getUsers(page, 20);
            setUsers(result?.users || []);
            setTotalPages(result?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
        try {
            await adminAPI.updateUserRole(userId, newRole);
            setUsers(users.map(u => 
                u._id === userId ? { ...u, role: newRole } : u
            ));
        } catch (error) {
            alert('Failed to update role: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await adminAPI.deleteUser(id);
            setUsers(users.filter(u => u._id !== id));
        } catch (error) {
            alert('Failed to delete user: ' + error.message);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
            </header>

            {/* Search */}
            <div className="filter-bar">
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
                                    <th>User</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Email Verified</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user._id}>
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
                                        <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td>
                                            <div className="action-btns">
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
        </div>
    );
};

export default Users;
