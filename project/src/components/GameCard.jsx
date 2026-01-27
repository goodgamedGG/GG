import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart } from 'lucide-react';

const GameCard = ({ id, image, title, publisher, price }) => {
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [adding, setAdding] = useState(false);

    const handleAddToCart = async (e) => {
        e.preventDefault(); // Prevent navigation if button is inside a link
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
                        <span className="game-card-price">EGP {price}</span>
                        <button
                            className="game-card-add"
                            aria-label="Add to cart"
                            onClick={handleAddToCart}
                            disabled={adding}
                        >
                            {adding ? '...' : '+'}
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default GameCard;
