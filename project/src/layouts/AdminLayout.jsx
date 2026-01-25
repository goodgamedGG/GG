import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Gamepad2, Users, LogOut, Home, ShoppingCart, CreditCard, FolderOpen, Tag, Menu, X, Star, MessageSquare, Image as ImageIcon, Zap, Bell, Award, Settings as SettingsIcon, BarChart3, Mail, FileText } from 'lucide-react';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="admin-layout">
            <style>{`
                .admin-layout {
                    display: flex;
                    min-height: 100vh;
                    background: var(--color-bg-primary);
                }
                .mobile-header {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 60px;
                    background: var(--color-bg-card);
                    border-bottom: 1px solid var(--color-border);
                    padding: 0 16px;
                    align-items: center;
                    justify-content: space-between;
                    z-index: 1001;
                }
                .mobile-menu-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-primary);
                    cursor: pointer;
                    padding: 8px;
                }
                .sidebar-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 1001;
                }
                .sidebar {
                    width: 260px;
                    background: var(--color-bg-card);
                    border-right: 1px solid var(--color-border);
                    display: flex;
                    flex-direction: column;
                    padding: var(--spacing-lg);
                    position: fixed;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    z-index: 1002;
                    overflow-y: auto;
                }
                .sidebar-header {
                    margin-bottom: var(--spacing-xl);
                    padding-bottom: var(--spacing-lg);
                    border-bottom: 1px solid var(--color-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .sidebar-brand {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 18px;
                    color: var(--color-cyan-primary);
                    font-weight: 700;
                }
                .sidebar-close {
                    display: none;
                    background: none;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                }
                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    flex: 1;
                }
                .nav-section {
                    font-size: 11px;
                    text-transform: uppercase;
                    color: var(--color-text-muted);
                    margin: 16px 0 8px 12px;
                    letter-spacing: 1px;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-radius: var(--radius-sm);
                    color: var(--color-text-secondary);
                    text-decoration: none;
                    transition: all 0.2s;
                    font-size: 14px;
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
                    margin-top: auto;
                }
                .avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--color-bg-secondary);
                    object-fit: cover;
                }
                .user-details {
                    flex: 1;
                    overflow: hidden;
                }
                .user-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .user-role {
                    font-size: 11px;
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
                    margin-left: 260px;
                }
                
                /* Admin Tables & Forms */
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-xl);
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .page-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 24px;
                    color: var(--color-text-primary);
                }
                .btn-primary {
                    background: var(--color-cyan-primary);
                    color: var(--color-bg-primary);
                    padding: 10px 20px;
                    border-radius: var(--radius-sm);
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .btn-primary:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                .btn-secondary {
                    background: var(--color-bg-secondary);
                    color: var(--color-text-primary);
                    padding: 10px 20px;
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--color-border);
                    font-weight: 500;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .btn-secondary:hover {
                    border-color: var(--color-cyan-primary);
                }
                .btn-danger {
                    background: rgba(255, 68, 68, 0.1);
                    color: #ff4444;
                    padding: 8px 16px;
                    border-radius: var(--radius-sm);
                    border: 1px solid rgba(255, 68, 68, 0.3);
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                .btn-danger:hover {
                    background: rgba(255, 68, 68, 0.2);
                }
                .btn-success {
                    background: rgba(0, 255, 128, 0.1);
                    color: #00ff80;
                    padding: 8px 16px;
                    border-radius: var(--radius-sm);
                    border: 1px solid rgba(0, 255, 128, 0.3);
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                .btn-success:hover {
                    background: rgba(0, 255, 128, 0.2);
                }
                .table-container {
                    background: var(--color-bg-card);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-border);
                    overflow: hidden;
                }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .data-table th, .data-table td {
                    padding: 14px 16px;
                    text-align: left;
                    border-bottom: 1px solid var(--color-border);
                }
                .data-table th {
                    background: var(--color-bg-secondary);
                    color: var(--color-text-muted);
                    font-weight: 500;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .data-table td {
                    color: var(--color-text-primary);
                    font-size: 14px;
                }
                .data-table tbody tr:hover {
                    background: rgba(0, 217, 255, 0.03);
                }
                .status-badge {
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                    display: inline-block;
                }
                .status-active, .status-confirmed, .status-completed {
                    background: rgba(0, 255, 128, 0.1);
                    color: #00ff80;
                }
                .status-inactive, .status-rejected, .status-cancelled {
                    background: rgba(255, 68, 68, 0.1);
                    color: #ff4444;
                }
                .status-pending {
                    background: rgba(255, 200, 0, 0.1);
                    color: #ffc800;
                }
                .status-processing {
                    background: rgba(0, 217, 255, 0.1);
                    color: var(--color-cyan-primary);
                }
                .form-group {
                    margin-bottom: 16px;
                }
                .form-label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 13px;
                    color: var(--color-text-muted);
                    font-weight: 500;
                }
                .form-input, .form-select, .form-textarea {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    color: var(--color-text-primary);
                    font-size: 14px;
                    transition: border-color 0.2s;
                }
                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    outline: none;
                    border-color: var(--color-cyan-primary);
                }
                .form-textarea {
                    min-height: 100px;
                    resize: vertical;
                }
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.8);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .modal-content {
                    background: var(--color-bg-card);
                    padding: 24px;
                    border-radius: var(--radius-lg);
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    border: 1px solid var(--color-border);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--color-border);
                }
                .modal-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 18px;
                    color: var(--color-text-primary);
                }
                .modal-close {
                    background: none;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    padding: 4px;
                }
                .modal-close:hover {
                    color: var(--color-text-primary);
                }
                .filter-bar {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .filter-bar .form-select {
                    width: auto;
                    min-width: 150px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: var(--color-bg-card);
                    padding: 20px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-border);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .stat-icon {
                    padding: 12px;
                    border-radius: 12px;
                }
                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: var(--color-text-primary);
                }
                .stat-label {
                    font-size: 13px;
                    color: var(--color-text-muted);
                }
                .action-btns {
                    display: flex;
                    gap: 8px;
                }
                .icon-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .icon-btn:hover {
                    background: var(--color-bg-secondary);
                    color: var(--color-cyan-primary);
                }
                .icon-btn.danger:hover {
                    color: #ff4444;
                }
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--color-text-muted);
                }
                .pagination {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 20px;
                }
                .pagination button {
                    padding: 8px 16px;
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    color: var(--color-text-primary);
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                }
                .pagination button:hover:not(:disabled) {
                    border-color: var(--color-cyan-primary);
                }
                .pagination button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .toggle-switch {
                    position: relative;
                    width: 44px;
                    height: 24px;
                    background: var(--color-bg-secondary);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .toggle-switch.active {
                    background: var(--color-cyan-primary);
                }
                .toggle-switch::after {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background: white;
                    border-radius: 50%;
                    transition: transform 0.2s;
                }
                .toggle-switch.active::after {
                    transform: translateX(20px);
                }

                @media (max-width: 1024px) {
                    .mobile-header {
                        display: flex;
                    }
                    .sidebar {
                        transform: translateX(-100%);
                        transition: transform 0.3s;
                    }
                    .sidebar.open {
                        transform: translateX(0);
                    }
                    .sidebar-overlay.open {
                        display: block;
                    }
                    .sidebar-close {
                        display: block;
                    }
                    .main-content {
                        margin-left: 0;
                        padding-top: 80px;
                    }
                }

                @media (max-width: 768px) {
                    .main-content {
                        padding: 80px 16px 20px;
                    }
                    .admin-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .page-title {
                        font-size: 20px;
                    }
                    .stats-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    .data-table {
                        font-size: 13px;
                    }
                    .data-table th, .data-table td {
                        padding: 10px 12px;
                    }
                }
            `}</style>

            {/* Mobile Header */}
            <div className="mobile-header">
                <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                    <Menu size={24} />
                </button>
                <span className="sidebar-brand">SUB HUB ADMIN</span>
                <div style={{ width: 40 }} />
            </div>

            {/* Sidebar Overlay */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">SUB HUB ADMIN</div>
                    <button className="sidebar-close" onClick={closeSidebar}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`} onClick={closeSidebar}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>

                    <div className="nav-section">Store</div>
                    <Link to="/admin/products" className={`nav-item ${isActive('/admin/products') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Gamepad2 size={20} />
                        Products
                    </Link>
                    <Link to="/admin/categories" className={`nav-item ${isActive('/admin/categories') ? 'active' : ''}`} onClick={closeSidebar}>
                        <FolderOpen size={20} />
                        Categories
                    </Link>
                    <Link to="/admin/promo-codes" className={`nav-item ${isActive('/admin/promo-codes') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Tag size={20} />
                        Promo Codes
                    </Link>
                    <Link to="/admin/reviews" className={`nav-item ${isActive('/admin/reviews') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Star size={20} />
                        Reviews
                    </Link>
                    <Link to="/admin/content" className={`nav-item ${isActive('/admin/content') ? 'active' : ''}`} onClick={closeSidebar}>
                        <ImageIcon size={20} />
                        Content
                    </Link>
                    <Link to="/admin/flash-sales" className={`nav-item ${isActive('/admin/flash-sales') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Zap size={20} />
                        Flash Sales
                    </Link>

                    <div className="nav-section">Sales</div>
                    <Link to="/admin/orders" className={`nav-item ${isActive('/admin/orders') ? 'active' : ''}`} onClick={closeSidebar}>
                        <ShoppingCart size={20} />
                        Orders
                    </Link>
                    <Link to="/admin/payments" className={`nav-item ${isActive('/admin/payments') ? 'active' : ''}`} onClick={closeSidebar}>
                        <CreditCard size={20} />
                        Payments
                    </Link>
                    <Link to="/admin/price-alerts" className={`nav-item ${isActive('/admin/price-alerts') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Bell size={20} />
                        Price Alerts
                    </Link>

                    <div className="nav-section">Users & Engagement</div>
                    <Link to="/admin/users" className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Users size={20} />
                        Users
                    </Link>
                    <Link to="/admin/loyalty" className={`nav-item ${isActive('/admin/loyalty') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Award size={20} />
                        Loyalty Points
                    </Link>

                    <div className="nav-section">System</div>
                    <Link to="/admin/analytics" className={`nav-item ${isActive('/admin/analytics') ? 'active' : ''}`} onClick={closeSidebar}>
                        <BarChart3 size={20} />
                        Analytics
                    </Link>
                    <Link to="/admin/settings" className={`nav-item ${isActive('/admin/settings') ? 'active' : ''}`} onClick={closeSidebar}>
                        <SettingsIcon size={20} />
                        Settings
                    </Link>
                    <Link to="/admin/email-queue" className={`nav-item ${isActive('/admin/email-queue') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Mail size={20} />
                        Email Queue
                    </Link>
                    <Link to="/admin/audit-logs" className={`nav-item ${isActive('/admin/audit-logs') ? 'active' : ''}`} onClick={closeSidebar}>
                        <FileText size={20} />
                        Audit Logs
                    </Link>

                    <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                        <Link to="/" className="nav-item" onClick={closeSidebar}>
                            <Home size={20} />
                            View Site
                        </Link>
                    </div>
                </nav>

                <div className="user-info">
                    <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=0a0e14&color=00d9ff`} alt="Admin" className="avatar" />
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
