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

    const [selectedVariant, setSelectedVariant] = useState(null);

    // Set default price or selected variant price
    const currentPrice = selectedVariant ? selectedVariant.price : product.price;

    const handleAddToCart = async () => {
        if (product.variants && product.variants.length > 0 && !selectedVariant) {
            alert('Please select an account type/option');
            return;
        }

        try {
            setAdding(true);
            // Pass variant info if selected
            const variantData = selectedVariant ? { type: selectedVariant.type, price: selectedVariant.price } : null;

            // Note: addToCart needs to support variant. If not supported yet in Context, we might need to send a composite ID or modify context.
            // Assuming we modify CartContext or backend handles it. For now, let's assume we pass it as 3rd arg or optional object.
            // Since I can't modify CartContext easily right now without seeing it, 
            // I will assume standard addToCart(productId, quantity, options).
            await addToCart(id, quantity, variantData);

            alert('Added to cart!');
        } catch (err) {
            console.error('Failed to add to cart:', err);
            alert('Failed to add to cart. Please make sure you are logged in.');
        } finally {
            setAdding(false);
        }
    };

    // ... loading/error checks ...

    return (
        <>
            <Header />
            <main className="product-details-page" style={{ padding: '40px 0', minHeight: '60vh' }}>
                <div className="container">
                    {/* ... Back Button ... */}
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
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    maxHeight: '500px',
                                    display: 'block',
                                    margin: '0 auto'
                                }}
                            />
                        </div>

                        {/* Info Section */}
                        <div className="product-info">
                            <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>{product.name}</h1>

                            <div style={{ marginBottom: '24px' }}>
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                    EGP {currentPrice}
                                </span>
                                {product.discountPrice && !selectedVariant && (
                                    <span style={{ fontSize: '16px', color: 'var(--color-text-muted)', textDecoration: 'line-through', marginLeft: '12px' }}>
                                        EGP {product.discountPrice}
                                    </span>
                                )}
                            </div>

                            {/* Variants Selection */}
                            {product.variants && product.variants.length > 0 && (
                                <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                    <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>Select Option:</h3>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        {product.variants.map((variant, idx) => (
                                            <label
                                                key={idx}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '12px',
                                                    border: `1px solid ${selectedVariant === variant ? 'var(--color-cyan-primary)' : 'var(--color-border)'}`,
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    background: selectedVariant === variant ? 'rgba(0, 255, 255, 0.05)' : 'transparent'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <input
                                                        type="radio"
                                                        name="variant"
                                                        checked={selectedVariant === variant}
                                                        onChange={() => setSelectedVariant(variant)}
                                                        style={{ accentColor: 'var(--color-cyan-primary)' }}
                                                    />
                                                    <span style={{ fontWeight: 500 }}>{variant.type}</span>
                                                </div>
                                                <span style={{ fontWeight: 'bold' }}>EGP {variant.price}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

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
