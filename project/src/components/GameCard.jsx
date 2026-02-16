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

    const discountPercentage = product.price && product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const isFlashSale = product.isFlashSale && product.flashSaleEndsAt && new Date(product.flashSaleEndsAt) > new Date();

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
                    position: relative;
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
                    z-index: 2;
                }

                .badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .badge-sale {
                    background: #ff4444;
                    color: white;
                    box-shadow: 0 0 10px rgba(255, 68, 68, 0.3);
                }

                .badge-flash {
                    background: #ffc800;
                    color: black;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    box-shadow: 0 0 15px rgba(255, 200, 0, 0.4);
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
                    z-index: 2;
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
                    font-size: 15px;
                    color: var(--color-text-primary);
                    margin: 0 0 6px 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    line-height: 1.4;
                }

                .card-category {
                    font-size: 11px;
                    color: var(--color-text-muted);
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
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
                    font-size: 11px;
                    color: var(--color-text-muted);
                    text-decoration: line-through;
                    margin-bottom: -2px;
                }

                .current-price {
                    font-size: 18px;
                    font-weight: 800;
                    color: var(--color-cyan-primary);
                    font-family: 'Rajdhani', sans-serif;
                }

                .flash-timer {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(255, 200, 0, 0.2), #ffc800);
                    color: black;
                    padding: 8px;
                    font-size: 11px;
                    font-weight: 800;
                    text-align: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .game-card:hover .flash-timer {
                    opacity: 1;
                }
            `}</style>

            <div className="card-image-container">
                <img src={image} alt={product.name} className="card-image" />

                <div className="card-badges">
                    {isFlashSale && (
                        <span className="badge badge-flash">⚡ FLASH</span>
                    )}
                    {discountPercentage > 0 && !isFlashSale && (
                        <span className="badge badge-sale">-{discountPercentage}%</span>
                    )}
                    {product.isNew && (
                        <span className="badge badge-new">NEW</span>
                    )}
                </div>

                <div className="card-actions">
                    <button className="action-btn" onClick={(e) => {
                        e.preventDefault();
                    }}>
                        <Heart size={16} />
                    </button>
                    <button className="action-btn" onClick={handleAddToCart} title="Add to Cart">
                        <ShoppingCart size={16} />
                    </button>
                </div>

                {isFlashSale && (
                    <div className="flash-timer">
                        ENDS SOON
                    </div>
                )}
            </div>

            <div className="card-content">
                <h3 className="card-title" title={product.name}>{product.name}</h3>
                <div className="card-category">{product.category?.name || 'Game'}</div>

                <div className="card-footer">
                    <div className="price-container">
                        {product.discountPrice && product.discountPrice < product.price ? (
                            <>
                                <span className="original-price">${product.price.toFixed(2)}</span>
                                <span className="current-price" style={{ color: isFlashSale ? '#ffc800' : 'var(--color-cyan-primary)' }}>
                                    ${product.discountPrice.toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <span className="current-price">${product.price?.toFixed(2)}</span>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={12} fill="var(--color-cyan-primary)" color="var(--color-cyan-primary)" />
                        <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{product.averageRating || '5.0'}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default GameCard;
