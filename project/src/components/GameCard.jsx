import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../utils/imageUtils';

const GameCard = ({ product }) => {
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { addToast } = useToast();

    // Default image if missing
    const image = product.images && product.images.length > 0
        ? getImageUrl(product.images[0])
        : 'https://placehold.co/300x400?text=No+Image';

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            addToast('Please login to add items to cart', 'info');
            return;
        }

        try {
            await addToCart(product._id, 1);
            addToast('Added to cart', 'success');
        } catch (error) {
            addToast('Failed to add to cart', 'error');
        }
    };

    const discountPercentage = product.price && product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    return (
        <Link to={`/product/${product._id}`} className="game-card">
            <style>{`
                .game-card {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    text-decoration: none;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .game-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                    border-color: var(--color-cyan-primary);
                }

                .card-image-container {
                    position: relative;
                    padding-top: 133%; /* 3:4 Aspect Ratio */
                    overflow: hidden;
                }

                .card-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s;
                }

                .game-card:hover .card-image {
                    transform: scale(1.05);
                }

                .card-badges {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .badge-sale {
                    background: #ff4444;
                    color: white;
                }

                .badge-new {
                    background: var(--color-cyan-primary);
                    color: black;
                }

                .card-actions {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .game-card:hover .card-actions {
                    opacity: 1;
                }

                .action-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: var(--color-cyan-primary);
                    color: black;
                }

                .card-content {
                    padding: 16px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .card-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 16px;
                    color: var(--color-text-primary);
                    margin: 0 0 8px 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .card-category {
                    font-size: 12px;
                    color: var(--color-text-muted);
                    margin-bottom: 12px;
                }

                .card-footer {
                    margin-top: auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .price-container {
                    display: flex;
                    flex-direction: column;
                }

                .original-price {
                    font-size: 12px;
                    color: var(--color-text-muted);
                    text-decoration: line-through;
                }

                .current-price {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--color-cyan-primary);
                }
            `}</style>

            <div className="card-image-container">
                <img src={image} alt={product.name} className="card-image" />

                <div className="card-badges">
                    {discountPercentage > 0 && (
                        <span className="badge badge-sale">-{discountPercentage}%</span>
                    )}
                    {product.isNew && (
                        <span className="badge badge-new">NEW</span>
                    )}
                </div>

                <div className="card-actions">
                    <button className="action-btn" onClick={(e) => {
                        e.preventDefault();
                        // Wishlist logic here
                    }}>
                        <Heart size={16} />
                    </button>
                </div>
            </div>

            <div className="card-content">
                <h3 className="card-title" title={product.name}>{product.name}</h3>
                <div className="card-category">{product.category?.name || 'Game'}</div>

                <div className="card-footer">
                    <div className="price-container">
                        {product.salePrice && product.salePrice < product.price ? (
                            <>
                                <span className="original-price">${product.price.toFixed(2)}</span>
                                <span className="current-price">${product.salePrice.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="current-price">${product.price?.toFixed(2)}</span>
                        )}
                    </div>

                    <button className="action-btn" onClick={handleAddToCart} title="Add to Cart">
                        <ShoppingCart size={16} />
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default GameCard;
