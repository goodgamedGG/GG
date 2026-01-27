import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productsAPI from '../api/products';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adding, setAdding] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productsAPI.getProductById(id);
                setProduct(data);
            } catch (err) {
                console.error('Failed to load product:', err);
                setError('Product not found or failed to load.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleAddToCart = async () => {
        try {
            setAdding(true);
            await addToCart(id, quantity);
            alert('Added to cart!');
        } catch (err) {
            console.error('Failed to add to cart:', err);
            alert('Failed to add to cart. Please make sure you are logged in.');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <LoadingSpinner />
                </div>
                <Footer />
            </>
        );
    }

    if (error || !product) {
        return (
            <>
                <Header />
                <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
                    <h2>{error || 'Product not found'}</h2>
                    <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
                        Back to Home
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    // Determine relevant image to show (first one or placeholder)
    const mainImage = product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder-game.jpg';

    return (
        <>
            <Header />
            <main className="product-details-page" style={{ padding: '40px 0', minHeight: '60vh' }}>
                <div className="container">
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        ← Back
                    </button>

                    <div className="product-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        {/* Image Section */}
                        <div className="product-image-container" style={{ borderRadius: '12px', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}>
                            <img
                                src={mainImage}
                                alt={product.name}
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>

                        {/* Info Section */}
                        <div className="product-info">
                            <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>{product.name}</h1>

                            <div style={{ marginBottom: '24px' }}>
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                    EGP {product.price}
                                </span>
                                {product.discountPrice && (
                                    <span style={{ fontSize: '16px', color: 'var(--color-text-muted)', textDecoration: 'line-through', marginLeft: '12px' }}>
                                        EGP {product.discountPrice}
                                    </span>
                                )}
                            </div>

                            <div style={{ marginBottom: '32px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                {product.description}
                            </div>

                            {/* Meta Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px', fontSize: '14px' }}>
                                <div>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Platform:</span> {product.platform || 'N/A'}
                                </div>
                                <div>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Region:</span> {product.region || 'Global'}
                                </div>
                                <div>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Type:</span> {product.type || 'Game'}
                                </div>
                                <div>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Stock:</span>
                                    <span style={{ color: product.stock > 0 ? 'var(--color-success)' : 'var(--color-danger)', marginLeft: '4px' }}>
                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '4px' }}>
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                                    >
                                        -
                                    </button>
                                    <span style={{ width: '32px', textAlign: 'center' }}>{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, padding: '12px' }}
                                    onClick={handleAddToCart}
                                    disabled={adding || product.stock <= 0}
                                >
                                    {adding ? 'Adding...' : product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ProductDetails;
