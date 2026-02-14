import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import { Package, Plus, Search, Edit2, Trash2, Filter, TrendingUp, TrendingDown, DollarSign, Archive } from 'lucide-react';
import Pagination from '../../components/Pagination.jsx';
import { getImageUrl } from '../../utils/imageUtils';
import ProductFormModal from '../../components/admin/ProductFormModal';
import BulkActionsToolbar from '../../components/admin/BulkActionsToolbar';
import EmptyState from '../../components/EmptyState';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Categories
    const [categories, setCategories] = useState([]);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Bulk Selection
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        totalValue: 0
    });

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchTerm, selectedCategory, selectedStatus, sortBy]);

    useEffect(() => {
        calculateStats();
    }, [products]);

    const fetchCategories = async () => {
        try {
            const data = await adminAPI.getCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getProducts(currentPage, ITEMS_PER_PAGE, searchTerm);

            let fetchedProducts = [];
            if (response.products) {
                fetchedProducts = response.products;
                setTotalPages(response.pages);
                setTotalProducts(response.total);
            } else if (response.data && response.data.products) {
                fetchedProducts = response.data.products;
                setTotalPages(response.data.pages);
                setTotalProducts(response.data.total);
            }

            // Apply client-side filters
            let filtered = fetchedProducts;

            // Filter by category
            if (selectedCategory) {
                filtered = filtered.filter(p => {
                    const catId = p.category?._id || p.category;
                    return catId === selectedCategory;
                });
            }

            // Filter by status
            if (selectedStatus !== 'all') {
                filtered = filtered.filter(p =>
                    selectedStatus === 'active' ? p.isActive : !p.isActive
                );
            }

            // Filter by price range
            if (priceMin !== '') {
                filtered = filtered.filter(p => p.price >= parseFloat(priceMin));
            }
            if (priceMax !== '') {
                filtered = filtered.filter(p => p.price <= parseFloat(priceMax));
            }

            // Sort products
            filtered = sortProducts(filtered, sortBy);

            setProducts(filtered);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortProducts = (productsList, sortOrder) => {
        const sorted = [...productsList];
        switch (sortOrder) {
            case 'newest':
                return sorted.reverse();
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            default:
                return sorted;
        }
    };

    const calculateStats = () => {
        const active = products.filter(p => p.isActive).length;
        const inactive = products.filter(p => !p.isActive).length;
        const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

        setStats({
            total: totalProducts || products.length,
            active,
            inactive,
            totalValue
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await adminAPI.deleteProduct(id);
                setProducts(products.filter(p => p._id !== id));
                setSelectedProducts(selectedProducts.filter(pid => pid !== id));
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
            try {
                await Promise.all(selectedProducts.map(id => adminAPI.deleteProduct(id)));
                setProducts(products.filter(p => !selectedProducts.includes(p._id)));
                setSelectedProducts([]);
            } catch (error) {
                console.error('Error deleting products:', error);
                alert('Failed to delete some products');
            }
        }
    };

    const handleBulkStatusChange = async (isActive) => {
        try {
            await Promise.all(
                selectedProducts.map(id =>
                    adminAPI.updateProduct(id, { isActive })
                )
            );
            setProducts(products.map(p =>
                selectedProducts.includes(p._id) ? { ...p, isActive } : p
            ));
            setSelectedProducts([]);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleBulkCategoryChange = async (categoryId) => {
        try {
            await Promise.all(
                selectedProducts.map(id =>
                    adminAPI.updateProduct(id, { category: categoryId })
                )
            );
            fetchProducts(); // Refresh to get updated category data
            setSelectedProducts([]);
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Failed to update category');
        }
    };

    const toggleSelectProduct = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id)
                ? prev.filter(pid => pid !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p._id));
        }
    };

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const formatCompactNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div>
            {/* Hero Section with Stats */}
            <div style={{ marginBottom: '32px' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{
                        fontSize: 'clamp(28px, 4vw, 36px)',
                        fontWeight: '700',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'Orbitron, sans-serif',
                        marginBottom: 'var(--spacing-xs)'
                    }}>
                        Products
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--spacing-lg)'
                    }}>
                        Manage, monitor and update your store products easily.
                    </p>
                    <button
                        onClick={handleOpenAddModal}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'linear-gradient(135deg, #00d9ff 0%, #00a8cc 100%)',
                            color: '#0a0f14',
                            padding: '14px 28px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 20px rgba(0, 217, 255, 0.4)',
                            fontSize: '15px',
                            letterSpacing: '0.3px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 217, 255, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 217, 255, 0.4)';
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px) scale(0.98)';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                        }}
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        Add Product
                    </button>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    <div className="stats-card">
                        <div className="stats-icon" style={{ background: 'rgba(0, 217, 255, 0.1)' }}>
                            <Package size={24} color="var(--color-primary)" />
                        </div>
                        <div className="stats-content">
                            <div className="stats-label">Total Products</div>
                            <div className="stats-value">{stats.total}</div>
                        </div>
                    </div>

                    <div className="stats-card">
                        <div className="stats-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <TrendingUp size={24} color="var(--color-success)" />
                        </div>
                        <div className="stats-content">
                            <div className="stats-label">Active Products</div>
                            <div className="stats-value">{stats.active}</div>
                        </div>
                    </div>

                    <div className="stats-card">
                        <div className="stats-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                            <TrendingDown size={24} color="var(--color-danger)" />
                        </div>
                        <div className="stats-content">
                            <div className="stats-label">Inactive Products</div>
                            <div className="stats-value">{stats.inactive}</div>
                        </div>
                    </div>


                </div>
            </div>

            {/* Advanced Filters */}
            <div className="admin-card" style={{ marginBottom: '32px', padding: '24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    alignItems: 'end'
                }}>
                    {/* Search */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '6px'
                        }}>
                            Search Products
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)'
                            }} />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 42px',
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '6px'
                        }}>
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '6px'
                        }}>
                            Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Price Min */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '6px'
                        }}>
                            Min Price
                        </label>
                        <input
                            type="number"
                            placeholder="$0"
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Price Max */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '6px'
                        }}>
                            Max Price
                        </label>
                        <input
                            type="number"
                            placeholder="$999"
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Sort */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '6px'
                        }}>
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Default</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="price-asc">Price (Low to High)</option>
                            <option value="price-desc">Price (High to Low)</option>
                            <option value="stock-asc">Stock (Low to High)</option>
                            <option value="stock-desc">Stock (High to Low)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="admin-card">
                <div className="card-header">
                    <div className="card-title">
                        <Package size={20} color="var(--color-primary)" />
                        <span>Product List</span>
                        <span style={{
                            fontSize: '12px',
                            background: 'var(--color-bg-secondary)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            color: 'var(--color-text-secondary)',
                            marginLeft: '8px'
                        }}>
                            {products.length} items
                        </span>
                    </div>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                        </div>
                    ) : products.length === 0 ? (
                        <EmptyState
                            icon={Archive}
                            title="No products found"
                            message="No products match your current filters. Try adjusting your search criteria or add your first product."
                            actionLabel="Add Product"
                            onAction={handleOpenAddModal}
                        />
                    ) : (
                        <table className="data-table enhanced-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.length === products.length}
                                            onChange={toggleSelectAll}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </th>
                                    <th style={{ width: '80px' }}>Image</th>
                                    <th>Product Details</th>
                                    <th style={{ width: '120px' }}>Category</th>
                                    <th style={{ width: '150px' }}>Attributes</th>
                                    <th style={{ width: '140px' }}>Performance</th>
                                    <th style={{ width: '150px' }}>Price & Stock</th>
                                    <th style={{ width: '100px' }}>Status</th>
                                    <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <tr key={product._id} style={{ animationDelay: `${index * 50}ms` }}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product._id)}
                                                onChange={() => toggleSelectProduct(product._id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td>
                                            <img
                                                src={getImageUrl(product.images?.[0] || product.image)}
                                                alt={product.name}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    objectFit: 'cover',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '1px solid var(--color-border)'
                                                }}
                                                onError={(e) => { e.target.src = 'https://placehold.co/60x60/1a212c/64748b?text=No+Image'; }}
                                            />
                                        </td>
                                        <td className="col-primary">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <div style={{ fontWeight: '600', fontSize: '15px' }}>{product.name}</div>
                                                {product.isFeatured && (
                                                    <span style={{
                                                        background: 'rgba(250, 204, 21, 0.1)',
                                                        color: '#facc15',
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid rgba(250, 204, 21, 0.2)',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase'
                                                    }}>Featured</span>
                                                )}
                                                {product.isFlashSale && (
                                                    <span style={{
                                                        background: 'rgba(244, 63, 94, 0.1)',
                                                        color: '#f43f5e',
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid rgba(244, 63, 94, 0.2)',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase'
                                                    }}>Flash Sale</span>
                                                )}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: 'var(--color-text-muted)',
                                                marginBottom: '6px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '300px'
                                            }}>
                                                {product.description || 'No description'}
                                            </div>
                                            {product.tags && product.tags.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {product.tags.map((tag, i) => (
                                                        <span key={i} style={{
                                                            fontSize: '10px',
                                                            color: 'var(--color-text-secondary)',
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            padding: '1px 5px',
                                                            borderRadius: '3px',
                                                            border: '1px solid var(--color-border)'
                                                        }}>#{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                background: 'var(--color-bg-secondary)',
                                                padding: '6px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                color: 'var(--color-text-primary)',
                                                fontWeight: '500',
                                                border: '1px solid var(--color-border)'
                                            }}>
                                                {product.category?.name || product.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <span style={{ color: 'var(--color-text-muted)', width: '60px' }}>Type:</span>
                                                    <span style={{ color: 'var(--color-text-secondary)' }}>{product.type}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <span style={{ color: 'var(--color-text-muted)', width: '60px' }}>Platform:</span>
                                                    <span style={{ color: 'var(--color-text-secondary)' }}>{product.platform}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <span style={{ color: 'var(--color-text-muted)', width: '60px' }}>Region:</span>
                                                    <span style={{ color: 'var(--color-text-secondary)' }}>{product.region}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ color: '#facc15', display: 'flex' }}>★</span>
                                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{product.averageRating?.toFixed(1) || '0.0'}</span>
                                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>({product.totalReviews || 0})</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>
                                                        <span style={{ fontSize: '10px' }}>👁</span>
                                                        <span>{product.viewCount || 0}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>
                                                        <span style={{ fontSize: '10px' }}>🛒</span>
                                                        <span>{product.purchaseCount || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '16px', fontFamily: 'Orbitron, sans-serif' }}>
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    {product.discountPrice > 0 && (
                                                        <span style={{
                                                            fontSize: '11px',
                                                            color: 'var(--color-bg-secondary)',
                                                            background: 'var(--color-success)',
                                                            padding: '1px 5px',
                                                            borderRadius: '4px',
                                                            fontWeight: '700'
                                                        }}>
                                                            -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    {product.discountPrice > 0 && (
                                                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                                                            {formatPrice(product.price)}
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        color: product.stock < 10 ? 'var(--color-warning)' : 'var(--color-success)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <div style={{
                                                            width: '6px',
                                                            height: '6px',
                                                            borderRadius: '50%',
                                                            background: product.stock < 10 ? 'var(--color-warning)' : 'var(--color-success)'
                                                        }}></div>
                                                        Stock: {product.stock}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${product.isActive ? 'status-active' : 'status-inactive'}`} style={{
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleOpenEditModal(product)}
                                                    className="action-btn"
                                                    title="Edit Product"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="action-btn delete"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)' }}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Product Form Modal */}
            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                }}
                product={editingProduct}
                onSuccess={fetchProducts}
            />

            {/* Bulk Actions Toolbar */}
            <BulkActionsToolbar
                selectedCount={selectedProducts.length}
                onClearSelection={() => setSelectedProducts([])}
                onBulkDelete={handleBulkDelete}
                onBulkStatusChange={handleBulkStatusChange}
                onBulkCategoryChange={handleBulkCategoryChange}
                categories={categories}
            />
        </div>
    );
};

export default Products;
