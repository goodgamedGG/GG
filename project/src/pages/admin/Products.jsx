import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Save, Eye, EyeOff } from 'lucide-react';
import adminAPI from '../../api/admin';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                adminAPI.getProducts(),
                adminAPI.getCategories()
            ]);
            setProducts(productsRes?.products || []);
            setCategories(categoriesRes?.categories || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
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
            image: null
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
            image: null
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await adminAPI.deleteProduct(id);
                setProducts(products.filter(p => p._id !== id));
            } catch (error) {
                alert('Failed to delete product: ' + error.message);
            }
        }
    };

    const handleToggle = async (id) => {
        try {
            const result = await adminAPI.toggleProduct(id);
            setProducts(products.map(p =>
                p._id === id ? { ...p, isActive: result.product.isActive } : p
            ));
        } catch (error) {
            alert('Failed to toggle product: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    // Use 'images' field name for product images instead of 'image'
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

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Products</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {products.length} products in store
                    </p>
                </div>
                <button onClick={handleAdd} className="btn-primary">
                    <Plus size={18} />
                    Add Product
                </button>
            </header>

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
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
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
                                                <div style={{ fontWeight: 600 }}>{product.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                    {product.platform} {product.region && `• ${product.region}`}
                                                </div>
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
                                    <td>{product.stock}</td>
                                    <td>
                                        <span className={`status-badge ${product.isActive ? 'status-active' : 'status-inactive'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
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
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
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
        </div>
    );
};

export default Products;
