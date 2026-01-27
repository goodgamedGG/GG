import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Save, Eye, EyeOff, Star, Filter, BarChart3, Tag as TagIcon, CheckSquare } from 'lucide-react';
import adminAPI from '../../api/admin';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productStats, setProductStats] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingTagsProduct, setEditingTagsProduct] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        category: '',
        type: '',
        platform: '',
        region: '',
        isActive: '',
        isFlashSale: '',
        isFeatured: '',
        minPrice: '',
        maxPrice: '',
        minStock: '',
        search: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        type: 'game',
        platform: '',
        region: '',
        stock: '',
        image: null
    });
    const [tagsData, setTagsData] = useState([]);
    const [bulkUpdates, setBulkUpdates] = useState({
        isActive: '',
        isFeatured: ''
    });

    useEffect(() => {
        loadData();
        loadCategories();
    }, [page, filters]);

    const loadData = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 20, ...filters };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });
            const response = await adminAPI.getAdminProducts(params);
            setProducts(response?.data?.products || []);
            setTotalPages(response?.data?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load products:', error);
            // Fallback to basic endpoint
            try {
                const response = await adminAPI.getProducts(page, 20);
                setProducts(response?.products || []);
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await adminAPI.getCategories();
            setCategories(response?.categories || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadProductStats = async () => {
        try {
            const response = await adminAPI.getProductStats();
            setProductStats(response?.data);
            setIsStatsModalOpen(true);
        } catch (error) {
            alert('Failed to load statistics: ' + error.message);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            discountPrice: product.discountPrice || '',
            category: product.category?._id || product.category || '',
            type: product.type || 'game',
            platform: product.platform || '',
            region: product.region || '',
            stock: product.stock || '',
            image: null,
            variants: []
        });

        // ... existing loadData ...

        const handleEdit = (product) => {
            setEditingProduct(product);
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                discountPrice: product.discountPrice || '',
                category: product.category?._id || product.category || '',
                type: product.type || 'game',
                platform: product.platform || '',
                region: product.region || '',
                stock: product.stock || '',
                image: null,
                variants: product.variants || []
            });
            setIsModalOpen(true);
        };

        const handleAdd = () => {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                discountPrice: '',
                category: '',
                type: 'game',
                platform: '',
                region: '',
                stock: '100',
                image: null,
                variants: []
            });
            setIsModalOpen(true);
        };

        // ... existing handlers ...

        const handleVariantChange = (index, key, value) => {
            const newVariants = [...formData.variants];
            newVariants[index][key] = value;
            setFormData({ ...formData, variants: newVariants });
        };

        const addVariant = () => {
            setFormData({
                ...formData,
                variants: [...formData.variants, { type: '', price: '', stock: 1 }]
            });
        };

        const removeVariant = (index) => {
            const newVariants = formData.variants.filter((_, i) => i !== index);
            setFormData({ ...formData, variants: newVariants });
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const data = new FormData();
                Object.keys(formData).forEach(key => {
                    if (key === 'variants') {
                        if (formData.variants.length > 0) {
                            data.append('variants', JSON.stringify(formData.variants));
                        }
                    } else if (formData[key] !== null && formData[key] !== '') {
                        const fieldName = key === 'image' ? 'images' : key;
                        data.append(fieldName, formData[key]);
                    }
                });

                if (editingProduct) {
                    await adminAPI.updateProduct(editingProduct._id, data);
                } else {
                    await adminAPI.createProduct(data);
                }
                setIsModalOpen(false);
                loadData();
            } catch (error) {
                alert('Failed to save product: ' + error.message);
            }
        };

        const handleImageChange = (e) => {
            if (e.target.files[0]) {
                setFormData({ ...formData, image: e.target.files[0] });
            }
        };

        const handleFilterChange = (key, value) => {
            setFilters({ ...filters, [key]: value });
            setPage(1);
        };

        const clearFilters = () => {
            setFilters({
                category: '',
                type: '',
                platform: '',
                region: '',
                isActive: '',
                isFlashSale: '',
                isFeatured: '',
                minPrice: '',
                maxPrice: '',
                minStock: '',
                search: ''
            });
            setPage(1);
        };

        const toggleProductSelection = (productId) => {
            if (selectedProducts.includes(productId)) {
                setSelectedProducts(selectedProducts.filter(id => id !== productId));
            } else {
                setSelectedProducts([...selectedProducts, productId]);
            }
        };

        const toggleSelectAll = () => {
            if (selectedProducts.length === products.length) {
                setSelectedProducts([]);
            } else {
                setSelectedProducts(products.map(p => p._id));
            }
        };

        return (
            <div>
                <header className="admin-header">
                    <div>
                        <h1 className="page-title">Products</h1>
                        <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            {products.length} products displayed
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={loadProductStats} className="btn-secondary">
                            <BarChart3 size={18} />
                            Statistics
                        </button>
                        {selectedProducts.length > 0 && (
                            <button onClick={() => setIsBulkModalOpen(true)} className="btn-secondary">
                                <CheckSquare size={18} />
                                Bulk Actions ({selectedProducts.length})
                            </button>
                        )}
                        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary">
                            <Filter size={18} />
                            Filters
                        </button>
                        <button onClick={handleAdd} className="btn-primary">
                            <Plus size={18} />
                            Add Product
                        </button>
                    </div>
                </header>

                {/* Filters Panel */}
                {showFilters && (
                    <div style={{
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Search</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search products..."
                                    value={filters.search}
                                    onChange={e => handleFilterChange('search', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Category</label>
                                <select
                                    className="form-select"
                                    value={filters.category}
                                    onChange={e => handleFilterChange('category', e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Type</label>
                                <select
                                    className="form-select"
                                    value={filters.type}
                                    onChange={e => handleFilterChange('type', e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    <option value="game">Game</option>
                                    <option value="dlc">DLC</option>
                                    <option value="subscription">Subscription</option>
                                    <option value="giftcard">Gift Card</option>
                                    <option value="currency">Currency</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Platform</label>
                                <select
                                    className="form-select"
                                    value={filters.platform}
                                    onChange={e => handleFilterChange('platform', e.target.value)}
                                >
                                    <option value="">All Platforms</option>
                                    <option value="PC">PC</option>
                                    <option value="PlayStation">PlayStation</option>
                                    <option value="Xbox">Xbox</option>
                                    <option value="Nintendo">Nintendo</option>
                                    <option value="Mobile">Mobile</option>
                                    <option value="Multi-Platform">Multi-Platform</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Status</label>
                                <select
                                    className="form-select"
                                    value={filters.isActive}
                                    onChange={e => handleFilterChange('isActive', e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Featured</label>
                                <select
                                    className="form-select"
                                    value={filters.isFeatured}
                                    onChange={e => handleFilterChange('isFeatured', e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="true">Featured</option>
                                    <option value="false">Not Featured</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Min Price</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={filters.minPrice}
                                    onChange={e => handleFilterChange('minPrice', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Max Price</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="1000"
                                    value={filters.maxPrice}
                                    onChange={e => handleFilterChange('maxPrice', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Min Stock</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={filters.minStock}
                                    onChange={e => handleFilterChange('minStock', e.target.value)}
                                />
                            </div>
                        </div>
                        <button onClick={clearFilters} className="btn-secondary" style={{ marginTop: '16px' }}>
                            Clear Filters
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="empty-state">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <p>No products found.</p>
                        <button onClick={handleAdd} className="btn-primary" style={{ marginTop: '16px' }}>
                            Add Your First Product
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="table-container" style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.length === products.length && products.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Views</th>
                                        <th>Sales</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product._id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product._id)}
                                                    onChange={() => toggleProductSelection(product._id)}
                                                />
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '50px', height: '50px', background: 'var(--color-bg-secondary)', borderRadius: '8px', overflow: 'hidden' }}>
                                                        {product.images?.[0] && (
                                                            <img
                                                                src={product.images[0]}
                                                                alt=""
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontWeight: 600 }}>{product.name}</span>
                                                            {product.isFeatured && (
                                                                <Star size={16} style={{ color: '#ffc800', fill: '#ffc800' }} />
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                            {product.platform} {product.region && `• ${product.region}`}
                                                        </div>
                                                        {product.tags && product.tags.length > 0 && (
                                                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                                {product.tags.slice(0, 3).map((tag, idx) => (
                                                                    <span key={idx} style={{
                                                                        fontSize: '10px',
                                                                        padding: '2px 6px',
                                                                        background: 'rgba(0, 217, 255, 0.1)',
                                                                        color: 'var(--color-cyan-primary)',
                                                                        borderRadius: '4px'
                                                                    }}>
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{product.category?.name || '-'}</td>
                                            <td>
                                                <div>
                                                    <span style={{ color: 'var(--color-cyan-primary)', fontWeight: 'bold' }}>
                                                        ${product.price}
                                                    </span>
                                                    {product.discountPrice && (
                                                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textDecoration: 'line-through', marginLeft: '8px' }}>
                                                            ${product.discountPrice}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ color: product.stock <= 10 ? '#ff6464' : 'inherit' }}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td>{product.viewCount || 0}</td>
                                            <td>{product.purchaseCount || 0}</td>
                                            <td>
                                                <span className={`status-badge ${product.isActive ? 'status-active' : 'status-inactive'}`}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button onClick={() => handleToggleFeatured(product._id)} className="icon-btn" title={product.isFeatured ? 'Unfeature' : 'Feature'}>
                                                        <Star size={18} style={{ color: product.isFeatured ? '#ffc800' : 'var(--color-text-muted)', fill: product.isFeatured ? '#ffc800' : 'none' }} />
                                                    </button>
                                                    <button onClick={() => handleEditTags(product)} className="icon-btn" title="Edit Tags">
                                                        <TagIcon size={18} />
                                                    </button>
                                                    <button onClick={() => handleToggle(product._id)} className="icon-btn" title={product.isActive ? 'Deactivate' : 'Activate'}>
                                                        {product.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                    <button onClick={() => handleEdit(product)} className="icon-btn" title="Edit">
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(product._id)} className="icon-btn danger" title="Delete">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-secondary"
                                >
                                    Previous
                                </button>
                                <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="btn-secondary"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Product Modal */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header">
                                <h2 className="modal-title">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="modal-close">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Product Name *</label>
                                    <input
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Enter product description"
                                        rows={4}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Price ($) *</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Discount Price ($)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            step="0.01"
                                            value={formData.discountPrice}
                                            onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select
                                            className="form-select"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Type</label>
                                        <select
                                            className="form-select"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="game">Game</option>
                                            <option value="dlc">DLC</option>
                                            <option value="subscription">Subscription</option>
                                            <option value="giftcard">Gift Card</option>
                                            <option value="currency">In-Game Currency</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Platform</label>
                                        <select
                                            className="form-select"
                                            value={formData.platform}
                                            onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                        >
                                            <option value="">Select Platform</option>
                                            <option value="PC">PC</option>
                                            <option value="PlayStation">PlayStation</option>
                                            <option value="Xbox">Xbox</option>
                                            <option value="Nintendo">Nintendo</option>
                                            <option value="Mobile">Mobile</option>
                                            <option value="Multi-Platform">Multi-Platform</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Region</label>
                                        <select
                                            className="form-select"
                                            value={formData.region}
                                            onChange={e => setFormData({ ...formData, region: e.target.value })}
                                        >
                                            <option value="">Global</option>
                                            <option value="NA">North America</option>
                                            <option value="EU">Europe</option>
                                            <option value="ASIA">Asia</option>
                                            <option value="MENA">MENA</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            placeholder="100"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Product Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="form-input"
                                        style={{ padding: '8px' }}
                                    />
                                    {editingProduct?.images?.[0] && !formData.image && (
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                            Current image will be kept if no new image is selected
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                        <Save size={18} />
                                        {editingProduct ? 'Save Changes' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Statistics Modal */}
                {isStatsModalOpen && productStats && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header">
                                <h2 className="modal-title">Product Statistics</h2>
                                <button onClick={() => setIsStatsModalOpen(false)} className="modal-close">
                                    <X size={24} />
                                </button>
                            </div>
                            <div style={{ padding: '20px' }}>
                                {productStats.overview && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Products</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{productStats.overview.totalProducts || 0}</div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Active Products</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{productStats.overview.activeProducts || 0}</div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Stock</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{productStats.overview.totalStock || 0}</div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Low Stock</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6464' }}>{productStats.overview.lowStock || 0}</div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Out of Stock</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6464' }}>{productStats.overview.outOfStock || 0}</div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Featured</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{productStats.overview.featured || 0}</div>
                                        </div>
                                    </div>
                                )}
                                {productStats.byCategory && productStats.byCategory.length > 0 && (
                                    <div>
                                        <h3 style={{ marginBottom: '16px' }}>By Category</h3>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Category</th>
                                                    <th>Products</th>
                                                    <th>Total Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {productStats.byCategory.map((stat, idx) => (
                                                    <tr key={idx}>
                                                        <td>{stat.categoryName}</td>
                                                        <td>{stat.count}</td>
                                                        <td>{stat.totalStock}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsStatsModalOpen(false)} className="btn-secondary">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Actions Modal */}
                {isBulkModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h2 className="modal-title">Bulk Actions</h2>
                                <button onClick={() => setIsBulkModalOpen(false)} className="modal-close">
                                    <X size={24} />
                                </button>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <p style={{ marginBottom: '20px' }}>
                                    {selectedProducts.length} product(s) selected
                                </p>
                                <div className="form-group">
                                    <label className="form-label">Update Status</label>
                                    <select
                                        className="form-select"
                                        value={bulkUpdates.isActive}
                                        onChange={e => setBulkUpdates({ ...bulkUpdates, isActive: e.target.value })}
                                    >
                                        <option value="">No Change</option>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Update Featured</label>
                                    <select
                                        className="form-select"
                                        value={bulkUpdates.isFeatured}
                                        onChange={e => setBulkUpdates({ ...bulkUpdates, isFeatured: e.target.value })}
                                    >
                                        <option value="">No Change</option>
                                        <option value="true">Featured</option>
                                        <option value="false">Not Featured</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsBulkModalOpen(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button onClick={handleBulkDelete} className="btn-secondary" style={{ background: '#ff6464', borderColor: '#ff6464' }}>
                                    Delete Selected
                                </button>
                                <button onClick={handleBulkUpdate} className="btn-primary">
                                    Update Selected
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tags Modal */}
                {isTagsModalOpen && editingTagsProduct && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h2 className="modal-title">Edit Tags - {editingTagsProduct.name}</h2>
                                <button onClick={() => setIsTagsModalOpen(false)} className="modal-close">
                                    <X size={24} />
                                </button>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={tagsData.join(', ')}
                                        onChange={e => setTagsData(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                                        placeholder="action, rpg, multiplayer"
                                    />
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        Separate tags with commas
                                    </p>
                                </div>
                                {tagsData.length > 0 && (
                                    <div style={{ marginTop: '16px' }}>
                                        <div style={{ fontSize: '14px', marginBottom: '8px' }}>Preview:</div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {tagsData.map((tag, idx) => (
                                                <span key={idx} style={{
                                                    padding: '4px 12px',
                                                    background: 'rgba(0, 217, 255, 0.1)',
                                                    color: 'var(--color-cyan-primary)',
                                                    borderRadius: '16px',
                                                    fontSize: '12px'
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsTagsModalOpen(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button onClick={handleSaveTags} className="btn-primary">
                                    Save Tags
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default Products;
