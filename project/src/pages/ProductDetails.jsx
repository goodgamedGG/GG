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

    // Image Loading State for Skeleton
    const [imageLoaded, setImageLoaded] = useState(false);

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
                        gridTemplateColumns: 'repeat(12, 1fr)', // 12-column grid
                        gap: '40px',
                        alignItems: 'start',
                        maxWidth: '1280px', // Restrict max width
                        margin: '0 auto'
                    }}>
                        {/* Image Section (4 Columns) */}
                        <div style={{
                            gridColumn: 'span 4',
                            position: 'sticky',
                            top: '100px',
                            zIndex: 10
                        }}>
                            {/* Skeleton Loader */}
                            {!imageLoaded && (
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '3/4',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                                    backgroundSize: '200% 100%',
                                    animation: 'pulse 1.5s infinite'
                                }} />
                            )}

                            <div style={{
                                position: 'relative',
                                display: imageLoaded ? 'block' : 'none',
                                transformStyle: 'preserve-3d',
                                perspective: '1000px'
                            }}>
                                {/* Ambient Glow */}
                                <div style={{
                                    position: 'absolute',
                                    inset: '10px',
                                    background: `url(${mainImage}) center/cover no-repeat`,
                                    filter: 'blur(40px)',
                                    opacity: 0.5,
                                    zIndex: -1,
                                    transform: 'translateY(20px) scale(0.9)'
                                }} />

                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    onLoad={() => setImageLoaded(true)}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        aspectRatio: '3/4', // Strict Portrait Ratio
                                        objectFit: 'cover',
                                        borderRadius: '12px',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05) translateY(-10px)';
                                        e.currentTarget.style.boxShadow = '0 30px 60px -15px rgba(0, 217, 255, 0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.6)';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Info Section (8 Columns) */}
                        <div style={{
                            gridColumn: 'span 8',
                            padding: '40px',
                            background: 'rgba(22, 22, 24, 0.6)', // Elevated Dark
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '24px',
                            backdropFilter: 'blur(16px)', // Glassmorphism
                            boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.2)'
                        }}>

                            {/* Title */}
                            <h1 style={{
                                marginBottom: '16px',
                                color: '#fff',
                                fontFamily: '"Rajdhani", sans-serif', // Gamer Font
                                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                fontWeight: '700',
                                lineHeight: '1.1',
                                letterSpacing: '0.02em',
                                textTransform: 'uppercase'
                            }}>{product.name}</h1>

                            {/* Description */}
                            <div style={{
                                marginBottom: '32px',
                                color: '#a1a1aa', // Zinc-400
                                fontSize: '1.05rem',
                                lineHeight: '1.7',
                                fontFamily: '"Inter", sans-serif',
                                maxWidth: '90%'
                            }}>
                                {product.description}
                            </div>

                            {/* Consolidated Metadata (Pills) */}
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '12px',
                                marginBottom: '40px',
                                paddingBottom: '30px',
                                borderBottom: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                {[
                                    { icon: Gamepad2, label: product.platform },
                                    { icon: Globe, label: product.region },
                                    { icon: Tag, label: product.type },
                                    { icon: product.stock > 0 ? CheckCircle : AlertTriangle, label: product.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK', color: product.stock > 0 ? '#10b981' : '#ef4444' }
                                ].map((meta, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        borderRadius: '100px', // Pill shape
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                        color: meta.color || '#e4e4e7',
                                        fontFamily: '"Inter", sans-serif'
                                    }}>
                                        <meta.icon size={14} color={meta.color || '#a1a1aa'} />
                                        {meta.label}
                                    </div>
                                ))}
                            </div>

                            {/* Price & Actions Row */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '30px'
                            }}>

                                {/* Pricing Block */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <span style={{
                                        fontSize: '3rem',
                                        fontWeight: '700',
                                        color: '#fff',
                                        fontFamily: '"Inter", sans-serif',
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {/* Small currency symbol */}
                                        <span style={{ fontSize: '1.5rem', verticalAlign: 'top', marginRight: '4px', opacity: 0.8 }}>EGP</span>
                                        {parseFloat(currentPrice).toFixed(2)}
                                    </span>

                                    {hasDiscount && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{
                                                background: '#ef4444',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '800',
                                                lineHeight: 1
                                            }}>
                                                SAVE {Math.round(((regularPrice - currentPrice) / regularPrice) * 100)}%
                                            </div>
                                            <span style={{
                                                fontSize: '1rem',
                                                color: '#71717a',
                                                textDecoration: 'line-through',
                                                fontFamily: '"Inter", sans-serif'
                                            }}>
                                                {parseFloat(regularPrice).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Block */}
                                <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '300px', justifyContent: 'flex-end' }}>

                                    {/* Quantity */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: 'rgba(0,0,0,0.2)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        height: '56px'
                                    }}>
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            style={{ width: '48px', height: '100%', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', transition: 'color 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-cyan-primary)'}
                                            onMouseOut={(e) => e.currentTarget.style.color = '#fff'}
                                        >
                                            -
                                        </button>
                                        <span style={{ width: '40px', textAlign: 'center', fontSize: '1.1rem', fontWeight: '600', fontFamily: '"Inter", sans-serif' }}>{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                                            style={{ width: '48px', height: '100%', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', transition: 'color 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-cyan-primary)'}
                                            onMouseOut={(e) => e.currentTarget.style.color = '#fff'}
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Power CTA */}
                                    <button
                                        style={{
                                            flex: 1,
                                            height: '56px',
                                            background: 'var(--color-cyan-primary)', // Cyan
                                            color: '#000', // Black text
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '1.1rem',
                                            fontWeight: '800',
                                            fontFamily: '"Rajdhani", sans-serif',
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase',
                                            cursor: adding || product.stock <= 0 ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)', // Glow
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            opacity: adding || product.stock <= 0 ? 0.6 : 1
                                        }}
                                        onClick={handleAddToCart}
                                        disabled={adding || product.stock <= 0}
                                        onMouseOver={(e) => {
                                            if (!adding && product.stock > 0) {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.filter = 'brightness(1.1)';
                                                e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 217, 255, 0.6)';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!adding && product.stock > 0) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.filter = 'brightness(1)';
                                                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.4)';
                                            }
                                        }}
                                    >
                                        <ShoppingCart size={20} strokeWidth={2.5} />
                                        {adding ? t('adding') : product.stock <= 0 ? t('outOfStock') : t('addToCart')}
                                    </button>
                                </div>
                            </div>

                            {/* Variant Selector (If exists) - Refined */}
                            {product.variants && product.variants.length > 0 && (
                                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                    <h3 style={{ fontSize: '0.85rem', marginBottom: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"Inter", sans-serif', fontWeight: '600' }}>
                                        {t('selectOption')}
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                        {product.variants.map((variant, idx) => (
                                            <label
                                                key={idx}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '12px 16px',
                                                    background: selectedVariant === variant ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${selectedVariant === variant ? 'var(--color-cyan-primary)' : 'rgba(255,255,255,0.1)'}`,
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    transform: selectedVariant === variant ? 'scale(1.02)' : 'scale(1)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <input
                                                        type="radio"
                                                        name="variant"
                                                        checked={selectedVariant === variant}
                                                        onChange={() => setSelectedVariant(variant)}
                                                        style={{ accentColor: 'var(--color-cyan-primary)' }}
                                                    />
                                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: selectedVariant === variant ? '#fff' : '#d4d4d8', fontFamily: '"Inter", sans-serif' }}>
                                                        {variant.type}
                                                    </span>
                                                </div>
                                                <span style={{ fontWeight: '700', color: selectedVariant === variant ? 'var(--color-cyan-primary)' : '#fff', fontFamily: '"Inter", sans-serif' }}>
                                                    {variant.price}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


            </main>
        </div>
    );
};

export default ProductDetails;
