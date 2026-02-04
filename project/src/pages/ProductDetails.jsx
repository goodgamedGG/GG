import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productsAPI from '../api/products';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronLeft, ChevronRight, ShoppingCart, Gamepad2, Globe, Tag, Home, Shield, Zap, CheckCircle, MessageCircle, AlertTriangle, Download, CreditCard, Clock } from 'lucide-react';
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
            <div style={{ padding: '100px 0', textAlign: 'center' }}>
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div style={{ padding: '100px 0', textAlign: 'center' }}>
                <h2>{error || 'Product not found'}</h2>
                <button onClick={() => navigate('/games')} className="btn-secondary">Back to Games</button>
            </div>
        );
    }

    // Set default price or selected variant price
    const hasDiscount = !selectedVariant && product.discountPrice && product.discountPrice < product.price;
    const currentPrice = selectedVariant ? selectedVariant.price : (product.discountPrice || product.price);
    const regularPrice = product.price;
    const mainImage = product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : 'https://placehold.co/600x400';

    return (
        <div style={{ background: 'var(--color-bg-primary)', minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
            <main className="product-details-page" style={{ padding: 'clamp(20px, 5vw, 60px) 0' }}>
                <div className="container">
                    {/* Back Button */}
                    {/* Breadcrumbs */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '30px',
                        fontSize: '0.9rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        <span onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Home size={14} /> Home
                        </span>
                        <ChevronRight size={14} />
                        <span onClick={() => navigate('/games')} style={{ cursor: 'pointer' }}>
                            {t('games')}
                        </span>
                        <ChevronRight size={14} />
                        <span style={{ color: 'var(--color-cyan-primary)', fontWeight: '600' }}>
                            {product.name}
                        </span>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(300px, 350px) 1fr', // 30/70 split roughly
                        gap: 'clamp(40px, 8vw, 80px)',
                        alignItems: 'start',
                        maxWidth: '1200px',
                        margin: '0 auto'
                    }}>
                        {/* Image Section */}
                        <div style={{
                            position: 'sticky',
                            top: '100px',
                            borderRadius: '24px',
                            // overflow: 'hidden', // Allowed for glow overlap
                            aspectRatio: '0.8', // Taller aspect ratio
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            // boxShadow: '0 0 100px rgba(0, 217, 255, 0.1)', // Moved to img for "Physicality"
                        }}>
                            <div style={{
                                position: 'absolute',
                                inset: -20, // Extended glow
                                background: 'radial-gradient(circle at center, rgba(0, 217, 255, 0.2) 0%, transparent 70%)',
                                zIndex: 0,
                                filter: 'blur(30px)'
                            }} />
                            <img
                                src={mainImage}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    aspectRatio: '2/3', // Portrait orientation
                                    objectFit: 'cover',
                                    zIndex: 1,
                                    borderRadius: '16px', // Rounded corners
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)', // Deep shadow
                                    transition: 'transform 0.4s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02) translateY(-5px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
                            />
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
                            <h1 style={{
                                marginBottom: '20px',
                                color: 'white',
                                fontFamily: '"Inter", sans-serif',
                                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                fontWeight: '800',
                                lineHeight: '1.1',
                                letterSpacing: '-0.02em'
                            }}>{product.name}</h1>

                            <div style={{
                                marginBottom: '25px',
                                color: 'var(--color-text-secondary)',
                                fontSize: '1rem',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-line'
                            }}>
                                {product.description}
                            </div>

                            {/* Attributes Row */}
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '20px',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                paddingBottom: '20px',
                                marginBottom: '25px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Gamepad2 size={18} color="var(--color-text-muted)" />
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>{product.platform}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Globe size={18} color="var(--color-text-muted)" />
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>{product.region}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Tag size={18} color="var(--color-text-muted)" />
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>{product.type}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: product.stock > 0 ? '#00ff88' : '#ff4757',
                                        boxShadow: product.stock > 0 ? '0 0 10px #00ff88' : 'none'
                                    }} />
                                    <span style={{ color: product.stock > 0 ? '#00ff88' : '#ff4757', fontSize: '0.95rem', fontWeight: '600' }}>
                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '35px' }}>
                                <span style={{
                                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                                    fontWeight: '800',
                                    color: 'white'
                                }}>
                                    EGP {parseFloat(currentPrice).toFixed(2)}
                                </span>
                                {hasDiscount && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                        <div style={{
                                            background: '#ff4757',
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                        }}>
                                            -{Math.round(((regularPrice - currentPrice) / regularPrice) * 100)}%
                                        </div>
                                        <span style={{
                                            fontSize: '1rem',
                                            color: 'var(--color-text-muted)',
                                            textDecoration: 'line-through',
                                            opacity: 0.7
                                        }}>
                                            EGP {parseFloat(regularPrice).toFixed(2)}
                                        </span>
                                    </div>
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
                                    style={{
                                        flex: 1,
                                        minWidth: '200px',
                                        height: '60px',
                                        fontSize: '1.1rem',
                                        margin: 0,
                                        width: '100%',
                                        justifyContent: 'center',
                                        background: 'var(--color-cyan-primary)',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: '800',
                                        cursor: adding || product.stock <= 0 ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        opacity: adding || product.stock <= 0 ? 0.7 : 1,
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={handleAddToCart}
                                    disabled={adding || product.stock <= 0}
                                    onMouseOver={(e) => !adding && product.stock > 0 && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                    onMouseOut={(e) => !adding && product.stock > 0 && (e.currentTarget.style.transform = 'translateY(0)')}
                                >
                                    <ShoppingCart size={22} style={{ marginRight: isRTL ? 0 : '10px', marginLeft: isRTL ? '10px' : 0 }} />
                                    {adding ? t('adding') : product.stock <= 0 ? t('outOfStock') : t('addToCart')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


            </main>
        </div>
    );
};

export default ProductDetails;
