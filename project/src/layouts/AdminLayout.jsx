import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Gamepad2, Users, LogOut, Home } from 'lucide-react';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="admin-layout">
            <style>{`
                .admin-layout {
                    display: flex;
                    min-height: 100vh;
                    background: var(--color-bg-primary);
                }
                .sidebar {
                    width: 260px;
                    background: var(--color-bg-card);
                    border-right: 1px solid var(--color-border);
                    display: flex;
                    flex-direction: column;
                    padding: var(--spacing-lg);
                }
                .sidebar-header {
                    margin-bottom: var(--spacing-2xl);
                    padding-bottom: var(--spacing-lg);
                    border-bottom: 1px solid var(--color-border);
                }
                .sidebar-brand {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 20px;
                    color: var(--color-cyan-primary);
                    font-weight: 700;
                }
                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-sm);
                    flex: 1;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: var(--radius-sm);
                    color: var(--color-text-secondary);
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .nav-item:hover, .nav-item.active {
                    background: rgba(0, 217, 255, 0.1);
                    color: var(--color-cyan-primary);
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding-top: var(--spacing-lg);
                    border-top: 1px solid var(--color-border);
                }
                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--color-bg-secondary);
                }
                .user-details {
                    flex: 1;
                    overflow: hidden;
                }
                .user-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                }
                .user-role {
                    font-size: 12px;
                    color: var(--color-text-muted);
                }
                .logout-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    padding: 8px;
                }
                .logout-btn:hover {
                    color: #ff4444;
                }
                .main-content {
                    flex: 1;
                    padding: var(--spacing-xl);
                    overflow-y: auto;
                }
                
                /* Admin Tables & Forms */
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-xl);
                }
                .page-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 24px;
                    color: var(--color-text-primary);
                }
                .btn-primary {
                    background: var(--color-cyan-primary);
                    color: var(--color-bg-primary);
                    padding: 8px 16px;
                    border-radius: var(--radius-sm);
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: var(--color-bg-card);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                }
                .data-table th, .data-table td {
                    padding: 16px;
                    text-align: left;
                    border-bottom: 1px solid var(--color-border);
                }
                .data-table th {
                    background: var(--color-bg-secondary);
                    color: var(--color-text-muted);
                    font-weight: 500;
                    font-size: 14px;
                }
                .data-table td {
                    color: var(--color-text-primary);
                }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    background: rgba(0, 255, 128, 0.1);
                    color: #00ff80;
                }
            `}</style>

            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-brand">SUB HUB ADMIN</div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link to="/admin/games" className={`nav-item ${isActive('/admin/games') ? 'active' : ''}`}>
                        <Gamepad2 size={20} />
                        Manage Games
                    </Link>
                    <Link to="/admin/users" className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}>
                        <Users size={20} />
                        Users
                    </Link>
                    <Link to="/" className="nav-item">
                        <Home size={20} />
                        View Site
                    </Link>
                </nav>

                <div className="user-info">
                    <img src={user?.avatar || 'https://ui-avatars.com/api/?name=Admin'} alt="Admin" className="avatar" />
                    <div className="user-details">
                        <div className="user-name">{user?.name || 'Admin User'}</div>
                        <div className="user-role">{user?.role || 'Administrator'}</div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn" title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
