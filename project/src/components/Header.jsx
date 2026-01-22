import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, Menu, X, Search, LogOut, LayoutDashboard } from 'lucide-react';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container">
                <nav className="nav-container">
                    {/* Logo */}
                    <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                        SUB HUB
                        <span className="logo-subtitle">GAMING</span>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Navigation Menu */}
                    <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                        <li><Link to="/" className="nav-link active">HOME</Link></li>
                        <li><a href="#games" className="nav-link">GAMES</a></li>
                        <li><a href="#gifts" className="nav-link">GIFT CARDS</a></li>

                        {/* Mobile Only User Links */}
                        <div className="d-md-none" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                            {user ? (
                                <>
                                    <li style={{ color: 'var(--color-cyan-primary)', fontSize: '14px', marginBottom: '10px' }}>
                                        Signed in as {user.name}
                                    </li>
                                    {isAdmin && (
                                        <li><Link to="/admin" className="nav-link">DASHBOARD</Link></li>
                                    )}
                                    <li><button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0 }}>LOGOUT</button></li>
                                </>
                            ) : (
                                <li><Link to="/login" className="nav-link">SIGN IN</Link></li>
                            )}
                        </div>
                    </ul>

                    {/* Actions (Desktop) */}
                    <div className="nav-actions">
                        {/* Search Bar */}
                        <div className="search-bar">
                            <Search size={16} />
                            <input type="text" placeholder="Search games..." />
                        </div>

                        {/* Cart Icon */}
                        <button className="icon-btn" aria-label="Shopping cart">
                            <ShoppingCart size={20} />
                        </button>

                        {/* User Actions */}
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isAdmin && (
                                    <Link to="/admin" className="icon-btn" title="Admin Dashboard">
                                        <LayoutDashboard size={20} />
                                    </Link>
                                )}
                                <div className="user-menu-trigger" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-cyan-primary)' }}
                                    />
                                    <button onClick={handleLogout} className="icon-btn" title="Logout">
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="icon-btn" title="Sign In">
                                <User size={20} />
                            </Link>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
