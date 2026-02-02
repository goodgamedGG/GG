import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar';

const Header = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

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
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
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

                .badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: var(--color-cyan-primary);
                    color: var(--color-bg-primary);
                    font-size: 10px;
                    font-weight: bold;
                    min-width: 18px;
                    height: 18px;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 4px;
                }

                .user-menu {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 8px;
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
                    .nav-links {
                        display: none;
                    }
                }
            `}</style>

            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="logo">
                    SUB HUB
                </Link>

                {/* Navigation */}
                <nav className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/games" className="nav-link">Games</Link>
                    <Link to="/categories" className="nav-link">Categories</Link>
                    <Link to="/about" className="nav-link">About</Link>
                </nav>

                {/* Actions */}
                <div className="header-actions">
                    <button className="icon-btn" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                        <Search size={22} />
                    </button>

                    <Link to="/cart" className="icon-btn">
                        <ShoppingCart size={22} />
                        {itemCount > 0 && <span className="badge">{itemCount}</span>}
                    </Link>

                    {isAuthenticated ? (
                        <div className="user-menu">
                            {isAdmin && (
                                <Link to="/admin" className="nav-link" style={{ marginRight: '10px' }}>
                                    Admin
                                </Link>
                            )}
                            <button className="icon-btn" onClick={handleLogout} title="Logout">
                                <LogOut size={22} />
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

            {/* Mobile Menu & Search Overlay could go here */}
        </header>
    );
};

export default Header;
