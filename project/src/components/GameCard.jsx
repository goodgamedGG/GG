import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart } from 'lucide-react';

const GameCard = ({ id, image, title, publisher, price, regularPrice }) => {
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [adding, setAdding] = useState(false);
    const hasVariants = typeof price === 'string' && price.includes && price.includes('-');
    const hasDiscount = regularPrice && price < regularPrice;

    const handleAction = async (e) => {
        // ... same logic ...
        if (hasVariants) return;

        e.preventDefault();
        e.stopPropagation();

        try {
            setAdding(true);
            await addToCart(id, 1);
            addToast('Added to cart successfully!', 'success');
            navigate('/cart');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            addToast('Failed to add to cart. Please log in first.', 'error');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="game-card">
            <Link to={`/product/${id}`} className="game-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="game-card-image-wrapper">
                    <img
                        src={image}
                        alt={title}
                        className="game-card-image"
                        loading="lazy"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/300x400/1a1a1a/00d9ff?text=No+Image';
                        }}
                    />
                    {hasDiscount && !hasVariants && (
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#ff4757',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            zIndex: 2
                        }}>
                            -{Math.round(((regularPrice - price) / regularPrice) * 100)}%
                        </div>
                    )}
                </div>
                <div className="game-card-content">
                    <h3 className="game-card-title">{title}</h3>
                    <p className="game-card-publisher">{publisher}</p>
                    <div className="game-card-footer">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="game-card-price">
                                {hasVariants ? price : `EGP ${price}`}
                            </span>
                            {hasDiscount && !hasVariants && (
                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                                    EGP {regularPrice}
                                </span>
                            )}
                        </div>

                        {!hasVariants ? (
                            <button
                                className="game-card-add"
                                aria-label="Add to cart"
                                onClick={handleAction}
                                disabled={adding}
                            >
                                {adding ? '...' : '+'}
                            </button>
                        ) : (
                            <span style={{ fontSize: '12px', color: 'var(--color-cyan-primary)', fontWeight: 'bold' }}>
                                View Options
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default GameCard;
