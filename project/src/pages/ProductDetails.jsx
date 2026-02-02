import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productsAPI from '../api/products';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

import { getImageUrl } from '../utils/imageUtils';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { t, isRTL } = useLanguage();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adding, setAdding] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);

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
        if (product.variants && product.variants.length > 0 && !selectedVariant) {
            alert('Please select an account type/option');
            return;
        }

        try {
            setAdding(true);
            const variantData = selectedVariant ? { type: selectedVariant.type, price: selectedVariant.price } : null;
            await addToCart(id, quantity, variantData);
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
                <div style={{ padding: '100px 0', textAlign: 'center' }}>
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
                <div style={{ padding: '100px 0', textAlign: 'center' }}>
                    <h2>{error || 'Product not found'}</h2>
                    <button onClick={() => navigate('/games')} className="btn-secondary">Back to Games</button>
                </div>
                <Footer />
            </>
        );
    }

    // Set default price or selected variant price
    const hasDiscount = !selectedVariant && product.discountPrice && product.discountPrice < product.price;
    const currentPrice = selectedVariant ? selectedVariant.price : (product.discountPrice || product.price);
    const regularPrice = product.price;
    const mainImage = product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : 'https://placehold.co/600x400';

    return (
        <div style={{ background: 'var(--color-bg-primary)', minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
            <Header />
            <main className="product-details-page" style={{ padding: 'clamp(20px, 5vw, 60px) 0' }}>
                <div className="container">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'var(--color-text-primary)',
                            cursor: 'pointer',
                            marginBottom: '30px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    >
                        {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        {t('back')}
                    </button>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
                        gap: 'clamp(30px, 6vw, 60px)',
                        alignItems: 'start'
                    }}>
                        {/* Image Section */}
                        <div style={{
                            position: 'sticky',
                            top: '100px',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            aspectRatio: '1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(5px)'
                        }}>
                            <img
                                src={mainImage}
                                alt={product.name}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 0 30px rgba(0, 217, 255, 0.2))'
                                }}
                            />
                            {hasDiscount && (
                                <div style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: isRTL ? 'auto' : '20px',
                                    left: isRTL ? '20px' : 'auto',
                                    background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: '800',
                                    boxShadow: '0 4px 15px rgba(255, 71, 87, 0.4)',
                                    zIndex: 2
                                }}>
                                    -{Math.round(((regularPrice - currentPrice) / regularPrice) * 100)}%
                                </div>
                            )}
                        </div>

                        {/* Info Section */}
                        <div style={{
                            padding: 'clamp(20px, 5vw, 40px)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '32px',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}>
                            <h1 className="text-responsive-h1" style={{ marginBottom: '10px', color: 'white' }}>{product.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                                <span style={{
                                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                                    fontWeight: '900',
                                    color: 'var(--color-cyan-primary)',
                                    textShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
                                }}>
                                    {t('egp')} {currentPrice}
                                </span>
                                {hasDiscount && (
                                    <span style={{
                                        fontSize: '1.2rem',
                                        color: 'var(--color-text-muted)',
                                        textDecoration: 'line-through',
                                        opacity: 0.6
                                    }}>
                                        {t('egp')} {regularPrice}
                                    </span>
                                )}
                            </div>

                            {/* Variants Selection */}
                            {product.variants && product.variants.length > 0 && (
                                <div style={{ marginBottom: '40px' }}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {t('selectOption')}
                                    </h3>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {product.variants.map((variant, idx) => (
                                            <label
                                                key={idx}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '16px 20px',
                                                    border: `2px solid ${selectedVariant === variant ? 'var(--color-cyan-primary)' : 'rgba(255,255,255,0.05)'}`,
                                                    borderRadius: '16px',
                                                    cursor: 'pointer',
                                                    background: selectedVariant === variant ? 'rgba(0, 217, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    transform: selectedVariant === variant ? 'scale(1.02)' : 'scale(1)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        border: `2px solid ${selectedVariant === variant ? 'var(--color-cyan-primary)' : 'var(--color-text-muted)'}`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.3s'
                                                    }}>
                                                        {selectedVariant === variant && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-cyan-primary)' }} />}
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="variant"
                                                        checked={selectedVariant === variant}
                                                        onChange={() => setSelectedVariant(variant)}
                                                        style={{ display: 'none' }}
                                                    />
                                                    <span style={{ fontWeight: 600, fontSize: '1.05rem', color: selectedVariant === variant ? 'white' : 'var(--color-text-secondary)' }}>
                                                        {variant.type}
                                                    </span>
                                                </div>
                                                <span style={{ fontWeight: '800', color: selectedVariant === variant ? 'var(--color-cyan-primary)' : 'white' }}>
                                                    {t('egp')} {variant.price}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{
                                marginBottom: '40px',
                                color: 'var(--color-text-secondary)',
                                fontSize: '1.1rem',
                                lineHeight: '1.8',
                                background: 'rgba(0,0,0,0.2)',
                                padding: '20px',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.03)'
                            }}>
                                {product.description}
                            </div>

                            {/* Meta Info Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: '20px',
                                marginBottom: '40px'
                            }}>
                                {[
                                    { label: t('platform'), value: product.platform },
                                    { label: t('region'), value: product.region },
                                    { label: t('type'), value: product.type },
                                    { label: t('stock'), value: product.stock > 0 ? t('inStock') : t('outOfStock'), color: product.stock > 0 ? '#00ff88' : '#ff4757' }
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        padding: '15px',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>{item.label}</div>
                                        <div style={{ fontWeight: '700', color: item.color || 'white' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Area */}
                            <div style={{
                                display: 'flex',
                                gap: '20px',
                                alignItems: 'center',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '16px',
                                    padding: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', transition: 'all 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    >
                                        -
                                    </button>
                                    <span style={{ width: '40px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                                        style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', transition: 'all 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    className="cta-btn"
                                    style={{
                                        flex: 1,
                                        minWidth: '200px',
                                        height: '60px',
                                        fontSize: '1.1rem',
                                        margin: 0,
                                        width: '100%',
                                        justifyContent: 'center'
                                    }}
                                    onClick={handleAddToCart}
                                    disabled={adding || product.stock <= 0}
                                >
                                    <ShoppingCart size={22} style={{ marginRight: isRTL ? 0 : '10px', marginLeft: isRTL ? '10px' : 0 }} />
                                    {adding ? t('adding') : product.stock <= 0 ? t('outOfStock') : t('addToCart')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProductDetails;
