import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart } from 'lucide-react';

const GameCard = ({ id, image, title, publisher, price }) => {
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const hasVariants = price && price.includes && price.includes('-');

    const handleAction = async (e) => {
        // If has variants, clicking the card navigates to details (GameCard component is wrapped in Link).
        // But if there is an Add button, we need to handle it.
        // User requested: "if it is ps have price range make hime view details to choose which account"
        // AND "no button beside price like a small button creative or text as you like"

        // So for variants, we hide the add button or show "View Options" text nearby.
        if (hasVariants) {
            // Navigate is handled by Link wrapper
            return;
        }

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
                    />
                </div>
                <div className="game-card-content">
                    <h3 className="game-card-title">{title}</h3>
                    <p className="game-card-publisher">{publisher}</p>
                    <div className="game-card-footer">
                        <span className="game-card-price">
                            {hasVariants ? price : `EGP ${price}`}
                        </span>

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
