import React, { useEffect, useState } from 'react';
import db from '../../api/client'; // Direct access for demo
import { Trash2 } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUsers = async () => {
            const data = await db.get('users');
            setUsers(data);
            setLoading(false);
        };
        loadUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Delete this user?')) {
            await db.remove('users', id);
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {users.length} registered users
                    </p>
                </div>
            </header>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id || user.email}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img
                                            src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.name}
                                            alt=""
                                            className="avatar"
                                        />
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{user.name}</div>
                                            <div style={{ fontSize: '12px', color: '#888' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                        background: user.role === 'ADMIN' ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                        color: user.role === 'ADMIN' ? 'var(--color-cyan-primary)' : '#fff'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}
                                        title="Delete User"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
