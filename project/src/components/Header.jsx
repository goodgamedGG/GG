import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="header">
            <style>{`
                .header {
                    background: rgba(10, 10, 20, 0.95);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid var(--color-border);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    height: 70px;
                }
                
                .header-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 24px;
                    height: 100%;
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    gap: 24px;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                }

                .header-center {
                    display: flex;
                    justify-content: center;
                }

                .logo {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--color-cyan-primary);
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
                }

                .nav-links {
                    display: flex;
                    gap: 32px;
                    align-items: center;
                }

                .nav-link {
                    color: var(--color-text-secondary);
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.2s;
                    font-size: 15px;
                }

                .nav-link:hover, .nav-link.active {
                    color: var(--color-cyan-primary);
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    justify-content: flex-end;
                }

                .icon-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-primary);
                    cursor: pointer;
                    position: relative;
                    transition: color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .icon-btn:hover {
                    color: var(--color-cyan-primary);
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding-left: 16px;
                    border-left: 1px solid var(--color-border);
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--color-text-primary);
                    font-weight: 500;
                    font-size: 14px;
                }

                .user-name {
                    max-width: 150px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .admin-badge {
                    background: var(--color-cyan-primary);
                    color: var(--color-bg-primary);
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .auth-buttons {
                    display: flex;
                    gap: 12px;
                }

                .btn-login {
                    color: var(--color-text-primary);
                    text-decoration: none;
                    font-weight: 500;
                    padding: 8px 16px;
                }

                .btn-signup {
                    background: var(--color-cyan-primary);
                    color: var(--color-bg-primary);
                    text-decoration: none;
                    font-weight: 600;
                    padding: 8px 16px;
                    border-radius: 4px;
                    transition: opacity 0.2s;
                }
                
                .btn-signup:hover {
                    opacity: 0.9;
                }

                @media (max-width: 768px) {
                    .header-container {
                        grid-template-columns: auto 1fr auto;
                    }
                    .nav-links {
                        display: none;
                    }
                }
            `}</style>

            <div className="header-container">
                {/* Left: Brand */}
                <div className="header-left">
                    <Link to="/" className="logo">
                        SUB HUB
                    </Link>
                </div>

                {/* Center: Navigation */}
                <div className="header-center">
                    <nav className="nav-links">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/games" className="nav-link">Games</Link>
                        <Link to="/categories" className="nav-link">Categories</Link>
                        <Link to="/about" className="nav-link">About</Link>
                    </nav>
                </div>

                {/* Right: User Actions */}
                <div className="header-actions">
                    {isAuthenticated ? (
                        <div className="user-profile">
                            {isAdmin && (
                                <Link to="/admin" className="icon-btn" title="Admin Dashboard">
                                    <LayoutDashboard size={20} />
                                </Link>
                            )}

                            <div className="user-info">
                                <User size={20} className="text-cyan-primary" />
                                <span className="user-name">{user?.name || 'User'}</span>
                            </div>

                            <button className="icon-btn" onClick={handleLogout} title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn-login">Login</Link>
                            <Link to="/signup" className="btn-signup">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
