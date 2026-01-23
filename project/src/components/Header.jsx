import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingCart, User, Menu, X, Search, LogOut, LayoutDashboard, Globe } from 'lucide-react';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const { t, language, toggleLanguage, isRTL } = useLanguage();
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
                    <ul className={`nav-menu ${menuOpen ? 'active' : ''}`} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                        <li><Link to="/" className="nav-link active">{t('home')}</Link></li>
                        <li><a href="#games" className="nav-link">{t('games')}</a></li>
                        <li><a href="#gifts" className="nav-link">{t('giftCards')}</a></li>

                        {/* Mobile Only User Links */}
                        <div className="d-md-none" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                            {user ? (
                                <>
                                    <li style={{ color: 'var(--color-cyan-primary)', fontSize: '14px', marginBottom: '10px' }}>
                                        {t('signedInAs')} {user.name}
                                    </li>
                                    {isAdmin && (
                                        <li><Link to="/admin" className="nav-link">{t('dashboard')}</Link></li>
                                    )}
                                    <li><button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', textAlign: isRTL ? 'right' : 'left', padding: 0 }}>{t('logout')}</button></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/login" className="nav-link">{t('signIn')}</Link></li>
                                    <li><Link to="/signup" className="nav-link">{t('createAccount')}</Link></li>
                                </>
                            )}
                        </div>
                    </ul>

                    {/* Actions (Desktop) */}
                    <div className="nav-actions">
                        {/* Search Bar */}
                        <div className="search-bar">
                            <Search size={16} />
                            <input type="text" placeholder={t('searchGames')} />
                        </div>

                        {/* Language Switcher */}
                        <button 
                            className="icon-btn" 
                            onClick={toggleLanguage}
                            title={t('language')}
                            style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '12px', fontWeight: 'bold' }}
                        >
                            {language === 'en' ? 'AR' : 'EN'}
                        </button>

                        {/* Cart Icon */}
                        <Link to="/cart" className="icon-btn" aria-label={t('cart')}>
                            <ShoppingCart size={20} />
                        </Link>

                        {/* User Actions */}
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isAdmin && (
                                    <Link to="/admin" className="icon-btn" title={t('dashboard')}>
                                        <LayoutDashboard size={20} />
                                    </Link>
                                )}
                                <div className="user-menu-trigger" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-cyan-primary)' }}
                                    />
                                    <button onClick={handleLogout} className="icon-btn" title={t('logout')}>
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Link to="/signup" className="nav-link" style={{ fontSize: '12px', padding: '8px 16px', border: '1px solid var(--color-cyan-primary)', borderRadius: '4px' }}>
                                    {t('createAccount')}
                                </Link>
                                <Link to="/login" className="icon-btn" title={t('signIn')}>
                                    <User size={20} />
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
