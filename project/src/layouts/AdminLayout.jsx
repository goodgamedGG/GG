import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Tag,
    CreditCard,
    BarChart2,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Shield,
    FileText,
    Mail,
    Zap,
    Gift,
    Award,
    MessageSquare,
    Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const navItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
        { path: '/admin/categories', icon: <Tag size={20} />, label: 'Categories' },
        { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
        { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
        { path: '/admin/analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
        { path: '/admin/payments', icon: <CreditCard size={20} />, label: 'Payments' },
        { path: '/admin/promo-codes', icon: <Gift size={20} />, label: 'Promo Codes' },
        { path: '/admin/flash-sales', icon: <Zap size={20} />, label: 'Flash Sales' },
        { path: '/admin/loyalty', icon: <Award size={20} />, label: 'Loyalty' },
        { path: '/admin/reviews', icon: <MessageSquare size={20} />, label: 'Reviews' },
        { path: '/admin/content', icon: <Globe size={20} />, label: 'Content' },
        { path: '/admin/email-queue', icon: <Mail size={20} />, label: 'Email Queue' },
        { path: '/admin/audit-logs', icon: <Shield size={20} />, label: 'Audit Logs' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div className="admin-layout">
            <style>{`
                .admin-layout {
                    display: flex;
                    min-height: 100vh;
                    background: var(--color-bg-primary);
                }

                /* Sidebar */
                .admin-sidebar {
                    width: ${isSidebarOpen ? '260px' : '80px'};
                    background: var(--color-bg-card);
                    border-right: 1px solid var(--color-border);
                    display: flex;
                    flex-direction: column;
                    transition: width 0.3s ease;
                    position: sticky;
                    top: 0;
                    height: 100vh;
                    z-index: 50;
                    overflow-y: auto;
                }

                .sidebar-header {
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: ${isSidebarOpen ? 'space-between' : 'center'};
                    border-bottom: 1px solid var(--color-border);
                }

                .brand-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 18px;
                    color: var(--color-cyan-primary);
                    margin: 0;
                    display: ${isSidebarOpen ? 'block' : 'none'};
                }

                .nav-menu {
                    padding: 20px 0;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 20px;
                    color: var(--color-text-secondary);
                    text-decoration: none;
                    transition: all 0.2s;
                    border-left: 3px solid transparent;
                    justify-content: ${isSidebarOpen ? 'flex-start' : 'center'};
                }

                .nav-item:hover, .nav-item.active {
                    background: rgba(0, 217, 255, 0.05);
                    color: var(--color-cyan-primary);
                }

                .nav-item.active {
                    border-left-color: var(--color-cyan-primary);
                }

                .nav-label {
                    margin-left: 12px;
                    white-space: nowrap;
                    display: ${isSidebarOpen ? 'block' : 'none'};
                }

                /* Main Content */
                .admin-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0; /* Prevent overflow */
                }

                .admin-header {
                    height: 64px;
                    background: var(--color-bg-card);
                    border-bottom: 1px solid var(--color-border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .toggle-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    padding: 4px;
                }

                .page-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                    margin: 0;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--color-cyan-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: var(--color-bg-primary);
                }

                .logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: 1px solid var(--color-border);
                    padding: 6px 12px;
                    border-radius: 4px;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .logout-btn:hover {
                    background: rgba(255, 50, 50, 0.1);
                    color: #ff4444;
                    border-color: #ff4444;
                }

                .admin-content {
                    padding: 24px;
                    overflow-y: auto;
                    flex: 1;
                }
            `}</style>

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2 className="brand-title">ADMIN PANEL</h2>
                    <button className="toggle-btn" onClick={toggleSidebar}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="nav-menu">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                title={!isSidebarOpen ? item.label : ''}
                            >
                                {item.icon}
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    {/* Additional footer items if needed */}
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <button className="toggle-btn" onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                        <h1 className="page-title">
                            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-name">{user?.name || 'Admin'}</span>
                            <div className="user-avatar">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
