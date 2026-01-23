import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const { t, language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        setMenuOpen(false);
        navigate('/');
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="container">
                <nav className="nav-container">
                    {/* Mobile Menu Toggle - Shows only on mobile */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo */}
                    <Link to="/" className="logo" onClick={closeMenu}>
                        SUB HUB
                        <span className="logo-subtitle">GAMING</span>
                    </Link>

                    {/* Navigation Menu - Hidden on mobile, shown on desktop */}
                    <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                        <li><Link to="/" className="nav-link active" onClick={closeMenu}>{t('home')}</Link></li>
                        <li><a href="#games" className="nav-link" onClick={closeMenu}>{t('games')}</a></li>
                        <li><a href="#gifts" className="nav-link" onClick={closeMenu}>{t('giftCards')}</a></li>

                        {/* Mobile Only User Links */}
                        <div className="mobile-user-links">
                            {user ? (
                                <>
                                    <li style={{ color: 'var(--color-cyan-primary)', fontSize: '14px', marginBottom: '10px', listStyle: 'none' }}>
                                        {t('signedInAs')} {user.name}
                                    </li>
                                    {isAdmin && (
                                        <li><Link to="/admin" className="nav-link" onClick={closeMenu}>{t('dashboard')}</Link></li>
                                    )}
                                    <li>
                                        <button 
                                            onClick={handleLogout} 
                                            className="nav-link" 
                                            style={{ background: 'none', border: 'none', padding: 'var(--spacing-sm) 0', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                                        >
                                            {t('logout')}
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <li><Link to="/login" className="nav-link" onClick={closeMenu}>{t('signIn')}</Link></li>
                            )}
                        </div>
                    </ul>

                    {/* Actions - Right side */}
                    <div className="nav-actions">
                        {/* User Actions */}
                        {user ? (
                            <>
                                {isAdmin && (
                                    <Link to="/admin" className="icon-btn desktop-only" title={t('dashboard')}>
                                        <LayoutDashboard size={18} />
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="icon-btn desktop-only" title={t('logout')}>
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="icon-btn" title={t('signIn')}>
                                <User size={18} />
                            </Link>
                        )}

                        {/* Cart Icon */}
                        <Link to="/cart" className="icon-btn" aria-label={t('cart')}>
                            <ShoppingCart size={18} />
                        </Link>

                        {/* Language Switcher */}
                        <button 
                            className="icon-btn" 
                            onClick={toggleLanguage}
                            title={t('language')}
                            style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '11px', fontWeight: 'bold' }}
                        >
                            {language === 'en' ? 'AR' : 'EN'}
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
